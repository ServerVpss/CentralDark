# COMANDO - story-INS-3.3-license-recovery.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-installer-v4-debug\story-INS-3.3-license-recovery.md
**SHA:** c3724e698d3fab9c
**Timestamp:** 2026-08-28T02:02:40.393935
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Run:** `npm test -- --testPathPattern=pro-recover`

### Padroes
- - **Run:** `npm test -- --testPathPattern=pro-recover`

### Contratos
- **Quality Gate:** @architect
- quality_gate: "@architect"
- | 2026-02-13 | @qa (Quinn) | QA Review PASS. All 4 ACs met, 17/17 tests (including integration + promptEmail tests), 0 regressions, security OWASP-compliant. Gate: PASS (100/100) |
- Gate: PASS → `docs/qa/gates/INS-3.3-license-recovery.yml`

### Ouro Bruto (primeiros 5000 chars)
```
# Story INS-3.3: Implement License Key Recovery Flow

**Epic:** Installer V4 Debug
**Status:** Ready for Review
**Priority:** P2 (Important)
**Complexity:** S (Small)
**Type:** Feature
**Created:** 2026-02-13
**Executor:** @dev
**Quality Gate:** @architect
**Quality Gate Tools:** [unit-tests, security-review, manual-review]
**Depends On:** None (portal web e externo)
**Source:** [D1: INS-3-pro-installer-architecture.md, Section 8.3]

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [unit-tests, security-review, manual-review]
```

---

## User Story

**Como** usuario que perdeu ou esqueceu minha license key AIOS Pro,
**Quero** um comando CLI para iniciar recuperacao por e-mail,
**Para** recuperar acesso ao meu conteudo premium sem contatar suporte manualmente.

---

## Problem Statement

Nao existe nenhum mecanismo de recuperacao de key no AIOS Pro. Se o usuario perder a key, nao tem como recuperar via CLI. Precisa de um fluxo seguro (OWASP-compliant) que nao exponha dados.

---

## Scope

### IN Scope

- Criar `recover.js` com comando `npx aios-pro recover`
- Input: email do usuario
- Output: mensagem anti-enumeracao (identica para email existente ou nao)
- Abrir browser para `https://pro.synkra.ai/recover`
- Documentar requisito de rate limiting para servidor (3/email/hora)
- Key masking em toda a cadeia

### OUT of Scope

- Implementacao server-side da license recovery API
- UI/portal web de recovery (externo)
- Alteracao da license API existente
- Envio de e-mails (responsabilidade do server)

---

## Acceptance Criteria

- [ ] **AC1:** `npx aios-pro recover` pede email e mostra mensagem padronizada
- [ ] **AC2:** Mensagem NUNCA confirma se email existe ou nao (anti-enumeracao OWASP)
- [ ] **AC3:** Abre browser com URL de recovery (`https://pro.synkra.ai/recover`)
- [ ] **AC4:** Funciona offline: mostra URL para acesso manual (nao tenta API call, apenas exibe URL)

---

## Dev Notes

### Architecture Reference

- **Source Document:** `docs/stories/epics/epic-installer-v4-debug/research/INS-3-pro-installer-architecture.md`
- **Decision 3 (Secao 4):** Portal-first — CLI redireciona para portal web para processo completo
- **Security (Secao 9):** Anti-enumeracao, timing uniforme, rate limiting

### Technical Details

- **Modulo:** `packages/aios-pro-cli/src/recover.js`
  - **NOTA:** D1 (Section 7) especifica `.aios-core/cli/commands/pro/recover.js`, mas o path correto e `packages/aios-pro-cli/src/` pois o CLI ja vive neste package. Desvio justificado pela estrutura existente.
- **Anti-enumeracao:** Mensagem identica para emails existentes e inexistentes: "Se este email estiver associado a uma licenca, voce recebera instrucoes de recuperacao."
- **Offline behavior (@po S7):** "Funciona offline" = mostra URL em texto para o usuario copiar/colar manualmente. Nao tenta API call — apenas CLI puro.
- **Rate limiting:** Documentar requisito `3 requests/email/hora` para equipe backend (nao implementar no CLI)
- **Browser open:** Usar `open` package (v10+) para abrir URL no browser padrao. Deve ser adicionado como dependency em `packages/aios-pro-cli/package.json`.
- **Prompt de email:** Usar `readline` nativo do Node.js (mesmo pattern do CLI existente — sem dependencias extras). NAO usar inquirer.
- **Integracao no CLI:** O comando `recover` NAO requer `@aios-fullstack/pro` instalado (e puramente local). Deve ser adicionado no `switch` de `aios-pro.js` ANTES do grupo que checa `isProInstalled()`, similar ao pattern de `install`/`help`.
- **Package.json updates necessarios:**
  1. Adicionar `"open": "^10.0.0"` em `dependencies`
  2. Atualizar `"files"` para incluir `["bin/", "src/"]`

### Files Mapping

| # | Arquivo | Acao | IDS |
|---|---------|------|-----|
| 1 | `packages/aios-pro-cli/src/recover.js` | CREATE | CREATE |
| 2 | `packages/aios-pro-cli/bin/aios-pro.js` | EDIT | ADAPT |
| 3 | `packages/aios-pro-cli/package.json` | EDIT | ADAPT |
| 4 | `tests/pro-recover.test.js` | CREATE | CREATE |

---

## Tasks / Subtasks

### Task 1: Setup de dependencias (AC: 1)

- [x] 1.1 Criar diretorio `packages/aios-pro-cli/src/`
- [x] 1.2 Adicionar `"open": "^10.0.0"` em `packages/aios-pro-cli/package.json` dependencies
- [x] 1.3 Atualizar `"files"` em package.json para `["bin/", "src/"]`

### Task 2: Criar comando `recover` (AC: 1, 2, 3, 4)

- [x] 2.1 Criar `packages/aios-pro-cli/src/recover.js` com funcao `recoverLicense()`
- [x] 2.2 Implementar prompt de email via `readline` nativo do Node.js
- [x] 2.3 Implementar mensagem anti-enumeracao (identica para qualquer email): "Se este email estiver associado a uma licenca, voce recebera instrucoes de recuperacao."
- [x] 2.4 Implementar abertura de browser com `open` package para `https://pro.synkra.ai/recover`
- [x] 2.5 Implementar fallback offline: exibir URL em texto se browser nao abre (try/catch no `open()`)

### Task 3: Integrar no CLI (AC: 1)

- [x] 3.1 Adicionar case `recover` no switch de `aios-pro.js` ANTES do grupo `isPr
```