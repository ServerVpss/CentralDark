# 🪬 Instinto Superior — Manifesto incremental do harness privado CentralDark

> **Owner visual:** `apps/instinto-superior` no repositório `ServerVpss/CentralDark`. **Não é segundo executor, nem segundo cérebro.** O cockpit projeta capacidades de owners existentes. Este manifesto registra intenção, contratos, deltas e evidências; não executa deploy, altera permissões ou transforma snapshots em telemetria.

## Identidade e cadeia de autoridade

- **CHEFE:** decide intenção e critérios; **JARVIS/SOL:** coordena e mantém a continuidade; **Hermes/Claude Code:** executam nas rotas e escopos autorizados, com **um escritor por escopo**.
- **Código visual canônico:** `apps/instinto-superior`; **fonte de verdade Git:** `ServerVpss/CentralDark` / `main`. Outros frontends são projeções, não autoridade paralela.
- **Gaveta do cockpit:** `src/components/central/InfraestruturaSistema.tsx` consome `src/data/forja-gaveta.snapshot.json`. Histórico e receitas são referenciados pelos owners existentes; não inventar contagens nem persistir dados de runtime em JSON estático.
- **HUD legado:** `docs/HUD/HUD.html` → `src/data/hud-migration.snapshot.json` → componentes/owners do cockpit. Não retirar legado até paridade funcional, autenticação e contraprova.
- **MCP/terminal:** sessão de VS Code só pode aparecer como `CONNECTED` depois de identidade de sessão, entrada autorizada, resposta correlacionada e recibo. Foco de janela, processo aberto e catálogo de ferramentas **não** comprovam sessão interativa.
- **Receitas:** evoluir primeiro a skill/owner compatível; criar nova apenas após inventário demonstrar lacuna. Alias visual 🧹 usa o owner `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`; emoji nunca é comando de shell.

## Ciclo incremental da Forja Viva

```text
#acordar → !calibrar → !CENTRALDARK (gatilhos conversacionais)
INTENÇÃO_VIVA + FIXED_POINT
  → INVENTÁRIO(owner, SHA, capacidade, fonte, permissão)
  → DELTA MÍNIMO NO OWNER EXISTENTE
  → TESTE + CONTRAPROVA + RECIBO
  → MAIN_READBACK (se promovido e autorizado)
  → RUNTIME_READBACK (se implantado)
  → VISUAL_CASA (quando solicitado)
  → CHECKLIST_CURRENT + NEXT_CURSOR
  → 🧹 SOMENTE SCRATCH DESCARTÁVEL PROVADO
```

Estados independentes: `SOURCE_CATALOGED`, `MAIN_PRESENT`, `RUNTIME_MIRRORED`, `SKILL_LOADED`, `CAPABILITY_PROVEN`, `DEPLOYED_SHA_VERIFIED`. `UNKNOWN` nunca equivale a `PASS`. `COMMIT != MERGE != DEPLOY != RUNTIME_PASS`.

## Contratos da gaveta e do cockpit

| Setor | Fonte/owner existente | Exibição mínima | Prova que ainda importa |
|---|---|---|---|
| Skills | `src/data/forja-gaveta.snapshot.json`; `.agents/skills/`; `skills/` | total, ordem alfabética, busca, setor, origem, estado | hash de snapshot e instalação/carga independente |
| Plugins | mesmo snapshot + conectores autorizados | fontes versionadas vs conectados/operacionais **separados** | leitura de conexão e teste real |
| Receitas | skills, scripts e gavetas históricas existentes | total derivado da fonte, owner, aliases, versão, evidência | não somar itens heterogêneos como se fossem receitas únicas |
| Gaveta histórica | fontes do catálogo e arquivos históricos referenciados | origem, data, âncora, status e busca | preservação de proveniência e links |
| HUD | `src/data/hud-migration.snapshot.json` + `docs/HUD/HUD.html` | controle, owner, paridade, bloqueios | comparação de comportamento e readback |
| Terminal | MCP CentralDark + sessão VS Code/Hermes/Claude existente | conexão, alvo, permissão, comando/recibo correlacionados | eco de entrada e saída na mesma sessão |
| Automação/Auto Sync | owners de sync já em desenvolvimento por outro escritor | SHA, estado, gates, rollback, última prova | testes, política de deploy, health e runtime |
| Observabilidade | `src/components/central/ObservabilidadeCentralDark.tsx` | sensores Casa/VPS, origem, timestamp | dados reais e frescor, sem novo coletor |

### Snapshot de inventário — NÃO é execução

No snapshot versionado `forja-gaveta.snapshot.json` (fonte Git SHA `0f2b35f390a8f45330bd31a95aec355e1c58621c`): **999 arquivos SKILL.md** (996 sob `.agents` e 3 na raiz `skills`), **3 categorias de fonte de plugins**; a quantidade de plugins instalados/conectados não decorre disso. No snapshot `hud-migration.snapshot.json`: **189 seções**, **33 controles**, **87 seções com owner pendente**; `full_migration_proven=false`. Esses números são **históricos do snapshot**, não medições em tempo real; atualizar com um novo SHA e receipt ao regenerar.

## DELTAS / receipts append-only

### D001 — 2026-10-16 · Manifesto próprio incremental

- **Intenção:** prender os fios do harness privado ao Instinto Superior, com catálogo, gaveta histórica, HUD, terminal MCP, automações e receitas no mesmo cockpit.
- **Prova de base:** PR [#1832](https://github.com/ServerVpss/CentralDark/pull/1832) **merged** em `2026-10-16T13:16:31Z`, merge `c95d9cb55c447fd928c2ee8ed240827e8e00d9c0`; snapshots e `InfraestruturaSistema.tsx` confirmados na `main`. O merge **não comprova** publicação em produção.
- **Escopo desta gravação:** documento canônico incremental **dentro do Instinto Superior**, sem tocar `CockpitShell.tsx`, `AutoSyncButton.tsx`, API de sync, worktrees ou terminais que outro agente está operando.
- **Critério:** arquivo lido de volta na `main`, owner identificado, snapshots ancorados e pendências explícitas.
- **Pendente:** readback visual de catálogo/histórico; paridade integral HUD; sessão terminal correlacionada; boot local com JSON; status de deploy por SHA; reconciliação e faxina segura.
- **NEXT_CURSOR:** verificar readback deste manifesto → ligar sua projeção no setor de receitas existente, sem duplicar catálogo → testar build e runtime com writer do cockpit → inventariar gaps HUD por owner → comprovar sessão MCP.
- **FIXED_POINT:** progresso anterior preservado; nenhuma exclusão, rebase, force-push ou deploy por este documento.

## Regra de evolução

Para cada nova descoberta, **acrescentar D00N** com `SOURCE_SHA`, owner, delta, testes, contraprova, recibo e `NEXT_CURSOR`. Corrigir referências antigas por âncora/redirect em vez de apagar proveniência. Não promover um estado para verde sem prova. **🍒🎰🎲 Outra melhoria antecipada** deve explicar ganho, razão, evidência e próximo avanço.
