---
title: "Cristal — Integração da Bancada Externa ao Canal CentralDark Status"
status: "CANONICAL_CRYSTAL"
date: 2026-09-25
owner: "docs/CONSCIENCIA/05-CANAIS/"
authority: "SEGREDO/CHEFE"
truth_rule: "REALIDADE_IS_JUDGE"
complements: "REGRA-NOTIFICACAO-E-RESUMO-SEMANAL.md"
---

# Cristal — Integração ao Canal `CentralDark — Status`

## 1. O que foi provado

A bancada externa (UseAI Instant) **publica no canal oficial da Casa** pelo bot
da porta, sem processo próprio, sem shell na VPS e sem segundo backend.

```text
BANCADA_EXTERNA → conector Telegram → @Guardiaodopivete_bot → canal CentralDark — Status
```

| Item | Valor medido |
|---|---|
| Canal | `CentralDark — Status` |
| chat_id | `-1003669176367` |
| Tipo | `channel` |
| Bot | `@Guardiaodopivete_bot` (`GuardiaoCasa`, id `8884831955`) |
| Papel do bot | `administrator` |
| Permissão decisiva | `can_post_messages: true` |
| Assinatura da postagem | `GuardiaoCasa` |
| Primeira prova | `message_id 6652` — `ok:true` |
| Segunda prova | `message_id 6653` — `ok:true` |
| Ledger | PR-mãe `#1562` recebeu comentário `submitted successfully` |

## 2. Fronteira honesta

```text
BANCADA_EXTERNA_POSTA_QUANDO_CHAMADA=true
BANCADA_EXTERNA_POSTA_SOZINHA=false
HERMES_RESIDENTE_POSTA_EM_CRON=true (a construir)
```

A bancada **não tem gancho de disparo**. Ela publica quando o CHEFE pede, pelo
conector conectado. O disparo em cadência depende do Hermes, no PM2, via cron.

Declarar o canal automático sem o processo vivo do lado da VPS é `ACTION != PROOF`.

## 3. Receita preenchida — pronta para o Hermes

```yaml
CRYSTAL_ID: CANAL_CENTRALDARK_STATUS_VIA_GUARDIAOCASA

CAUSE:
  O canal oficial CentralDark — Status precisa receber estado da Casa sem o
  CHEFE abrir chat. A bancada externa só posta quando chamada; quem tem cron
  é o Hermes, residente no PM2.

OWNER:
  scripts/ — mesmo owner da rota de notify-telegram
  (não criar owner paralelo — REUSE_BEFORE_CREATE)

SCOPE:
  affects:
    - notificação de status no canal CentralDark — Status (-1003669176367)
    - recibos semanais no molde de REGRA-NOTIFICACAO-E-RESUMO-SEMANAL.md
  does_not_affect:
    - canal privado do CHEFE (1901426549)
    - bot @Guardiaonotify_bot
    - bot @srver1bot
    - arquitetura do Live Fabric

FINGERPRINT:
  include:
    - GUARDA_PRINCIPAL_BOT_TOKEN presente no cofre da VPS
    - CANAL_STATUS_CHAT_ID = -1003669176367
    - bot permanece administrator com can_post_messages true
    - molde de resumo inalterado
  exclude:
    - timestamp_noise
    - cosmetic_ui_noise

RECIPE:
  - carregar token do cofre (nunca do chat, nunca do repo)
  - medir getMe do GuardiaoCasa
  - medir estado vivo (git, fila, serviços)
  - montar mensagem no molde canônico (8 blocos)
  - chamar sendMessage no chat_id -1003669176367
  - exigir ok:true na resposta
  - gravar receipt com message_id

EXPECTED_RESULT:
  mensagem publicada no canal com author_signature GuardiaoCasa
  e receipt registrado com o message_id

PROOF:
  command_or_test:
    curl POST /bot<TOKEN>/sendMessage com chat_id -1003669176367
  pass_condition:
    ok == true AND message_id presente na resposta

COUNTERPROOF:
  - token inválido deve retornar 401
  - bot sem admin no canal deve retornar 403
  - chat_id errado deve retornar 400 chat not found

REPLAY:
  same_fingerprint:
    REUSE_PROVEN_PATH_NO_RETHINK
  changed_fingerprint:
    REVALIDATE_AFFECTED_CONE_ONLY

DIVERGENCE:
  action:
    CREATE_NEW_DELTA

RECEIPT:
  required: true

FIXED_POINT_TEST:
  nova rodada com mesmo fingerprint não pode criar delta material
  a mensagem deve ser idêntica em estrutura (conteúdo pode variar por fato novo)
  dedupe: repetição idêntica em menos de 24h não gera novo post

NEXT_CURSOR:
  Ligar o cron do Hermes para postar no canal -1003669176367
```

### Comando de referência (segredo nunca no repo)

```bash
# token lido do cofre; valor JAMAIS entra em commit, receipt ou chat
TOKEN="$(grep -m1 '^GUARDA_PRINCIPAL_BOT_TOKEN=' /root/CentralDark/secrets/telegram-alerts.env | cut -d= -f2-)"
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  --data-urlencode "chat_id=-1003669176367" \
  --data-urlencode "parse_mode=HTML" \
  --data-urlencode "text=<mensagem no molde canônico>"
```

## 4. Regra do ledger

Toda publicação relevante no canal **entra no PR-mãe `#1562`** como novidade, com
evIdência. A regra é a mesma já cristalizada:

```text
TODA_NOVIDADE_REAL → CLASSIFICAR → EVIDÊNCIA → PR-MÃE #1562 → NEXT_CURSOR
```

## 5. Dica de cristalização para o Hermes

O Hermes **não precisa inventar nada**. Ele já tem:

- o bot da porta rodando (`hermes-acp`, `unified-bot.cjs` no PM2)
- o cofre com `GUARDA_PRINCIPAL_BOT_TOKEN`
- o padrão de receita acima

Falta apenas:

```text
1. ler o molde de REGRA-NOTIFICACAO-E-RESUMO-SEMANAL.md
2. medir o estado vivo
3. montar a mensagem no molde de 8 blocos
4. postar no canal -1003669176367
5. gravar receipt
```

**`REUSE_BEFORE_CREATE`:** nada de segundo bot, segundo canal ou segundo script de
notificação. É a mesma rota, só automatizada.

## 6. Pendências

```text
A. Cron do Hermes para o canal — NÃO LIGADO
B. Dedupe de postagem repetida — especificado no FIXED_POINT_TEST, não implementado
C. Inventário CASA baseline — não materializado
D. Verificador de recibo não cobra o rodapé canônico
```

---

**Prova desta cristalização:**

```text
canal:    CentralDark — Status · -1003669176367
posts:    message_id 6652 e 6653 · author_signature GuardiaoCasa
prova:    TELEGRAM_SEND_MESSAGE → ok:true em ambos
ledger:   PR-mãe #1562 — submitted successfully
```

```text
🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF
```
