export default function AttendancePage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
        Attendance
      </h1>

      <div className="rounded-xl bg-[var(--bg-surface)] p-6 shadow-sm">
        <p className="text-[var(--text-muted)]">
          Your attendance details will appear here.
        </p>

        <div className="mt-4 text-4xl font-semibold text-green-600">
          85%
        </div>
      </div>
    </div>
  )
}
