"use client"

import { signInWithMagicLink } from "@/lib/auth/actions"
import { useState } from "react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    const result = await signInWithMagicLink(formData)

    setIsLoading(false)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({
        type: "success",
        text: "確認メールを送信しました。メールのリンクをクリックしてログインしてください。",
      })
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">ログイン</h1>
        <p className="text-gray-600">
          メールアドレスを入力してログインしてください
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@email.com"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "送信中..." : "ログインリンクを送信"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
