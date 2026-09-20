# Fail2ban harden — 2026-07-14

**PERMITO Pivete** · executor: Grok CLI VPS  
**Escopo:** só fail2ban (sshd + recidive). **Não** alterou `PasswordAuthentication`.

## Antes
| Param | Valor |
|-------|-------|
| bantime | **3600** (1h) → bots voltavam |
| findtime | 600 |
| maxretry | 5 |
| recidive | off |
| ignoreip | default |

## Depois (`infra/fail2ban/jail.local` → `/etc/fail2ban/jail.local`)
| Param | Valor |
|-------|-------|
| bantime sshd | **86400** (24h) |
| findtime | 900 (15 min) |
| maxretry | 3 |
| bantime.increment | true (×2 até 5 semanas) |
| recidive | **7 dias** allports após 3 bans em 24h |
| ignoreip | `127.0.0.1/8 ::1 187.15.72.86` |

## Aplicação VPS
```bash
sudo cp infra/fail2ban/jail.local /etc/fail2ban/jail.local
sudo fail2ban-client reload
# ou: systemctl reload fail2ban
fail2ban-client status sshd
fail2ban-client status recidive
```

## Backup
- VPS: `/etc/fail2ban/jail.local.bak-antes-harden-*`
- Repo: `infra/fail2ban/jail.local.bak-pre-2026-07-14`

## Fora de escopo (ainda aberto)
- `PasswordAuthentication yes` via cloud-init drop-in — só com PERMITO separado
- Doutrina infra-extend em agentes Hermes + `docs/AGENTS.md` MultiZap → issue GPT
