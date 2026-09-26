// Catálogo central de queryKeys do React Query.
// Centralizar evita typo silencioso entre hooks e a invalidação do auth.
// Use sempre essas funções em hooks novos pra manter o cache coerente.

export const queryKeys = {
  // Workspace atual do usuário logado.
  currentWorkspace: (userId?: string | null) =>
    ["current-workspace", userId ?? null] as const,

  // Permissões efetivas do usuário no workspace.
  permissions: (userId?: string | null, workspaceId?: string | null) =>
    ["permissions", userId ?? null, workspaceId ?? null] as const,

  // Itens de menu visíveis (derivado de perms + role + workspace).
  menuItems: (userId?: string | null, workspaceId?: string | null) =>
    ["menu-items", userId ?? null, workspaceId ?? null] as const,

  // Flag de super_admin global.
  isSuperAdmin: (userId?: string | null) =>
    ["is-super-admin", userId ?? null] as const,

  // Controles do workspace (pausa, bloqueio etc.).
  workspaceControls: (workspaceId?: string | null) =>
    ["workspace-controls", workspaceId ?? null] as const,

  // Branding/visual do workspace.
  branding: (workspaceId?: string | null) =>
    ["branding", workspaceId ?? null] as const,
} as const;

// Chaves que dependem da identidade/sessão do usuário.
// São as únicas reinvalidadas em SIGNED_IN / USER_UPDATED e removidas em SIGNED_OUT.
// Tudo o resto fica intocado, reduzindo refetch desnecessário e glitches de UI.
export const SESSION_SCOPED_KEYS = [
  ["current-workspace"],
  ["permissions"],
  ["menu-items"],
  ["is-super-admin"],
  ["workspace-controls"],
  ["branding"],
] as const;
