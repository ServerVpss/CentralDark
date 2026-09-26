<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# VPS Connection — MultiZap / clone-deck

> Documento permanente sobre a conexão GitHub ↔ VPS.
> Não contém secrets.

## VPS / repo

```txt
/root/Multizap/apps/clone-deck
```

## GitHub

```txt
https://github.com/segredounlock/clone-deck
```

## 🛡️ Segurança — consulta obrigatória

Antes de qualquer alteração na VPS que envolva segurança, consulte:

```txt
security/START_HERE.md   → ponto de entrada da segurança
security/README.md       → documento completo de auditoria
```

## Deploy automático

```txt
merge/push na main
  -> GitHub envia POST assinado para https://hook.multizap.dev/webhook
  -> CloneDeck-GitHub-Webhook escuta na porta 9003
  -> valida HMAC SHA-256 com WEBHOOK_SECRET da VPS
  -> executa /usr/local/bin/clone-deck-gh-pull
  -> atualiza /root/Multizap/apps/clone-deck
  -> executa scripts/post-deploy.sh
```

## Health público

```bash
curl -fsS https://hook.multizap.dev/health
```

Resposta esperada:

```txt
ok: true
service: CloneDeck-GitHub-Webhook
port: 9003
repo: segredounlock/clone-deck
branch: main
secret_loaded: true
```

## Aliases SSH documentados

### Read-only da VPS

```sshconfig
Host github-clone-deck
  HostName github.com
  User git
  IdentityFile /root/.ssh/clone_deck_deploy_key
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

Uso:

```bash
git remote set-url origin git@github-clone-deck:segredounlock/clone-deck.git
```

### Write separado para branch/PR

```sshconfig
Host github-clone-deck-write
  HostName github.com
  User git
  IdentityFile /root/.ssh/arena_clone_deck_write
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

Uso quando a chave existir no ambiente:

```bash
git push git@github-clone-deck-write:segredounlock/clone-deck.git HEAD:nome-da-branch
```

## Arquivos importantes na VPS

```txt
/root/clone-deck-webhook/.env             # WEBHOOK_SECRET, nunca expor
/root/clone-deck-webhook/                 # listener PM2 CloneDeck-GitHub-Webhook
/usr/local/bin/clone-deck-gh-pull         # script de pull
/var/log/clone-deck-webhook.log           # log do webhook/pull
/var/log/clone-deck-cleanup.log           # log da quarentena de untracked
/root/Multizap/quarantine/                # quarentena de arquivos movidos
```

## Serviços protegidos

Nunca mexer sem autorização explícita:

```txt
/root/whatsapp-server
PM2 whatsapp-server
porta 3000
webhook 9001
webhook 9002
Recargas
WuzAPI 127.0.0.1:8081
Gateway 127.0.0.1:3100
Supabase
Banco de dados
```

## Limpeza segura do repo na VPS

A limpeza automática move untracked para:

```txt
/root/Multizap/quarantine/clone-deck-untracked-YYYYMMDDHHMMSS
```

Ela não apaga definitivamente.

Validar:

```bash
cd /root/Multizap/apps/clone-deck
git status --short --branch
tail -n 80 /var/log/clone-deck-cleanup.log
```

## Segurança contínua

- **Sempre melhorar a segurança** quando possível — cada alteração é uma oportunidade.
- **Manter o padrão** em todo o sistema: o que vale para o Bot, vale para o CRM.
- **Consistência** é a chave: RLS, redirect, vault, auth — mesmo nível de proteção.
- **Documentar** toda melhoria em `security/README.md` e `security/START_HERE.md`.