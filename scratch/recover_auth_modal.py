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

found = False
for idx, payload in rows:
    text = clean_bytes(payload)
    if "createUserWithEmailAndPassword" in text and "setDoc" in text and "AuthModal" in text:
        print(f"MATCH: step {idx}")
        # Find the full file or largest block containing 'AuthModal'
        # Usually inside a tool call like replace_file_content or write_to_file
        # Let's print out the text
        print(text[:3000])
        print("=" * 80)
        found = True

if not found:
    print("No matching step found.")

conn.close()
