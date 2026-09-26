---
name: hermes-studio-web-ui
description: "Automação Hermes Studio Web UI — Kanban, perfis, cards SOM."
version: 1.0.0
author: Hermes (curator-managed)
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [automation, hermes-studio, web-ui, kanban, computer-use, som, profile-switching]
    related_skills: [computer-use, automacao-navegador]
    requires_toolsets: []
    requires_tools: [computer_use]
    fallback_for_toolsets: []
    fallback_for_tools: []
    config: []
    blueprint: null
required_environment_variables: []
---

# Hermes Studio Web UI Automation

Automação específica do **Hermes Studio Web UI** (`http://localhost:8648/`) via `computer_use` SOM.

---

## When to Use
- Operar Kanban board (criar, mover, editar cards)
- Trocar perfis (pivete ↔ default)
- Selecionar board canônico (CRM ÚNICO vs Default)
- Criar/editar tasks com campos: Priority, Assigner, Tenant, Workspace, Run, IME, TRING, Goal
- Mapear elementos SOM para automação confiável

---

## Quick Reference

| Ação | Comando |
|---|---|
| Abrir Kanban | `computer_use(capture, mode='som', app='Chrome', pid=XXXX, window_id=YYYY)` → click `#42` "Kanban" |
| Novo Board | Click `#86` "Adicionar" → modal "New Board" |
| Nova Task | Click `#93` "New Task" → preencher modal |
| Mover Card | Drag `delivery_mode='foreground'` (background falha) |
| Trocar Perfil | Click `#69` "pivete" ou `#70` "default" na sidebar |
| Seletor de Board | Click `#86` "Adicionar" → modal board selector |

---

## Kanban Board SOM Mapping

**URL:** `http://localhost:8648/#/hermes/kanban`
**Profile:** `pivete`
**Browser:** Chrome (pid=10044, window_id=985268)

### Board Selector
| Elemento | SOM Index | Label |
|---|---|---|
| Sidebar Kanban | `#42` | "Kanban" (Hyperlink) |
| Board Name | `#85` | "Kanban Board: Default · Tasks: 1" |
| Board Selector | `#86` | "Adicionar" → modal "New Board" |
| CRM ÚNICO | — | Procurar no modal (não usar "Default") |

### Header Controls
| Ação | SOM Index | Label |
|---|---|---|
| Novo Board / Adicionar | `#86` | "Adicionar" |
| Nova Task | `#93` / `#94` | "New Task" / "+ New Task" |
| Dispatch | `#88` | "Dispatch" |
| Filtro Status | `#90` | "All Statuses" |
| Filtro Assignee | `#92` | "All Assignees" |

### Resumo de Contadores
| Métrica | SOM Index |
|---|---|
| Total | `#94` |
| Triage | `#95` |
| To Do | `#96` |
| Scheduled | `#97` |
| Ready | `#98` |
| Running | `#99` |
| Blocked | `#100` |
| Review | `#101` |
| Done | `#102` |
| Archived | `#103` |

### Colunas (Header → Counter → Drop Zone)
| Coluna | Header | Counter | Drop Zone |
|---|---|---|---|
| Triage | `#107` | `#108` | `#109` |
| To Do | `#111` | `#112` | `#113` |
| Scheduled | `#115` | `#116` | `#117` |
| Ready | `#119` | `#120` | `#121` |
| Running | `#123` | `#124` | `#125` |
| Blocked | `#127` | `#128` | `#129` |
| Review | `#132` | `#133` | `#134` |
| Done | `#136` | `#137` | `#138` |
| Archived | `#140` | `#141` | `#142` |

---

## Card Detail Panel (clicar no card `#129`)

| Campo | SOM Index | Label |
|---|---|---|
| Status | `#149` / `#150` | "Status" / "Blocked" |
| Task ID | `#151` / `#152` | "Task ID" / "t_35432f15" |
| Assignee | `#153` / `#154` | "Assignee" / "default" |
| Priority | `#155` / `#156` | "Priority" / "0" |
| Tenant | `#157` / `#158` | "Tenant" / "—" |
| Created | `#159` / `#160` | "Created" / timestamp |
| Started | `#161` / `#162` | "Started" / timestamp |
| Complete | `#164` | Button "Complete" |
| Unblock | `#165` | Button "Unblock" |
| Assign to... | `#167` | "Assign to..." |
| Recovery reason | `#169` | Edit "Recovery reason (optional)" |
| Comment | `#185` / `#186` | "Write a task comment..." |
| Load Log | `#188` | Button "Load Log" |
| Load Diagnostics | `#189` | Button "Load Diagnostics" |

**Nota:** Título do card NÃO editável no painel lateral (imutável pós-criação).

---

## Drag & Drop (Mover Card)

| Parâmetro | Valor |
|---|---|
| Background delivery | FALHA (`background_occluded`) |
| Foreground delivery | FUNCIONA (`delivery_mode='foreground'`) |
| From (Running) | `from_coordinate=[-875, -642]` |
| To (Blocked) | `to_coordinate=[-578, -675]` |
| Duração | 500ms / 20 steps |

---

## Profile Switcher (Sidebar)

| Perfil | SOM Index | Label |
|---|---|---|
| pivete (ativo) | `#69` | "pivete" |
| default | `#70` | "default" / "MODELOS" |

---

## Modal "New Task" — Campos

| Campo | Descrição |
|---|---|
| **Title** | Título da task |
| **Description** | Descrição |
| **Assignee** | Responsável |
| **Status** | Status inicial (Triage, To Do, etc.) |
| **Priority** | Prioridade numérica (0 = alta) |
| **Assigner** | Quem atribuiu |
| **Tenant** | Locatário/tenant |
| **Workspace** | Espaço de trabalho |
| **Run** | Execução/corrida |
| **IME** | Identificador de máquina/ambiente |
| **TRING** | Trigger string |
| **Goal** | Objetivo da task |

---

## Pitfalls

| Sintoma | Causa | Fix |
|---|---|---|
| `background_occluded` no drag | Chrome bloqueia drag background | `delivery_mode='foreground'` |
| `ambiguous_window_target` | Múltiplas janelas Chrome | Passar `pid` + `window_id` |
| Título não editável | Painel lateral não expõe campo | Título imutável pós-criação |
| Board errado | Usando "Default" temporário | Usar seletor `#86` → CRM ÚNICO |
| Perfil errado | Perfil ativo não é `pivete` | Click `#69` ou `#70` na sidebar |
| Dropdown Kanban não abre | Clicou no Text label (ex: "Kanban Board: Default" elemento #86) em vez do Group trigger | Clicar no **Group** adjacente (ex: elemento #88) que contém o dropdown, não no Text |
| Índices mudam em modal "New Task" | SPA re-renderiza ao abrir modal | Recapturar **após** abrir modal; usar `label`/`role` para re-identificar campos (Title, Description, Assignee, Priority, Tenant, Workspace) |
| `effect: unverifiable` em todos cliques | Background/foreground não confirmam mudança visual | **Sempre** recapturar pós-ação e comparar estado (Tasks count, column counts, card title visível) |
| CRM ÚNICO não listado no seletor | Seletor de board pode não mostrar opções além do Default | Verificar se há outro board canônico em outra aba/URL; se não houver, criar via `#86` "Adicionar" → "New Board" |
| Card entra em "Running" ao invés de "Triage" | Modal New Task não tem campo Status visível ou default é Running | Verificar campo "Create in triage" checkbox (#173) no modal antes de criar |

---

## Referências Relacionadas

- `references/cache-locations.md` — rotas de anexos, screenshots
- `references/gateway-tool-batching.md` — batch CLI pesado, Telegram leve
- `references/profile-switching.md` — troca de perfil via Web UI
- `references/new-task-modal-fields.md` — mapeamento SOM dos campos do modal "New Task" (índices, gotchas, fluxo)
- Doc oficial: https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills
- Skill relacionada: `computer-use` (base), `automacao-navegador` (padrões SOL)

---

## Metadados

- **Criado:** 2026-08-02
- **Autor:** Hermes (curator-managed)
- **Para:** Automação específica do Hermes Studio Web UI
- **Validação:** Testado em Hermes Studio v0.6.36 (Chrome, Windows)
- **Versão:** 1.0