# MCP Casa/VPS — vinculo de pareamento (22/10/2026)

## Intencao
Reusar o modulo de pareamento CentralDark existente para a extensao Casa/Zendrive, sem segundo MCP, sem divulgar tokens e sem alterar rotas SSH protegidas.

## CURRENT / provas antes do patch
- O CHEFE confirmou: centraldark-os (VPS), windows-casa (Casa) e iphone-segredo (iOS) pertencem a ele (declaracao do titular, nao autenticao criptografica).
- Tailscale na VPS listou windows-casa como active e iphone-segredo como offline; a ponte ao Windows respondeu a ping read-only.
- MCP publico /health HTTP 200, versao 0.4.0, 153 tools.
- POST https://mcp.centralldark.com/pair/start respondeu HTTP 404; modulo existia em src/device-pairing.js, mas createDevicePairingRouter nao estava montado em src/index.js.
- VPS checkout main @ 4b0ce5a7d com alteracoes existentes; proibido git pull/reset/clean na arvore operacional.

## Patch de codigo em branch isolada
- Importa e monta o owner existente em /device: POST /device/pair/start, GET /device/pair/status, POST /device/pair/approve (Bearer admin), GET /device/devices (Bearer admin), POST /device/heartbeat (Bearer device) e POST /device/token/refresh.
- Corrige aprovacao indevida quando CENTRALDARK_ADMIN_KEY nao esta definida (literal '__missing__' nao pode virar segredo).
- Alinha src e dist dos dois arquivos de runtime; adiciona teste de integracao HTTP para negação/aceite administrativo.
- Sem gravar tokens, segredos, identidades SSH, cookies ou conteudo de terminais no Git.

## GATES pendentes ate haver prova viva
1. Teste unitario/integracao de device-pairing + node --check nos arquivos.
2. CI + validacao de dist sem drift, revisao do cone, promocao conforme as regras do repo.
3. Deploy apenas do MCP afetado com backup/rollback e health before/after, sem sobrescrever main suja.
4. Confirmar POST /device/pair/start HTTP 201 (codigo efemero, TTL 120s); aprovar pela rota admin, receber token so uma vez em canal seguro, provar heartbeat e Windows vivo.
5. SSH host key deve ter ancora independente antes de trusted known_hosts; a disponibilidade do pareamento nao implica SSH autenticado.
6. Separar MCP health 200 de disponibilidade E2E; publicar recibo de runtime somente com evidencias.

## Estado do recibo
GITHUB_PATCH != RUNTIME_PATCH. Fonte candidata pronta para validacao; sem alegar pareamento vivo.
