# Integração GitHub no Painel Master

## O que é
Conexão master (global) com o GitHub para monitorar o repositório `segredounlock/atendimentoo` (branch `main`) e, no próximo turno, gerar pacotes de deploy.

## Como acessar
Logado como **super_admin**, vá em:
- `/admin/sistema` → botão **GitHub / Deploy**
- ou direto: `/admin/sistema/integracoes/github`

## Como conectar
1. Crie um Personal Access Token em https://github.com/settings/tokens (fine-grained recomendado), com **Contents: read & write** e **Metadata: read** no repositório `segredounlock/atendimentoo`.
2. Clique **Conectar GitHub** e cole o token.
3. O sistema valida o token contra `GET /user` antes de salvar.
4. Selecione owner/repo/branch e clique **Salvar repositório**.
5. **Sincronizar repositório** confere a branch e busca o último commit.

## Modos suportados
- **PAT (Personal Access Token)** — disponível agora.
- **GitHub App** — esquema preparado (`auth_type='app'`, `app_id`, `installation_id`), implementação completa no próximo turno.

## Status possíveis
`not_connected` · `connected` · `permission_error` · `syncing` · `ready` · `failed`

## Pacote de deploy
Botões **Gerar pacote** e **Baixar pacote** ficam visíveis, mas desabilitados — implementação no próximo turno (tabela `github_deploy_packages` já existe).
