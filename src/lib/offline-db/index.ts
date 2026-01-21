// IndexedDBオフラインストレージの公開API

// DB管理
export { isIndexedDBAvailable } from "./db"
// ローカルブックマーク
export {
  getBookmarks,
  hardDeleteBookmark,
  isBookmarked,
  saveBookmark,
  unsaveBookmark,
} from "./saved-local"
// 型定義
export type {
  OfflineDBError,
  OfflineDBResult,
  SavedLocalQueryOptions,
  SavedLocalRecord,
  ViewHistoryQueryOptions,
  ViewHistoryRecord,
} from "./types"
export { CONSTANTS } from "./types"
// 閲覧履歴
export {
  addViewHistory,
  clearViewHistory,
  getViewHistory,
  getViewHistoryCount,
} from "./view-history"
