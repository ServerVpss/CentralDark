# Telegram Modelo 1 — Card-Mestre para tela de celular (cravado 04/08/2026)

## Por que as tabelas Markdown quebram no Telegram mobile
O Telegram **não renderiza tabelas Markdown** (`|---|`). No celular elas quebram linha,
as colunas desalinham e viram uma "linguiça" de texto espremida. Por isso Pivete
rejeitou o formato de tabela e aprovou o **Modelo 1** (`<pre>` / Bloco Monospaçado
com bordas box-drawing `╔═╗`).

**Como o Telegram mede largura** (core.telegram.org/api/entities):
- Comprimento de entidade = unidades UTF-16, NÃO code points.
- Emoji coloridos (U+1Fxxx, plano suplementar) = **2 colunas visuais** (surrogate pair).
- Em `<pre>` monospaçado, um emoji 2 units renderiza como 2 colunas.
- Por isso: **alinhar por display-width** (BMP=1, supplementary=2, U+FE0F variação=0),
  NUNCA por `len()`. Moldura ideal: 36 colunas internas (38 com as bordas `║`) para
  não quebrar em telas pequenas.

Há um renderizador/verificador pronto em `telegram-notification-card/scripts/render_card.py`.

## Estrutura fixa do Card-Mestre (6 blocos, nesta ordem — aprovado)
1. 🟢 `STATUS` → saneado / resumo do dia.
2. 🪄 `TAREFAS` → nº de concluídas **do dia** (reseta diário, sempre em número).
3. 🌡️ `TEMP` → status das 3 temperaturas: HOJE / SEMANA / REGRAS.
4. ⚙️ `AÇÕES EM EXECUÇÃO (TEMPO REAL)` → **SEÇÃO FIXA**. Ações reais do turno:
   📚 skill lida, 💻 comando de terminal, 💾 arquivo salvo, 🔒 trava gravada.
5. 🗂️ `QUADRO (SÓ PENDÊNCIAS)` → só itens pendentes. **Saneado sai do quadro**
   e vira número no contador 🪄 — não ocupa espaço de pendência.
6. 📋 `PENDÊNCIAS` → lista viva final.

## Regras de conteúdo
- Todo item que já foi **sanado/consolidado sai do QUADRO**; entra no contador diário
  numérico. O quadro só mostra o que está pendente.
- Todos os ✅ verdes consolidados podem ser travados com 🔒, editáveis somente com
  "PERMITO PIVETE" explícito (evita quebra acidental do que é estável).
- `%` de conclusão só quando vier explicitamente do provedor; senão `%: N/A (estrutural)`.

## Conceito `tool_progress` ensinado pelo Pivete
- No Hermes a notificação de tool em execução se chama `display.tool_progress`.
- No Telegram o mecanismo de editar a mesma bolha in-place é
  `send_or_update_status()` + `display.tool_progress_grouping: accumulate`.
- Mostra **tool + preview curto** do comando (ex.: `💻 terminal ls -la...`, `🔍 web_search...`).
  NÃO despeja a saída completa do terminal no chat.
- `accumulate` edita a bolha em vez de spammar mensagens novas.
- `display.tool_preview_length` corta o preview.

## Heads-up: notificação "Self-improvement review"
Ao editar uma skill, o Hermes pode emitir uma notificação automática separada
(no perfil pivete apareceu: `Self-improvement review: Patched SKILL.md ...`) que
**vaza como um balão fora do card** e quebra o padrão. Isso é comportamento do
runtime de auto-melhoria, NÃO faz parte do card. Se aparecer, explicar ao Pivete
que é notificação de sistema, não lixo do card. (Não fazer patch de skill
"no meio" de uma resposta de card se puder evitar esse vazamento.)
