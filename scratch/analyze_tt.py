import json

cdcs = json.load(open('data/cdcs.json'))
mastertt = json.load(open('data/mastertt.json'))

fy_codes = ['MATH U101', 'MATH U113', 'PHY U101', 'PHY U110', 'CS U111', 'EEE U111', 'CHEM U101', 'CHEM U110', 'BIO U101', 'BITS U103']

fy_master = {item.get('courseCode'): item for item in mastertt if item.get('courseCode') in fy_codes}

for code in fy_codes:
    item = fy_master.get(code)
    if not item:
        continue
    print(f"=== {code}: {item.get('courseTitle')} ({item.get('credits')} Cr) ===")
    sec_types = {}
    for sec in item.get('sections', []):
        stype = sec.get('type')
        snum = sec.get('section')
        sessions = sec.get('sessions', [])
        times = [f"{s.get('day')} Hour-{s.get('hour')}({s.get('startTime')}-{s.get('endTime')})" for s in sessions]
        sec_types.setdefault(stype, []).append(f"{snum}: {', '.join(times)}")
    
    for stype, list_sec in sec_types.items():
        print(f"  {stype} ({len(list_sec)} sections):")
        for sinfo in list_sec[:3]:
            print(f"    {sinfo}")
        if len(list_sec) > 3:
            print(f"    ... and {len(list_sec)-3} more sections")
