# 📣 Receipt — REMEASURE 3 VPS CURRENT

🟢 O QUE ANDOU
- ✅ Medição real executada na VPS `vmi3256920` em `/root/CentralDark`.
- ✅ Runtime Omni/Hermes/MCP revalidado com HTTP 200.
- ✅ API canônica `api.centraldark.com/api/omni/*` revalidada com HTTP 200.
- ✅ Admin Omni e receipts API revalidados com HTTP 200.
- ✅ Receipts locais contados e runtime `runtime/microdeploy` presente.

⚠️ PENDÊNCIAS / QUEBRA REAL
- ⚠️ Worktree VPS segue dirty: `dirty_total=68`, com `tracked_modified=5`, `untracked=63`, `deleted=0`.
- ⚠️ Runtime VPS está em `HEAD=1df94e30ac0f0313edcc760db9e4789104772342`, enquanto o GitHub main recebeu commits posteriores.
- ⚠️ `scripts/generate_centraldark_inventory.py`, `.github/workflows/inventario-casa.yml` e `docs/CONSCIENCIA/INVENTARIO-CASA.json` estão ausentes na worktree VPS atual.
- ⚠️ Inventário smoke na VPS bloqueou por ausência do script. Isso é `BLOCKED_SYNC`, não falha do runtime Omni.
- ⚠️ Sem pull cego por cima de dirty tree.

📊 PORCENTAGEM HONESTA
- 100% runtime health Omni/Hermes/MCP/API/Admin/receipts API medido 200 no CURRENT.
- 100% dirty tree medido no CURRENT.
- 100% ausência do gerador/workflow inventário na VPS medido.
- 0% inventário baseline versionado na VPS atual, porque o script não existe nessa worktree.

🎯 PRÓXIMO PASSO
- Criar rota segura de reconciliação VPS sem `pull` cego: checkpoint do dirty tree, classificar CRISTAL/LIXO/UNKNOWN, preservar cristais, só então aplicar commits GitHub compatíveis ou PR-filho de sync.

📌 PROVA / DADOS MEDIDOS
```text
timestamp_utc=2026-09-25T05:49:44Z
runtime_root=/root/CentralDark
branch=main
head=1df94e30ac0f0313edcc760db9e4789104772342
tracked_modified=5
untracked=63
deleted=0
dirty_total=68

http://127.0.0.1:8099/health -> 200
http://127.0.0.1:8099/v1/models -> 200
http://127.0.0.1:8899/health -> 200
http://127.0.0.1:9100/health -> 200
https://api.centraldark.com/api/omni/status -> 200
https://api.centraldark.com/api/omni/models -> 200
https://admin.centraldark.com/omni -> 200
https://api.centraldark.com/api/microdeploy/receipts/index.json -> 200

systemd centraldark-dc-remote@conta1 = enabled/active
systemd centraldark-dc-remote@conta2 = enabled/active

MISSING scripts/generate_centraldark_inventory.py
MISSING .github/workflows/inventario-casa.yml
MISSING docs/CONSCIENCIA/INVENTARIO-CASA.json
```

🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF
