# 👑🪬 Conselho vivo / cron / remote profiles medidos

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
OBSERVED_AT=2026-09-20T05:10-03:00

## Conselho vivo

/var/log/conselho-vivo.log:
- conselho-vivo.json atualizado continuamente;
- 8 debates;
- 8 evoluções.

apps/modulos/status/conselho-vivo.json foi observado como receipt/status recente.

CONSELHO_VIVO_STATUS_FILE_ACTIVE=true.
CONSELHO_VIVO_COUNT=8 debates / 8 evoluções.

## Arsenal daily council legado

docs/CONSCIENCIA/ARSENAL/hermes.log:
- rotina diária escolhe pauta;
- chama council debate;
- falha repetidamente com `Council falhou` de 2026-09-07 a 2026-09-19.

ARSENAL_DAILY_COUNCIL_CURRENT=FAIL.

## Cartógrafo / Grupo Evolução

apps/modulos/mapeamento/logs/cron.log:
- Cartógrafo escaneia;
- detecta drift;
- gera debate drift-*;
- depois alterna com `sem drift`.

TELEGRAM_NOTIFY_FROM_CARTOGRAFO=false atualmente, por `credenciais ausentes — pulando envio`.

## Cron quebrado / path drift

/var/log/casa-bridge-monitor.log:
- /root/CentralDark/scripts/remote-bridge/monitor-casa-bridge.sh: not found

/tmp/hermes-watchdog.log:
- /root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/watchdog.sh: not found

/var/log/memory-linker-inbox-sentinel.log:
- scripts/memory-linker/inbox-sentinel-cron.sh: No such file or directory

CRON_PATH_DRIFT_CONFIRMED=true.

## Desktop Commander VPS

systemd:
- centraldark-dc-remote@conta1.service active/running
- centraldark-dc-remote@conta2.service active/running

Process tree:
- conta1 -> @wonderwhy-er/desktop-commander@0.2.51 remote
- conta2 -> @wonderwhy-er/desktop-commander@0.2.51 remote

VPS_DUAL_REMOTE_PROFILE=EXPECTED_AND_ACTIVE.

## Desktop Commander Casa relation

Casa still has:
- manual @0.2.48 chain from PowerShell;
- tray-managed @latest chain.

CANNOT_MAP_CASA_CHAINS_TO_CONTA1_CONTA2_YET=true.
SAFE_TO_KILL_CASA_CHAIN=false.

## Veredito

COUNCIL_STATUS_SPLIT=true:
- status file vivo PASS;
- legacy daily Arsenal council FAIL;
- Cartógrafo drift debate active;
- Telegram delivery blocked by missing env credentials.

REMOTE_PROFILE_STATUS_SPLIT=true:
- VPS conta1/conta2 PASS;
- Casa local chain ownership UNKNOWN.

## NEXT_CURSOR

1. criar gate de cron path drift/read-only que liste scripts ausentes antes de declarar runtime verde;
2. incorporar `multi_shell_preflight_lint` no contrato executável;
3. preservar dirty deltas úteis da VPS antes de sincronizar main;
4. mapear Casa chain ↔ profile por logs/session, não por chute.
