---
title: "STATUS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# HERMES — STATUS / NÍVEL / SKILLS

> Fonte da verdade do "onde o Hermes tá agora". Toda notificação Telegram no **privado do admin** DEVE anexar o bloco `<pre>` renderizado a partir daqui. **Canal público NÃO leva esse bloco** (só linha curta).

---

## 📈 Sistema de Nível

XP acumulado (soma dos +XP de cada AULA/BLOCO fechado).

| Nível | Título          | XP necessário |
|-------|-----------------|---------------|
| 1     | Aprendiz        | 0             |
| 2     | Escudeiro       | 50            |
| 3     | Operador        | 120           |
| 4     | Tático          | 220           |
| 5     | Estrategista    | 350           |
| 6     | Mestre de Guerra| 500           |
| 7     | Arquiteto       | 700           |
| 8     | Lenda           | 1000          |

## 🎯 Nível atual

- **XP total:** 180
- **Nível:** 3 — Operador
- **Próximo:** Tático (faltam 40 XP)

## 🛠️ Skills (0–100)

| Skill                       | Nível | Barra                                   |
|-----------------------------|-------|-----------------------------------------|
| Telegram (post/HTML/`<pre>`)| 85    | `▓▓▓▓▓▓▓▓▓░`                            |
| WebUI (restart/health)      | 70    | `▓▓▓▓▓▓▓░░░`                            |
| Arsenal Council (rotas)     | 75    | `▓▓▓▓▓▓▓▓░░`                            |
| Carga/baseline (curl 4v)    | 60    | `▓▓▓▓▓▓░░░░`                            |
| Debate + refino             | 80    | `▓▓▓▓▓▓▓▓░░`                            |
| Esmeralda (UI 3D)           | 55    | `▓▓▓▓▓░░░░░`                            |
| Aprendizados/rastro         | 90    | `▓▓▓▓▓▓▓▓▓░`                            |
| Auto-diagnóstico            | 45    | `▓▓▓▓░░░░░░`                            |

## 📝 Como atualizar

Após cada AULA/BLOCO fechado:
1. Somar `+XP` do bloco ao total.
2. Recalcular nível pela tabela.
3. Bumpar skill(s) tocada(s) no bloco (+5 a +10).
4. Regerar bloco `<pre>` (ver template abaixo) e anexar no card admin.

## 📦 Template `<pre>` (só admin)

```html
<pre>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 HERMES · Nv.3 Operador · 180 XP
Próx: Tático (▓▓▓▓▓▓▓▓░░ 40 XP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Telegram      ▓▓▓▓▓▓▓▓▓░ 85
WebUI         ▓▓▓▓▓▓▓░░░ 70
Arsenal       ▓▓▓▓▓▓▓▓░░ 75
Carga 4v      ▓▓▓▓▓▓░░░░ 60
Debate/refino ▓▓▓▓▓▓▓▓░░ 80
Esmeralda     ▓▓▓▓▓░░░░░ 55
Rastro/apr.   ▓▓▓▓▓▓▓▓▓░ 90
Auto-diag.    ▓▓▓▓░░░░░░ 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
</pre>
```

> Regra: bloco vai SEMPRE colado no fim do card admin, depois do "PRÓXIMO PASSO". No canal público, jamais.
