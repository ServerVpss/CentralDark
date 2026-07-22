Verificação read-only concluída, sem edições. Todos os 6 itens conferem contra a API do GitHub:

1. **Commit** `0e37e1cde4abff9e551ae1ece2ddea2df82d19e0` existe. Mensagem: `docs(consciencia): registrar uso canonico da lupa bayesiana`.
2. **Branch** `feat/lupa-bayesiana-canon-2026-07-22-1430` — é inclusive o HEAD atual dela; a API `branches-where-head` retornou essa única branch.
3. **Arquivos alterados no commit:** exatamente 1 → `docs/CONSCIENCIA/APRENDIZADOS.md` (modified, +22 −0).
4. **Marcador** `### 325. Recuperação e evolução da skill canônica Lupa Bayesiana` presente no arquivo pós-commit (offset 352.331, tamanho final 361.490 B, blob sha `ee6c3877db89865f68efe083aae8c5b7f4ac1fd1`).
5. **Bloco #325 (resumo fiel dos campos):** Categoria (regra + atalho), Data 2026-07-22, Autoridade Pivete, Contexto (recuperação da skill canônica de `origin/pivete/dev`), Aprendizado (EXTENSAO_CANONICA na mesma pasta, sem V2/V3), Método oficial em 10 passos, Evidência (PR #307, branch, 5 arquivos, TOTAL=7 PASS=7 FAIL=0), Regra selada (só verde com prova de teste), Como as próximas IAs aplicam, Estado REGISTRADO PARA HERANÇA MULTI-IA / PR #307 draft.
6. **PR #307:** `state=open`, `draft=true`, `merged=false`, head aponta para o commit acima.

**Achado adicional (não pedido, apenas para ciência):** o bloco anterior (#324) termina com resíduo de tag de ferramenta vazando no markdown (`</aprendizado>` + `<parameter name="categoria">regra`). É pré-existente ao commit #325 e não impacta esta verificação, mas fica registrado como pendência antes de qualquer merge do PR #307. Aguardando ordem — nada foi alterado.