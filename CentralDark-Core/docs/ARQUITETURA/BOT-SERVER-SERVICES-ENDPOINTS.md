# BOT Server — services e endpoints internos

## Objetivo

Mapear a primeira versão dos services/endpoints internos do `apps/bot-server`, sem ligar processo novo e sem mover produção.

Este documento conecta:

- frontend atual em `apps/bot`;
- dados atuais de contatos e mensagens;
- futura central backend em `apps/bot-server`.

## Estado atual do frontend

O frontend atual usa:

```txt
apps/bot/src/services/contactService.ts
apps/bot/src/services/messageService.ts
apps/bot/src/hooks/useRealtimeMessages.ts
apps/bot/src/pages/Chats.tsx
```

Hoje o envio de mensagem no frontend grava uma mensagem local como `outbound` com status `sent`. Ainda não há, nessa camada, confirmação de envio externo real.

## Entidades principais

### Workspace

Representa o cliente/ambiente dono das conversas.

Campos mínimos:

```txt
id
name
status
created_at
updated_at
```

### Instance

Representa uma conexão/canal dentro de um workspace.

Campos mínimos:

```txt
id
workspace_id
provider
label
status
external_session_id
created_at
updated_at
```

### Contact

Campos atuais observados no frontend:

```txt
id
workspace_id
name
phone
tags
notes
is_blocked
```

### Message

Campos atuais observados no frontend:

```txt
id
workspace_id
instance_id
contact_id
text
direction
status
created_at
```

`direction`:

```txt
inbound
outbound
```

`status`:

```txt
pending
sent
delivered
read
failed
```

## Services internos planejados

### contactsService

Responsabilidade:

- listar contatos por workspace;
- criar contato;
- atualizar contato;
- bloquear/desbloquear contato;
- enriquecer contato com dados de atendimento;
- futuramente sincronizar foto/avatar.

Assinaturas planejadas:

```txt
listContacts(workspaceId)
getContact(workspaceId, contactId)
createContact(input)
updateContact(workspaceId, contactId, input)
setContactBlocked(workspaceId, contactId, blocked)
syncContactProfile(workspaceId, contactId)
```

### messagesService

Responsabilidade:

- listar mensagens por contato;
- criar mensagem local;
- enviar mensagem outbound pelo gateway;
- atualizar status da mensagem;
- registrar mensagem inbound recebida por evento externo.

Assinaturas planejadas:

```txt
listMessages(workspaceId, contactId)
createLocalMessage(input)
sendOutboundMessage(input)
markMessageStatus(workspaceId, messageId, status)
receiveInboundMessage(input)
```

### instancesService

Responsabilidade:

- listar instâncias por workspace;
- verificar status de conexão;
- mapear workspace para sessão/canal externo;
- controlar status operacional em etapa futura.

Assinaturas planejadas:

```txt
listInstances(workspaceId)
getInstance(workspaceId, instanceId)
getInstanceStatus(workspaceId, instanceId)
setInstanceStatus(workspaceId, instanceId, status)
```

### workspacesService

Responsabilidade:

- resolver workspace do usuário autenticado;
- validar escopo multi-tenant;
- garantir que contato/mensagem/instância pertencem ao workspace correto.

Assinaturas planejadas:

```txt
getWorkspace(workspaceId)
assertWorkspaceAccess(userId, workspaceId)
```

### gatewayMessagesService

Responsabilidade:

- conversar com a API externa de mensagens;
- enviar texto;
- consultar status;
- buscar avatar/foto em fase futura;
- listar grupos em fase futura.

Assinaturas planejadas:

```txt
sendText(instance, phone, text)
getConnectionStatus(instance)
getContactAvatar(instance, phone)
listGroups(instance)
```

## Endpoints internos planejados

Base proposta:

```txt
/api/bot
```

### Health

```txt
GET /api/bot/health
```

### Contacts

```txt
GET    /api/bot/workspaces/:workspaceId/contacts
GET    /api/bot/workspaces/:workspaceId/contacts/:contactId
POST   /api/bot/workspaces/:workspaceId/contacts
PATCH  /api/bot/workspaces/:workspaceId/contacts/:contactId
POST   /api/bot/workspaces/:workspaceId/contacts/:contactId/block
POST   /api/bot/workspaces/:workspaceId/contacts/:contactId/unblock
```

### Messages

```txt
GET  /api/bot/workspaces/:workspaceId/contacts/:contactId/messages
POST /api/bot/workspaces/:workspaceId/contacts/:contactId/messages
POST /api/bot/workspaces/:workspaceId/messages/:messageId/status
```

O `POST messages` deve primeiro criar mensagem local como `pending`, depois chamar o gateway externo e atualizar status conforme retorno.

### Instances

```txt
GET  /api/bot/workspaces/:workspaceId/instances
GET  /api/bot/workspaces/:workspaceId/instances/:instanceId/status
POST /api/bot/workspaces/:workspaceId/instances/:instanceId/refresh-status
```

### Webhooks

```txt
POST /api/bot/webhooks/messages
POST /api/bot/webhooks/status
POST /api/bot/webhooks/contacts
```

Webhooks devem validar origem e escopo antes de gravar qualquer coisa.

## Evolução planejada

### Hoje

```txt
frontend → armazenamento direto
```

### Futuro planejado

```txt
frontend → bot-server → armazenamento/gateway externo
```

## Ordem segura de implementação

1. Criar tipos e interfaces internas.
2. Criar contratos de services sem lógica destrutiva.
3. Criar rota health local.
4. Criar services conectando ao armazenamento existente.
5. Só depois conectar envio externo real.
6. Só depois considerar processo novo.

## Não fazer agora

- Não ligar processo novo.
- Não mudar Caddy.
- Não mover produção.
- Não mexer no CRM.
- Não alterar banco real.
- Não resetar conexões.

## Próximo passo técnico

Criar arquivos de tipos/interfaces em:

```txt
apps/bot-server/src/shared/types
```

E contratos de services em:

```txt
apps/bot-server/src/services
```

Ainda sem implementação real e sem processo rodando.
