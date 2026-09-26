# Instalação do Backup Automático na VPS

> Rodar como root na VPS `/root/Multizap`. **NÃO toca** em Recargas Brasil.

## 1. Instalar dependências

```bash
apt update && apt install -y postgresql-client jq openssl curl
```

## 2. Criar /etc/multizap-backup.env (somente o mínimo)

Todos os segredos do backup (GitHub, criptografia, B2, S3) ficam no painel master em
`/admin/backups` → **Cofre de credenciais**. Este arquivo guarda apenas o bootstrap
necessário pro script conseguir falar com o banco e baixar o cofre.

```bash
cat > /etc/multizap-backup.env <<'EOF'
SUPABASE_DB_URL="postgresql://postgres.<ref>:<senha>@aws-0-<region>.pooler.supabase.com:6543/postgres"
SUPABASE_URL="https://multizap.dev"
CRON_SECRET="<mesmo valor de master_settings.cron_secret>"

# (opcional) força destino — se omitido, usa o que estiver salvo no painel
# BACKUP_DESTINATION="github"
EOF

chmod 600 /etc/multizap-backup.env
```

> `SUPABASE_URL` aqui é o domínio oficial do MultiZap (`https://multizap.dev`),
> que expõe `/api/public/backup-config` (consultado pelo script com o header `x-cron-secret`).

## 3. Preencher o cofre no painel master

Abra `/admin/backups` → card **Cofre de credenciais** e preencha:

- **GitHub Token** — PAT com `Contents: read & write`
- **GitHub Repo** — ex.: `segredounlock/multizap-backups`
- **Senha de criptografia** — AES-256, **anote OFFLINE** (sem ela, backups antigos viram lixo)
- **B2 / S3** — só quando quiser ativar

Tudo é salvo direto no banco (RLS travada). O frontend nunca recebe o valor real,
só uma máscara tipo `ghp_••••1234`.

## 4. Instalar os scripts

```bash
cp /root/Multizap/scripts/vps/multizap-backup-quick.sh /usr/local/bin/multizap-backup
chmod +x /usr/local/bin/multizap-backup
```

## 5. Rodar backup manual de teste

```bash
multizap-backup
tail -f /var/log/multizap-backup.log
```

Confere o arquivo em `/root/backups/multizap/<data>/` e o registro em `/admin/backups`.

## 6. Agendar o robô da VPS

O painel só cria o pedido. Quem executa é a VPS. Por isso existem 2 agendas:

- **a cada minuto:** a VPS pergunta se tem pedido novo no painel (`--process-pending`);
- **04:00:** a VPS faz a cópia diária automática.

```bash
crontab -l 2>/dev/null | grep -v multizap-backup > /tmp/cron.tmp || true
echo "* * * * * /usr/local/bin/multizap-backup --process-pending >> /var/log/multizap-backup.log 2>&1" >> /tmp/cron.tmp
echo "0 4 * * * /usr/local/bin/multizap-backup >> /var/log/multizap-backup.log 2>&1" >> /tmp/cron.tmp
crontab /tmp/cron.tmp
rm /tmp/cron.tmp
```

Se o painel ficar em **esperando resposta da VPS**, confira na VPS:

```bash
tail -100 /var/log/multizap-backup.log
crontab -l | grep multizap-backup
```

## Rollback

```bash
crontab -l | grep -v multizap-backup | crontab -
rm /usr/local/bin/multizap-backup /etc/multizap-backup.env
```

Os segredos no cofre podem ser zerados pelo painel (botão lixeira) ou via SQL:
`UPDATE backup_secrets SET github_token=NULL, encryption_password=NULL, ... WHERE id=1;`
