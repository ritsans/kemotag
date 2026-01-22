"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * マジックリンク送信（メールアドレスでログイン）
 */
export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "メールアドレスを入力してください" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * ログアウト
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
