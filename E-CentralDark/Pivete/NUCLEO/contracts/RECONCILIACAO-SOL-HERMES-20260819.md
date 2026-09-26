# CONTRATO - RECONCILIACAO-SOL-HERMES-20260819.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\RELATORIOS\SEGREDO-RELIQUIA\RECONCILIACAO-SOL-HERMES-20260819.md
**SHA:** 9e3d16c56cb2ae3b
**Timestamp:** 2026-08-28T02:57:20.547806
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- > Princípio: REUSE_BEFORE_CREATE · ONE_WRITER_PER_SCOPE · UNKNOWN != PASS.

### Gaps
- NEW_PARALLEL_CAPABILITY_WITHOUT_PROVED_GAP=BLOCK

### Ouro Bruto (primeiros 5000 chars)
```
# Reconciliação SOL ↔ HERMES (delta da escavação)

> Parte da mina mãe #998 (docs/segredo-reliquia-hud-20260816).
> Autor: hermes-pivete (delta-partner, não segundo owner).
> Princípio: REUSE_BEFORE_CREATE · ONE_WRITER_PER_SCOPE · UNKNOWN != PASS.

## Estado vivo medido (2026-08-19)

| Campo | Valor | Prova |
|---|---|---|
| MAIN_HEAD | `06d6fe52` | gh api commits/main |
| PR #1068 | MERGED (writer hermes-pivete) | gh pr view 1068 |
| MCP CentralDark | ONLINE 110 tools v0.4.0 | curl /health |
| PR #998 | MINA MÃE (draft, KEEP_DRAFT) | gh pr view 998 |

## O que reconcilia SOL

- `docs/CONSCIENCIA/` — SOUL canônica (fonte da verdade)
- `.lovable/memory/preferences/hierarquia-memoria-consciencia-primeiro.md`
- `docs/AGENTS.md` — ponte: NÃO segunda identidade, REUSE_BEFORE_CREATE

## O que reconcilia HERMES

- `apps/modulos/HERMES-CORE/agents/` — core operacional da Casa (não o app desktop):
  Auto-Diagnostico, Critic, Deploy-Watcher, Executor, GraphRAG-Master,
  Knowledge-Collector, Log-Verificador, Universal-Handler
- `HERMES-CORE/agents/AGENTS.md` — EXTEND-ONLY obrigatório

## Mapeamento local (fora do repo, espelho)

`C:\CentralDark\_MAPA_CASA\` contém:
- `B_GITHUB_REMOTO/` — main viva, PRs, ferida FAST guard
- `B_GITHUB_REMOTO/01-RECONCILIACAO-SOL-HERMES.md` — detalhe acima
- `C_HERMES_LOCAL/` — SOUL materializada, skills, runtime
- `F_RECONCILIACAO_GROK/` — zips de escavação (PR #998 destino canônico)
- `G_WEBMCP_INSPECAO/` — WebMCP + User-Agent Switcher (Chrome)

## Contrato já escrito no repo (não novo)

```
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING=true
NEW_PARALLEL_CAPABILITY_WITHOUT_PROVED_GAP=BLOCK
MODEL_IS_NOT_AUTHORITY=true
SEGREDO_CHEFE_IS_FINAL_AUTHORITY=true
UNKNOWN_SKIPPED_PENDING_ARE_NOT_PASS=true
```

## FAST green guard (ferida aberta, fora de escopo deste delta)

PR #1032 fechada sem merge. `FAST_GREEN_FIRST_REQUIRED` ainda = 0 na main.
`shouldEnforceGreenFirst => READY && mode !== FAST`. Registrado para PR futuro isolado.

## Veredito

- DELTA_MATERIAL = sim (mapeamento consolidado numa pasta + link SOL↔HERMES)
- NOVA_ARQUITETURA = não (reutiliza owners existentes)
- MERGE = não (PR #998 é draft por design)
- MAIN_CONFIRMADA = `06d6fe52`
- FIXED_POINT_LOCAL = estado da Casa medido ✓

```