// base62文字セット (0-9, a-z, A-Z)
const BASE62_CHARS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const PROFILE_ID_LENGTH = 15

/**
 * 暗号学的に安全な15文字のbase62ランダムIDを生成
 * crypto.getRandomValues()を使用（Math.randomは使用禁止）
 */
export function generateProfileId(): string {
  const randomBytes = new Uint8Array(PROFILE_ID_LENGTH)
  crypto.getRandomValues(randomBytes)

  let result = ""
  for (let i = 0; i < PROFILE_ID_LENGTH; i++) {
    // 各バイトをbase62文字にマッピング
    result += BASE62_CHARS[randomBytes[i] % 62]
  }

  return result
}

/**
 * profile_idのバリデーション
 * - 15文字であること
 * - base62文字のみで構成されていること
 */
export function isValidProfileId(profileId: string): boolean {
  if (profileId.length !== PROFILE_ID_LENGTH) {
    return false
  }

  const base62Regex = /^[0-9a-zA-Z]+$/
  return base62Regex.test(profileId)
}
