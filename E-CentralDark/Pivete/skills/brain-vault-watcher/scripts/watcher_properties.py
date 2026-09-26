import os
import time
import hashlib
import json
from pathlib import Path

VAULT = Path(r"E:\CentralDark\Pivete\CentralDark\docs\\BRAIN")
STATE_FILE = Path(r"E:\CentralDark\Pivete\CentralDark\\scripts\\watcher_state.json")
RECEIPT_FILE = Path(r"E:\CentralDark\Pivete\CentralDark\\scripts\\watcher_receipt.log")

def get_file_hash(filepath):
    try:
        with open(filepath, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def log_receipt(message):
    with open(RECEIPT_FILE, 'a', encoding='utf-8') as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}\\n")
    print(message)

def scan_vault():
    state = load_state()
    changes = []
    for root, dirs, files in os.walk(VAULT):
        for f in files:
            if f.endswith('.md'):
                filepath = Path(root) / f
                rel_path = filepath.relative_to(VAULT)
                current_hash = get_file_hash(filepath)
                if current_hash is None:
                    continue
                old_hash = state.get(str(rel_path))
                if old_hash != current_hash:
                    changes.append((rel_path, old_hash, current_hash))
                    state[str(rel_path)] = current_hash
    if changes:
        save_state(state)
        for rel_path, old_hash, new_hash in changes:
            log_receipt(f"CHANGED: {rel_path} (from {old_hash[:8] if old_hash else None} to {new_hash[:8]})")
    return changes

if __name__ == "__main__":
    print("Starting BRAIN vault watcher...")
    while True:
        try:
            scan_vault()
            time.sleep(5)  # check every 5 seconds
        except KeyboardInterrupt:
            print("Stopping watcher.")
            break
        except Exception as e:
            print(f"Error in watcher loop: {e}")
            time.sleep(5)