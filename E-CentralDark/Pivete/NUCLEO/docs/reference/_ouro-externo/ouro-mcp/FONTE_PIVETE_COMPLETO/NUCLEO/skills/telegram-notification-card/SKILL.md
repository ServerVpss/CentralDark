---
name: telegram-notification-card
description: Generate the canonical Hermes/Pivete Telegram `<pre>` notification card (PADRAO-CARD-HERMES v1.2) with correct monospace alignment. Use before sending ANY system-action notification to Pivete's Telegram. Covers the canonical spec location, the display-width padding rule (emoji = 2 columns per Telegram UTF-16 entity length), the connector call shape, and a verifier script. Read the canonical spec file first — do not invent formatting.
category: centraldark
---

# Telegram Notification Card (Card Hermes)

**Canonical spec (ONLY source of truth):** `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` — v1.2, **TRAVADO** (SHA `059c5891`, validated by Pivete 04/07/2026: *"agora sim foi direto pra meu privado, esse sim tá lindo"*).
Local copies: `E:\CentralDark\Pivete\CentralDark\docs\CONSCIENCIA\PADRAO-CARD-HERMES.md` and `E:\CentralDark\Pivete\CentralDark-main\docs\CONSCIENCIA\PADRAO-CARD-HERMES.md`.
**Read this file before sending any card.** Do not freewheel formatting — the user explicitly rejects cards that are not in his standard.

## Hard rules (from the spec)
1. Everything inside ONE `<pre>...</pre>`. Nothing outside (no proportional title above, no footer outside).
2. Send via Telegram **connector `sendMessage`** — NEVER `notify-telegram` (that needs `NOTIFY_API_KEY` and 401s).
   - `connection_id`: `std_01kvw4jkcbekyr1t33vs4p5e9w`
   - `connector_id`: `telegram`
   - admin `chat_id`: `1901426549`
   - status channel `chat_id`: `-1003669176367`
   - `parse_mode`: `HTML`
3. Fixed inner width: **36 visual columns** (box frame `╔═╗`).
4. `STATUS` = emoji + word only (`✅ OK` / `⚠️ AVISO` / `❌ FALHA`). Never mix commit hash into STATUS.
5. Technical proof only in the `🔧 DETALHE TÉCNICO` block (file, commit, validator, log id, tags).

## The alignment trap (why cards look broken)
Telegram renders `<pre>` monospace, but **color emoji occupy 2 columns, not 1**. The spec's "36 chars" is a VISUAL-column width. If you pad by Python `len()` / code points, the right border `║` drifts because color emoji (🟡 🎯 📘 ⚙️ 🧠 🚨 ✅ ⏳) are supplementary-plane (U+1Fxxx) and count as 2 UTF-16 code units → 2 monospace columns.

**Doc proof:** https://core.telegram.org/api/entities — *"Entity length ... number of UTF-16 code units ... Code points in all other planes count as 2."*

**Fix:** pad by **display width**, never by string length. Use `scripts/render_card.py` — it computes per-char width (BMP=1, supplementary=2, variation selector U+FE0F=0) and emits a card where every bordered line is exactly **38 visual columns** (36 inner + 2 `║` borders). See `references/telegram-entities.md`.

## Verification
Run `python scripts/render_card.py` — it prints the demo card and asserts `ALL_38_WIDE: True`. Trust display width, NOT `len()`. If any bordered line's display width ≠ 38, padding is wrong.

## Connector call shape
```json
{
  "connection_id": "std_01kvw4jkcbekyr1t33vs4p5e9w",
  "connector_id": "telegram",
  "method": "POST",
  "path": "/sendMessage",
  "reason_for_call": "Notificar admin da ação X",
  "body": { "chat_id": 1901426549, "parse_mode": "HTML", "text": "<pre>...card inteiro...</pre>" }
}
```

## References / templates
- `references/telegram-entities.md` — condensed excerpt of the UTF-16 entity-length rule.
- `templates/card-template.txt` — empty v1.2 template to fill.
- `scripts/render_card.py` — reusable renderer + verifier (pad by display width).

## Pitfalls
- **Bot profile photo (`setMyProfilePhoto`):** the API changed — it now requires the `InputProfilePhoto` JSON type (`{type:"static", photo:"attach://<name>"}`) plus a separate `.JPG` uploaded in the same multipart. A plain `-F "photo=@file.png"` returns 400 "photo isn't specified". Recipe + root cause: `references/bot-profile-photo.md`.
- `web_extract` BLOCKS `core.telegram.org` ("Website Not Supported"). Fetch docs with `curl` in terminal instead.
- `vision_analyze` may 403 (org OAuth not allowed) — you often CANNOT see the user's screenshot. Verify alignment by display-width calc, not by eyeballing a render you can't see.
- Do not check alignment with `len()` — it counts code points (emoji=1), which is wrong for Telegram columns.

## Disciplina do Pivete (correção aplicada 23/07/2026)
- **Não propor mudança sem PROVA real.** Pivete corrigiu na sessão: "você
  não está usando a Lupa". Antes de concluir qualquer veredito ou sugerir
  alteração de config/modelo/estado (ex.: "só troca o modelo"), aplicar o
  Gate de Falsificação (Técnica da Lupa Premium §8) e RODAR a chamada real
  de teste. Verde não é prova; status de erro (ex.: 403) não é veredito.
- **Card fora do padrão = defeito.** Toda notificação relevante DEVE vir no
  `<pre>` do PADRAO-CARD-HERMES v1.2. Markdown proporcional solto quebra a
  regra inviolável #1 do spec — o Pivete rejeita.
- **Investigação paralela quando há >1 frente:** disparar
  `delegate_task(tasks=[A,B])` (cada um independente) e acompanhar pelos
  `live_transcripts`, em vez de serializar. Padrão validado nesta sessão
  (Agente A comparou paths do Desktop; Agente B debugou o 403 de visão em
  paralelo). Ver skill `background-output-log`.
- **Env de visão:** `vision_analyze` em modelo text-only cai no auxiliar
  `AUXILIARY_VISION_*`; se `AUXILIARY_VISION_MODEL` vier vazio do processo,
  dá 403 OAuth. A env vem do PROCESSO/launcher (confirmado: 0 ocorrências
  em `.env`/`config.yaml`), não do `.env`. Corrigir no launcher do Hermes
  Home/gateway ou variável de sistema Windows. Detalhe em
  `background-output-log` → `references/parallel-investigation-example.md`.
