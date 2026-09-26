# Segurança — Integração GitHub

## Princípios
- **Apenas super_admin** lê/escreve `github_integrations`, `github_integration_logs`, `github_deploy_packages`. Garantido por RLS (`is_super_admin(auth.uid())`).
- Admin de workspace e atendentes **não acessam** essas tabelas nem a tela.
- A rota `/admin/sistema/integracoes/github` está sob o layout `/admin` que já valida super_admin.

## Token
- Guardado em `github_integrations.access_token`.
- **NUNCA** retornado pelo frontend — server functions só devolvem `token_preview` (formato `ghp_…XXXX`).
- Função `get_github_access_token()` é `SECURITY DEFINER`, com `REVOKE FROM PUBLIC` + checagem de `is_super_admin` no corpo.
- Nunca salvo em `localStorage` — input é `type=password`, `autoComplete=off`.

## Logs
- `github_integration_logs` registra `connect`, `disconnect`, `select_repo`, `sync`, etc.
- `payload` é sanitizado: campos `access_token` e `token` são removidos antes de gravar.
- Logs apenas legíveis por super_admin (RLS).

## Server functions (todas com `requireSupabaseAuth` + `assertSuperAdmin`)
- `getGithubIntegrationStatus`
- `connectGithub`
- `disconnectGithubIntegration`
- `listGithubRepositories`
- `selectGithubRepository`
- `syncGithubRepository`
- `listGithubIntegrationLogs`
