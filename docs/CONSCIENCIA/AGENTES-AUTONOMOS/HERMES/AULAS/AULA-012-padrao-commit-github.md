---
title: "AULA 012 Padrao Commit Github"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-012 — Padrão de commit GitHub (🧠 Hermes/PASTA: NNN título)

**Data:** 2026-07-03
**Categoria:** rota-fixa (git)
**Pré-requisitos:** nenhum
**Tempo estimado:** 2 min

## 1. O que é
Todo commit que toca em arquivo do Hermes (`docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/**`) segue formato visual fixo pra aparecer bonito e escaneável no feed do GitHub.

## 2. Formato

```
🧠 Hermes/<PASTA>: <NNN> <título curto>
```

- **🧠** — emoji cérebro (obrigatório, marca visual)
- **Hermes/** — prefixo fixo
- **PASTA** — uma de: `AULAS`, `APRENDIZADOS`, `ROTAS-FIXAS`, `DEBATES`, `EVOLUCAO`, `SUGESTOES`, `STATUS`
- **NNN** — número do arquivo (3 dígitos)
- **título curto** — máx ~50 chars, verbo no presente ou substantivo

## 3. Exemplos válidos
```
🧠 Hermes/APRENDIZADOS: 002 migra arsenal do velho pro novo
🧠 Hermes/DEBATES: 001 Gemini sugere AULA nova
🧠 Hermes/AULAS: 012 padrão commit github
🧠 Hermes/STATUS: bump XP +30 · Nv.3 Operador
🧠 Hermes/SUGESTOES: 001 pré-carregar graph
```

## 4. Exemplos INVÁLIDOS ❌
```
❌ update hermes files                  (sem emoji, sem pasta, sem número)
❌ fix                                  (sem contexto)
❌ 🧠 hermes: coisas                    (pasta e número faltando)
❌ Hermes/AULAS: 012 padrão…           (sem cérebro — perde marca visual)
```

## 5. Commits que tocam VÁRIAS pastas
Se possível, separar. Se não der:
```
🧠 Hermes: fecha Bloco 6 (STATUS+AULAS+APRENDIZADOS)
```

## 6. Commits que NÃO são do Hermes
Seguem o padrão geral do projeto (sem 🧠 nem prefixo `Hermes/`). O cérebro é a assinatura exclusiva do agente.

## 7. Armadilhas
- ❌ Esquecer o 🧠 → some no meio do feed.
- ❌ Título vago tipo "update", "fix", "wip".
- ❌ Numeração fora de ordem (sempre próximo livre da pasta).
- ❌ Prefixo em minúsculo (`hermes/…`) — case-sensitive visual.

## 8. Verificação
- Abrir feed do GitHub → todo commit do Hermes tem 🧠 rosa/cérebro visível.
- Consegue filtrar por `Hermes/AULAS` mentalmente sem abrir cada commit.

## 9. Ver também
- AULA-011 (loop mestre — registro sempre com rastro)
- STATUS.md (o próprio bump vira commit `🧠 Hermes/STATUS: …`)
