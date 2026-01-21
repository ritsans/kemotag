// ローカルブックマークストア (saved_local) のCRUD操作

import { getDB } from "./db"
import type {
  OfflineDBResult,
  SavedLocalQueryOptions,
  SavedLocalRecord,
} from "./types"
import { CONSTANTS } from "./types"
import { wrapDBOperation } from "./utils"

/**
 * ブックマークを保存（Upsert動作）
 * - deleted_atをnullに設定（復元にも使える）
 */
export async function saveBookmark(
  profile_id: string,
): Promise<OfflineDBResult<void>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.SAVED_LOCAL],
      "readwrite",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.SAVED_LOCAL)

    const record: SavedLocalRecord = {
      profile_id,
      deleted_at: null,
      updated_at: Date.now(),
    }

    const putRequest = store.put(record)
    await new Promise<void>((resolve, reject) => {
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    })

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  })
}

/**
 * ブックマークを削除（ソフトデリート）
 * - deleted_atにタイムスタンプを設定
 */
export async function unsaveBookmark(
  profile_id: string,
): Promise<OfflineDBResult<void>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.SAVED_LOCAL],
      "readwrite",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.SAVED_LOCAL)

    // 既存レコード取得
    const getRequest = store.get(profile_id)
    const existingRecord = await new Promise<SavedLocalRecord | undefined>(
      (resolve, reject) => {
        getRequest.onsuccess = () => resolve(getRequest.result)
        getRequest.onerror = () => reject(getRequest.error)
      },
    )

    if (existingRecord) {
      // ソフトデリート
      existingRecord.deleted_at = Date.now()
      existingRecord.updated_at = Date.now()

      const putRequest = store.put(existingRecord)
      await new Promise<void>((resolve, reject) => {
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      })
    }

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  })
}

/**
 * ブックマーク一覧を取得
 * - デフォルトはdeleted_at = nullのみ
 */
export async function getBookmarks(
  options: SavedLocalQueryOptions = {},
): Promise<OfflineDBResult<SavedLocalRecord[]>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.SAVED_LOCAL],
      "readonly",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.SAVED_LOCAL)

    const { includeDeleted = false } = options
    const records: SavedLocalRecord[] = []

    const cursorRequest = store.openCursor()

    return new Promise<SavedLocalRecord[]>((resolve, reject) => {
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result

        if (!cursor) {
          resolve(records)
          return
        }

        const record = cursor.value as SavedLocalRecord

        // includeDeletedがfalseの場合はdeleted_at = nullのみ含める
        if (includeDeleted || record.deleted_at === null) {
          records.push(record)
        }

        cursor.continue()
      }

      cursorRequest.onerror = () => reject(cursorRequest.error)
      transaction.onerror = () => reject(transaction.error)
    })
  })
}

/**
 * 指定したprofile_idがブックマークされているか確認
 * - deleted_at = nullかつレコード存在の場合にtrueを返す
 */
export async function isBookmarked(
  profile_id: string,
): Promise<OfflineDBResult<boolean>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.SAVED_LOCAL],
      "readonly",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.SAVED_LOCAL)

    const getRequest = store.get(profile_id)
    return new Promise<boolean>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const record = getRequest.result as SavedLocalRecord | undefined
        resolve(record !== undefined && record.deleted_at === null)
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  })
}

/**
 * ブックマークを物理削除（ハードデリート）
 * - 通常は使用しない（ソフトデリートを推奨）
 */
export async function hardDeleteBookmark(
  profile_id: string,
): Promise<OfflineDBResult<void>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.SAVED_LOCAL],
      "readwrite",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.SAVED_LOCAL)

    const deleteRequest = store.delete(profile_id)
    await new Promise<void>((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    })

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  })
}
