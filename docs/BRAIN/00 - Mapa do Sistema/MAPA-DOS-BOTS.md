---
title: "Mapa dos Bots — CentralDark"
date: 2026-06-30
tags: ["bots", "automacao", "mapa", "sistema"]
---

# Mapa dos Bots — quem faz o quê no CentralDark

> Feito pra quem não é técnico entender o fluxo sem se perder. Cópia original (fonte oficial) em `docs/CONSCIENCIA/MAPA-DOS-BOTS.md` — atualizar os dois juntos.

---

## A ideia em 1 frase

Você fala com uma IA (eu, Gemini, ChatGPT). Ela mexe na VPS. Vários **robôs pequenos**, sem você precisar chamar, ficam de olho 24h, arrumando bagunça, avisando erro e guardando histórico — sozinhos.

---

## 🤖 Os bots que trabalham por conta própria (automáticos)

```
╔══════════════════════════════════════════════╗
║  1. GUARDIÃO DA CONSCIÊNCIA                   ║
╚══════════════════════════════════════════════╝
  ✅ Status: online (PM2 id 28)
  👁️  O que faz: fica de olho o tempo todo em
      4 coisas — arquivos da Consciência,
      processos PM2, containers Docker, e
      (NOVO 30/06) commits no Git
  📨 Pra onde manda: escreve um "bilhete" pra
      cada coisa que vê (fila/events.jsonl)
  🚫 NÃO decide nada sozinho — só avisa
```

```
╔══════════════════════════════════════════════╗
║  2. GUARDIÃO ANALISTA                         ║
╚══════════════════════════════════════════════╝
  ✅ Status: online (PM2 id 29)
  👁️  O que faz: lê os bilhetes que o Guardião
      escreveu, junta os repetidos, filtra o
      que não é importante
  📨 Pra onde manda: Telegram — só o que
      passou no filtro chega até você
  🧠 É o "bom senso" entre o Guardião (que vê
      tudo) e você (que não quer spam)
```

```
╔══════════════════════════════════════════════╗
║  3. MEMORY-LINKER (3 robôs em sequência)      ║
╚══════════════════════════════════════════════╝
  ✅ Status: rodando via agenda (cron), não PM2
  👁️  O que faz, em 3 passos, toda hora:
      1º (Scout) — varre a Consciência atrás
          de nota perdida, link quebrado,
          arquivo sem identificação
      2º (Analyst) — decide o que é grave e
          o que é simples de arrumar
      3º (Executor) — arruma sozinho o que é
          simples, E JÁ COMMITA no GitHub
  📨 Exemplo real: os 7 relatórios do
      elite-mapper sem cabeçalho — ele
      arrumou e commitou sem ninguém pedir
```

```
╔══════════════════════════════════════════════╗
║  4. WEBHOOK DEPLOY                            ║
╚══════════════════════════════════════════════╝
  ✅ Status: online (PM2 id 5)
  👁️  O que faz: toda vez que algo é commitado
      e enviado pro GitHub, ele PUXA essa
      mudança pra dentro da VPS sozinho
  📨 Pra onde manda: notificação Telegram
      confirmando o deploy
```

```
╔══════════════════════════════════════════════╗
║  5. PAINEL AUTO-UPDATE (GitHub Action)        ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo (roda no GitHub, não na VPS)
  👁️  O que faz: toda vez que tem push novo,
      ele anota isso no painel público
      (status.centralldark.com)
```

```
╔══════════════════════════════════════════════╗
║  6. NOTION SYNC (GitHub Action)               ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo (cobertura parcial — ver nota)
  👁️  O que faz: toda vez que docs/CONSCIENCIA
      ou docs/PENDENCIAS.md mudam, ele copia
      pro seu Notion
  ⚠️  Só cobre 4 arquivos fixos hoje
      (REGRA-OFICIAL-*, 08-HISTORICO-DECISOES,
      APRENDIZADOS, PENDENCIAS). Documentos
      novos (como este) precisam ser
      cadastrados manualmente até a automação
      ser ampliada.
```

```
╔══════════════════════════════════════════════╗
║  7. OBSIDIAN INDEX (GitHub Action)            ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo
  👁️  O que faz: regenera o índice (INDEX.md)
      deste vault automaticamente quando algo
      muda
```

```
╔══════════════════════════════════════════════╗
║  8. SENTINELA (GitHub Action)                 ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo
  👁️  O que faz: tira uma "foto" periódica do
      estado do projeto e avisa se algo
      ficou velho/parado ou divergente entre
      VPS e GitHub
```

---

## 💬 O bot que você conversa direto

```
╔══════════════════════════════════════════════╗
║  HUBBOT — @srver1bot no Telegram              ║
╚══════════════════════════════════════════════╝
  ✅ Status: online (PM2 id 27)
  👁️  O que faz: é o SEU terminal pelo Telegram
      — desde 30/06, tem os mesmos poderes que
      a IA tem no terminal (ler/escrever
      arquivo, rodar comando, chamar as 96
      ferramentas do MCP)
  📲 Como usar: manda mensagem direto, ou
      "/terminal on" pro modo completo
```

---

## 🔗 Como eles se conectam (fluxo simplificado)

```
Você fala com uma IA (Claude/Gemini/ChatGPT)
        │
        ▼
   IA mexe na VPS (arquivo, código, config)
        │
        ▼
   commit + push pro GitHub
        │
        ├──→ Webhook Deploy puxa pra VPS
        ├──→ Painel Auto-Update anota no status
        ├──→ Notion Sync espelha (parcial)
        ├──→ Obsidian Index atualiza o vault
        └──→ Guardião DETECTA o commit
                  │
                  ▼
             Guardião Analista decide
                  │
                  ▼
             Telegram avisa você
```

---

## Conexões Rápidas

- [[00-POSTURA-PIVETE]] — quem é o Pivete
- [[IA]] — papel de cada IA externa
- [[CentralDark]] — projeto raiz
