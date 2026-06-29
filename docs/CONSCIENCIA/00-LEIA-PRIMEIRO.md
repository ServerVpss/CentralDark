# 00 — Leia primeiro (portão de entrada para IAs)

---
title: "Portão de Entrada — Memória das IAs"
date: 2026-06-29
tags: ["navegacao", "obrigatorio", "ia"]
updated: 2026-06-29
---

Esta pasta é a **memória operacional** de qualquer IA/agente que trabalha com o projeto **CENTRAL DARK**. Antes de propor ou executar qualquer mudança, leia os arquivos abaixo na ordem indicada.

> **Memória só conta se está no Git.** Nada — regra, decisão, aprendizado ou pendência — existe se está apenas em memória volátil de sessão. Tudo que precisa sobreviver entre sessões fica aqui em `docs/CONSCIENCIA/` ou em `docs/BRAIN/`. Git é a fonte da verdade.

---

## 🔗 Conexão com o Vault do Pivete

> O vault visual do Pivete (Obsidian) fica em `docs/BRAIN/`.
> Mapa de entrada: leia `docs/BRAIN/BRAIN.md` para entender o estado atual dos projetos, pendências e serviços.

---

## 📋 Tabela de roteamento — onde cada tipo de nota vai

| Se for sobre... | Vai para |
|----------------|---------|
| Ideia pessoal, pensamento, reunião | `docs/BRAIN/07 - Reuniões & Notas/` |
| Devedor, contato, financeiro | `docs/BRAIN/06 - Devedores & Contatos/` |
| Decisão técnica tomada | `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` |
| Aprendizado sobre o bot Telegram | `docs/CONSCIENCIA/APRENDIZADOS.md` (seção Bot) |
| Aprendizado sobre infra/VPS/PM2 | `docs/CONSCIENCIA/APRENDIZADOS.md` (seção Infra) |
| Regra operacional nova | `docs/CONSCIENCIA/02-PERMISSOES.md` ou novo arquivo numerado |
| Retomada de sessão IA | `docs/CONSCIENCIA/RETOMADA-*.md` |
| Tutorial para o Pivete | `docs/BRAIN/05 - Documentacao/` |
| Estado atual dos serviços | `docs/BRAIN/01-PENDENCIAS.md` (consultivo) |

> **Regra de ouro:** se não souber onde gravar, grave em `docs/CONSCIENCIA/APRENDIZADOS.md` com tag `#pendente-classificar`.

---

## Ordem de leitura obrigatória

1. `docs/CONSCIENCIA/01-IDENTIDADE.md` — quem você é, tom, idioma
2. `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` — padrão ativo de resposta, PT-BR obrigatório, gatilhos `#reloade`/`#atualiza memoria` e bloco da primeira conexão MCP
3. `docs/CONSCIENCIA/02-PERMISSOES.md` — o que pode/não pode fazer sem perguntar
4. `docs/CONSCIENCIA/03-FLUXO-DEPLOY.md` — como código vai pra produção
5. `docs/CONSCIENCIA/04-ESTRUTURA-VPS.md` — onde mora cada coisa na VPS
6. `docs/CONSCIENCIA/05-SSH-VPS.md` — como conectar na VPS sem quebrar a chave
7. `docs/CONSCIENCIA/06-MCP-CENTRALDARK.md` — o MCP que te dá acesso
8. `docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md` — fontes únicas da verdade
9. `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` — decisões grandes já tomadas
10. `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` — snapshot vivo (atualizado a cada 6h)
11. `docs/CONSCIENCIA/10-FALLBACK-LOVABLE.md` — **CRÍTICO**: como sincronizar Lovable↔GitHub quando o sync nativo falha (funciona em qualquer conta nova)
12. `docs/PENDENCIAS.md` — lista oficial de pendências do projeto

## Memória privada (na VPS, ler via SSH MCP)

Depois dos arquivos do repo, leia também:

- `<caminho-vps>`
- `<caminho-vps>`
- `<caminho-vps>`

## Por que essa memória existe

ChatGPT esquece tudo entre conversas. Mas como o MCP CentralDark tá conectado em você, dá pra reler esses arquivos no começo de cada conversa nova — e aí você sempre vai ter o contexto completo, alinhado ao repo oficial `ServerVpss/CentralDark`.

**Regra de ouro:** se a informação não tá em algum desses arquivos, ela não existe. Não invente.
