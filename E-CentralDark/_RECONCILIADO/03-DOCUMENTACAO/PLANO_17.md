# Plano — scripts/deploy

## ✅ Feito
- Pasta criada com README
- Fallback Lovable↔GitHub completo:
  - `lovable-check.sh`
  - `lovable-sync-fallback.sh` (camadas PAT + SSH, lock, dry-run, relatório)
  - `lovable-report.sh`
  - Libs `_lib-sanitize.sh` e `_lib-github-api.sh`

## 🟡 Em andamento
- Camada SSH: gancho deixado, falta implementar o push completo via `scp-vps + git push`.
- Atalhos globais via `install.sh` (`centraldark-lovable-*`).

## 🔴 A fazer
- Camada MCP CentralDark (fase 2, quando o MCP estabilizar).
- Notificação Telegram ao final do fallback (via `MultiZap-TelegramBot`).
- Workflow GitHub Actions opcional que dispara o fallback se um arquivo de teste não aparecer na main em 60s.

## 🛡️ Regras de segurança
- Nunca tocar em `apps/crm/`, `infra/caddy/`, `infra/docker/`, `wuzapi/`, `whatsapp-server/`.
- Toda saída sanitizada.
- Lock `flock` obrigatório.

## 🚀 Próximo passo
Testar o fluxo PAT criando um PR de teste e validando o relatório.
