-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- profilesテーブルのRLSポリシー
-- ============================================

-- 1. 誰でもプロフィールを閲覧可能（認証不要）
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- 2. ログインユーザーが自分のプロフィールを作成可能
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- 3. ログインユーザーが自分のプロフィールを更新可能
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 4. ログインユーザーが自分のプロフィールを削除可能
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- ============================================
-- bookmarksテーブルのRLSポリシー
-- ============================================

-- 1. ログインユーザーが自分の有効なブックマークのみ閲覧可能
-- 論理削除されたブックマーク（deleted_at IS NOT NULL）は非表示
CREATE POLICY "bookmarks_select_own"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 2. ログインユーザーが自分のブックマークを作成可能
CREATE POLICY "bookmarks_insert_own"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. ログインユーザーが自分のブックマークを更新可能（論理削除含む）
CREATE POLICY "bookmarks_update_own"
  ON public.bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 注意: DELETEポリシーは意図的に設定しない
-- ブックマークの削除は論理削除（deleted_atの更新）で行い、物理削除は禁止
-- これによりデータの整合性を保ち、再ブックマーク時の履歴追跡を可能にする
