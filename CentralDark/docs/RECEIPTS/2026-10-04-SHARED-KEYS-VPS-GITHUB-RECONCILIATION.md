# 2026-10-04 — SHARED keys, GitHub, VPS e reconciliação

## Estado medido

- `origin/main`: `5b53e36a07d7e8fb05d4e02c28f37a3a783589b4`
- checkout local `/root/CentralDark`: mesmo SHA da `origin/main`
- VPS `CENTRALDARK-OS`: mesmo SHA da `origin/main`
- branch operacional na VPS: `fix/run-pr-selo-on-vps-20261004003514`
- Hermes health local na VPS: HTTP 200, `status=ok`
- bridge Kylin local na VPS: HTTP 200
- runners self-hosted `centraldark-vps-1` a `centraldark-vps-4`: online e livres

## Credenciais

- `SHARED.zip` foi tratado como entrada sensível.
- Conteúdo extraído somente em quarentena temporária com permissões restritas.
- Token GitHub validado sem registrar seu valor; identidade autenticada: `segredounlock`.
- `GITHUB_TOKEN` instalado somente em `/root/.hermes/.env`, modo `0600`, para o heartbeat de reconciliação.
- Quarentena temporária removida após o uso.
- Chave SSH VPS instalada em `/root/.ssh/segredo_vps_ed25519`, modo `0600`.
- Nenhum segredo foi colocado no Git, receipt ou log.

## GitHub medido

- PRs abertos: `1748`, `1743`, `1742`, `1562`.
- PR-mãe `#1562`: aberto, base `main`, mergeable informado como `true`, `mergeable_state=unstable`, não mergeado.
- PR `#1743`: checklist diário / PR-mãe, aberto, base `main`, `mergeable_state=unstable`.
- PR `#1742`: painel de runtime local-AI, aberto, base `main`, `mergeable_state=unstable`.
- PR `#1748`: protótipo AionUI, aberto, base `main`, `mergeable_state=unstable`.

## Webhook e esteira

- Hook `deploy.centralldark.com/webhook`: ativo, última resposta HTTP `521`.
- Hook Buildkite: ativo, última resposta HTTP `429`.
- `deploy.centralldark.com` também respondeu HTTP `521` em `/`, `/health` e `/webhook`.
- Na VPS não foi encontrado serviço/processo local de webhook, Caddy ou Nginx correspondente.
- Runners self-hosted estão ativos; o bloqueio observado é a borda/webhook, não os runners.

## Veredito

`PARTIAL_RECONCILIATION`

A sincronização `main → VPS` está alinhada. Hermes, bridge e runners estão vivos. A esteira não está completamente provada porque o endpoint de webhook está em `521` e o Buildkite está em `429`.

## Próximo cursor

1. Identificar o owner real de `deploy.centralldark.com`.
2. Corrigir ou substituir o endpoint webhook existente, sem criar segundo dispatcher.
3. Revalidar o hook via GitHub e uma entrega controlada.
4. Verificar checks dos quatro PRs e registrar resultado independente.
5. Atualizar este receipt somente após readback.
