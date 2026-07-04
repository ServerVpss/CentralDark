# 🎴 PADRÃO CARD HERMES — v1.3 (OFICIAL)

> **Status:** ✅ APROVADO E TRAVADO
> **Autoria:** Fabler (v1.0) + Gemini (v1.1) + Fabler (v1.1.1) + Fabler+Gemini (v1.2) + Fabler+Gemini (v1.3)
> **Validado por:** Pivete em 04/07/2026
> **Regra dura:** TODA ação relevante do sistema DEVE mandar esse card. Nada de aviso solto, nada fora do padrão.

---

## 🔒 Regras invioláveis

1. **TUDO dentro de UM único `<pre>...</pre>`.** Nada de texto fora.
2. **Envio pelo connector Telegram** (`sendMessage`), NUNCA pelo `notify-telegram`.
   - Bot: `@srver1bot` · `connection_id`: `std_01kvw4jkcbekyr1t33vs4p5e9w` · `connector_id`: `telegram`
   - Admin: `1901426549` (secret `TELEGRAM_ADMIN_CHAT_ID`) · Canal status: `-1003669176367` (`TELEGRAM_STATUS_CHANNEL_ID`)
   - `parse_mode`: `"HTML"`
3. **Largura fixa:** 36 caracteres.
4. **STATUS só emoji + palavra:** `✅ OK` / `⚠️ AVISO` / `❌ FALHA`. Nunca misturar prova técnica com status.
5. **Prova técnica só em `🔧 DETALHE TÉCNICO`.**
6. **Barras normalizadas:** 0–100 sempre em 10 blocos fixos (`▓░`), com **% no final** (ex.: `▓▓▓▓▓▓▓░░░ 70%`).
7. **Linha "Próx:" nunca quebra** — se não couber, encurta o título.

---

## 🧩 Template canônico v1.3

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
  NÍVEL: ▓▓▓▓▓▓▓▓░░ 80%
  XP:    ▓▓▓▓▓▓▓▓▓▓ 320/320

🧠 HERMES · Nv.{N} {Título} · {XP} XP
   Próx: {Título} (faltam {Z} XP)

📊 SKILLS (por sistema)
  Telegram    ▓▓▓▓▓▓▓▓░░ 85%
  WebUI       ▓▓▓▓▓▓▓░░░ 70%
  Arsenal     ▓▓▓▓▓▓▓▓░░ 75%
  Esmeralda   ▓▓▓▓▓░░░░░ 55%
  Aprendizad  ▓▓▓▓▓▓▓▓▓░ 90%
  Auto-diag   ▓▓▓▓░░░░░░ 45%

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

## 📞 Como chamar

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

## 🚫 O que NÃO fazer

| Erro | Motivo |
|---|---|
| Texto/título fora do `<pre>` | Vira letra proporcional, quebra o monoespaçado |
| Usar `notify-telegram` | Exige `NOTIFY_API_KEY` e retorna 401 |
| Barra sem % | Perde leitura rápida (regra v1.3) |
| Barra com tamanho variável | Sempre 10 blocos normalizados |
| Misturar hash de commit no `STATUS` | Prova só em `DETALHE TÉCNICO` |
| Postar em `@SEGREDOPUXADASBOT` | Aquele é do TelePainel, não Central |

---

## 📜 Histórico

- **v1.0** (Fabler) — estrutura base
- **v1.1** (Gemini) — largura 36, STATUS no topo
- **v1.1.1** (Fabler) — XP atual/total, PROVA só verificável
- **v1.2** (Fabler+Gemini) — TEMPO, BLOQUEIOS, PRÓXIMO PASSO, RESPONSÁVEL, PRIORIDADE, LOG ID, TAGS
- **v1.3** (Fabler+Gemini) — `HERMES Nv/Próx`, bloco `SKILLS por sistema` com barras normalizadas 10 blocos + `%`

---

**Este arquivo é a fonte da verdade. Qualquer IA/agente lê isso antes de mandar card no Telegram.**
