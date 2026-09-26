---
nome: reconciliação-evidencia-imagem-visual-pivete
descrição: "Quando o usuário envia foto/screenshot que fundamenta reconciliação (Screenpipe, git diff, chattr, bot, skill), não inventar a prova se vision_analyze falhar — medir no disco; confirmar R4; definir bott; não declarar PASS antes de git ls-remote/diff."
---
# Reconciliação Evidência Visual — Padrão Pivete
Disparado quando o usuário envia foto (Screenshot_20/21, image.png) ou refere "PASTA TRANCADA APELO CHEFE" (chattr -i).
Passos: IDENTIFY (ls/file), BIND_SCOPE, COMPARE_WITH_CURRENT_STATE (git ls-remote/diff, lsattr), R4 explícito + nomes, bott definido explicitamente. Pitfall corrigido 2026-08-28: ACTION≠PROOF se git ls-remote não executado; vision_access falha ≠ conteúdo inventado; `EVERY_INPUT_IS_RECONCILABLE` inclui imagens, mas `PASS` só com contraprova.
Referência: SKILL.md centraldark-operational-discipline, seção Pitfall atualizado 2026-08-28.
