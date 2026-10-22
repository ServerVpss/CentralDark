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
