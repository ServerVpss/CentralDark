# COMANDO - story-syn-7-hook-entry.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\story-syn-7-hook-entry.md
**SHA:** 1f79cc34ff105b26
**Timestamp:** 2026-08-28T02:02:40.552402
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: "@qa"
- **Gate: PASS**

### Ouro Bruto (primeiros 5000 chars)
```
# Story SYN-7: Hook Entry Point + Registration

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-7
**Priority:** High
**Points:** 5
**Effort:** 4-6 hours
**Status:** Ready for Review
**Type:** Feature
**Lead:** @dev (Dex) + @devops (Gage)
**Depends On:** SYN-6 (SynapseEngine Orchestrator)
**Repository:** aios-core
**Wave:** 2 (Integration + Content)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [manual-review, coderabbit-cli, unit-tests]
```

---

## User Story

**Como** sistema AIOS,
**Quero** um hook entry point registrado como `UserPromptSubmit` que importa o SynapseEngine e processa cada prompt do usuario via protocolo stdin/stdout JSON,
**Para** injetar regras contextuais `<synapse-rules>` automaticamente a cada prompt, substituindo o CARL hook como motor de contexto per-prompt.

---

## Objective

Implementar o hook entry point fino (~50 linhas) em `.claude/hooks/synapse-engine.js` que:
1. Le JSON de stdin (`{ sessionId, cwd, prompt }`)
2. Importa e instancia `SynapseEngine` de `.aios-core/core/synapse/engine.js`
3. Chama `engine.process(input)` para gerar `<synapse-rules>` XML
4. Escreve resultado em stdout (`{ hookSpecificOutput: { additionalContext } }`)
5. Registra o hook em `.claude/settings.local.json` no evento `UserPromptSubmit`
6. Desabilita o CARL hook (se presente) no mesmo settings
7. Adiciona entradas no `.gitignore` para `.synapse/sessions/` e `.synapse/cache/`

---

## Scope

### IN Scope

- **Hook Entry Point** em `.claude/hooks/synapse-engine.js`
  - Protocolo stdin/stdout JSON (identico ao CARL)
  - Input: `{ sessionId, cwd, prompt }` via `process.stdin`
  - Output: `{ hookSpecificOutput: { additionalContext: "<synapse-rules>..." } }` via `process.stdout`
  - Importa `SynapseEngine` de `.aios-core/core/synapse/engine.js` (SYN-6)
  - Startup check: se `.synapse/` nao existe, exit silencioso (zero output)
  - Error handling: try/catch global, exit silencioso em caso de erro (nunca bloqueia o prompt)
  - Hard limit: <100ms total
  - ~50 linhas maximo

- **Hook Registration** em `.claude/settings.local.json`
  - Adiciona entry no `hooks.UserPromptSubmit` array
  - Command: `node "<absolute-path>/synapse-engine.js"`
  - Type: `command`

- **CARL Hook Disable** (se presente)
  - Comenta ou remove entry do CARL hook em settings
  - Preserva `.carl/` directory para referencia (nao deleta)
  - Documenta a transicao

- **.gitignore Entries** (Review Note #3)
  - `.synapse/sessions/`
  - `.synapse/cache/`

- **Unit Tests** para o hook entry point

### OUT of Scope

- SynapseEngine implementation (SYN-6 — dependency)
- Domain content files (SYN-8)
- CRUD commands (SYN-9)
- Skills/documentation (SYN-11)
- Memory bridge (SYN-10)
- Delecao do diretorio `.carl/`
- CLAUDE.md integration snippet (SYN-11 covers documentation)

---

## Acceptance Criteria

1. **Hook Entry Point Exists**
   - File `.claude/hooks/synapse-engine.js` existe
   - ~50 linhas (max 80 linhas)
   - Le JSON completo de stdin via buffer concatenation
   - Parseia input como `{ sessionId, cwd, prompt }`
   - Importa `SynapseEngine` de `.aios-core/core/synapse/engine.js`
   - Chama `engine.process(input)` e captura resultado
   - Escreve output JSON em stdout: `{ hookSpecificOutput: { additionalContext: string } }`

2. **Silent Exit on Missing .synapse/**
   - Se `.synapse/` directory nao existe no `cwd`, hook exit com codigo 0
   - Zero output em stdout (nenhum JSON emitido)
   - Nenhum erro em stderr

3. **Global Error Handling**
   - Try/catch envolve toda a execucao
   - Qualquer erro → exit silencioso (codigo 0, zero output)
   - Nunca bloqueia o prompt do usuario
   - Errors logged via `console.error` com prefix `[synapse-hook]` (stderr only)

4. **Hook Registered in Settings**
   - `.claude/settings.local.json` contem entry em `hooks.UserPromptSubmit`:
     ```json
     {
       "type": "command",
       "command": "node \".claude/hooks/synapse-engine.js\""
     }
     ```
   - Hook usa path relativo ao projeto (nao absolute path)

5. **CARL Hook Disabled**
   - Se CARL hook entry existe em settings, esta removida ou comentada
   - `.carl/` directory permanece intacta (nao deletada)
   - Transicao documentada no Change Log desta story

6. **.gitignore Updated** (Review Note #3)
   - `.gitignore` contem entries:
     ```
     # SYNAPSE runtime (auto-managed)
     .synapse/sessions/
     .synapse/cache/
     ```
   - Sessions e cache nao sao commitados

7. **Performance Within Budget**
   - Hook total execution <100ms (hard limit do DESIGN doc)
   - Startup check (`.synapse/` exists) <5ms
   - stdin read + JSON parse <10ms
   - Engine process delegated to SynapseEngine budget (<70ms)

8. **Unit Tests Passing**
   - Minimo 15 testes cobrindo: stdin/stdout protocol, silent exit (no .synapse/), error handling (bad JSON, engine error), output format validation
   - Coverage > 90% para o hook file
   - Tests mockam o SynapseEngine para isolamento

---

## Risks

| Risk | Probabilit
```