# Padrão Oficial de Notificação — Card Hermes v1.1.1

**Data:** 04/07/2026
**Autor original:** Fabler
**Refinamento:** Gemini (v1.1) + Fabler (v1.1.1)
**Responsável pela adoção:** Pivete
**Categoria:** Padrão de comunicação / notificação

---

## Regra

Toda notificação relevante (canal Status + admin) segue este template monoespaçado, enviado via edge function `notify-telegram` dentro de `<pre>...</pre>` (parse_mode HTML).

## Template canônico v1.1.1

```
╔════════════════════════════════════╗
║ 📡 [MÓDULO/SISTEMA]                ║
║ ▓▓▓▒▒▒  HERMES ENGINE v1.1  ▒▒▒▓▓▓ ║
╚════════════════════════════════════╝
STATUS: [✅ OK / ⚠️ AVISO / ❌ FALHA]

🧭 MISSÃO: [Título curto]
🎯 FASE:   [Fase atual] -> [O que falta]

📘 LEIGO: [Impacto direto ao usuário]
⚙️ AÇÃO:  [O que foi executado]

📊 PROGRESSO
NÍVEL: [▰▰▰▱▱▱▱▱▱▱] Lv.X
XP:    [████████░░] atual/próximo_nível

🧠 SKILLS UP
• [Skill]: +X XP (Lv.N)

──────────────────────────────────────
🛠️ DETALHE TÉCNICO (PROVA)
[Commits / arquivos / SQL — só dados verificáveis]
──────────────────────────────────────
```

## Regras de preenchimento

| Campo | Regra |
|-------|-------|
| STATUS | Só `✅ OK`, `⚠️ AVISO` ou `❌ FALHA`. Nada de "parcial", "quase" etc. |
| FASE | Formato `Atual -> Próximo passo`. Se nada falta, `Concluído`. |
| LEIGO | 1 frase, linguagem comum, foco em impacto. |
| AÇÃO | Verbo no particípio (`Aplicado GRANT...`, `Registrado arquivo...`). |
| XP | `atual/necessário_pro_próximo_nível`, nunca genérico. |
| PROVA | Só dados verificáveis (hash de commit, path de arquivo, comando SQL). Sem narrativa. |

## Mapeamento pro payload `notify-telegram`

```json
{
  "origem": "modulo",
  "tipo": "sucesso|aviso|erro|info|sistema",
  "titulo": "Título curto (usado no push do Telegram)",
  "parse_mode": "HTML",
  "mensagem": "<pre>...template preenchido...</pre>",
  "metadata": { "fase": N, "padrao": "hermes-v1.1.1" }
}
```

## Histórico

- **v1.0** (04/07/2026) — Fabler criou template original com skills check em tabela.
- **v1.1** (04/07/2026) — Gemini enxugou: STATUS no topo, largura 36 chars, PROG% opcional.
- **v1.1.1** (04/07/2026) — Fabler validou e refinou: XP com "atual/próximo", PROVA só verificável.

## Referências cruzadas

- `docs/CONSCIENCIA/DNS-WILDCARD-CENTRALLDARK.md` — primeiro card no padrão
- Regras Core `mem://index.md`: **Placar uniforme** + **Método Gamificado**
- Canal oficial: edge function `notify-telegram` (HUB `notifications_log`)
