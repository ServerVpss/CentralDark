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

## Contraprova da POC SOL Desktop empacotada — 2026-10-14

**Intenção CHEFE:** continuar a recuperação da POC SOL até ponto fixo, sem criar outra SOL, substituir artefato histórico ou pedir credenciais desnecessárias. Escopo: \`CENTRALDARK-SOL-POC-ARTEFATOS-20261009.zip\` já versionado neste mesmo setor. A seção de agosto acima permanece evidência histórica e não declara o runtime atual.

**Prova observada na VPS (somente leitura):**

| Item | Estado | Prova |
|---|---|---|
| Pacote externo | PASS_IMUTÁVEL | \`docs/RELATORIOS/SEGREDO-RELIQUIA/CENTRALDARK-SOL-POC-ARTEFATOS-20261009.zip\`, 60.517 bytes, SHA-256 \`60ed7d6dd95a74a9fcf38ce09f3858ee05239de778af2280d97205d9f7276bef\`, Git blob \`90c70ef47df093a1ae1455c1a884e3b768d8ae65\` igual ao blob da main consultada |
| Manifesto externo | PASS | 18/18 arquivos coincidem em tamanho e SHA-256, \`ZipFile.testzip() = None\` |
| Fonte interna empacotada | FAIL | \`01-POC-HISTORICA/artifacts/sol-desktop-poc/sol-desktop-poc-source.zip\`: **15.008 bytes**, SHA-256 \`55eda8454e450640767ec73010ca4ec473b68d705f7fb6fefa94bb969d126d1e\`; \`BadZipFile\` ao abrir (diretório central ausente) |
| SHA e tamanho anunciados pelo README/MANIFEST históricos | MISMATCH | Fonte declarada de **25.636 bytes**, SHA-256 \`cbde3ed45617ebfcea2c8fbe882272177f85e5b0c24d0af7f7016ab701c6bc13\` |
| Origem da divergência | PROVADA NO GIT | \`git show ec6b3dfe37d9d306da2bf6b80a1c9bc6fbf0038d:artifacts/sol-desktop-poc/sol-desktop-poc-source.zip\` gera **exatamente os mesmos 15.008 bytes** e SHA-256 \`55eda8...\`; o ZIP externo não foi a causa |
| Recuperação da fonte íntegra em objetos Git disponíveis na VPS | NÃO ENCONTRADA | Varredura read-only dos **199.267 objetos Git** disponíveis: zero blobs do tamanho esperado de 25.636 bytes. Não cobre backups externos, downloads da Casa nem objetos não presentes neste clone |
| Estrutura parcial da fonte | DANIFICADA | 15 entradas locais de ZIP percorríveis no início; após \`apps/sol-desktop/src/styles.css\` os bytes não contêm próximo cabeçalho local esperado nem diretório central |
| Build Windows / app rodando | UNKNOWN | README da POC informa \`6/6\` testes determinísticos históricos, mas \`tauri_windows_build=PENDING_ON_WINDOWS\`; nada disso foi reexecutado nesta medição |
| PR histórica #998 | MERGED | Status GitHub medido em 2026-10-14: \`closed\`, \`merged=true\`. A anotação de \`KEEP_DRAFT\` em agosto era verdade temporal daquele registro, não estado atual |

**Invariante:** integridade do ZIP externo ≠ integridade do ZIP interno ≠ build do Windows ≠ runtime SOL atual. Não substituir a fonte por extração parcial, não corrigir seu SHA no manifesto apenas para produzir PASS, não deletar o pacote e não declarar os scripts recuperáveis como release funcional. Não é necessário inventar novo owner, app, executor ou POC.

**Fechamento de escopo:** \`ARCHIVE_PROVENANCE=FIXED_POINT\` (identidade, histórico e causa material demonstrados); \`SOURCE_RECOVERY=BLOCKED_MISSING_VALID_ORIGINAL\`; \`WINDOWS_TAURI_BUILD=UNKNOWN\`; \`SOL_PC_LIVE_STATE=UNKNOWN\`; \`GLOBAL_FIXED_POINT=NOT_YET\`. A investigação já esgotou a cópia do Git disponível neste escopo. Não há correção de código segura até localizar bytes completos verificáveis. Corrigir a documentação de forma aditiva é possível, mas não constitui restauração da POC.

**Receipt no mesmo owner:** \`INTENT_ID=SOL-POC-RECOVERY-20261014\`; \`GOAL=recuperar POC original com integridade sem perder legado\`; \`OWNER=docs/RELATORIOS/SEGREDO-RELIQUIA/RECONCILIACAO-SOL-HERMES-20260819.md\`; \`ACTIVE_WRITER=GitHub Contents API somente neste Markdown\`; \`EVIDENCE=hash SHA256 externo+manifesto 18/18+objeto histórico+varredura objetos+checagem ZIP interno\`; \`NO_MUTATION_TO_ARCHIVE=true\`; \`NEXT_CURSOR=localizar em K:\_worktrees\CENTRALDARK-SOL-POC-ARTEFATOS-20261009 ou nos backups da Casa a fonte de 25636 bytes; conferir SHA256 cbde3ed45617ebfcea2c8fbe882272177f85e5b0c24d0af7f7016ab701c6bc13; só então executar npm tests/build Tauri num sandbox Windows autorizado e confrontar runtime com o receipt\`. Desvio de hash permanece UNKNOWN/BLOCKED; nunca PASS.
