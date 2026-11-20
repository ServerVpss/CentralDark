# CentralDark-Remote — nomenclatura canônica e critério de integração

**Owner canônico:** `centraldark-operational-method` + os owners de bridge/MCP já existentes em `scripts/remote-bridge/` e `apps/modulos/mcp/`.
**Nome público do produto, recurso e capacidade:** `CentralDark-Remote`.
**Control plane único:** `https://mcp.centralldark.com/mcp`.
**Data da regra:** 2026-10-24 (Bahia).

## Regra de identidade

O produto/owner **não** se chama pelo nome do antigo fornecedor e não depende da presença desse nome para ser descoberto, medido, autorizado, exibido no cockpit ou considerado saudável.

- Nomes de rota, IDs de catálogo, tarefas Windows, unidades de serviço, rótulos no cockpit, logs próprios, documentação operacional e contratos novos usam `CentralDark-Remote` (ou nomes estáveis específicos, como `CENTRALDARK_REMOTE_CASA`, `CENTRALDARK_REMOTE_VPS`, `CENTRALDARK_REMOTE_MCP`).
- Identificadores técnicos antigos podem sobreviver somente como **alias de migração compatível** enquanto um consumidor ainda os exigir; o alias aponta para o owner CentralDark e não pode iniciar nem validar o serviço antigo.
- Eventos/receipts históricos permanecem íntegros e identificados como históricos. Não reescrever a evidência passada para parecer que já usava a nomenclatura nova.
- O pacote npm upstream do motor MCP MIT pode ser citado internamente como **dependência de implementação e atribuição de origem**. Seu nome nunca é o nome de produto, do owner, do endpoint ou do estado de integração. Não usar o comando upstream `remote` nem o endpoint externo como rota principal.
- Não criar outro MCP, OAuth broker, dispatcher, memória, agente daemon, Kanban ou catálogo. Estender os owners existentes.

## Autenticação e pareamento próprios

Caminho esperado:
1. Bridge/instalador CentralDark abre o fluxo OAuth2 Authorization Code + PKCE S256 no endpoint CentralDark `/authorize`.
2. Consentimento humano ocorre na página CentralDark; não embutir nem capturar a senha do CHEFE.
3. A troca do código ocorre em `/token`; guardar tokens só no cofre/local store protegido já existente, por perfil, sem credenciais em código, logs ou recibos.
4. Reutilizar a sessão válida conforme política de expiração/refresh.
5. Inicializar o MCP CentralDark autenticado, consultar `tools/list`, invocar uma ferramenta autorizada e gerar receipt.
6. O acesso Casa↔VPS atravessa a malha Tailscale privada quando necessário; rede/health/porta aberta não substituem autenticação do aplicativo nem prova de sessão Windows.

Não afirmar que existe device-code grant próprio enquanto metadata e runtime CentralDark não o implementarem. O consentimento por senha na página OAuth não é um “device code”.

## Estados independentes obrigatórios

`DISCOVERED != AUTHENTICATED != AUTHORIZED != CONNECTED != EXECUTED != READBACK_PROVED`.

O catálogo une capacidades de todas as rotas autorizadas e medidas; uma falha em uma rota não deve apagar capacidade de outra. Para cada capacidade, registrar owner, fonte, rota primária, fallback autorizado, estado atual, último probe, prova e contraprova.

## Aceitação de integração

- `remote_mcp`/configuração operacional não pode apontar para endpoint do antigo fornecedor; deve resolver para `https://mcp.centralldark.com/mcp` e documentar OAuth2 PKCE CentralDark.
- Instalação/atualização é acionada pelo instalador próprio CentralDark, idempotente e versionado; motor MIT local por stdio, não serviço remoto terceirizado.
- O recurso aparece como **CentralDark-Remote** no catálogo MCP, no owner administrativo, no cockpit, nos logs e nas tarefas.
- Nenhuma capacidade é declarada PASS por nome, pacote instalado, processo vivo, health 200, catálogo, tarefa agendada ou evento de Kanban isoladamente.
- Prova material: auth/pareamento válido sem expor segredo, inicialização MCP, listagem de ferramentas, chamada real somente leitura, readback do alvo, log/receipt sanitizado e contraprova de rota antiga inativa/ignorada.
- A migração deve atualizar em conjunto config e consumidores, testes, texto do cockpit e tarefas/watchdogs; não apenas fazer replace de string que deixe um cliente legado tentando protocolo incompatível.
- Preservar os receipts históricos. Não fazer commit/push/merge ou deploy direto por esta regra; promoção segue gate e owner já estabelecidos.

## Referências de owner

- `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`
- `scripts/remote-bridge/CentralDark-Casa-OneShot.ps1`
- `scripts/remote-bridge/CentralDark-Casa-Agent.mjs` (se existir no ref atual aprovado)
- `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` (legado; não tratar como capacidade nativa sem prova)
- `apps/modulos/mcp/src/tools/core/mcp-admin.js`
- `apps/modulos/mcp/src/tools/core/tools-catalog.js`
- `apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx` (projeção de capacidades; reutilizar owner existente)
- `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md` (atualizar mantendo a linhagem histórica)

## Fio atual / próxima fronteira

- Main medido pela API da CentralDark: `922e1c634ad736ab3aa7386cba749c47a37553d7`.
- PR existente a reconciliar: `#1945` (não assumir merged ou deployed).
- Medição VPS: HEAD `48827a6fb`, 72 commits atrás de main no momento desta auditoria; dois processos antigos do engine remoto observados. Não desligar esses processos até a rota CentralDark nativa passar E2E e a troca ser controlada.
- Casa: a tarefa `CentralDark-Casa-Commander` existe; endpoint local 9101/9100 respondeu `engine_connected=false` na última medição. Tarefa existente não prova a engine.
- Cockpit: última leitura apresentava o recurso antigo como não comprovado, 3 erros de página, Heartbeat 404, Omni Router/Grafo Vivo/receipts indisponíveis. Não declarar UI reconciliada antes de readback após alteração.
