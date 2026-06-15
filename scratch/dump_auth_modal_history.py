import sqlite3
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')
db_path = r"C:\Users\nunom\.gemini\antigravity-ide\conversations\fc9a6fc0-39a9-4123-ad3b-8993f89302b5.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
# We want to find steps in the database that have AuthModal code
cursor.execute("SELECT idx, step_payload FROM steps;")
rows = cursor.fetchall()

def clean_bytes(b):
    if not b: return ""
    try: return b.decode('utf-8', errors='ignore')
    except: return ""

for idx, payload in rows:
    text = clean_bytes(payload)
    if "createUserWithEmailAndPassword" in text and "setDoc" in text and "AuthModal" in text:
        # Let's extract any JSON string inside
        # Or look for imports
        match = re.search(r'import React.*export const AuthModal.*', text, re.DOTALL)
        if match:
            print(f"FOUND AuthModal code in step {idx}!")
            # Let's save it to components/AuthModal.tsx directly!
            code = match.group(0)
            # Remove any trailing junk (like protobuf markers or command payload end)
            # We look for the end of the React component, which is usually the export or last closing brace of the file
            # Let's find the last occurrences of }; or similar
            # Or we can write it to a temp file and inspect
            with open("scratch/recovered_AuthModal.tsx", "w", encoding="utf-8") as f:
                f.write(code)
            print("Wrote recovered file to scratch/recovered_AuthModal.tsx")
            break

conn.close()
