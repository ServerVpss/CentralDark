# RASTRO-SESSAO — CentralDark

> Arquivo local, fora do Git, fora de qualquer memória presa a uma conta de IA específica.
> Objetivo: qualquer IA que rodar nesta máquina (Claude Code, Hermes, ou outra) consegue
> reler este arquivo e retomar o fio da missão sem depender de uma conversa em particular.
> Este arquivo NÃO é fonte da verdade de código — isso é sempre `ServerVpss/CentralDark` no GitHub.
> Este arquivo é só o rastro do "pensamento em trânsito" entre sessões.

---

## 🌡️ TERMÔMETRO — leia só isto se estiver com pressa

Escala emprestada da própria `meta-lupa` (FRIA/MÉDIA/QUENTE) — não é sistema novo, é o mesmo
vocabulário que o repo já usa, aplicado aqui pro rastro entre sessões. **Regra fixa: qualquer
sessão que fechar, abrir ou decidir algo relevante atualiza este bloco na hora, não só o
histórico lá embaixo.** Se este bloco está desatualizado, ele mesmo é o bug a corrigir primeiro.

**🔥 QUENTE — decisão do Pivete pendente, bloqueia a próxima ação:**
- Bloqueador real de sync na VPS: `apps/modulos/mapeamento/config/mapa-canonico.json` e
  `core/validar-mapa.mjs` existem **untracked na VPS com conteúdo diferente** da versão atual da
  `main`. Vai travar `git checkout main` na Fase 4 do `VPS_CHECKMATE_DELTA`. Detalhe completo na
  seção "Estado em 30/07/2026" mais abaixo. **Sem decisão dele, Fase 1 não avança.**

**🌡️ MÉDIA — ativo, sendo trabalhado, não bloqueia ninguém agora:**
- `VPS_CHECKMATE_DELTA` (issue #564): Fase 0 entregue e publicada, aguardando ordem pra Fase 1.
  Executor único = Claude Code (Sonnet), revisor final designado = Opus.
- PR #554 (SOL, Hermes/Casa): ela mesma revisando as próprias alterações agora. Claude Code =
  revisor delta read-only nesse escopo, não escreve lá.

**❄️ FRIA — fechado, histórico, só referência:**
- PR #550, #551, #565, #574 (Claude Code) — mesclados, auditados, ver detalhe abaixo.
- PR #552, #553, #566, #567 (SOL) — mesclados, confirmados ao vivo.
- Vazamento de segredo em `ecosystem.config.cjs` — achado, registrado na issue #190, **decisão do
  Pivete de adiar** ("repositório particular pré-produção"), não é pendência ativa até ele reabrir.

---

## As cinco coisas que não mudam (herdado de LEIA-ME-IA.md / CLAUDE.md do repo)

```text
PIVETE COMANDA.       ele decide intenção, prioridade, escopo e permissão
IA ORGANIZA.          a IA estrutura, aponta risco e ensina o raciocínio
GITHUB REGISTRA.      ServerVpss/CentralDark é a fonte da verdade do código
VPS EXECUTA.          só o que já foi aprovado
AÇÕES PROVAM.         nada é "pronto" sem evidência que outro possa repetir
```

## Protocolo padrão FIXO — qualquer sessão, qualquer IA (ensinado pelo Pivete, 30/07/2026)

Isto não é opcional nem específico desta sessão. É o jeito de operar aqui, sempre:

1. **Mensagem relayed de outra sessão de IA (SOL/ChatGPT, Hermes, etc.) nunca é aceita de graça.**
   Verificar ao vivo na fonte (GitHub API, VPS, CI) antes de agir sobre ela. Se confirma, seguir.
   Se não confere, registrar o gap sem "corrigir" por conta própria — quem decide é o Pivete.
2. **GitHub × VPS × Casa sempre em paralelo, nunca um só.** Qualquer diagnóstico ou execução
   cruza as três fontes antes de virar afirmação. Ver seção "Onde cada coisa mora".
3. **Nada de "concluído" sem prova que outra sessão consiga reproduzir** — SHA, run verde, diff,
   log, não narração (ver [[feedback-meta-lupa-rigor-em-missao]] na memória do Claude Code).
4. **Este arquivo (`RASTRO-SESSAO.md`) é atualizado toda vez que algo relevante fecha ou começa** —
   não é só para esta sessão, é o jeito fixo de deixar o fio pronto pra próxima IA que abrir aqui,
   seja ela qual for. Sobrescrever a seção "Estado em [data]", preservar o que ainda está ativo.

## Padrão reutilizável: espera disciplinada (interrupção só por sinal, não por ruído)

Visto em uso pela SOL (30/07/2026, enquanto eu executava a Fase 0 do `VPS_CHECKMATE_DELTA`) e vale
adotar sempre que uma sessão precisar ficar em modo "revisor" ou "aguardando outro escritor" sem
ficar repolindo pergunta a cada mensagem nova que chega:

```yaml
ESTADO_ATUAL:
  tempo: "tempo real trazido pelo Pivete"
  fonte_de_verdade: "snapshot mais recente"
  escritor_ativo: "nome de quem está escrevendo no escopo"
  meu_papel: "revisor delta read-only | executor único | aguardando"
  executar_agora: false
  repetir_investigacao: false
```

Regra de interrupção — só sai do modo de espera quando aparecer um destes, nunca por mensagem
repetida sem novidade:

```text
FATO NOVO
CONFLITO
DUPLICIDADE
REGRESSÃO
BLOQUEIO
MUDANÇA DE DIREÇÃO
```

Cada atualização nova substitui o estado anterior — mensagem atrasada vira só histórico, nunca
motivo pra retroceder ou reiniciar investigação já feita (mesmo princípio de
[[feedback-delta-protocolo-mensagens-atrasadas]], só que formalizado como YAML de estado em vez de
regra em prosa). Usar este formato quando esta sessão também precisar declarar "estou esperando,
aqui está exatamente o que me tira dessa espera" — deixa explícito pro Pivete e pra outra IA o que
conta como sinal real.

## Regra de escritor único

Várias IAs operam em paralelo na mesma missão (Claude Code, ChatGPT/"SOL", e o Hermes local
quando estiver operacional). Regra: **uma área, um escritor por vez.** Se uma IA nota que outra
já está com um branch/PR aberto numa área, ela não toca — documenta em local separado, ou
espera. Prova real disso funcionando: PR #551 (Claude, drift GitHub↔VPS) e PR #552 (SOL,
`docs/ARQUITETURA/`) mesclados no mesmo dia, sem conflito, porque cada um ficou no seu escopo.

## Estado em 30/07/2026, ~19:30Z (última atualização deste arquivo)

**Fechado nesta sessão (Claude Code) — rodada mais recente:**
- **PR #574** — gitlink órfão `apps/modulos/telepainel` (mode 160000, sem `.gitmodules` desde
  26/07) causava falha em `github-bot-controller.yml` ("Juiz + promotor autônomo com recibo") a
  cada 5 min, ~9s, desde 26/07. Removido do índice; governança (`mapa-canonico.json` +
  `CODEOWNERS`) repontada pro caminho real `src/apps/modulos/telepainel/` (103 arquivos, estava
  sem dono). Mesclado — **verificado ao vivo, não por relato**:
  `mergeCommit=749077ad694babc494f9b0f2e9d713d92bdd0360`, `state=MERGED`,
  `mergedAt=2026-07-30T19:02:46Z`, 4 arquivos, +18/-3. `git/trees/main?recursive=1` confirma
  **zero gitlinks** na main pós-merge.
  **Prova viva de que o fix funcionou** (não só "devia funcionar"): run do
  `GitHub Bot Controller` no commit seguinte ao merge (`311b4a8a`, 19:03:17Z) →
  `conclusion=success`. Antes do #574 esse job só dava `failure`.
- **Achado registrado, não corrigido** (fora de escopo, comentado nas issues certas em vez de
  abrir paralela): `ecosystem.config.cjs` (1429 linhas) commitado na `main` com 7 classes de
  segredo em claro — `.gitignore` ignora `ecosystem.config.js`, o arquivo real é `.cjs`, uma
  letra de diferença. Comentado em #190 com linha exata de cada chave. **Decisão do Pivete:
  vazamento fica pra depois — "repositório particular pré-produção"**, não é bug a corrigir
  agora, é risco aceito conscientemente.
- **Casa (`E:\CentralDark\Pivete\CentralDark`) sincronizada com `origin/main`**: estava 143
  commits atrás. `stash` dos 2 arquivos com mudança local (`meta-lupa/references/uso-ledger.jsonl`,
  `meta-lupa/testes/test_autolupa_conformance.py`) → `merge --ff-only` → conflito ao restaurar
  (esses 2 arquivos foram reestruturados no GitHub, não deletados) → resolvido aceitando a versão
  do GitHub, versões antigas da Casa preservadas em
  `E:\CentralDark\.claude\backup-meta-lupa-casa-20260730\`.
  **Erro cometido e corrigido na hora**: um `git cat-file -e origin/main:<path>` deu falso negativo
  durante o conflito e os 2 arquivos foram apagados do disco por engano — o `git status`
  continuou mostrando divergência depois do que eu achava resolvido, fui verificar em vez de
  seguir, `git ls-tree HEAD` provou que os blobs existiam, restaurados com `git checkout HEAD --`
  e conferidos por hash idêntico ao blob. Lição gravada no backup: não confiar em resultado
  *negativo* de `git cat-file`/`git show` com índice em conflito.
  HEAD final da Casa = HEAD do `origin/main`, 0 arquivos rastreados divergentes.
- Issue **#564** (drift GitHub↔VPS, aberta pela sentinela, `assign:claude`) recebeu diagnóstico
  completo do falso verde do webhook (Cloudflare responde 200, `WebhookDeploy` parado, VPS 446
  commits atrás) — comentário próprio, sem executar nada de escrita na VPS.

**Relatado pela SOL, verificado ao vivo antes de aceitar (protocolo de mensagem relayed):**
- SOL confirmou PR #574 mesclado — **bate exato** com a verificação direta acima (mesmo SHA de
  merge, mesmo HEAD validado, mesmos 4 arquivos, mesmos gates verdes no HEAD certo).
- SOL postou **"SUPERCOMANDO DELTA — CHECKMATE VPS + REPOSITÓRIO"** na issue #564
  (`2026-07-30T19:26:36Z`, autor `segredounlock`): plano de 8 fases (snapshot → classificar sujeira
  → preservar em PR-filho → limpeza cirúrgica só depois de preservar → alinhar VPS com main via
  fast-forward → deploy com recibo real por SHA (não `200` do Cloudflare) → destravar autonomia
  GitHub (#570/#573, `PROMOTION_TOKEN_MISSING`) → arrumar issues/PRs sem fechar por aparência),
  regra-mãe explícita: **um escritor por ativo, `git reset --hard`/`clean -fd`/`rm -rf` proibidos,
  nada de sincronizar sem SHA idêntico nos dois lados, sucesso só com snapshot antes/depois**.
  **Ainda não executado por ninguém** — Pivete pediu leitura/alinhamento só, não execução, nesta
  rodada. Claim de `PROMOTION_TOKEN_MISSING` em #570/#573: checagem rápida mostrou falhas nos
  checks do #570, mas de **runs antigos** (anteriores ao merge do #574) — não confirmado como
  causa raiz atual, precisa checar de novo com run fresco antes de agir.

**Decisão de papel — SUPERCOMANDO_DELTA `HERMES-CASA-MENTE-ESTENDIDA-01` (30/07, ~19:30Z):**
- A SOL colou um segundo SUPERCOMANDO, diferente do da issue #564: `mission_id:
  HERMES-CASA-MENTE-ESTENDIDA-01`, `authority: PERMITO PIVETE`, amarrado ao **PR #554** (o
  PR-mãe dela). Verificado ao vivo: **PR #554 foi atualizado 1 minuto depois** dela postar esse
  script (9 commits, antes eram 6) — ela está escrevendo nesse escopo agora, não é hipótese.
- O próprio script tem a regra: `"se outro escritor estiver no mesmo escopo, pausar e trabalhar
  apenas como revisor delta"` e lista isso em `hard_stop`. Rodar a `phase_0_snapshot` por conta
  própria nesse mission_id violaria a própria regra escrita nele — dois escritores no mesmo
  escopo é exatamente o hard-stop que ele define.
- **Pivete escolheu explicitamente (via AskUserQuestion): "Só revisor delta"** — Claude Code NÃO
  escreve em PR #554 / escopo Hermes-Casa. Só compara o snapshot dela quando ela publicar, aponta
  furo se achar, sem tocar código nessa área. Continua valendo a regra de escritor único já
  registrada nesta seção desde o início da sessão — este é só o caso concreto mais recente dela
  em ação.
- **Não confundir com a SUPERCOMANDO DELTA da issue #564** (`VPS_CHECKMATE_DELTA`) — essa é
  escopo próprio (`assign:claude`, sem colisão), continua aguardando ordem explícita de execução,
  não foi tocada por essa decisão de papel.

**`VPS_CHECKMATE_DELTA` — Fase 0 (SNAPSHOT_READ_ONLY) executada e publicada (30/07, ~19:55Z):**
Autorização explícita recebida do Pivete: `executor: SONNET_5`, `reviewer_final: OPUS_5`,
`do_not_touch: PR #554`. Recibo completo em
[comentário na issue #564](https://github.com/ServerVpss/CentralDark/issues/564#issuecomment-5135613145).
Resumo do que mudou de estado real:
- GitHub `main` agora em `5f757349` (avançou desde o merge do #574: +3 commits automáticos).
- Casa 4 commits atrás (trivial, fast-forward puro — só o merge do #574 + auto-commits).
- **VPS: 458 commits atrás** (subiu de 446), branch `chore/gateway-providers-routes`, 57 itens
  sujos (32 modificados + 2 gitlinks sujos + 23 não rastreados). `AiDiag` reiniciou sozinho entre
  duas checagens (não fui eu — MCP é read-only).
- **Achado real, não hipótese**: `apps/modulos/mapeamento/config/mapa-canonico.json` (4553b) e
  `core/validar-mapa.mjs` (7870b) existem **untracked** na VPS com conteúdo **diferente** da
  versão atual da main (7561b / 17324b respectivamente) nos mesmos caminhos. Isso vai travar
  qualquer `git checkout main` na Fase 4 ("would be overwritten by checkout") — é bloqueador
  real de sincronização, não lixo. Fica pendente decisão do Pivete: a versão da VPS é rascunho
  anterior ao meu próprio PR #551, ou é outra coisa — não decidi sozinho, não presumi.
- **Falso positivo evitado**: `provider-health.mjs`/`.test.mjs` (Log-Verificador, untracked na
  VPS) parecia trabalho novo não publicado — conferido por tamanho de arquivo idêntico (2466
  bytes) ao que já foi mesclado na main pelo PR #296 (22/07, SOL). Reclassificado de `OURO` pra
  `DUPLICADO` antes de publicar, não depois.
- Nenhuma mutação executada. `.env` nunca lido. Nenhum PM2 reiniciado por mim.
- **Não avanço pra Fase 1/2 sem**: (a) decisão do Pivete sobre o bloqueador do `mapeamento/`,
  (b) terminar o hash-diff dos ~25 itens ainda marcados `DESCONHECIDO_QUARENTENA` no recibo.

**`VPS_CHECKMATE_DELTA` — Fase 0 CONCLUÍDA e classificação final publicada (30/07, ~20:10Z):**
[Recibo final na issue #564](https://github.com/ServerVpss/CentralDark/issues/564#issuecomment-5136884593).
Achados que corrigem a rodada anterior:
- **Os 2 bloqueadores não vieram do PR #551** como eu tinha suposto — origem real é o **PR #296**
  (SOL, 22/07). Evoluíram por 3 commits desde então (#551, #566 da SOL, #574 meu). VPS tem versão
  **estritamente menor** nos dois arquivos (4553b/7870b vs 7561b/17324b da main) — reclassificados
  de `QUARENTENA` pra **`DESCARTE_CANDIDATO`** (estado anterior à evolução, não colisão real).
  Mesmo conjunto órfão: `admin-guard.js` (VPS 18441b vs main 26433b) e `validar-mapa.test.mjs`.
- **Único OURO real confirmado**: `.grok/rules/05-pr-secret-scan-nunca-merge.md` (3135b) — os outros
  6 arquivos da mesma pasta já estão rastreados; só este é novo e não existe na main (404 confirmado).
- **Achado de escala**: `apps/modulos/grupo-evolucao/missions/` tem **200+ arquivos**
  `drift-<epoch>.json`, ~238b cada, a cada ~30min — telemetria de processo agendado, `ATIVO`,
  classificado por padrão sem hash-comparar cada um (registrado como pendência honesta, não escondida).
- `gerar-manifesto-destrutivas.mjs` confirmado `DUPLICADO` — 17013 bytes idênticos nos dois lados.
- **Interrupção de escopo registrada**: a mesma sessão recebeu ordem simultânea de planejar a skill
  `centraldark-adapter` v2 (modo plano) e continuar esta Fase 0 (execução). Resolvido fazendo a
  parte analítica read-only dentro do modo plano (permitida) e adiando publicação/escrita até o
  modo plano encerrar — sem misturar os dois escopos, sem decidir por conta própria qual prioridade
  valia mais.
- Gate de saída da Fase 0: 4 de 5 itens fechados. Falta só revisão do Opus e 2 decisões do Pivete
  (destino dos itens `DESCARTE_CANDIDATO` órfãos; se o achado de OURO vira PR).
  **Fase 1 (limpeza) não iniciada.**

**Decisão do Pivete recebida (30/07, ~20:15Z)** —
[registrada na issue #564](https://github.com/ServerVpss/CentralDark/issues/564#issuecomment-5136940752):
`status: ANALISE_CONCLUIDA_GATE_PENDENTE`. **Nada é removido, nada é publicado ainda.**
- `.grok/rules/05-pr-secret-scan-nunca-merge.md` → `PRESERVAR_EM_QUARENTENA`. Só vira PR-filho
  isolado depois de: revisão adversarial do Opus, comparação com o scanner canônico atual,
  confirmação de ausência de segredo, e decisão se é regra específica do Grok ou regra universal.
- Os `DESCARTE_CANDIDATO` órfãos (bloqueadores `mapeamento/`, `admin-guard.js`,
  `validar-mapa.test.mjs`) → remoção só depois de: Opus aprovar, snapshot restaurável existir,
  prova de que a main contém versão superior, e confirmação de que nenhum processo ativo consome
  esses arquivos na VPS.
- **Fase 1 (limpeza) permanece explicitamente não iniciada.**
- Papéis fixados pelo Pivete: Grok = especialista de VPS/telemetria; SOL = voz e escritora do
  programa; Pivete = decisor único. Nenhuma limpeza antes do gate independente do Opus.

**Fechado nesta sessão (Claude Code) — rodada anterior:**
- PR #550 — memória "Viver em Paz" (`docs/CONSCIENCIA/LEMBRANCAS/`). Mesclado (`2f114a94a`).
  Auditado por `/fable:fable-judge` (agente independente, cego): **VERIFIED**, sem ressalva.
- PR #551 — Sentinela ganhou drift determinístico GitHub↔VPS (`scripts/sentinela/drift.mjs`),
  `Monitoramento24h` (pasta vazia, nunca teve código) removido de 3 superfícies de governança
  (mapa canônico, CLAUDE.md, CODEOWNERS). Mesclado (`f251e315a`). Auditado por 2 agentes
  independentes: **VERIFIED WITH CAVEATS** — 19/19 testes rodados de verdade, zero segredo, zero
  caminho hardcoded, zero duplicação de mecanismo (4 workflows candidatos inspecionados um a um).
- **PR #565** — resíduo achado pelos próprios auditores do `/fable:fable-judge`: `README.md:110`
  e `docs/PENDENCIAS.md:755` ainda citavam `Monitoramento24h` como parte viva do setor ESCUDO —
  fora do escopo declarado do #551 ("as três superfícies"), não era reversão. Corrigido em delta
  puro (2 linhas, 1 por arquivo), mesclado (`9b63e3bc5`). Confirmado zero ocorrência restante por
  leitura direta do conteúdo bruto na `main` (não pela busca indexada do GitHub, que estava com
  lag e mostrou o commit anterior — falso verde de instrumento evitado, não confiei sem checar
  por um segundo canal).

**Fechado em paralelo (SOL/ChatGPT):**
- PR #552 — `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`. Mesclado.
- PR #553 (merge `e73094b7e`) — "boot universal e método delta para qualquer IA". 12 arquivos,
  confirmado via `gh pr view 553 --json files`:
  `.claude/rules/00-centraldark-boot-universal.md` (novo), `.cursor/rules/centraldark-governanca.mdc` (novo),
  `.github/copilot-instructions.md` (novo), `.windsurfrules` (novo), `GEMINI.md` (novo),
  `AGENTS.md`, `CODEX.md`, `LEIA-ME-IA.md`, `README.md`, `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`,
  `.github/workflows/porta-de-entrada.yml`, `scripts/lupa/validar-porta-de-entrada.mjs` (modificados).

  **Contrato real do `LEIA-ME-IA.md` (lido direto do arquivo, main atual):** toda IA que carregar
  contexto deste repo deve ler, antes de agir: `AGENTS.md` → `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
  → `.agents/skills/meta-lupa/SKILL.md` (se a tarefa for crítica) → estado atual comprovado
  (branch/PR/HEAD). Ao iniciar trabalho, emitir **uma vez** (não repetir a cada mensagem):

  ```yaml
  CENTRALDARK_AI_BOOT:
    governance: LOADED
    delta_method: LOADED
    history_preservation: ACTIVE
    source_of_truth: "ServerVpss/CentralDark + evidência atual"
    alignment: "PIVETE > COORDENADOR > ESPECIALISTAS"
    role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES|READ_ONLY"
    writer: "NONE|nome-do-escritor-atual"
  ```

  Esse recibo prova carregamento do contrato — não prova identidade, não concede permissão,
  não substitui teste/log/diff/check/autorização do Pivete. Porta verificada por
  `scripts/lupa/validar-porta-de-entrada.mjs`: se algum adaptador universal sumir, CI fica vermelho.

**Em andamento (SOL/ChatGPT, ATIVO — não mexer, só ler):**
- **PR #554** (confirmado ao vivo via `gh pr view 554`, não só relatado) — "plan(hermes): programa
  Casa + Mente Estendida com PR-mãe e gates". `OPEN`, `isDraft: true`, branch
  `plan/hermes-casa-mente-estendida-20260730`, HEAD `a27d988423bea8d3b70b8f26d001438a83f145ee`,
  label `permito-pivete`, +1684/-0, **6 arquivos, todos doc, zero código/runtime tocado**:
  `docs/PLANO-MESTRE-HERMES-CASA-MENTE-ESTENDIDA/{README.md, 01-MAPA-ATUAL-E-LACUNAS.md,
  02-ARQUITETURA-ALVO.md, 03-ROADMAP-E-GATES.md, 04-DECISOES-E-PENDENCIAS.md, programa.yaml}`.
  Deliberadamente em draft — funciona como mapa vivo do programa, não deve ser mergeado ainda.
- **Estratégia declarada:** PR #554 é PR-mãe fixo (guarda direção/decisões/fases/deltas, nunca
  acumula código de produção). Trabalho real entra por PRs-filhos atômicos, um de cada vez:
  próximo é **F1 — inventário read-only sanitizado da Casa** (mapear volumes, processos, Hermes
  Agent, Hermes One, `HERMES_HOME`, perfis, gateways, Telegram, bancos abertos, worktrees,
  repositórios, Obsidian, duplicatas — falha fechado se tentar capturar `.env`/token/conversa/
  memória pessoal/dump de banco).
- **Decisão técnica de arquitetura Hermes:** Hermes Agent = motor (executa modelos/tools/
  sessões/memória/gateways); Hermes One = GUI que usa o Hermes Agent como backend, mesmo
  `HERMES_HOME`. Não escolher um contra o outro agora — primeiro provar qual executável/perfil/
  `HERMES_HOME` cada app realmente usa. `CRIAR_OUTRA_SOL=NAO` / `INVENTARIAR_SOL_EXISTENTE=SIM`
  (perfil `sol` já existe, não recriar).
- **Memória comum, sem apontar processos direto pro mesmo SQLite/WAL vivo** (conecta com o bug
  #18594 já registrado abaixo): caminho é arquivos canônicos + ledger single-writer → adaptador/
  serviço local → SQL + busca vetorial depois → replicação pra nuvem só quando estável.
- **Limite que ela mesma declarou:** não afirmou ter examinado o conteúdo atual do `E:` diretamente
  — os prints e a cápsula viraram `OBSERVADO_PIVETE` / `CAPSULA_20260729`, orientam o mapa mas
  não substituem inventário real (isso é exatamente o que o PR-filho F1 vai fazer).
- Risco técnico real que já embasa a decisão de "não compartilhar banco direto entre perfis":
  bug conhecido upstream do Hermes (NousResearch/hermes-agent, issue #18594) —
  `get_hermes_home()` cai silenciosamente em `~/.hermes` no modo perfil e causa corrupção de
  dados entre perfis. É por isso que a SOL optou por estado temporário isolado por perfil e
  memória compartilhada centralizada só depois de validar concorrência/compatibilidade.
- Documento congelado (ainda não executado): `PLANO_CIRURGICO_HERMES_META_LUPA.md`, datado
  2026-07-29 — restaurar o ecossistema Hermes sem perder config atual, provar que o modelo
  realmente executado bate com o solicitado, eliminar estado de atualização parcial, recuperar
  serviço local, estabilizar cadeia de modelos, criar um único mecanismo seguro de restauração.
  É plano, não execução — nenhuma ação tomada por esse documento ainda.

**Checagem em tempo real (30/07, ~11:15Z) — confirmado ao vivo via `gh api`, não por narração:**
- Branch `plan/hermes-casa-mente-estendida-20260730` (PR #554) tem exatamente 6 commits de doc
  (`a97a63cc1` → `4149b3423` → `a63b5f379` → `994591e62` → `586d5c946` → `ccbdde0ba` → `a27d98842`,
  todos entre 11:02Z e 11:11Z), em cima do commit de painel `660f83972`. HEAD do PR bate exato
  com o último commit real. Nada mudou além dos 6 arquivos já registrados acima.
- **Gap real encontrado:** a SOL narrou (em texto, várias vezes) estar aplicando meta-lupa +
  fable-loop + fable-judge "no repositório inteiro" e "atualizando o CLAUDE.md com conteúdo
  completo" repetidamente. Conferido: **o último commit real que tocou `CLAUDE.md` na `main`
  continua sendo o meu, do PR #551 (`f251e315a`, 30/07 09:35Z)** — nenhum commit novo em
  `CLAUDE.md`, nem na main nem em nenhuma branch aberta, desde então. Nenhuma branch nova além
  da já conhecida `evol/meta-lupa-falso-verde-20260727` (pré-existente, não relacionada) apareceu.
  Ou seja: a narração dela de "já apliquei" ainda não virou commit em lugar nenhum — é trabalho
  em andamento no lado dela (local ou em rascunho), não estado do repositório.
- **Postura adotada aqui:** não tentar "corrigir" isso por conta própria, não abrir PR concorrente,
  não editar `CLAUDE.md` — é exatamente o tipo de interferência que o Pivete pediu pra evitar
  ("não atrapalhe, acompanhe os planos da SOL em tempo real"). Só registro o gap encontrado;
  quem decide o que fazer com ele é o Pivete ou a própria SOL, não eu.

**Identidades operacionais (pra não confundir "quem é quem" entre sessões):**
- **SOL** = identidade própria "SOL / JARVIS DO PIVETE" (arquivo `SOUL.md` dela, aprovado pelo
  Pivete). Cartão de boot resumido: papel = secretária particular + braço direito + protetora +
  orquestradora; objetivo = reduzir peso mental e resolver dores computacionais; "CASA" dela =
  memória pessoal + telas + voz + contexto; VPS = builder + negócios + serviços + execução
  permanente; `FALSO_VERDE=BLOQUEADO`; `MELHORAR_O_EXISTENTE=SIM`;
  `CRIAR_PARALELO_SEM_NECESSIDADE=NAO`; `VIVER_EM_PAZ=NORTE` (mesmo princípio da memória
  "Viver em Paz" que virou PR #550 — não é coincidência, é o mesmo norte).
- **Claude Code (eu, nesta sessão)** = sem identidade fixa própria tipo "SOL" — opero como papel
  operacional puro (`COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|READ_ONLY`, conforme
  `CENTRALDARK_AI_BOOT` do `LEIA-ME-IA.md`), sem persona própria imposta.
- **Fluxo Human-in-the-Loop para missões do Hermes** (não é conversa autônoma entre IAs):
  `Pivete autoriza → SOL delimita ou revisa → Hermes reconhece → Hermes executa uma unidade
  autorizada → Hermes produz evidência → SOL tenta derrubar a conclusão → Pivete decide
  continuidade, mudança ou encerramento.` Cada etapa é sincronizada e autorizada — nunca solto.

**Formato de continuidade da SOL (referência, não replicar aqui):** ela mantém uma "cápsula de
sessão" própria, bem mais elaborada que este arquivo — pastas `01-missao/` (estado atual, fio da
missão, retomada), `02-protocolos/` (coleta, comunicação unificada, cooperação paralela, gates de
autorização, handshake de navegador, leitura semântica), `03-raciocinio/` (arquitetura cognitiva,
falso-verde/oráculos, máquina de estados, meta-lupa da sessão), `04-metricas/`, `05-seguranca/`
(modelo de ameaças, privacidade/redação, regras de ouro), `06-laboratorio/` (antipadrões
depreciados, log de decisão, padrões adquiridos, proveniência), `07-maquina/` (prompt de
recuperação, JSONs de estado/protocolo/glossário), mais `BOOTSTRAP.md`, `PLAN.md`, `SOUL.md`,
`VALIDATION.md`, `MANIFEST.sha256`. Isso é dela, específico pro jeito dela operar — este
`RASTRO-SESSAO.md` fica deliberadamente mais simples, um arquivo só, pra não virar "outra versão"
do que ela já construiu (Princípio 11 da meta-lupa: não duplicar caminho canônico).

**Pendência registrada, fora de escopo até agora:**
- `.github/workflows/sentinela-divergencias.yml`, step "Commit snapshot": `git push || true`
  engole falha de push silenciosamente. Pré-existente, não criado nem tocado pelos PRs #550/#551.
  Achado pela SOL em revisão paralela, confirmado ao vivo pelo Claude. Aguardando decisão do
  Pivete sobre quando corrigir.

## Estado em 04/08/2026, ~00:20 BRT — sessão de Casa (Claude Code)

Sessão **inteiramente na Casa + leitura da VPS**. Nenhuma escrita na VPS, nenhum commit,
nenhum PR. Ordem do Pivete: "todo aqui em casa".

**Diagnóstico do erro "Resposta vazia da API" no @srver1bot (causa raiz achada, NÃO corrigida):**
- Sintoma: card do Orquestrador no Telegram responde `❌ Resposta vazia da API.`
- Causa raiz **provada por leitura de config**: o Caddy da VPS, no bloco
  `api.centralldark.com`, **não tem rota `/v1/messages`**. O `handle` catch-all manda tudo
  para `127.0.0.1:8090` = ArsenalAdapter, que é **OpenAI-compatible** e só expõe
  `/v1/chat/completions`. O bot (`unified-bot.cjs:533`) fala Anthropic e nunca checa
  `r.status` — só procura `content` no corpo. Não achando, cospe a string genérica.
- O proxy Anthropic correto (**8082**, `elite-anthropic-proxy`) está **vivo e saudável**
  (HTTP 200 em 17ms, 16 dias de uptime) e **não recebe tráfego** — ninguém roteia pra ele.
- **Falso vermelho do MCP**: `elite_gateway_status` testa `localhost:8080`, mas **nada
  escuta na 8080**. O gateway existe na 8082. O healthcheck é que está errado.
- 💣 **Bomba armada**: o PM2 id 7 chama-se `CentralDark-EliteHTTP` mas roda
  `elite-anthropic-proxy/start-fallback.sh`. O `ecosystem.config.cjs` da VPS ainda aponta
  para `/root/dark/scripts/elite_http_gateway.py`, **caminho que não existe mais**. Um
  `pm2 reload ecosystem.config.cjs` mata o EliteHTTP **e leva o proxy 8082 junto** — o bot
  para de vez. Não tocar sem plano.
- `WebhookDeploy` parado por `EADDRINUSE` na 9300 (porta livre agora) → é por isso que a
  VPS está ~467 commits atrás. `AiDiag` parado.
- Fix proposto (1 bloco no Caddy, com backup + `caddy validate` + reload) **entregue ao
  Pivete para ele disparar** — o harness do Claude Code bloqueou a escrita em produção.
  Não executado.

**Hermes na Casa — `hermes update` estava travado:**
- Motivo: 4 processos vivos do mesmo venv travavam os `.pyd` no Windows. A árvore mostrou
  que **não eram filhos do app Desktop** — vinham de shells diferentes (`bash`, `node`,
  e um órfão de pai morto). Por isso fechar o app não resolvia.

**Instalado e no ar: `hermes-webui` (porta 8787), decisão do Pivete.**
- `E:\hermes-webui`, `python bootstrap.py`, **nativo no Windows**, escutando só `127.0.0.1`.
- Confirmado ao vivo: perfil `pivete`, 11 sessões WebUI + 8 CLI, conversas reais visíveis.
- ⚠️ O README diz "Native Windows is not supported" — **o código desmente**: é só um
  `Warning: experimental`. Perde apenas o terminal embutido e o auto-install.
- Arquitetura normal: 2 processos python (supervisor pai + servidor filho), não é duplicata.
- Dashboard oficial (9119) e Hermes Studio (8648) **desligados**, não removidos.
- Regra a lembrar: o webui importa módulos internos do hermes-agent — **atualizar os dois
  juntos**, sempre.

**Removido (autorizado explicitamente):** OpenClaw Companion 0.6.3 (`E:\OpenClawTray`, o
desinstalador oficial crashou com access violation; pasta removida pelo Pivete, chave de
registro em HKCU ficou para ele disparar) e a distro WSL2 `OpenClawGateway`.

**Correções que eu mesmo tive de fazer nesta sessão (registradas de propósito):**
- Afirmei que 21576 e 25800 eram pai/filho do Desktop — a árvore provou que não eram.
- Afirmei que havia dois `HERMES_HOME` rivais — `.hermes` só tem `desktop-attachments` e
  `skills`; o estado real é um só, em `AppData\Local\hermes`.
- Suspeitei de servidor duplicado do webui — era supervisor + filho, por design.
- **Padrão por trás dos três**: conclusão tirada antes da verificação. Ver
  [[feedback-calibrar-rigor-ao-ambiente]] na memória do Claude Code.

### Auditoria de segurança dos processos do Windows (ordem explícita do Pivete, MODO=QUENTE)

Meta-lupa canônica carregada de `.agents/skills/meta-lupa/SKILL.md`. **380 processos**
auditados por assinatura digital, caminho, mascaramento, rede, autostart, tarefas e serviços.

`VEREDITO: CONDICIONAR` — nenhum malware, mas com pendência aberta e superfícies a decidir.

**Limpo (provado):** zero processos em Temp/Downloads/Public/Lixeira; zero mascaramento
(nenhum `svchost`/`lsass`/`csrss` fora de `System32`); os 14 binários não assinados são
todos explicáveis (apps MSIX da Store assinam o pacote e não o exe, `esbuild` de
`node_modules`, `python` de venv, `sleep.exe` do Git).

**Pendência que NÃO fechou (registrada, não escondida):** `CDPSvc` (dentro de svchost
legítimo, System32, assinado) mantém conexões para **45.79.115.134:55573/55574** e
**45.33.109.18:34293** — faixas da **Linode**, não da Microsoft, em portas altas. Duas
hipóteses não separáveis com a evidência atual: relay P2P legítimo do Connected Devices
vs. algum app usando a plataforma CDP. Teste que separaria: captura de tráfego ou parar o
CDPSvc e observar o que quebra. **Não classificado como aprovado.**

**Ferramentas de acesso remoto — `VERDE`, uso declarado pelo Pivete (era falso vermelho meu):**
TeamViewer (serviço), RadminVPN, VS Code Tunnel (`20.201.67.222:443`), No-IP DUC,
USB Redirector e `cua-driver serve` (tarefa agendada oculta). Eu havia listado as seis
como "superfície de risco a decidir"; o Pivete respondeu **"eu uso tudo"**, o que fecha a
hipótese — são ferramentas de trabalho dele, não achado de auditoria. Registrar isso como
risco era ruído, não rigor. Regra que fica: **antes de marcar como suspeito, checar se é
uso legítimo do dono da máquina** (mesma raiz de [[feedback-calibrar-rigor-ao-ambiente]]).

**Higiene:** dois antivírus ativos ao mesmo tempo (Avast + Malwarebytes) — conflitam entre
si. Bloatware IObit com tarefa `Driver Booster SkipUAC (danda)` criada para burlar o UAC.

**Risco residual declarado:** não foi testada injeção de DLL em processo assinado, nem
hash contra base de reputação. O falsificador do veredito "está limpo" seria exatamente
isso.

**Resíduo da própria limpeza, achado pela auditoria e corrigido na hora:** o OpenClaw ainda
tinha `OpenClawTray` na chave Run do HKCU e `OpenClaw Companion.lnk` na pasta Startup,
ambos apontando para `E:\OpenClawTray`, que já não existia. Removidos. Lição: desinstalar
não é só apagar a pasta — **verificar autostart antes de declarar concluído**.

### OmniRoute — CAUSA RAIZ REAL: IPv6 vs IPv4 no `localhost`

**O sintoma `ERR_CONNECTION_REFUSED` no navegador não era servidor fora do ar.** Provado:

```
netstat → TCP 0.0.0.0:20128 LISTENING     (apenas IPv4; NÃO existe [::]:20128)
curl http://127.0.0.1:20128  → HTTP 307 em 0,014s   ✅
curl http://[::1]:20128      → HTTP 000 RECUSADO    ❌
```

O dev server do Next liga só em IPv4. O Chrome resolve `localhost` para **`::1` (IPv6)**
primeiro, não encontra listener e devolve conexão recusada. **Solução: acessar por
`http://127.0.0.1:20128`, não `localhost:20128`.**

Evidência de apoio: no mesmo instante o processo do navegador (PID 17028) mantinha 8
conexões `ESTABLISHED` com o servidor — abas que resolveram por IPv4 conectavam
normalmente, enquanto a do print caiu no IPv6. Sintoma intermitente, mesma causa.

**Correção de atribuição:** eu havia escrito que o Pivete "desistia antes de compilar".
Ele corrigiu — *"sua sessão fechava, não eu"*. Estava certo: os `npm run dev` que disparei
em segundo plano morriam junto com o comando da minha sessão. A lentidão de compilação
(4min20s, com `⚠ Slow filesystem detected` no `E:\`) é real e some, mas **não** era a causa
do erro no navegador.

### OmniRoute — dados de boot coletados

Dev-servers do Sol Desktop e do OmniRoute encerrados a pedido (node 5 → 0, RAM livre
6,1 → 7,7 GB). Ao subir o OmniRoute isolado, o log
(`.build/next/dev/logs/next-development.log`) mostra **zero erros** — apenas compilação
muito lenta, com aviso explícito do próprio Next:
`⚠ Slow filesystem detected. The benchmark took 250ms` no caminho `E:\`.
Passados ~3 min ainda estava em `Compiling proxy ...`. Ou seja: **não está quebrado, está
demorando**; a desistência antes do fim explica o sintoma. Porta real é **20128**
(`PORT`/`BASE_URL` no `.env`), não 3000 — procurar na porta errada também produz
"não funciona".

Achados de configuração no mesmo boot: `INITIAL_PASSWORD=CHANGEME` (senha padrão em uso) e
OAuth de Antigravity e Qoder sem segredo configurado.

## Onde cada coisa mora (pra não repetir pergunta)

| O quê | Onde |
|---|---|
| Fonte da verdade do código | `github.com/ServerVpss/CentralDark`, branch `main` |
| Executor / runtime | VPS, `/root/CentralDark/` |
| Porta de entrada pra qualquer IA | `LEIA-ME-IA.md` (raiz do repo) |
| Método de coordenação em delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| Motor de auditoria obrigatório | `.agents/skills/meta-lupa/SKILL.md` |
| Validador da porta (CI fica vermelho se quebrar) | `scripts/lupa/validar-porta-de-entrada.mjs` |
| Este rastro (local, fora do Git) | `E:\CentralDark\.claude\RASTRO-SESSAO.md` |
| Memória própria do Claude Code (não compartilhada com Hermes) | `C:\Users\danda\.claude\projects\E--CentralDark\memory\` |

## Se você é uma IA lendo isto pela primeira vez

1. Leia `LEIA-ME-IA.md` no repo antes de qualquer coisa.
2. Confira se alguém já está escrevendo numa área antes de tocar nela (`gh pr list -R ServerVpss/CentralDark --state open`).
3. Atualize a seção "Estado em [data]" deste arquivo quando fechar ou começar algo relevante — sobrescreva a data, preserve o histórico do que ainda está ativo.
4. Nunca trate este arquivo como autorização pra agir — autorização vem do Pivete, em texto, na conversa.
