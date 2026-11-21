# HANDOFF-DELTA-HERMES-COCKPIT-SENSOR-20261024

**Data/Hora (Bahia):** 2026-10-24 23:15 America/Bahia  
**Auditor:** Hermes (kanban t_13f64ec8) — leitura somente, owner Cockpit HUD  
**Escopo exclusivo:** este arquivo novo na pasta canônica. Não edita ForjaExecutor.tsx, cockpit.functions.ts, MCP, engine, OAuth, SKILL, scheduler, GitHub, SSH/VPS.

---

## Origens observadas (somente leitura)

| Fonte | Tipo | Status observado |
|-------|------|------------------|
| `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-CONTINUO-CENTRALDARK-REMOTE-20261024.md` | Handoff principal | Lido, referência ativa |
| `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-HERMES-TRACES-20261024.md` | Handoff traces anterior | Lido, 80 linhas, PASS |
| `K:\docs\ARQUITETURA\JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` | Lei canônica | Lido, 711 linhas |
| `K:\apps\instinto-superior\src\components\central\ForjaExecutor.tsx` | UI Cockpit (leitura) | Lido, 496 linhas, owner ChatGPT |
| `K:\apps\instinto-superior\src\lib\cockpit.functions.ts` | Sensor HUD (leitura) | Lido, 861 linhas, owner canônico |
| Hermes kanban `t_911e17ff` (show/runs) | Cartão mãe CentralDark | BLOCKED intencional, sem runs, children via t_5b386368 |
| Hermes kanban `t_928a8cbd` (show/runs) | Auditoria traces | DONE, run #89 completed, handoff criado |
| Hermes kanban `t_5b386368` (show/runs) | Integração CentralDark-Remote | READY, run #86 CRASHED (rc=0 sem chamada terminal), PR #1951 |
| Hermes kanban `t_25ea192c` / `t_5f53bd8c` | Filhas de t_5b386368 | TODO, dependency_wait (parent_not_done), workspaces relativos inválidos |

---

## Dados reais dos cartões (campos medidos)

### t_911e17ff — MÃE CENTRALDARK
```json
{
  "id": "t_911e17ff",
  "title": "CENTRALDARK MAE PERMANENTE - EXPANDIR CONHECIMENTO",
  "status": "blocked",
  "assignee": null,
  "workspace_kind": "dir",
  "workspace_path": "K:\\.agents\\skills\\centraldark-operational-method",
  "created_by": "chefe:centraldark-harness",
  "created_at": 1792892717,
  "children": ["t_25ea192c","t_5f53bd8c"],
  "runs": [],
  "body_destaque": "Registro-mãe permanente, identidade de coordenação, NÃO worker executável. Fica BLOCKED deliberadamente para impedir despacho do registro-mãe; o trabalho ocorre nos cartões filhos nativos usando --parent <ID>. NOTA: a identidade mãe permanece BLOCKED como índice, não significa que os filhos estejam bloqueados."
}
```

### t_928a8cbd — AUDITORIA TRACES (HERMES)
```json
{
  "id": "t_928a8cbd",
  "title": "CentralDark-Remote: auditoria paralela de traces e handoff sem conflito",
  "status": "done",
  "assignee": "default",
  "workspace_kind": "dir",
  "workspace_path": "K:\\scripts\\remote-bridge\\canonical",
  "runs": [{"id": 89, "status": "done", "outcome": "completed", "started_at": 1792892242, "ended_at": 1792892474}],
  "output_file": "K:\\scripts\\remote-bridge\\canonical\\HANDOFF-DELTA-HERMES-TRACES-20261024.md",
  "trace_fields_auditados": {
    "call_id": "NÃO DISPONÍVEL",
    "trace_id": "NÃO DISPONÍVEL",
    "task_id": "DISPONÍVEL",
    "run_id": "PARCIAL",
    "status": "DISPONÍVEL",
    "duracao": "PARCIAL"
  }
}
```

### t_5b386368 — INTEGRAÇÃO CENTRALDARK-REMOTE
```json
{
  "id": "t_5b386368",
  "title": "CentralDark-Remote: corrigir nome, OAuth/pareamento, owner MCP e E2E",
  "status": "ready",
  "assignee": "default",
  "workspace_kind": "dir",
  "workspace_path": "K:\\_worktrees\\centraldark-remote-name-migration-20261024",
  "runs": [{"id": 86, "status": "crashed", "outcome": "crashed", "protocol_violation": true, "exit_code": 0, "error": "worker exited cleanly (rc=0) without kanban_complete, kanban_block or kanban_request_review"}],
  "children": ["t_25ea192c","t_5f53bd8c"],
  "pr_created": "#1951",
  "commit_head": "78c7f1952d",
  "blocker": "engine nativo 9101 não rodando (engine_connected=false)",
  "naming_migration": "COMPLETA (4 arquivos, PR #1951)"
}
```

### t_25ea192c — Owner MCP config verification
```json
{
  "id": "t_25ea192c",
  "status": "todo",
  "unsatisfied_parents": [{"id": "t_5b386368", "status": "ready"}],
  "workspace_kind": "worktree",
  "workspace_path": "K:.worktrees\\t_25ea192c",
  "problema": "workspace_path RELATIVO INVÁLIDO (K:.worktrees\\) impede despacho"
}
```

### t_5f53bd8c — Native E2E proof
```json
{
  "id": "t_5f53bd8c",
  "status": "todo",
  "unsatisfied_parents": [{"id": "t_5b386368", "status": "ready"}],
  "workspace_kind": "worktree",
  "workspace_path": "K:.worktrees\\t_5f53bd8c",
  "problema": "workspace_path RELATIVO INVÁLIDO (K:.worktrees\\) impede despacho"
}
```

---

## Contraprova: Mãe BLOCKED vs Filhas READY

**Observado:**  
- `t_911e17ff` (mãe) está `blocked` **intencionalmente** como índice de coordenação. O body diz explicitamente: *"a identidade mãe permanece BLOCKED como índice, não significa que os filhos estejam bloqueados"*.
- `t_5b386368` (pai executável das filhas) está `ready`, não `done`.
- `t_25ea192c` e `t_5f53bd8c` estão `todo` com `unsatisfied_parents: [{"id":"t_5b386368","status":"ready"}]`.

**Causa real do travamento:**  
O scheduler Hermes bloqueia filhos quando o pai **não está DONE** (dependency_wait: parent_not_done). Não é o estado BLOCKED da mãe `t_911e17ff` que trava; é o pai `t_5b386368` não ter completado (run #86 CRASHED por violação de protocolo).

**Agravante:**  
As filhas têm `workspace_path` relativo inválido (`K:.worktrees\...`). Mesmo se o pai estivesse DONE, o despacho falharia. Worktrees devem ser absolutas: `K:\_worktrees\...`.

---

## Menor procedimento para filhos passarem pela mãe sem travar scheduler

1. **NÃO alterar `t_911e17ff`** — deve permanecer BLOCKED por design (índice estável).
2. **Completar `t_5b386368`** — executar run válido que chame `kanban_complete` (ou `kanban_request_review`) no terminal. Run #86 falhou por sair rc=0 sem chamada terminal.
3. **Corrigir workspaces das filhas** — mudar `K:.worktrees\...` para `K:\_worktrees\...` absolutos antes de despachar.
4. **Teste apenas leitura** — `kanban show t_25ea192c --json` e `kanban show t_5f53bd8c --json` confirmam dependency_wait; não despachar até pai DONE + workspace corrigido.

---

## Mapeamento para Cockpit HUD (painel MISSÕES/EXECUÇÕES/FILHAS/BLOQUEIOS/SETOR/FASES)

| Conceito Cockpit | Fonte real medida | Como derivar |
|------------------|-------------------|--------------|
| **Missão** | `kanban list --json` → tasks com `id` `t_[a-f0-9]{8}` | `title`, `status`, `assignee`, `created_at`, `started_at`, `completed_at` |
| **Execução** | `runs[]` do `kanban show ID --json` | `run.id`, `run.status`, `run.outcome`, `run.started_at`, `run.ended_at`, `run.metadata` |
| **Filhas** | `children[]` + `unsatisfied_parents` | Filtrar tasks onde `parents` contém ID da mãe; `vinculo` = NATIVO se em `children` da mãe, DECLARADO se título menciona, LEGADO caso contrário |
| **Bloqueios (Chefe)** | `status` ∈ `["blocked","failed"]` + `last_failure_error` | Extrair código alfanumérico do erro (`/^[A-Z][A-Z0-9_]{3,55}/`); se não houver código → `BLOQUEIO_A_CONCILIAR` |
| **Setores (Owners)** | `workspace_path` última pasta | `split(/[\\/]/).filter(Boolean).pop()` → ex: `centraldark-operational-method`, `remote-bridge-canonical`, `centraldark-remote-name-migration-20261024` |
| **Fases** | `current_step_key` (se houver) + critérios do body | `faseAtual = current_step_key`; `fasesRestantes = null` (sem contrato de etapas total, não inventar porcentagem) |
| **Contagem não medida** | Se campo ausente no JSON | Status = **NÃO MEDIDO** (não inventar número) |

**Exemplo derivado dos dados reais:**
- Missão mãe: `t_911e17ff` | BLOCKED | setor: `centraldark-operational-method` | fase: índice/coordenação
- Auditoria traces: `t_928a8cbd` | DONE | setor: `remote-bridge-canonical` | fase: handoff criado
- Integração: `t_5b386368` | READY (run CRASHED) | setor: `centraldark-remote-name-migration-20261024` | fase: naming migration completa, aguardando engine 9101
- Filhas: `t_25ea192c` TODO (dep wait), `t_5f53bd8c` TODO (dep wait) | setor: `NÃO DEFINIDO` (workspace relativo inválido)

---

## Fontes de dados do Cockpit (cockpit.functions.ts) — auditoria de proveniência

| Campo HUD | Fonte real | Prova | Status |
|-----------|------------|-------|--------|
| `apiHealth` | `GET /health` (api.centralldark.com) | HTTP 200 + `status=ok` | MEDIDO |
| `heartbeat` | `GET /heartbeat` + `self=stale` → FAIL | HTTP + body JSON | MEDIDO |
| `liveFabric` | `GET /api/live-fabric/status` | HTTP + `git.head` (vpsSha) | MEDIDO |
| `grafoVivo` | `GET /api/live-fabric/graph` | HTTP | MEDIDO |
| `omniRouter` | `GET /api/omni/status` | HTTP | MEDIDO |
| `omniModels` | `GET /api/omni/models` | HTTP | MEDIDO |
| `receipts` | `GET /api/microdeploy/receipts/index.json` | HTTP | MEDIDO |
| `casaSite` | `GET http://127.0.0.1:8080/sala-controle` (casaOnly) | HTTP | MEDIDO |
| `screenpipe` | `GET http://127.0.0.1:3030/health` (host CASA) | HTTP + `status` + `dependencies` | MEDIDO |
| `screenpipeVps` | `GET http://TAILSCALE_IP:3030/health` (host VPS) | HTTP | MEDIDO |
| `tailscaleCasa` | `tailscale status --json` (execFile, Windows) | CLI JSON, peer `centraldark-os` ONLINE | MEDIDO |
| `actions` | GitHub Billing API (`GITHUB_TOKEN`) | REST authenticated | MEDIDO se token, AUTH_REQUIRED se não |
| `github` / `githubLovable` | GitHub API ou Conector Lovable | REST authenticated | MEDIDO se credencial, AUTH_REQUIRED se não |
| `vpsSha` / `mainSha` / `sincronizado` / `deltaVps` | Derivado de `liveFabric.git.head` + GitHub commits | Cálculo local | MEDIDO |
| `deploy` / `build` / `desktop` / `desktopVps` / `gmail` | **Sem sensor implementado** | — | **NÃO MEDIDO** |
| `screenpipeVideo` / `screenpipeAudio` | Derivado de `screenpipeCasa.frame_status` / `audio_status` | HTTP + parsing | MEDIDO se screenpipe PASS |

**Regra do sensor:** `UNKNOWN` permanece `UNKNOWN`; `HTTP 200` sem status reconhecido → `RUNNING`; `status=healthy` → `PASS`; `status=degraded` → `RUNNING`; erro de rede/timeout → `UNKNOWN`; `self=stale` no heartbeat → `FAIL`.

---

## Delta útil para o painel Cockpit

1. **Adicionar fonte `kanban` ao `EstadoCentralDark`** — expor `missoesMae` via `lerMissoesMaeCentralDark` (já existe em `cockpit.functions.ts`, linha 720-860) no HUD.
2. **Campo `chefebloqueio` padronizado** — usar extração de código de erro alfanumérico (já implementado no sensor linha 825).
3. **Setor = owner via `workspace_path`** — já implementado no sensor linha 818.
4. **Fases = `current_step_key` + contagem real** — `fasesRestantes` deve ficar `null` até haver contrato de etapas; não inventar %.
5. **Filhas com workspace inválido → flag `workspace_invalido`** — evita despacho fantasma.
6. **Mãe BLOCKED intencional → badge `INDICE` não `BLOQUEADA`** — distinguir no painel.

---

## Recomendações concretas

| Ação | Owner | Prioridade |
|------|-------|------------|
| Completar `t_5b386368` com run válido (`kanban_complete`) | Integração (ChatGPT) | ALTA |
| Corrigir `workspace_path` de `t_25ea192c` e `t_5f53bd8c` para absolutos `K:\_worktrees\...` | Integração | ALTA |
| Expor `lerMissoesMaeCentralDark` no ForjaExecutor.tsx (já existe no backend) | ChatGPT (UI) | MÉDIA |
| Adicionar coluna `workspace_valido` no painel filhas | ChatGPT (UI) | MÉDIA |
| Não promover `engine_connected=false` a PASS em nenhum painel | Todos | CONSTANTE |

---

## NEXT_CURSOR

1. Integração (ChatGPT): completar `t_5b386368` → run com `kanban_complete` terminal → pai DONE.
2. Integração: corrigir workspaces filhos → `K:\_worktrees\t_25ea192c-centraldark-remote-owner-mcp-config-veri` e `K:\_worktrees\t_5f53bd8c-centraldark-remote-native-e2e-proof-oaut`.
3. Integração: subir engine nativo 9101 → provar `engine_connected=true` + OAuth + `tools/list` + `centraldark_casa_read_file` + readback.
4. Cockpit (ChatGPT): consumir `lerMissoesMaeCentralDark` no ForjaExecutor.tsx; renderizar mãe com badge `ÍNDICE`, filhas com `workspace_valido`, bloqueios com código de erro.
5. Próxima auditoria: medir se `t_5b386368` atingiu DONE e se filhas despacharam.

---

**Fim do delta de auditoria.** Arquivo escrito em `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-HERMES-COCKPIT-SENSOR-20261024.md`.  
Seguinte missão-mãe: `t_911e17ff`. Nenhuma credencial ou stdout privado neste relatório.