# Local Runtime Pitfalls (Hermes / Windows)

Two durable patterns from local debugging sessions. Not VPS-specific, but filed here
because it's the closest operational umbrella with a references directory.

---

## 1. Subprocess does not inherit parent venv site-packages

**Symptom:** `ModuleNotFoundError: No module named 'requests'` when launching a Python
subprocess from a shell script, even though the module is installed in the Hermes venv.

**Cause:** A subprocess launched via `subprocess.run()`, `exec`, or a shell `exec` does not
automatically inherit the parent's activated venv. It resolves `python` from PATH, which may
point to the system interpreter without the required packages.

**Fix:** Use the venv's Python executable explicitly.

Shell:
```bash
export HERMES_BASE_URL="http://127.0.0.1:8645"
export CENTRALDARK_DEFAULT_ENGINE="hermes"

cd "e:/CentralDark/Pivete/CentralDark"

exec "/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe" \
     apps/modulos/elite-gateway/scripts/centraldark_omni_router.py \
     --host 127.0.0.1 --port 8099
```

Python launcher:
```python
import os
import subprocess
import sys

os.environ["HERMES_BASE_URL"] = "http://127.0.0.1:8645"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = "hermes"

venv_python = r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
subprocess.run(
    [venv_python, "apps/modulos/elite-gateway/scripts/centraldark_omni_router.py",
     "--host", "127.0.0.1", "--port", "8099"],
    env={**os.environ},
)
```

**Verify before launching:**
```bash
"/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe" \
  -c "import requests; print('requests OK', requests.__version__)"
```

**Pitfall:** Checking `python -c "import requests"` with the system Python will say "missing"
even when the venv has it — that check is meaningless unless you call the right interpreter.

---

## 2. CRLF line endings break SHA1 guard comparisons

**Symptom:** Python's `hashlib.sha1(raw_file_bytes)` produces a different hash than the git
blob SHA for the same file, causing `AUTOLUPA_CANONICAL_SHA`-style guards to report false
divergence.

**Cause:** Git normalizes line endings to LF when storing blobs. A file with CRLF line endings
(`\r\n`) has a different raw SHA1 than its normalized git blob.

**Real numbers from this session:**
- File: `.agents/skills/meta-lupa/SKILL.md` (UTF-8, CRLF, 26539 bytes)
- Python SHA1 (raw bytes): `b4af7aaed969d3bd821b7c603bf51258006fc43b`
- Git blob SHA (`git hash-object`): `42691e008ba50ee55646ca81113bf0abfde87af2`
- Guard expected (git blob SHA): `42691e008ba50ee55646ca81113bf0abfde87af2`

**Rule:** The canonical reference for any git-tracked file is the **git blob SHA**, not the raw
file SHA. Always use `git hash-object` or `git cat-file` for guard validation.

Shell:
```bash
git hash-object .agents/skills/meta-lupa/SKILL.md
# → 42691e008ba50ee55646ca81113bf0abfde87af2
```

Python:
```python
import subprocess

result = subprocess.run(
    ["git", "hash-object", ".agents/skills/meta-lupa/SKILL.md"],
    capture_output=True, text=True,
)
canonical_sha = result.stdout.strip()
```

**Do NOT** compare a raw Python SHA1 against the guard — the guard stores the git blob SHA.

**Verify after writing a guard:**
```bash
expected=$(git hash-object .agents/skills/meta-lupa/SKILL.md)
guard=$(head -1 .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA | awk '{print $1}')
if [ "$expected" = "$guard" ]; then
  echo "MATCH — guard is canonical"
else
  echo "MISMATCH — guard expects $guard, file resolves to $expected"
fi
```

**Why this matters:** A false divergence looks like a real drift and can send you down a
reconciliation path that isn't needed. The guard is supposed to catch real content changes —
line-ending artifacts are noise, not signal.
