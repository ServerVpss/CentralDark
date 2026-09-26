# DECISÃO: INTEGRAÇÃO DO TRILHO NO HERMES-CORE

## Contexto
O TRILHO é o **framework operacional** que preenche a lacuna entre:
- **FABLE LOOP** (calibração/calibração contínua)
- **MetaLupa** (veredito/auditoria crítica)
- **Execução real** (movimento entre passos)

O Hermes-Core hoje tem:
- Orchestrator (loop 5s, decisor, executor, critic, GraphRAG)
- Executor Agent (shell, darkai, aprender, git, worktree)
- Kanban Bridge (dispatcher único, claim-lock, workspace_path)
- Runtime Adapter (legacy-journal mode)
- MCP (110 tools)

**O que faltava:** a peça do meio — o **movimento disciplinado** entre passos, com:
- Lease físico por escrito (T3 do TRILHO)
- Gume antes do resultado (CARVE)
- Queda/reancoragem determinística (self-healing)
- Destilação → cristal (reflexo determinístico)

---

## DECISÃO DE INTEGRAÇÃO

### 1. ONDE O TRILHO VIVE NO HERMES-CORE

| Componente | Integração TRILHO | Arquivo Alvo |
|------------|-------------------|--------------|
| **Orchestrator** | CARVE emitido antes de cada etapa; lease antes de delegar ao Executor; veredito no state.json | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| **Executor Agent** | Tool `lease` (acquire/release/validate); tool `carve` (emit/parse/verify); tool `fall/recover` | `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs` |
| **Kanban Bridge** | Task.claim_lock ↔ lease; task.workspace_path ↔ CARVE carry; task.status ↔ veredito | `apps/modulos/hermes-webui/api/kanban_bridge.py` |
| **Runtime Adapter** | start_run emite CARVE ÂNCORA; observe_run retorna GUME/VEREDITO | `apps/modulos/hermes-webui/api/runtime_adapter.py` |
| **MCP Tools** | Tool `lease_acquire` / `lease_release` / `carve_emit` / `carve_verify` | `apps/modulos/mcp/dist/tools/...` |

---

### 2. DELTA MÍNIMO POR COMPONENTE

#### A) Orchestrator (`orchestrator.mjs`)
```javascript
// ANTES de cada etapa:
const lease = await leaseAcquire({ scope: `mission:${slug}:step:${etapa}`, writer: 'orchestrator', pid: process.pid });
const carve = emitCarve({ ancora: { missao, head, etapa, writer: 'orchestrator' }, curva: {...}, gume: {...} });
await writeCarve(carve);

// DEPOIS do resultado + critic:
const veredito = vereditoFromCritic(resultado, parecer);
await updateCarveVeredito(carve.id, veredito);
await writeState({ ...state, carves: [...state.carves, carve] });
await leaseRelease(lease.id);
```

#### B) Executor Agent (`agent.mjs`)
```javascript
// Novas ferramentas:
case 'lease_acquire': { ... }
case 'lease_release': { ... }
case 'lease_validate': { ... }
case 'carve_emit': { ... }
case 'carve_verify': { ... }
case 'fall_recover': { ... } // reancoragem automática
```

#### C) Kanban Bridge (`kanban_bridge.py`)
```python
# Task creation já tem workspace_path, claim_lock
# Adicionar campos no task:
carve_id: str | None
carry: str | None
gume: str | None
veredito: 'PISO'|'GELO'|'PAREDE'|'QUEDA'|'FENDA'|'CRISTAL'
lease_id: str | None
```

#### D) Runtime Adapter (`runtime_adapter.py`)
```python
@dataclass
class StartRunRequest:
    ...
    carve_ancora: CarveAncor  # opcional, emitido pelo caller

@dataclass
class RunStartResult:
    ...
    carve_id: str | None
    gume: str | None
```

---

### 3. NOVAS TOOLS MCP (Delta Mínimo)

| Tool | Função | Reutiliza |
|------|--------|-----------|
| `lease_acquire` | Adquire lease físico (arquivo lock) | `vps_write_file_safe` + `vps_read_file_safe` |
| `lease_release` | Libera lease | idem |
| `lease_validate` | Verifica se lease ainda válido | idem |
| `carve_emit` | Emite CARVE canônico (5 linhas) | `vps_write_file_safe` |
| `carve_verify` | Verifica GUME/VEREDITO de um CARVE | `vps_read_file_safe` |
| `fall_recover` | Executa reancoragem (REFIXAR→REBAIXAR→REENTRAR) | orquestra tools acima |

---

### 4. STATE.JSON EXTENSÃO

```json
{
  "missao": "...",
  "historico": [...],
  "retomadas": 0,
  "carves": [
    {
      "id": "carve-001",
      "ancora": { "missao": "M-001", "head": "a1c609c", "etapa": 7, "writer": "orchestrator" },
      "curva": "vou conferir se X e Y são mesmo alvo",
      "gume": "só aceito hash-object idêntico OU conteúdo byte-a-byte",
      "veredito": "CONTRA",
      "carry": "dois alvos distintos com nome colidido; nada foi fundido",
      "timestamp": "2026-08-23T02:54:05Z",
      "lease_id": "lease-4412"
    }
  ],
  "leases_ativos": [
    { "id": "lease-4412", "scope": "mission:M-001:step:7", "writer": "orchestrator", "pid": 4412, "ttl": 300, "expira_em": "2026-08-23T02:59:05Z" }
  ],
  "terminal_state": "RUNNING",
  "terminal_reason": null
}
```

---

## 5. REGRAS DE NÃO-REGRESSÃO

| Regra | Implementação |
|-------|---------------|
| **Sem CARVE, sem movimento** | Orchestrator valida `carve_emit` antes de `executar()` |
| **Gume antes do resultado** | `carve_emit` exige `gume` não-vazio; `executar` falha sem `carve_id` válido |
| **Lease antes de mutação** | `vps_write_file_safe`, `git commit_push`, `worktree create` exigem `lease_validate` |
| **Veredito no state.json** | `state.json` sempre tem `carves[]` com veredito preenchido |
| **Queda = reancoragem** | Se `veredito === 'QUEDA'` → `fall_recover` automático antes de continuar |
| **Cristal = reflexo** | `crystal_verify` antes de reusar regra/gate cristalizado |

---

## 4. CRONOGRAMA DE DELTA (Mínimo Viável)

| Fase | Ação | Arquivos | Teste |
|------|------|----------|-------|
| **1** | Adicionar `lease_acquire/release/validate` no Executor | `agent.mjs` | `lease_acquire` → `lease_validate` → `lease_release` |
| **2** | Adicionar `carve_emit/verify` no Executor | `agent.mjs` | `carve_emit` → `carve_verify` (gume/veredito) |
| **3** | Orchestrator emite CARVE antes de delegar | `orchestrator.mjs` | `state.json` tem `carves[]` |
| **4** | Kanban Bridge expõe `carve_id`, `lease_id`, `veredito` | `kanban_bridge.py` | Task criada com campos TRILHO |
| **5** | MCP tools `lease_*` + `carve_*` expostas | `mcp/dist/tools/...` | Tools listadas em `/status.json` |
| **6** | Teste E2E: missão com CARVE + lease + veredito | Integração | Kanban task com `carve_id` + `veredito=PISO` |

---

## 5. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Lease trava sistema se processo morre | Média | Alto | TTL curto (5min) + `lease_validate` checa processo vivo |
| CARVE vira burocracia sem valor | Baixa | Médio | Gume obrigatório + veredito obrigatório = valor imediato |
| Duplicação de lease/kanban claim | Baixa | Baixo | `claim_lock` do Kanban ↔ lease sincronizados no Orchestrator |
| Overhead de CARVE em passos triviais | Média | Baixo | Passos triviais = CARVE mínimo (1 linha gume) + veredito rápido |

---

## APROVAÇÃO

Esta integração **não cria sistema paralelo**. Reutiliza:
- Kanban claim_lock → lease físico
- Orchestrator state.json → rastro de CARVEs
- Executor tools → lease/carve/fall
- MCP tools → exposição controlada
- Kanban Bridge → campos TRILHO

**Delta mínimo, reutilização máxima, zero sistema paralelo.**

---

## PRÓXIMO PASSO

Quando CHEFE autorizar: **Fase 1** — implementar `lease_acquire/release/validate` no Executor Agent (arquivo único, 3 tools, teste unitário rápido).