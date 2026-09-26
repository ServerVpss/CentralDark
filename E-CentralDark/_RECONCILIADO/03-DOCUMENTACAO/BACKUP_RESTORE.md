# Restauração de Backup do MultiZap

> **Antes de tudo:** SEMPRE rode com `--dry-run` primeiro. Restauração real APAGA dados.

## Passo a passo

### 1. Baixar o backup

**Da VPS:**
```bash
scp root@SEU_IP:/root/backups/multizap/<data>/multizap-backup-*.tar.gz.enc ~/Downloads/
```

**Da nuvem (Backblaze B2):**
```bash
b2 download-file-by-name multizap-backups multizap-backup-<data>.tar.gz.enc ~/Downloads/
```

### 2. Testar integridade (dry-run)

Na VPS (ou em outra máquina com `openssl` e a senha):
```bash
multizap-restore /caminho/multizap-backup-<data>.tar.gz.enc --dry-run
```

Vai mostrar os 4 arquivos extraídos em `/tmp/multizap-restore-<stamp>/`:
- `db.sql.gz` — dump do banco
- `media.tar.gz` — mídias dos buckets
- `code.tar.gz` — código `/root/Multizap`
- `whatsapp-sessions.tar.gz` — sessões WuzAPI/Whatsmeow

### 3. Restauração real (CUIDADO)

```bash
multizap-restore /caminho/multizap-backup-<data>.tar.gz.enc
# Vai pedir 2 confirmações: "CONFIRMO RESTAURAR" e "sim"
```

O script faz, em ordem:
1. Restaura o banco (psql)
2. Move `/root/Multizap` pra `/root/Multizap.before-restore-<stamp>` e extrai o backup
3. Roda `npm ci` no gateway
4. Restaura sessões WhatsApp (arquivos WuzAPI + dump do Postgres interno)
5. Extrai mídias em `/tmp/...media/` (upload pros buckets é manual, evita acidente)
6. Reinicia `MultiZap-Gateway`

### 4. Validar

```bash
pm2 status
curl http://127.0.0.1:3100/health
```

Abra `/admin` no painel e confira que os dados voltaram.

## Restauração parcial (só uma parte)

Depois do `--dry-run`, os arquivos ficam em `/tmp/multizap-restore-<stamp>/`. Você pode restaurar manualmente:

**Só o banco:**
```bash
gunzip -c /tmp/multizap-restore-*/db.sql.gz | psql "$SUPABASE_DB_URL"
```

**Só as sessões WhatsApp** (evita re-escanear QR):
```bash
cd /tmp/multizap-restore-*/
tar -xzf whatsapp-sessions.tar.gz
tar -xzf _sessions_tmp/wuzapi-files.tar.gz -C /
gunzip -c _sessions_tmp/wuzapi-postgres.sql.gz | docker exec -i wuzapi-db psql -U postgres
pm2 restart MultiZap-Gateway
```

## O que NÃO é restaurado automaticamente

- **Recargas Brasil** — não está no backup, não é tocado.
- **Secrets do Lovable Cloud** — secrets vivem no Lovable, não no banco. Se precisar, re-cadastre via UI.
- **Webhooks externos** (Meta, GitHub) — URLs voltam, mas se você trocou de domínio precisa reconfigurar do lado deles.

## Em caso de problema

- Estado anterior da pasta de código: `/root/Multizap.before-restore-<stamp>` — pode reverter com `mv`.
- Banco: o pg_dump usa `--clean --if-exists`, então restaurar de novo é seguro.
- Sessões: se as QR não voltarem, escaneie de novo em `/app/canais`.
