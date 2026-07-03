# Relatório — Bot-server WhatsApp read-only

Data: 2026-06-09  
Projeto: CentralDark / MultiZap

## Objetivo

Retomar a fase do sistema de chat, contatos, fotos/avatar e grupos após a ativação de `api.centralldark.com`.

## Entregue

- Adaptador WuzAPI em modo leitura/auditoria.
- Serviço `createWhatsAppReadOnlyService`.
- Tipos para chat, contatos, avatar, grupos e participantes.
- Mappers para normalizar retorno.
- Validador local sem token real.
- Guardrails contra endpoints destrutivos.

## Segurança

Não foi feito:

- SQL real.
- Restart de Docker/WuzAPI.
- Reset/logout WhatsApp.
- Leitura/gravação de sessão WhatsApp.
- Alteração em CRM, Caddy, DNS, SSL, domínio, banco real ou secrets.

## Próximo passo

Confirmar endpoint real de lista de chats em auditoria somente leitura e depois criar rotas internas `/v1/whatsapp/*` no gateway/API.
