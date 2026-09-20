# 👑🪬 Desktop launcher provenance + Grupo Evolução mode

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Desktop Commander launcher provenance

### Chain 0.2.48

Root:
PID=52576
package=@wonderwhy-er/desktop-commander@0.2.48
command=npx -y ... remote

Parent:
pwsh.exe
working directory=C:\CentralDark!
launched from ordinary PowerShell session.

Classification:
MANUAL_CHAIN=true.
CANONICAL_OWNER_NOT_PROVEN=true.

### Chain latest

Root:
PID=51780
package=@wonderwhy-er/desktop-commander@latest
command=npx -y ... remote

Ancestors include:
CentralDark-Remote-Tray.ps1
under E:\CentralDark\CentralDark-OneShot-Integrated\vendor\remote-tray\CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909\engine.

Classification:
CENTRALDARK_REMOTE_TRAY_MANAGED=true.
CANONICAL_PROVENANCE_STRONGER=true.

## Safety verdict

LATEST_TRAY_CHAIN=CANONICAL_OWNER_CANDIDATE.
MANUAL_0_2_48_CHAIN=REDUNDANCY_CANDIDATE.
SAFE_TO_TERMINATE_0_2_48=false until continuity/handoff test proves current active bridge survives.

NO_KILL_WITHOUT_HANDOFF_PROOF=true.

## Grupo Evolução VPS

PM2 list currently empty.
No PM2 PID for:
- CentralDark-HubBot
- grupo-evolucao
- CentralDark-Hermes
- arsenal
- arsenal-adapter

HUBBOT_ALIVE=false.

Source module exists with agents:
- arquiteto
- critico
- historiador
- pesquisador
- produto

Core:
- gateway
- notificador
- orquestrador

Many missions/drift-*.json exist.

## Interpretation

LONG_LIVED_SERVICE_ACTIVE=false.
ON_DEMAND_OR_CRON_EXECUTION=UNKNOWN.
MODULE_AND_MISSION_HISTORY_PRESENT=true.

Do not classify Grupo Evolução as dead until scheduler/cron path is measured.

## NEXT_CURSOR

Measure scheduler/cron/systemd ownership for grupo-evolucao/Telegram; inspect runtime invocation contract; then preserve VPS useful dirty deltas.
