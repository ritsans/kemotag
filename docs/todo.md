# KEMOTAG MVP 開発TODO

## 開発方針

- **Supabase**: 全てクラウドベース (Supabase Cloud) で管理
- **認証テスト**: 実際のメールアドレスを使用

---

## Phase 1: 基盤構築

### 1.1 プロジェクト初期設定
- [x] Next.js 16 App Router の基本構造確認
- [x] Tailwind CSS v4 の設定確認・調整
- [x] パスエイリアス（`@/*`）の動作確認
- [x] Biome によるリント・フォーマット設定の確認

### 1.2 Supabase セットアップ
- [x] Supabase プロジェクト作成（CLI経由）
- [ ] 認証設定（マジックリンク / Email Auth）
- [x] データベーススキーマ作成
  - [x] `profiles` テーブル（profile_id, owner_user_id, display_name, avatar_url, x_username, created_at, updated_at）
  - [x] `bookmarks` テーブル（user_id, profile_id, deleted_at, created_at, updated_at）
  - [x] RLS（Row Level Security）ポリシー設定

### 1.3 IndexedDB セットアップ
- [x] IndexedDB ラッパー/ユーティリティ作成
- [x] `view_history` ストア定義（profile_id, last_viewed_at, display_name, x_username）
- [x] `saved_local` ストア定義（profile_id, deleted_at, updated_at）

---

## Phase 2: 認証・プロフィール作成機能

### 2.1 認証フロー（マジックリンク）

#### 認証設定
- [ ] Supabase Dashboard で Email Auth（マジックリンク）有効化
- [ ] リダイレクトURL設定（`http://localhost:3000/auth/callback` など）
- [ ] 環境変数確認（`.env.local`）
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] テスト用メールアドレス準備（Gmail+エイリアス推奨）

#### 認証機能実装
- [ ] ログインページ作成（`/login` または `/auth/login`）
- [ ] マジックリンク送信フォーム実装（メールアドレス入力）
- [ ] マジックリンク認証コールバック処理（`/auth/callback`）
- [ ] 初回ログイン時の `profiles` レコード自動作成
  - [ ] `profile_id` 生成（base62 ランダム15文字、暗号学的に安全）
  - [ ] `owner_user_id` 設定
- [ ] 認証状態管理（ログイン/ログアウト）
- [ ] 認証ガード実装（未ログイン時のリダイレクト）

### 2.2 プロフィール編集機能 
- [ ] プロフィール編集ページ作成（`/edit` または `/settings/profile`）
- [ ] フォーム実装
  - [ ] `display_name` 入力（必須）
  - [ ] `avatar` アップロード（必須、プレースホルダー許容）
  - [ ] `x_username` 入力（URL/@username 両対応、正規化処理）
- [ ] 未完成プロフィール時の編集画面誘導ロジック
- [ ] Supabase への保存処理

---

## Phase 3: 公開プロフィール表示

### 3.1 公開プロフィールページ
- [ ] `/p/[profile_id]` ルート作成
- [ ] プロフィールデータ取得（Supabase）
- [ ] ファーストビュー表示
  - [ ] `display_name` 表示
  - [ ] `avatar` 表示
  - [ ] X リンクボタン（大きく、タップしやすく）
- [ ] モバイルファースト UI/UX
- [ ] 存在しない `profile_id` のエラーハンドリング（404）

### 3.2 閲覧履歴の自動保存
- [ ] プロフィール閲覧時に IndexedDB へ自動記録
- [ ] upsert 方式（profile_id で重複時は `last_viewed_at` 更新）
- [ ] 300件上限チェック＆古いデータ削除

---

## Phase 4: お気に入り機能

### 4.1 お気に入りUI
- [ ] 公開プロフィールページにお気に入りボタン追加
- [ ] お気に入り状態の表示切り替え
- [ ] 保存/解除操作

### 4.2 お気に入りデータ管理
- [ ] IndexedDB への保存処理（論理削除対応）
- [ ] ログイン時のクラウド同期
  - [ ] 楽観的更新でUI即反映
  - [ ] Supabase へ保存/論理削除
- [ ] 非ログイン時のローカル保存 → ログイン後一括同期

---

## Phase 5: 履歴・お気に入り一覧

### 5.1 閲覧履歴一覧ページ
- [ ] 履歴一覧ページ作成
- [ ] IndexedDB からデータ取得・表示
- [ ] 一覧から X プロフィールへ直接遷移可能

### 5.2 お気に入り一覧ページ
- [ ] お気に入り一覧ページ作成
- [ ] ローカル/クラウドデータのマージ表示
- [ ] 削除（論理削除）操作

---

## Phase 6: QR/URL共有

- [ ] プロフィール共有用QRコード生成
- [ ] URL コピー機能
- [ ] SNS共有ボタン（オプション）

---

## Phase 7: 認証方式の拡張（本番リリース前）

### 7.1 Google OAuth 追加
- [ ] Supabase Auth 設定（Google OAuth）
  - [ ] Supabase ダッシュボードで Google OAuth プロバイダー有効化
  - [ ] Google Cloud Console で OAuth 2.0 クライアント ID 作成
  - [ ] 本番ドメインのリダイレクト URI 設定
- [ ] ログインページに Google ログインボタン追加
- [ ] 既存のマジックリンク認証との統合
- [ ] 認証プロバイダー選択 UI の実装

---

## 将来の拡張（MVP後）

（認証関連の追加予定はなし）

---

## 優先度メモ

**最優先（Phase 1-3）**
1. 基盤構築 → 認証 → 公開プロフィール表示
2. これにより「作る側がプロフィール作成 → URL共有 → 見る側がアクセス → X遷移」の基本フローが完成

**次優先（Phase 4-5）**
3. お気に入り・履歴機能で閲覧者体験を向上

**最後（Phase 6）**
4. 共有機能で利便性向上

---

## 技術的注意事項

- `profile_id` は `crypto.getRandomValues()` を使用（`Math.random()` 禁止）
- 削除は全て論理削除（`deleted_at`）
- モバイルファースト設計を徹底
- Biome でリント・フォーマット統一