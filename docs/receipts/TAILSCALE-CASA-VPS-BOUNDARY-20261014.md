# 🔒 Marco de parada — Tailscale Casa ↔ VPS (2026-10-14)

## Cadeado de escopo (documental)
- `DEFAULT_MODE=READ_ONLY`
- `MUTATION_ALLOWED=false`
- `EXPLICIT_OWNER_PERMISSION_REQUIRED=true`
- `TECHNICAL_ACL_LOCK=NOT_APPLIED`
- `TAILSCALE_SSH_AUTH=PROVEN_KEY_AUTH_20261014`
- `NEXT_START=inspect existing Tailscale ACL and remediate provider HTTP 401 before considering technical ACL mutation`
- Agentes não alteram SSH, Tailscale ACL, chaves, contas, serviços ou configurações sem autorização explícita do CHEFE para a alteração específica.

## Prova observada
Na Casa SEGREDO, comando `tailscale ping --c 2 100.90.199.124` retornou `pong from centraldark-os (100.90.199.124) via 89.117.78.124:41641 in 112ms`. Isso prova alcance do peer Tailscale, não login SSH nem ACL de bloqueio.

## Limites
SSH público pelo alias `segredo-vpss` já provado e protegido contra edição acidental em recibo anterior `SSH-CASA-VPS-LOCK-20261014.md`. No marco inicial, teste SSH direto pela rota Tailscale não havia sido executado por bloqueio da ferramenta. Nova contraprova de 2026-10-14 registrada abaixo. Este documento registra o ponto de retomada, não aplica permissão de sistema nem prova deploy.

## Continuidade
Autenticação SSH por Tailscale agora comprovada em leitura. Próximo delta: consultar ACL existente, corrigir HTTP 401 da API administrativa sem expor credenciais e só então avaliar a proteção técnica mínima. PR-mãe #1562 é ledger; não mergear.

## Contraprova CURRENT — SSH Tailscale comprovado (2026-10-14)

- Origem: Casa Windows SEGREDO; destino: VPS Linux `CENTRALDARK-OS`, IP Tailscale `100.90.199.124`.
- Prova read-only: `ssh -o BatchMode=yes -o ConnectTimeout=6 -o StrictHostKeyChecking=yes root@100.90.199.124 "hostname; id -un; echo SSH_TAILSCALE_OK"` retornou `CENTRALDARK-OS`, `root`, `SSH_TAILSCALE_OK`; sem autenticação interativa.
- SSH público pelo alias `segredo-vpss` também foi retestado e retornou `CENTRALDARK-OS`, `root` e o IP Tailscale local `100.90.199.124`.
- `sshd -T` confirmou `permitrootlogin prohibit-password`, `passwordauthentication no`, `pubkeyauthentication yes`; `sshd` e `tailscaled` ativos.
- O teste prova autenticação SSH com a identidade já autorizada e controles SSH existentes; **não prova ACL técnica Tailscale**, nem autorização independente de outra IA.
- API administrativa Tailscale segue com `PROVIDER_HTTP_401` em consulta atual. Nenhum SSHD, ACL, Tailscale, chave, perfil, firewall ou credencial foi alterado.

```text
SSH_TAILSCALE_AUTH=PROVEN
SSH_PUBLIC_AUTH=PROVEN
SSH_PASSWORD_AUTH=DISABLED_EXISTING
TAILSCALE_TECHNICAL_ACL_LOCK=NOT_APPLIED
TAILSCALE_ADMIN_API=HTTP_401
CREDENTIALS_EXPORTED=false
READ_ONLY_PROBE=true
```

**Selo restrito:** contraprova de autenticação e continuidade; não declarar política Tailscale endurecida até prova técnica separada.
