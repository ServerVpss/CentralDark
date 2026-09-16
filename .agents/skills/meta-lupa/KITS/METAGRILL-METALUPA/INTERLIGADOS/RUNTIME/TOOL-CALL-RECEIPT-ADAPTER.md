# 🔊🧾 TOOL-CALL RECEIPT ADAPTER · RUNTIME INTERLIGADO

**OWNER:** `.agents/skills/meta-lupa/SKILL.md`  
**PR:** `#1550 · NARRATED_TOOL_CALL_TRACE`  
**TRILHO:** `👑🪬 !CENTRALDARK → 🔗 !># INTERLIGADOS → 🔊 TOOL-CALL → 🧾 RECEIPT → ⚖️ REALIDADE`  
**STATUS:** contrato de interligação/visualização. Não prova runtime Casa/VPS sem remedição viva.

---

## 🎯 Intenção

Interligar **VPS + Screenpipe + Remote Control/Remote Tray + MCP Admin + Google Drive + conectores** em um ponto único de observabilidade de tool-calls e receipts, sem criar segundo cérebro, segundo router, segundo MCP, segundo hub, segundo tray ou segundo state.

O adapter deve melhorar a visualização de chamadas de ferramenta e manter a intenção resiliente entre agentes, contas e transportes.

```text
TOOL_CALL
→ TOOL_EVENT
→ INTENT_SYNC
→ AUDIT_EVENT
→ RECEIPT_CANDIDATE
→ CORRELATION_ID
→ META-START-LINK
→ NEXT_CURSOR
→ HUD / MCP ADMIN / REMOTE TRAY / DRIVE / PR
```

---

## 🧠 Peças reaproveitadas

```text
META-LUPA                         = olho canônico / contraprova
NARRATED_TOOL_CALL_TRACE           = crônica curta ao redor da chamada
MCP auditToolExecution             = fronteira de execução MCP
MCP audit-logger.js                = log sanitizado da chamada
/admin/logs/stream                 = observabilidade ao vivo
MASTER-CYCLE trace_and_harvest     = causal trace / evidence envelope
META-START-LINK                    = posição → direção → proveniência → delta → confiança → cursor
FRONTEIRA-CASA-VPS                 = runtime só passa se medir agora
API-TOOL-RESOURCE-BRIDGE           = /response/turnX é temporário, não fonte durável
REMOTE TRAY / REMOTE CONTROL       = transporte local/visibilidade, não autoridade
SCREENPIPE                         = memória visual/áudio/desktop quando medido
GOOGLE DRIVE                       = biblioteca/documentação persistente, não juiz runtime
MCP ADMIN / HUB                    = painel derivado e operador de capacidades
```

---

## 🔄 Sync bidirecional em um só local

```text
Google Drive / Docs / Sheets
        ↕
CONNECTOR EVENT NORMALIZER
        ↕
MCP TOOL-CALL RECEIPT ADAPTER
        ↕
MCP ADMIN / HUB DE CONTAS
        ↕
REMOTE TRAY / REMOTE CONTROL
        ↕
VPS / CASA / SCREENPIPE / HERMES
```

Regras:

```text
DRIVE_WRITE_REQUESTED        → gerar candidate/receipt, não verdade automática
CONNECTOR_RESULT             → registrar tool_event sanitizado
MCP_AUDIT_EVENT              → registrar fronteira de execução
REMOTE_TRAY_SIGNAL           → registrar presença/capacidade, não autoridade
SCREENPIPE_CAPTURE           → registrar observação visual/áudio, não prova final
VPS_PROCESS_PORT_LOG         → prova runtime somente se medido agora
PR_COMMIT_RECEIPT            → source/proveniência, não deploy
```

---

## 🛰️ Interligação VPS + Screenpipe + Remote Control

```text
VPS
├─ MCP 9100 / /mcp / /health / /tools.json
├─ audit-logger.js
├─ /admin/logs/stream
├─ tunnel-client / Caddy / transporte externo quando medido
├─ Hermes / agentes / tools
└─ receipts / logs / evidence

CASA / REMOTE CONTROL
├─ Remote Tray
├─ Desktop Commander / Remote MCP
├─ device presence
├─ IPC para HUD/Cockpit
└─ comandos autorizados por capacidade

SCREENPIPE
├─ observação de tela/áudio/desktop
├─ timeline visual
├─ correlação por timestamp/correlation_id
└─ evidência auxiliar até casar com audit/receipt
```

Fluxo:

```text
AGENTE OU USUÁRIO ACIONA CAPACIDADE
→ MCP recebe tool-call
→ auditToolExecution registra boundary
→ audit-logger sanitiza
→ adapter normaliza tool_event
→ Screenpipe pode correlacionar visualmente
→ Remote Tray mostra estado local/remoto
→ MCP Admin/HUB exibe AO_VIVO / POR_MISSÃO / FORENSE
→ Drive/PR recebem somente receipt/cursor aprovado
→ Meta-Lupa contraprova
→ Realidade julga
```

---

## 👁️ Visualização unificada

```text
👁 AO_VIVO
→ chamada chegando em ordem temporal
→ status queued/running/ok/failed/blocked/unknown
→ connector/tool/latência/correlation_id

🧠 POR_MISSÃO
→ agrupa chamadas equivalentes
→ liga intenção, dono, executor, ferramenta e receipt
→ mostra NEXT_CURSOR

🔎 FORENSE
→ input/output sanitizados
→ erro, duração, retry/fallback
→ fonte: UI/API/MCP/RUNTIME/PR/DRIVE
→ prova e contraprova associadas
```

---

## 🧾 Schema mínimo

```json
{
  "schema": "centraldark.tool-call-receipt-adapter.v1",
  "source": "mcp|api_tool|ui|remote_tray|screenpipe|github|drive|runtime",
  "observed_at": "ISO-8601",
  "connector": "GitHub|Google Drive|Gmail|MCP|Remote Desktop Commander|null",
  "tool_name": "string",
  "mission_id": "string|null",
  "request_id": "string|null",
  "trace_id": "string|null",
  "correlation_id": "string|null",
  "input_sanitized": {},
  "output_sanitized": {},
  "duration_ms": null,
  "status": "queued|running|ok|failed|blocked|unknown",
  "proof_level": "ui_observed|tool_response|audit_event|receipt_matched|runtime_measured",
  "receipt_ref": "string|null",
  "next_cursor": "string|null",
  "runtime_truth": false
}
```

---

## ⚖️ Cadeados

```text
UI_OBSERVED              != EXECUTION_PROVEN
SCREENPIPE_OBSERVED      != EXECUTION_PROVEN
DRIVE_SYNCED             != RUNTIME_RUNNING
REMOTE_TRAY_ONLINE       != COMMAND_EXECUTED
MCP_TOOL_LISTED          != TOOL_ACTIVE
AUDIT_EVENT_RECORDED     = EXECUTION_BOUNDARY_OBSERVED
RECEIPT_MATCHED          = PROOF_FOR_MATCHED_CLAIM
RUNTIME_MEASURED_NOW     = TEMPORAL_RUNTIME_EVIDENCE
UNKNOWN                  != PASS
```

---

## 📡 Estado desta cristalização

```text
GITHUB_PR_1550                         = SOURCE
MCP_ARQUITETURA_TOOL_CALL_LENS          = SOURCE
MASTER_CYCLE_TRACE_AND_HARVEST          = SOURCE
FRONTEIRA_CASA_VPS                      = SOURCE
API_TOOL_RESOURCE_BRIDGE                = SOURCE
FILES_TOOL_CALL_DATA_JSON               = SOURCE
LIBRARY_REMOTE_TRAY_HISTORY             = SOURCE
GOOGLE_DRIVE_SEARCH                     = EXECUTED
REMOTE_DESKTOP_COMMANDER_NOW            = NO_DEVICES_AVAILABLE_IN_THIS_CHAT
VPS_RUNTIME_NOW                         = UNKNOWN
CASA_RUNTIME_NOW                        = UNKNOWN
SCREENPIPE_RUNTIME_NOW                  = UNKNOWN
```

---

## 🧭 Próximo cursor

```text
Quando Remote Control ou VPS estiver comunicável:
1. medir MCP 9100 /health e /tools.json;
2. medir /admin/logs/stream;
3. medir processo Remote Tray / Remote Control;
4. medir Screenpipe e porta/timeline real;
5. emitir tool-call teste read-only;
6. casar tool_event ↔ audit_event ↔ screenpipe_event ↔ receipt;
7. só então promover RUNTIME_NOW de UNKNOWN para PASS/FAIL.
```

📜 **Narrativa não é prova. Adapter não é juiz. O ouro é a chamada que volta com recibo e aguenta contraprova.**
