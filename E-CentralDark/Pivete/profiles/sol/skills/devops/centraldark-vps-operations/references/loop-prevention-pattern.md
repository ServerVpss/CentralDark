# Loop Prevention Pattern

> Não repetir a mesma sugestão. Não re-provar o que já foi provado.

## Sintoma

Agente fica em loop infinito:
- Repete a mesma sugestão de criar PR de teste
- Re-prova o motor 5+ vezes com PRs diferentes
- Re-lê a mesma skill várias vezes
- Fica preso em "reasoning" sem ação

## Causas

1. **Contexto re-injetado**: mensagens antigas do Charizard são re-injetadas como se fossem novas
2. **Falta de estado**: o agente não registra o que já fez
3. **Loop de "prova"**: cada prova sugere outra prova, nunca para

## Regras

1. **Se já provou, pare.** Não re-prove o que já foi demonstrado.
2. **Se já fez, não refaça.** Não crie outro PR de teste se o motor já foi provado.
3. **Se já salvou, não salve de novo.** Não re-escreva a skill se já foi atualizada.
4. **Se já registrou, não registre de novo.** Não re-commit se o aprendizado já está no APRENDIZADOS.md.
5. **Se já reportou, não reporte de novo.** Não re-envie o mesmo receipt.

## Ação corretiva

Quando detectar loop:
1. Parar imediatamente
2. Registrar: "Loop detectado. Tudo já foi feito e provado."
3. Aguardar nova instrução do usuário
4. Não repetir a mesma ação

## Exemplo real (2026-08-28)

Motor resolve-conflicts.sh foi provado 5 vezes:
- PR #1341 (Charizard)
- PR #1355 (Hermes)
- PR #1356 (Hermes)
- PR #1357 (Hermes)
- PR #1358 (Hermes)

Cada prova sugeriu outra prova. Loop detectado e parado.
