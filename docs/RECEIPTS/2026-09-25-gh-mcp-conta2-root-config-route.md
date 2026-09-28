# 📣 GH MCP Conta2 Root Config Route

🟢 O QUE ANDOU
- ✅ Medida rota híbrida: `HOME=/root/.centraldark/mcp-auth/profiles/conta2/home` com `GH_CONFIG_DIR=/root/.config/gh`.
- ✅ Rota adicionada ao `scripts/centraldark-gh-rover.sh` como `GH_MCP_CONTA2_WITH_ROOT_CONFIG`.
- ✅ Rollover agora cobre root normal e contexto MCP/conta2 antes de bloquear.

⚠️ PENDÊNCIAS ABERTAS
- ⚠️ O segredo do GH não foi copiado para o perfil MCP; a rota usa apenas `GH_CONFIG_DIR=/root/.config/gh` como fonte de auth existente.
- ⚠️ Se `/root/.config/gh` faltar, o rover ainda rola para GH_PROFILE_AUTH/GH_TOKEN_ENV/RAW_PUBLIC/BLOCKED_REAL.

📊 PORCENTAGEM HONESTA
- 100% bash syntax PASS.
- 100% rota MCP+root config testada por `gh api` nesta sessão.
- 100% rover atualizado no runtime VPS.

🎯 PRÓXIMO PASSO
- Usar o rover como rota padrão de micro-sync antes de qualquer BLOCKED em GitHub/API.

📌 PROVA
- START_HEAD=1df94e30ac0f0313edcc760db9e4789104772342
- ROVER_TEST_ROUTE=GH_ROOT_AUTH
- SECRET_EXPOSED=false

<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>
