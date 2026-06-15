import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
db_path = r"C:\Users\nunom\.gemini\antigravity-ide\conversations\fc9a6fc0-39a9-4123-ad3b-8993f89302b5.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT idx, step_payload FROM steps WHERE idx >= 40 AND idx <= 80;")
rows = cursor.fetchall()

for idx, payload in rows:
    try:
        text = payload.decode('utf-8', errors='ignore')
        print(f"================ STEP {idx} ================")
        print(text[:2000]) # Print first 2000 chars of each step payload
    except Exception as e:
        print(f"Error at step {idx}: {e}")

conn.close()
