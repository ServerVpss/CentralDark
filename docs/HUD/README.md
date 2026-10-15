# 🪬 HUD histórico → Instinto Superior · documento de migração

**Intenção do CHEFE (15/10/2026):** o `docs/HUD/HUD.html` é a **fonte de capacidades legado**. Todas as capacidades devem convergir para o **zone de navegação existente** no Instinto Superior. `docs/HUD` fica como referência, ensinamento, template e prova de paridade até que as funções sejam comprovadamente migradas. Nenhuma exclusão antes do inventário e do teste de paridade.

## Fonte e owners

- Fonte legada: `docs/HUD/HUD.html`; preservar selos, nomes, CSS/temas, JS, contratos de DOM, ações e histórico. **NÃO APAGAR** por haver novo botão.
- Linhagem atual: `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`. A fonte canônica tem **198 seções + L000**; o snapshot embutido no HUD HTML antigo dizia **169 elos**. UIDs legados e lacunas são preservados, não renumerados.
- Destino de UI: `apps/instinto-superior/src/components/central/CockpitShell.tsx`, reutilizando o `Tabs` autenticado. Componente parcial extraído: `HudDeterministico.tsx`. Sem segundo cockpit.
- Owners de runtime permanecem os mesmos: Hermes Gateway/kanban; MCP/log-funnel; One Heart; APIs autenticadas; extensão `skills/vs-code-restore`. Documentar aqui não cria serviços.
- ZIP/plug-and-play é um **artefato de atualização com hashes**, nunca autorização para substituir estado local divergente ou apagar dados.

## Inventário agrupado das capacidades do HUD

| Domínio legado observado | Destino no zone existente | Estado da migração nesta branch |
|---|---|---|
| Replay Gênesis, passo, pausa, reset, leitura de UID | HUD · Selos · Gênesis | **SOURCE_NATIVE**; readback gráfico pendente |
| Hermes tipado por UID, geração de missão sem IA | Mesmo zone, prévia e copiar missão | **SOURCE_NATIVE**; envio real ao Gateway NÃO migrado |
| Nomes de 15 cadeados históricos e lei ENTROU_TEM_QUE_SELAR | Mesmo zone, inventário histórico | **SOURCE_NATIVE**; verificação live de campos/selos NÃO migrada |
| Fixed Point (10 critérios observáveis) e aceite | Reality Judge/estado existente | **PENDENTE DE PARIDADE** |
| Estados de Casa, VPS, Tailscale, bridge privado e MCP | Sistema CentralDark/observabilidade existentes | **PENDENTE DE PARIDADE** |
| One Heart, mapa de API/13 rotas, metas/goal loop | Sistema CentralDark/owners já existentes | **PENDENTE DE PARIDADE** |
| MSI Afterburner (51 sensores), Screenpipe e telemetria | Observabilidade CentralDark | **PENDENTE DE PARIDADE** |
| Skins/temas, responsividade, HUD relógio e notificações | Design Center/peles e componentes existentes | **PENDENTE DE PARIDADE** |
| Operações GitHub, PRs, deploy, auto-sync, status de arquivos | Sync Center/Forja | **PENDENTE DE PARIDADE** |
| Mapas, Obsidian, grafos, instalação, bibliotecas e skills | Navegação de capacidades existente | **PENDENTE DE PARIDADE** |
| Auditores determinísticos de botões e lacunas | Reality Judge/QA | **PENDENTE DE PARIDADE** |

A tabela é **inventário por domínio**, não prova de censo individual de todos os botões/scripts do HUD. Inventário exaustivo de IDs, listeners, CSS e endpoints ainda é necessário para declarar migração integral.

## Leis de selo e de Gênesis

1. Um novo selo exige `owner, scope, proof-key, source-sha, receipt, readback, observed-at, next-cursor`.
2. Selos históricos são datados e não viram PASS CURRENT por apenas aparecerem em UI. Novos selos têm trilha operacional separada de UIDs Lxxx; replay de aprendizados não é execução.
3. O Gênesis só avança diante de `prev_uid/next_uid` íntegros, com último `PENDING_NEXT_CURSOR`. `PASS_REPLAY_DOCUMENTAL != GATE_CI_PASS != RUNTIME_PASS`.
4. Hermes sem IA: formar texto de missão determinístico é permitido; `PREPARED != TASK_CREATED != EXECUTED != RECEIPT_CONFIRMED`. API autenticada e autorização continuam separadas.
5. Um único writer por escopo; alterações locais sujas da Casa/VPS permanecem intactas. Novo componente é parte do cockpit original, não aplicação paralela.

## Provas observadas na branch

- Readback GitHub da fonte: `docs/HUD/HUD.html` ~4.030 linhas e manifesto `ENTROU_TEM_QUE_SELAR`; 15 nomes de cadeados.
- Linhagem JSON: `L000 + 198 nós`; arestas `prev_uid/next_uid` verificadas e último cursor `PENDING_NEXT_CURSOR`.
- Tab autenticada adicionada ao `CockpitShell` original; sem `iframe`, sem criar outro Hermes, sem modificar o HUD HTML antigo.
- Checagem estática: **10/10 invariantes** na mesma branch; são verificações de fonte, NÃO build/URL/UI.
- Suíte de regressão `apps/instinto-superior/scripts/verify-hud-zone.mjs` adicionada para rodar no checkout materializado: `node --test scripts/verify-hud-zone.mjs`, a partir da pasta do app. **Execução da suíte e build Vite ainda não comprovados.**

## NEXT_CURSOR

Build/CI da PR isolada → corrigir apenas falhas reais do owner → readback em zone autenticado → migrar em lotes de capacidades (sensores, contratos, temas, controle/aceite, Hermes Gateway) com prova de paridade → só então reduzir o legado a manifesto/template, nunca quebrar links/owners históricos.

**Conformidade por escopo:** fonte/inventário parcial documentados; `100%` de satisfação declarado pelo CHEFE não equivale a conformidade técnica integral. `RUNTIME_HUD_MIGRATED=NOT_PROVEN`.


## Retomada operativa — 15/10/2026 11h50 BRT

**Gatilhos falados no chat:** `#acordar → !calibrar → !CENTRALDARK`. Mesmo owner em `.agents/skills/centraldark-operational-method/SKILL.md` da `main`. Não são comandos shell nem prova de execução automática. Cada mensagem de nova descoberta deve começar por **🍒🎰🎲 Outra melhoria antecipada**, indicando ganho, motivo, prova e cursor.

**Prova de runtime lida nesta rodada:** Casa `SEGREDO` e VPS `CENTRALDARK-OS` responderam por conectores independentes; VS Code `Code.exe` PID **22468**, HWND **67400**, `foreground=true` (valores efêmeros); `Hermes.exe` com três processos encontrados. VPS `tailscaled`, `hermes-gateway`, `centraldark-native-mcp-http` ativos; quatro runners GitHub. O funil MCP canônico respondeu `ingest=OK` com **0 novos eventos naquele ciclo**; job Hermes recorrente com 2 sinais em 90 minutos; **nenhuma delegação viva nova comprovada**. `LOG_FUNNEL_PRESENT != RAW_TERMINAL_STREAMING`.

**Checklist diário:** owner histórico já existe em `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`. O zone `HudDeterministico` agora recebe a **mesma prop de estado** de `CockpitShell` e apresenta GitHub, API, VPS/deploy, Screenpipe, Hermes e recibos sob um único componente. O owner de saúde continua `ObservabilidadeCentralDark`; não há segundo coletor. Se Hermes/Unigram/CentralDark.exe estiver fechado por escolha, não classificar como falha.

**Faxina/Forja:** foi localizada a skill `.agents/skills/main-pinned-runtime-fast-path/SKILL.md` e o scratch canônico `/root/CentralDark/_worktrees/main-pinned-runtime-fastpath` com lock, guard de realpath e receipt antes de cleanup. VPS checkout principal apresenta **seis arquivos rastreados modificados**; Casa tem worktrees ativos. **Não limpar nenhum deles.** `SCRATCH_RESET != MAIN_RESET`.

**Deliberação Hermes pelo terminal:** a janela do VS Code estava em primeiro plano, porém a operação de consulta ao CLI Hermes foi bloqueada pela ferramenta. **Nenhum comando foi digitado no terminal existente, nenhuma tarefa nova foi delegada e nenhum acompanhamento contínuo foi iniciado por essa rota.** Operação posterior deve confirmar foco do terminal-alvo, executor único, permissão e readback, sem tentar contornar bloqueios.

**Dívida identificada:** a suíte `apps/instinto-superior/scripts/verify-hud-zone.mjs` ainda verifica a sintaxe anterior `<HudDeterministico />` enquanto o cockpit já usa `<HudDeterministico estado={dado} />`. Tentativa de atualizar o teste foi bloqueada pela ferramenta. Assim, `TEST_CONTRACT=STALE`, `BUILD=UNKNOWN` e `UI_PROVEN=NO`. Atualizar a mesma suíte quando possível, sem abrir outra PR nem declarar PASS.

**NEXT_CURSOR:** atualizar contrato de teste → executar teste + build em clone/worktree isolado do disco K: vinculado ao VS Code → ler CI mesma SHA → conferir interface no cockpit real → migrar os domínios restantes do HTML legado com paridade até que ele se torne apenas documentação. Sem merge/deploy prematuro.


## FIXED_POINT / Forja Viva — pacote de aliases e build plug-and-play (15/10/2026)

**Aceite do CHEFE:** `SATISFACTION_STAGE=100_PERCENT_ACCEPTED_BY_CHEFE`; manter a paridade parcial já concluída e abrir cadeado apenas para DELTA novo verificado. Isso **não implica** `TECHNICAL_CONFORMITY=100%` sem métricas e UI real.

**Owners reaproveitados:**
- `docs/CONSCIENCIA/PADRAO-EMOJIS.md` — significado humano, sem execução de shell (regra cristalizada na main).
- `docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml` — identificação visual da Forja (mesma arquitetura, sem agente paralelo).
- `.agents/skills/centraldark-operational-method/SKILL.md` e `AGENTS.md` — contratos globais de recuperação e repetição; ambos registram o alias sem criar skill nova.
- `apps/instinto-superior/src/components/central/HudDeterministico.tsx` — UI dentro do zone já existente, sem copiar o HUD legado.
- `apps/instinto-superior/package.json` e `apps/instinto-superior/scripts/build-plugplay.mjs` — rotina de build (uma implementação técnica, não nova receita/owner).
- `apps/instinto-superior/scripts/verify-hud-zone.mjs` — mesmo teste, atualizado para nova assinatura de props e aliases.

**Aliases exibidos no cockpit:** 🔧 🛠️ 👨🏻‍🔧 👀 👁️ 🪡 🎄 🌞 🌟 ✨ ☄️ 🔥 🪛 ⚒️ → seis grupos `DIAGNOSTICAR`, `MANUTENCAO`, `OLHO`, `LINHAGEM`, `ANTECIPACAO`, `FORJA_PACOTE`. Um clique **seleciona** receita tipada com propósito, ganho, owner, comando fixo e prova; outro clique **copia** texto. Não executa, não faz deploy, não abre outro terminal e não eleva permissões. Zoom usa controles já presentes no VS Code e navegador.

**Build POMBO64 sob demanda:** `cd apps/instinto-superior && npm run build:plugplay` → `npm run verify:hud` (Node test) → `npm run build` (Vite já existente) → `node scripts/build-plugplay.mjs` (usa `jszip` já declarado). Saída por padrão no diretório `.artifacts/instinto-superior` **do próprio checkout**; se o checkout estiver no K: montado no VS Code, permanece no K:. `CENTRALDARK_FORGE_ARTIFACTS` pode apontar explicitamente para o vault de artefatos do mesmo volume, sem tocar `C:` ou `/tmp` involuntariamente.

**Cadeados no empacotamento:** pacote id imutável `CENTRALDARK-INSTINTO-SUPERIOR`, `POMBO-CENTRALDARK`, SHA `SOURCE`, revisão baseada no commit, inventário de arquivos compilados com SHA256, `SHA256SUMS.txt`, manifesto/contratos `manifest.yml capabilities.yml owners.yml dependencies.yml install.yml uninstall.yml rollback.yml tests.yml receipt.yml`. Falha segura para fonte modificada no fileset causal, symlink, tamanho excessivo, item sensível ou saída ausente. Se existir ZIP de mesmo nome, reutiliza somente com hash igual. Não apaga artefato prévio nem instala/deploya. `parent_package_sha256` opcional é referência, não prova de pai validado.

**Prova medida neste DELTA:** GitHub releitura mesma branch: **14/14 invariantes estáticos** coerentes (significado emojis nos dois owners e UI, test/cockpit, manifesto, paths, lineage e bloqueio autoexec). Receita do teste anteriormente desatualizada foi corrigida no SHA `eca0bea46`. A tentativa de criar staging na Casa via Desktop Commander foi bloqueada pela ferramenta; **Node test executado = UNKNOWN**, **Vite build = UNKNOWN**, **ZIP produzido = NÃO**, **UI em runtime = NÃO COMPROVADA**. Não contornar o bloqueio via outra rota; aguardar o pipeline autorizado.

**NEXT_CURSOR:** CI da PR #1832 no HEAD exato → executar testes em runner limpo/autorizado → compilar → validar ZIP e hash → readback do cockpit no runtime → migrar demais sensores/ações do HUD e provar paridade antes de reduzir docs/HUD/HUD.html a template. Retomar pelo `#acordar / !calibrar / !CENTRALDARK`; não repetir mapeamento completo nem limpar worktree ativa.
