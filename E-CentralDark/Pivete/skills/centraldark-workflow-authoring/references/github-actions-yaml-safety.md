# GitHub Actions YAML safety

## Pitfalls

- Heredoc inside bash function in `run: |` breaks YAML parsing. Use `printf` for JSONL.
- `<<'JSON'` with unindented JSON lines confuses the YAML scanner. Keep JSON on one line or use a helper function.
- Bearer tokens and secrets must be referenced as env vars (`${{ secrets.NAME }}`), never inlined or redacted with `***`.
- Validate with `python -c 'import yaml; yaml.safe_load(open(path))'` after every edit.

## Safe patterns

JSONL emit:
```bash
printf '%s\n' '{"ts":"'"$TS"'","event":"'"$1"'","pr":'"$PR"'}' >> "$LOG"
```

State file write:
```bash
jq -n --arg decision "$DECISION" '{decision:$decision}' > "$STATE_FILE"
```
