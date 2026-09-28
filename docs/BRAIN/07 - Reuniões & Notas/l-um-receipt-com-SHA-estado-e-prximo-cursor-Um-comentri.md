---
title: "lá um receipt com SHA estado e próximo cursor Um comentári"
date: 2026-09-24
tags: ["reuniões-&-notas"]
---

lá um receipt com SHA, estado e próximo cursor. Um comentário não é merge, não dispara git, não quebra nada — e fica indexado no PR que tu já abre pra medir.

2. O repo — onde o rastro é versionado. Foi o que fizemos: docs/CHECKLIST-FULL-20260924.md (commits c9aee0b7, c2c9ccb7) e scripts/set-bot-profile.sh (dd202fed). Arquivo em repo não esquece — está no Git, com autor, data e SHA. Diferente de chat, que se perde.

3. O arquivo de continuidade — CENTRALDARK_HANDOFF.md, DELTA-CONTINUO.md. Já existem no repo pra isso. O problema medido é que estão defasados (apontam pra SHAs de agosto/setembro). A manutenção certa é atualizá-los a cada delta, não criar um quarto arquivo.

4. O NEXT_CURSOR. Todo receipt da Casa termina com ele. É o campo que faz a próxima sessão — mesmo em outro chat, outro modelo — saber exatamente de onde continuar. É o antídoto específico contra esquecimento.

O que NÃO resolve (e por que):

Chat — cada conversa é uma ilha. O que não virou arquivo no repo, morre com o chat. Foi o que aconteceu com o [[Claude]] Code.
Drive/[[Notion]] — útil como espelho, mas o contrato da Casa diz MIRROR_IS_SECOND_OWNER=false e BACKUP_IS_SOURCE_OF_TRUTH=false. Espelho não é fonte.
Memória de m