# Push sem ordem — casos para aprender (NÃO repetir)

> REGRA #20 do SOUL: `git push` sem ordem literal do Pivete = PROIBIDO.
> Esta página registra o que **quase** virou erro e foi travado a tempo.

## Caso 07/08 — hipotético evitado (Casa↔GitHub Sync)

**Situação:** Pivete pede "sync Casa". Eu começo FASE 0→1→2→3 e chego em FASE 4.
Plano lindo, manifest lindo, decido "tá tudo ok pra commitar e mandar".

**Risco:** se eu chamar `git push` aqui, violei REGRA #20. Pivete só falou "sync",
que pode querer dizer "commit local" ou "vai até o remoto". Não é literal.

**Como travou:**
- SOUL §7 classifica `git push` como R2 com trava explícita.
- REGRA #20 do SOUL é categórica: "Sem ordem explícita, atual e específica, sem `git push`."
- FASE 4 foi quebrada em duas: "Executar (commit local)" + "Executar (push)" com a
  segunda tendo `authorization_token` no manifesto.

**Aprendizado:**
- "Sync" ≠ "push". Sync pode parar no commit local.
- "Sobe" / "manda" / "publica" são palavras-gatilho para exigir push.
- Em dúvida, parar e perguntar: "commit local OK, mando pro remoto?"
- O card deve continuar mostrando o item como 🟡 até o push ser confirmado.

## Caso 28/07 (REGRAS #14) — Claude Code + DarkAI proxy

**Situação:** Claude Code CLI e Hermes compartilhavam token Pro → quota compartilhada.
Um agente fazia spawn, token zerava, outro caía em 429.

**Risco:** se eu autonomamente "ajustar" a quota / compartilhar token / desligar rate
limit, isso é produção + credencial + terceiros. R4.

**Como travou:**
- `DARKAI_URL` registrado como VPS-only em `/root/CentralDark/.env`.
- REGRA #14 do NUCLEO: `subprocess darkai.sh` apenas.
- Sem ordem, nada.

**Aprendizado:**
- Token compartilhado entre agentes = ponto de falha simultânea.
- "Compartilhar" credencial entre sistemas paralelos dispara R4 mesmo que pareça
  eficiente.

## Caso 04/08 (CARTAO-MESTRE) — clone-deck

**Situação:** Pivete tem `apps/modulos/clone-deck/` ausente no checkout local.
"Baixa prioridade agora por ordem do Pivete" — não investigar antes do piloto.

**Risco:** se eu autonomamente "ir clonando" pra resolver pendência, ignoro a ordem
de prioridade dele. R2 sem OK.

**Como travou:**
- Card-Mestre tem o item marcado 🟡 com "**baixa prioridade agora por ordem do Pivete**
  — não investigar antes do piloto".
- Modo Casa (REGRAS #22) executa o autorizado, mas **não expande escopo**.

**Aprendizado:**
- Card-Mestre registra **por que** o item está pausado, não só **que** está.
- Reabrir pendência fechada ou acelerar sem ordem = erro operacional.

## Caso 22/07 — Manual da Casa (congela protótipo)

**Situação:** comando "congelar o protótipo Hermes Fase 1 e preservar o ouro".

**Risco:** "congelar" interpretável como "deletar" — destrutivo.

**Como travou:**
- COMANDO-HERMES-CONGELAR explicitly enumerated 7 passos: inventariar → backup →
  hash → testar restore → extrair aprendizados → retirar do NUCLEO ativo → validar.
- Sem "deletar" antes de testar restore.

**Aprendizado:**
- Comando destrutivo vem com **passo de rollback provado**.
- "Preservar o ouro" = backup + hash + restore testado, não simplesmente manter.

## Caso 26/07 — Issue #24015 (computer_use ignorava auxiliary.vision)

**Situação:** Pivete dirigiu teste isolado de imagem.

**Risco:** se eu autonomamente "experimentar fix" pra issue antes de confirmar bug,
estou modificando runtime consenso sem OK.

**Como travou:**
- REGRA #11: skill de chat externo = CANDIDATO. NUNCA instalar sozinho.
- Patch no artefato canônico existente, não criar V2 paralelo.

**Aprendizado:**
- Bug confirmado + issue nº + ordem do Pivete → pode patchar.
- "Acho que isso aqui tá errado" → NÃO.
