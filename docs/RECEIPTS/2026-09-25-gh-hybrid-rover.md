# 📣 GH Hybrid Rover — CentralDark

🟢 O QUE ANDOU
- ✅ Criado script `scripts/centraldark-gh-rover.sh`.
- ✅ Rollover determinístico: GH_ROOT_AUTH → GH_PROFILE_AUTH → GH_TOKEN_ENV → RAW_PUBLIC → BLOCKED_REAL.
- ✅ Rota comprovada para `scripts/generate_centraldark_inventory.py`: `GH_ROOT_AUTH`.
- ✅ Rota comprovada para `.github/workflows/inventario-casa.yml`: `GH_ROOT_AUTH`.

⚠️ PENDÊNCIAS ABERTAS
- ⚠️ `GITHUB_CONNECTOR/API` existe fora da VPS via ChatGPT; dentro da VPS o fallback real disponível é GH CLI/root auth ou raw público.
- ⚠️ Inventário completo pode ser pesado no dirty runtime; baseline deve ser rodado com cuidado de escopo.

📊 PORCENTAGEM HONESTA
- 100% GH root auth provado com HOME=/root.
- 100% script de rollover criado.
- 80% hybrid completo na VPS; falta acoplar connector externo como receipt/orquestrador fora do shell.

🎯 PRÓXIMO PASSO
- Usar `scripts/centraldark-gh-rover.sh` para qualquer micro-sync de arquivo da main antes de declarar BLOCKED.

📌 PROVA
- START_HEAD=1df94e30ac0f0313edcc760db9e4789104772342
- ROUTE_SCRIPT=GH_ROOT_AUTH
- ROUTE_WORKFLOW=GH_ROOT_AUTH
- SECRET_EXPOSED=false

<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>
