"use client"

import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Tables } from "@/lib/supabase/database.types"
import { useEffect, useState } from "react"

/**
 * 認証状態を監視するフック
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 初期ユーザー取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}

/**
 * ユーザーのプロフィール情報を取得するフック
 */
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    async function fetchProfile() {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("owner_user_id", userId)
          .single()

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, isLoading, error }
}
