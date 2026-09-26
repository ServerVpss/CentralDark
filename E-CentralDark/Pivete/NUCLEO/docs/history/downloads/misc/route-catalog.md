# OUTRO - route-catalog.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\bot-server\src\gateways\whatsapp\route-catalog.ts
**SHA:** 5992149264fb5b46
**Timestamp:** 2026-08-26T19:31:32.393800
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- export type WhatsAppRouteRisk = 'read' | 'write-blocked' | 'future';
- risk: WhatsAppRouteRisk;
- risk: 'read',
- risk: 'read',
- risk: 'read',
- risk: 'read',
- risk: 'read',
- risk: 'read',
- risk: 'read',
- risk: 'write-blocked',

### Ouro Bruto (primeiros 5000 chars)
```
export type WhatsAppApiArea =
  | 'sessions'
  | 'messages'
  | 'receiving'
  | 'chats'
  | 'contacts'
  | 'groups'
  | 'webhooks'
  | 'websocket';

export type WhatsAppRouteRisk = 'read' | 'write-blocked' | 'future';

export type WhatsAppRouteCatalogItem = {
  area: WhatsAppApiArea;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  publicPath: string;
  publicUrl: string;
  internalPath: string;
  upstreamHint: string;
  risk: WhatsAppRouteRisk;
  status: 'planned' | 'draft' | 'blocked' | 'needs-runtime-confirmation';
  notes: string;
};

const API_BASE_URL = 'https://api.centralldark.com';
const WHATSAPP_BASE_PATH = '/v1/whatsapp';

function url(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export const WHATSAPP_ROUTE_CATALOG: readonly WhatsAppRouteCatalogItem[] = [
  {
    area: 'sessions',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/sessions/status`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/sessions/status`),
    internalPath: '/api/whatsapp/sessions/status',
    upstreamHint: 'WuzAPI: /session/status',
    risk: 'read',
    status: 'draft',
    notes: 'Leitura de status, sem conectar/desconectar/logout.',
  },
  {
    area: 'chats',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/chats`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/chats`),
    internalPath: '/api/whatsapp/chats',
    upstreamHint: 'Confirmar endpoint real no runtime WuzAPI.',
    risk: 'read',
    status: 'needs-runtime-confirmation',
    notes: 'Setor oficial da API CentralDark; endpoint upstream ainda precisa auditoria read-only.',
  },
  {
    area: 'contacts',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/contacts`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/contacts`),
    internalPath: '/api/whatsapp/contacts',
    upstreamHint: 'WuzAPI: /user/contacts',
    risk: 'read',
    status: 'draft',
    notes: 'Lista contatos sem expor token ao frontend.',
  },
  {
    area: 'contacts',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/contacts/:phone/profile`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/contacts/:phone/profile`),
    internalPath: '/api/whatsapp/contacts/:phone/profile',
    upstreamHint: 'WuzAPI: /user/info',
    risk: 'read',
    status: 'draft',
    notes: 'Consulta perfil por telefone/JID.',
  },
  {
    area: 'contacts',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/contacts/:phone/avatar`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/contacts/:phone/avatar`),
    internalPath: '/api/whatsapp/contacts/:phone/avatar',
    upstreamHint: 'WuzAPI: /user/avatar',
    risk: 'read',
    status: 'draft',
    notes: 'Consulta avatar/preview.',
  },
  {
    area: 'groups',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/groups`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/groups`),
    internalPath: '/api/whatsapp/groups',
    upstreamHint: 'WuzAPI: /group/list',
    risk: 'read',
    status: 'draft',
    notes: 'Lista grupos inscritos.',
  },
  {
    area: 'groups',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/groups/:groupJid/participants`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/groups/:groupJid/participants`),
    internalPath: '/api/whatsapp/groups/:groupJid/participants',
    upstreamHint: 'WuzAPI: /group/info',
    risk: 'read',
    status: 'draft',
    notes: 'Extrai participantes do group info.',
  },
  {
    area: 'messages',
    method: 'POST',
    publicPath: `${WHATSAPP_BASE_PATH}/messages/send-text`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/messages/send-text`),
    internalPath: '/api/whatsapp/messages/send-text',
    upstreamHint: 'WuzAPI: /chat/send/text',
    risk: 'write-blocked',
    status: 'blocked',
    notes: 'Envio fica bloqueado até etapa futura com confirmação explícita, auth e rate limit.',
  },
  {
    area: 'webhooks',
    method: 'POST',
    publicPath: `${WHATSAPP_BASE_PATH}/webhooks/wuzapi`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/webhooks/wuzapi`),
    internalPath: '/api/whatsapp/webhooks/wuzapi',
    upstreamHint: 'WuzAPI webhook events',
    risk: 'future',
    status: 'planned',
    notes: 'Receber eventos com validação e sanitização.',
  },
  {
    area: 'websocket',
    method: 'GET',
    publicPath: `${WHATSAPP_BASE_PATH}/ws`,
    publicUrl: url(`${WHATSAPP_BASE_PATH}/ws`),
    internalPath: '/api/whatsapp/ws',
    upstreamHint: 'CentralDark internal websocket',
    risk: 'future',
    status: 'planned',
    notes: 'Eventos em tempo real para painel/frontend, sem payload privado bruto.',
  },
];

export function listWhatsAppRoutesByArea(area: WhatsAppApiArea): readonly WhatsAppRouteCatalogItem[] {
  return WHATSAPP_ROUTE_CATALOG.filter((item) => item.area === area);
}

```