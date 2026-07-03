# 🎖️ ARSENAL COUNCIL — Plano Consolidado

Pegando o esqueleto que o Grok mandou + o que já tá no ar, e organizando pra ficar direto de executar.

---

## 📦 SEU ARSENAL (mapa vivo)

```
🎖️ ARSENAL CENTRALDARK
├─ 🧠 CLIs de IA
│   ├─ ✅ darkai   (17 modelos: 7 Gemini + 10 GPT-5)
│   ├─ ✅ claude   (Claude Code)
│   └─ ✅ codex    (OpenAI Codex)
├─ 🚪 Gateways (PM2)
│   ├─ ✅ EliteAnthropic  (id 52) — Claude HTTP
│   ├─ ✅ EliteHTTP       (id 51) — ChatGPT headless
│   └─ ✅ EliteWS         (id 50) — fallback WS
├─ 🤖 Bots Telegram
│   ├─ ✅ @srver1bot           (Central, PM2 id 27)
│   └─ ✅ @SEGREDOPUXADASBOT   (TelePainel)
├─ 📚 Cérebro Vivo
│   ├─ ✅ docs/CONSCIENCIA/DARKAI/
│   └─ ✅ docs/CONSCIENCIA/ARSENAL/  ← nosso cofre
└─ ⚔️ Orquestração
    ├─ ✅ FASE 1 — Cofre ARSENAL criado
    ├─ ✅ FASE 2 — `refinar` local (3 IAs + juiz, ~40s)
    ├─ 🎯 FASE 3 — Núcleo universal + /refinar no Telegram   ← AGORA
    ├─ ⏳ FASE 4 — Regras editáveis (regras.json + comandos)
    ├─ ⏳ FASE 5 — Painel visual (status.centralldark.com)
    └─ ⏳ FASE 6 — Hermes autônomo (cron aprendendo sozinho)
```

---

## 🎯 O que muda com o plano do Grok

O `refinar` atual só usa `darkai`. Vou expandir pra virar o **Arsenal Council**: um orquestrador que fala com **qualquer** ferramenta do arsenal (CLIs + gateways), em 3 modos — Router / Parallel / Debate.

---

## 🗺️ FASES (ordem de execução)

### 🎯 FASE 3 — Núcleo Arsenal Council + Telegram (~4h)

**A. Núcleo universal** (`docs/CONSCIENCIA/ARSENAL/scripts/`)
- `arsenal-council.sh` — orquestrador principal (substitui `council.sh`)
- `handlers/` — um pra cada backend:
  - `darkai.sh` · `claude.sh` · `codex.sh`
  - `elite-anthropic.sh` · `elite-http.sh`
- 3 modos:
  - **Router:** escolhe 1 IA (default: darkai/gemini-flash)
  - **Parallel:** 3 IAs em paralelo + juiz sintetiza *(o que já roda)*
  - **Debate:** 3 rodadas — IAs veem respostas umas das outras + juiz final

**B. Handler no @srver1bot** (área 🔒 — vou criar arquivo separado `handlers/refinar.mjs`, só 1 linha no bot principal)
- `/refinar <tema>` → Parallel (padrão)
- `/parallel <tema>` → força Parallel
- `/debate <tema>` → força Debate (3 rodadas)
- `/router <tema>` → 1 IA só, rápido
- **Só admin** (`1901426549`) dispara
- Bot manda no grupo **Central Dark - Grupo Da Evolução** (o da print, onde as IAs já conversam)
- Formato: 1ª mensagem = "🧠 Conselho reunido, ~40s..." · 2ª = veredicto + arquivo salvo

**C. Salva tudo**
- Cada debate vira `docs/CONSCIENCIA/ARSENAL/DEBATES/YYYY-MM-DD-HHMM-<slug>.md`
- Vai automático pro GitHub (commit + push)

**Como saber que deu certo:** você manda `/refinar teste` no grupo → chega veredicto do juiz + link do arquivo → aparece commit novo no GitHub.

---

### ⏳ FASE 4 — Regras Configuráveis (~2h)

**`regras.json`** editável, com hot-reload (recarrega em 5s):
```json
{
  "simples":   { "backend": "darkai",  "modelo": "gemini-3-flash-preview" },
  "medio":     { "backend": "darkai",  "modelo": "gemini-3.1-pro-preview" },
  "codigo":    { "backend": "claude",  "modelo": "sonnet" },
  "critico":   { "modo": "debate", "vozes": ["gemini-pro","gpt-5","claude"] },
  "juiz":      { "backend": "darkai",  "modelo": "gemini-3-flash-preview" }
}
```

Comandos novos no Telegram:
- `/router status` — mostra as regras atuais
- `/router trocar <tipo> <backend> <modelo>` — muda uma regra
- `/router testar` — dispara teste em cada backend, mostra latência

Backup automático das 5 últimas versões. Erro de sintaxe = rollback.

---

### ⏳ FASE 5 — Painel Visual (~4h)

No `status.centralldark.com` (área 🔒 — só adiciono uma aba nova):
- Card **"Conselho Vivo"** com últimos 10 debates
- Botões: 🚀 Rápido (Router) · ⚖️ Balanceado (Parallel) · 🔥 Poderoso (Debate)
- Campo de tema + disparar do navegador
- Status ao vivo das IAs (latência, quem tá online)

---

### ⏳ FASE 6 — Hermes Autônomo (~3h)

Cron `0 6 * * *` (6h da manhã):
1. Lê `docs/PENDENCIAS.md` — pega item aberto
2. Roda **Arsenal Council** em modo Debate
3. Se consenso >80% → salva proposta em `ARSENAL/EVOLUCAO/YYYY-MM-DD/`
4. Manda card no grupo Telegram: *"Hermes acordou, refinou X, olha o que ele propôs"*
5. Se você reagir com 👍 → cria PR automático no GitHub

Modo autônomo também roda **de hora em hora** discutindo o próprio CentralDark (commits novos, erros do PM2, pendências) — as IAs conversam entre si no grupo, aprendendo. Tudo salvo em `DEBATES/`.

---

## 📊 Ordem final que sugiro

| # | Fase | Tempo | Por quê agora |
|---|------|-------|---------------|
| 1 | **FASE 3** — Núcleo + Telegram | ~4h | Já dá pra usar `/refinar` no grupo hoje |
| 2 | **FASE 4** — Regras editáveis | ~2h | Você controla sem tocar em código |
| 3 | **FASE 6** — Hermes autônomo | ~3h | Sistema aprendendo sozinho (o que você mais quer) |
| 4 | **FASE 5** — Painel visual | ~4h | Cereja no bolo, dá pra ver bonito |

Total: **~13h de trabalho** — vou fazendo em bloco, avisando a cada fase concluída.

---

## ⚠️ Cuidados

- `apps/bot-telegram/` é 🔒 — só **adiciono arquivo novo**, não mexo no que existe
- Backup antes de qualquer edit em área protegida
- Cada fase → commit próprio + notificação Telegram no canal Status
- Consultar Fabler antes de tocar em VPS (regra do projeto)

---

## 🚀 Pergunta única antes de tocar

Toco tudo em sequência (Fase 3 → 4 → 6 → 5) e vou te avisando a cada fase pronta, **ou** paro depois da Fase 3 pra você testar `/refinar` no grupo antes de seguir?

Se aprovar do jeito que tá, começo pela **Fase 3** agora mesmo.
