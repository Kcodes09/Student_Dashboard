export const metadata = {
  title: "Alarms | Student Dashboard",
  description: "Configure custom alarms for your classes",
}

export default function AlarmsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bg-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
        <span className="absolute -top-1 -right-1 bg-[var(--bg-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          SOON
        </span>
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Class Alarms</h1>
      <p className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed">
        We&apos;re working on letting you set native alarms for your classes directly from the dashboard. Stay tuned!
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Android Clock sync
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Custom reminder timings
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Per-class control
        </div>
      </div>
    </div>
  )
}
