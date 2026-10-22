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
