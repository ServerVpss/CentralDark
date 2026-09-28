---
title: "Quando bate esse padrão ele chama

executorrunobsidian-"
date: 2026-09-24
tags: ["reuniões-&-notas"]
---

Quando bate esse padrão, ele chama:

executor.run("obsidian-writer", { op: "write", folder: "07 - Reuniões & Notas", ... })

A busca mostrou exatamente esse trecho chamando obsidian-writer e mandando para 07 - Reuniões & Notas.

2. [[Skill]] executora:
Arquivo: apps/bot-telegram/skills/externas/obsidian-writer.cjs

Essa skill é quem grava em docs/[[BRAIN]]/, injeta os [[links]], monta o caminho e dispara a notificação admin. A busca mostrou o próprio cabeçalho da skill obsidian-writer.

3. Mensagem “NOTA GRAVADA NO CÉREBRO”:
O texto do print vem de dentro do obsidian-writer.cjs, no notifyAdmin(...):

🧠 NOTA GRAVADA NO CÉREBRO

e junto manda:

📝 título
📁 pasta
🔗 links injetados
✅ Persistido no BRAIN do repositório
Caminho: docs/BRAIN/...

Isso bate exatamente com teu print.

4. Confirmação que aparece para você no [[Telegram]]:
Arquivo: apps/bot-telegram/unified-bot.cjs

Depois que a skill retorna r.message, o bot intercepta intent.skill === 'obsidian-writer' e responde:

✅ Gravado no cérebro!

antes de chamar LLM.

## Veredito

O gatilho real é:

consciousness.cjs → regex de gravação/anotação → obsidian-writer → notifyAdmin → unified-bot confirma

Nome operacional bom pra cristalizar:

BRAIN_NOTE_RECOGNITION_TRIGGER

ou no teu padrão:

!REGISTRA_CEREBRO

Estado:

CONFIRMADO no source: sim.
Executável na [[VPS]] agora: UNKNOWN, porque o Remote/VPS caiu antes da última prova runtime.
Print compatível com o código: sim, forte compatibilidade.