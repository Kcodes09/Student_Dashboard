import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import Navbar from "@/app/components/Navbar"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) return null

  return (
    <>
      <Navbar user={{ email: session.user.email! }} />

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <h1 className="mb-5 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          Profile
        </h1>

        <div
          className="rounded-xl p-4 sm:p-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* NAME */}
          <div className="mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              Name
            </p>
            <p className="font-medium text-[var(--text-primary)] break-words">
              {session.user.name ?? "—"}
            </p>
          </div>

          {/* EMAIL */}
          <div>
            <p className="text-sm text-[var(--text-muted)]">
              Email
            </p>
            <p className="font-medium text-[var(--text-primary)] break-all">
              {session.user.email}
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
