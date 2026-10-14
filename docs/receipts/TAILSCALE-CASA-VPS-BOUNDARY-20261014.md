# 🔒 Marco de parada — Tailscale Casa ↔ VPS (2026-10-14)

## Cadeado de escopo (documental)
- `DEFAULT_MODE=READ_ONLY`
- `MUTATION_ALLOWED=false`
- `EXPLICIT_OWNER_PERMISSION_REQUIRED=true`
- `TECHNICAL_ACL_LOCK=NOT_APPLIED`
- `TAILSCALE_SSH_AUTH=NOT_PROVEN`
- `NEXT_START=verify SSH authentication over Tailscale; inspect existing ACL without mutation`
- Agentes não alteram SSH, Tailscale ACL, chaves, contas, serviços ou configurações sem autorização explícita do CHEFE para a alteração específica.

## Prova observada
Na Casa SEGREDO, comando `tailscale ping --c 2 100.90.199.124` retornou `pong from centraldark-os (100.90.199.124) via 89.117.78.124:41641 in 112ms`. Isso prova alcance do peer Tailscale, não login SSH nem ACL de bloqueio.

## Limites
SSH público pelo alias `segredo-vpss` já provado e protegido contra edição acidental em recibo anterior `SSH-CASA-VPS-LOCK-20261014.md`. Teste SSH direto pela rota Tailscale não executado por bloqueio de ferramenta. Este documento registra o ponto de retomada, não aplica permissão de sistema nem prova deploy.

## Continuidade
Quando o CHEFE autorizar prosseguir, retomar deste ponto, testar autenticação SSH Tailscale em modo leitura, inspecionar ACL existente e só então propor mudança mínima. PR-mãe #1562 é ledger; não mergear.
