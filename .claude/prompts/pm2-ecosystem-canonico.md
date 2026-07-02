# 🎛️ PM2 Ecosystem Canônico — CentralDark

> Fonte da verdade pra padronização de processos PM2 na VPS.
> **Padrão:** `CentralDark-<PascalCase>`.

Última auditoria: **02/07/2026**.

---

## 📋 Mapa de renomeação

| Nome atual (VPS) | ID PM2 | Nome canônico | Volume de refs hardcoded |
|------------------|--------|---------------|--------------------------|
| `zentinel-health` | 0 | `CentralDark-ZentinelHealth` | 4 (baixo) |
| `MultiZap-Gateway` | 3 | `CentralDark-MultiZapGateway` | 49 (crítico) |
| `CloneDeck-CRM` | 6 | `CentralDark-CRM` | 55 (crítico) |
| `elite-ws-gateway` | 12 | `CentralDark-EliteWsGateway` | 2 (baixo) |
| `elite-http-gateway` | 17 | `CentralDark-EliteHttpGateway` | 15 (alto) |
| `elite-anthropic-proxy` | 47 | `CentralDark-EliteAnthropicProxy` | 19 (médio) |
| `graph-panel` | 48 | `CentralDark-GraphPanel` | 28 (alto) |

Todos os outros já estão no padrão (`CentralDark-BotServer`, `CentralDark-MCP`, `CentralDark-Respiracao`, `CentralDark-GuardiaoConsciencia`, `CentralDark-GuardiaoAnalista`, `CentralDark-HubBot`, `CentralDark-ContasAdmin`, `CentralDark-Webhook`, `CentralDark-TeleProxy`, `CentralDark-Evolucao`, `CentralDark-SyncDeck`).

---

## 🚨 Refs hardcoded que precisam ser atualizadas ANTES de renomear

| Prioridade | Arquivo | Linha | Ref |
|------------|---------|-------|-----|
| 🔴 CRÍTICO | `apps/modulos/mcp/dist/tools/elite/elite-gateway.js` | 72 | `p.name === "elite-http-gateway"` |
| 🔴 CRÍTICO | `apps/modulos/mcp/dist/tools/elite/elite-gateway.js` | 7-8 | path `/root/.pm2/logs/elite-http-gateway-out.log` |
| 🔴 CRÍTICO | `scripts/checker/04-pm2.sh` | `ESPERADOS=` | lista com nomes antigos |
| 🔴 CRÍTICO | `scripts/checker/10-crm.sh` | pm2 grep | `"CloneDeck-CRM"` literal |
| 🟡 MÉDIO | `apps/bot-telegram/contexto-centraldark.cjs` | 96 | path `graph-panel/scripts/pipeline-graphifyy.sh` |
| 🟡 MÉDIO | `apps/modulos/elite-anthropic-proxy/start.sh` | 2 | `cd /root/CentralDark/apps/modulos/elite-anthropic-proxy` |
| 🟡 MÉDIO | `scripts/status-ao-vivo.py` | 29-30 | mapa emoji com nomes antigos |
| 🟡 MÉDIO | `apps/modulos/status/painel-data.json` | 63-67, 1613, 1629 | chaves com nome antigo |

---

## 🛠️ Roteiro de aplicação (na VPS)

```bash
# 1) Backup obrigatório
pm2 jlist > /tmp/pm2-backup-$(date +%s).json

# 2) Puxar repo atualizado com refs corrigidas
cd /root/CentralDark && git pull

# 3) Aplicar ecosystem canônico (após confirmar cwd/script reais)
pm2 delete all
pm2 start /root/CentralDark/ecosystem.config.js
pm2 save

# 4) Validar
pm2 status
curl -sS https://status.centralldark.com/painel-data.json | jq '.pm2'
```

---

## 📄 Ecosystem canônico (gerar em `/root/CentralDark/ecosystem.config.js`)

Ver skeleton completo em `docs/CONSCIENCIA/DARKAI/ECOSYSTEM-CANONICO.md` (gerado pela auditoria).
Confirmar `cwd` e `script` reais antes de aplicar via:

```bash
pm2 jlist | python3 -c "
import sys, json
for p in json.load(sys.stdin):
    print(p['name'], '|', p['pm2_env'].get('pm_exec_path',''), '|', p['pm2_env'].get('pm_cwd',''))
"
```

---

## ⚠️ Regra de ouro

**Nunca** rodar `pm2 delete all` sem ter o backup do jlist e o `ecosystem.config.js` validado no lugar. Se algo der errado: `pm2 resurrect` restaura o último `dump.pm2` salvo.
