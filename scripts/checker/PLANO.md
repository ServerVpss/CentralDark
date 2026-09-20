# 📋 PLANO — scripts/checker

## ✅ Feito (2026-06-04)
- Estrutura modular com 11 blocos + agregador (`run-all.sh`)
- `_lib.sh` com sanitização, helpers de emissão e cores
- Integração com `install.sh --check-final`
- Códigos de saída claros (0/1/2) pro instalador bloquear quando há ERRO
- README documentando cada bloco

## 🔜 Próximas evoluções
- **Bloco extra de chat ao vivo real:** hoje só checa arquivos. Idealmente faria uma ida-e-volta de mensagem de teste via webhook (precisa coordenar com WuzAPI — exige confirmação do usuário).
- **Bloco de banco real:** validar conectividade Supabase com query `SELECT 1` (precisa montar credenciais sem expor).
- **Modo JSON:** flag `--json` no `run-all.sh` pra integrar com painel admin.
- **Histórico:** comparar relatório atual com o anterior e marcar regressões (novos ERROs).
- **Notificação:** quando STATUS=ERRO, mandar pro Telegram bot via webhook interno.

## ❌ Não fazer
- Não escrever, reiniciar ou apagar nada — checker é read-only por design.
- Não acionar Docker/Caddy/WuzAPI sem confirmação explícita do usuário.
