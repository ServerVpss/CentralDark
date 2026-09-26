# File Reading Fallbacks

When `read_file` rejects a file as "Binary file" or similar, try these fallbacks.

## Why read_file fails

`read_file` may reject files as binary when:
- The file contains non-UTF-8 byte sequences (or sequences it doesn't recognize)
- The file has unusual encoding (UTF-8 with BOM, mixed encodings)
- The file contains null bytes or other binary-like content in the first N bytes

## Fallback 1: terminal cat/head

```bash
cat /path/to/file.txt
# or for large files:
head -200 /path/to/file.txt
```

This bypasses the read_file binary check entirely.

## Fallback 2: Python decode

```bash
python3 -c "
with open('/path/to/file.txt', 'r', encoding='utf-8') as f:
    print(f.read())
"
```

Useful when you need to handle encoding explicitly.

## Fallback 3: Python with error handling

```bash
python3 -c "
with open('/path/to/file.txt', 'r', encoding='utf-8', errors='replace') as f:
    print(f.read())
"
```

`errors='replace'` replaces undecodable bytes with U+FFFD, letting you see the structure even if some bytes fail.

## Fallback 4: hexdump first bytes

```bash
xxd /path/to/file.txt | head -5
# or
od -A x -t x1z -v /path/to/file.txt | head -5
```

Use this to diagnose encoding issues before choosing a fallback.
