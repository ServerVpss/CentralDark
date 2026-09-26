# 2026-09-02: Cron Jobs Investigation — Root Level (Não Per-Profile)

## Contexto
Usuário perguntou sobre cron jobs no "perfil default". Verificamos que **não existe perfil "default"** em `C:\Users\danda\AppData\Local\hermes\profiles\`. Perfis existentes: `claude`, `pivete`, `sol`, `teste`. O perfil ativo da sessão é **pivete**.

## Descoberta Principal

**Cron jobs NÃO são per-profile** — são globais da instância Hermes.

| Localização | `E:\CentralDark\Pivete\cron\jobs.json` |
|-------------|----------------------------------------|
| Escopo | Global (instância Hermes) |
| Jobs ativos | 12 jobs |

## Problemas Comuns Identificados

| Problema | Jobs Afetados | Causa Raiz |
|----------|---------------|------------|
| **Scripts ausentes** (caminho `scripts\scripts\`) | System Breathing, PRs cycle, Cadeia Watchdog, WebUI Watchdog | Caminho duplicado no `jobs.json` |
| **Config drift** | Telemetria (3 variants), Dependabot Monitor, Screenpipe Monitor | Provider/model alterados globalmente → `RuntimeError: Skipped to prevent unintended spend` |
| **Script de telemetria ausente** | Telemetry collection, Telemetry 21h | `logs/telemetria/CollectTelemetry.ps1` não existe |
| **Erros de conexão** | HERMES-CASA-HEALTH-WATCH, Monitor Hermex/Casa | `RuntimeError: Connection error.` |

## Jobs — Resumo por ID

| ID | Nome | Schedule | Último Status | Problema |
|----|------|----------|---------------|----------|
| 3057c878c146 | Morning briefing | 0 8 * * * | ✅ ok | — |
| 0e769e2ce2b2 | System Breathing | every 360m | ❌ error | script `scripts\scripts\system-breathing.sh` não encontrado |
| 8da666859a0d | Telemetry collection | */5 * * * * | ❌ error | script `logs\telemetria\CollectTelemetry.ps1` não encontrado |
| 5050ea9f4723 | Telemetry with model | */5 * * * * | ❌ error | config drift (provider/model) |
| 8a7b98f04c7c | Telemetry SOLAR PRO 4 | */5 * * * * | ❌ error | config drift |
| 89f742175bac | Telemetry free model | */5 * * * * | ❌ error | config drift |
| b297a0bee23b | Telemetry 21h | 0 21 * * * | ❌ error | script não encontrado |
| 7d71467a3e46 | PRs abertos ciclo | every 30m | ❌ error | script `scripts\scripts\prs-open-commits-cycle.sh` não encontrado |
| 7cb6bc563171 | dependabot-monitor | * * * * * | ❌ error | config drift |
| 4e2282e4973d | screenpipe-monitor | * * * * * | ❌ error | config drift |
| 006be2a2de0e | Cadeia Free Tier Watchdog | every 10m | ❌ error | script `scripts\scripts\cadeia-free-watchdog.py` não encontrado |
| 6ed66b4cb005 | Hermes WebUI Watchdog | */5 * * * * | ❌ error | script `scripts\scripts\webui-watchdog.py` não encontrado |
| 53dff11cf423 | HERMES-CASA-HEALTH-WATCH | once | ❌ error | connection error |
| 6fa96b458564 | Monitor Hermex/Casa | every 10m | ❌ error | connection error |

## Ações Recomendadas

1. **Fixar caminhos dos scripts**: remover `scripts\` duplicado no `jobs.json` OU criar scripts nos locais esperados
2. **Pinnar provider/model** nos jobs com drift: `cronjob action=update job_id=<id> provider=nous model=nous/tencent/hy3:free`
3. **Verificar/criar** `CollectTelemetry.ps1` em `logs/telemetria/`
4. **Investigar falhas de conexão** nos health checks (portas 8080, 8787, 8099, 8788 down)
5. **Remover jobs obsoletos** se não forem mais necessários

## Princípios Aplicados

- **LOCAL_REALITY = JUDGE**: Medido `jobs.json` real, não assumido per-profile
- **DOCUMENTED ≠ EXECUTED**: Jobs existem mas maioria falha — não estão "rodando"
- **ONE_SYSTEM_ONLY**: Cron é global, não per-profile — não duplicar

---

**Registrado em**: 2026-09-02  
**Skill**: `centraldark-operational-method`  
**Fonte**: `E:\CentralDark\Pivete\cron\jobs.json` + `cronjob action=list`