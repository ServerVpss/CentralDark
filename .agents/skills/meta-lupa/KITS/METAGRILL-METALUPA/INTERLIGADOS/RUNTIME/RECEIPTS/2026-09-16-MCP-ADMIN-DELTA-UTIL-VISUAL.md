# 👁️🧾 MCP ADMIN · DELTA ÚTIL VISUAL · 2026-09-16

**OWNER:** `apps/modulos/mcp/src/admin.js`  
**PR_COMPATÍVEL:** `#1550 · NARRATED_TOOL_CALL_TRACE`  
**TRILHO:** `👑🪬 !CENTRALDARK → 🔗 INTERLIGADOS → MCP ADMIN → DELTA ÚTIL → TOOL-CALL RECEIPT ADAPTER`

---

## 🧿 Delta útil recebido

O próximo avanço não é despejar mais log bruto. O avanço é transformar o stream em visualização acionável:

```text
SSE bruto
→ agregador de delta útil
→ agrupamento por código/rota/mensagem
→ prioridade para falhas
→ detalhes expansíveis
→ hint de ação provável
→ stream bruto preservado
→ próximo cursor visível
```

---

## ✅ Source confirmado

```text
MAIN_COMMIT=cdebc8eed0ae59aef6dadb9c677756536175c5b9
MESSAGE=feat(mcp-admin): group log deltas and prioritize failures
PARENT=38ce303f645552e9bfea16c0df32d82dc51847a3
```

Mudança material esperada no painel:

```text
DELTA_GRID=true
DELTA_KPI_EVENTS=true
DELTA_KPI_UNIQUE_ERRORS=true
DELTA_TOP_REPETITION=true
DELTA_LAST_EVENT=true
DELTA_ROWS_GROUPED=true
RAW_STREAM_PRESERVED=true
```

---

## 🔴 Limite runtime

```text
SOURCE_MAIN_DELTA=PASS
PR1550_COMPAT_RECEIPT=PASS
RUNTIME_DEPLOY_VERIFIED_BY_THIS_CHAT=false
CI_HEAD_CDEBC8EED=UNKNOWN_OR_NOT_RETURNED_IN_THIS_SURFACE
```

A captura do CHEFE mostra deploy/fila/acompanhamento em outro trilho, mas este receipt não promove runtime sem medição direta do serviço implantado.

---

## 🔗 Encaixe no adapter

```text
MCP Admin /admin/logs/stream
→ deltaState
→ registrarDeltaUtil(evento)
→ renderDeltaUtil()
→ TOOL-CALL RECEIPT ADAPTER
→ META-START-LINK
→ NEXT_CURSOR
→ REALIDADE
```

---

## ⚖️ Cadeados

```text
LOG_BRUTO != DELTA_UTIL
VISUALIZACAO != EXECUCAO_PROVADA
SOURCE_MAIN != RUNTIME_DEPLOYED
ERRO_REPETIDO != ACAO_AUTOMATICA_SEM_OWNER
UNKNOWN != PASS
```

📜 **O painel não deve gritar mais alto; deve mostrar qual ferida merece a próxima mão.**
