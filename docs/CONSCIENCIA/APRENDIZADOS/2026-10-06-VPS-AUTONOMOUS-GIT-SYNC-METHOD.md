# Aprendizado: Sync Autônomo Git na VPS — Método Completo Provado

**Data:** 2026-10-06
**Commit de prova:** 6ae79a9ec
**Agente de origem:** Claude Opus 4.6 (Casa SEGREDO → SSH Segredo-VPS → CENTRALDARK-OS)
**Status:** PROVADO EM PRODUÇÃO

## Problema resolvido

A VPS CENTRALDARK-OS ficava dessincronizada com origin/main por falta de mecanismo autônomo.
Isso quebrava o fluxo: agentes na Casa commitavam, mas Hermes na VPS continuava com código antigo.
Resultado: drift de 177 arquivos acumulados antes da correção.

## Método completo — reproduzível por qualquer agente

### 1. Diagnóstico (medir antes de agir)

Da Casa, via SSH:

    ssh Segredo-VPS 'cd /root/CentralDark && git log --oneline -1 && git fetch origin main && git rev-parse HEAD && git rev-parse origin/main'

Compara HEAD local vs origin/main. Se diferem, há drift.

### 2. Sync inicial (stash + pull)

    ssh Segredo-VPS 'cd /root/CentralDark && git stash -u && git pull origin main && git stash pop'

Regras:
- SEMPRE stash antes de pull (protege dirty changes)
- --ff-only primeiro, rebase como fallback
- NUNCA git reset --hard no runtime (/root/CentralDark não é scratch)
- NUNCA force-push

### 3. Script auto-sync

Arquivo: /root/CentralDark/scripts/vps/auto-sync-main.sh

Características obrigatórias:
- flock no lockfile /tmp/centraldark-auto-sync.lock (impede corrida)
- stash -u automático de mudanças locais antes do pull
- pull --ff-only primeiro (seguro), rebase como fallback
- abort se rebase falhar (nunca deixa estado corrompido)
- stash pop depois (restaura mudanças locais)
- log em scripts/vps/auto-sync.log com ISO timestamp + SHAs
- trim do log a 300 linhas (evita crescimento infinito)
- NUNCA: force-push, blind reset, restart all, secret echo

### 4. Cron persistente

Instalar (idempotente):

    (crontab -l 2>/dev/null | grep -v "auto-sync-main"; echo "*/5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh") | crontab -

Verificar:

    crontab -l
    # Resultado esperado: */5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh

### 5. Verificação / prova

Log do último sync:

    tail -5 /root/CentralDark/scripts/vps/auto-sync.log
    # Deve mostrar [OK], [SYNC] ou [WARN] com timestamp

HEAD atual vs remote:

    cd /root/CentralDark && git log --oneline -1 && git fetch origin main && git rev-parse origin/main
    # Devem ser iguais (ou diferir por <=5 min de delay)

### 6. gh CLI (opcional, pra PRs/issues)

Instalar:

    apt update && apt install gh -y

Autenticar (manual, precisa do CHEFE):

    gh auth login
    # Opções: GitHub.com → HTTPS → Token → colar token

Verificar:

    gh auth status

## Topologia provada

    Casa SEGREDO (Windows 11)
      └─ SSH → Segredo-VPS (89.117.78.124, root)
           └─ /root/CentralDark (runtime canônico)
                ├─ remote: https://github.com/ServerVpss/CentralDark.git
                ├─ credential: store --file=/root/.config/centraldark/git-credentials
                ├─ user: SegredoiDev
                └─ cron: */5 auto-sync

## Cadeados

    RUNTIME_IS_NOT_SCRATCH=true
    NO_FORCE_PUSH=true
    NO_BLIND_RESET=true
    NO_RESTART_ALL=true
    NO_SECRET_ECHO=true
    NO_SECRET_COMMIT=true
    STASH_BEFORE_PULL=true
    FF_ONLY_FIRST=true
    FLOCK_REQUIRED=true
    LOG_WITH_TIMESTAMP=true

## Rastro

    commit: 6ae79a9ec (scripts/vps/auto-sync-main.sh)
    push: origin/main at 6ae79a9ec
    cron: */5 * * * * (root crontab)
    receipt: docs/CONSCIENCIA/RECEIPTS/2026-10-06-vps-autonomous-git-sync.md
    test: 2026-10-06T09:19:30+00:00 [OK] already up-to-date

## NEXT_CURSOR

- Monitorar log nos próximos dias
- gh auth login quando CHEFE quiser usar gh CLI
- Considerar systemd timer se cron não for suficiente
- Se pm2 voltar ao PATH, registrar como processo monitorado
