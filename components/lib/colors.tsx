
export const COURSE_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
]

export function getCourseColor(courseCode: string) {
  let hash = 0
  for (let i = 0; i < courseCode.length; i++) {
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length]
}
