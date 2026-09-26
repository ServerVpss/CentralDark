# Notepad LocalState Extraction (Windows)

This implements steps 1-3 of the pipeline: inventory WindowState + TabState, reconstruct, extract recoverable text.

## Inventory (always first)
- Base path: `C:\Users\<user>\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\`
- `WindowState\*.bin` — layout (usually minimal text)
- `TabState\*.bin` — current tab content + metadata (text lives here)
- `LocalState.zip` + `LocalState_extracted\TabState - Copia\` — historical sessions
- Use `ls` / `glob` then report counts (e.g. 2 windows, N current tabs).

## Text Recovery Method
`strings` may be unavailable in the shell. Use this Python pattern (ascii + UTF-16LE for Windows state):

```python
import re, os, glob

def extract_strings(data, min_len=4):
    ascii_strs = re.findall(b"[\x20-\x7E]{" + str(min_len).encode() + b",}", data)
    utf16_strs = []
    try:
        for m in re.finditer(b"((?:[\x20-\x7E]\x00){" + str(min_len).encode() + b",})", data):
            utf16_strs.append(m.group(0).decode("utf-16le", errors="ignore"))
    except:
        pass
    all_strs = [s.decode("ascii", errors="ignore") for s in ascii_strs] + utf16_strs
    return sorted(list(set(all_strs)), key=len, reverse=True)

base = r"C:\Users\danda\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState"
for f in sorted(glob.glob(os.path.join(base, "TabState", "*.bin"))):
    with open(f, "rb") as fh:
        data = fh.read()
        strs = extract_strings(data)
        # print or filter
```

- Start with full inventory + sizes.
- For targeted harvest: filter `strs` by keywords (e.g. "youtube", "erro", "fixed", "SOUL", "screenpipe", "reuse").
- Dedup across files before classification.

## Cross with Live State
After extraction, always measure CentralDark:
- `git config --null --get-all remote.origin.url`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git log --oneline -5`
- `gh pr list --head <branch>` (if available)

## Session Example (condensed)
Current tabs contained:
- Operational rules (SOUL-SOL reconciliation, REUSE_BEFORE_CREATE, no V2/V3, classification to REUSE/ABSORB/etc, fixed point proofs)
- Absorption task: map APPCENTRALDARK (11k+ entries) to owners, Screenpipe as capability provider
- Executor provenance (HERMES vs CODEX)
- Links: youtube watch?v=gAqKzoTiJ0k (historical), google doc with #ACORDAR #CRISTALIZAR, x.ai device code
- Paths: GARIMPO-CHEFE, hermes-webui/start.ps1, forensic-map.json

Historical yielded the youtube link + error logs.

## Usage in Handoff
Feed extracted + deduped + classified items into the required block sections (CURRENT_CANDIDATES, HISTORICAL_ITEMS, etc.). Always declare FORMAT_VERIFIED, OPEN_GAPS, CONTRADICTIONS.

Do not treat .bin as canonical truth; cross with git/runtime.