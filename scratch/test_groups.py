import json

mastertt = json.load(open('data/mastertt.json'))
fy_codes = ['MATH U101', 'MATH U113', 'PHY U101', 'PHY U110', 'CS U111', 'EEE U111', 'CHEM U101', 'CHEM U110', 'BIO U101', 'BITS U103']
fy_master = {item.get('courseCode'): item for item in mastertt if item.get('courseCode') in fy_codes}

# Let's define the two candidate groups excluding Common Math (MATH U101)
# Group A: Physics + EEE + BITS U103 + PHY U110
# Group B: Chemistry + Bio + CS U111 + CHEM U110 + MATH U113

# Let's inspect credits and clashes for Group A and Group B
group_a = ['PHY U101', 'PHY U110', 'EEE U111', 'BITS U103']
group_b = ['CHEM U101', 'CHEM U110', 'BIO U101', 'CS U111', 'MATH U113']

def get_slots(code):
    item = fy_master[code]
    lectures = []
    for sec in item.get('sections', []):
        if sec.get('type') == 'LECTURE':
            for s in sec.get('sessions', []):
                lectures.append((sec.get('section'), s.get('day'), s.get('hour')))
    return lectures

print("=== GROUP A ===")
for c in group_a:
    cr = fy_master[c].get('credits')
    print(f"{c}: {fy_master[c].get('courseTitle')} ({cr} Cr)")

print("=== GROUP B ===")
for c in group_b:
    cr = fy_master[c].get('credits')
    print(f"{c}: {fy_master[c].get('courseTitle')} ({cr} Cr)")
