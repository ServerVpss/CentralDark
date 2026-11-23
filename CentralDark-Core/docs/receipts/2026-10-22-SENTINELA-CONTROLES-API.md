# Instinto Superior — Sentinela do mesmo cockpit (22/10/2026)
Owner existente: apps/instinto-superior/public/centraldark-erros-visiveis.js, injetado pelo src/routes/__root.tsx.
Skill kaizen-sistema-um; uma única sentinela, sem controle paralelo.
Delta: ID de botões ou fallback acessível, CLICK_SEEN correlacionado a erro em 15 segundos, observação de fetch/XHR, event CustomEvent centraldark:sentinela, redaction de token em mensagens, alerta sonoro opcional, health somente quando CD_ERROS_CONFIG.apiHealth estiver configurado. Painel herda skin existente.
Transportes: cfg.coracao só usa POST same-origin, configurado explicitamente em endpoint autenticado. Se não estiver configurado, estado UNKNOWN; nunca afirmar telemetria remota ou êxito.
Security: nunca coletar valores de input, headers, request bodies ou cookies. HTTP_ACK não é EFFECT_PROVED.
Teste no writer: new Function(script) => JS_PARSE_PASS. Testes funcionais navegador / build / VPS runtime ainda pendentes; Casa não reconciliada (não sobrescrever).
NEXT_CURSOR: integrar cfg.coracao com endpoint autenticado existente; comparar Casa; conferir browser DOM com botões, erro de rede, health e eventos no funil canônico.

## Contraprova adicional da mesma batida
Mock isolado da página com execução real do script via V8: clique com data-cd-flow = PASS; correlação de erro = PASS; sanitização de Bearer/token/URL com query = PASS; fetch HTTP 503 observado = PASS; 2 health failures same-origin -> FAIL = PASS. API de eventos não foi configurada: transporte UNKNOWN. UI_E2E, BUILD, VPS e Casa permanecem pendentes.

## Continuação — amarrar ID de botão à rota de saúde existente
- 25 `TabsTrigger` do CockpitShell receberam `data-cd-flow=instinto.CockpitShell.aba.<id>`, um por aba, verificação de unicidade e equivalência de 25 itens. É identificação de clique, não execução do botão nem ACK de executor.
- `__root.tsx` configura, antes da injeção do sensor único, `CD_ERROS_CONFIG.apiHealth=https://mcp.centralldark.com/health` e probe a cada 60 segundos. Leitura read-only validada da VPS com `Origin: http://100.123.93.25:8080`: HTTP 200, `Access-Control-Allow-Origin: *` em 22-10-2026. Não requer token de navegador.
- Não foi configurado `cfg.coracao`: transporte persistente para evento/clique segue UNKNOWN, por não haver endpoint de ingestão same-origin autenticado e comprovado para esta superfície. `HTTP_ACK` da rota de saúde não demonstra execução de ferramenta ou Windows acessível.
- Casa ainda não reconciliada, GitHub PR não é código publicado na porta 8080. Próximos gates: build e browser de Casa, comparar deltas sem sobrescrever worktree, comprovar id/correlation em API no owner certo.

## Nova prova — Casa Windows via Tailscale (22/10/2026)

- INTENCAO: sincronizar Casa com a versao aprovada do cockpit, sem perda de deltas locais. Executado ate este marco: descoberta e observacao **read-only**. Nenhum deploy/pull/merge/reset na Casa.
- HOST: `windows-casa`/`SEGREDO`, Tailscale `100.123.93.25`: `tailscale ping` retornou `pong`, cockpit `http://100.123.93.25:8080/sala-controle` HTTP 200.
- PORTAS_TCP_FROM_VPS: 22, 5985, 8080, 9100 e 3030 OPEN; 8081 sem resposta. Porta aberta nao equivale a shell autenticado nem servico especifico.
- CASA_SENTINELA_HTTP_READBACK: GET `:8080/centraldark-erros-visiveis.js` HTTP 200 text/javascript, Git blob SHA `769aec85b2aabbcaec5b4f9e9ac0e3a3b48822df`.
- GITHUB_MAIN_SENTINELA_BLOB: `f1f471922dc6a65568050381c462b4b54a3812e5`.
- GITHUB_PR1908_SENTINELA_BLOB: `860776008541ccac9b2e6493f304ac1e5cbcf1b0`. Os tres blobs diferem: CASA_PR1908_RUNTIME_PARITY=FAIL; isto nao determina o conteudo das outras pastas da Casa.
- SCREENPIPE_CASA: GET `:3030/health` HTTP 200, JSON status `degraded` (audio_stale), `frame_status=ok`, `vision_reason=ok`, frame timestamp `2026-10-22T04:20:41-03:00`. GET `:3030/status` HTTP 403: acesso ao sensor autenticado nao comprovado.
- VSCODE_LOG_BRIDGE: VPS recebe `vscode_bridge_status` a cada minuto com actor=casa e route de funil; `vscode_log_signal` mais recente observado `2026-10-22T05:08:27.643Z`. Heartbeat recente nao prova um novo comando ou foco de terminal.
- GITHUB_RUNNERS: `centraldark-casa-1` offline; `centraldark-vps-1` online. `inventario-casa.yml` roda em `[self-hosted, Linux]`, nao no Windows.
- CASA_SSH: TCP22 OPEN; `ssh -o BatchMode=yes -o StrictHostKeyChecking=yes` bloqueou `Host key verification failed`, pois a VPS nao possui registro confiavel de `windows-casa`. Fingerprint publico visto no probe `SHA256:LilWrZIAF+ugJ+mSbMaX9FuMSLIbgBkMIUXBuLnfUEA` **NAO VALIDADO POR SEGUNDA FONTE**. Nao gravar known_hosts nem desligar verificacao para forcar acesso. WinRM 5985 aceita TCP/HTTP 405, autenticacao nao provada.
- OUTRAS_ROTAS: Browser tabs indisponiveis nesta sessao por requerer contexto do browser de origem; CAS Cloud `not running`; Hermes Core existente `active`, fila interna ocupada (nao enfileirar missao sobreposta). Legacy Desktop Commander deliberadamente nao usado.
- NEXT_CURSOR: obter shell autenticado na Casa por owner existente (runner Casa restaurado ou SSH host key confirmada independentemente/WinRM ja autorizado); ler `git -C K:\\ status --short --branch`, identidade do checkout e deltas sem descartar nada; comparar blobs Casa/main/PR e owners por escopo; integrar apenas o que passar build, readback e contraprova. PR #1908 fica aberto ate gates e estado Casa provados.

### Delegacao e estado dos executores — mesmo recorte

- Missao valida colocada na fila EXISTENTE `apps/modulos/HERMES-CORE/missions/pendente/casa-1908-readonly-route-reconcile-20261022.md`, sidecar `.state.json` validado pelo `validateContinuityState`: `READY`, vinculado ao HEAD VPS `4b0ce5a7d93cd821c9b10231aa74d438b33bc926`. Classe `READ_ONLY_ONLY`, sem poderes de pull/deploy. Entrada na fila comprovada; execucao na Casa ainda NAO.
- `centraldark-hermes-core.service` ativa, mas com historico `NRestarts=281`; watchdog auto-reiniciou apos >120 segundos sem reset; nova observacao ficou `status=ok` apos restart. Ha missao anterior `centraldark-intent-0fee4e54c69d57930ceb6d9c` RUNNING, zero etapas; calibracao `runtime-calibration-56ba6b71f503` BLOCKED (`MAX_FALHAS_DECISOR`). Nao retirar/editar missao alheia sem ownership e contraprova. A fila nova continua pendente ate runtime consumir.
- Rotas adicionais pela tailnet: HTTPS `windows-casa.tail6d7aa4.ts.net:443` HTTP 502; `:3000/` HTTP 404; `:7070/health`, `:8787/health` e `:9100/` nao produziram status HTTP. Nao assumir executor oculto nessas portas.
- `CASA_SYNC=NOT_APPLIED`; `CASA_TERMINAL_AUTH=BLOCKED_HOST_IDENTITY`; `CASA_GITHUB_RUNNER=OFFLINE`. O aprendizado causal e que transporte e sensor operam parcialmente, mas controle autenticado ainda nao esta validado.
