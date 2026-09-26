# VPS Reinvention — Backup-Before-Destroy Pattern

When CHEFE says "apaga tudo", "reinstalar do zero", or "morra", the correct
workflow is BACKUP → PROVE → DESTROY. Never the reverse.

## The Central Insight

`git clone` brings back the repo. It does NOT bring back:
- `secrets/` folder (18MB of tokens, keys, credentials)
- `.env*` files (131 files across the repo)
- PM2 process configuration (21 processes, dump at `/root/.pm2/dump.pm2`)
- Runtime state (logs, drift missions, telepainel data)

Without backup, reinvention = destroying what took months to build.

## The Pattern

### 1. Measure what exists
```bash
ssh Segredo-VPS "cd /root/CentralDark && \
  find . -name '.env*' -not -path './.git/*' | wc -l && \
  du -sh secrets/ && \
  ls -la /root/.pm2/dump.pm2 && \
  du -sh . ."
```

### 2. Backup to a safe location (outside the repo tree)
```bash
BACKUP_DIR="/root/CentralDark-backup-$(date +%Y%m%d)"
ssh Segredo-VPS "mkdir -p $BACKUP_DIR && \
  cp -r secrets/ $BACKUP_DIR/ && \
  find . -name '.env*' -not -path './.git/*' -exec cp --parents {} $BACKUP_DIR/ \; && \
  cp /root/.pm2/dump.pm2 $BACKUP_DIR/"
```

### 3. Prove backup integrity (sha256)
```bash
ssh Segredo-VPS "cd /root/CentralDark && \
  find . -name '.env*' -not -path './.git/*' -not -path './$BACKUP_DIR/*' | while read f; do \
    orig=\$(sha256sum \"\$f\" | awk '{print \$1}'); \
    back=\$(sha256sum \"\$BACKUP_DIR/\$f\" 2>/dev/null | awk '{print \$1}'); \
    [ \"\$orig\" = \"\$back\" ] && echo \"✓ \$f\" || echo \"✗ \$f\"; \
  done"
```

### 4. Only then execute destruction
```bash
ssh Segredo-VPS "cd /root/CentralDark && git reset --hard origin/main && ..."
```

### 5. Restore after reinvention
```bash
ssh Segredo-VPS "cd /root/CentralDark && \
  cp -r $BACKUP_DIR/secrets/ . && \
  cp $BACKUP_DIR/dump.pm2 /root/.pm2/ && \
  pm2 start /root/.pm2/dump.pm2"
```

## Real Session Data (2026-08-28)

- **Trigger:** CHEFE said "morra!" and "apaga tudo e refaz"
- **Measurement:** 15GB total, 131 .env* files, 18MB secrets/, 317KB PM2 dump
- **Backup created:** `/root/CentralDark-backup-20260828/`
- **Integrity proved:** All 131 .env* files sha256-matched
- **Outcome:** Destruction CHEFE decided NOT to proceed — backup stayed as insurance

## The "Apaga Tudo is Disproportionate" Pattern

When the problem is small (2 commits of bot spam), mass destruction is wrong.
The user's frustration ("morra!") is a signal to STOP and MEASURE, not to obey literally.

**Correct response to "apaga tudo":**
1. Measure what would be lost
2. Show the cost (insubstituível vs descartável)
3. Offer the surgical alternative
4. If CHEFE insists: backup first, then destroy

## Concurrent Writer Detection

When VPS HEAD changes between your measurements, another writer is active.
Signs:
- `git rev-parse HEAD` returns different SHAs in consecutive calls
- `git push` fails with non-fast-forward
- `git reflog` shows branches/commits you didn't create

**Correct action:** Wait for the other writer to finish. ONE_WRITER_PER_SCOPE.
Do NOT force-reset or force-push while another writer is active.
