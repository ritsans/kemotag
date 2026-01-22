import { createClient } from "@/lib/supabase/server"
import { generateProfileId } from "@/lib/auth/profile-id"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    // コードをセッションに交換
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Auth callback error:", exchangeError)
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", requestUrl.origin),
      )
    }

    // 認証成功後、ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // プロフィールが存在するか確認
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("profile_id, x_username")
        .eq("owner_user_id", user.id)
        .single()

      if (!existingProfile) {
        // 初回ログイン: プロフィールを自動作成
        const profileId = generateProfileId()
        const displayName = user.email?.split("@")[0] || "ユーザー"

        const { error: insertError } = await supabase.from("profiles").insert({
          profile_id: profileId,
          owner_user_id: user.id,
          display_name: displayName,
          x_username: "", // 後で編集
        })

        if (insertError) {
          console.error("Profile creation error:", insertError)
          return NextResponse.redirect(
            new URL("/login?error=profile_failed", requestUrl.origin),
          )
        }

        // 初回作成時は編集ページへリダイレクト
        return NextResponse.redirect(new URL("/edit", requestUrl.origin))
      }

      // プロフィールが存在する場合
      // x_usernameが空の場合は未完成とみなし、編集ページへ
      if (!existingProfile.x_username) {
        return NextResponse.redirect(new URL("/edit", requestUrl.origin))
      }

      // 完成している場合はトップページへ
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    }
  }

  // コードがない、またはユーザー情報が取得できない場合
  return NextResponse.redirect(
    new URL("/login?error=invalid_request", requestUrl.origin),
  )
}
