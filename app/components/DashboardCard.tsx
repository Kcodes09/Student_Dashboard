import Link from "next/link"

interface DashboardCardProps {
  title: string
  description: string
  href: string
  comingSoon?: boolean
}

export default function DashboardCard({
  title,
  description,
  href,
  comingSoon,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`
        group relative
        rounded-xl
        bg-[var(--bg-surface)]
        p-6
        shadow-sm
        transition
        ${comingSoon ? "opacity-70 pointer-events-none" : "hover:bg-[var(--bg-surface-hover)] hover:shadow-md"}
      `}
    >
      {comingSoon && (
        <span className="absolute top-3 right-3 bg-[var(--bg-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          COMING SOON
        </span>
      )}
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>

      <p className="text-sm text-[var(--text-muted)]">
        {description}
      </p>
    </Link>
  )
}




