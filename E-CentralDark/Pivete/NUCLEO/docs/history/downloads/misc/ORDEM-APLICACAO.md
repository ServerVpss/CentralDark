# Ordem de aplicação — não inverter

## Pré-requisitos

- [ ] Acesso SSH root estável (sessão extra aberta se possível)
- [ ] Caddy sobe e faz proxy para os upstreams internos
- [ ] Backup: `cp -a /etc/ufw /root/centraldark-evidence/ufw-backup-$(date -u +%Y%m%dT%H%M%SZ)`
- [ ] Pack copiado para `/root/centraldark-hardening-pack/`

## Fase 0 — Evidência

```bash
bash /root/centraldark-hardening-pack/scripts/00-capture-evidence.sh
```

## Fase 1 — Ver conflito UFW (só leitura)

```bash
bash /root/centraldark-hardening-pack/scripts/01-fix-ufw-conflicts.sh
```

## Fase 2 — Bind localhost (código / start scripts)

**Antes** de fechar UFW:

1. Elite proxy / Arsenal / Hermes / artifacts: `--host 127.0.0.1` ou `HOST=127.0.0.1`
2. Reiniciar só o serviço alterado
3. Confirmar `ss -lntp | grep <porta>` mostra `127.0.0.1`

Sem isso, fechar UFW = serviço some para o Caddy se o Caddy apontava para IP público errado (em geral Caddy usa 127.0.0.1 — verificar).

## Fase 3 — UFW canônico

```bash
# LER o script. Confirmar que 80/443/22 ficam.
bash /root/centraldark-hardening-pack/scripts/02-apply-ufw-canonical.sh
```

O script:

- Remove regras conflitantes de 3000 e allow de 9000 (opcional flag)
- Garante 22, 80, 443
- Default deny incoming
- **Não** toca em Docker published em 127.0.0.1

## Fase 4 — Contraprova

```bash
bash /root/centraldark-hardening-pack/scripts/03-verify-bind-and-ports.sh
```

Critério de PASS:

- SSH ainda responde
- https://centralldark.com / api / mcp / status respondem
- `ss` não mostra 8082/8083/8090/8899 em 0.0.0.0
- fail2ban pong

## Fase 5 — Secrets (paralelo, mas P0)

Ver `ROTACAO-SECRETS.md`. Não misturar com mudança de UFW na mesma hora se estiver sozinho no servidor.

## Fase 6 — PM2 estabilidade

```bash
bash /root/centraldark-hardening-pack/scripts/04-pm2-stability-snippet.sh
# revisar output; aplicar no ecosystem limpo (sem secrets no git)
```

## Rollback

Se lockout SSH: console Contabo (VNC/KVM do painel).  
UFW: `ufw --force reset` + restaurar backup de `/etc/ufw`.  
Scripts de hardening anterior: `$EVIDENCE/rollback.sh` se existir.