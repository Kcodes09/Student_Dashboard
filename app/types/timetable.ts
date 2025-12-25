export type SectionType = "LECTURE" | "TUTORIAL" | "PRACTICAL"

export type SelectedSections = {
  [courseCode: string]: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
}
