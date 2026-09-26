# forensic-recon — command recipes (copy/paste, host git-bash)

All commands assume the host git-bash shell (NOT execute_code, which is sandboxed and
cannot see /e/...). Windows paths: use E:\... for vision_analyze; /e/... is fine in terminal.

## 1. Extract an embedded base64 asset and hash it (no python needed)
```bash
cd /e/CentralDark/Pivete/cache
f=/path/to/target.html
for key in hermes sol; do
  b64=$(grep -oP "${key}:\s*\"data:image/jpeg;base64,\K[A-Za-z0-9+/=]+" "$f")
  echo "=== $key ==="
  echo "$b64" | base64 -d > "artes_${key}.bin"
  echo "bytes: $(wc -c < artes_${key}.bin)"
  echo "sha256: $(sha256sum artes_${key}.bin | cut -d' ' -f1)"
  echo "type/dims: $(file -b artes_${key}.bin)"
done
cp artes_hermes.bin artes_hermes.png   # friendly name if the task wants one
```

## 2. Git: is the target dir even a repo? Find the committed copy.
```bash
cd /path/to/target/dir
git rev-parse --show-toplevel            # fails if not a repo
git log --all --oneline -- '*forja*'     # commits touching any forja* file
git log --all --name-only --oneline -- '*forja*'   # shows the ACTUAL committed path
```

## 3. Prove byte-identity between workspace copy and committed repo version
```bash
cd /e/CentralDark/Pivete/CentralDark
c=$(git log --all --format=%H -- '.agents/skills/visual-design-method/assets/forja-de-cartas.html' | head -1)
echo "commit=$c"
git show "$c:.agents/skills/visual-design-method/assets/forja-de-cartas.html" > /tmp/committed.html
echo "repo_hermes=$(grep -oP 'hermes:\s*"data:image/jpeg;base64,\K[A-Za-z0-9+/=]+' /tmp/committed.html | base64 -d | sha256sum | cut -d' ' -f1)"
echo "repo_file=$(sha256sum /tmp/committed.html | cut -d' ' -f1)"
echo "work_file=$(sha256sum /e/CentralDark/workspace/sol/forja-de-cartas.html | cut -d' ' -f1)"
# identical hermes sha  => the embedded asset is the same since the commit
```

## 4. Remote provenance (read-only, needs network)
```bash
git remote -v
git ls-remote origin | head            # lists branches/HEAD if reachable
git log origin/main --oneline -- '<committed/path>'   # confirm asset in remote history
```

## 5. Bounded disk search + SHA256 compare (maxdepth 4, skip node_modules)
```bash
HERMES=81e2efdd4482448ca8ec9f33460a862a345bcf606d488015ff5101ed545f5bb5
for root in /e/CentralDark/Pivete /e/CentralDark/workspace /e/Users/danda/Pictures /e/Users/danda/Documents; do
  find "$root" -maxdepth 4 \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) \
    -not -path '*/node_modules/*' -print0 2>/dev/null
done | xargs -0 -I{} sha256sum "{}" 2>/dev/null | grep -i "$HERMES" && echo MATCH || echo NO MATCH
```

## 6. Attribution grep (bounded) + embedded-metadata check in the blob
```bash
grep -rinE 'credito|crédito|source|unsplash|pixabay|pexels|stable diffusion|midjourney|dalle|created by|image by|photo by|stock|arte por|autor' target.html | head
# inside the decoded JPEG:
grep -a -c 'Exif'  artes_hermes.bin; grep -aoE 'https?://[^" ]+' artes_hermes.bin | head
```

## 7. Visual characterization (read-only)
Decode (step 1), then vision_analyze with a NATIVE Windows path:
  image_url: E:\CentralDark\Pivete\cache\artes_hermes.png
Ask: central vs background figure? gender/age/clothing? watermark/signature/logo/text?
AI-generation artifacts? recognizable real person or stock style?
