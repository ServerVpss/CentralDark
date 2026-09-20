# 👑🪬 T0/T1 CURRENT — Casa + VPS + PDF + Council + Desktop

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
OBSERVED_AT≈2026-09-20T04:49-03:00

## Casa

Git:
C:\CentralDark
HEAD=7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1
BRANCH=main
DIRTY=1

E:\CentralDark\CentralDark:
GIT=false

E:\CentralDark\Pivete\CentralDark:
EXISTS=false

## PDF Gate CURRENT

Runner:
E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1

Sector:
PDF_GATE

SECTOR_RESULT=PROBE_PASS
PDF_GATE_EXIT=0

PDF_GATE_CURRENT_TODAY=PASS.

## Desktop Commander

Foram observadas duas cadeias package-root distintas:
- @wonderwhy-er/desktop-commander@latest
- @wonderwhy-er/desktop-commander@0.2.48

As duas possuem descendentes node/cmd e cada cadeia apresentou socket TCP Established em porta local distinta.

MULTIPLE_DESKTOP_COMMANDER_CHAINS=true.
ONE_REMOTE_PROCESS_PER_PROFILE=UNKNOWN.
CANONICAL_OWNER=UNKNOWN.
SAFE_TO_KILL_ANY_CHAIN=false.

O contador bruto também capturou processos cujo CommandLine continha o termo por contexto do probe; portanto DC_COUNT bruto não deve ser tratado como número de servers.

## Hermes local

Múltiplos Hermes.exe foram observados.
MULTIPLE_HERMES_PROCESSES=true.
DUPLICATE_OWNER_NOT_PROVEN=true.

## VPS

Repo:
/root/CentralDark
HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38
BRANCH=main
DIRTY=13

Health:
MCP 9100 => HTTP 200
Arsenal 8083 => HTTP 000
Arsenal Adapter 8090 => HTTP 000

Docker:
CentralDark-HermesThinker = Up 8 days
CentralDark-MCPO = Up 8 days

Ports 8083/8090 ausentes na medição.
Port 9100 ativo.

ARSENAL_COUNCIL_RUNTIME=DOWN_OR_ABSENT.
MCP_RUNTIME=UP.
TELEGRAM_MULTI_IA_COUNCIL_FULL_RUNTIME=NOT_PROVEN.

## Erro de orquestração aprendido

Primeiro wrapper paralelo falhou antes de executar por interpolação host-JS de sintaxe shell.

HOST_LANGUAGE_INTERPOLATION_MUST_BE_SANITIZED=true.
TOOL_WRAPPER_PARSE_FAIL != TARGET_FAIL.

## Veredito

PDF_GATE=PASS_CURRENT.
MCP_VPS=PASS_CURRENT.
ARSENAL_COUNCIL=FAIL_CURRENT_AVAILABILITY.
DESKTOP_COMMANDER_OWNER=UNKNOWN.
CASA_VPS_GIT_SAME_SHA=false.
GLOBAL_FIXED_POINT=false.

## NEXT_CURSOR

1. medir GitHub main e drift Casa/VPS;
2. discriminar Desktop Commander PID→parent→socket→profile/session sem matar;
3. medir owner/runtime real do Council/Telegram;
4. integrar padrão operacional no boot/engine somente após esses owners.
