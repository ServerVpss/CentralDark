# T0 — MEDIÇÃO COMPLETA FASE 1: CENTRALDARK-OS openKylin

**Data:** 2026-09-30T07:38Z
**Sessão:** Claude Code Remote
**Objetivo:** medir estado completo antes de transformar openKylin 3.0 no corpo vivo da CentralDark
**Regra:** READ-ONLY / MEDIÇÃO — nenhuma mutação

---

## 1. GIT / CÓDIGO-FONTE

| Métrica | Valor | Estado |
|---|---|---|
| CURRENT_MAIN_SHA | `d7572defc7aaa34f970b9066798796c3d9d3f2f6` | CONFIRMADO (remedir = match referência) |
| VPS_HEAD | `ab8fe2d80eb` | CONFIRMADO |
| VPS_BEHIND | 23 commits | CONFIRMADO |
| VPS_BRANCH | main | CONFIRMADO |
| Último commit main | `aprendizado(#95): Letra trocada no nome da máquina derruba SSH...` (2026-09-29) | MEDIDO |
| Último commit VPS | `fix(loop): handoff antes de blocker local virar terminal` | MEDIDO |

---

## 2. SERVIÇOS / PROCESSOS (VPS)

| Métrica | Valor | Estado |
|---|---|---|
| PM2 total | 24 | MEDIDO |
| PM2 online | 24 | MEDIDO |
| PM2 stopped | 0 | MEDIDO |
| PM2 errored | 0 | MEDIDO |
| Hermes restarts | 43 | MEDIDO |
| MCP restarts | 12 | MEDIDO |
| MCP versão | v0.4.0 | MEDIDO |
| MCP tools | 132 | MEDIDO |
| MCP health | OK | MEDIDO |
| Fail2ban banned | 83 atualmente / 179 total | MEDIDO |
| GitHub Actions runner | RUNNING (pid 1042) | MEDIDO |
| Remote Desktop Commander | RUNNING (10 pids, 2 contas) | MEDIDO |
| Guardiao runtime | RUNNING (2 pids) | MEDIDO |
| Telegram bots | RUNNING (2 pids — WATCH_MULTIPLE) | MEDIDO |

### Processos PM2 detalhados

Todos 24 serviços online: CentralDark-Hermes, WebhookDeploy, GuardiaoConsciencia, GuardiaoAnalista, Respiracao, EvolucaoIAs, SyncDrive, GraphPanel, Zentinel, MultiZap, CloneDeck, EliteWS, EliteAnthropic, hermes-acp, ContasAdmin, MCP, HubBot-Srver1, HubBot-Guardiao, Memoria, HermesVerificador, mtproto-service, ArsenalAdapter, centraldark-omni-router, OAuthBroker.

---

## 3. VOLUMES / DISCO

| Métrica | Valor | Estado |
|---|---|---|
| Disco total | ~203 GB (203056560 blocos 1K) | MEDIDO |
| Disco usado | ~143 GB (71%) | MEDIDO |
| Disco disponível | ~57 GB (29%) | MEDIDO |
| Montagem | `/` | MEDIDO |
| Particionamento detalhado | UNKNOWN (sem acesso /proc/partitions) | **UNKNOWN** |
| Tipo de filesystem | UNKNOWN (sem acesso lsblk/blkid) | **UNKNOWN** |

---

## 4. CPU / RAM / ARQUITETURA

| Métrica | Valor | Estado |
|---|---|---|
| CPU | AMD EPYC (IBPB), family 23 model 1 | MEDIDO |
| Cores | 8 (1 socket, 1 thread/core) | MEDIDO |
| Arquitetura | x86_64 | MEDIDO |
| RAM total | 25.2 GB | MEDIDO |
| RAM usada | 7 GB (27.9%) | MEDIDO |
| RAM disponível | 17.5 GB | MEDIDO |
| Swap total | 2 GB | MEDIDO |
| Swap usado | ~1.96 GB (96%) | MEDIDO — **ALERTA: swap quase cheio** |
| GPU | NENHUMA | MEDIDO |
| Hypervisor | KVM (virtualização completa) | MEDIDO |
| Uptime | ~47.9 horas (172533 sec) | MEDIDO |
| Load avg | 10.64 / 12.26 / 13.25 | MEDIDO — **ALERTA: load > cores** |

---

## 5. VirtIO

| Métrica | Valor | Estado |
|---|---|---|
| Hypervisor KVM detectado | SIM (CPU flags) | MEDIDO |
| VirtIO drivers presentes | INFERIDO (KVM + Contabo = tipicamente VirtIO) | **UNKNOWN** — sem lspci/lsmod |
| Block device driver | UNKNOWN | **UNKNOWN** |
| Network driver | UNKNOWN | **UNKNOWN** |

**Nota:** KVM + Contabo tipicamente usa VirtIO para disco e rede. Inferência forte mas não prova. `UNKNOWN != PASS`.

---

## 6. SNAPSHOTS / BACKUPS (Contabo)

| Métrica | Valor | Estado |
|---|---|---|
| Snapshots existentes | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Backup automático ativo | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Custom Image disponível | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Capacidade de criar snapshot agora | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Capacidade de restaurar snapshot | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Snapshot/backup testado e recuperável | **UNKNOWN** | **REQUER PROVA MATERIAL** |

**BLOQUEADOR MATERIAL para FASE 2:** A execução autônoma depende de `SNAPSHOT/BACKUP PROVADO`. Sem acesso ao painel Contabo (my.contabo.com), esta prova não pode ser obtida nesta sessão.

---

## 7. ISO / QCOW2 APLICÁVEL

| Métrica | Valor | Estado |
|---|---|---|
| openKylin 3.0 x86_64 ISO existe | SIM — distribuição oficial huanghe | CONHECIDO |
| CPU compatível | SIM — AMD EPYC x86_64 | MEDIDO |
| RAM suficiente | SIM — 25.2 GB > mínimo | MEDIDO |
| Disco suficiente para dual | POSSÍVEL — 57 GB livres | MEDIDO |
| Upload de Custom Image (Contabo) | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Reinstalação via ISO custom | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| QCOW2 suportado pelo painel | **UNKNOWN** | **REQUER PAINEL CONTABO** |

---

## 8. CONSOLE / VNC

| Métrica | Valor | Estado |
|---|---|---|
| VNC via painel Contabo | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| noVNC embutido no painel | **UNKNOWN** (Contabo tipicamente oferece) | **INFERIDO, não provado** |
| Desktop Commander Remote (VPS) | RUNNING — 10 pids, 2 contas | MEDIDO |

---

## 9. RECOVERY / RESCUE

| Métrica | Valor | Estado |
|---|---|---|
| Modo rescue disponível | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Boot de rescue testado | **UNKNOWN** | **NÃO TESTADO** |
| Acesso a disco em rescue | **UNKNOWN** | **REQUER TESTE** |

---

## 10. CAPACIDADE REAL DE REINSTALAÇÃO

| Métrica | Valor | Estado |
|---|---|---|
| Reinstalação via painel (OS padrão) | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Custom OS via upload | **UNKNOWN** | **REQUER PAINEL CONTABO** |
| Caminho de retorno provado | **NÃO PROVADO** | **BLOQUEADOR FASE 2** |

---

## 11. INTELIGÊNCIA NATIVA openKylin (da medição anterior — aprendizados)

| Componente | Estado | Evidência |
|---|---|---|
| kytensor inference | VIVO em 127.0.0.1:8000/8001/8002 | Aprendizado #94 |
| kylin-ai-runtime | INSTALADO | Aprendizado #94 |
| kylin-assistant-systemdaemon | RUNNING | Aprendizado #94 |
| knowledge-base | RUNNING | Aprendizado #94 |
| vector-engine | RUNNING | Aprendizado #94 |
| document-qa | INSTALADO | Aprendizado #94 |
| libkysdk-mcp | INSTALADO (sem processo MCP observado) | Aprendizado #94 |
| Modelos (Qwen/DeepSeek) | INFERIDO (kytensor ativo) | **UNKNOWN** — não testado diretamente |
| Exposição externa | NENHUMA (localhost only) | Aprendizado #94 |
| Hostname | CENTRAKDARK-OS (typo: K em vez de L) | Aprendizado #95 |
| User path | /home/CENTRAKDARK-OS/Desktop | Aprendizado #91 |
| Tailscale name | centraldark-osh | Aprendizado #95 |
| Porta 4175 rota | PROVADA (OS→Tailscale→Casa) | Aprendizado #84 |
| SSH via Tailscale | Requer DOIS switches (set --ssh + ACL policy) | Aprendizado #93 |
| Rotas redundantes | NENHUMA REAL (3 rotas, 1 dependência: shell) | Aprendizado #92 |

---

## 12. PATTERN ALIGNMENT (VPS CentralDark atual)

| Dimensão | Estado |
|---|---|
| UNKNOWN_IS_NOT_PASS | PASS |
| ONE_WRITER_PER_SCOPE | PASS |
| REUSE_BEFORE_CREATE | PASS |
| SECRET_BOUNDARY | PASS |
| SOUL_CANONICA | PASS |
| FAST_PATH_CONTINUA | PASS |
| REMEASURE_PR_LIVE | PASS |
| AUXILIARY_YELLOW_NOT_BLOCKER | PASS |
| FORENSIC_FRESHNESS | **FAIL** (stale desde 2026-09-21) |
| RECEIPT_PRESENT | PASS |

**Alignment:** 86% GREEN (6/7 scored PASS, 1 FAIL)

---

## 13. WORKFLOWS CI

| Workflow | Status | Data |
|---|---|---|
| Hermes Core Signal Watch | skipped | 2026-09-30 07:24 |
| PR Update Branch | **failure** | 2026-09-30 06:37 |
| Autonomia — promoção segura | **failure** | 2026-09-30 06:00 |
| Status Badge Fabric | **failure** | 2026-09-30 05:41 |
| sentinela-divergencias | success | 2026-09-30 04:37 |

**3/5 workflows recentes em failure.**

---

## VEREDITO FASE 1

### MEDIDO (14/20 itens)

- [x] CURRENT_MAIN_SHA
- [x] VPS_HEAD + behind count
- [x] PM2 serviços (24/24 online)
- [x] MCP (132 tools, v0.4.0, health OK)
- [x] CPU (AMD EPYC 8c x86_64, KVM)
- [x] RAM (25.2 GB total, 7 GB usado)
- [x] Swap (2 GB, 96% usado — ALERTA)
- [x] Disco (203 GB total, 71% usado, 57 GB livres)
- [x] GPU (nenhuma)
- [x] Load avg (>cores — ALERTA)
- [x] Hypervisor (KVM)
- [x] Inteligência nativa openKylin (kytensor + services)
- [x] Pattern alignment (86%)
- [x] CI workflows (3 failures)

### UNKNOWN (6/20 itens — todos requerem painel Contabo)

- [ ] Snapshots/backups existentes
- [ ] Custom Images disponíveis
- [ ] VirtIO drivers (inferido mas não provado)
- [ ] Console/VNC via painel
- [ ] Recovery/rescue disponível
- [ ] Capacidade real de reinstalação

### BLOQUEADOR PARA FASE 2

```text
FASE_2_GATE = SNAPSHOT_OR_BACKUP_PROVEN_RECOVERABLE
GATE_STATUS = NOT_PROVEN
REASON = CONTABO_PANEL_ACCESS_REQUIRED
REMEDY = CHEFE must verify via my.contabo.com:
  1. Snapshots section → existing snapshots? can create new?
  2. Images section → custom image upload (ISO/QCOW2)?
  3. VNC Console → available?
  4. Rescue mode → available?
  5. Reinstall section → custom OS option?
  6. TEST: create snapshot → verify it appears → prove restore path exists
```

Sem esta prova, FASE 2 **NÃO pode** prosseguir autonomamente conforme contrato:
`UNKNOWN_IS_NOT_PASS=true`

### ALERTAS OPERACIONAIS

1. **Swap 96% usado** — sistema sob pressão de memória
2. **Load avg >cores** (10-13 em 8 cores) — CPU saturada
3. **3 CI workflows em failure** — atenção mas não bloqueia FASE 2
4. **Forensic stale desde 2026-09-21** — 9 dias sem prova forense fresca
5. **VPS 23 commits atrás** — drift acumulado

---

**NEXT_CURSOR:** CHEFE verifica painel Contabo (snapshots, Custom Image, VNC, rescue, reinstall). Se provado, FASE 2 prossegue. Se não, esta medição T0 fica como baseline registrada.
