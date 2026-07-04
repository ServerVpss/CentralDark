# Padrão Oficial de Notificação — Card Hermes (monoespaçado)

**Data:** 04/07/2026
**Autor original:** Fabler (via elite_gateway_chat)
**Responsável pela adoção:** Pivete
**Categoria:** Padrão de comunicação / notificação

---

## Regra

Toda notificação relevante (Telegram admin + canal Status) usa este template monoespaçado, enviado dentro de `<pre>...</pre>` pro Telegram renderizar em mono. Nunca misturar prova técnica na coluna de status — provas vão nas seções específicas.

## Template oficial

```
╔══════════════════════════════════════╗
║ 📡 [TIPO DE MISSÃO / NOTIFICAÇÃO]    ║
║ ▓▓▓▒▒▒ HERMES INTERFACE v1.0 ▒▒▒▓▓▓  ║
╚══════════════════════════════════════╝

🧭 MISSÃO: [TÍTULO]
🎯 ÍCONE: [🔧/⚔️/🧠/📦/📡]

──────────────────────────────────────

📘 LEIGO (resumo simples):
> [linguagem comum]

⚙️ AÇÃO:
> [o que foi/precisa ser feito]

📤 SAÍDA:
> [resultado / efeito]

──────────────────────────────────────

📊 STATUS OPERACIONAL

NÍVEL:     [▰▰▰▱▱▱▱▱▱▱] Lv. X
XP:        [████████░░] XXX / YYY

PROGRESSO GERAL:
[▓▓▓▓▓▓▓▓░░░░░░░░░░░░] XX%

──────────────────────────────────────

🧠 SKILLS CHECK

| SKILL            | NÍVEL | PROGRESSO   |
|------------------|-------|-------------|
| [Skill A]        | Lv X  | ▓▓▓▓▓░░░░░  |
| [Skill B]        | Lv X  | ▓▓▓░░░░░░░  |

──────────────────────────────────────

📡 STATUS FINAL:
> [OK / PENDENTE / EM EXECUÇÃO / FALHA / AGUARDANDO INPUT]
```

## Como enviar via `notify-telegram`

- Colocar o card completo dentro de `mensagem`, envolvido por `<pre>...</pre>` (HTML mode).
- `titulo` = título curto sem monoespaçamento (pra push).
- `tipo` = `sucesso | aviso | erro | info | sistema` conforme cor/emoji.
- Prova técnica (commits, arquivos, GRANTs) sempre em bloco separado dentro da seção AÇÃO ou SAÍDA — nunca colada em linhas de status.

## Referências cruzadas

- `docs/CONSCIENCIA/DNS-WILDCARD-CENTRALLDARK.md` — primeiro card enviado nesse padrão
- Regra Core `mem://index.md`: **Placar uniforme** + **Método Gamificado**
- Canal oficial: edge function `notify-telegram` (grava em `notifications_log` do HUB)
