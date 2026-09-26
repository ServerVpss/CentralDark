# PR body editing on this system

`gh pr edit --body-file -` with a quoted heredoc (`<<'MARKER'`) fails when the body contains unicode characters (em-dashes, accents, special punctuation) or is very large. The git-bash MSYS shell parser chokes on the heredoc input stream and returns `unexpected EOF while looking for matching`.

**Workaround:** write the body to a file first, then reference the file path:

```bash
# write body content to a temp file (use write_file tool or a quoted heredoc without special chars)
cat > /tmp/pr_body.md <<'EOF'
...body content...
EOF

gh pr edit N --repo ServerVpss/CentralDark --body-file /tmp/pr_body.md
```

Pitfall — heredoc end marker must be at line start with no leading whitespace, and the body must not contain a line that exactly matches the marker string anywhere. For large or unicode-heavy bodies, prefer the `write_file` tool to create the temp file rather than an inline heredoc in a `terminal` call.

Pitfall — PR-mother body edits: PR-mother #1562 is a structured document with sections (HUD card, filho list, GOAL, ONE ADMIN, secrets inventory). Before editing, read the current body (`gh pr view N --json body --jq '.body'`) to locate the correct insertion point. When adding a GOAL section, place it in the existing GOAL area if present, or add as a new section before `ONE ADMIN`. Do not duplicate the goal across multiple sections or leave stale HUD values (CHILD_HEAD, NEXT_CURSOR) that no longer match the live child PR.
