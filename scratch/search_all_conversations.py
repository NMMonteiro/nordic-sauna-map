import os
import sqlite3
import sys

# Set standard output encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

conversations_dir = r"C:\Users\nunom\.gemini\antigravity-ide\conversations"
search_term = "curator"

db_files = [f for f in os.listdir(conversations_dir) if f.endswith('.db')]
print(f"Searching {len(db_files)} DB files for '{search_term}'...")

def clean_bytes(b):
    if not b: return ""
    try:
        text = b.decode('utf-8', errors='ignore')
        return text
    except Exception:
        return ""

for db_file in db_files:
    db_path = os.path.join(conversations_dir, db_file)
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [r[0] for r in cursor.fetchall()]
        if 'steps' in tables:
            cursor.execute("SELECT idx, step_payload FROM steps;")
            rows = cursor.fetchall()
            for idx, payload in rows:
                text = clean_bytes(payload)
                if search_term.lower() in text.lower():
                    # Print matching snippets
                    lower_text = text.lower()
                    pos = 0
                    while True:
                        pos = lower_text.find(search_term.lower(), pos)
                        if pos == -1: break
                        start = max(0, pos - 150)
                        end = min(len(text), pos + 250)
                        print(f"MATCH: {db_file} -> Step {idx}")
                        print(f"--- Snippet ---")
                        print(text[start:end])
                        print("-" * 50)
                        pos += len(search_term)
        conn.close()
    except Exception as e:
        print(f"Error reading {db_file}: {e}")
