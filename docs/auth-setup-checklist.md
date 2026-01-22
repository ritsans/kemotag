# Supabase認証機能 セットアップチェックリスト

認証機能の実装が完了しました。以下の手順で設定と動作確認を行ってください。

## 1. 環境変数の確認

`.env.local` ファイルに以下の環境変数が設定されているか確認してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### チェック項目
- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] `NEXT_PUBLIC_SITE_URL` が設定されている（開発環境: `http://localhost:3000`）

---

## 2. Supabase Dashboard 設定

### 2.1 Email認証プロバイダーの有効化

**場所:** Supabase Dashboard > Authentication > Providers > Email

- [ ] **Enable Email provider**: `ON` に設定
- [ ] **Confirm email**:
  - 本番環境: `ON` を推奨（メール確認必須）
  - 開発環境: `OFF` でも可（即座にログイン可能）

### 2.2 認証URLの設定

**場所:** Supabase Dashboard > Authentication > URL Configuration

#### Site URL
- [ ] Site URL を設定: `http://localhost:3000` （開発環境）
- [ ] 本番環境の場合: 本番ドメインを設定（例: `https://kemotag.example.com`）

#### Redirect URLs
- [ ] Redirect URLs に以下を追加:
  - 開発環境: `http://localhost:3000/auth/callback`
  - 本番環境: `https://your-domain.com/auth/callback`

---

## 3. テスト用メールアドレスの準備

マジックリンク認証のテストには実際のメールアドレスが必要です。

### 推奨: Gmail エイリアス機能を使用

Gmail では `+` 記号を使ったエイリアスが利用できます。

**例:**
- `yourname+test1@gmail.com`
- `yourname+test2@gmail.com`
- `yourname+kemotag@gmail.com`

すべて `yourname@gmail.com` に配信されますが、Supabase では別のユーザーとして扱われます。

- [ ] テスト用メールアドレスを準備

---

## 4. 動作確認手順

### 4.1 開発サーバーの起動

```bash
bun dev
```

- [ ] 開発サーバーが正常に起動

### 4.2 ログインページへのアクセス

ブラウザで以下にアクセス:
```
http://localhost:3000/login
```

- [ ] ログインページが表示される
- [ ] メールアドレス入力フォームが表示される

### 4.3 マジックリンクの送信

1. メールアドレスを入力
2. 「ログインリンクを送信」ボタンをクリック
3. 成功メッセージが表示される

- [ ] メールアドレス入力後、送信ボタンをクリック
- [ ] 「確認メールを送信しました」というメッセージが表示される

### 4.4 メール受信とログイン

1. 登録したメールアドレスの受信トレイを確認
2. Supabaseからのメールを開く
3. 「Log In」または「Confirm your mail」リンクをクリック

- [ ] Supabaseからメールを受信
- [ ] メール内のリンクをクリック

### 4.5 初回ログイン確認

初回ログイン時の動作:

1. 認証コールバックページにリダイレクト (`/auth/callback`)
2. プロフィールレコードが自動作成される
   - `profile_id`: base62形式の15文字ランダムID
   - `display_name`: メールアドレスのローカル部分（@より前）
   - `x_username`: 空文字（後で編集）
3. `/edit` ページにリダイレクト（未完成プロフィールのため）

- [ ] `/auth/callback` にリダイレクトされる
- [ ] その後 `/edit` にリダイレクトされる（初回のみ）

#### データベース確認（オプション）

Supabase Dashboard > Table Editor > profiles で以下を確認:

- [ ] 新しいプロフィールレコードが作成されている
- [ ] `profile_id` が15文字のランダムIDになっている
- [ ] `owner_user_id` が認証ユーザーのIDと一致している
- [ ] `display_name` がメールのローカル部分になっている
- [ ] `x_username` が空文字になっている

### 4.6 2回目以降のログイン確認

同じメールアドレスでログアウト→再ログイン:

1. ログアウトボタンをクリック（実装後）
2. 再度 `/login` からログイン
3. プロフィールが既に存在する場合の動作確認

**期待される動作:**
- `x_username` が空の場合: `/edit` にリダイレクト
- `x_username` が設定済みの場合: `/` にリダイレクト

- [ ] 2回目のログインで新しいプロフィールが作成されない
- [ ] 適切なページにリダイレクトされる

### 4.7 認証ガードの確認

未認証状態で保護ルートにアクセス:

```
http://localhost:3000/edit
```

**期待される動作:**
- `/login?redirect=/edit` にリダイレクトされる

- [ ] 未認証で `/edit` にアクセス
- [ ] `/login` にリダイレクトされる
- [ ] URLパラメータに `redirect=/edit` が含まれている

---

## 5. トラブルシューティング

### メールが届かない場合

- [ ] Supabase Dashboard > Authentication > Email Templates で設定確認
- [ ] 迷惑メールフォルダを確認
- [ ] `Confirm email` を `OFF` にして再試行（開発環境のみ）

### 認証コールバックエラー

ブラウザのコンソールとサーバーログを確認:

- [ ] Redirect URLs が正しく設定されているか確認
- [ ] 環境変数が正しく読み込まれているか確認
- [ ] Supabase プロジェクトのURLとキーが正しいか確認

### プロフィールが作成されない

- [ ] データベースのRLSポリシーを確認
- [ ] Supabase Dashboard > Table Editor > profiles でレコードを手動確認
- [ ] サーバーログでエラーメッセージを確認

---

## 6. 実装済みファイル一覧

以下のファイルが実装されています:

### 認証機能の基礎
- `src/lib/auth/profile-id.ts` - base62 ID生成
- `src/middleware.ts` - セッションリフレッシュと認証ガード
- `src/lib/auth/actions.ts` - Server Actions

### UI コンポーネント
- `src/components/auth/login-form.tsx` - ログインフォーム
- `src/app/(auth)/login/page.tsx` - ログインページ
- `src/components/auth/logout-button.tsx` - ログアウトボタン

### 認証フロー
- `src/app/(auth)/auth/callback/route.ts` - 認証コールバック
- `src/lib/auth/hooks.ts` - 認証フック（useUser, useProfile）
- `src/app/(protected)/layout.tsx` - 認証ガード

---

## 7. 次のステップ

認証機能の動作確認が完了したら、以下に進んでください:

- [ ] プロフィール編集機能の実装（Phase 2.2）
- [ ] 公開プロフィールページの実装（Phase 3.1）

---

## 補足: 本番環境への移行時の注意点

本番環境にデプロイする際は以下を再設定してください:

- [ ] `.env.production` または環境変数に本番URLを設定
- [ ] Supabase Dashboard の Site URL を本番ドメインに変更
- [ ] Redirect URLs に本番ドメインのコールバックURLを追加
- [ ] Email の Confirm email を `ON` に設定（必須）
- [ ] 本番用メール送信設定（SMTP設定など）を確認
