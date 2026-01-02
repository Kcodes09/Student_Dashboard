"use client"

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  if (status === "loading") return null

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-700 dark:text-gray-300">
          Please sign in with Google to continue
        </p>

        <button
          onClick={() => signIn("google")}
          className="
            rounded
            bg-black
            px-6
            py-3
            text-white
            transition
            dark:bg-white
            dark:text-black
          "
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
