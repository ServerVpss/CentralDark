---
name: forensic-recon
description: Trace file/asset origin & attribution (read-only recon).
---

# forensic-recon — read-only origin/attribution tracing

Class of task: produce PROVADO / NOT_PROVEN findings about WHERE a digital artifact
came from, WHO/WHAT is depicted, and whether it carries attribution. The output is an
evidence chain, not a guess. Stay read-only: the only write permitted is decoding an
embedded blob to a temp/cache file purely for hashing. Never run unknown binaries.

## Trigger conditions
- "trace the origin of <asset/file>", "where did this image come from", "who is the
  person/figure in this file/card", forensic recon, evidence chain, attribution hunt.
- Any authorized, read-only investigation that must yield an evidence-backed verdict
  (embedded base64 asset, uploaded blob, committed image, suspicious file).
- The user references "forensic / evidence chain / reconciliation" work.

## Workflow (ordered)
1. **Inventory the target object.** If it's a JS/JSON object holding assets, LIST ALL
   KEYS — never assume a single key (a real case had `hermes` AND `sol`). Note type per key.
2. **Extract embedded base64 and hash WITHOUT python** (host-python shims are often
   broken; `file`/`sha256sum`/`base64` are reliable):
   ```bash
   b64=$(grep -oP 'hermes:\s*"data:image/jpeg;base64,\K[A-Za-z0-9+/=]+' file.html)
   echo "$b64" | base64 -d > asset.bin
   echo "sha256: $(sha256sum asset.bin | cut -d' ' -f1)"
   echo "type/dims: $(file -b asset.bin)"   # reports JPEG/PNG dims natively
   ```
   `file -b` prints dimensions for JPEG ("726x432") and PNG — no parser needed.
3. **Git provenance** (verify the dir is actually a repo FIRST):
   ```bash
   git rev-parse --show-toplevel          # may FAIL — target dir need not be a repo
   git log --all -- '*name*'               # find commits touching the file
   git log --all --name-only -- '*name*'   # see the committed PATH (often differs)
   ```
   Compare workspace blob vs committed blob for byte-identity:
   ```bash
   c=$(git log --all --format=%H -- '<committed/path>' | head -1)
   git show "$c:<committed/path>" > /tmp/committed.html
   # re-extract base64 from /tmp/committed.html and sha256 it; same hash = provenance proven
   ```
   Remote: `git remote -v`; `git ls-remote origin` (read-only, needs net);
   `git log origin/main -- <path>` to confirm the asset exists in remote history.
4. **Bounded disk search + hash compare** (maxdepth to avoid timeouts; skip node_modules):
   ```bash
   for root in /e/CentralDark/Pivete /e/CentralDark/workspace /e/Users/danda/Pictures /e/Users/danda/Documents; do
     find "$root" -maxdepth 4 \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) \
       -not -path '*/node_modules/*' -print0 2>/dev/null
   done | xargs -0 -I{} sha256sum "{}" 2>/dev/null | grep -i <TARGET_SHA> && echo MATCH || echo NO MATCH
   ```
5. **Attribution grep** (bounded, case-insensitive) for:
   `credito|crédito|source|unsplash|pixabay|pexels|stable diffusion|midjourney|dalle|
   created by|image by|photo by|stock|arte por|autor`. Report matches VERBATIM + path.
   Disambiguate: "crédito" often means *financial credit*, not image attribution.
6. **Visual characterization (read-only).** Decode the asset and load it with
   vision_analyze to confirm what is depicted — central vs BACKGROUND figure, AI-generation
   artifacts (gibberish text, plastic faces), watermark/signature/logo. Metadata alone
   will NOT tell you if the "person" is the main subject or a secondary element. Also
   grep the blob for `Exif`/`Adobe`/URL strings to catch embedded metadata.

## Output shape (structured report)
- ARTES/asset keys present
- asset SHA256 + type + dims
- Git: author (local + remote if reachable)
- Disk images matching hash (yes/no + path)
- Attribution/credit found (verbatim + path)
- **Veredito:** `ASSET_EMBUTIDO | UPLOAD_DESCONHECIDO | PESSOA_REAL_COM_ATRIBUICAO | INDEFINIDO` with evidence
- Gaps: what could not be verified
Mark each item PROVADO / NOT_PROVEN.

## Pitfalls (learned the hard way)
- **HOST FS ACCESS:** `execute_code` runs in an ISOLATED SANDBOX that CANNOT see host
  mounts like `/e/CentralDark/...`. Use the `terminal` tool (git-bash on host) and
  `write_file` (host access) for host-file work. Host `python3` shim is frequently broken
  (points at a missing install) — prefer `file`+`sha256sum`+`base64 -d`, or use `node`.
- **VISION PATH (Windows hosts):** vision_analyze needs native `E:\CentralDark\...` paths,
  NOT MSYS `/e/CentralDark/...` (the latter is mangled to `\e\...` and fails "file not found").
- **NOT-A-REPO:** the workspace copy of a file often is NOT inside a git repo even when
  "the project" is. The committed copy may live at a DIFFERENT path (e.g. under
  `.agents/skills/...`). Always `git rev-parse --show-toplevel` before assuming history exists.
- **MULTIPLE KEYS:** an assets object can have more than one figure; list them all.
- **LOOK AT THE ASSET:** "a woman appeared" can mean she's a background figure in an
  embedded composite, not an upload. Decode + vision before concluding.
- **KEEP READ-ONLY:** only write the decoded blob to a cache/temp file for hashing.

## References
- `references/command-recipes.md` — copy-paste bash recipes for extraction, git
  byte-identity compare, and bounded disk hash search.
