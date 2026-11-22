# Inventario verificado de Edge Functions CentralDark - 26/10/2026

Fonte: Supabase conectado, projeto CentralDark (sa-east-1). Snapshot somente de METADADOS, sem chamada de endpoint nem leitura de segredos.

Funcoes inventariadas: **60**. ACTIVE significa cadastrada/ativada; NAO atesta que a funcao respondeu corretamente ou possui autenticacao forte.

| Edge Function | Estado | Versao | verify_jwt |
|---|---|---:|---|
| abacus-router | ACTIVE | 12 | false |
| admin-users | ACTIVE | 6 | false |
| agent-log | ACTIVE | 6 | false |
| ai-proxy | ACTIVE | 6 | false |
| api-query | ACTIVE | 5 | false |
| api-status | ACTIVE | 6 | false |
| auto-unmute-active-subscribers | ACTIVE | 5 | false |
| bot-telegram-proxy | ACTIVE | 6 | false |
| centraldark-bridge | ACTIVE | 1 | false |
| data-backup | ACTIVE | 5 | false |
| debate-round | ACTIVE | 7 | false |
| dev-test-modules | ACTIVE | 6 | false |
| efi-check-status | ACTIVE | 6 | false |
| efi-generate-pix | ACTIVE | 6 | false |
| efi-poll-pending | ACTIVE | 5 | false |
| efi-register-webhook | ACTIVE | 6 | false |
| efi-webhook | ACTIVE | 5 | false |
| fake-engagement | ACTIVE | 6 | false |
| generate-pdf | ACTIVE | 5 | false |
| graph-mapper | ACTIVE | 6 | false |
| health-check | ACTIVE | 6 | false |
| hermes-think | ACTIVE | 8 | false |
| hub-command | ACTIVE | 3 | false |
| hub-create-api-key | ACTIVE | 2 | false |
| hub-read | ACTIVE | 4 | false |
| hub-revoke-api-key | ACTIVE | 2 | false |
| hub-services-check | ACTIVE | 6 | false |
| hub-status | ACTIVE | 2 | false |
| inbox-drop | ACTIVE | 1 | false |
| learn-from-outcome | ACTIVE | 8 | false |
| mcp-call | ACTIVE | 6 | false |
| mcp-status-proxy | ACTIVE | 5 | false |
| memory-search | ACTIVE | 8 | false |
| misticpay-generate-pix | ACTIVE | 6 | false |
| misticpay-verify | ACTIVE | 6 | false |
| misticpay-webhook | ACTIVE | 6 | false |
| module-health-calc | ACTIVE | 6 | false |
| notify-event | ACTIVE | 6 | false |
| notify-self-test | ACTIVE | 5 | false |
| notify-telegram | ACTIVE | 5 | false |
| pix-payment | ACTIVE | 6 | false |
| ponte-mcp | ACTIVE | 6 | false |
| ponte-mcp-admin | ACTIVE | 6 | false |
| ponte-mcp-oauth-github | ACTIVE | 6 | false |
| provider-ping | ACTIVE | 6 | false |
| proxy | ACTIVE | 4 | false |
| receive-graph-run | ACTIVE | 5 | false |
| scheduled-broadcasts | ACTIVE | 5 | false |
| telegram-bot | ACTIVE | 6 | false |
| telegram-format-result | ACTIVE | 6 | false |
| telegram-payment-handler | ACTIVE | 6 | false |
| telegram-retry-queue | ACTIVE | 6 | false |
| telegram-unmute-user | ACTIVE | 5 | false |
| telegram-update-group-photo | ACTIVE | 5 | false |
| telegram-webhook | ACTIVE | 9 | false |
| test-message-effect | ACTIVE | 5 | false |
| vault | ACTIVE | 6 | false |
| vps-exec | ACTIVE | 6 | false |
| webapp-format-ai | ACTIVE | 6 | false |
| webapp-get-result | ACTIVE | 5 | false |

## Owners e conexoes
- Escrever eventos de agente: agent-log (ja existente), com autorizacao de maquina, nao publicar segredo no navegador.
- Expor catalogo e comandos: mcp-call, hub-read, hub-command, vps-exec, centraldark-bridge sao owners existentes; conferir cada implementacao antes de reaproveitar.
- Feed de status no Cockpit: UI FeedVivoCentralDark -> public.agent_events e public.hub_mission_events -> Realtime; nao criar outro worker.
- Screenpipe: nenhuma funcao foi encontrada com esse nome no inventario; rota de produto api/screenpipe segue PENDENTE ate sensor da Casa responder e gateway existente apontar ao owner privado.
- Os demais nomes da tabela sao ativos catalogados, nao rotas publicas comprovadas.

## Consultas reproduziveis
Verifique a lista pelo conector Supabase list_edge_functions; para objetos, politicas, grants, publicacoes e funcoes do banco, executar o inventario SQL versionado junto deste documento.

NEXT_CURSOR: correlacionar cada funcao a rota produto API e responsavel, revisar status de JWT/autenticacao dos endpoints e gerar readbacks por funcao antes de selar.
