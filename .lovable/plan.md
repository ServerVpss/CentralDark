# Plano: Finalizar PR #84 e preparar handoff

## Objetivo
Mergear o PR #84 (`ServerVpss/CentralDark`) com segurança — apenas docs + workflows seguros — confirmar commit final na main, e deixar handoff registrado para próximas IAs. Sem mexer em SQL/policies, sem fechar issues vermelhas, sem `--admin`.

## Etapas

### 1. Acompanhar checks do PR #84
- `gh pr view 84 --repo ServerVpss/CentralDark --json number,state,mergeable,mergeStateStatus,baseRefName,headRefName,url`
- `gh pr diff 84 --repo ServerVpss/CentralDark --name-only`
- `gh pr checks 84 --repo ServerVpss/CentralDark`
- Se algum check ficar pending/failing > razoável: `gh run list --branch <head> --repo ServerVpss/CentralDark` + `gh run view <id> --log-failed` para diagnosticar.

### 2. Validar escopo do PR (gate de segurança)
Antes do merge, confirmar que `gh pr diff 84 --name-only` retorna SOMENTE arquivos dentro de:
- `docs/RELATORIOS/...`
- `docs/CHECKLIST-SEGURANCA-BOTS.md`
- `docs/PENDENCIAS.md`
- `.github/workflows/*` (apenas blocos `concurrency:` adicionados, sem mexer em secrets/runner sensível)

Bloquear merge se aparecer qualquer um destes padrões: `apps/crm/`, `.env`, `secrets`, `tokens`, `sessions`, `.ssh`, `*.pem`, `*.key`, `docker`, `caddy`, `pm2`, `wuzapi`, `whatsapp`, `database`, `banco`, `supabase`, migrations SQL.

### 3. Merge normal do PR #84
Apenas se: escopo limpo + base `main` + `MERGEABLE` + checks verdes (ou skips comprovadamente não-obrigatórios):
```
gh pr merge 84 --repo ServerVpss/CentralDark --squash --delete-branch
```
Sem `--admin`, sem `--force`, sem push direto na main.

Se algum check obrigatório travar por bloqueio externo (ex.: OpenAI/Codex deslogado): NÃO mergear — registrar bloqueio no relatório e devolver controle.

### 4. Confirmar commit final na main
- `gh api repos/ServerVpss/CentralDark/commits/main --jq '{sha, message: .commit.message, date: .commit.author.date}'`
- Guardar SHA curto + completo para o relatório.

### 5. Atualizar handoff/continuidade
Confirmar que `docs/PENDENCIAS.md` na main reflete:
- Item #57 (= "Pendência #132") marcado ✅ CONCLUÍDO com SHA do PR #84.
- Auditoria de policies públicas (3 tabelas) registrada como item NOVO 🔴, **sem patch aplicado**, sintoma + como fechar.
- Issues #77/#78/#74 listadas como pendências abertas, NÃO fechadas.

Se algum desses itens não estiver na main após merge, abrir PR pequeno separado depois (fora deste plano).

### 6. Relatório final no chat
Formato exato pedido:
```
STATUS:
PR #84:
MERGE:
COMMIT FINAL NA MAIN:
ARQUIVOS ALTERADOS:
CHECKS:
HANDOFF/RELOAD:
PENDÊNCIA #57:
ISSUE #132:
POLICIES PÚBLICAS:
ISSUES NÃO FECHADAS:
PRÓXIMO PASSO:
```

## Restrições (invioláveis)
- Sem `--admin`, sem `--force`, sem push direto na main.
- Sem aplicar patch SQL / mexer em policies públicas — apenas deixar auditoria registrada.
- Sem fechar issues #77, #78, #74 nem outras issues vermelhas.
- Sem mexer em CRM, secrets, Docker, Caddy, PM2, WuzAPI, WhatsApp, banco real.
- Sem reiniciar serviço da VPS.
- Sem declarar verde sem run real comprovando.

## Critério de sucesso
PR #84 mergeado por squash, branch deletada, SHA final da main capturado, `docs/PENDENCIAS.md` atualizado com #57 ✅ e auditoria de policies como item novo aberto, issues vermelhas intactas, relatório entregue.
