import type { WuzApiReadOnlyEndpoint } from './wuzapi-readonly-types';

export const WUZAPI_READ_ONLY_ENDPOINTS: readonly WuzApiReadOnlyEndpoint[] = [
  {
    operation: 'health',
    method: 'GET',
    path: '/session/status',
    documented: true,
    notes: 'Status de sessão. Não conecta, não desconecta e não gera QR.',
  },
  {
    operation: 'listChats',
    method: 'GET',
    path: '/user/contacts',
    documented: true,
    notes:
      'WuzAPI (asternic) não expõe lista de chats nativa. Auditoria Lote 2 (2026-06-09) confirmou: chats são derivados de /user/contacts (1:1) + /group/list (grupos). Ver docs/WHATSAPP-API/LOTE-2-listChats.md.',
  },
  {
    operation: 'listContacts',
    method: 'GET',
    path: '/user/contacts',
    documented: true,
    notes:
      'Lote 3 (2026-06-09): lista de contatos 1:1 da conta autenticada. Combinado com /group/list por getCentralDarkChats(). Ver docs/WHATSAPP-API/LOTE-3-getCentralDarkChats.md.',
  },
  {
    operation: 'getContactProfile',
    method: 'POST',
    path: '/user/info',
    documented: true,
    notes: 'Consulta perfil/detalhes por telefone ou JID.',
  },
  {
    operation: 'getProfileAvatar',
    method: 'GET',
    path: '/user/avatar',
    documented: true,
    notes: 'Consulta avatar por telefone ou JID.',
  },
  {
    operation: 'listGroups',
    method: 'GET',
    path: '/group/list',
    documented: true,
    notes: 'Lista grupos inscritos da conta autenticada.',
  },
  {
    operation: 'getGroup',
    method: 'GET',
    path: '/group/info',
    documented: true,
    notes: 'Lê metadados completos de um grupo (JID, Name, OwnerJID, Participants etc.).',
  },
  {
    operation: 'listGroupParticipants',
    method: 'GET',
    path: '/group/info',
    documented: true,
    notes: 'Lê metadados do grupo e extrai Participants.',
  },
  {
    operation: 'getChatHistory',
    method: 'GET',
    path: '/chat/history',
    documented: true,
    notes:
      'Lote 10 (2026-06-09): histórico read-only de mensagens de um chat (contato ou grupo). Aceita ChatJID + Limit + Cursor opcionais.',
  },
];

const WRITE_PATH_FRAGMENTS = [
  '/session/connect',
  '/session/disconnect',
  '/session/logout',
  '/chat/send/',
  '/chat/presence',
  '/chat/markread',
  '/chat/react',
  '/user/block',
  '/user/unblock',
  '/group/create',
  '/group/photo',
  '/group/photo/remove',
  '/group/name',
  '/group/locked',
  '/group/ephemeral',
  '/group/updaterequestparticipants',
  '/group/joinapprovalmode',
];

export function assertWuzApiReadOnlyPath(path: string): void {
  const normalized = path.toLowerCase();
  const blocked = WRITE_PATH_FRAGMENTS.find((fragment) => normalized.includes(fragment));

  if (blocked) {
    throw new Error(`Endpoint bloqueado no adaptador read-only: ${blocked}`);
  }
}

export function getWuzApiReadOnlyAuditPlan(): readonly WuzApiReadOnlyEndpoint[] {
  return WUZAPI_READ_ONLY_ENDPOINTS;
}

export function assertWuzApiReadOnlyPlan(): void {
  for (const endpoint of WUZAPI_READ_ONLY_ENDPOINTS) {
    if (endpoint.path !== '<configuravel>') {
      assertWuzApiReadOnlyPath(endpoint.path);
    }
  }
}
