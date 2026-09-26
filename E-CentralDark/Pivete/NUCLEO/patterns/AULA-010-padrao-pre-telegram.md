# PADRAO - AULA-010-padrao-pre-telegram.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\AGENTES-AUTONOMOS\HERMES\AULAS\AULA-010-padrao-pre-telegram.md
**SHA:** e02539612a879e8a
**Timestamp:** 2026-08-28T02:56:50.501771
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- PRÓXIMA DECISÃO: fechar baseline authed.

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "AULA 010 Padrao Pre Telegram"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-010 — Padrão `<pre>` Telegram (admin vs canal)

**Data:** 2026-07-03
**Categoria:** rota-fixa (visual)
**Pré-requisitos:** AULA-003
**Tempo estimado:** 3 min

## 1. O que é
Toda mensagem Telegram do Hermes vai em HTML com corpo dentro de `<pre>…</pre>` (fundo preto monoespaçado). Muda só o **conteúdo por destino**, nunca o wrapper.

## 2. Quando usar
Sempre. Post no admin, post no canal, notificação de erro, alerta de deploy, ping de saúde — tudo em `<pre>`.

## 3. Como fazer (passo-a-passo)

### 3.1 Payload base
```json
{
  "chat_id": <destino>,
  "parse_mode": "HTML",
  "text": "<pre>...</pre>"
}
```

### 3.2 Destinos
| Destino | chat_id | Formato | Bloco nível/skills? |
|---|---|---|---|
| Admin privado | `1901426549` | Card AULA-006 completo | ✅ SIM (no fim) |
| Canal Status | `-1003669176367` | 1–3 linhas curtas | ❌ NUNCA |

### 3.3 Endpoint
```
POST https://connector-gateway.lovable.dev/telegram/sendMessage
Headers:
  Authorization: Bearer $LOVABLE_API_KEY
  X-Connection-Api-Key: $TELEGRAM_API_KEY
```

## 4. Exemplos prontos

### Canal (curto)
```json
{"chat_id":-1003669176367,"parse_mode":"HTML","text":"<pre>🔥 Bloco 6 fechado · WebUI 200 · Arsenal 100%</pre>"}
```

### Admin (card + bloco de nível)
```html
<pre>
┌─ BLOCO 6 FECHADO ─── [+30 XP] ──┐
Placar: ▓▓▓▓▓▓▓▓▓▓ 100%
LEIGO: WebUI voltou a responder.
TÉCNICO: docker restart open-webui → HTTP 200 em 8s.
PRÓXIMA DECISÃO: fechar baseline authed.
└──────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 HERMES · Nv.3 Operador · 210 XP
Próx: Tático (▓▓▓▓▓▓▓░░░ 10 XP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WebUI         ▓▓▓▓▓▓▓▓░░ 80
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
</pre>
```

## 5. Armadilhas
- ❌ Esquecer `parse_mode: "HTML"` → sai texto puro sem monoespaço.
- ❌ Usar `<code>` em vez de `<pre>` → não pega fundo preto no mobile.
- ❌ Postar bloco de skills no canal → APR-009 violada.
- ❌ Escapar `<` `>` no meio (usar `&lt;` `&gt;` se precisar mostrar literal).

## 6. Verificação
- Resposta do gateway = `{"ok": true, "result": {...}}`
- No app: aparece com fundo escuro monoespaçado, alinhado.

## 7. Ver também
- APR-008 (canal também mono)
- APR-009 (nível só admin)
- ROTAS-FIXAS/notificacao-telegram.md
- AULA-003

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

```