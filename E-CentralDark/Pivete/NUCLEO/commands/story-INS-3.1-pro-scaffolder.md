# COMANDO - story-INS-3.1-pro-scaffolder.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-installer-v4-debug\story-INS-3.1-pro-scaffolder.md
**SHA:** 9dd8fab53da305c2
**Timestamp:** 2026-08-28T02:02:40.405109
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - **Pattern:** Seguir convencao existente em `tests/` (ver testes do installer)

### Contratos
- **Quality Gate:** @architect
- quality_gate: "@architect"
- Gate: CONCERNS → PASS (updated 2026-02-14) → docs/qa/gates/INS-3.1-pro-scaffolder.yml
- Gate: CONCERNS → docs/qa/gates/INS-3.1-pro-scaffolder.yml

### Ouro Bruto (primeiros 5000 chars)
```
# Story INS-3.1: Implement Pro Content Scaffolder

**Epic:** Installer V4 Debug
**Status:** Ready for Review
**Priority:** P1 (Critical Path)
**Complexity:** M (Medium)
**Type:** Feature
**Created:** 2026-02-13
**Executor:** @dev
**Quality Gate:** @architect
**Quality Gate Tools:** [unit-tests, architecture-review]
**Depends On:** None (foundation for all pro installer stories)
**Source:** [D1: INS-3-pro-installer-architecture.md, Section 8.1]

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [unit-tests, architecture-review]
```

---

## User Story

**Como** usuario com licenca AIOS Pro ativada,
**Quero** que o conteudo premium (squads, configs, feature registry) seja copiado automaticamente para o meu projeto apos `npx aios-pro activate`,
**Para** que os squads pro e features fiquem disponiveis imediatamente no meu ambiente de desenvolvimento.

---

## Problem Statement

Apos `npx aios-pro activate --key PRO-XXXX`, a licenca e validada e o cache e criado com sucesso, mas **nenhum conteudo pro e copiado para o projeto**. O usuario fica com `node_modules/@aios-fullstack/pro/` e `.aios/license.cache`, mas nada em `squads/`, `.aios-core/pro-config.yaml`, etc.

---

## Scope

### IN Scope

- Criar `pro-scaffolder.js` em `packages/installer/src/pro/` com funcao `scaffoldProContent()`
- Copiar squads pro de `node_modules/@aios-fullstack/pro/squads/` para `./squads/` (root do projeto, visivel ao usuario)
- Copiar `pro-config.yaml` para `.aios-core/`
- Copiar `feature-registry.yaml` para `.aios-core/` (prerequisito: verificar presenca no `files` array de `pro/package.json`)
- Gerar `pro-version.json` com hashes SHA256 para tracking de versao
- Gerar `pro-installed-manifest.yaml` para tracking de arquivos scaffolded
- Integrar `scaffoldProContent()` no `activateAction()` de `.aios-core/cli/commands/pro/index.js`
- Idempotencia: rodar 2x nao duplica conteudo
- Rollback/cleanup de arquivos parcialmente copiados em caso de erro
- Offline fallback: re-scaffolding com `license.cache` valido nao exige conectividade

### OUT of Scope

- `pro-config-merger.js` — merge inteligente de configs (sera INS-3.5)
- Wizard visual de instalacao (sera INS-3.2)
- Entry Point C / `npx aios-pro setup` (sera INS-3.2)
- Deteccao de updates e re-scaffolding automatico (sera INS-3.5)
- IDE sync: copiar pro agents para `.claude/commands/pro/` (sera story futura, ref D1 step 4 `syncProIdeContent`)

---

## Risks

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|---------------|---------|-----------|
| R1 | `feature-registry.yaml` ausente em `pro/package.json` files array (bug conhecido INS-3) | Alta | Medio | Scaffolder emite warning e continua; bug rastreado separadamente |
| R2 | Conflito com squads existentes criados pelo usuario em `./squads/` | Media | Medio | Scaffolder faz merge por diretorio (skip se ja existe com conteudo identico, preservar se usuario modificou via hash check) |
| R3 | Falha parcial de copia em disco cheio ou permissao negada | Baixa | Alto | Rollback atomico implementado (AC6) |
| R4 | `node_modules/@aios-fullstack/pro/` ausente no momento do activate (npm ci limpo) | Baixa | Alto | Verificar presenca antes de scaffoldar; mensagem clara "Run npx aios-pro install first" |

---

## Acceptance Criteria

- [ ] **AC1:** Apos `npx aios-pro activate --key`, squads pro existem em `./squads/`
- [ ] **AC2:** `pro-config.yaml` existe em `.aios-core/` apos ativacao
- [ ] **AC3:** `feature-registry.yaml` existe em `.aios-core/` apos ativacao. Se ausente em `pro/package.json` `files` array, scaffolder emite warning explicito e continua sem bloquear (bug conhecido, ver INS-3 nota)
- [ ] **AC4:** `pro-version.json` rastreia versao instalada e hashes SHA256
- [ ] **AC5:** Idempotente: executar scaffolding 2x nao duplica conteudo
- [ ] **AC6:** Se scaffolding falha parcialmente, cleanup dos arquivos ja copiados + mensagem clara de erro
- [ ] **AC7:** Re-scaffolding com `license.cache` valido e nao expirado nao exige conectividade (offline fallback)
- [ ] **AC8:** `pro-installed-manifest.yaml` lista todos os arquivos scaffolded com timestamps

---

## Dev Notes

### Architecture Reference

- **Source Document:** `docs/stories/epics/epic-installer-v4-debug/research/INS-3-pro-installer-architecture.md`
- **Decision 1 (Secao 2):** Scaffolding no `activate` (nao no install) — conteudo pro so deve existir com licenca valida
- **IDS Classification:** CREATE (`pro-scaffolder.js`, `pro-version.json`, `pro-installed-manifest.yaml`)

### Technical Details

- **Funcao principal:** `scaffoldProContent(targetDir, proSourceDir, options)` em `packages/installer/src/pro/pro-scaffolder.js` (assinatura conforme D1 Secao 2)
- **Hash tracking:** SHA256 de cada arquivo para detectar customizacoes do usuario (usado por INS-3.5)
- **Manifest:** YAML com lista de arquivos copiados, timestamps, e hashes
- **Integracao:** Chamar `scaffoldProContent()` dentro de `activateAction()` em `.aios-core/cl
```