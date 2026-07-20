"use client"

import { useState } from "react"
import * as XLSX from "xlsx"

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [totalChunks, setTotalChunks] = useState(0)
  const [completedChunks, setCompletedChunks] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [rawChunks, setRawChunks] = useState<{ index: number, text: string }[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.")
      return
    }

    setIsUploading(true)
    setIsExtracting(true)
    setTotalChunks(0)
    setCompletedChunks(0)
    setParsedData(null)
    setRawChunks([])
    setGeneratedPrompt(null)

    // 1. JSON FILE HANDLING
    if (file.name.endsWith('.json')) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        setParsedData(Array.isArray(data) ? data : [data])
        setMessage("Success! Loaded JSON file.")
      } catch (err: any) {
        setMessage(`Failed to parse JSON: ${err.message}`)
      } finally {
        setIsUploading(false)
        setIsExtracting(false)
      }
      return
    }

    // 2. EXCEL/CSV FILE HANDLING
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      try {
        setMessage("Parsing Excel/CSV locally...")
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[]

        const coursesMap = new Map<string, any>()
        for (const row of rows) {
          const cc = row.CourseCode || row.courseCode;
          if (!cc) continue;
          
          if (!coursesMap.has(cc)) {
            coursesMap.set(cc, {
              courseCode: cc,
              courseTitle: row.CourseTitle || row.courseTitle || "",
              credits: String(row.Credits || row.credits || "0"),
              sections: [],
              exams: []
            });
            const course = coursesMap.get(cc);
            if (row.MidsemDate || row.midsemDate) {
               course.exams.push({ type: "MIDSEM", date: row.MidsemDate || row.midsemDate, startTime: String(row.MidsemStart || row.midsemStart || ""), endTime: String(row.MidsemEnd || row.midsemEnd || "") });
            }
            if (row.EndsemDate || row.endsemDate) {
               course.exams.push({ type: "ENDSEM", date: row.EndsemDate || row.endsemDate, startTime: String(row.EndsemStart || row.endsemStart || ""), endTime: String(row.EndsemEnd || row.endsemEnd || "") });
            }
          }
          
          const course = coursesMap.get(cc);
          const sec = row.Section || row.section;
          if (!sec) continue;

          let section = course.sections.find((s: any) => s.section === sec);
          if (!section) {
            section = {
              section: sec,
              type: row.SectionType || row.sectionType || "LECTURE",
              instructors: (row.Instructors || row.instructors) ? String(row.Instructors || row.instructors).split(",").map((i: string) => i.trim()) : [],
              sessions: []
            };
            course.sections.push(section);
          }
          
          const day = row.Day || row.day;
          const hour = row.Hour || row.hour;
          if (day && hour) {
            section.sessions.push({
              day: day,
              hour: Number(hour),
              startTime: String(row.StartTime || row.startTime || ""),
              endTime: String(row.EndTime || row.endTime || ""),
              room: String(row.Room || row.room || "")
            });
          }
        }
        
        const allCourses = Array.from(coursesMap.values());
        setParsedData(allCourses);
        setMessage(`Success! Extracted ${allCourses.length} courses from Excel.`)
      } catch (err: any) {
        setMessage(`Failed to parse Excel: ${err.message}`)
      } finally {
        setIsUploading(false)
        setIsExtracting(false)
      }
      return
    }

    // 3. PDF FILE HANDLING (API)
    setMessage("Step 1: Reading PDF text...")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload-tt", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setTotalChunks(data.totalChunks)
      setMessage(`Step 2: Processing ${data.totalChunks} chunks with AI. This will take ~${Math.ceil((data.totalChunks * 4) / 60)} minutes due to rate limits...`)
      
      let allCourses: any[] = []
      
      for (let i = 0; i < data.chunks.length; i++) {
        setCompletedChunks(i)
        
        let success = false;
        let retries = 0;
        const maxRetries = 3;

        while (!success && retries < maxRetries) {
          try {
            // Wait 6 seconds between AI calls (10 req/min limit to be safe for free tier)
            // If it's a retry, wait longer (exponential backoff)
            const waitTime = retries === 0 && i === 0 ? 0 : 6000 + (retries * 15000);
            if (waitTime > 0) {
               setMessage(`Step 2: Processing chunk ${i + 1}/${data.totalChunks}... ${retries > 0 ? `(Retry ${retries} after rate limit - waiting ${waitTime/1000}s)` : ''}`);
               await new Promise(r => setTimeout(r, waitTime)) 
            } else {
               setMessage(`Step 2: Processing chunk ${i + 1}/${data.totalChunks}...`);
            }

            const parseRes = await fetch("/api/admin/parse-chunk", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ textChunk: data.chunks[i] })
            })

            const parseData = await parseRes.json()
            
            if (parseData.isRaw) {
               setRawChunks(prev => [...prev, { index: i, text: parseData.rawText }])
               success = true; // we handled it as a raw chunk, proceed to next chunk
               continue;
            }

            // If quota exhausted or rate limit hit, usually returns 429 or 500 with specific error
            if (!parseRes.ok) {
               if (parseRes.status === 429 || parseData.error?.includes('Quota') || parseData.error?.includes('rate')) {
                  throw new Error('RATE_LIMIT');
               }
               throw new Error(parseData.error || 'Failed to parse');
            }

            if (parseData.data) {
               allCourses = [...allCourses, ...parseData.data]
            }
            
            // Update live preview incrementally
            setParsedData([...allCourses])
            success = true;
          } catch (err: any) {
             if (err.message === 'RATE_LIMIT' || err.message?.includes('429')) {
                retries++;
                if (retries >= maxRetries) {
                   throw new Error("API Quota exhausted. Please try again tomorrow or upgrade your API key.");
                }
             } else {
                throw err; // Fail on non-rate-limit errors
             }
          }
        }
      }
      
      setCompletedChunks(data.totalChunks)
      setMessage(`Success! Extracted ${allCourses.length} courses total. Please review below.`)
      setFile(null)
      
    } catch (err: any) {
      setMessage(`Failed: ${err.message}`)
    } finally {
      setIsExtracting(false)
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!parsedData) return

    setIsSaving(true)
    setMessage("Saving to mastertt.json...")

    try {
      const res = await fetch("/api/admin/save-tt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableData: parsedData }),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        setParsedData(null) // Clear preview on success
      } else {
        setMessage(`Save Error: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Upload the Draft Timetable PDF. The AI will parse it and update mastertt.json.
      </p>

      <div 
        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center transition-colors"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div className="text-4xl">📄</div>
        
        <input
          type="file"
          accept="application/pdf,.xlsx,.csv,.json"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
        />

        {file && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="mt-4 px-6 py-2.5 rounded-lg text-white font-bold transition-all disabled:opacity-50 shadow-sm"
          style={{ backgroundColor: "var(--bg-accent)" }}
        >
          {isUploading ? "Processing..." : "Process with AI"}
        </button>

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)] w-full">
          <hr className="flex-1 border-[var(--border-subtle)]" />
          <span>OR</span>
          <hr className="flex-1 border-[var(--border-subtle)]" />
        </div>

        <button
          onClick={() => {
            setRawChunks(prev => [...prev, { index: 999, text: "" }])
          }}
          disabled={isUploading}
          className="mt-2 px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50 border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] shadow-sm"
        >
          Paste Raw JSON Manually
        </button>
      </div>

      {message && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-sm font-medium text-center">
          {message}
          {isExtracting && totalChunks > 0 && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(completedChunks / totalChunks) * 100}%`, backgroundColor: "var(--bg-accent)" }}
              ></div>
            </div>
          )}
        </div>
      )}

      {parsedData && (
        <div className="mt-8 border rounded-xl p-4 md:p-6" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold">Preview Courses ({parsedData.length})</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setParsedData(null)}
                className="px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80 border"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-white font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--bg-accent)" }}
              >
                {isSaving ? "Saving..." : "Confirm & Update mastertt"}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
            {parsedData.map((course, i) => (
              <div key={i} className="p-3 rounded border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-main)" }}>
                <div className="font-bold">{course.courseCode}</div>
                <div className="text-sm text-[var(--text-muted)]">{course.courseTitle}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {course.sections?.map((sec: any, j: number) => (
                    <span key={j} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-surface-hover)" }}>
                      {sec.section} ({sec.type}) - {sec.sessions?.length || 0} sessions
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rawChunks.length > 0 && (
        <div className="mt-8 border rounded-xl p-4 md:p-6 border-red-500 bg-red-50 dark:bg-red-950/20">
          <h2 className="text-xl font-bold text-red-600 mb-4">Unparseable AI Output ({rawChunks.length})</h2>
          <p className="mb-4 text-sm text-[var(--text-primary)]">The AI generated text that is not valid JSON. You can edit it manually here and add it to the parsed data.</p>
          {rawChunks.map((rc, idx) => (
            <div key={idx} className="mb-4">
              <textarea
                className="w-full h-48 p-2 border rounded font-mono text-xs bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border-subtle)]"
                defaultValue={rc.text}
                id={`raw-chunk-${idx}`}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                   try {
                     const val = (document.getElementById(`raw-chunk-${idx}`) as HTMLTextAreaElement).value;
                     const j = JSON.parse(val);
                     setParsedData(prev => [...(prev || []), ...(Array.isArray(j) ? j : [j])]);
                     setRawChunks(prev => prev.filter((_, i) => i !== idx));
                   } catch(e) {
                     alert("Invalid JSON format");
                   }
                }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold transition-all hover:bg-green-700">Parse & Add</button>
                <button onClick={() => {
                   setRawChunks(prev => prev.filter((_, i) => i !== idx));
                }} className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm font-bold transition-all hover:bg-[var(--bg-surface-hover)]">Discard</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
