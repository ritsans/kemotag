// IndexedDB操作の共通エラーハンドリングユーティリティ

import type { OfflineDBError, OfflineDBResult } from "./types"

/**
 * IndexedDB操作をResult型でラップする
 * すべての非同期操作でこの関数を使用してエラーハンドリングを統一する
 */
export async function wrapDBOperation<T>(
  operation: () => Promise<T>,
): Promise<OfflineDBResult<T>> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: mapErrorToOfflineDBError(error),
    }
  }
}

/**
 * DOMExceptionやその他のエラーをOfflineDBErrorに変換する
 */
export function mapErrorToOfflineDBError(error: unknown): OfflineDBError {
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") {
      return {
        code: "QUOTA_EXCEEDED",
        message: "ストレージ容量が不足しています",
        originalError: error,
      }
    }
    if (error.name === "NotFoundError") {
      return {
        code: "NOT_FOUND",
        message: "レコードが見つかりません",
        originalError: error,
      }
    }
  }

  return {
    code: "OPERATION_FAILED",
    message: error instanceof Error ? error.message : "不明なエラー",
    originalError: error instanceof Error ? error : undefined,
  }
}
