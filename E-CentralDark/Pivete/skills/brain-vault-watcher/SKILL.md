---
name: brain-vault-watcher
description: Watch BRAIN vault for markdown changes to auto-update MOCs.
trigger: When the user wants to keep MOC indexes and derived properties in sync with note changes in the BRAIN vault.
---
## Brain Vault Watcher Skill

This skill provides a watcher script that monitors the BRAIN vault for markdown changes, extracts frontmatter, logs receipts, and maintains state for auto-update of MOCs/indexes without creating another system.

### When to use
When the user wants to keep MOC indexes and derived properties in sync with note changes in the BRAIN vault.

### Steps
- Ensure the watcher script exists at `scripts/watcher_properties.py`.
- Run the script in background: `python scripts/watcher_properties.py &` (or via Hermes terminal with background=true).
- The script maintains state in `scripts/watcher_state.json` and logs receipts to `scripts/watcher_receipt.log`.
- Verify operation by checking the receipt log for CHANGED entries.
- To stop, kill the background process via `process(action='kill', session_id=<id>)`.

### Pitfalls
- Do not run multiple instances; check for existing process via `process(action='list')`.
- The script assumes the vault path is `E:\\CentralDark\\Pivete\\CentralDark\\docs\\BRAIN`; adjust if vault moves.
- Ensure Python is available in the environment.

### References
- `scripts/watcher_properties.py`
- `scripts/watcher_state.json` (state file)
- `scripts/watcher_receipt.log` (receipt log)