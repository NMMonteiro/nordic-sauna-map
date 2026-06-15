import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
db_path = r"C:\Users\nunom\.gemini\antigravity-ide\conversations\fc9a6fc0-39a9-4123-ad3b-8993f89302b5.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT idx, step_payload FROM steps;")
rows = cursor.fetchall()

def clean_bytes(b):
    if not b: return ""
    try: return b.decode('utf-8', errors='ignore')
    except: return ""

for idx, payload in rows:
    text = clean_bytes(payload)
    if "baf8674c-4952-4fee-8e15-3ed605531af7" in text or "97437425-c2a8-4683-ba64-0fab0fc72d49" in text:
        print(f"STEP {idx} contains feed ID")
        for line in text.split('\n'):
            if "baf8674c" in line or "97437425" in line:
                print(f"  Line: {line[:120]}")

conn.close()
