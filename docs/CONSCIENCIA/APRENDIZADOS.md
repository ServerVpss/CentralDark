### 30. Dependabot Conflict Resolver — padrão ÚNICO e auto-atualizável
- **Categoria:** padrão
- **Data:** 2026-08-28
- **Contexto:** Motor resolve-conflicts.sh + workflow dependabot-auto-merge.yml + skill git-conflict-resolve-house-standard. PR #1341 teste de prova (zod bump fake) — motor disparou sozinho, NO_CONFLICT determinístico. PR #1321/1318/1315 resolvidos (runner offline → online).
- **Aprendizado:** Padrão ÚNICO de resolução de conflito git/dependabot. NÃO criar segundo resolvedor — este se atualiza. Motor na branch do PR faz `git merge origin/main` (--ours = PR, --theirs = main). package.json/lock: aceita main + aplica BUMP. CORE (centraldark_master_cycle.py, lupa, docs, .github): mantém main. FAIL_CLOSED se não determinístico. 10 frentes de difusão: script, workflow, dependabot.yml, skill, SOUL, LEIA-ME-IA, CENTRALDARK_AI_BOOT, PR template, CI gate, doc de aprendizado.
- **Receipt:** PR #1341, skill atualizada, LEIA-ME-IA.md linha 36.
