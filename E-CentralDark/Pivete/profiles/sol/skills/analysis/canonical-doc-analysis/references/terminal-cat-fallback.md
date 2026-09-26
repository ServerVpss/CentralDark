# File Reading Fallbacks for Analysis Sessions

## Problem
`read_file` may reject a file as "Binary file" even when it's actually UTF-8 text with special characters (emoji, smart quotes, etc.).

## Session technique: terminal cat

In this session, `paste_7_044320.txt` was rejected by `read_file` (3 failed attempts), but reading via terminal worked:

```bash
cat "/e/CentralDark/Pivete/pastes/paste_7_044320.txt"
```

The output was complete UTF-8 text (8694 bytes) with Portuguese content about MetaLupa semantic gaps.

## Why this works
- `cat` doesn't perform binary detection
- Terminal output includes the raw bytes as text
- Works even with emoji characters (the `` markers in the paste)

## When to use
Any time `read_file` says "Binary file - cannot display as text" for a file you need to analyze, try `cat` via terminal first.

## Alternative: Python with explicit encoding

```bash
python3 -c "
with open('/path/to/file.txt', 'r', encoding='utf-8') as f:
    print(f.read())
"
```

Useful when you need to process the content programmatically or when `cat` output is too large for the terminal buffer.
