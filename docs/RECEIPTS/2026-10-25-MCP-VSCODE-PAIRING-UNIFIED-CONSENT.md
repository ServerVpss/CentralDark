# MCP CentralDark — pareamento VS Code no Cockpit (25/10/2026)

## Intencao do CHEFE
O mesmo codigo mostrado pela extensao VS Code deve aparecer na pagina do Cockpit para confirmacao humana, sem expirar antes da abertura da pagina e sem aprovacoes automaticas.

## CURRENT e causa demonstrada
- Screenshots: VS Code informa codigo; navegador recebe invalid_request: Pareamento expirado ou ja concluido; extensao relata timeout.
- apps/modulos/mcp/src/index.js e dist/index.js montavam DOIS routers /device com stores distintas. O POST /device/pair/start era consumido pela primeira store; /authorize consultava a segunda, gerando 404.
- A extensao iniciava TTL de 120 segundos antes de aguardar clique em caixa modal do VS Code.
- A URL do Cockpit nao levava codigo exibido nem nonce de confirmacao, enquanto o POST do MCP usava nonce local sem verificar nonce enviado.

## DELTA de menor escopo
1. Um unico createDevicePairingStore serve createDevicePairingRouter e configureDevicePairingForOAuth, mantendo cookieAdmin. src/dist consistentes.
2. /authorize entrega pair_code e pair_nonce efemeros para apps/instinto-superior/src/routes/mcp-autorizar.tsx; a tela mostra o mesmo codigo e exige clique Confirmar pareamento.
3. O POST valida nonce enviado contra a store, codigo e cookie admin; token de posse nao entra no URL da pagina.
4. A extensao skills/vs-code-restore/src/extension.ts abre o navegador imediatamente sem modal anterior; a confirmacao administrativa continua obrigatoria.
5. Teste atualizado ao redirecionamento canonico; checks estaticos garantem store unica e codigo visivel.

## Provas locais
- node --check JS afetados: PASS.
- Sintaxe React TSX e extensao por esbuild: PASS.
- tsc --noEmit da extensao VS Code: PASS.
- pairing-consent-flow.test.mjs + device-pairing.test.mjs: 11/11 PASS.
- Cobertura inclui anonimo negado, nonce incorreto, codigo incorreto, replay, expiracao, token one-shot e heartbeat.
- git diff --check: PASS.
- Dados de teste sao ficticios; nenhum codigo real dos screenshots ou segredo de posse foi registrado.

## Estado e NEXT_CURSOR
Prova local de codigo e integracao. COMMIT != CI_PASS != DEPLOYED != PAREADO. A autorizacao final exige o clique humano. Publicar pelo owner existente, verificar CI/deploy do mesmo SHA e comprovar tentativa nova VS Code -> navegador -> clique -> status/heartbeat.
