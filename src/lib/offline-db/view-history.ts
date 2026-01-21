// 閲覧履歴ストア (view_history) のCRUD操作

import { getDB } from "./db"
import type {
  OfflineDBResult,
  ViewHistoryQueryOptions,
  ViewHistoryRecord,
} from "./types"
import { CONSTANTS } from "./types"
import { wrapDBOperation } from "./utils"

/**
 * 閲覧履歴を追加（Upsert動作）
 * - 同じprofile_idが存在する場合はlast_viewed_atを更新
 * - 300件を超える場合は最古のレコードを削除
 */
export async function addViewHistory(
  data: Omit<ViewHistoryRecord, "last_viewed_at">,
): Promise<OfflineDBResult<void>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.VIEW_HISTORY],
      "readwrite",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.VIEW_HISTORY)

    // 件数確認: 300件以上なら最古を削除
    const countRequest = store.count()
    const count = await new Promise<number>((resolve, reject) => {
      countRequest.onsuccess = () => resolve(countRequest.result)
      countRequest.onerror = () => reject(countRequest.error)
    })

    if (count >= CONSTANTS.VIEW_HISTORY_MAX) {
      // インデックスで最古のレコードを取得して削除
      const index = store.index("by_last_viewed")
      const cursorRequest = index.openCursor(null, "next")

      await new Promise<void>((resolve, reject) => {
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (cursor) {
            cursor.delete()
            resolve()
          } else {
            resolve()
          }
        }
        cursorRequest.onerror = () => reject(cursorRequest.error)
      })
    }

    // Upsert: putで上書き保存
    const record: ViewHistoryRecord = {
      ...data,
      last_viewed_at: Date.now(),
    }

    const putRequest = store.put(record)
    await new Promise<void>((resolve, reject) => {
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    })

    return await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  })
}

/**
 * 閲覧履歴を取得（新しい順）
 */
export async function getViewHistory(
  options: ViewHistoryQueryOptions = {},
): Promise<OfflineDBResult<ViewHistoryRecord[]>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.VIEW_HISTORY],
      "readonly",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.VIEW_HISTORY)
    const index = store.index("by_last_viewed")

    const { limit, offset = 0 } = options
    const records: ViewHistoryRecord[] = []

    // インデックスを降順（新しい順）で走査
    const cursorRequest = index.openCursor(null, "prev")

    return new Promise<ViewHistoryRecord[]>((resolve, reject) => {
      let skipped = 0

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result

        if (!cursor) {
          resolve(records)
          return
        }

        // offset分スキップ
        if (skipped < offset) {
          skipped++
          cursor.continue()
          return
        }

        // limit到達チェック
        if (limit !== undefined && records.length >= limit) {
          resolve(records)
          return
        }

        records.push(cursor.value as ViewHistoryRecord)
        cursor.continue()
      }

      cursorRequest.onerror = () => reject(cursorRequest.error)
      transaction.onerror = () => reject(transaction.error)
    })
  })
}

/**
 * 閲覧履歴の件数を取得
 */
export async function getViewHistoryCount(): Promise<OfflineDBResult<number>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.VIEW_HISTORY],
      "readonly",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.VIEW_HISTORY)

    const countRequest = store.count()
    return new Promise<number>((resolve, reject) => {
      countRequest.onsuccess = () => resolve(countRequest.result)
      countRequest.onerror = () => reject(countRequest.error)
    })
  })
}

/**
 * 閲覧履歴を全削除
 */
export async function clearViewHistory(): Promise<OfflineDBResult<void>> {
  return wrapDBOperation(async () => {
    const dbResult = await getDB()
    if (!dbResult.success || !dbResult.data) {
      throw new Error(dbResult.error?.message || "Failed to get DB")
    }

    const db = dbResult.data
    const transaction = db.transaction(
      [CONSTANTS.STORES.VIEW_HISTORY],
      "readwrite",
    )
    const store = transaction.objectStore(CONSTANTS.STORES.VIEW_HISTORY)

    const clearRequest = store.clear()
    await new Promise<void>((resolve, reject) => {
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  })
}
