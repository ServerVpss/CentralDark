# Receipt — acesso admin, RLS e estado vivo (2026-09-25)

## Fontes medidas

- Código de destino antes da escrita: `ServerVpss/centraldark-instinto-superior@0bba5a97e8bbf0bb375c171b2eb20eac2e23fe70`.
- Autoridade/runtime consultada: `ServerVpss/CentralDark@9c4f93888000f203ba5623b6800e98463a2d9399`.
- Supabase: projeto `lyoigsqluyktoclwdaft`, Postgres 17.6, `ACTIVE_HEALTHY`.

## PASS

- Banco medido: 14 usuários, 14 linhas em `user_roles`, 1 admin e 13 usuários comuns.
- RLS habilitada em `user_roles`.
- Anônimo: `SELECT` negado com SQLSTATE `42501`.
- Usuário comum simulado com JWT/RLS: vê somente a própria linha; zero linhas admin.
- Admin simulado com JWT/RLS: vê 14 linhas e pode administrar outra linha.
- `has_role` é `SECURITY DEFINER`, usa `search_path` vazio, exige `_user_id = auth.uid()` e não concede execução a `anon`.
- UI envia o `access_token` Supabase às funções privadas antes de verificar admin/consumo.
- Callback OAuth usa `exchangeCodeForSession`; recuperação aceita o mesmo código PKCE.
- `npm run build`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `npm run lint`: exit 0, 12 avisos não bloqueantes, zero erro.

## UNKNOWN / não promovido

- Login de ponta a ponta na URL publicada: não executado com uma conta real nesta medição.
- Publicação do novo HEAD: depende de SHA observável no alvo após o commit.
- Saldo/créditos/tokens/gastos: sem provedor autorizado; UI deve mostrar `UNKNOWN`.
- Gmail, Hermes Desktop, integridade física do ZIP e writer lease: sem fonte viva atual.
- Probes `/api/live-fabric/status` e `/api/omni/status` expiraram; `/api/live-fabric/graph` respondeu e indicou checkout de runtime divergente e sujo. Isso não é prova de deploy do site.

Nenhuma migração foi aplicada nesta rodada: a política real existente já é mais completa que os arquivos locais e não deve ser substituída cegamente.
