---
title: "PADRAO CARD HERMES"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🎴 PADRÃO CARD HERMES — v1.2 (OFICIAL)

> **Status:** ✅ APROVADO E TRAVADO
> **Autoria:** Fabler (v1.0) + Gemini (v1.1) + Fabler (v1.1.1) + Fabler+Gemini (v1.2)
> **Validado por:** Pivete em 04/07/2026 — "agora sim foi direto pra meu privado, esse sim tá lindo"
> **Regra dura:** TODA ação relevante do sistema DEVE mandar esse card. Nada de aviso solto, nada fora do padrão.

---

## 🔒 Regras invioláveis

1. **TUDO dentro de UM único `<pre>...</pre>`.** Nada de texto fora. Sem título proporcional em cima. Sem rodapé fora do bloco. Nada.
2. **Envio pelo connector Telegram** (`sendMessage`), NUNCA pelo `notify-telegram` (aquele exige `NOTIFY_API_KEY` e falha).
   - Bot: `@srver1bot`
   - `connection_id`: `std_01kvw4jkcbekyr1t33vs4p5e9w`
   - `connector_id`: `telegram`
   - `chat_id` admin: `1901426549` (secret `TELEGRAM_ADMIN_CHAT_ID`)
   - `chat_id` canal status: `-1003669176367` (secret `TELEGRAM_STATUS_CHANNEL_ID`)
   - `parse_mode`: `"HTML"`
3. **Largura fixa:** 36 caracteres (moldura e separador).
4. **STATUS só emoji + palavra:** `✅ OK` / `⚠️ AVISO` / `❌ FALHA`. Nunca misturar prova técnica com status.
5. **Prova técnica só no bloco `🔧 DETALHE TÉCNICO`** — commits, arquivos, IDs, validadores.

---

## 🧩 Template canônico v1.2

```
<pre>
╔══════════════════════════════════╗
║  {SISTEMA} / {MÓDULO}            ║
║  {NOME DA ENGINE} v{X.Y.Z}       ║
╚══════════════════════════════════╝

STATUS:    ✅ OK
PRIORID:   🟡 Média
RESPONS:   @segredounlocker

🎯 MISSÃO: {frase curta}
📌 FASE:   {fase atual → próxima}
⏱  TEMPO:  {ex: 4m 12s}

📘 LEIGO
  {2 linhas em português simples}

⚙️  AÇÃO
  {o que foi feito, 2-4 linhas}

📊 PROGRESSO
  NÍVEL: [████████░░] Lv.{N}
  XP:    [██████████] {ganho}/{total}
  PROG:  {0-100}%

🧠 SKILLS UP
  • {Skill}  +{XP} XP (Lv.{N})
  • {Skill}  +{XP} XP (Lv.{N})

🚨 BLOQUEIOS
  {nenhum | descrição curta}

🎯 PRÓXIMO PASSO
  {1 linha objetiva}

────────────────────────────────────
🔧 DETALHE TÉCNICO (PROVA)
  Arquivo:  {caminho}
  Commits:  {hash} ({versão})
  Validad:  {quem validou}
  Log ID:   {uuid curto}
  Tags:     #dev #consciencia
</pre>
```

---

## 📞 Como chamar (o único jeito certo)

**Ferramenta:** `standard_connectors--call_gateway_connection`

```json
{
  "connection_id": "std_01kvw4jkcbekyr1t33vs4p5e9w",
  "connector_id": "telegram",
  "method": "POST",
  "path": "/sendMessage",
  "reason_for_call": "Notificar admin da ação X",
  "body": {
    "chat_id": 1901426549,
    "parse_mode": "HTML",
    "text": "<pre>...card inteiro aqui...</pre>"
  }
}
```

---

## 📨 REGRA DE CANAL: ADMIN ≠ GRUPO (OBRIGATÓRIO)

Nunca mandar o mesmo texto nos dois canais. Cada um tem formato próprio:

### 🔹 ADMIN (privado — `1901426549`)
**Público-alvo:** Pivete (leigo, precisa de gamificação)
**Formato:** Card `<pre>` completo com moldura, emojis, progresso, XP, skills, próximo passo
**Tom:** Gamificado, visual, didático — ele precisa ENTENDER o que aconteceu sem ler código
**Conteúdo obrigatório:**
- STATUS com emoji + palavra (`✅ OK` / `⚠️ AVISO` / `❌ FALHA`)
- PRIORIDADE + RESPONSÁVEL
- MISSÃO + FASE + TEMPO
- 📘 LEIGO (2 linhas em português simples)
- ⚙️ AÇÃO (o que foi feito)
- 📊 PROGRESSO (barra + XP)
- 🧠 SKILLS UP
- 🚨 BLOQUEIOS
- 🎯 PRÓXIMO PASSO
- 🔧 DETALHE TÉCNICO (prova)

### 🔸 GRUPO / CANAL STATUS (`-1003669176367`)
**Público-alvo:** IAs, bots, sistemas
**Formato:** Texto limpo, SEM `<pre>`, SEM moldura, SEM spoiler, SEM tags HTML visíveis
**Tom:** Seco, técnico, informativo — elas precisam do fato, não da apresentação
**Conteúdo:**
- `🤖 {SISTEMA} — {resumo em 1 linha}`
- Sem emojis decorativos, sem barras de progresso, sem XP
- No máximo 2 linhas

### ⚠️ Regra dura
- Toda ação relevante do sistema DEVE mandar **nos dois canais**
- Mas cada um com SEU formato — **nunca** o mesmo texto
- O `notify.mjs` do Hermes já implementa essa separação automaticamente

---

## 🚫 O que NÃO fazer (erros já cometidos)

| Erro | Motivo |
|---|---|
| Texto/título fora do `<pre>` | Vira letra proporcional, quebra o "fundo preto monoespaçado" |
| Usar `notify-telegram` | Exige `NOTIFY_API_KEY` no header e retorna 401 |
| Misturar hash de commit no `STATUS` | Polui coluna de status; prova vai só em `DETALHE TÉCNICO` |
| Postar em bot errado (`@SEGREDOPUXADASBOT`) | Aquele é do TelePainel, não Central |
| Card sem `PRÓXIMO PASSO` | Deixa Pivete sem saber o que vem a seguir |

---

## 📜 Histórico

- **v1.0** (Fabler) — estrutura base
- **v1.1** (Gemini) — largura 36, STATUS no topo
- **v1.1.1** (Fabler) — XP atual/total, PROVA só verificável
- **v1.2** (Fabler+Gemini) — TEMPO, BLOQUEIOS, PRÓXIMO PASSO, RESPONSÁVEL, PRIORIDADE, LOG ID, TAGS + regra "sempre notificar"

---

**Este arquivo é a fonte da verdade. Qualquer IA/agente lê isso antes de mandar card no Telegram.**
