
# Padronizar posts Telegram: canal também em `<pre>` mono

## Problema
O card do admin já sai monoespaçado (fundo preto) porque uso `<pre>` + `parse_mode: HTML`. Mas o post do canal Status foi enviado como texto puro — apareceu na fonte normal do Telegram, quebrando o padrão visual.

## Solução (2 pontos)

**1. Regra fixa daqui pra frente**
Todo post do Telegram (admin OU canal) sai com `parse_mode: "HTML"` + conteúdo dentro de `<pre>…</pre>`. Muda só o tamanho:
- Admin privado → card completo (formato AULA-006, placar ▓░, etc)
- Canal Status → 1-3 linhas curtas, mas ainda dentro de `<pre>` (mono, fundo escuro)

**2. Ensinar Hermes**
Atualizar na VPS:
- `HERMES/AULAS/AULA-003-telegram-notificacao.md` — adicionar seção "Formato visual obrigatório: sempre `<pre>` HTML, nunca texto puro"
- `HERMES/ROTAS-FIXAS/notificacao-telegram.md` — checklist inclui "linha curta do canal também vai em `<pre>`"
- `HERMES/APRENDIZADOS/008-canal-tambem-mono.md` — o porquê (padrão visual do Pivete, fundo preto/mono)
- Aprendizado geral #272 no `docs/CONSCIENCIA/APRENDIZADOS.md`

**3. Reenviar o post do canal (opcional, você decide)**
Se quiser, disparo um novo post no canal Status agora, mesma info, mas em `<pre>` — pra ficar visualmente igual ao padrão. O antigo fica lá (Telegram não deixa editar autoria bot fácil, mas dá pra deletar se preferir).

## Áreas tocadas
Só `HERMES/` na VPS + 1 chamada opcional pro Telegram. Nada no `src/`.

## Confirma?
Manda **"vai"** que eu:
1. Grava a regra no Hermes
2. Reenvio o post do canal em `<pre>` (a menos que peça pra não reenviar)
