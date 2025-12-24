export default function PlannerPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
        Exam Planner
      </h1>

      <div className="space-y-4">
        <div className="rounded-xl bg-[var(--bg-surface)] p-4 shadow-sm">
          <h2 className="font-semibold text-[var(--text-primary)]">
            Mathematics
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Exam on 25 Oct
          </p>
        </div>

        <div className="rounded-xl bg-[var(--bg-surface)] p-4 shadow-sm">
          <h2 className="font-semibold text-[var(--text-primary)]">
            Computer Networks
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Exam on 30 Oct
          </p>
        </div>
      </div>
    </div>
  )
}
