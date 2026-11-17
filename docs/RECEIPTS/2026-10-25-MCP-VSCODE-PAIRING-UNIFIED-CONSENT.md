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

<!-- HISTORICO_CONFIRMAR_CODIGO_20261108 -->
## Apresentação da confirmação

@code_ref: apps/instinto-superior/src/routes/mcp-autorizar.tsx
@last_updated: 2026-11-08T22:47:36Z

Quando o servidor já entrega o código, a confirmação reutiliza o painel dourado do acesso do Cockpit. A página destaca o código e o botão de confirmação. O formulário continua enviando o identificador, o nonce e o código ao mesmo endpoint. Os estados de digitação, login, erro e sucesso continuam disponíveis.
<!-- /HISTORICO_CONFIRMAR_CODIGO_20261108 -->

<!-- COSTURA_VM_DEVICE_PAIRING_20261112 -->
## 12/11/2026 ? COSTURA: identidade de dono e revogacao do proprio dispositivo

@code_ref: apps/modulos/mcp/src/device-pairing.js
@code_ref: apps/modulos/mcp/dist/device-pairing.js
@code_ref: apps/modulos/mcp/tests/device-pairing.test.mjs
@last_updated: 2026-11-12T22:14:42Z

O checkout VMware continha alteracoes locais uteis nao publicadas: ownerUserId opcional na aprovacao do dispositivo, persistencia de owner_user_id e revokeSelf autenticado pelo token do proprio dispositivo na rota /device/devices/self/revoke. Preservados no owner existente, incluindo o espelho dist e a contraprova de token incorreto, rotacao, revogacao e heartbeat.

Prova local VMware: node --check nos tres arquivos e node --test tests/device-pairing.test.mjs com 11/11 PASS. A publicacao de fonte nao comprova consumo do servico, login Supabase nem tools/list autenticado. SOURCE_ONLY; RUNTIME=UNKNOWN; NEXT_CURSOR=validar integracao no consumer e pareamento autorizado sem reiniciar servicos por este commit.
<!-- /COSTURA_VM_DEVICE_PAIRING_20261112 -->

<!-- CENTRALDARK_OAUTH_SINGLE_SURFACE_SAMBA_20261117 -->
## 17/11/2026 — consentimento OAuth e pareamento na mesma tela compacta

#OBSERVACOES#
@owner: apps/instinto-superior/src/routes/mcp-autorizar.tsx
@code_ref: apps/instinto-superior/src/routes/mcp-autorizar.tsx
@doc_ref: docs/RECEIPTS/2026-10-25-MCP-VSCODE-PAIRING-UNIFIED-CONSENT.md
@last_updated: 2026-11-17T21:27:49.471Z
@escopo: apresentacao e formulario da rota /mcp-autorizar; sem novo OAuth, servidor ou store
@implementado: UI com largura maxima 480px, simbolo ROV do template E:, tokens do Instinto Superior e dois contextos reais por client_id
@estado: SOURCE_TESTED_LOCAL; RUNTIME_DEPLOY_NOT_PROVED
@next_cursor: comprobar build e consumo do mesmo SHA na Forja; ligar Hermes/Bridge por cliente real; ler logs sem revelar segredos

**Intencao do CHEFE:** adaptar o fluxo visual do `C:\Users\Administrador\Downloads\CentralDark-MCP-OAuth-Conceito.html` diretamente no owner existente na Forja (SMB `V:\apps\instinto-superior\src\routes\mcp-autorizar.tsx`), promover somente o delta verificado à `main` e sincronizar o arquivo correspondente da Casa sem sobrescrever seu checkout sujo.

**Duas modalidades no mesmo /mcp-autorizar:** cliente OAuth MCP comum mostra consentimento e envia somente parametros existentes `client_id`, `redirect_uri`, `state`, `scope`, `code_challenge`, `code_challenge_method` ao `POST /authorize`. `centraldark.remote-bridge` e `centraldark.centraldark-vscode-restore` mostram pareamento, com `pair_id`, `pair_nonce` e `pair_code` da tentativa iniciada **pelo cliente real**. Credenciais/segredo de posse e tokens ficam exclusivamente no backend e no dispositivo solicitante. A UI nao fabrica logins, tokens ou transicoes de refresh do prototipo HTML.

**Correção funcional do fluxo:** o botao generico `Gerar codigo de pareamento` no navegador foi retirado do consentimento MCP porque sua chamada `/device/pair/start` criava `executor=hermes` e recebia `pair_secret` apenas no navegador, nao no cliente que precisa consultar `/device/pair/status`. O fluxo real do Bridge/VS Code preserva o gerador no **cliente** e o codigo confirmado pelo dono nesta mesma rota; sem outro motor ou roteador.

**Provas de fonte:** o owner na Forja foi escrito diretamente via Samba; TSX `typescript.transpileModule` sem erros de sintaxe; regressao isolada MCP `node --test apps/modulos/mcp/tests/pairing-consent-flow.test.mjs` = **9 PASS / 0 FAIL / exit 0** usando TEMP em F:\TEMP. O mesmo `/authorize` foi exercitado com Hermes, Bridge, VS Code, nonce, code, PKCE e token entregue somente ao cliente autorizado. Nenhum teste usou credencial real. Build completo de Cockpit, autenticacao humana ao vivo e deploy do mesmo SHA continuam provas separadas.

**Invariantes:** `CSS_TOKENS_REUSED`, `ROV_LOGO_REUSED`, `SAME_AUTH_OWNER`, `NO_PASSWORD_FIELD`, `NO_SIMULATED_TOKEN_UI`, `MCP_AUTH != DEVICE_PAIRING`, `SOURCE != DEPLOYED`. Formulario real e clique humano preservados; sem mudanca em `apps/modulos/mcp/src/oauth.js` nem em regras de seguranca.
<!-- /CENTRALDARK_OAUTH_SINGLE_SURFACE_SAMBA_20261117 -->

<!-- CENTRALDARK_OAUTH_LAYOUT_UTF8_REPAIR_20261117 -->
### 17/11/2026 — correção da renderização 480px e UTF-8 na mesma rota

@owner: apps/instinto-superior/src/routes/mcp-autorizar.tsx
@doc_ref: docs/RECEIPTS/2026-10-25-MCP-VSCODE-PAIRING-UNIFIED-CONSENT.md
@status: SOURCE_ONLY; FULL_BUILD_AND_DEPLOY_UNKNOWN
@next_cursor: validar componente renderizado na Forja no mesmo SHA, depois fluxo real com consentimento humano

**Sintomas observados visualmente pelo CHEFE:** o painel ocupava quase toda a largura (utilitário Tailwind `max-w-[480px]` não foi respeitado no consumer) e os rótulos apresentavam `PROPRIET?RIO`, `Permiss?es`, `CENTRALDARK ? OS`. O defeito não é da regra de pareamento nem do OAuth: a fonte TSX tinha interrogações literais no lugar de caracteres UTF-8, introduzidas no transporte de texto, e a restrição de largura não se manifestava na renderização observada.

**Menor delta no mesmo owner (Samba V:):** preservar todas as classes semânticas e handlers, acrescentar restrição CSS inline de 480px no section e alinhamento flex explícito no main para não depender exclusivamente da geração Tailwind dinâmica; substituir somente as cadeias textuais corrompidas (incluindo proprietário, permissões, confirmação, sessão, conexão, código, título, links) por Unicode correto. GitHub blob transmitido com escapes ASCII do JSON, conferido contra SHA Git blob dos bytes UTF-8 da Forja.

**Invariantes:** mesmo `POST /authorize`, `pair_id`, `pair_nonce`, PKCE, credenciais no backend, clique humano e nenhum segredo novo no navegador. Layout responsivo `width:100%; maxWidth:480px`. `SOURCE_SAVED != DEPLOYED`; verificações funcionais e screenshot após rebuild são provas separadas.

**Aprendizado:** nunca diagnosticar acentuação quebrada como CSS quando o próprio TSX já contém `?` nos textos. Verificar bytes UTF-8 no owner antes de construir, transmitir sem perda de Unicode e exigir readback de rótulos acentuados na `main` e na Casa.
<!-- /CENTRALDARK_OAUTH_LAYOUT_UTF8_REPAIR_20261117 -->

<!-- CENTRALDARK_OAUTH_COCKPIT_SUPABASE_CONSENT_20261117 -->
## 2026-11-17 — sessão Cockpit para o consentimento OAuth MCP e Bridge

Owner: `apps/modulos/mcp/src/oauth.js` e `apps/instinto-superior/src/routes/mcp-autorizar.tsx`.
Intenção: corrigir o erro `Senha inválida` no consentimento de usuário já autenticado em `admin.centralldark.com`, sem criar outro autenticador, sem senha repetida, sem contornar papéis.
Causa confirmada no código: o Cockpit guarda sessão Supabase; o `POST` HTML anterior para `mcp.centralldark.com/authorize` não carregava o `cd_admin` do MCP nem JWT Supabase. O servidor caía no fallback de `MCP_ADMIN_PASSWORD` e retornava `Senha inválida`, independentemente do login no Cockpit.

Menor delta aplicado diretamente no owner da Forja via Samba `V:\`:
- A rota React obtém `supabase.auth.getSession()` apenas no clique humano, envia o access JWT em `Authorization: Bearer` por `fetch` `POST /authorize` com `credentials: omit`, sem token em query, URL ou campo oculto.
- O owner OAuth reutiliza a validação Supabase preexistente: `/auth/v1/user` e `user_roles.role=admin`; nega sessão inexistente e usuário comum. O modo JSON é limitado a `Origin: https://admin.centralldark.com`; mantém o fallback HTML legado sem inventar autenticação.
- Após autorização, o servidor retorna `redirect_to` somente ao Cockpit verificado; a UI verifica origem/caminho registrados do callback antes de navegar. O pareamento VS Code/Bridge responde sucesso JSON, mantém segredo de posse somente no cliente e exige clique, código e nonce.

Contraprova isolada sem usar credenciais reais: `node --test apps/modulos/mcp/tests/pairing-consent-flow.test.mjs` = **10/10 PASS**, inclusive negação de JWT ausente, negação de role não-admin, negação de Origin externo, callback PKCE/state preservado e pareamento VS Code com JWT admin. `node --check` do owner e do teste = PASS; compilação TypeScript/transpile da rota = 0 erros.
Estado: SOURCE_TESTED=PASS; OWNER_BRANCH_DEPLOYED=UNKNOWN; PRODUCTION_BROWSER_SESSION=NOT_TESTED; SUPABASE_CONFIG_RUNTIME=UNKNOWN. Não confundir fonte publicada com serviço atualizado.
Aprendizado: sessão no Cockpit não se torna automaticamente cookie de outro domínio. Reutilizar identidade **validada no backend** via JWT e roles; nunca pedir senha administrativa de novo ou permitir token de usuário comum autorizar MCP.
<!-- /CENTRALDARK_OAUTH_COCKPIT_SUPABASE_CONSENT_20261117 -->

<!-- CENTRALDARK_OAUTH_FORMDATA_AWAIT_FIX_20261117 -->
### 17/11/2026 — FormData antes do await no consentimento OAuth

**Sintoma real:** `Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'` ao autorizar no Cockpit. **Causa comprovada na fonte:** `new FormData(event.currentTarget)` executava **depois** de `await supabase.auth.getSession()`. O `currentTarget` de evento React é válido durante a chamada síncrona, não necessariamente após a suspensão assíncrona. Não é erro de senha nem da configuração do MCP.

**Menor delta no mesmo owner:** capturar `event.currentTarget`, validar `instanceof HTMLFormElement` e serializar `FormData` antes do primeiro `await`. Preservados os campos OAuth, o JWT, `redirect_uri`, PKCE, o owner `/authorize` e o consentimento explícito. Regressão acrescentada no teste existente para travar a ordem das operações. Prova local: TSX parse 0 erros; `pairing-consent-flow.test.mjs` **10 PASS / 0 FAIL**. Deploy e autorização humana pós-rebuild: UNKNOWN.
<!-- /CENTRALDARK_OAUTH_FORMDATA_AWAIT_FIX_20261117 -->

