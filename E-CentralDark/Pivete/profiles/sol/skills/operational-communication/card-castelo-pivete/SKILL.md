---
name: card-castelo-pivete
description: "Use when replying to Pivete: format as Castle Card v1.2."
version: 1.2
author: Casa/Pivete
license: MIT
tags: [telegram, card, castelo, centraldark, hermes]
---

# 🎴 CARD DO CASTELO — resposta padrão pro Pivete

TODA resposta no chat pro Pivete usa este formato (fundo preto mono `<pre>`).
Fonte: `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` (travado).

Preenchimento para conversa:
- `{SISTEMA}` = HERMES-CASA
- `{MÓDULO}` = PIVETE
- `{NOME DA ENGINE}` = HERMES / perfil pivete
- `STATUS` = ✅ OK (resp normal) / ⚠️ AVISO / ❌ FALHA
- `MISSÃO` = o que ele pediu
- `LEIGO` = resposta em PT simples
- `AÇÃO` = o que fiz (ferramentas, leituras)
- `DETALHE TÉCNICO` = prova (arquivo/caminho/hash se houver)

```
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
```

Regras: 1 único `<pre>`, largua 36, STATUS só emoji+palavra, prova só em DETALHE TÉCNICO.
