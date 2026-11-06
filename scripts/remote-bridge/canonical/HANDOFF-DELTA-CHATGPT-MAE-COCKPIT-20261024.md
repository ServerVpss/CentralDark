# DELTA CONTÍNUO — MISSÃO-MÃE + HUD COCKPIT (ChatGPT / Casa)

**Data:** 2026-10-24, Casa Bahia. **Missão-mãe única:** `t_911e17ff` (EXPANDIR CONHECIMENTO).
**Registro dentro do owner existente:** `K:\scripts\remote-bridge\canonical\`. Este arquivo é um delta/handoff, NÃO um novo agente, servidor, gateway ou orquestrador.

## Intenção do CHEFE

Um único ID-mãe permanente, filhas por intenção/escopo, múltiplos agentes sem conflito de escrita, conhecimento durável em `docs/CONSCIENCIA/APRENDIZADOS`, `docs/CONSCIENCIA/LEMBRANCAS` e receitas na skill existente. GitHub: histórico e PR-mãe visual, sem usar runner pesado como prova obrigatória. Casa Windows: desenvolvimento/teste; VPS: publicar por caminho autorizado e comprovar no destino usando teste curto.

## Dois agentes em paralelo, mesmo owner

- **ChatGPT writer UI/backend:** `K:\apps\instinto-superior\src\components\central\ForjaExecutor.tsx` e `K:\apps\instinto-superior\src\lib\cockpit.functions.ts`. Inseriu card MISSÃO-MÃE no Forja Executor existente e server function de leitura `lerMissoesMaeCentralDark`, sem dispatcher paralelo.
- **Hermes auditor:** Kanban `t_13f64ec8`, perfil `default`, NVIDIA Nemotron, concluiu com run `completed`; escreveu o relatório independente `HANDOFF-DELTA-HERMES-COCKPIT-SENSOR-20261024.md` nesta pasta. Leitura de fontes, sem tocar no código UI.
- **Mãe:** `t_911e17ff` fica `blocked` por design para NÃO despachar um objetivo infinito. Isso NÃO é falha do produto. O conteúdo é identidade e índice persistente.

## Prova do parentesco nativo e ressalva crítica

- `hermes kanban link t_911e17ff t_13f64ec8` retornou sucesso e readback mostrou auditoria `done`, `parents=t_911e17ff` e mãe `children=t_13f64ec8`. Outras três tarefas previamente concluídas também foram vinculadas: `t_928a8cbd`, `t_2805243c`, `t_26e02a16`; confirmar novo readback agregado antes de declarar contagem atual.
- **DAG NÃO É APENAS HIERARQUIA:** `--parent` gera dependência `parent_not_done`. Como a mãe permanente está BLOCKED, criar filhos executáveis com `--parent` no momento do despacho travaria a fila. Solução sem arquitetura paralela: `created_by=mae:t_911e17ff`, corpo contém ID-mãe desde o início; Hermes executa a filha sem dependência; quando `done` com efeito/recebimento comprovado, aplicar `kanban link` na filha concluída para agregar a mãe. Não atribuir à mãe assignee nem modelo para execução.
- O auditor Hermes apontou equivocadamente duas filhas `t_25ea192c` e `t_5f53bd8c` como `children` da mãe; **contraprova direta antes dos links** mostrou a mãe com `children=[]` e `t_5b386368` com aquelas duas filhas. São filhas da INTEGRAÇÃO, não da mãe. Status continuam `todo`, dependência do pai `t_5b386368` não concluído e workspaces relativos inválidos. Preservar essa correção nas próximas leituras.

## O que já entrou no Cockpit real (código local)

- **Owner UI existente:** `ForjaExecutor.tsx`, aba Forja do `CockpitShell.tsx` existente. NÃO há dashboard paralelo.
- **Sensor autenticado:** `lerMissoesMaeCentralDark` em `cockpit.functions.ts`. Reutiliza Hermes CLI Windows `kanban list --json` e `show ID --json` em modo LEITURA; requer usuário Supabase admin; em servidor não-Windows retorna `UNKNOWN`, não afirma acesso remoto inexistente.
- **Painel:** ID-mãe, total de missões, RUNNING/DONE/BLOCKED/AGUARDANDO, responsável, setor baseado no workspace, tipo de vínculo NATIVO/DECLARADO/LEGADO, campo fase atual e restantes `NÃO DEFINIDO` se não houver etapas numeradas, erros de bloqueio sanitizados; atualização de 30s.
- O campo interno `workspaceValido` distingue caminho absoluto Windows de workspace relativo malformado. Não concluir prova de execução por existir essa flag. Dados/erros privados não entram na UI.

## Convergência e limites

- O UI recém-editado ainda depende de validação TypeScript específica e readback no navegador da Casa. O comando geral `tsc --noEmit` encontrou erros de tipagem anteriores em outros módulos e não é prova global verde. Lint geral neste Windows acusa formatação CRLF em muitas linhas; não reformatar o repo inteiro para mascarar o diagnóstico.
- O server function comprova leitura apenas quando executado **no servidor do Cockpit na Casa** e com autenticação admin. Na VPS, sem rota MCP homologada para este feed, status é `UNKNOWN`. Não prometer painel ao vivo na VPS agora.
- Não alterar páginas, menus, engine, OAuth, GitHub, PR/main, tarefa scheduler ou outros arquivos do agente de integração. Não publicar credenciais em trace/log/handoff.

## Fórmula MVP racional

`INTENÇÃO (CHEFE) -> ID_MÃE -> OWNER + FILHA SEM DEPENDÊNCIA -> HERMES EXISTENTE -> TRACE + READBACK -> DELTA APROVADO -> LINK FILHA DONE NA MÃE -> DOCS/LEMBRANÇAS/APRENDIZADOS -> GITHUB COMO HISTÓRICO`.

Economia operacional alvo: de pelo menos 7 decisões manuais por intenção (localizar owner, executor, criar, atribuir, transportar contexto, observar, registrar) para 1 entrada textual + monitoramento visual. **Alvo, não conquista E2E ainda**: o botão GOAL da Forja só copia DRAFT enquanto o dispatcher da Casa/MCP não estiver conectado e provado.

## NEXT_CURSOR

1. Verificar TS nos dois arquivos do sensor e a renderização local do card Forja.
2. Ler o relatório Hermes `t_13f64ec8`; não confundir erro de auditoria com readback real.
3. Reconciliar filhos de `t_5b386368` com workspaces absolutos e terminal do Kanban antes de liberar; escopo do agente de integração.
4. Reusar autenticação MCP e rota de execução existente para ligar texto do GOAL ao despacho real quando endpoint Casa tiver receipt confirmado; sem runner CI pesado.
5. Após prova, registrar aprendizado/lembrança e selar o recibo histórico no mesmo PR-mãe/GitHub, sem push automático neste delta.

**Veredito:** arquitetura mãe e integração de código local em progresso; auditor Hermes DONE; readback de painel/browser e VPS E2E ainda pendentes. Nenhum PASS inventado.

## Delta 25/10/2026 — dois circuitos, owner preservado

**Intencao:** VS Code pareado no MCP CentralDark; motor MCP local do CentralDark-Remote exposto pelo Cockpit Instinto Superior, sem copiar casca visual/servico cloud do Desktop Commander.

**Circuito A — VS Code / OAuth CentralDark:** PENDENTE. A extensao em `skills/vs-code-restore/src/extension.ts` na VPS tem pareamento por codigo e `openExternal`; o MCP guarda pendencias com TTL de 2 minutos. Screenshot mostrou autorizacao expirada/concluida, nao PASS. Fonte da VPS esta dirty; nao sobrescrever ou publicar sem reconciliar owner e testar login/consentimento humano/heartbeat. `auditStartupReady=false` medido no MCP em 25/10, sem bypass.

**Circuito B — Casa / Cockpit:** PARCIAL PROVADO. Reutilizada a fonte `K:\scripts\remote-bridge\canonical\CentralDark-Casa-Agent.mjs`, motor MCP stdio local upstream MIT, sem vendor remoto; HTTP `127.0.0.1:9101/health` = 200, `remote_vendor=false`, `engine_connected=false` no instante medido. `node --test ...CentralDark-Casa-Agent.test.mjs` = 1/1 PASS para loopback, bearer e escrita bloqueada. Nao houve chamada `tools/call` autenticada, logo E2E=NOT_PROVEN.

**Melhorias de codigo executadas na Casa, sem deploy Git/VPS:** `EstadoCentralDark.tsx` exporta `etiqueta` conforme consumidores; `cockpit.functions.ts` consulta a bridge somente no host Casa e devolve `RUNNING` quando a assinatura /health corresponde, nunca `PASS` sem prova de ferramenta; `StatusPanel.tsx` reusa a UI aprovada e cataloga a rota `centraldark-remote-casa`. Novo backend/dashboard/MCP=NAO; upstream UI copiada=NAO.

**Testes T1:** Vite no checkout canônico `K:\apps\instinto-superior`, `GET http://127.0.0.1:8081/cockpit` -> HTTP 200, `ssrError=false`, antes havia `etiqueta is not a function`; transpile sintatico dos tres arquivos = 0 erros; teste direcionado StatusPanel = 1/1 PASS. Harness HUD global antes do sensor = 12/18 (6 falhas); nao chamar resultado global de verde. Teste MCP da copia Casa nao iniciou por falta de dependencia `express`; nao instalar automaticamente.

**Proxima prova exigida:** (1) VS Code: codigo fresco -> aceite do dono no /authorize -> `/device/pair/status` -> token protegido e heartbeat; (2) Casa: engine initialize -> tools/list -> tool read-only via ponte autenticada Tailscale -> readback no MCP e no Cockpit, com responsavel/receipt. Nao remover ou interromper processos legados antes de contraprova. 
**VERDICT:** COCKPIT_SSR=PASS; CASA_BRIDGE_TEST=PASS; CASA_ENGINE_CALL=NOT_PROVEN; VS_CODE_AUTH_E2E=NOT_PROVEN; VPS_DEPLOY=NOT_EXECUTED.

## Delta 25/10/2026 — OAuth Cline: porta variavel sem rerregistro manual

**Origem do problema:** screenshots do Cline remoto registraram `http://127.0.0.1:1456/mcp/oauth/callback`, depois tentaram `http://127.0.0.1:1457/mcp/oauth/callback`, recebendo `invalid_request: redirect_uri não registrado pra esse client`. A configuracao de Cline usa DCR publico (`token_endpoint_auth_method=none`). O endpoint MCP `/register` ja existe; nao criar novo auth broker, servidor ou cliente ficticio.

**Origem tecnica:** `apps/modulos/mcp/src/oauth.js` usava `client.redirect_uris.includes(redirect_uri)` no `/authorize`, exigindo igualdade ate da porta. A especificacao RFC 8252, seccoes 7.3 e 8.4, permite variar apenas a porta para loopback IP de clientes publicos nativos.

**Delta implementado EXCLUSIVAMENTE na Casa K:\ (sem publicacao):**
- `apps/modulos/mcp/src/oauth-redirect-match.js` — pequena funcao pura `redirectUriRegistered`, com igualdade exata por padrao; excecao da porta apenas em `http://127.0.0.1` ou `http://[::1]`, para `token_endpoint_auth_method=none`, preservando host, path e query. Rejeita localhost, aliases de IP, hosts externos, URL com userinfo, fragmento, cliente confidencial.
- `apps/modulos/mcp/src/oauth.js` — reusa a funcao no registro DCR e no cliente CIMD; nenhuma alteracao em `/token`, consentimento ou PKCE.
- `apps/modulos/mcp/tests/oauth-loopback-port.test.mjs` — testes de aceitação/negacao e contrato do `/token`.

**Prova local:** `node --test K:\apps\modulos\mcp\tests\oauth-loopback-port.test.mjs` = 8/8 PASS, exit 0; `node --check K:\apps\modulos\mcp\src\oauth.js` = exit 0. Nao foi executado fluxo autentico Cline OAuth E2E devido a dependencias indisponiveis na arvore da Casa e ao owner VPS com worktree dirty. Status do MCP publicado ainda = NAO VERIFICADO PARA ESTE DELTA.

**Economia prevista, NAO MEDIDA:** apos uma inscricao valida, callback localhost de porta variavel nao devera exigir edicao `sed`, novo `client_id`, apagar estado OAuth ou reiniciar processos. "5-10x" e meta de reducao de passos manuais, nao benchmark provado.

**NEXT_CURSOR para owner MCP VPS:** reconciliar diff contra `oauth.js` dirty na VPS (pareamento VS Code precisa ser preservado); portar apenas import, funcao pura e duas chamadas, manter test; rodar regressao DCR/CIMD/VSCode + consentimento; promover via receita MAIN-PINNED com source SHA e gates de auditoria; confirmar Cline em Remote-SSH recebe redirect no mesmo host em que listener callback esta ativo (ou forwarding SSH autorizado); `/authorize` + usuario confirma + `/token` + `initialize` + `tools/list`; registrar receipt. Nao limpar Cline nem transmitir `code_verifier`/token.

**VEREDITO:** CODIGO_CASA=IMPLEMENTADO; LOOPBACK_TESTES=PASS_8_8; VPS_PUBLICADO=NAO; CLINE_E2E=NAO_COMPROVADO.

## Auditoria de publicacao SSH 25/10/2026 — sem aplicacao remota
- CHEFE autorizou administracao e escolheu SSH DIRETO, sem CI/CD/GitHub Actions.
- SSH Casa -> VPS `root@centraldark-os`: hostname `CENTRALDARK-OS` verificado por BatchMode, HostKey checking, sem senha interativa.
- Runtime efetivo MCP: `/root/CentralDark_MCP_RUNTIME/apps/modulos/mcp/dist/index.js` via `centraldark-native-mcp-http.service`. Repo principal VPS `/root/CentralDark` e runtime sao arvores distintas e dirty. O OneShot Casa em `K:\OneShot` foi preservado; nenhum artefato OneShot modificado.
- Baseline runtime `node --test tests/pairing-consent-flow.test.mjs tests/oauth-refresh-client-binding.test.mjs`: 5 PASS/0 FAIL. HTTP local /health 200; discovery publica /register, /authorize, /token, S256.
- Delta OAuth Casa: `apps/modulos/mcp/src/oauth.js` + `oauth-redirect-match.js` + `tests/oauth-loopback-port.test.mjs`; 8 PASS/0 FAIL. Destino VPS nao alterado; hashes baseline dos quatro oauth.js VPS medidos para reconciliacao.
- Bloqueio: tentativa de criar recipe de gravacao/backup/copia atomica para SSH na Casa foi bloqueada pela ferramenta com erro de seguranca; nao houve contorno. MCP admin reportou `auditStartupReady=false` e scratch status DRIFT; raiz do contrato root gate=PASS mas nao autoriza promoçao por si.
- Nenhum rebuild, restart, push, deploy ou commit efetuado nesta tentativa. NEXT_CURSOR: obter liberacao pela rota aprovada existente, reconciliar arvores dirty de forma atomica, testar baseline+delta, reiniciar somente `centraldark-native-mcp-http.service` e provar autorizacao Cline/VS Code real com receipt. Nao anunciar 99% ou E2E sem verificacao.
