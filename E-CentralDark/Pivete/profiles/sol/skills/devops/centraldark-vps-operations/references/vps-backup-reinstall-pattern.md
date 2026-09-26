# Backup & Reinstall Pattern (2026-08-28)

When CHEFE says "apaga tudo e refaz," NEVER destroy without backing up secrets first.

## What to backup

```bash
# 1. Create backup dir OUTSIDE the repo tree
mkdir -p /root/CentralDark-backup-<timestamp>/

# 2. Copy ALL .env* files (preserving directory structure)
find . -name '.env*' -not -path './.git/*' -not -path './CentralDark-backup*/*' \
  | while read f; do cp --parents "$f" /root/CentralDark-backup-<timestamp>/; done

# 3. Copy secrets/ folder
cp -r secrets/ /root/CentralDark-backup-<timestamp>/

# 4. Save PM2 process list
pm2 save --force
cp /root/.pm2/dump.pm2 /root/CentralDark-backup-<timestamp>/

# 5. Generate SHA256 proof of integrity
cd /root/CentralDark-backup-<timestamp> && find . -type f -exec sha256sum {} \; > SHA256SUMS.txt
```

## Proof of integrity

```bash
# Compare original vs backup
find . -name '.env*' -not -path './.git/*' -not -path './CentralDark-backup*/*' \
  | while read f; do
      orig=$(sha256sum "$f" | awk '{print $1}')
      back=$(sha256sum "/root/CentralDark-backup-<timestamp>/$f" 2>/dev/null | awk '{print $1}')
      [ "$orig" = "$back" ] && echo "✓ $f" || echo "✗ $f"
    done
```

## Restore after reinstall

```bash
# 1. Clone repo
git clone <repo> /root/CentralDark

# 2. Restore secrets
cp -r /root/CentralDark-backup-<timestamp>/secrets/ /root/CentralDark/
cp /root/CentralDark-backup-<timestamp>/.env* /root/CentralDark/  # preserving paths

# 3. Restore PM2
pm2 start /root/CentralDark-backup-<timestamp>/dump.pm2
```
