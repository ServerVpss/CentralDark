# Página de Gestão de Usuários do Painel

Criar página `/usuarios-painel` (só admin) pra você administrar por completo quem tem acesso ao painel web — sem precisar abrir o backend.

## O que vai ter na tela

Tabela com todos os usuários cadastrados mostrando:
- E-mail
- Nome completo
- Papel (admin / user) com badge colorido
- Data de criação
- Último login (ou "nunca")
- Status (confirmado/não confirmado)

Filtros no topo:
- Busca por e-mail/nome
- Filtro por papel (todos / admin / user)
- Paginação 10/25/50

## Ações disponíveis por usuário

Botão de menu em cada linha com:
1. **Promover a admin / Rebaixar pra user** — troca o papel na `user_roles`
2. **Resetar senha** — dispara e-mail de reset pro usuário
3. **Definir nova senha manualmente** — você digita uma senha nova e ela é aplicada na hora (útil quando o usuário não tem acesso ao e-mail)
4. **Confirmar e-mail manualmente** — pra contas que ficaram pendentes
5. **Bloquear / Desbloquear acesso** — banimento temporário
6. **Excluir usuário** — apaga conta, perfil e papel (com confirmação dupla)

Botão no topo: **"+ Criar novo usuário"** — abre modal com e-mail, senha, nome e papel; cria já confirmado.

## Como vai funcionar por trás (parte técnica)

- Nova edge function `admin-users` (com `verify_jwt`) que:
  - Valida que quem chama é admin via `has_role(auth.uid(), 'admin')`
  - Usa `SUPABASE_SERVICE_ROLE_KEY` pra chamar a Admin API do Auth (listar, criar, atualizar, deletar, resetar senha, banir)
  - Aceita ações: `list`, `create`, `update_password`, `send_reset`, `set_role`, `confirm_email`, `ban`, `unban`, `delete`
- Frontend: novo hook `useAdminUsers` + página `src/pages/UsuariosPainel.tsx`
- Rota nova no `App.tsx` protegida por `AdminRoute`
- Item no menu lateral "Usuários do Painel" (ícone `UserCog`) — só aparece pra admin
- Limpeza do duplicado: seu usuário tá com papel `admin` E `user` na mesma tabela. Vou deduplicar mantendo só `admin`.

## Segurança

- Edge function bloqueia tudo que não for admin
- Admin não consegue se auto-deletar nem se auto-rebaixar (proteção contra ficar sem admin)
- Confirmação dupla pra delete e reset de senha
- Audit log: toda ação grava em `audit_logs` (já existe a tabela)

## Não vou mexer em

- Tabela `telegram_users` (essa é dos usuários do bot, fica como tá)
- Página `/telegram-users` (continua separada)
- Fluxo de signup público (continua controlado pelo toggle existente)

Confirma que tá tudo certo e eu construo?
