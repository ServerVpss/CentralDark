# Cherry-pick limpo de branch caótica (padrão 2026-08-28)

## Quando usar

A branch local (ex: VPS) tem material útil misturado com caos:
- 1500+ arquivos deletados
- 5000+ commits de painel/bot
- Histórico divergente (206 ahead, 5042 behind)

Merge ou cherry-pick normal falha em conflito ou traz o caos inteiro.

## Padrão: `git checkout <commit> -- <files>`

Em vez de `git cherry-pick <hash>` (que tenta replay do histórico inteiro), faça checkout arquivo a arquivo do commit específico:

```bash
# 1. Criar branch limpa a partir da main
git checkout -b reconciliacao/<nome> origin/main

# 2. Checkout dos arquivos específicos do commit-ouro
git checkout <commit-hash> -- \
  apps/modulos/HERMES-CORE/agents/Critic/agent.mjs \
  apps/modulos/HERMES-CORE/agents/Executor/agent.mjs \
  apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs \
  apps/modulos/HERMES-CORE/core/cadeia.json \
  apps/modulos/HERMES-CORE/core/decisor.mjs \
  "docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md" \
  apps/modulos/grupo-evolucao/missions/drift-1787891427222.json

# 3. Commit atômico só com o ouro
git commit -m "fix(hermes-core): consolidar código VPS dirty + grafo-vivo + drift mission

Cherry-pick limpo do commit <hash> da branch <branch-caótica>.
Traz os 7 arquivos de código sem os 1585 deletados da branch original."

# 4. Push + PR
git push origin reconciliacao/<nome>
```

## Por que funciona

- `git checkout <commit> -- <files>` extrai o estado final desses arquivos no commit, ignorando todo o histórico intermediário.
- Não traz deleções, não traz conflitos de merge (sobrescreve working tree limpo).
- Commit resultante é limpo, atômico, revisável.

## Caso real (2026-08-28)

- Branch: `fix/hermes-core-vps-dirty` (VPS)
- Commit ouro: `d540485` (fix(hermes-core): consolidar codigo VPS dirty + grafo-vivo + drift mission)
- Branch tinha: 1585 arquivos deletados, 271 modificados, 2010 untracked, 5034 commits de painel
- Resultado: PR #1336 com 5 files changed, +374/-654, ZERO deleções em massa

## Cuidados

- **Conflito em cherry-pick normal?** Esse padrão evita — não tenta replay, só pega o snapshot final.
- **Arquivo não existe no commit?** `git checkout` falha. Verifique com `git show <commit> --name-only` antes.
- **Paths com espaço?** Use aspas: `"docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md"`.
- **Commits de painel/bot:** separe sempre. `git log --oneline origin/main..HEAD | grep -v 'chore(painel)'` pra achar os commits reais.
- **Writer único:** a branch caótica original NÃO é tocada. O ouro vai pra branch nova, PR separado.

## Relação com outros padrões

| Situação | Padrão |
|----------|--------|
| Branch alinhada, poucos commits | `git cherry-pick <hash>` |
| Branch caótica, commit específico | `git checkout <commit> -- <files>` (este padrão) |
| Branch inteira útil | `git merge --squash` |
| Conflito em PR | `git checkout origin/main -- .` + re-aplicar delta |
