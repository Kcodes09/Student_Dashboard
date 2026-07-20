import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user?.email ||
      session.user.email !== "f20241022@hyderabad.bits-pilani.ac.in"
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Admin only." },
        { status: 401 }
      )
    }

    const { textChunk } = await req.json()
    if (!textChunk) {
      return NextResponse.json({ error: "Missing text chunk" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      )
    }

    const prompt = `You are an expert data extractor. I have provided a raw text chunk extracted from a university timetable PDF.
Your task is to parse this text and output a highly structured JSON array of course objects EXACTLY matching this TypeScript interface:

type SectionType = "LECTURE" | "TUTORIAL" | "PRACTICAL";
type Session = {
  day: "M" | "T" | "W" | "Th" | "F" | "S";
  hour: number;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:50"
  room: string;
};
type Section = {
  section: string; // e.g. "L1", "T1", "P1"
  type: SectionType;
  instructors: string[];
  sessions: Session[];
};
type Exam = {
  type: "MIDSEM" | "ENDSEM";
  date: string; // e.g. "04/10"
  startTime: string; // e.g. "9:30"
  endTime: string; // e.g. "11:00"
};
type Course = {
  courseCode: string;
  courseTitle: string;
  credits: string;
  sections: Section[];
  exams: Exam[];
};

RULES:
- Return ONLY valid JSON array containing the Course objects.
- Group all sections (L1, T1, P1) under their respective course.
- If a class spans multiple hours, you can create separate 1-hour sessions or a single session with extended endTime.
- The output MUST be an array of objects.
- For the credits field, extract ONLY the first digit. For example, if the text says '3 0 3', the credits value should be '3'.
- Extract MIDSEM and ENDSEM dates and times into the exams array if available.
- If a chunk contains partial course information that is impossible to resolve, skip it. Do NOT return malformed objects.

Raw Text Chunk:
${textChunk}`

    // Use gemini-flash-latest since it's fast and has high free tier rate limits
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("Gemini API Error in Chunk Parser:", errText)
      return NextResponse.json({ error: "Failed to process chunk with AI" }, { status: 500 })
    }

    const aiData = await response.json()
    const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    let parsedTimetable: any[] = []
    let isRaw = false;
    
    // Robust JSON extraction: Find the first '[' and last ']'
    const startIndex = aiText.indexOf('[')
    const lastIndex = aiText.lastIndexOf(']')
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex >= startIndex) {
      const jsonString = aiText.substring(startIndex, lastIndex + 1)
      try {
        parsedTimetable = JSON.parse(jsonString)
        if (!Array.isArray(parsedTimetable)) parsedTimetable = []
      } catch (e) {
        console.error("AI returned invalid JSON syntax. Raw output:", aiText)
        isRaw = true;
      }
    } else {
      console.error("No JSON array found in AI output. Raw output:", aiText)
      isRaw = true;
    }

    if (isRaw) {
      return NextResponse.json({
        success: false,
        isRaw: true,
        rawText: aiText
      })
    }

    return NextResponse.json({
      success: true,
      data: parsedTimetable,
    })
  } catch (err: any) {
    console.error("ADMIN PARSE CHUNK ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
