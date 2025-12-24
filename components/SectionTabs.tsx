"use client"
import { useState } from "react"
import { MasterCourse, SectionType } from "../app/lib/timetable/types"
import SectionCard from "../components/SectionCard"

type SelectedSections = {
  [courseCode: string]: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
}

type Props = {
  course: MasterCourse
  selectedSections: SelectedSections
  setSelectedSections: React.Dispatch<
    React.SetStateAction<SelectedSections>
  >
}

const TYPES: SectionType[] = ["LECTURE", "TUTORIAL", "PRACTICAL"]

export default function SectionTabs({
  course,
  selectedSections,
  setSelectedSections,
}: Props) {
  const [active, setActive] = useState<SectionType>("LECTURE")

  const availableTypes = TYPES.filter(type =>
    course.sections.some(s => s.type === type)
  )

  const sections = course.sections.filter(s => s.type === active)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {availableTypes.map(type => (
          <button
            key={type}
            onClick={() => setActive(type)}
            className={`px-3 py-1 rounded text-sm border
              ${
                active === type
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : ""
              }`}
          >
            {type[0]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sections.map(sec => (
          <SectionCard
            key={sec.section}
            section={sec}
            active={
              selectedSections[course.courseCode]?.[active] ===
              sec.section
            }
            onSelect={() =>
              setSelectedSections(prev => ({
                ...prev,
                [course.courseCode]: {
                  ...prev[course.courseCode],
                  [active]: sec.section,
                },
              }))
            }
          />
        ))}
      </div>
    </div>
  )
}
