-- プロフィールテーブル作成
CREATE TABLE IF NOT EXISTS public.profiles (
  profile_id VARCHAR(15) PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  x_username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- owner_user_idにユニーク制約を追加（1ユーザーにつき1プロフィール）
CREATE UNIQUE INDEX IF NOT EXISTS profiles_owner_user_id_key ON public.profiles(owner_user_id);

-- updated_at自動更新のための関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- updated_at自動更新トリガー
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS profiles_x_username_idx ON public.profiles(x_username);

-- コメント追加
COMMENT ON TABLE public.profiles IS 'ユーザープロフィール情報。公開デジタル名刺として機能。';
COMMENT ON COLUMN public.profiles.profile_id IS 'プロフィールの一意識別子（base62形式、15文字）';
COMMENT ON COLUMN public.profiles.owner_user_id IS 'プロフィール所有者のユーザーID（auth.users参照）';
COMMENT ON COLUMN public.profiles.display_name IS '表示名（ハンドルネーム）';
COMMENT ON COLUMN public.profiles.avatar_url IS 'アバター画像URL（Supabase Storageまたは外部URL）';
COMMENT ON COLUMN public.profiles.x_username IS 'X（旧Twitter）のユーザー名（@なし）';
