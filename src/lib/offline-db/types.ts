// IndexedDB オフラインストレージの型定義

// レコード型
export interface ViewHistoryRecord {
  profile_id: string
  last_viewed_at: number
  display_name: string
  x_username: string
}

export interface SavedLocalRecord {
  profile_id: string
  deleted_at: number | null
  updated_at: number
}

// 操作結果型（Result pattern）
export interface OfflineDBResult<T> {
  success: boolean
  data?: T
  error?: OfflineDBError
}

export interface OfflineDBError {
  code: "DB_NOT_AVAILABLE" | "QUOTA_EXCEEDED" | "OPERATION_FAILED" | "NOT_FOUND"
  message: string
  originalError?: Error
}

// クエリオプション型
export interface ViewHistoryQueryOptions {
  limit?: number
  offset?: number
}

export interface SavedLocalQueryOptions {
  includeDeleted?: boolean
}

// 定数
export const CONSTANTS = {
  DB_NAME: "kemotag-offline",
  DB_VERSION: 1,
  VIEW_HISTORY_MAX: 300,
  STORES: {
    VIEW_HISTORY: "view_history",
    SAVED_LOCAL: "saved_local",
  },
} as const
