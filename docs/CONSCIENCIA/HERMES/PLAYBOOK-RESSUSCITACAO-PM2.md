---
title: "PLAYBOOK RESSUSCITACAO PM2"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🚑 PLAYBOOK: Ressuscitação em Massa PM2 (Método Arsenal)

> **Doutrina viva do Hermes.** Sempre que múltiplos processos PM2 caírem, siga esse método. Testado e validado em 05/07/2026 (12/14 processos ressuscitados em ~5min).

## 🎯 Regra de ouro
**NUNCA rodar `pm2 save` durante um incidente.** Se algum processo tiver caído antes de você diagnosticar, `pm2 save` sobrescreve o `dump.pm2` com o estado quebrado — perdendo o mapa dos processos ausentes. Antes de qualquer coisa, faça **backup do dump atual**:

```bash
cp /root/.pm2/dump.pm2 /root/.pm2/dump.pm2.bak.$(date +%s)
```

## 📋 Fases do método (nessa ordem)

### FASE 0 — Diagnóstico completo (não toca em nada)
- `pm2 list` — o que tá vivo
- `ls apps/modulos/` — o que deveria existir
- `find apps/modulos -maxdepth 2 -name package.json -o -name ecosystem.config.*` — como cada módulo sobe
- `ss -tlnp` — portas em uso (achar zumbis/EADDRINUSE)
- `git log --diff-filter=D --name-only -- <path>` — código sumido? Confirma no git

### FASE 1 — Matar zumbis
Antes de subir daemon nas portas críticas (8082, 8083, 3101, 3102, 9100), verificar se algo já escuta e matar:
```bash
PID=$(ss -tlnp | grep ':PORTA ' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
[ -n "$PID" ] && kill -9 "$PID"
```

### FASE 2 — Subida em enxame
Para cada módulo: descobrir `main`/`start.sh`/`ecosystem.config.*` e subir com nome EXATO (bate com o `dump.pm2` antigo pra manter continuidade):
```bash
pm2 start <caminho> --name <NOME-EXATO> --time
```

### FASE 3 — Placar (⛔ NÃO SALVE ANTES DE VERIFICAR)
```bash
pm2 jlist | jq -r '.[] | "\(if .pm2_env.status=="online" then "🟢" else "🔴" end) \(.name) restarts=\(.pm2_env.restart_time)"'
```
Se `restarts` > 5 em processo recém-subido = loop de crash → ver log e parar.

### FASE 4 — Só agora salvar
```bash
pm2 save
```

### FASE 5 — Verificar portas + health público
```bash
for p in 3101 3102 8082 8083 9100; do ss -tln | grep -q ":$p " && echo "🟢 $p" || echo "🔴 $p"; done
curl -sSI https://mcp.centralldark.com/health | head -1
```

## 🔧 Erros conhecidos e receita

| Erro | Diagnóstico | Fix |
|---|---|---|
| `EADDRINUSE porta X` | Zumbi da tentativa anterior | `kill -9 $PID` (fase 1) |
| `FATAL: LOVABLE_API_KEY não definida` | Módulo sem `.env` ou PM2 não carregou | Criar `ecosystem.config.cjs` com `require('dotenv').config()` no topo + `env: { CHAVE: process.env.CHAVE }` |
| `HUB_SUPABASE_* nao setados` | Mesma coisa — dotenv não foi carregado | Idem acima |
| `venv/bin/uvicorn: No such file or directory` | Venv Python foi apagado | Recriar: `python3 -m venv <path> && <path>/bin/pip install <deps>` |
| `bad interpreter` num venv "achado" | Venv antigo com shebang quebrado | Recriar do zero, não reusar backup |

## 🛡️ Blindagem
Chame `scripts/socorro-pm2.sh` sempre que suspeitar de queda em massa (o script faz o método acima automaticamente e avisa no Telegram).

## 📚 Histórico
- **05/07/2026**: incidente MCP → dump.pm2 sobrescrito com só 7 processos → aplicação deste playbook restaurou 12 daemons. Ficou pendente: LovableProxy (sem chave) e EliteHTTP (venv precisa recriar).
