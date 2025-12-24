import { Section } from "../app/lib/timetable/types"

type Props = {
  section: Section
  active: boolean
  onSelect: () => void
}

export default function SectionCard({
  section,
  active,
  onSelect,
}: Props) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded border p-3 transition
        ${
          active
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      <div className="font-medium">{section.section}</div>

      <div className="text-xs opacity-80">
        {section.instructors.join(", ")}
      </div>

      <div className="mt-2 text-xs">
        {section.sessions.map((s, i) => (
          <div key={i}>
            {s.day} • {s.startTime}–{s.endTime} • {s.room}
          </div>
        ))}
      </div>
    </div>
  )
}
