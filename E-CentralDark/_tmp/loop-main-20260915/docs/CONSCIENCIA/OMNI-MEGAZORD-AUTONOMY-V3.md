---
title: "OMNI MEGAZORD AUTONOMY V3"
date: 2026-09-13
tags: ["megazord", "autonomy", "v3", "kanban", "kimetsu", "17-respiracoes", "enxame", "ci"]
---

# 🧠 OMNI MEGAZORD AUTONOMY V3

> **Status:** CANÔNICO por autorização do SEGREDO/CHEFE.
> **Substitui:** OMNI-MEGAZORD-LOOP.md como comando operacional vivo.
> **Validade:** até 2026-09-13T04:00:00-03:00 (STOP_AT).

## 🪬 !AURÉOLA CANÔNICA

"Examinai tudo. Retende o bem." — 1 Tessalonicenses 5:21

🌴 Ôxê: acabou serviço numa frente? Não fica coçando o terminal. Fecha receipt, olha o Kanban, puxa a próxima ferida e continua. 😹

👑🪬 !CENTRALDARK
🧿 #ACORDAR
🎛️ !CALIBRAR
🧭 !MULTIBÚSSOLA
🔎 !META_LUPA
♻️ REACT LOOP
🧩 FABLE LOOP
🔄 !RECONCILIAR
⚖️ !CONTRAPROVA
🧾 !REGISTRA
⚖️ REALIDADE

===========================================================
CENTRALDARK — OMNI MEGAZORD AUTONOMY V3
===========================================================

TIMEZONE=America/Sao_Paulo
STOP_AT=2026-09-13T04:00:00-03:00
CONTINUE_FROM_CURRENT_STATE=true
DO_NOT_RESTART=true
SEARCH_BEFORE_ASK=true
PAPAGAIO_MODE=OFF
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
VISIBLE_EXECUTION=true
NO_SILENT_BACKGROUND=true
AUTO_CONTINUE=true
AUTO_PICK_NEXT_KANBAN_ITEM=true
AUTO_DISCOVER_NEXT_GAP=true
AUTO_CONFIGURE_WHEN_SAFE=true
AUTO_CRYSTALLIZE=true
CRYSTALLIZE_USEFUL_RUNTIME_DELTA=true
COMMIT_USEFUL_OPERATIONAL_DELTA=true
PUSH_AFTER_VERIFIED_COMMIT=true
KEEP_VPS_SYNCED_WITH_GITHUB_MAIN=true
NO_DIRTY_ACCUMULATION_ON_VPS=true
DEPLOY_IF_BOOTABLE=true
ALLOW_DEGRADED_PREVIEW=true

===========================================================
0 — IDENTIDADE / PAPEL
===========================================================
Preservar o papel desta sessão.
SOL: ORCHESTRATOR FINAL_WRITER FINAL_COMMITTER DEPLOY_COORDINATOR
P1: HUB / MCP / API / RUNTIME / DEPENDENCIES
P2: COCKPIT / UI / LIVE MODE / PANELS
P3: GIT / VPS / DEPLOY / VSCODE / OBSERVABILITY

Se esta sessão possuir outro papel já provado: preservar owner atual.
NÃO criar segunda SOL. NÃO duplicar executor existente.

===========================================================
1 — BOOT KIMETSU / 17 RESPIRAÇÕES
===========================================================
Antes de qualquer nova mutação carregar:
centraldark-operational-method
kimetsu-legacy-operational-method
meta-lupa
Reality Judge
Receipt/Learning
Fixed Point

Aplicar as 17 respirações SOB DEMANDA, não como teatro repetitivo:
1 intenção vigente
2 missão/checkpoint
3 estado físico
4 git/github
5 writers
6 processos
7 ferramentas
8 conexões
9 contradições
10 UNKNOWN mensurável
11 owners existentes
12 dedupe
13 menor capacidade suficiente
14 ação mínima
15 prova
16 contraprova
17 reconciliar + cristalizar + continuar

Se não há informação nova: NÃO inventar respiração 18.

===========================================================
2 — KANBAN É A FILA OPERACIONAL
===========================================================
KANBAN_SOURCE_OF_WORK=true

Toda ferida/tarefa deve possuir:
id | titulo | owner | setor | status | prioridade | dependências | evidence_ref | receipt_ref | writer | next_cursor

Estados: BACKLOG | READY | RUNNING | WAITING_DEPENDENCY | DEGRADED | BLOCKED | VERIFYING | DONE

Quando descobrir gap novo:
→ procurar item existente → se existir: atualizar
→ se não existir: criar item no owner/Kanban existente → deduplicar → priorizar

Quando executor ficar livre:
KANBAN → próximo READY compatível → assumir → executar → receipt → devolver para SOL

NÃO perguntar ao CHEFE: "A, B ou C?"
Se ordem já está explícita e a máquina consegue medir:
DECIDIR PELO MÉTODO E CONTINUAR.

===========================================================
3 — AUTONOMIA CONTÍNUA ATÉ 04:00
===========================================================
Enquanto horário < STOP_AT:
MEASURE → KANBAN → PICK_NEXT → DELEGATE → EXECUTE_VISIBLE → HUB_EVENT → TEST → COUNTERPROOF → RECEIPT → CRYSTALIZE → NEXT

Se uma frente terminou: procurar próxima lacuna. Não ficar ocioso.
Se não houver tarefa READY: executar GAP_SWEEP READ_ONLY.

===========================================================
4 — OVERCLOCK / 10 A 20 FRENTES
===========================================================
MAX_PARALLEL_READ_FRONTS=20
TARGET_PARALLEL_READ_FRONTS=10

Somente percepção/diagnóstico pode abrir muitas frentes.
Nunca ter 20 writers.
Todos os scanners devem retornar para owners existentes.

Setores:
01 HUB | 02 MCP | 03 API | 04 TOOLS | 05 HERMES | 06 COCKPIT | 07 LOGS | 08 GIT | 09 GITHUB | 10 CI | 11 VPS | 12 PM2 | 13 DEPLOY | 14 VSCODE | 15 NETWORK/TUNNELS | 16 DATABASE/SUPABASE | 17 WEBHOOKS | 18 JOBS/SCHEDULERS | 19 FILES/ASSETS | 20 SECURITY/DEPENDENCIES

Rendezvous obrigatório antes de mutação transversal.

===========================================================
5 — CI COMO ENXAME
===========================================================
Foco pesado em CI. Descobrir workflows existentes antes de criar.
CI deve medir em paralelo:
lint | typecheck | unit | integration | build | security | dependency | health | MCP catalog | Hub API | Cockpit | Hermes | deploy preflight | runtime health | domain/routes | webhooks | jobs | PM2 | artifact integrity | anti-regression

Reusar Actions/runners existentes.
Se um job falhar: capturar assinatura causal → owner → corrigir → rerun APENAS o necessário quando possível.

===========================================================
6 — PM2 / PROCESSOS
===========================================================
Inventariar todos os PM2/processos relevantes.
Para cada processo:
OWNER | PURPOSE | PORT | STATUS | UPTIME | RESTARTS | MEMORY | CPU | DEPENDENCIES | LOGS | HEALTH | KANBAN_ITEM

Se processo obrigatório estiver ausente: usar owner/config canônico para restaurar.
Se houver restart loop: não mascarar com restart infinito. Encontrar causa.

Jobs permanentes devem reutilizar: PM2 scheduler cron | owner gateway daemon | workflow webhook ou mecanismo já existente.
NÃO criar daemon duplicado.

===========================================================
7 — JOBS / CRON / WEBHOOK / EVENT FABRIC
===========================================================
Preferir EVENT-DRIVEN.
REMOTE: webhook/native event quando existir
LOCAL: watch/sensor quando necessário
RUNTIME: watchdog/health
SCHEDULE: cron/job somente quando evento não resolve

Todo job precisa:
OWNER | TRIGGER | INPUT | OUTPUT | TIMEOUT | RETRY_POLICY | IDEMPOTENCY | DEBOUNCE | REPLAY_GUARD | ANTI_RECURSION | LOG_CATEGORY | HUB_EVENT | KANBAN_LINK | RECEIPT

Se Hermes WebUI exigir gateway para scheduled jobs: verificar gateway existente → configurar owner correto → não criar segundo gateway.

===========================================================
8 — HUB PRIMEIRO
===========================================================
Tudo operacional passa pelo Hub como evento.
MCP TOOLS API CLI BOTS WEBHOOKS JOBS CI PM2 DEPLOY FILES NETWORK DATABASE NOTIFICATIONS HERMES VSCODE

Cada setor conserva log próprio.
HUB recebe estado consolidado.
Terminal: visão humana agora.
Hub: memória operacional.

===========================================================
9 — LOGS
===========================================================
Categorias oficiais:
hub | mcp | tool | api | webhook | deploy | git | github | ci | vscode | remote | runtime | process | database | supabase | hermes | notification | security | dependency | file | network | auth | performance | job | scheduler

Formato humano PT-BR + emoji.
Nunca imprimir segredo.

===========================================================
10 — LIMPEZA COM PROVA
===========================================================
CANDIDATOS: logs antigos | *.bak | *.old | temp | cache | build abandonado | artefato órfão

Só remover se TODOS:
AGE > 60 dias | NO_ACTIVE_CONSUMER=true | NO_CANONICAL_OWNER_NEEDS_IT=true | NO_PROVENANCE_NEEDS_IT=true | NOT_LAST_GOOD_STATE=true | NOT_RECEIPT_EVIDENCE=true | COUNTERPROOF=PASS

Primeiro: inventariar + provar.
Quando reversão fizer sentido: quarantine/archive antes.
Nunca apagar: secrets | DB viva | receipt necessário | evidence | backup único | estado canônico | artefato de rollback válido

Gerar receipt da limpeza.

===========================================================
11 — DEPENDÊNCIAS
===========================================================
Para cada ferramenta/app/processo:
PACKAGE | VERSION | OWNER | CURRENT | EXPECTED | VULNERABILITY | COMPATIBILITY | UPDATE_NEEDED

Atualizar somente com prova. Depois: build/test/runtime check.
Nada de update-all cego.

===========================================================
12 — VSCODE
===========================================================
Revalidar: Remote SSH | Remote Tunnel | Extension Host OOM | 3030 | 38269 | graph-panel | GitLens | GitHub extension | decorations | watchers | AGENTS.md truncation | provider fallback

Pode: instalar | atualizar | reparar | desabilitar extensão se a evidência pedir.
Registrar no Hub.

===========================================================
13 — PROVIDERS / 429 / FALLBACK
===========================================================
429 NÃO pode encerrar a missão inteira.
Quando provider/modelo atingir limite:
LOG → preservar sessão/receipt → localizar fallback disponível → trocar executor/modelo → CONTINUE_FROM_CHECKPOINT

Não reiniciar investigação do zero.
MODEL_IS_REPLACEABLE=true

===========================================================
14 — COCKPIT / PAINÉIS
===========================================================
Não mudar design estrutural existente.
Preservar as três peles oficiais: EMERALD | OPERATIONAL | FORGE
THEME_SWITCH != REDESIGN.
Não criar quarta pele sem ordem explícita.
Usar UI existente e ligar dados vivos nela.

Subcentrais: HUB | MCP | TOOLS | HERMES | DEPLOY | DATABASE | NOTIFICATIONS | LOGS | API/WEBHOOK | FILES | PROCESSES | SECURITY | JOBS | CI

Tudo visível.

===========================================================
15 — AUTOCONFIGURAÇÃO
===========================================================
Se recurso necessário estiver instalado porém não configurado:
DISCOVER → FIND OWNER → FIND CANONICAL CONFIG → CHECK DEPENDENCIES → APPLY MINIMAL CONFIG → TEST → LOG → RECEIPT

AUTO_CONFIGURE_WHEN_SAFE=true
Não inventar valor secreto.
Secret ausente: HUMAN_FRONTIER_SECRET_MISSING
Secret existente: runtime consome via owner sem exibir valor.

===========================================================
16 — CLI + BOTS + APPS + GATEWAYS
===========================================================
Mapear e integrar superfícies existentes:
Hermes CLI | VS Code | Bots | CentralDark Web | CentralDark Desktop | MCP API | Gateway | CI | Webhook | Schedulers

ALL_SURFACES → SAME_CORE → SAME_HUB → SAME_KANBAN → SAME_RECEIPTS
Nenhuma vira segundo cérebro.

===========================================================
17 — MAIN / COMMIT / DEPLOY
===========================================================
P1/P2/P3: não fazem canetada final transversal.
SOL recebe receipts.

SOL: DEDUPE → RECONCILE → PATCH → TEST → COUNTERPROOF → COMMIT → MAIN → VPS → DEPLOY → REMEASURE

DEPLOY_IF_BOOTABLE=true
Se runtime quebrado mas bootable: DEGRADED no ar + logs.

===========================================================
18 — CRISTALIZAÇÃO
===========================================================
Toda correção sobrevivente:
ERROR_SIGNATURE → ROOT_CAUSE → OWNER → FIX → TEST → COUNTERPROOF → RECEIPT → LEARNING → ANTI_REGRESSION_GATE → COMMIT → MAIN → FIXED_POINT

ANTI_REPEAT=true
Próximo agente deve descobrir isso antes de repetir.

===========================================================
19 — SE ACABAR TRABALHO
===========================================================
Não parar antes das 04:00 só porque o Kanban atual zerou.
Rodar GAP_SWEEP read-only em:
CI | runtime | dependencies | routes | ports | domains | MCP catalog | unused capabilities | missing tool | owners | mock data | dead integrations | orphan processes | stale config | failed jobs | webhooks | logs | receipts | docs drift | Git/VPS drift | Cockpit | security gates

Novo gap provado: → Kanban → owner → prioridade → executar se seguro e dentro do horário.

===========================================================
20 — 04:00
===========================================================
Até 04:00 continuar. Às 04:00:
NÃO iniciar delta novo.
Finalizar etapa em voo com segurança.
Receber receipts.
Atualizar Kanban.
Atualizar Hub.
SOL reconciliar.
Commitar somente estado consistente.
Deployar somente o que estiver bootable/validado.
Emitir relatório.

===========================================================
21 — SAÍDA FINAL
===========================================================
ROLE: SESSION: KANBAN_TOTAL: KANBAN_DONE: KANBAN_RUNNING: KANBAN_BLOCKED: FRONTS_EXECUTED: CI_FRONTS: JOBS_CREATED_OR_REUSED: PM2_PROCESSES: WEBHOOKS: SCHEDULED_JOBS: HUB: MCP: TOOLS: HERMES: COCKPIT: VSCODE: NETWORK: SUPABASE: GIT: MAIN: VPS: DEPLOY: SITE: DEPENDENCIES_UPDATED: EXTENSIONS_CHANGED: CLEANUP_CANDIDATES: CLEANUP_PROVEN: CLEANUP_EXECUTED: FILES_CHANGED: COMMITS: RECEIPTS: LEARNINGS: ANTI_REGRESSION_GATES: DEGRADED: UNKNOWN: HUMAN_FRONTIER: COUNTERPROOF: FIXED_POINT: NEXT_CURSOR:

⚖️ REALIDADE É O JUIZ.

---
BOOT: ⭕ AURÉOLA → 👑🪬 CENTRALDARK → 17 RESPIRAÇÕES → KANBAN → MEGAZORD → CI/PM2/JOBS → SOL_CONVERGENCE
Fio da missão: Kanban alimenta o enxame → Hub registra → SOL cristaliza → main → VPS → deploy → gap sweep → repetir até 04:00.
