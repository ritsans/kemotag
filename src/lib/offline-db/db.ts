// IndexedDB接続管理とDB初期化

import type { OfflineDBResult } from "./types"
import { CONSTANTS } from "./types"
import { wrapDBOperation } from "./utils"

// シングルトンDB接続キャッシュ
let dbInstance: IDBDatabase | null = null

/**
 * IndexedDBが利用可能かチェック
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined"
}

/**
 * IndexedDBを初期化する（内部用）
 * onupgradeneeded でストアとインデックスを作成
 */
async function initDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    throw new Error("IndexedDB is not available in this environment")
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(CONSTANTS.DB_NAME, CONSTANTS.DB_VERSION)

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // view_history ストア作成
      if (!db.objectStoreNames.contains(CONSTANTS.STORES.VIEW_HISTORY)) {
        const viewHistoryStore = db.createObjectStore(
          CONSTANTS.STORES.VIEW_HISTORY,
          {
            keyPath: "profile_id",
          },
        )
        viewHistoryStore.createIndex("by_last_viewed", "last_viewed_at", {
          unique: false,
        })
      }

      // saved_local ストア作成
      if (!db.objectStoreNames.contains(CONSTANTS.STORES.SAVED_LOCAL)) {
        const savedLocalStore = db.createObjectStore(
          CONSTANTS.STORES.SAVED_LOCAL,
          {
            keyPath: "profile_id",
          },
        )
        savedLocalStore.createIndex("by_deleted_at", "deleted_at", {
          unique: false,
        })
      }
    }
  })
}

/**
 * DB接続を取得（公開API）
 * シングルトンパターンで接続を再利用
 */
export async function getDB(): Promise<OfflineDBResult<IDBDatabase>> {
  return wrapDBOperation(async () => {
    if (!isIndexedDBAvailable()) {
      throw new Error("IndexedDB is not available")
    }

    if (!dbInstance) {
      dbInstance = await initDB()
    }

    return dbInstance
  })
}
