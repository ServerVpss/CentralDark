---
title: "Decisões CentralDark"
date: 2026-06-29
tags: ["decisoes", "arquitetura", "operacional", "historico"]
updated: 2026-06-29
---

# 📌 DECISÕES — CentralDark

## Decisões consolidadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-06 | GitHub é fonte da verdade | Evita divergência entre VPS, chat e arquivos locais |
| 2026-06 | VPS não é staging permanente | Mudança real precisa voltar para o repo oficial |
| 2026-06 | Espelho `segredounlock/clone-deck` é backup passivo | Não deve executar Actions, deploy, PM2 ou secrets |
| 2026-06 | Obsidian recebe via Git | IA não acessa PC local; GitHub faz a ponte segura |
| 2026-06 | Auto push do Obsidian desligado | Evita commit local acidental no repo principal |
| 2026-06 | Respostas técnicas em bloco copiável | Facilita uso pelo Pivete e reduz erro de copiar comando |
| 2026-06 | Não mexer no CRM agora | Prioridade é organizar VPS e módulos sem quebrar produção |
| 2026-06 | Ações sensíveis exigem confirmação | Protege produção, domínio, banco, Caddy, WhatsApp e secrets |

---

## Regra central

```txt
Chat não é fonte de verdade.
Decisão importante precisa virar doc, pendência, relatório, commit ou painel.
```

---

## Padrão para novas decisões

```txt
Data:
Decisão:
Motivo:
Impacto:
Arquivos afetados:
Como validar:
```

---

## Decisão sobre o Obsidian

A automação correta é:

```txt
IA escreve no GitHub
      ↓
GitHub guarda como fonte oficial
      ↓
Obsidian Git puxa no PC local
      ↓
Pivete navega no vault
```

Não tentar escrever direto em `E:\` pelo MCP/VPS, porque o Obsidian roda no Windows local e o MCP roda em ambiente remoto/Linux.

---

## Autoria local recomendada

```txt
Author name: SegredoiDev
Author email: segredounlock@users.noreply.github.com
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
