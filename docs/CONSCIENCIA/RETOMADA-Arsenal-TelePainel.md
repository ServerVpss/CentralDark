---
title: "RETOMADA — Tela Arsenal de Skills no TelePainel"
date: 2026-06-29
tags: ["retomada", "lovable", "telapainel", "skills", "frontend", "pendencia-A9"]
updated: 2026-06-29
---

# 🔖 RETOMADA — Tela Arsenal de Skills no TelePainel

> **Pendência:** A9 em `docs/BRAIN/01-PENDENCIAS.md`
> **Plataforma de execução:** Lovable (editor em centraldark.lovable.app)
> **Status:** Aguardando execução — contexto completo abaixo

---

## O que precisa ser feito

Criar uma tela/página no **TelePainel** (frontend React no Lovable) que exibe visualmente o Arsenal de 10 Skills do CentralDark em cards. O Pivete precisa ver isso no site, não só no Obsidian.

---

## Contexto do Sistema — Leia antes de mexer

### O TelePainel
- **URL publicada:** https://centraldark.lovable.app
- **Preview:** https://id-preview--85041dd2-d1da-4a30-acbc-50799ddf8668.lovable.app
- **Stack:** React 18 + Vite 5 + Tailwind v3 + TypeScript 5
- **Backend:** Supabase (Lovable Cloud) — projeto `kagejpghnwdfymddwxuf`
- **GitHub:** ServerVpss/CentralDark (sync bidirecional com Lovable)

### O Hub (bot Telegram)
- **Processo PM2:** CentralDark-HubBot (id 27)
- **Arquivo principal:** `/root/CentralDark/apps/bot-telegram/unified-bot.cjs`
- **Comando no bot:** `/arsenal` — já exibe a tabela de skills no Telegram
- **Comando no bot:** `/skills` — mostra skills executáveis carregadas
- **Skills executáveis reais:** `brainstorming`, `painel-status`, `memoria-longa`, `find-skills`, `obsidian-writer`

---

## As 10 Skills — Dados completos para os cards

| # | Nome Técnico | Apelido | Emoji | Categoria | O que faz |
|---|---|---|---|---|---|
| 1 | MEMORY-REGISTRAR | "Grava aí" / "Anota" | 🧠 | Memória | Registra ideia no lugar certo do vault |
| 2 | DECISION-RECORDER | "Registra a decisão" | 📌 | Memória | Grava decisão com motivo e data em 08-HISTORICO-DECISOES |
| 3 | GRAPH-INVESTIGATOR | "Detetive" / "Investiga o grafo" | 🔍 | Organização | Acha notas cinzas, isoladas e sem conexão no vault |
| 4 | SEMANTIC-LINKER | "Liga tudo" / "Conecta as notas" | 🔗 | Organização | Cria links inteligentes e semânticos entre notas |
| 5 | SWARM-INVESTIGADOR-GRAFO | "Audita tudo" / "Varredura geral" | 🕵️ | Organização | Auditoria profunda do vault inteiro com relatório |
| 6 | CODE-INVESTIGATOR | "Acha o bug" / "Investiga o código" | 🐛 | Código | Analisa código, encontra causa raiz e propõe fix |
| 7 | ARCHITECTURE-REVIEWER | "Revisa a arquitetura" / "Tá certo assim?" | 🏗️ | Código | Revisa estrutura técnica e aponta riscos |
| 8 | DAILY-REVIEWER | "Revisão do dia" / "Status do dia" | 📋 | Gestão | O que foi feito hoje, pendências, próximo foco |
| 9 | ISSUE-ANALYZER | "Analisa as issues" / "Tem aberto?" | 🐙 | Gestão | Triagem das issues abertas no GitHub |
| 10 | PROMPT-ENGINEER | "Forja" / "Melhora o prompt" | ✨ | Criação | Transforma texto solto em prompt de qualidade |

**Documentação de cada skill:** `docs/BRAIN/05 - Documentacao/AGENTS-LIBRARY/`

---

## Prompt pronto para colar no Lovable

```
Cria uma nova página chamada "Arsenal de Skills" no TelePainel.

Layout: grade de cards (2 colunas no mobile, 3-4 no desktop).
Tema: dark, consistente com o painel atual.

Cada card deve ter:
- Emoji grande no topo
- Nome amigável (apelido) em destaque
- Nome técnico menor abaixo
- Categoria como badge colorido (Memória = roxo, Organização = azul, Código = laranja, Gestão = verde, Criação = amarelo)
- Descrição curta do que faz

Os 10 cards:
1. 🧠 "Grava aí" (MEMORY-REGISTRAR) — Memória — Registra ideia no lugar certo
2. 📌 "Registra a decisão" (DECISION-RECORDER) — Memória — Grava decisão com motivo e data
3. 🔍 "Detetive" (GRAPH-INVESTIGATOR) — Organização — Acha notas isoladas e sem conexão
4. 🔗 "Liga tudo" (SEMANTIC-LINKER) — Organização — Cria links inteligentes entre notas
5. 🕵️ "Audita tudo" (SWARM-INVESTIGADOR) — Organização — Auditoria completa do vault
6. 🐛 "Acha o bug" (CODE-INVESTIGATOR) — Código — Encontra causa raiz e propõe fix
7. 🏗️ "Revisa a arquitetura" (ARCHITECTURE-REVIEWER) — Código — Revisa estrutura e aponta riscos
8. 📋 "Revisão do dia" (DAILY-REVIEWER) — Gestão — Resumo do dia, pendências, próximo foco
9. 🐙 "Analisa as issues" (ISSUE-ANALYZER) — Gestão — Triagem de issues do GitHub
10. ✨ "Forja" (PROMPT-ENGINEER) — Criação — Transforma texto em prompt de qualidade

Adiciona essa página ao menu de navegação do painel com o ícone ⚡.
```

---

## Regras para não quebrar o que existe

1. **Não mexer no backend Supabase** sem rodar `audit-rls` antes
2. **Não alterar** arquivos em `apps/bot-telegram/` — o bot está funcionando
3. **Sincronia 4-Point:** após criar no Lovable, verificar que o GitHub também atualizou
4. As skills listadas acima são **documentação** — não são skills executáveis no bot ainda (exceto as 5 mencionadas em "Hub")

---

## Verificação após implementar

- [ ] Página aparece no menu do TelePainel
- [ ] 10 cards renderizam corretamente
- [ ] Responsivo no mobile
- [ ] Cores por categoria corretas
- [ ] Link no GitHub atualizado (Lovable faz push automático)

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — tabela fonte das skills
- [[01-PENDENCIAS]] — pendência A9
- [[PROMPT-MASTER-CENTRALDARK]] — contexto geral do sistema para outras IAs
- [[MAPA-DO-CEREBRO]] — visão geral do sistema
