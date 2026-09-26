# New Task Modal — SOM Field Mapping (Session 2026-08-02)

Capturado durante missão `CENTRALDARK-CASA-BACKUP-ORGANIZACAO-SYNC-01` no Hermes Studio v0.6.36.

## Modal "New Task" — Índices SOM (após abrir via `#94` "New Task")

| Campo | SOM Index | Role | Label / Placeholder | Observação |
|---|---|---|---|---|
| Close (X) | `#149` | Button | "close" | Fechar modal |
| Title | `#153` | Edit | "Task title" | Obrigatório |
| Description | `#157` | Edit | "Task description (optional)" | Multiline |
| Assignee | `#161` | Text/Combo | "Select assignee..." | Dropdown ao clicar |
| Priority | `#163` | Text/Combo | "Select priority..." | Dropdown: Low / Medium / High |
| Tenant | `#166` | Edit | "Tenant (optional)" | Opcional |
| Workspace | `#169` | Text/Combo | "Scratch workspace" | Dropdown ao clicar |
| Skills | `#172` | Text/Combo | "Select skills..." | Multi-select |
| Create in triage | `#173` | CheckBox | "Create in triage" | **Importante**: default pode ser false → task cai em Running |
| Goal mode | `#174` | CheckBox | "Goal mode" | |
| Max runtime | `#177` | Edit | "e.g. 30m, 2h" | |
| Max retries | `#181` | Edit | "Number of retries" | |
| Cancelar | `#185` | Button | "Cancelar" | |
| Criar | `#186` / `#187` | Button | "Criar" / "loading Criar" | `#187` aparece durante submit |

## Fluxo de Criação (comprovedor)

1. Click `#94` "New Task" → modal abre
2. **Recapturar SOM** (índices mudam)
3. Preencher Title (`#153`) → `type`
4. Preencher Description (`#157`) → `type`
5. **Verificar "Create in triage" (`#173`)** → se não checked, clicar para marcar
6. Assignee (`#161`) → click → selecionar
7. Priority (`#163`) → click → selecionar "Medium" (`#191`)
8. Tenant (`#166`) → opcional
9. Workspace (`#169`) → click → selecionar "Scratch workspace"
10. Skills (`#172`) → opcional
11. Click `#186` "Criar" → aguardar loading (`#187`)
12. **Recapturar** → confirmar card na coluna Triage (counter `#108` incrementa)

## Gotchas

- **Sem "Create in triage" checked** → task entra direto em **Running** (não Triage)
- Priority: "Low" (`#189`), "Medium" (`#191`), "High" (`#193`) — índices variam
- Workspace dropdown: "Scratch workspace" (`#169`) é o default visível
- Índices **mudam a cada abertura do modal** — sempre recapturar
- `effect: unverifiable` → sempre recapturar pós-click para confirmar estado