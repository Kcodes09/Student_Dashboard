import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"


export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
        Profile
      </h1>

      <div className="rounded-xl bg-[var(--bg-surface)] p-6 shadow-sm">
        <p className="text-sm text-[var(--text-muted)]">Name</p>
        <p className="mb-4 font-medium text-[var(--text-primary)]">
          {session?.user?.name}
        </p>

        <p className="text-sm text-[var(--text-muted)]">Email</p>
        <p className="font-medium text-[var(--text-primary)]">
          {session?.user?.email}
        </p>
      </div>
    </div>
  )
}
