# CentralDark — Pack de Hardening Cirúrgico

**Gerado a partir de evidência real da VPS** (`vmi3256920`, Contabo)  
**Timestamp base:** 2026-08-01T01:34:49Z (port-map) + hardening 2026-08-01T01:25:04Z  
**Modo:** read-only analysis → implementação controlada, com rollback

---

## Veredito em 10 linhas

1. Fail2ban está **ativo e útil** (123 banidos agora, 709 total, 2009 fails SSH).
2. UFW está **active** com default deny incoming — bom.
3. **UFW está incoerente:** porta 3000 tem DENY e ALLOW ao mesmo tempo; regra vence a ordem e o efeito real é imprevisível.
4. **7 portas TCP públicas “inesperadas”** ainda escutam em `0.0.0.0`: 3000, 3090, 8082, 8083, 8090, 8899, 9000, 9077.
5. A maior parte disso **deveria ser só 127.0.0.1** e sair via Caddy em 80/443.
6. Webhook de sistema em **9000/tcp público** é superfície extra sem necessidade clara.
7. ArsenalProxy / EliteHTTP / MCP com milhares de restarts históricos = estabilidade ruim, não “só contador”.
8. `ecosystem.config.cjs` no Git com secrets em claro = **P0 de segurança** (já diagnosticado; este pack não reimprime valores).
9. Hardening anterior **não fechou UFW** de propósito: `UFW_NOT_CHANGED=true` porque as portas públicas não estavam no mapa de allow do script.
10. Caminho certo: **mapear → bind localhost → UFW cirúrgico → secrets fora do Git → estabilidade PM2**.

---

## Ordem obrigatória (não pule)

| Fase | O quê | Risco se pular |
|------|--------|----------------|
| 0 | Backup + evidência | Sem rollback |
| 1 | Inventário (já feito; revalidar) | Fecha porta errada |
| 2 | Bind `127.0.0.1` nos serviços internos | UFW fecha e serviço some do mundo sem Caddy |
| 3 | UFW limpo (só 22, 80, 443 + o que for **explícito**) | Lockout ou exposição |
| 4 | Secrets fora do Git + rotação | Compromisso total |
| 5 | PM2 max_restarts / min_uptime / health | Crash-loop continua |
| 6 | Contraprova + placar Hermes | Falso verde |

---

## O que este pack **não** faz

- Não roda sozinho na VPS (você aplica).
- Não rotaciona tokens (você rotaciona; checklist incluso).
- Não apaga histórico do Git (sugere BFG/filter-repo se quiser limpar).
- Não mexe em área 🔒 sem `PERMITO PIVETE`.

---

## Conteúdo

```
docs/DIAGNOSTICO.md          — leitura completa da evidência
checklists/ORDEM-APLICACAO.md
checklists/ROTACAO-SECRETS.md
scripts/00-capture-evidence.sh
scripts/01-fix-ufw-conflicts.sh
scripts/02-apply-ufw-canonical.sh
scripts/03-verify-bind-and-ports.sh
scripts/04-pm2-stability-snippet.sh
templates/ecosystem.env.example
templates/caddy-internal-upstreams.snippet
```

Aplicação: copiar o pack para a VPS, ler `checklists/ORDEM-APLICACAO.md`, executar fase a fase.