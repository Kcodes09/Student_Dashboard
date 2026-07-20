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

  if (status === "loading") return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-3xl p-8 flex flex-col items-center gap-6 border animate-pulse"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="h-16 w-16 rounded-2xl" style={{ backgroundColor: "var(--bg-surface-hover)" }} />
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="h-5 w-40 rounded-lg" style={{ backgroundColor: "var(--bg-surface-hover)" }} />
          <div className="h-3 w-28 rounded-lg" style={{ backgroundColor: "var(--bg-surface-hover)" }} />
        </div>
        <div className="h-px w-full" style={{ backgroundColor: "var(--border-subtle)" }} />
        <div className="h-11 w-full rounded-xl" style={{ backgroundColor: "var(--bg-surface-hover)" }} />
      </div>
    </div>
  )

  return (
    <div
      className="flex h-screen items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      {/* Decorative gradient blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
      />

      {/* Login card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl p-8 flex flex-col items-center gap-6 border"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-4xl shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            🎓
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Campus Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Your smart academic companion
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ backgroundColor: "var(--border-subtle)" }}
        />

        {/* Sign in text */}
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          id="google-signin-btn"
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold border transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface-hover)"
            ;(e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"
            ;(e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"
          }}
        >
          {/* Google Logo SVG */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          By signing in, you agree to use this dashboard for academic purposes only.
        </p>
      </div>
    </div>
  )
}
