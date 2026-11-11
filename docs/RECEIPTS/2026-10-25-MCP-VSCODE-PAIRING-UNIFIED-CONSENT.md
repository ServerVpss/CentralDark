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
- Runtime do VS Code usa skills/vs-code-restore/out/extension.js; o artefato existente estava obsoleto e nao continha pairVsCode. Regenerados e incluidos out/extension.js, autoUpdater.js e remote-terminal.js (+ sourcemaps) via npm run compile. Teste de contrato valida a distribuicao compilada.
- pairing-consent-flow.test.mjs + device-pairing.test.mjs: 12/12 PASS.
- Cobertura inclui anonimo negado, nonce incorreto, codigo incorreto, replay, expiracao, token one-shot e heartbeat.
- git diff --check: PASS.
- Dados de teste sao ficticios; nenhum codigo real dos screenshots ou segredo de posse foi registrado.

## Estado e NEXT_CURSOR
Prova local de codigo e integracao. COMMIT != CI_PASS != DEPLOYED != PAREADO. A autorizacao final exige o clique humano. Publicar pelo owner existente, verificar CI/deploy do mesmo SHA e comprovar tentativa nova VS Code -> navegador -> clique -> status/heartbeat.

<!-- CENTRALDARK_NEIGHBOR_ROOT_CAUSE_REPAIR_20261109 -->
## 09/11/2026 — Pareamento portátil + costura de registros no MCP

**Intenção do CHEFE:** fechar o pareamento do CentralDark Remote Bridge com MCP sem caminho preso a Windows, raiz antiga ou VPS, corrigindo falhas vizinhas da mesma causa no owner existente e preservando o que funciona.

**Causa observada:** apps/modulos/mcp/src/device-pairing.js tinha registro padrão apontando para diretório. A aprovação em /authorize chamava readRegistry(), que tentava ler a pasta como JSON e devolvia EISDIR/HTTP 500. audit-logger.js, log-funnel.js e lib/audit.js continham defaults presos a /root/CentralDark/logs. Um teste mostrou que a identidade clientLabel não era projetada em actor no registro do agente.

**Menor delta:**
- src/device-pairing.js + dist/device-pairing.js: homedir()/.centraldark/mcp-device-registry.json, independentemente do diretório atual. Rejeitar caminho relativo, diretório em vez de arquivo e JSON danificado sem apagar dados; manter escrita atômica e permissões originais.
- src/audit-logger.js + dist/audit-logger.js: fallback dinâmico para a pasta de logs do repositório quando não configurada; preservar clientLabel como nome do agente.
- src/log-funnel.js + dist/log-funnel.js: preferir CENTRALDARK_LOG_ROOT/LOG_DIR e, na ausência, resolver logs pela localização do módulo.
- src/lib/audit.js + dist/lib/audit.js: preferir MCP_AUDIT_DIR/LOG_DIR/CENTRALDARK_LOG_ROOT e, na ausência, resolver pela localização do módulo.
- Tests ampliados nos owners já existentes tests/device-pairing.test.mjs e tests/agent-observability.test.mjs.

**Resultado observado na VPS da Casa openKylin (checkout local):** 18/18 testes de pareamento/OAuth e 4/4 de observabilidade; total 22/22. Sintaxe node --check e git diff --check dos arquivos afetados passaram. Testes com dados fictícios e isolamento de HOME, verificando caminhos, permissões, códigos, expiração, registros e heartbeat. O teste agent-observability que falhava por ignorar clientLabel passou depois da correção.

**Limite:** uma bateria mais ampla mostrou falhas em quatro testes de interface/contratos fora do cone afetado, que não estão sendo declarados verdes. src/oauth.js, dist/oauth.js e Cockpit têm trabalho local de outro writer, preservado sem sobrescrita. Não houve aprovação humana de novo dispositivo nem execução de tools/list autenticado nestes testes. Arquivos e registros administrativos anteriores não foram removidos.

**Próximo passo:** reconciliar o checkout local com main sem apagar trabalho alheio; em janela autorizada, recarregar somente centraldark-native-mcp-http.service e fazer pareamento novo, com confirmação humana, status, heartbeat e tools/list autenticado. DOC != SERVIÇO RECARREGADO != DISPOSITIVO PAREADO.
<!-- /CENTRALDARK_NEIGHBOR_ROOT_CAUSE_REPAIR_20261109 -->
