# 🧠 CENTRALDARK Desktop Total — Instância de Delegação v2.0

## 📌 Identificação

```
INTENT_ID: CENTRALDARK-DESKTOP-TOTAL-20261019
GOAL: "Janela única do Desktop (CentralDark.exe) com Cockpit, Builder Bolt e TelePainel integrados"
OWNER: pivete (user_123)
STATUS: PREFLIGHT
NEXT_ACTION: DEDUP_KANBAN_PARENT
```

**Referência:** GitHub PR #1873 (goal_judge pending)

---

## 🎯 Subgoals Registrados

| ID | Subgoal | Entrega | Dono | Terminal | Status |
|---|---|---|---|---|---|
| **A** | Desktop Electron | Janela única com Cockpit | Electron/Bolt | BUILDER | 🔴 NOT_STARTED |
| **B** | Cockpit Menus | Builder Bolt + TelePainel itens | Instinto Superior | CLAUDE | 🔴 NOT_STARTED |
| **C** | Builder Bolt Editor | Editor + preview em tempo real | Bolt | BUILDER | 🔴 NOT_STARTED |
| **D** | TelePainel Rotas | Permissões + botões + navegação | TelePainel | CLAUDE | 🔴 NOT_STARTED |
| **E** | Compilação Total | Testes + primeiro instalador | Pipeline | CODEX | 🔴 NOT_STARTED |

---

## 📦 Estado Atual Mapeado

```
┌─────────────────────────────────────────────────────┐
│ ✅ MAPEAMENTO=PASS                                   │
├─────────────────────────────────────────────────────┤
│ • CentralDark.exe: C:\Users\Administrador\...       │
│ • Builder Bolt code: K:\apps\modulos\Bolt\source   │
│ • Cockpit code: K:\apps\instinto-superior          │
│ • TelePainel code: K:\src\funcionalidades\...      │
│ • Worktrees: ✅ reconciliado                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ✅ GOAL_NO_PR=REGISTRADO                             │
├─────────────────────────────────────────────────────┤
│ • PR #1873 aberto (draft)                          │
│ • 5 subgoals documentados                          │
│ • Donos identificados                              │
│ • goal_judge: PENDING (verificar)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔴 KANBAN_PARENT=AINDA_NÃO_CRIADO                    │
├─────────────────────────────────────────────────────┤
│ ❌ Task ID para coordenação: SEM TAREFA              │
│ ❌ Deduplicação: NÃO EXECUTADA                      │
│ ❌ Kanban dispatch: NÃO TESTADO                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔴 DELEGAÇÃO=AINDA_NÃO_EXECUTADA                     │
├─────────────────────────────────────────────────────┤
│ ❌ Builder ACK para subgoal A: pendente             │
│ ❌ Claude ACK para subgoal B: pendente              │
│ ❌ Builder ACK para subgoal C: pendente             │
│ ❌ Claude ACK para subgoal D: pendente              │
│ ❌ Codex ACK para subgoal E: pendente               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔴 BUILDER_TOTAL=AINDA_NÃO_COMPILADO                 │
├─────────────────────────────────────────────────────┤
│ ❌ Instalador com 5 peças integradas: SEM BUILD     │
│ ⚠️  CentralDark.exe existente: isolado               │
│ ⚠️  Sourcebase reconciliado, compilação: pendente    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Procedimento v2.0 — Passo a Passo

### FASE 1: PREFLIGHT (agora)

```
✅ REMEASURE_MAIN
   └─ MAIN_SHA: (necessário git readback)
   └─ PR_HEAD: feature/desktop-total-integration
   └─ dirty: (verificar)

✅ RESOLVE_SCOPE (subgoals → terminais)
   ├─ Subgoal A (Desktop): BUILDER (Electron owner)
   ├─ Subgoal B (Cockpit): CLAUDE (feature implementation)
   ├─ Subgoal C (Builder): BUILDER (Bolt owner)
   ├─ Subgoal D (TelePainel): CLAUDE (routing logic)
   └─ Subgoal E (Compilação): CODEX (CI runner)

✅ VALIDATE_GOAL_JUDGE
   └─ Verificar se goal_judge bloqueia (PR #1873 comentário)
   └─ Se bloqueado: registrar critério
   └─ Se desbloqueado: proceder

⏳ NEXT: PHASE 2
```

---

### FASE 2: DISCOVERY & DEDUP (próxima)

```
🔄 FIND_CAPABILITIES
   ├─ Builder capability: lovable_api + electron_build
   ├─ Claude capability: github_mcp + read/write code
   └─ Codex capability: npm + github_actions

🔄 RESOLVE_IDENTITY (pivete user_123)
   ├─ GitHub OAuth connection: (verificar status)
   ├─ Lovable OAuth: (se aplicável)
   └─ CI runner identity: (buildkite|github_actions)

🔄 VALIDATE_GITHUB_PERMISSION
   └─ repository: ServerVpss/CentralDark
   └─ permission: write (necessário para merge)
   └─ result: authorized|denied|unknown

🔄 DEDUP_KANBAN (CRÍTICO)
   ├─ Query: INTENT_ID=CENTRALDARK-DESKTOP-TOTAL
   ├─ Se encontrado:
   │  └─ REUTILIZAR TASK_ID existente
   │  └─ Verificar ACTIVE_WRITER (escrita única)
   │  └─ Proceder ao dispatch com mesmo cartão
   └─ Se não encontrado:
      └─ CRIAR nova TASK_ID para coordenação
      └─ Registrar parent goal
      └─ Criar 5 subtasks (A, B, C, D, E)

📋 KANBAN PARENT ESPERADO:
   ├─ TASK_ID: (gerado pelo Hermes)
   ├─ INTENT_ID: CENTRALDARK-DESKTOP-TOTAL-20261019
   ├─ GOAL: Janela única com Cockpit + Builder + TelePainel
   ├─ OWNER: pivete
   ├─ MAIN_SHA: (readback atual)
   ├─ PR_HEAD: feature/desktop-total-integration
   ├─ STATUS: in_progress
   ├─ ASSIGNED_TERMINAL: [BUILDER, CLAUDE, CODEX]
   ├─ SUBTASKS: [A, B, C, D, E]
   └─ ACTIVE_WRITER: hermes_kanban (coordenação)

⏳ NEXT: PHASE 3
```

---

### FASE 3: DIVISÃO DE ESCOPOS

```
📍 SCOPE A: Desktop Electron (BUILDER primary)
   ├─ Quem: Electron/Bolt team owner
   ├─ O quê: Janela do CentralDark.exe com Cockpit como body
   ├─ Onde: K:\apps\modulos\Bolt\source\app
   ├─ Como: Integrar menu handler para Builder + TelePainel
   ├─ Prova: Window renderiza Cockpit sem erro
   └─ Subtask ID: (criado por Hermes)

📍 SCOPE B: Cockpit Menus (CLAUDE primary)
   ├─ Quem: Instinto Superior developer
   ├─ O quê: Adicionar menuitem Builder Bolt e TelePainel ao CockpitShell
   ├─ Onde: K:\apps\instinto-superior\src\components\central\CockpitShell.tsx
   ├─ Como: Novo <NavButton> com rota e icon para cada setor
   ├─ Prova: Menu renderiza, links navegáveis
   └─ Subtask ID: (criado por Hermes)

📍 SCOPE C: Builder Bolt Editor (BUILDER secondary)
   ├─ Quem: Bolt editor owner
   ├─ O quê: Editor Lovable Code + preview em tempo real
   ├─ Onde: K:\apps\modulos\Bolt\source\app\components\Editor
   ├─ Como: Carregar projeto Lovable, sincronizar com GitHub
   ├─ Prova: Preview atualiza em <2s após edição
   └─ Subtask ID: (criado por Hermes)

📍 SCOPE D: TelePainel Rotas (CLAUDE secondary)
   ├─ Quem: TelePainel routing developer
   ├─ O quê: Rotas HTTP, permissões, botões navegação
   ├─ Onde: K:\src\funcionalidades\telepainel\routes.ts
   ├─ Como: Validar sessão CentralDark, herdar perms
   ├─ Prova: Navegação funciona, perms respeitadas
   └─ Subtask ID: (criado por Hermes)

📍 SCOPE E: Compilação Total (CODEX primary)
   ├─ Quem: CI/CD runner (buildkite|github_actions)
   ├─ O quê: Compile + testes + empacotar CentralDark.exe
   ├─ Onde: GitHub Actions + electron-builder
   ├─ Como: npm install → test → build → package
   ├─ Prova: Instalador .exe funcional com 5 peças
   └─ Subtask ID: (criado por Hermes)
```

---

### FASE 4: DISPATCH SAFE (depende de DEDUP ok)

```
🎛️ BUILDER dispatch (Subgoals A + C)
   ├─ Dry-run: hermes kanban dispatch --task-id=7999 --terminal=BUILDER --scope=desktop_electron
   ├─ Validar: ✅ escritor livre, ✅ escopo claro
   ├─ Executar: hermes kanban dispatch --task-id=7999 --terminal=BUILDER
   └─ Readback: ASSIGNED=builder_bolt, STATUS=RUNNING

🎛️ CLAUDE dispatch (Subgoals B + D)
   ├─ Dry-run: hermes kanban dispatch --task-id=7999 --terminal=CLAUDE --scope=cockpit_menus
   ├─ Validar: ✅ GitHub perm ok, ✅ MCP ready
   ├─ Executar: hermes kanban dispatch --task-id=7999 --terminal=CLAUDE
   └─ Readback: ASSIGNED=claude_code, STATUS=RUNNING

🎛️ CODEX dispatch (Subgoal E) — depende de A,B,C,D DONE
   ├─ Pré-requisito: Hermes aguarda PASS de A, B, C, D
   ├─ Dry-run: hermes kanban dispatch --task-id=7999 --terminal=CODEX --scope=build
   ├─ Validar: ✅ código merged, ✅ main SHA ok
   ├─ Executar: hermes kanban dispatch --task-id=7999 --terminal=CODEX
   └─ Readback: ASSIGNED=codex_runner, STATUS=RUNNING

⏳ NEXT: PHASE 5 (readback + observation)
```

---

### FASE 5: READBACK & OBSERVATION

```
📊 BUILDER (A + C) Readback
   ├─ TASK_ID: 7999
   ├─ ASSIGNEE: builder_bolt
   ├─ WORKSPACE: K:\apps\modulos\Bolt
   ├─ STATUS: RUNNING
   ├─ PROGRESS: Detectar commits em electron/app
   └─ ACK expectativa: "Integração iniciada, primeira janela compilável"

📊 CLAUDE (B + D) Readback
   ├─ TASK_ID: 7999
   ├─ ASSIGNEE: claude_code
   ├─ WORKSPACE: GitHub MCP
   ├─ STATUS: RUNNING
   ├─ PROGRESS: PR criado, menuitems adicionados
   └─ ACK expectativa: "Menus visíveis, rotas navegáveis no preview"

📊 CODEX (E) Readback — quando A,B,C,D DONE
   ├─ TASK_ID: 7999
   ├─ ASSIGNEE: codex_runner
   ├─ WORKSPACE: GitHub Actions
   ├─ STATUS: WAITING (pré-requisitos)
   ├─ PROGRESS: (aguardando merge de A,B,C,D)
   └─ ACK expectativa: "Build iniciado, CI green, .exe gerado"

⏳ NEXT: PHASE 6 (counterprove)
```

---

### FASE 6: COUNTERPROVE

```
🔍 BUILDER Effect Validation
   ├─ ✅ Desktop window abre?
   ├─ ✅ Cockpit carrega sem erro?
   ├─ ✅ Menus visíveis?
   ├─ ✅ Sem regressions em Electron?
   └─ Result: PASS|FAIL|UNKNOWN

🔍 CLAUDE Effect Validation
   ├─ ✅ Menuitem "Builder Bolt" clicável?
   ├─ ✅ Menuitem "TelePainel" clicável?
   ├─ ✅ PR #1873 approved?
   ├─ ✅ GitHub CI green?
   └─ Result: PASS|FAIL|UNKNOWN

🔍 CODEX Effect Validation
   ├─ ✅ npm install sucesso?
   ├─ ✅ Tests PASS (47/47)?
   ├─ ✅ Build sucesso?
   ├─ ✅ Instalador .exe gerado?
   ├─ ✅ Smoke test (abrir app + navegar) = PASS?
   └─ Result: PASS|FAIL|UNKNOWN

🎯 COUNTERPROVE RESULT:
   ├─ Se todos PASS → FINAL_RESULT = ✅ PASS
   ├─ Se qualquer FAIL → FINAL_RESULT = 🔴 FAIL (bloquear)
   └─ Se UNKNOWN → FINAL_RESULT = ❓ UNKNOWN (investigar)

⏳ NEXT: PHASE 7 (receipt)
```

---

### FASE 7: RECEIPT & NEXT_CURSOR

```json
{
  "INTENT_ID": "CENTRALDARK-DESKTOP-TOTAL-20261019",
  "GOAL": "Janela única CentralDark.exe com Cockpit + Builder Bolt + TelePainel",
  "OWNER": "pivete",
  "MAIN_SHA": "(readback em PHASE 2)",
  "PR_HEAD": "feature/desktop-total-integration",
  "ACTIVE_WRITER": ["builder_bolt", "claude_code", "codex_runner"],
  "ASSIGNED_TERMINAL": ["BUILDER", "CLAUDE", "CODEX"],
  "STATUS": "IN_PROGRESS",
  
  "RECEIPT": {
    "dispatched_at": "2026-10-19T16:00:00Z",
    "subgoal_acks": {
      "A_desktop": "RUNNING|BLOCKED",
      "B_cockpit": "RUNNING|BLOCKED",
      "C_builder": "RUNNING|BLOCKED",
      "D_telepainel": "RUNNING|BLOCKED",
      "E_compilation": "WAITING|RUNNING|BLOCKED"
    },
    "counterprove": {
      "builder_effect": "PASS|FAIL|UNKNOWN",
      "claude_effect": "PASS|FAIL|UNKNOWN",
      "codex_effect": "PASS|FAIL|UNKNOWN",
      "final": "PASS|FAIL|UNKNOWN|BLOCKED"
    },
    "evidence": {
      "electron_build_log": "K:\\logs\\electron-build.log",
      "github_pr": "https://github.com/ServerVpss/CentralDark/pull/1873",
      "github_checks": "https://github.com/ServerVpss/CentralDark/actions",
      "installed_exe": "C:\\Users\\Administrador\\AppData\\Local\\Programs\\CentralDark\\CentralDark.exe",
      "smoke_test": "Desktop window opened, menus visible, navigation ok"
    },
    "next_cursor": null
  },
  
  "BLOCKED_ON": [
    "(se aplica) goal_judge criteria não satisfeito",
    "(se aplica) Builder falha na integração Electron",
    "(se aplica) Claude PR recusado em review",
    "(se aplica) Codex tests falham"
  ],
  
  "REFERENCES": [
    "GitHub PR #1873 (GOAL registrado)",
    "Kanban TASK_ID (criado em DEDUP)",
    "Subtasks A, B, C, D, E (criadas por Hermes)"
  ]
}
```

---

## 🚨 Critérios de Bloqueio (goal_judge)

```
❌ BLOQUEIA delegação se:
   ├─ goal_judge não atendido (registrar critério do PR #1873)
   ├─ MAIN não compilável (test suite falha em main)
   ├─ Worktrees não reconciliados
   └─ GitHub OAuth revogado

⚠️  AVISO se:
   ├─ CentralDark.exe está em uso (janela aberta)
   ├─ Compilação anterior falhou (verificar logs)
   └─ Depêndência externa offline (Lovable, GitHub, etc)

✅ PROCEDE se:
   ├─ goal_judge ✅
   ├─ MAIN compilável ✅
   ├─ OAuth ok ✅
   └─ Nenhum aviso crítico
```

---

## 📋 Checklist Implementação v2.0 Esta Instância

- [ ] **Kanban:** criar TASK_ID parent (DEDUP_KANBAN)
- [ ] **goal_judge:** validar PR #1873 comentário (criteria met?)
- [ ] **Subtasks:** criar 5 cards (A, B, C, D, E) com owners
- [ ] **Builder dispatch:** hermes kanban dispatch A+C
- [ ] **Claude dispatch:** hermes kanban dispatch B+D
- [ ] **Readbacks:** confirmar cada assignee ACK
- [ ] **Observation:** Builder → GitHub sync → Codex → Build
- [ ] **Counterprove:** validar 5 efeitos
- [ ] **Receipt:** registrar resultado
- [ ] **Instalador:** testar CentralDark.exe final com 5 peças integradas

---

## 🎯 Definição de Pronto (Definition of Done)

```
✅ DESKTOP_TOTAL_READY =
   ├─ CentralDark.exe abre ✅
   ├─ Cockpit renderiza sem erro ✅
   ├─ Menu "Builder Bolt" presente ✅
   ├─ Menu "TelePainel" presente ✅
   ├─ Clique em Builder → Lovable Editor carrega ✅
   ├─ Clique em TelePainel → Rotas + Perms funcionam ✅
   ├─ Smoke test PASS ✅
   ├─ Sem regressões vs versão anterior ✅
   └─ Instalador funciona em máquina limpa ✅
```

---

## 🔄 Estados Válidos (Estado Machine)

```
PREFLIGHT
    ↓
DISCOVERY_DEDUP
    ├─→ BLOCKED (goal_judge falhou)
    │   └─→ PREFLIGHT (retry após fix)
    └─→ DEDUP_OK
        ↓
        DISPATCH
            ├─→ BLOCKED (auth falhou)
            │   └─→ DISCOVERY (retry após auth)
            └─→ RUNNING
                ├─→ BLOCKED (terminal falhou)
                │   └─→ RUNNING (terminal fixa)
                └─→ OBSERVATION
                    ├─→ FAIL (counterprove negativo)
                    │   └─→ RUNNING (retry)
                    └─→ PASS
                        ↓
                        COMPLETED
```

---

## 📞 NEXT ACTION (Hermes agora)

```
1. git readback (REMEASURE_MAIN)
   └─ MAIN_SHA actual

2. goal_judge validation (PR #1873)
   └─ Critério bloqueante?

3. DEDUP_KANBAN
   ├─ hermes kanban list --filter="INTENT_ID=CENTRALDARK-DESKTOP-TOTAL"
   ├─ Se encontrado → reutilizar (preserve TASK_ID)
   └─ Se não → criar parent + 5 subtasks

4. Dispatch Builder A+C
   └─ hermes kanban dispatch --dry-run --max 1 --json

5. Dispatch Claude B+D
   └─ (após Builder readback)

6. Monitor readbacks (A, B, C, D)
   └─ NEXT_CURSOR: aguardando acks

```

**ESTADO DESTA RODADA:**
- ✅ Mapeamento: PASS
- ✅ Goal registrado: PR #1873
- 🔴 Kanban parent: NÃO CRIADO
- 🔴 Delegação: NÃO EXECUTADA
- 🔴 Compilação: NÃO INICIADA
- ⏳ **BLOCKED_ON: goal_judge validation + DEDUP_KANBAN**

