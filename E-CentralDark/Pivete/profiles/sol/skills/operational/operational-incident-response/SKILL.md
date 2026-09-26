---
name: operational-incident-response
description: "VPS offline, MCP crash, secret leak → parallel fix."
version: 1.0.0
author: Pivete
platforms: [windows, linux]
metadata:
  hermes:
    tags: [incident-response, vps, mcp, forense, delegação, secret-leakage, fragment-handling]
    related_skills: [centraldark-casa-operations, centraldark-vps-operations, vps-reboot-forensic, meta-lupa, absolute-lock-protocol]
---

# Operational Incident Response

Protocolo de resposta a incidentes operacionais na Casa CentralDark.

## Princípios Fundamentais

### 1. MEDIR ANTES DE AFIRMAR
- `MEASURE → DIAGNOSE → CAUSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF`
- UNKNOWN != PASS. ACTION != PROOF. HISTORY != CURRENT_STATE.
- Imagem que não processa → LER POR PATH (vision_analyze/read_file).

### 2. FRAGMENT HANDLING PROTOCOL
- **NUNCA aceitar script fragmentado** (linha a linha via paste).
- Exigir script completo com `PY` final ou `PYTHON` final antes de executar.
- Se fragmento: "Para de colar fragmento. Manda script completo ou intenção em uma frase."
- Se mexe em secret: NÃO EXECUTAR, não processar, não repetir.
- **TRAVA ABSOLUTA**: Se fragmento contém secret + target offline + incompleto → recusa única, suprime repetições, exige intenção em uma frase. Ver `absolute-lock-protocol`.

### 3. SECRET LEAKAGE PROTOCOL
- Secret exposto: NÃO LER, NÃO REPETIR, NÃO PROCESSAR.
- Resposta: "Secret detectado. Trava dura: não leio, não exponho, não rodo."
- Ação: Rotacionar secret. Atualizar apenas no secret store/config local.
- Nunca registrar valor em docs/receipts/logs.

### 4. VPS OFFLINE PROTOCOL
- VPS offline (SSH timeout, MCP 502): Estado = UNKNOWN da Casa.
- **NÃO SIMULAR** execução na VPS.
- Braço VPS executa lá; Casa só mede o que alcança.
- Delegar para `centraldark-vps-operations` ou `vps-reboot-forensic` quando voltar.

### 5. MCP CRASH-LOOP DEBUG PROTOCOL
- MCP roda `dist/index.js` (compilado), NÃO `src/`.
- Bug TDZ = import circular ESM.
- Fix: Restaurar `mcp-admin.js` e `tools-catalog.js` de `origin/main` + rebuild `dist/`.
- `pm2 pid` = legítimo; órfão na porta = sintoma, não causa.

### 5b. MCP CONTRACT MISMATCH DIAGNOSTIC (nova frente)
Quando MCP falha, não atribuir só à queda do VPS. Cruzar os dois lados do contrato:

```
LADO A — Codex/local: endpoint, auth, env MCP_CENTRALDARK_TOKEN
LADO B — Servidor MCP: rota esperada (/admin/mcp vs /mcp/admin), auth esperado (Bearer Token escopo admin vs senha)
```

Um mismatch de contrato produz falha distinta de "serviço offline". Registrar qual lado está divergente antes de decidir deploy/restart.

### 5c. INVESTIGAÇÃO DE LISTENER — campo de evento, não mensagem
Se o grep antigo procurava `message:mcp_listening`, invalidar e refazer com `event:mcp_listening`.
Achetar `event:hub_mission_consumer_started` e vincular workerId → PID antes de decidir restart ou instrumentação.
Receita completa: `references/mcp-listener-lifecycle-investigation.md`.

### 6. ROUTER VERIFICATION PROTOCOL
- Router 8099 = chat real (`POST /v1/chat/completions` 200).
- Router 8199 = health/daemon (501 no POST).
- Teste: `POST /v1/chat/completions` com `nous/tencent/hy3:free` → "Oi", ~3430ms, `fallback_used:false`, `engine:nous`.

### 7. CI ERROR HANDLING
- PR #1201: título deve começar com emoji (ex: ✅).
- `agent-core-adapters.test.mjs`: adicionar `@engine CLAUDE` + `@core-route LEIA-ME-IA.md` no `CLAUDE.md`.
- Push auth: credencial MSYS expirada (gh token ok).

### 8. SECRET LEAKAGE RESPONSE
- Secret exposto: ROTATE IMEDIATAMENTE.
- Não registrar valor em docs/receipts/logs.
- Atualizar apenas no secret store/config local.

### 9. DELEGAÇÃO PARALELA (delegate_task)
- Máximo 3 tasks simultâneas (`max_concurrent_children=3`).
- Agrupar frentes relacionadas em batches de 3.
- `live_transcripts`: `tail -f E:\CentralDark\Pivete\cache\delegation\live\deleg_XXX\task-N.log`.
- Resultados consolidados retornam quando TODOS terminam.

### 10. RECONCILIAÇÃO CASA↔REPO↔VPS
- Medir 3 lugares: CASA (E:\), REPO (GitHub), VPS (/root/CentralDark).
- `casa-github-sync` faz o padrão; absorver delta no owner, não criar skill.
- `mergeable=true` ≠ intenção. PR #1172 violou: colisão, mecanismo novo, dono duplicado.

## Referências
- `references/vps-incident-2026-08-27.md`
- `references/mcp-tdz-fix.md`
- `references/fragment-handling.md`
- `references/secret-leakage-response.md`
- `references/mcp-listener-lifecycle-investigation.md` — receita condensada de investigação de listener lifecycle: T0/T1 obrigatórios, invalidações, atribuição de ouvinte → processo (grep por `event:`, bind workerId→PID), distinção false green × listener perdido, próximo cursor quando VPS desconhecida.