# REGRA — Anexo Telegram em entregas grandes / segurança (Pivete · 2026-07-17)

> ⚠️ **ANTI-ESQUECIMENTO ENTRE SESSÕES**  
> Pivete reforçou (2026-07-17): **não se perder**. Esta regra sobrevive a restart de CLI/PM2.  
> Espelhos: `~/.grok/rules/06-…` · `mem/preferences/entrega-telegram-anexo-e-cards-hermes.md` · APRENDIZADOS #336 · HISTORICO-DECISOES.

**Origem:** ordem explícita do Pivete após inventário read-only + prova de `sendDocument`  
**Status:** obrigatória · preferência selada · **reforçada na mesma data**  
**Bot:** `@srver1bot` · admin privado `1901426549`

## Quando aplicar (nível “grande / segurança”)

Sempre que a entrega for **um destes níveis**:

- inventário de infra (Caddy, PM2, portas, kill switches)
- auditoria / diagnóstico denso
- mapa multi-setor com muitas tabelas
- prova operacional longa (várias rotas, muitos processos)
- qualquer relatório de **segurança / governança / risco** com volume alto
- material que **não cabe** bem só no card Hermes ou no chat CLI

→ **NÃO** entregar só no chat da CLI.  
→ **DEVE** enviar anexo no Telegram (admin).

## Formato obrigatório

1. **`.md` e/ou `.txt`** — preferência: **os dois** quando for relatório oficial de missão.
2. Conteúdo **bem estruturado, organizado e categorizado** (Regras de Ouro do Pivete):
   - título + Data/Hora + Solicitante + Modo
   - seções numeradas claras
   - tabelas quando houver mapa (porta/PID/PM2, rotas, kill switches)
   - saudável / fantasma / desligado de propósito / riscos (observação)
   - **zero secrets** (sem `.env`, tokens, keys, hashes de basicauth)
3. Card Hermes no admin (`<pre>`) **avisando** que o anexo saiu + 1 linha no canal status (seco).
4. Chat CLI pode resumir; **a prova completa vai no anexo**.

## Como enviar (VPS)

- API Telegram: `sendDocument` com bot `@srver1bot` (token `SRVER1_BOT_TOKEN`).
- `chat_id` admin: `1901426549`.
- Arquivo **0 byte** pode falhar → mínimo 1 newline ou conteúdo real.
- **Não** usar `notify-telegram` com key legada quebrada; card texto via `HERMES-CORE/utils/notify.mjs`; anexo via `sendDocument`.

## Nunca

- Entregar inventário/auditoria grande **só** em conversa
- Colar monstro no card Hermes (card = resumo; anexo = corpo)
- Anexar secrets, dumps de `.env`, keys
- Esquecer esta regra “porque o chat já mostrou”

## Relação com outras regras

- `01-cards-estudo-telegram-pivete.md` — card de estudo/resumo **continua**
- Esta regra **soma** anexo estruturado para volume/segurança
- Auto-registro castelo: preferência/proteção de processo → grava em APRENDIZADOS
