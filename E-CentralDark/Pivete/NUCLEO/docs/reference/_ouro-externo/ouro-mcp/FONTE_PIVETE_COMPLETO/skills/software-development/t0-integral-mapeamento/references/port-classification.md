# Port Classification Guide — Classificação de Portas CentralDark

## Classes Oficiais

| Classe | Definição | Exemplos |
|--------|-----------|----------|
| `CANONICAL_PRODUCT` | Porta principal do produto humano (local ou público) | 8787 (local), 443 (público) |
| `INTERNAL_SERVICE` | Serviço interno necessário, não exposto ao humano | 9100 (MCP), 8090 (Arsenal) |
| `DEV_SERVER` | Servidor de desenvolvimento (hot reload, Vite, etc) | 5173, 3000, 3030 |
| `PREVIEW` | Preview auxiliar temporário (scratchpad, test) | 8917 (Forja preview) |
| `LEGACY` | Porta de sistema antigo, mantida por compatibilidade | 9500 (bot webhook antigo) |
| `COLLISION` | Duas coisas tentando usar a mesma porta | 8790 (investigar) |
| `UNKNOWN` | Porta descoberta sem owner claro | — |
| `DECLARED_NOT_LIVE` | Declarada em config (PM2, Docker) mas não ouvindo | 8082, 9200, 9500 |

---

## Regras de Separação

```
DECLARED_PORTS  = o que está em configs (PM2, Docker, .env, Caddy)
LIVE_PORTS      = o que `netstat`/`Get-NetTCPConnection` mostra ouvindo AGORA
HISTORICAL_PORTS = portas de docs/workflows antigos, não ativas
```

**NUNCA igualar DECLARED com LIVE.** Sempre medir runtime real.

---

## Portas Conhecidas CentralDark

| Porta | Serviço | Classe | Status |
|-------|---------|--------|--------|
| 8787 | hermes-webui (BFF) | CANONICAL_PRODUCT | ✅ LIVE |
| 8788 | auto-destilador health | INTERNAL_SERVICE | ✅ LIVE |
| 8917 | Forja preview | PREVIEW | ✅ LIVE (aux) |
| 9100 | MCP CentralDark | INTERNAL_SERVICE | ✅ LIVE |
| 8090 | Arsenal adapter | INTERNAL_SERVICE | DECLARED_NOT_LIVE |
| 8082 | Elite proxy | INTERNAL_SERVICE | DECLARED_NOT_LIVE |
| 9200 | Bot hub-adm (MCP) | INTERNAL_SERVICE | DECLARED_NOT_LIVE |
| 9500 | Bot webhook | INTERNAL_SERVICE | DECLARED_NOT_LIVE |
| 3030 | Graph Panel | DEV_SERVER | DECLARED_NOT_LIVE (VPS) |
| 3100 | MultiZap | INTERNAL_SERVICE | DECLARED_NOT_LIVE (VPS) |
| 443 | Public (Caddy) | CANONICAL_PRODUCT | ✅ LIVE (VPS) |
| 8790 | — | COLLISION | INVESTIGAR |

---

## Como Medir no Windows

```powershell
Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess | Sort-Object LocalPort
```

## Como Medir no Linux

```bash
ss -tlnp | grep -E "8787|8788|8917|9100|8090|8082|9200|9500|3030|3100"
```