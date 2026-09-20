#!/bin/bash
# scripts/run-once/eliminar-duplicatas-consciencia-brain.sh
#
# Remove as duas árvores duplicadas criadas por acidente no commit
# 9b8eeec4eeb577dde2c698919f2c662cb5d88813 ("fix(memory-executor):
# auto-corrige 129 gap(s) de memória", 2026-07-02T16:29:03Z):
#
#   docs/CONSCIENCIA/CONSCIENCIA/   (110 arquivos — subconjunto congelado
#                                    de docs/CONSCIENCIA/, sem nenhum
#                                    arquivo exclusivo)
#   docs/CONSCIENCIA/BRAIN/         (42 arquivos — cópia congelada de
#                                    docs/BRAIN/, sem uso por nenhum
#                                    script ou doc além de snapshots
#                                    automáticos de notion-sync)
#
# Prova completa (refs, shas, comandos) em:
#   docs/RELATORIOS/auditoria-duplicatas-consciencia-brain/2026-07-27.md
#
# Causa raiz: o commit 9b8eeec4e criou as duas árvores no MESMO commit
# em que só deveria ter adicionado frontmatter a arquivos já existentes
# (confirmado: 404 nos dois paths no commit pai c454c960749). Padrão
# igual ao bug de path duplicado achado em scripts/github-bot-controller.mjs
# nesta mesma sessão — resolução de caminho relativo com prefixo repetido.
#
# NÃO apaga docs/CONSCIENCIA/ (raiz) nem docs/BRAIN/ (raiz) — essas são as
# árvores ativas: docs/CONSCIENCIA/CONSCIENCIA.md é lida pela tool MCP
# ler_consciencia e mapeada em docs/PROTOCOLO-BOOT.md; docs/BRAIN/ é
# referenciada por apps/bot-telegram/skills/externas/obsidian-writer.cjs
# e scripts/grafo-vivo/obsidian-nota.mjs.
set -e
cd <caminho-vps>
git fetch origin
git checkout main
git reset --hard origin/main

test -d docs/CONSCIENCIA/CONSCIENCIA || { echo "docs/CONSCIENCIA/CONSCIENCIA ja nao existe — nada a fazer"; exit 0; }
test -d docs/CONSCIENCIA/BRAIN || { echo "docs/CONSCIENCIA/BRAIN ja nao existe — nada a fazer"; exit 0; }

git rm -r --quiet docs/CONSCIENCIA/CONSCIENCIA
git rm -r --quiet docs/CONSCIENCIA/BRAIN

git commit -m 'chore(consciencia): eliminar arvores duplicadas CONSCIENCIA/CONSCIENCIA e CONSCIENCIA/BRAIN

Ambas criadas por acidente no commit 9b8eeec4e (fix memory-executor,
2026-07-02T16:29:03Z) — subconjuntos congelados nunca mais editados,
sem nenhum arquivo exclusivo em relacao as arvores originais
(docs/CONSCIENCIA/ e docs/BRAIN/), sem referencia em codigo/tooling
alem de snapshots automaticos de notion-sync.

Prova completa: comparacao de sha por arquivo, datas de commit,
mapeamento em docs/PROTOCOLO-BOOT.md, e prova de criacao (404 no
commit pai) na PR/relatorio associado.'

git push origin main
echo ELIMINACAO_CONCLUIDA
