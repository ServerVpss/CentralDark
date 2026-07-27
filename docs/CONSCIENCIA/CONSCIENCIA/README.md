---
title: "CONSCIENCIA — Memória Operacional das IAs"
date: 2026-06-29
tags: ["consciencia", "memoria", "ia", "operacional", "regras"]
updated: 2026-06-29
---

# docs/CONSCIENCIA/

Memória eterna do agente ChatGPT (Custom GPT "CentralDark Consciência").

## O que é

Pasta lida automaticamente pelo Custom GPT no começo de cada conversa, via MCP CentralDark. Substitui a falta de memória persistente do ChatGPT entregando o contexto completo em arquivos versionados.

## Arquivos

- `00-LEIA-PRIMEIRO.md` — índice + ordem de leitura
- `01-IDENTIDADE.md` — quem o agente é, tom, idioma
- `02-PERMISSOES.md` — o que pode/não pode sem perguntar
- `03-FLUXO-DEPLOY.md` — como código chega na produção
- `04-ESTRUTURA-VPS.md` — onde mora cada coisa
- `05-SSH-VPS.md` — como conectar na VPS
- `06-MCP-CENTRALDARK.md` — info do MCP
- `07-PENDENCIAS-E-HORARIO.md` — fontes únicas
- `08-HISTORICO-DECISOES.md` — decisões grandes
- `09-ESTADO-ATUAL.md` — snapshot vivo (auto-atualizado a cada 6h)
- `CUSTOM-GPT-SETUP.md` — passo a passo pra criar o GPT
- `PLANO.md` — o que falta nessa pasta

## Como atualizar

Edita o arquivo, commita na main. Próxima conversa do Custom GPT já lê a versão nova.

`09-ESTADO-ATUAL.md` é atualizado automaticamente pelo workflow `.github/workflows/atualiza-memoria-consciencia.yml`.
