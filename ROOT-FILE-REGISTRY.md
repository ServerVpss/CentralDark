# ROOT-FILE-REGISTRY — Registro Canônico da Raiz

> **Owner:** SOL | **Autoridade:** SEGREDO/CHEFE
> **Enforcement:** pre-commit hook + skill + YAML binding + library-index.json

Todo arquivo na raiz do CentralDark DEVE estar catalogado aqui.
Arquivo novo na raiz sem entrada neste registro é bloqueado pelo pre-commit hook.

## Superfícies vinculadas

| Superfície | Caminho |
|---|---|
| Markdown humano | `ROOT-FILE-REGISTRY.md` (este arquivo) |
| JSON machine | `ROOT-FILE-REGISTRY.json` |
| YAML binding | `root-file-binding.yaml` |
| Skill agente | `.agents/skills/root-file-contract-router/SKILL.md` |
| Git hook | `.githooks/pre-commit-root-contract.sh` |

## Core — Boot Obrigatório

| Arquivo | Papel | Boot | Status |
|---|---|---|---|
| `LEIA-ME-IA.md` | Entrypoint canônico de toda IA | 1 | ✅ linked |
| `AGENTS.md` | Contrato operacional | 2 | ✅ linked |
| `CLAUDE.md` | Bridge adapter Claude Code/Cowork | 3 | ✅ linked |
| `CENTRALDARK_AI_BOOT.yaml` | Config de boot YAML | — | ✅ linked |
| `SOURCES.json` | Registro de fontes | — | ✅ linked |
| `SECOND-BRAIN.yml` | Config do brain | — | ✅ linked |
| `ARCHITECTURE.mmd` | Diagrama de arquitetura | — | ✅ linked |
| `README.md` | GitHub readme | — | standard |

## Model Routers — Adaptadores por Engine

Cada router aponta para `LEIA-ME-IA.md` como core. NÃO define identidade, autoridade ou merge policy.

| Arquivo | Engine | Linhas |
|---|---|---|
| `00-COMECE-AQUI-IA.md` | Universal (fallback) | 70 |
| `CHATGPT.md` | ChatGPT | 73 |
| `CODEX.md` | Codex | 40 |
| `GEMINI.md` | Gemini | 33 |
| `GROK.md` | Grok | 21 |
| `.windsurfrules` | Windsurf | 33 |

## Docs Operacionais

| Arquivo | Papel | Linhas |
|---|---|---|
| `CENTRALDARK_HANDOFF.md` | Protocolo de handoff | 136 |
| `CONTINGENCY.md` | Plano de contingência | 34 |
| `DELTA-CONTINUO.md` | Protocolo delta contínuo | 90 |
| `FIO_3H_FLUXO.md` | Fluxo de trabalho 3h | 65 |
| `INSTALACAO.md` | Guia de instalação | 84 |
| `_HANDOFF_CHRISTOFER_20260901.md` | Handoff específico (arquivo) | 155 |

## Scripts de Segurança

| Arquivo | Função | Linhas |
|---|---|---|
| `busca_profunda.sh` | Busca profunda de segurança | 9 |
| `recon.sh` | Reconhecimento | 39 |
| `test_leak.py` | Teste de vazamento | 76 |
| `varredura_chaves.sh` | Varredura de chaves | 17 |
| `varredura_prod.sh` | Varredura de produção | 26 |

## Scripts de Monitoramento

| Arquivo | Função | Linhas |
|---|---|---|
| `monitor_centraldark.sh` | Monitor de serviços | 15 |
| `monitor_unificado.sh` | Monitor unificado | 35 |
| `ver_logs.sh` | Visualizador de logs | 19 |
| `ver_logs_api.sh` | Visualizador de logs API | 11 |

## Scripts Utilitários

| Arquivo | Função | Linhas |
|---|---|---|
| `analyze_workflows.py` | Analisador de workflows | 73 |
| `central_horario.py` | Utilitário de scheduling | 33 |
| `payload_test.py` | Testador de payloads | 23 |
| `probe.py` | Probe de serviços | 58 |
| `script.js` | Script principal JS | 659 |
| `smoke_test.ts` | Smoke test | 128 |

## Build Config (padrão Node/Vite — não requer binding especial)

`ecosystem.config.cjs` · `package.json` · `eslint.config.js` · `postcss.config.js` · `tailwind.config.ts` · `tsconfig*.json` · `vite.config.ts` · `vitest.config.ts` · `components.json` · `style.css`

## IDE Config

`CentralDark.code-workspace` · `.coderabbit.yaml` · `.graphifyignore`

## Legacy/Backup — Candidatos a remoção

| Arquivo | Nota |
|---|---|
| `ecosystem.config.example.js` | Exemplo antigo |
| `ecosystem.config.js` | Superseded por `.cjs` |
| `ecosystem.config.js.bak-*` (3) | Backups antigos |
| `ecosystem.config.cjs.bak-*` (1) | Backup antigo |

## Limpos neste commit

`Diagnóstico` (vazio) · `Regra` (vazio) · `Solução` (vazio) · `2026-09-24T00:00:00Z` (vazio) · `boot_receipt.txt` · `legacy_scripts.txt` · `novo_scripts.txt` · `graphify-debug.log3`

## Regras

1. **Arquivo novo na raiz** → precisa de entrada neste registro + library-index.json
2. **Model router novo** → DEVE apontar para LEIA-ME-IA.md como core
3. **Core files** → imutáveis sem aprovação do SEGREDO/CHEFE
4. **Legacy files** → scheduled para limpeza; não devem receber código novo
5. **Pre-commit hook** → bloqueia arquivo raiz não registrado

## Gate de integridade cruzada — 5 superfícies + Library Index

Estado esperado:

ROOT_FILE_REGISTRY_MD=PASS
ROOT_FILE_REGISTRY_JSON=PASS
ROOT_FILE_BINDING_YAML=PASS
ROOT_FILE_ROUTER_SKILL=PASS
ROOT_FILE_PRECOMMIT_HOOK=PASS
LIBRARY_INDEX_V1_2_0=PASS

O juiz executável é `.githooks/pre-commit-root-contract.sh`.
Ele valida presença, parse, referências cruzadas, library-index v1.2.0 e bloqueia novo arquivo raiz não registrado.


## Herança global de política

```text
GLOBAL_POLICY_OWNER=docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md
ALL_ROOT_FILES_INHERIT_GLOBAL_POLICY=true
ALL_MODEL_ROUTERS_INHERIT_GLOBAL_POLICY=true
ALL_OPERATIONAL_DOCS_INHERIT_GLOBAL_POLICY=true
BUILD_CONFIGS_INHERIT_BY_REGISTRY=true
```
