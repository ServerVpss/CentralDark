# Caddy Route Mapping — Técnica de Diagnóstico

Quando for diagnosticar rotas/domínios no Caddy da VPS, seguir esta técnica:

## 1. Mapear portas reais (não confiar no Caddyfile)

```bash
# Portas escutando de verdade
ss -tlnp | grep LISTEN

# Testar cada backend direto (sem Caddy)
curl -s -o /dev/null -w '%{http_code}' http://localhost:<porta>/
curl -s -H 'Host: <dominio>' http://localhost:80/
```

## 2. Cruzar com Caddyfile

```bash
# Ver todos os domínios declarados
grep -r 'centralldark\|centraldark' /etc/caddy/ | grep -v '#\|import'

# Ver imports ativos
grep -n 'import' /etc/caddy/Caddyfile
```

## 3. Classificar

| Status | Causa | Ação |
|--------|-------|------|
| Backend vivo + Caddy certo | ✓ | Nada |
| Backend vivo + Caddy errado | Falso-verde | Corrigir número |
| Backend morto + sem natureza HTTP | Rota morta por design | Não mexer |
| Backend morto + natureza HTTP | Rota quebrada | Investigar |

## 4. Armadilhas

- **308 no :80** = Caddy redirecionando pra HTTPS (normal, não é erro)
- **Caddy responde pra qualquer domínio** se tiver certificado TLS (auto-redirect)
- **Porta fantasma** = declarada no Caddyfile mas ninguém escuta (só existe em backups .bak/.bkp)
- **Conflito de porta** = dois domínios apontam pra mesma porta (ver `ss -tlnp`)

## 5. Faxina segura

Antes de remover rota:
1. Backup: `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)`
2. Validar: `caddy validate --config /etc/caddy/Caddyfile`
3. Recarregar: `caddy reload --config /etc/caddy/Caddyfile`
4. Só recarregar se validate passar

## Exemplo desta sessão (28/08)

```
VIVOS: api→:8090, grafo→:3030, hub→:8098, centralldark→:3000, mcp→:9100
MORTOS POR DESIGN: deploy (WebhookDeploy parado), bot (Telegram bot), bridge (sem porta)
FALSO-VERDE: elite→:8080 (real: :8082) → corrigido
FANTASMA: status (6 portas, só 2 respondem), gateway (2 portas, só 1 viva)
```
