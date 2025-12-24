import Link from "next/link"

interface DashboardCardProps {
  title: string
  description: string
  href: string
}

export default function DashboardCard({
  title,
  description,
  href,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-xl
        bg-[var(--bg-surface)]
        p-6
        shadow-sm
        transition
        hover:bg-[var(--bg-surface-hover)]
        hover:shadow-md
      "
    >
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>

      <p className="text-sm text-[var(--text-muted)]">
        {description}
      </p>
    </Link>
  )
}




