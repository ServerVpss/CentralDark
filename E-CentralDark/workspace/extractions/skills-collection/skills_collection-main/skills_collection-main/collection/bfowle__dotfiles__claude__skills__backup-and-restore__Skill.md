---
name: backup-and-restore
description: Backup dotfiles before changes and restore if needed
---

# Backup and Restore Dotfiles

This skill manages backups of dotfiles configurations before making changes.

## Task - Backup

When creating a backup, you should:

1. Create a backup directory with timestamp:
   ```bash
   ~/.dotfiles-backups/backup-YYYY-MM-DD-HHMMSS/
   ```

2. Copy current state of:
   - All `*.ln` files in ~/.dotfiles
   - Current neovim config (`~/.config/nvim`)
   - Current tmux config (`~/.tmux.conf`)
   - Current bash config (`~/.bashrc`, `~/.bash_profile`)
   - TPM plugins directory (`~/.tmux/plugins/`)
   - Lazy.nvim plugins directory (`~/.local/share/nvim/`)

3. Create a backup manifest file listing:
   - Timestamp
   - Git commit hash (if in git repo)
   - List of backed up files
   - Reason for backup

4. Compress old backups (older than 30 days)

## Task - Restore

When restoring from a backup, you should:

1. List available backups with timestamps

2. Ask user which backup to restore

3. Show what will be restored (diff if possible)

4. Confirm before restoring

5. Restore files:
   - Copy backed up files to original locations
   - Re-run `rake install` for symlinks
   - Restore plugin directories

6. Verify restoration:
   - Check symlinks are correct
   - Test neovim loads without errors
   - Test tmux starts correctly

7. Offer to restore previous state if issues occur

## Backup Script

Location: `~/.dotfiles/.claude/skills/backup-and-restore/backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="$HOME/.dotfiles-backups/backup-$(date +%Y-%m-%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dotfiles source
cp -r ~/.dotfiles "$BACKUP_DIR/dotfiles"

# Backup actual configs
cp -r ~/.config/nvim "$BACKUP_DIR/nvim" 2>/dev/null || true
cp ~/.tmux.conf "$BACKUP_DIR/tmux.conf" 2>/dev/null || true
cp ~/.bashrc "$BACKUP_DIR/bashrc" 2>/dev/null || true
cp ~/.bash_profile "$BACKUP_DIR/bash_profile" 2>/dev/null || true

# Backup plugins
cp -r ~/.tmux/plugins "$BACKUP_DIR/tmux-plugins" 2>/dev/null || true
cp -r ~/.local/share/nvim "$BACKUP_DIR/nvim-data" 2>/dev/null || true

# Create manifest
cat > "$BACKUP_DIR/manifest.txt" <<EOF
Backup created: $(date)
Git commit: $(cd ~/.dotfiles && git rev-parse HEAD 2>/dev/null || echo "not in git")
Reason: ${1:-"Manual backup"}
Files backed up:
$(find "$BACKUP_DIR" -type f | sort)
EOF

echo "Backup created: $BACKUP_DIR"
```

## Restore Script

Location: `~/.dotfiles/.claude/skills/backup-and-restore/restore.sh`

```bash
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: $0 <backup-directory>"
  echo "Available backups:"
  ls -1 ~/.dotfiles-backups/
  exit 1
fi

BACKUP_DIR="$HOME/.dotfiles-backups/$1"
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup not found: $BACKUP_DIR"
  exit 1
fi

echo "Restoring from: $BACKUP_DIR"
cat "$BACKUP_DIR/manifest.txt"
echo ""
read -p "Continue with restore? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Restore files
cp -r "$BACKUP_DIR/dotfiles" ~/.dotfiles
cp -r "$BACKUP_DIR/nvim" ~/.config/nvim 2>/dev/null || true
cp "$BACKUP_DIR/tmux.conf" ~/.tmux.conf 2>/dev/null || true
cp "$BACKUP_DIR/bashrc" ~/.bashrc 2>/dev/null || true
cp "$BACKUP_DIR/bash_profile" ~/.bash_profile 2>/dev/null || true

echo "Restore complete. Run 'rake install' to update symlinks."
```

## When to Use

**Backup before**:
- Major plugin updates
- Configuration refactoring
- Installing new tools
- Following update-dotfiles-trends suggestions
- Experimenting with new configs

**Restore when**:
- Neovim won't start
- Tmux has errors
- Shell configuration broken
- Plugin conflicts
- Need to rollback changes

## Output

For backup operations:
- Backup location
- Size of backup
- Files included
- Git commit reference

For restore operations:
- Available backups with dates
- Backup manifest
- Diff of changes (if possible)
- Restoration status
- Next steps (reload shell, restart tmux, etc.)
