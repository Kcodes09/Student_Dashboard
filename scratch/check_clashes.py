import json

mastertt = json.load(open('data/mastertt.json'))

fy_codes = ['MATH U101', 'MATH U113', 'PHY U101', 'PHY U110', 'CS U111', 'EEE U111', 'CHEM U101', 'CHEM U110', 'BIO U101', 'BITS U103']

fy_master = {item.get('courseCode'): item for item in mastertt if item.get('courseCode') in fy_codes}

# Collect all lecture sessions for each course
lectures = {}
for code, item in fy_master.items():
    sec_sessions = []
    for sec in item.get('sections', []):
        if sec.get('type') == 'LECTURE':
            for s in sec.get('sessions', []):
                sec_sessions.append((sec.get('section'), s.get('day'), s.get('hour'), s.get('startTime'), s.get('endTime')))
    lectures[code] = sec_sessions

print("Lecture Sessions Summary:")
for code, sess in lectures.items():
    print(f"\n{code}:")
    for s in sess:
        print(f"  Sec {s[0]}: {s[1]} Hour-{s[2]} ({s[3]}-{s[4]})")

# Check clashes between specific course pairs
print("\n--- Checking Lecture Clashes ---")
codes = list(lectures.keys())
for i in range(len(codes)):
    for j in range(i+1, len(codes)):
        c1, c2 = codes[i], codes[j]
        # check if any section of c1 clashes with ALL sections of c2 or vice versa
        # Actually let's list overlapping day & hour
        c1_slots = set((s[1], s[2]) for s in lectures[c1])
        c2_slots = set((s[1], s[2]) for s in lectures[c2])
        overlap = c1_slots.intersection(c2_slots)
        if overlap:
            print(f"CLASH/OVERLAP between {c1} and {c2} at slots: {overlap}")
