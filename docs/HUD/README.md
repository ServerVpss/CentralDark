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


## 🧹 Forja Viva — resultado desta rodada e checklist de worktree (15/10/2026)

**Intenção vigente:** continuar trabalhando ao lado do CHEFE no chat, sempre iniciando ganho verificado com **🍒🎰🎲 Outra melhoria antecipada**, sem supor que texto no chat equivale a comando enviado ao terminal. `#acordar → !calibrar → !CENTRALDARK` recupera contexto, owner, source SHA, prova, pendências e NEXT_CURSOR.

**Owners evoluídos, sem criar skill:** semântica 🧹 registrada em `docs/CONSCIENCIA/PADRAO-EMOJIS.md` na `main`; ciclo de limpeza e checkout em `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`; ponte de comportamento no `AGENTS.md` e na `.agents/skills/centraldark-operational-method/SKILL.md`. Na branch da **PR #1832**, `VISUAL-NAMING-REGISTRY.yml` recebeu grupo `faxina_segura`; `HudDeterministico.tsx` exibe o sétimo alias `WORKTREE_CLEANUP`, com checklist, owner, prova e estado `UNKNOWN`; `verify-hud-zone.mjs` recebeu teste dedicado.

**Classificação ao vivo (snapshot, NÃO número configurado):**
- Casa `K:\` com **33 mudanças tracked** e **ao menos 95 entradas untracked**. `CASA_MAIN=KEEP_ACTIVE`; não usar `git clean/reset`, não copiar/alterar arquivos de outro writer.
- VPS `/root/CentralDark` com **6 mudanças tracked**. `VPS_MAIN=KEEP_ACTIVE`.
- Scratch VPS canônico `/root/CentralDark/_worktrees/main-pinned-runtime-fastpath` presente; `git status --porcelain=v1 --untracked-files=normal` retornou **0 entradas**. `VPS_SCRATCH=READONLY_SAFE_CANDIDATE`; falta provar locks/owners/recibos/commit exclusivo para **autorizar** qualquer descarte. Nenhuma faxina foi executada nesta rodada.

**Checklist do CURRENT — sem preencher verdes falsos:**
- [x] 🟢 Fonte visual canônica atualizada na `main`, commit `6874a55087c32fd5aac9bd35d1a60ceab19495ec`.
- [x] 🟢 Skill de faxina existente evoluída na `main`, commit `b9ae142aeec967f1a38b23448c842470a83ef483`.
- [x] 🟢 `AGENTS.md` e método operacional atualizados na `main`, commits `8c0298824a9c4ed5b3d2f9bf0c5bb3a3d6c8995b` e `ef1fb274abc031dadef5d5d3fe29037b3db73e7a`.
- [x] 🟢 Atalho 🧹 escrito no HUD existente na branch da PR, sem novo executor; teste de contrato registrado.
- [x] 🟢 Casa e VPS inventariadas por leitura remota independente, sem executar limpeza.
- [ ] 🟡 `node --test` no mesmo SHA da PR + build Vite no runner adequado.
- [ ] 🟡 Readback da interface e screenshot na Casa quando o CHEFE pedir build visual.
- [ ] 🟡 Publicação do delta de UI na `main` somente após checks/readback, sem sobrescrever alterações dos writers.
- [ ] 🟡 Limpeza de scratch sob lock **somente após** prova de dispensabilidade, histórico/recibo íntegros e destino readback. Não limpar worktree ativa.

**Fechamento/FIXED_POINT:** a conformidade aceita pelo CHEFE é a do estágio anterior. `SOURCE_DEFINED=PASS`; `MAIN_DOCS=PASS`; `UI_SOURCE_BRANCH=PASS`; `NODE_TEST=UNKNOWN`; `BUILD=UNKNOWN`; `INSTALLED=UNKNOWN`; `WORKTREE_CLEANUP_EXECUTED=NO`. O checklist CURRENT será renderizado pelo owner já existente do HUD; este trecho é **receipt documental** e não cria um checklist concorrente.

**NEXT_CURSOR:** gates da PR #1832 com HEAD atual → teste/build se possível → decisão de promoção → readback real do cockpit → quando autorizado e seguro, limpar somente scratch descartável e registrar prova posterior.


## 🗄️ Harness Instinto Superior — gaveta histórica, catálogos e absorção HUD (15/10/2026)

**DELTA do CHEFE:** o Instinto Superior é o **harness privado visual** da CentralDark, ligado ao MCP e Hermes **já existentes**. Não criar outro cérebro, coletor, plugin ou interface concorrente. A Forja Viva absorve funcionalidades e aprendizagens preservando owner. "HARNES_BUILDADO" é **intenção arquitetural**; não equivale a binário compilado/deploy ou execução comprovada.

**Origens reconciliadas (GitHub main medida `0f2b35f390a8f45330bd31a95aec355e1c58621c`):**
- Gavetas existentes: `scripts/memory-linker/pattern-library.mjs` (Memórias, Regras, Skills, Testes, Guardrails, Contratos), leitura histórica em `docs/CONSCIENCIA/LEMBRANCAS/README.md`. Pattern Library derivada; não é um segundo cérebro nem ledger de conversas.
- Arsenal histórico dos 10 cards: `docs/CONSCIENCIA/RETOMADA-Arsenal-TelePainel.md`, datado 29/06/2026. São cards documentais e não devem inflar a contagem de skills instaladas.
- Skills: `.agents/skills` tem **996** `SKILL.md`, dos quais **4 em .archive** e **992 fora**; `skills/` contém **3**. Total **999 documentos SKILL.md da árvore Git exata**, inventariados em `apps/instinto-superior/src/data/forja-gaveta.snapshot.json`, com nomes, categorias, filtros, paginação e SHA.
- Plugins versionados nas famílias alvo: `.agents/plugins/centraldark-unified-surface-parity`, `apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard`, `apps/modulos/obsidian-plugin-grafo-vivo` = **3 fontes**. Número não é igual aos plugins instalados nas máquinas.
- Casa, prova filesystem somente leitura 15/10 13:16 BRT: **26 diretórios de extensão VS Code** (inclui múltiplas versões da mesma extensão) e **5 diretórios de plugin Obsidian em K:\docs\.obsidian\plugins**.
- VPS, prova filesystem 15/10 16:17Z: `~/.hermes/skills/` tem **95 SKILL.md** e 37 diretórios de primeiro nível; `~/.hermes/plugins/` tem **3 diretórios** (`homeassistant`, `hermes-dreaming`, `typed-core-telegram`).
- MCP, readback do `mcp_admin_catalog` e `skill_listar` da conexão Primary: **141 tools**, **13 rotas** e **3 skills da API skill_listar** (mermaid-skill, pretty-mermaid, vs-code-restore). São denominadores distintos e timestamps do snapshot permanecem visíveis.
- `apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx`: evolução da aba **Sistema CentralDark → Infraestrutura → Gaveta · Skills · Plugins**, com o mesmo componente exportado `GavetaForja` projetado na aba autenticada `HUD · Selos · Gênesis`. Nenhuma segunda tela/serviço/coleção.
- Nove owners de automação tipados, em `forja-gaveta.snapshot.json`: Skill Workshop, Memory Linker, skill-sync, testes, build POMBO64, refresco cockpit, Hermes, Claude Code, faxina de worktree. O clique seleciona/copia receita; não envia comandos em nome do CHEFE sem sessão e readback.

**Inventário estrutural HUD, sem falsa paridade:** `docs/HUD/HUD.html` no blob `3623be3ebd1e5e13046796b7b6895d37ce82585a`, 4.030 linhas, **189 títulos de seção e 33 controles com seletor detectados**, mais as 4 abas `HUD/MAPA/FORJA/OPERACAO`. Origem serializada em `apps/instinto-superior/src/data/hud-migration.snapshot.json` com linha, owner proposto e estado de prova. A extração de controles por seletor **não afirma recensear todos os eventos criados dinamicamente em JS**; nem todas as heurísticas de owner foram validadas em runtime. `HudDeterministico` agora permite navegar/filtrar esse inventário e chama `estado.refetch()` pela query viva já existente para o botão de atualização. Não migrou automaticamente efeitos sensíveis como chave Moltbook, formulários, acesso Casa, delegação ou sync destrutiva; permanecem no owner existente até adapter autorizado e readback.

**CLAUDE_CODE:** Casa VS Code janela PID 22468, processos Claude PID 21204 e 30564, Hermes PID 4892/10552/18256 identificados por leitura. `mcp__CENTRALDARK__list_sessions` = `No active sessions`; tentativa do foco via PowerShell sob política da Casa retornou `PSSecurityException`. **`CLAUDE_TERMINAL_SEND=NOT_SENT`**; processo existente não prova terminal manipulável, e não contornamos a restrição. A receita tipada foi acrescentada à Gaveta somente em modo `COPY_ONLY`.

**Teste e estados deste DELTA:** suite `verify-hud-zone.mjs` evoluída para **10 testes definidos**, cobrindo contagem, proveniência, labels, inventário 189/33, single owner, ausência de despacho e a nova prop `atualizar`. `CODE_COMMITTED_IN_PR=true`; `NODE_TEST_RUN=UNKNOWN`; `VITE_BUILD=UNKNOWN`; `ZIP_POMBO64=NOT_BUILT`; `DEPLOY_PROD=NOT_PROVEN`; `VISUAL_CASA=NOT_PROVEN`. Não confundir os checks estruturais feitos por leitura com CI PASS.

**NEXT_CURSOR:** validar CI/Node/Vite no HEAD exato da PR #1832; resolver somente feridas causais; provar interface do catálogo/HUD no runtime; reconciliar owners dos controles sensíveis e sensores MMF Casa (read-only) pelo MCP existente; descobrir terminal VS Code com sessão controlável para handoff real ao Claude/Hermes, exigir ACK/receipt; só então considerar promoção da paridade e faxina 🧹. Manter arquivo legado como template/histórico até substituição integral demonstrada.


## 🪛 CI do harness — contraprova real no HEAD da gaveta

**Inspeção por job logs oficiais no HEAD `5088569527b1f233c11a1c247ff6ba9415431b6d` (antes do hotfix de clipboard):**
- `guard`, workflow run 38768407685: `NO_SILENT_ERROR_RATCHET=FAIL new_findings=1` aponta **`HudDeterministico.tsx` erro silencioso `.catch(() => {})`** na cópia da missão Gênesis. **Delta causal reparado** no mesmo owner, commit `df7556b02149fa43765c8c70bb949b5072f1d774`: mostra `FAILED` ou `COPIED` ao usuário sem despacho. O teste existente foi reforçado no commit `6b8f04d89d9c2b82cf8f21e4d1936180835a7fbb`.
- `Provar pacote, funil e contraprova`, run 38768407871: `REPO_CONTRACT_VERIFY=FAIL failed=3`. Fatos distinguíveis nos logs: `GLOBAL_LEARNING_LINEAGE=FAIL` com `APRENDIZADOS_GLOBAL_LINEAGE_PROJECTION_DRIFT` e `LINEAGE_MANIFEST_DRIFT`; `docs/CONSCIENCIA/APRENDIZADOS.md` sequência numérica (esperado 171/172 e inconsistências); `SOUL_STALE` após mudança em `AGENTS.md`. São **outras dependências/owners**, não corrigir fazendo renumeração cega do Gênesis nem forçando SOUL sem sua contraprova. Seguem `YELLOW/BLOCKED` até correção no owner.
- `Porta, identidade e governança`, runs 38768620793 e 38768400760, jobs finais com falha, requerem reconciliação no respectivo gate (sem confundir com sucesso de testes locais).

**Estado honesto:** os logs acima pertencem ao SHA `5088569`, **não** ao HEAD após hotfix. Nova execução de CI é exigida para provar a correção de clipboard. Não houve `node --test` local, compilação Vite, pacote POMBO64, sessão Claude vinculada, merge nem deploy neste ciclo.


## 🍒 Cabeça Externa — catálogo A–Z ancorado

**INTENT:** cristalizar os princípios ensinados pelo CHEFE e oferecer leitura alfabética no **mesmo** Instinto Superior, sem painel novo. **Natureza desta seção:** ensinamentos/síntese da conversa de 17/10/2026, não execução de runtime nem censo do ledger NeuroLink. Os 26 verbetes são *índice humano curado*, não 26 novos aprendizados numerados nem 26 novos selos.

| Letra | Princípio | Regra verificável / aplicação |
|---|---|---|
| **A** | **Autocrítica** | Reconhecer erro e medir sua causa, sem atribuir sucesso por convicção. |
| **B** | **Bridge** | Reusar a ponte autorizada Casa ↔ VPS ↔ GitHub antes de criar transporte paralelo. |
| **C** | **Convergência** | Um organismo e um cockpit; múltiplas capacidades continuam com seus owners. |
| **D** | **Disciplina** | Treinar deliberadamente com hipótese, esforço focado e diferença observável. |
| **E** | **Ego em xeque** | Contraprova tem prioridade sobre defesa do próprio resultado. |
| **F** | **Frutos** | Saúde e qualidade se comprovam por efeito, teste e receipt. |
| **G** | **GitHub** | Main é fonte técnica versionada; merged não significa deployed. |
| **H** | **Hermes** | Executor reaproveitado; não duplicar motor, agenda ou memória. |
| **I** | **Intenção viva** | Cada pedido é delta da intenção, com contexto e owner recuperados. |
| **J** | **Julgamento** | A realidade e a contraprova decidem PASS/FAIL/UNKNOWN. |
| **K** | **Kaizen** | Observar, experimentar com segurança, medir, reter o que funciona. |
| **L** | **Legado** | Migrar com paridade, referência e rollback; não apagar a fonte cedo. |
| **M** | **Mentoria** | Consultar técnicas já provadas para encurtar descobertas repetidas. |
| **N** | **Não duplicar** | Procurar o owner e o objeto atuais antes de adicionar uma peça. |
| **O** | **Observação** | Pausa intencional, falha e ausência de sensor são estados diferentes. |
| **P** | **Papagaio OFF** | Respostas curtas; preservar a árvore de provas nas âncoras. |
| **Q** | **Qualidade** | Performance, testes, segurança e UX são critérios, não adjetivos. |
| **R** | **Receipts** | Registrar escopo, SHA, owner, timestamp, prova e NEXT_CURSOR. |
| **S** | **Segurança** | Segredos fora dos logs e da UI; uma caneta por escopo. |
| **T** | **Treinamento deliberado** | Repetição só vira aprendizado ao corrigir fraquezas medidas. |
| **U** | **Unificação** | Instinto Superior é a única superfície admin humana; owners seguem especializados. |
| **V** | **Validação** | Cópia parcial, porta aberta e HTTP 200 não fecham o ciclo. |
| **W** | **Worktree** | Preservar alterações e artefatos da Casa e da VPS; sem limpeza automática. |
| **X** | **XP operacional** | Lições viram ganho quando o resultado é reproduzível, não por tentativa acumulada. |
| **Y** | **YAML / contratos** | Contratos versionados orientam testes e handoffs; configuração não comprova runtime. |
| **Z** | **Zelo** | Observar tudo, reter o bem, registrar o aprendizado e evitar regressão. |

### Onde aparece, sem casca paralela

- **Destino humano:** `admin.centralldark.com` → Sala de Controle autenticada → Instinto Superior → aba **HUD · Selos · Gênesis** → seção interna recolhível **Cabeça Externa · A–Z**. Não adicionar oitava seção PAPAGAIO nem 11ª missão MCP; inserir conteúdo dentro do zone de conhecimento já existente.
- **Owner de UI já existente:** `apps/instinto-superior/src/components/central/HudDeterministico.tsx`, consumido por `CockpitShell.tsx`. Responsável pela evolução do componente: **PR #1843** (ativa); integrar **nesse mesmo escopo/escritor**, não editar por janela concorrente. Não acrescentar nova store, tabela persistente, coletor, API, skill, rota ou fonte de autoridade.
- **Fonte de aprendizagem:** `docs/CONSCIENCIA/APRENDIZADOS.md` + `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`. Esta tabela é o **índice editorial** deste contrato até existir vínculo verificável por UID; não inventar UID, número de lição ou resultado operacional para cada letra.
- **Origem legada:** `docs/HUD/HUD.html` permanece intacto, com referências preservadas. A seção A–Z é uma âncora adicional, não substitui Gênesis, selos, cadeados e zonas existentes.
- **Visual:** mesma pele, tipografia e componentes já utilizados; pesquisa alfabética acessível, acordeão compacto, uma letra por verbete, detalhes de prova/owner só quando existirem. Responsivo mobile, sem segundo menu, sem indicador PASS para princípios apenas documentados.
- **Teste discriminante no owner:** `apps/instinto-superior/scripts/verify-hud-zone.mjs`; confirmar 26 letras únicas e em ordem, interação teclado/busca, zero disparo implícito, permissão admin, nenhuma mudança nas 7 seções/10 missões, quatro peles preservadas, e build + readback visual na mesma SHA.

**RECEIPT / PROVA:** `DOC_ANCHOR=GITHUB_MAIN_READBACK_REQUIRED`; `UI_INTEGRATED=UNKNOWN`; `BUILD=UNKNOWN`; `DEPLOY=UNKNOWN`; `RUNTIME=UNKNOWN`. Não promover apenas pela presença desta especificação.

**NEXT_CURSOR:** reconciliar com PR #1843 → aplicar menor delta no `HudDeterministico` pelo writer do componente → rodar suíte e build no HEAD exato → readback da sala autenticada → receipt + decisão de promoção com os gates existentes. Preservar a migração da Casa/VPS e as alterações locais.


<!-- CENTRALDARK_BROWSERS_VSCODE_20261017 -->
## 🍒 Conexão Casa · Chrome for Testing · VS Code — evidência de 17/10/2026

**INTENT_ID:** CENTRALDARK-CHROME-VSCODE-OBSERVABILIDADE-MICRODEPLOY-20261017. **OWNER DE UI:** `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx`, em edição na PR #1838; **não editar por segunda caneta**. Consumidor: `PainelAdminCentralDark` / Sala de Controle do Instinto Superior. Este bloco documenta o delta, não afirma instalação nem deploy.

**Prova visual enviada pelo CHEFE:** duas janelas **Chrome for Testing v155.0.8059.39** (perfis **Default** e **Profile 1**, associados ao cache Puppeteer nas telas) e uma janela **Chrome oficial v155.0.8059.85** (Profile 14 na captura). `chrome://version` identifica executável/perfil do navegador mostrado; capturas não atribuem processo/PID de terminal, não comprovam sessão Zendriver/CDP, Puppeteer conectado, Playwright em execução ou perfil de automação apto para testes. Preservar perfis, cookies, histórico, login e sessões; **não copiar dados do perfil**.

**Erro visível:** VS Code exibiu `A janela terminou inesperadamente (motivo: oom, código: -536870904)`. Isso confirma encerramento por falta de memória no processo/janela, **não identifica a extensão, Chrome ou PID responsável**. Sem amostra de CPU/RAM/pagefile simultânea não atribuir causalidade. Não reiniciar nem matar processos durante a migração sem coordenação do CHEFE.

**Prova de ponte independente (consulta MCP, 17/10/2026 08:59:26 UTC):** `sector=vscode`, `kind=vscode_bridge_status`, `route=tailscale`, `state=OK`, `source_last_write_utc=2026-10-17T08:50:12.6276681Z`, `offset=3068781`, `playwright=null`. A fonte voltou a avançar após 08:05 UTC; heartbeat não prova conexão interativa ao PTY ou leitura de PID. A função `Get-PlaywrightProbe` já existe em `scripts/casa/vscode-log-bridge.ps1`, enquanto `apps/modulos/mcp/src/vscode-log-route.js` interpreta `playwright`; `null` exige `UNKNOWN`, não `NOT_RUNNING` ou `PASS`.

**Projeção mínima no cockpit existente:** no cartão/zona de Observabilidade já pertencente à PR #1838, apresentar separadamente `CHROME_TESTING_OBSERVADO_EM_IMAGEM`, `CHROME_NORMAL_OBSERVADO_EM_IMAGEM`, `VSCODE_OOM_OBSERVADO_EM_IMAGEM`, `VSCODE_LOG_BRIDGE_LAST_HEARTBEAT`, `PLAYWRIGHT_RUNTIME=UNKNOWN`, `CHROME_PID=UNKNOWN` e `PTY_MCP_INTERACTIVE=NOT_PROVEN`, com origem, timestamp e limite de prova. **Não** tornar a foto estado online permanente. Sem nova API, coletor, store, tela, rota ou executor. Quatro peles e controles do HUD permanecem.

**Gates para microdeploy:** PR #1838 no HEAD exato + dependências das PRs #1842/#1843 conforme owner → suíte `apps/instinto-superior/scripts/verify-hud-zone.mjs` + build → CI no mesmo SHA → readback autenticado do cockpit e das quatro peles → deploy seletivo com prova de SHA e rollback → receipt. Os workflows atuais usam runners self-hosted que podem estar intencionalmente pausados pela migração; `QUEUED` não é `DEPLOYED`. O fallback MAIN-PINNED existente lista owners `mcp/hub_bot/hermes/oauth_broker`, **não autoriza usar owner falso para publicar Instinto Superior**.

**CURRENT:** `DOCUMENTED_MAIN=PASS_AFTER_READBACK` (quando o commit for comprovado); `UI_SOURCE_PR1838=NEEDS_WRITER`; `CI=UNKNOWN`; `MICRODEPLOY=NOT_PROVEN`; `RUNTIME_VISUAL=UNKNOWN`. **NEXT_CURSOR:** responsável pela PR #1838 consome este índice, implementa menor delta e prova build/deploy na rota aprovada após o runner voltar, preservando trabalhos locais e a cópia VPS 4.
