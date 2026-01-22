"use client"

import { signOut } from "@/lib/auth/actions"
import { useState } from "react"

interface LogoutButtonProps {
  className?: string
  variant?: "primary" | "secondary"
}

export function LogoutButton({
  className = "",
  variant = "secondary",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    await signOut()
    // signOut内でredirect()が呼ばれるため、ここには到達しない
  }

  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variantStyles =
    variant === "primary"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300"

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {isLoading ? "ログアウト中..." : "ログアウト"}
    </button>
  )
}
