# COMANDO - APRENDIZADOS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\CONSCIENCIA\APRENDIZADOS.md
**SHA:** a794e01cff2afb1e
**Timestamp:** 2026-08-26T19:32:47.954867
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Aprendizado:** Estado validado: PR #19 foi mergeada com squash no commit a07f8d6410f09b796d7e69d543839b6f7f5bbad9. O workflow oficial ficou em .github/workflows/github-bot-controller.yml, o script

### Decisoes
- Quando houver risco ou dúvida real, deve chamar o usuário como autoridade da decisão:
- - **Decisão:** Fixado em `mem://seguranca-regras-fixas` e Core do `mem://index.md`. Read-only por padrão; nada de token/sessão/log privado no chat, PR, painel ou doc; WuzAPI/Docker/Caddy/CRM/banco rea

### Padroes
- - **Aprendizado:** Regra: a IA pode gerar e enviar ZIP no chat com código, scripts, docs ou relatórios grandes e não sensíveis. O ZIP deve ter README e manifest. Nunca incluir secrets, env, tokens, ch
- - **Aprendizado:** Regra: tarefas grandes devem usar script versionado no GitHub e run-once curto na VPS. Evitar script gigante no chat. ZIP é fallback para pacote não sensível, mas o padrão principal
- - **Aprendizado:** Regra: a política do MCP deve evoluir de bloqueio por nome genérico para bloqueio por risco real. Deve continuar bloqueando secrets reais, chaves, tokens, sessões, env real e backup
- Regra:
- Regra:
- Regra:
- - **Aprendizado:** Estado validado: dry-run de limpeza encontrou 93 duplicados que podem ser limpos depois de confirmação explícita, 0 itens para revisar manualmente e 0 itens marcados como não apagar
- - **Aprendizado:** Estado atual: Lote 4 concluído. Foi criada a rota read-only GET /v1/whatsapp/chats em CentralDark/apps/bot-server/src/api/routes/whatsapp-chats.ts, com createGetWhatsAppChatsHandler
- - **Aprendizado:** Estado atual: Lote 5 concluído. Foi criado o handler GET /v1/whatsapp/contacts em CentralDark/apps/bot-server/src/api/routes/whatsapp-contacts.ts. O service read-only ganhou listCon
- - **Aprendizado:** Estado atual: Lote 6 concluído. A rota GET /v1/whatsapp/contacts/:phone/avatar está implementada em modo read-only como handler puro. Inclui normalização de :phone para E.164/JID/LI

### Riscos
- - **Aprendizado:** Para evitar bloqueio: quebrar tarefas em chamadas pequenas, usar GitHub create_or_update_file para um arquivo por vez, evitar heredoc grande em vps_run_once, evitar git add -A e com
- - **Aprendizado:** Padronizar scripts run-once por risco: (1) validador read-only, que só consulta Git/PM2/HTTP/build e nunca altera serviço; (2) sincronizador de código, que faz backup/stash/pull/bui

### Ouro Bruto (primeiros 5000 chars)
```
# 🧠 Aprendizados acumulados das IAs conectadas

Histórico vivo — cada item é uma lição aprendida por alguma IA conectada no MCP CentralDark.
A IA seguinte herda automaticamente via `kit_boas_vindas` / `puxar_aprendizados`.

Para anotar um aprendizado novo, qualquer IA conectada chama a tool `registrar_aprendizado`. O servidor sanitiza credenciais, IPs e caminhos sensíveis antes de gravar.

---

### -1. Working tree da VPS não é staging — fonte de verdade é o repo
- **Categoria:** regra (inquebrável)
- **Data:** 2026-06-10
- **Contexto:** Em 10/06/2026 às 03:03, algum script anônimo renomeou `/root/CentralDark/apps/bot` → `bot.aposentada-20260610-030613` na VPS, **sem commitar no repo, sem atualizar Caddy e sem registrar**. Caddy continuou apontando pra `/root/CentralDark/apps/bot/dist` (pasta inexistente) → `bot.multizap.dev` quebrou. Em paralelo, `/root/apps/bot` recebeu build novo com features (chat ao vivo, LiveBotStatus etc) que nem o domínio público nem `CentralDark/apps/bot` enxergavam. Resultado: 11h de bot quebrado e ninguém percebeu até o usuário perguntar "por que o chat não aparece?".
- **Aprendizado:** A working tree da VPS NÃO é palco de mudanças. Quem manda é o repo. Toda mudança real (renomear pasta, mover arquivo, deletar) tem que: (1) entrar no repo primeiro, (2) Caddy atualizado no mesmo commit se a pasta servida mudar, (3) relatório em `docs/RELATORIOS/`, (4) pendência atualizada. Se um script renomeia pasta de app oficial sem registrar, é bug do script — desativar.
- **Como aplicar:**
  - Antes de qualquer `mv`/`rm` em pasta de app oficial na VPS: PARAR, registrar no repo, depois aplicar.
  - Se ver `D` (deleted) em `git status` da VPS em pasta oficial: PARAR, auditar, restaurar via `git checkout --`, NUNCA commitar a deleção sem entender.
  - Checker preventivo no sentinela: `find /root/CentralDark/apps -maxdepth 1 -name "*.aposentada*"` → se achar, P1.
  - Checker preventivo: pasta servida pelo Caddy tem que existir. Se não existe → P0.
- **Decisão registrada em:** `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md` (pasta oficial do bot = `CentralDark/apps/bot/`).
- **Relatório:** `docs/RELATORIOS/2026-06-10-bot-duplicado-vps.md`.
- **Consequência:** Pasta paralela na VPS sem commit = divergência silenciosa = produção quebrada por horas sem alerta.

---


### 0. Conhecimento só existe se está no repo ou no Mega Painel
- **Categoria:** regra
- **Data:** 2026-06-10
- **Contexto:** O usuário reforçou que toda decisão, aprendizado, pendência, bug, critério de fechamento e próximo passo precisa estar anotado no GitHub/repo, não só no chat. Sem isso, a próxima IA pode esquecer e repetir erros.
- **Aprendizado:** Chat não é fonte de verdade. Lugares oficiais, em ordem de prioridade:
  1. `docs/CONSCIENCIA/APRENDIZADOS.md` — regras, erros corrigidos, jeito certo de fazer, atalhos, decisões
  2. `docs/PENDENCIAS.md` — o que falta, próximo lote, bugs, tarefas pausadas, critérios de fechamento
  3. Mega Painel (`status.centralldark.com`) — estado vivo: pronto, em andamento, alertas, próximo passo
  4. `docs/RELATORIOS/` — relatórios de ações/lotes: o que foi feito, validado, o que não foi tocado
  5. `README.md` da raiz — resumo geral, especialmente quando muda fase importante
  6. `PLANO.md` da pasta mexida — o que falta naquela área específica
  7. `AGENTS.md` / `CODEX.md` — regras para IAs e agentes trabalharem igual
- **Quando registrar:** fechar etapa/lote; usuário confirmar sucesso; corrigir erro/descobrir causa raiz; pausar tarefa; definir critérios de aceite; mudar decisão arquitetural.
- **Formato mínimo:** data + categoria + contexto + aprendizado/decisão + próximo passo.
- **Consequência:** IA que responder só pelo chat sem consultar documentos oficiais viola esta regra e pode repetir erros ou reinventar soluções descartadas.

---

### 1. MCP age como professor de qualquer IA conectada
- **Categoria:** regra
- **Data:** 2026-06-05
- **Contexto:** Antes, cada IA nova conectada no MCP tinha que ser ensinada do zero — repetia perguntas, ignorava regras invioláveis, criava pendência em arquivo errado.
- **Aprendizado:** O MCP CentralDark expõe `kit_boas_vindas` (puxa tudo de uma vez), `puxar_aprendizados` (versão enxuta) e `registrar_aprendizado` (anota lição nova). Toda IA conectada deve chamar `kit_boas_vindas` logo na primeira interação e `registrar_aprendizado` sempre que aprender algo novo. Assim o conhecimento acumula em vez de se perder.

### 2. MCP usa ServerVpss/CentralDark e /root/[oculto] como alvo oficial
- **Categoria:** regra
- **Data:** 2026-06-07
- **Contexto:** A página/status do MCP ainda mostrava referência antiga segredounlock/clone-deck porque o PM2 tinha GITHUB_OWNER, GITHUB_REPO e VPS_REPO_PATH apontando para valores antigos. O usuário executou correção de ambiente no PM2.
- **Aprendizado:** Para MCP-CentralDark em produção, as variáveis corretas são GITHUB_OWNER=ServerVpss, GITHUB_REPO=CentralDark, GITHUB_BRANCH=main e VPS_REPO_PATH=/root/[oculto] Se aparecer segredounlock/
```

---

# COMANDO - APRENDIZADOS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\APRENDIZADOS.md
**SHA:** 7cebf74296007abc
**Timestamp:** 2026-08-28T02:56:48.221094
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Contexto:** O workflow "GitHub Bot Controller" falhava em toda execução com MODULE_NOT_FOUND e o caminho aparecia triplicado: _work/CentralDark/CentralDark/CentralDark/scripts/github-bot-controlle

### Principios
- - **Contexto:** A inspeção do deploy canônico mostrou que o MCP já possui um mecanismo alinhado a esse princípio: build em worktree isolada, promoção atômica de `dist`, restart apenas de `CentralDark-

### Ouro Bruto (primeiros 5000 chars)
```
{{FILE:/tmp/pr316/aprendizados.md}}

### 1. Gate de CI bloqueia qualquer caminho .env.* pelo NOME, antes de olhar o conteúdo
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** Ao restaurar o módulo Bolt, criei um arquivo .env.example com as 15 variáveis do módulo, TODAS sem valor (verificado por grep). O CI reprovou com SECRET_SUSPECT_BLOCKED. Investigando o workflow "Gates determinísticos", a regra é: sensitive_path = (^|/)(\.env(?:\.|$)|secrets?(?:/|$)|tokens?(?:/|$)|...) e suspect = any(sensitive_path.search(name) for name in names). Esse teste roda ANTES de qualquer análise de valor — bloqueia pelo NOME do arquivo. Isso explicou retroativamente o commit 958666567 ("remover caminhos env bloqueados"): os .env.example e .env.production originais do Bolt tinham sido apagados por este mesmo gate, não por conterem segredo. Eu repeti o erro histórico sem saber.
- **Aprendizado:** Nunca criar arquivo .env.example, .env.production ou qualquer .env.* neste repositório — o gate de CI rejeita pelo nome, mesmo com o arquivo 100% vazio de valores. Documente as variáveis em README.md do módulo. Atenção: há contradição interna no repo — o .gitignore (linha 60, !*.env.example) PERMITE esses arquivos, enquanto o gate de CI os REJEITA. Na prática vale a regra mais restritiva, que é o gate. Antes de recriar um arquivo que aparece como deletado no histórico, leia a mensagem do commit que o removeu: ela costuma dizer o motivo e evita repetir o ciclo.

### 2. git status limpo pode esconder pasta vazia: gitlink órfão entregava o Bolt vazio em todo clone
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** apps/modulos/Bolt/source estava registrado como gitlink (modo 160000) apontando para um commit que NÃO existe no repositório, e sem .gitmodules. Resultado: git status --short apps/modulos/Bolt retornava VAZIO (parecia tudo certo), mas qualquer git clone da main entregava a pasta source/ vazia. O Bolt existia apenas como 536 arquivos soltos no disco de uma máquina, invisíveis ao git. Linha do tempo: c61fc7b98 vendorizou 176 arquivos; c41dda98b (4h depois, mesmo dia, mensagem "retirar lote Bolt do PR meta-lupa") deletou tudo e reintroduziu o gitlink — foi retirada por ESCOPO DE PR, não por estar errada, mas ninguém devolveu depois. Também errei ao diagnosticar: comparei blobs local vs origin/chore e vi que batiam, concluindo que estava salvo — mas estava comparando com o cache local da ref remota, não com o GitHub. O teste que realmente resolveu foi git ls-tree origin/main e um checkout limpo em worktree detached.
- **Aprendizado:** Para provar que um módulo está de fato versionado, NÃO confie em git status (gitlink órfão não aparece como sujo) nem em comparação de blob contra ref remota em cache (pode estar desatualizada ou apontar para branch já deletada no GitHub). Use git ls-tree <ref> <caminho> e cheque se o modo é 160000 (gitlink) em vez de 100644 (arquivo). A prova definitiva é criar um worktree detached do commit e contar os arquivos entregues — foi assim que se confirmou 0 antes e 522 depois. Regra prática: submódulo sem .gitmodules é sempre estado quebrado; ou vira árvore normal, ou registra o .gitmodules.

### 3. Auditoria do gatilho de XP da META LUPA: motor correto, defeito era de exposição na saída
- **Categoria:** erro-correcao
- **Data:** 2026-07-27
- **Contexto:** Pedido para provar se a evolução da META LUPA (PR 409) realmente acionou XP, nível e tier, sem presumir sucesso nem falha. Na primeira leitura do ledger procurei os campos com os nomes xp_total, level e tier — não existiam, e quase concluí que o gatilho estava quebrado. Os nomes reais são outros: xp_before, xp_after, xp_gained, level_before, level_after, level_up, tier_before, tier_after, next_level_xp. Com os nomes certos a prova apareceu: XP 790 para 855, ganho 65 batendo exatamente com a soma dos 4 achievements declarados, nível 6 sem subir por faltarem 23, tier OPACA, zero penalidades, no_xp_reason vazio. A cadeia fecha: o xp_after do FINAL anterior era 790, idêntico ao xp_before deste. Também foi questionada a contagem BEGIN=24 e FINAL=25 com ORPHAN=0. O defeito real era outro: o comando finish-use gravava tudo no ledger mas imprimia apenas FINAL_RECORDED usage_id, então responder se houve XP exigia abrir o JSONL na mão.
- **Aprendizado:** Ao auditar o ledger da META LUPA use os nomes de campo reais do registro FINAL: xp_before, xp_after, xp_gained, level_before, level_after, level_up, tier_before, tier_after, next_level_xp. Procurar por xp_total, level ou tier retorna vazio e induz à conclusão errada de que o gatilho não funcionou — ausência de campo com o nome que você imaginou não é ausência do dado; dumpe todas as chaves do registro antes de acusar o motor. Sobre a contagem: BEGIN e FINAL podem divergir legitimamente, porque um FINAL órfão é resolvido por um registro ATTESTATION cujo target_record_hash casa com o record_hash do FINAL — confira essa correspondência antes de tratar a assimetria como corrupção. No cas
```

---

# COMANDO - APRENDIZADOS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\_LEGADO_ROOT_DOCS_CONFLITOS\20260703T075750Z\CONSCIENCIA\APRENDIZADOS.md
**SHA:** 8c994436dc1fb0c8
**Timestamp:** 2026-08-28T02:57:22.850446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Aprendizado:** Estado validado: PR #19 foi mergeada com squash no commit a07f8d6410f09b796d7e69d543839b6f7f5bbad9. O workflow oficial ficou em .github/workflows/github-bot-controller.yml, o script

### Decisoes
- Quando houver risco ou dúvida real, deve chamar o usuário como autoridade da decisão:
- - **Decisão:** Fixado em `mem://seguranca-regras-fixas` e Core do `mem://index.md`. Read-only por padrão; nada de token/sessão/log privado no chat, PR, painel ou doc; WuzAPI/Docker/Caddy/CRM/banco rea

### Padroes
- - **Aprendizado:** Regra: a IA pode gerar e enviar ZIP no chat com código, scripts, docs ou relatórios grandes e não sensíveis. O ZIP deve ter README e manifest. Nunca incluir secrets, env, tokens, ch
- - **Aprendizado:** Regra: tarefas grandes devem usar script versionado no GitHub e run-once curto na VPS. Evitar script gigante no chat. ZIP é fallback para pacote não sensível, mas o padrão principal
- - **Aprendizado:** Regra: a política do MCP deve evoluir de bloqueio por nome genérico para bloqueio por risco real. Deve continuar bloqueando secrets reais, chaves, tokens, sessões, env real e backup
- Regra:
- Regra:
- Regra:
- - **Aprendizado:** Estado validado: dry-run de limpeza encontrou 93 duplicados que podem ser limpos depois de confirmação explícita, 0 itens para revisar manualmente e 0 itens marcados como não apagar
- - **Aprendizado:** Estado atual: Lote 4 concluído. Foi criada a rota read-only GET /v1/whatsapp/chats em CentralDark/apps/bot-server/src/api/routes/whatsapp-chats.ts, com createGetWhatsAppChatsHandler
- - **Aprendizado:** Estado atual: Lote 5 concluído. Foi criado o handler GET /v1/whatsapp/contacts em CentralDark/apps/bot-server/src/api/routes/whatsapp-contacts.ts. O service read-only ganhou listCon
- - **Aprendizado:** Estado atual: Lote 6 concluído. A rota GET /v1/whatsapp/contacts/:phone/avatar está implementada em modo read-only como handler puro. Inclui normalização de :phone para E.164/JID/LI

### Contratos
- - **Aprendizado:** Regra obrigatoria: 'salva' e comando de checkpoint. Ao receber 'salva', registrar o estado/acontecimento atual no local correto sem perguntar: APRENDIZADOS para regra/erro/atalho, P

### Riscos
- - **Aprendizado:** Para evitar bloqueio: quebrar tarefas em chamadas pequenas, usar GitHub create_or_update_file para um arquivo por vez, evitar heredoc grande em vps_run_once, evitar git add -A e com
- - **Aprendizado:** Padronizar scripts run-once por risco: (1) validador read-only, que só consulta Git/PM2/HTTP/build e nunca altera serviço; (2) sincronizador de código, que faz backup/stash/pull/bui

### Ouro Bruto (primeiros 5000 chars)
```
# 🧠 Aprendizados acumulados das IAs conectadas

Histórico vivo — cada item é uma lição aprendida por alguma IA conectada no MCP CentralDark.
A IA seguinte herda automaticamente via `kit_boas_vindas` / `puxar_aprendizados`.

Para anotar um aprendizado novo, qualquer IA conectada chama a tool `registrar_aprendizado`. O servidor sanitiza credenciais, IPs e caminhos sensíveis antes de gravar.

---

### -1. Working tree da VPS não é staging — fonte de verdade é o repo
- **Categoria:** regra (inquebrável)
- **Data:** 2026-06-10
- **Contexto:** Em 10/06/2026 às 03:03, algum script anônimo renomeou `/root/CentralDark/apps/bot` → `bot.aposentada-20260610-030613` na VPS, **sem commitar no repo, sem atualizar Caddy e sem registrar**. Caddy continuou apontando pra `/root/CentralDark/apps/bot/dist` (pasta inexistente) → `bot.multizap.dev` quebrou. Em paralelo, `/root/apps/bot` recebeu build novo com features (chat ao vivo, LiveBotStatus etc) que nem o domínio público nem `CentralDark/apps/bot` enxergavam. Resultado: 11h de bot quebrado e ninguém percebeu até o usuário perguntar "por que o chat não aparece?".
- **Aprendizado:** A working tree da VPS NÃO é palco de mudanças. Quem manda é o repo. Toda mudança real (renomear pasta, mover arquivo, deletar) tem que: (1) entrar no repo primeiro, (2) Caddy atualizado no mesmo commit se a pasta servida mudar, (3) relatório em `docs/RELATORIOS/`, (4) pendência atualizada. Se um script renomeia pasta de app oficial sem registrar, é bug do script — desativar.
- **Como aplicar:**
  - Antes de qualquer `mv`/`rm` em pasta de app oficial na VPS: PARAR, registrar no repo, depois aplicar.
  - Se ver `D` (deleted) em `git status` da VPS em pasta oficial: PARAR, auditar, restaurar via `git checkout --`, NUNCA commitar a deleção sem entender.
  - Checker preventivo no sentinela: `find /root/CentralDark/apps -maxdepth 1 -name "*.aposentada*"` → se achar, P1.
  - Checker preventivo: pasta servida pelo Caddy tem que existir. Se não existe → P0.
- **Decisão registrada em:** `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md` (pasta oficial do bot = `CentralDark/apps/bot/`).
- **Relatório:** `docs/RELATORIOS/2026-06-10-bot-duplicado-vps.md`.
- **Consequência:** Pasta paralela na VPS sem commit = divergência silenciosa = produção quebrada por horas sem alerta.

---


### 0. Conhecimento só existe se está no repo ou no Mega Painel
- **Categoria:** regra
- **Data:** 2026-06-10
- **Contexto:** O usuário reforçou que toda decisão, aprendizado, pendência, bug, critério de fechamento e próximo passo precisa estar anotado no GitHub/repo, não só no chat. Sem isso, a próxima IA pode esquecer e repetir erros.
- **Aprendizado:** Chat não é fonte de verdade. Lugares oficiais, em ordem de prioridade:
  1. `docs/CONSCIENCIA/APRENDIZADOS.md` — regras, erros corrigidos, jeito certo de fazer, atalhos, decisões
  2. `docs/PENDENCIAS.md` — o que falta, próximo lote, bugs, tarefas pausadas, critérios de fechamento
  3. Mega Painel (`status.centralldark.com`) — estado vivo: pronto, em andamento, alertas, próximo passo
  4. `docs/RELATORIOS/` — relatórios de ações/lotes: o que foi feito, validado, o que não foi tocado
  5. `README.md` da raiz — resumo geral, especialmente quando muda fase importante
  6. `PLANO.md` da pasta mexida — o que falta naquela área específica
  7. `AGENTS.md` / `CODEX.md` — regras para IAs e agentes trabalharem igual
- **Quando registrar:** fechar etapa/lote; usuário confirmar sucesso; corrigir erro/descobrir causa raiz; pausar tarefa; definir critérios de aceite; mudar decisão arquitetural.
- **Formato mínimo:** data + categoria + contexto + aprendizado/decisão + próximo passo.
- **Consequência:** IA que responder só pelo chat sem consultar documentos oficiais viola esta regra e pode repetir erros ou reinventar soluções descartadas.

---

### 1. MCP age como professor de qualquer IA conectada
- **Categoria:** regra
- **Data:** 2026-06-05
- **Contexto:** Antes, cada IA nova conectada no MCP tinha que ser ensinada do zero — repetia perguntas, ignorava regras invioláveis, criava pendência em arquivo errado.
- **Aprendizado:** O MCP CentralDark expõe `kit_boas_vindas` (puxa tudo de uma vez), `puxar_aprendizados` (versão enxuta) e `registrar_aprendizado` (anota lição nova). Toda IA conectada deve chamar `kit_boas_vindas` logo na primeira interação e `registrar_aprendizado` sempre que aprender algo novo. Assim o conhecimento acumula em vez de se perder.

### 2. MCP usa ServerVpss/CentralDark e /root/[oculto] como alvo oficial
- **Categoria:** regra
- **Data:** 2026-06-07
- **Contexto:** A página/status do MCP ainda mostrava referência antiga segredounlock/clone-deck porque o PM2 tinha GITHUB_OWNER, GITHUB_REPO e VPS_REPO_PATH apontando para valores antigos. O usuário executou correção de ambiente no PM2.
- **Aprendizado:** Para MCP-CentralDark em produção, as variáveis corretas são GITHUB_OWNER=ServerVpss, GITHUB_REPO=CentralDark, GITHUB_BRANCH=main e VPS_REPO_PATH=/root/[oculto] Se aparecer segredounlock/
```