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


### D002 — 2026-10-16 · VS Code multiagente + Instinto:3000/Tailscale observado

- **SOURCE_MAIN_SHA na medição:** `3e800e7dd9440ba4ee2dc9455aeaa1e57295dcdc`.
- **Intenção:** mapear a “outra porta” e a bancada VS Code sem disputar o writer que trabalha no Auto Sync.
- **Instinto Superior vivo na Casa:** processo `node.exe` foi observado executando `apps/instinto-superior/.../vite.js dev --host 127.0.0.1 --port 3000 --strictPort`; `tailscaled.exe` apresentou listeners no mesmo `:3000` na interface tailnet. Isto reconfirma a rota já cristalizada em `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-10-15-CIRCUITO-IPHONE-TAILSCALE-CASA-COCKPIT.md`; não nasce nova receita.
- **VS Code vivo:** janela `Code.exe` observada com título apontando para `code-server (...preview.emergentagent.com)`. A árvore do mesmo processo contém terminais integrados e ferramentas multiagente.
- **Hermes:** terminal integrado observado com `hermes.cmd acp` e outro com `hermes.cmd chat`. Processo observado ≠ GOAL entregue; ACK tipado continua necessário.
- **Claude Code:** processo CLI observado como filho de terminal PowerShell do VS Code; a árvore contém MCPs e uma sessão SSH para a VPS. Isso prova presença/sessão ativa, não prova que o MCP CentralDark consegue anexar-se à sessão arbitrária.
- **Cloud Code:** dois processos `cloudcode_cli.exe duet -trace -logtostderr` observados no extension host do VS Code.
- **Codex:** `codex.exe ... app-server` observado dentro da árvore do VS Code.
- **Antigravity:** hub `agy.exe --hub` observado no extension host; porta do hub é runtime volátil e não deve virar endpoint canônico sem owner/readback.
- **Screenpipe:** processo `screenpipe-mcp` observado na árvore; catálogo/processo ≠ sensor material até readback do owner.
- **SSH Casa→VPS:** sessões `ssh.exe` para alias `segredo-vpss` observadas dentro da árvore do VS Code/Claude, coerentes com receitas já existentes.
- **Receita reutilizada:** `skills/vs-code-restore/SKILL.md` já contém `TARGET_WINDOW → TARGET_TERMINAL → FOCUS_READBACK → SEND_ONCE → READBACK → CONTRAPROVA → RECEIPT` e a seção MCP CentralDark. **Nenhuma nova skill de terminal foi criada.**
- **Fronteira:** `mcp__CENTRALDARK__list_sessions` lista sessões criadas/geridas pelo conector, mas os PIDs dos terminais integrados acima não apareceram como sessão anexável. Portanto `VSCODE_TREE_PROVEN=PASS`, `MCP_ARBITRARY_SESSION_ATTACH=UNKNOWN`, `INTERACTIVE_ROUNDTRIP=NOT_PROVEN`.
- **PR #1832:** readback atual confirmou `state=closed`, `merged=true`, merge `c95d9cb55c447fd928c2ee8ed240827e8e00d9c0`. Resumos antigos que diziam `dirty/open` são históricos, não CURRENT.
- **NEXT_CURSOR:** projetar estes módulos no registry do harness → manter estados parciais honestos → provar uma sessão terminal por identidade + input autorizado + ACK/readback correlacionado → então habilitar ação interativa no cockpit.
- **FIXED_POINT:** nenhum reset, clean, rebase, restart, envio de texto ou interrupção foi executado neste delta; apenas leitura e cristalização do mapa vivo.

### D003 — 2026-10-17 · CentralDark Commander Tailscale + recuperacao SSR VPS

- **SOURCE_MAIN_SHA:** `380253366019287cd9c0b731fd34a535888c9ec7` (readback VPS = GitHub main).
- **GOAL:** reutilizar Desktop Commander MIT `0.2.48` como motor local e o MCP CentralDark como control plane; usar Tailscale privado e o Cockpit existente, sem criar servidor paralelo.
- **OWNERS:** `apps/modulos/mcp/src/admin.js`, `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx`, `apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat`, `apps/instinto-superior/scripts/fix-node-ssr-cycle.mjs` e artefatos compilados MCP.
- **FRONTE VPS:** Caddy apontava `admin.centralldark.com` a SSR `127.0.0.1:25812` parada (HTTP 502). Reativada, gerava `createServerFn is not a function` (HTTP 500). Corrigido no pos-build existente, sem alterar autenticacao nem CSRF; novo `npm run build:vps` retornou HTTP 200 na rota SSR.
- **FRONTE CASA:** peer SEGREDO online via Tailscale; WinRM TCP 5985 OPEN, Screenpipe TCP 3030 OPEN, SSH TCP 22 TIMEOUT. Porta 3000 HTTP 404; HTTPS privado `windows-casa.tail6d7aa4.ts.net` HTTP 502. Runners GitHub Casa offline; sem sessao Windows autenticada.
- **DELTA:** launcher existente fixado em Vite `127.0.0.1:3000 --strictPort`. Admin MCP protegido mede Casa e porta 3000. Cockpit projeta CentralDark Commander e link para o owner administrativo.
- **PROVA:** `node --check`, ESLint componente, `npm run build` MCP, `npm run build:vps` Instinto e fixture de pos-build com comparacao byte a byte PASS. VPS HTTP 200 em `/`, `/sala-controle`, MCP `/health` e `/intent/manifesto`; `/admin/api/tailscale` sem sessao retorna 401.
- **LIMITE:** `CODE_IN_MAIN=PASS`, `VPS_SSR_DEPLOY=PASS`, `MCP_HEALTH=PASS`, `CASA_DEV_PORT_3000=HTTP_404`, `CASA_TAILSCALE_HTTPS=HTTP_502`, `CASA_POWERSHELL_EXECUTION=UNPROVEN`, `NATIVE_START_PROCESS=NOT_IMPLEMENTED`. Disco raiz VPS em 100% de uso: nao apagar dados funcionais em operacao de outro escopo.
- **NEXT_CURSOR:** sincronizar main na Casa e executar launcher existente pelo Windows autenticado; provar `localhost:3000 HTTP 200`, Tailscale Serve HTTPS 200 e login admin; so depois adicionar acao remota autenticada ao owner preexistente.
