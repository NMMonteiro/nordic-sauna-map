import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
db_path = r"C:\Users\nunom\.gemini\antigravity-ide\conversations\fc9a6fc0-39a9-4123-ad3b-8993f89302b5.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT step_payload FROM steps WHERE idx = 128;")
row = cursor.fetchone()

if row:
    text = row[0].decode('utf-8', errors='ignore')
    print(text)

conn.close()
