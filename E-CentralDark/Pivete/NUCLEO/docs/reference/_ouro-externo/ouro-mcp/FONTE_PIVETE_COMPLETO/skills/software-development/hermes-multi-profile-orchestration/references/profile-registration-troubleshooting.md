# Profile Registration Troubleshooting

## The "Folder Exists But CLI Doesn't See It" Problem

**Scenario:** You have folders at `~/AppData/Local/hermes/profiles/pivete/` and `~/AppData/Local/hermes/profiles/sol/` but `hermes profile list` only shows `default`.

### Root Cause
Hermes maintains an **internal registry** of profiles (separate from the filesystem). A folder on disk ≠ registered profile. The registry is populated when you:
- `hermes profile create <name>`
- `hermes profile import <path>`
- `hermes profile create <name> --clone-from <path>`

### Diagnosis Commands
```bash
# Check what Hermes sees
hermes profile list

# Check filesystem
ls -la ~/AppData/Local/hermes/profiles/

# Check profile metadata (if it exists)
cat ~/AppData/Local/hermes/profiles/pivete/profile-meta.json
```

### Fix: Register Existing Folders

#### Option 1: Import (preserves folder exactly)
```bash
hermes profile import ~/AppData/Local/hermes/profiles/pivete
hermes profile import ~/AppData/Local/hermes/profiles/sol
```

#### Option 2: Create with clone-from (registers + validates)
```bash
hermes profile create pivete --clone-from ~/AppData/Local/hermes/profiles/pivete
hermes profile create sol --clone-from ~/AppData/Local/hermes/profiles/sol
```

#### Option 3: If folders are empty/corrupt, clone from current
```bash
hermes profile create pivete --clone
hermes profile create sol --clone
```

### Verify Fix
```bash
hermes profile list
# Should now show:
# Profile          Model                        Gateway      Alias        Distribution
# ───────────────    ───────────────────────────    ───────────    ───────────    ────────────────────
# ◆default         —                            running      —            —
#   pivete         —                            stopped      —            —
#   sol            —                            stopped      —            —
```

### Windows-Specific Notes
- Path: `%LOCALAPPDATA%\hermes\profiles\` (not `~/.hermes/profiles/`)
- Use forward slashes in commands: `hermes profile import C:/Users/danda/AppData/Local/hermes/profiles/pivete`
- PowerShell: `hermes profile import "$env:LOCALAPPDATA/hermes/profiles/pivete"`

### After Registration: Start the Profile
```bash
# Start in background (PM2 recommended for production)
pm2 start hermes --name hermes-pivete --interpreter bash -- --profile pivete

# Or foreground for testing
hermes --profile pivete
```

### Common Follow-up Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Profile does not exist" after import | Import path wrong | Use absolute path, verify folder exists |
| Skills not loading in new profile | Skills in global folder, not profile folder | Check `profiles/pivete/skills/` has skills |
| API keys not working | `.env` missing in profile folder | Copy `.env` to `profiles/pivete/.env` or set per-profile |
| Port conflict | Multiple profiles on same port | Configure different ports per profile in `config.yaml` |

### Session Resume Across Profiles
```bash
# List sessions for specific profile
hermes --profile pivete sessions list

# Resume specific session
hermes --profile pivete --resume 20260808_073646_37e002a0
```

---

**Related:** `hermes-agent` skill → `references/cli-reference.md` (Profiles section), `references/troubleshooting.md`