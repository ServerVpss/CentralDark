---
name: strict-silence-loop
description: "Hermes reads .md as conversational script. 4-7-8 breathing guided by numeric inputs. Emotional circuit."
version: 1.0.0
author: Pivete (absorbed by SOL)
platforms: [linux, macos, windows]
---

# Strict Silence Loop

## Mecanismo

Hermes lê arquivo `.md` como script de máquina de estados.
Interação ponto a ponto: usuário envia número → Hermes responde conforme estado atual.

## Ativação

Usuário envia "1" ou "Iniciar Loop"
Hermes detecta arquivo → conduz interação

## Ciclo Respiratório 4-7-8

```
ESTADO 0 — Entrada
  Input: 1
  Output: Postura (coluna ereta, ombros relaxados, olhos fechados)
  → Input: 2

ESTADO 1 — Inspiração
  Input: 2
  Output: Nariz — 1... 2... 3... 4
  → Input: 3

ESTADO 2 — Retenção
  Input: 3
  Output: Pausa com foco no peito — 1... 2... 3... 4
  → Input: 4

ESTADO 3 — Expiração
  Input: 4
  Output: Boca — 1... 2... 3... 4... 5... 6... 7... 8
  → Input: 5

ESTADO 4 — Conclusão
  Input: 5
  Ciclo +1
  Se ciclo < 3: → volta ao estado 1 (input 2)
  Se ciclo >= 3: FOCO REFORÇADO atingido
```

## Aplicação

- Respiração consciente via Telegram
- Ciclo de 3 rotações para reforço
- Estado interno de calma antes de decisão

## Ouro extraído

Mecanismo reutilizável: qualquer `.md` com máquina de estados pode ser conduzido por Hermes → usuário.
