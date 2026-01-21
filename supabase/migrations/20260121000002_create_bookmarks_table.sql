-- ブックマークテーブル作成
-- 論理削除を採用し、削除後の再ブックマークに対応するため、
-- サロゲートキー（id）をPRIMARY KEYとし、有効なブックマークに対して部分UNIQUE制約を設定
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id VARCHAR(15) NOT NULL REFERENCES public.profiles(profile_id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 有効なブックマーク（deleted_at IS NULL）に対する部分UNIQUE制約
-- これにより、同一ユーザーが同一プロフィールに対して有効なブックマークを1つだけ持てる
-- 論理削除後は同じペアで新規ブックマーク作成が可能
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_profile_active_unique_idx
  ON public.bookmarks(user_id, profile_id)
  WHERE deleted_at IS NULL;

-- updated_at自動更新トリガー
CREATE TRIGGER bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- インデックス作成（削除されていないブックマークの検索用）
CREATE INDEX IF NOT EXISTS bookmarks_user_id_not_deleted_idx
  ON public.bookmarks(user_id)
  WHERE deleted_at IS NULL;

-- プロフィールID検索用インデックス
CREATE INDEX IF NOT EXISTS bookmarks_profile_id_idx ON public.bookmarks(profile_id);

-- コメント追加
COMMENT ON TABLE public.bookmarks IS 'ユーザーのプロフィールブックマーク。論理削除（deleted_at）を使用。物理削除は禁止。';
COMMENT ON COLUMN public.bookmarks.id IS 'サロゲートキー（再ブックマーク対応のため複合キーではなくUUIDを使用）';
COMMENT ON COLUMN public.bookmarks.user_id IS 'ブックマークを保存したユーザーID';
COMMENT ON COLUMN public.bookmarks.profile_id IS 'ブックマークされたプロフィールID';
COMMENT ON COLUMN public.bookmarks.deleted_at IS '論理削除のタイムスタンプ（NULLの場合は有効）';
