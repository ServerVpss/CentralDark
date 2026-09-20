---
title: "MAPA DOS BOTS — CentralDark"
date: 2026-06-30
tags: ["consciencia", "bots", "automacao", "mapa"]
updated: 2026-06-30T03:50:00-03:00
---

# Mapa dos Bots — quem faz o quê no CentralDark

> Feito pra quem não é técnico entender o fluxo sem se perder. Atualizar sempre que um bot novo entrar ou mudar de função.

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
      (NOVO hoje) commits no Git
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
  📨 Exemplo real de hoje: os 7 relatórios do
      elite-mapper sem cabeçalho — ele
      arrumou e commitou sem ninguém pedir
      (commit 0d9c11763)
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
  📨 Aparece no histórico como:
      "chore(painel): registrar push XXXXX"
```

```
╔══════════════════════════════════════════════╗
║  6. NOTION SYNC (GitHub Action)               ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo (cobertura TOTAL desde 30/06)
  👁️  O que faz: toda vez que docs/CONSCIENCIA
      ou docs/PENDENCIAS.md mudam, ele copia
      pro seu Notion — espelho pra você ler
      bonito, sem precisar abrir código
  📂 Agora cobre TODO documento novo da
      Consciência (inventário automático no
      database "Estrutura de Pastas & Agentes")
      — não precisa mais cadastrar à mão
  📨 Direção: GitHub → Notion (só nesse
      sentido — editar no Notion direto NÃO
      volta pro GitHub sozinho ainda)
```

```
╔══════════════════════════════════════════════╗
║  7. OBSIDIAN INDEX (GitHub Action)            ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo
  👁️  O que faz: regenera o índice (INDEX.md)
      do seu vault Obsidian automaticamente
      quando algo muda
```

```
╔══════════════════════════════════════════════╗
║  8. SENTINELA (GitHub Action)                 ║
╚══════════════════════════════════════════════╝
  ✅ Status: ativo
  👁️  O que faz: tira uma "foto" periódica do
      estado do projeto e avisa se algo
      ficou velho/parado (stale) ou
      divergente entre VPS e GitHub
```

---

## 💬 O bot que você conversa direto

```
╔══════════════════════════════════════════════╗
║  HUBBOT — @srver1bot no Telegram              ║
╚══════════════════════════════════════════════╝
  ✅ Status: online (PM2 id 27)
  👁️  O que faz: é o SEU terminal pelo Telegram
      — desde hoje, tem os mesmos poderes que
      eu tenho aqui (ler/escrever arquivo,
      rodar comando, chamar as 96 ferramentas
      do MCP)
  📲 Como usar: manda mensagem direto, ou
      "/terminal on" pro modo completo
```

---

## 🧠 A "ponte" que todo mundo usa (não é bot, é infraestrutura)

```
╔══════════════════════════════════════════════╗
║  MCP CENTRALDARK — porta 9100                 ║
╚══════════════════════════════════════════════╝
  ✅ Status: online, 96 ferramentas
  👁️  O que é: o "cardápio" de ações que
      qualquer IA conectada pode pedir —
      criar pendência, ler consciência,
      mexer no GitHub, etc
  🔒 Acesso: só com login (OAuth) — o
      endpoint público sem login foi
      REMOVIDO hoje por segurança

╔══════════════════════════════════════════════╗
║  ELITE PROXY — porta 8082                     ║
╚══════════════════════════════════════════════╝
  ✅ Status: online, v1.6.0
  👁️  O que é: a "tomada universal" — qualquer
      ferramenta (Open WebUI, Bolt) que fala
      formato OpenAI consegue usar os modelos
      Claude através dele
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
        ├──→ Notion Sync espelha pro Notion
        ├──→ Obsidian Index atualiza o vault
        └──→ Guardião DETECTA o commit (novo!)
                  │
                  ▼
             Guardião Analista decide
                  │
                  ▼
             Telegram avisa você
```

Em paralelo, o **Memory-Linker** roda em ciclos próprios (a cada 15-30min) arrumando a Consciência sozinho, e o **Guardião** vigia PM2/Docker/arquivos o tempo todo.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[09-ESTADO-ATUAL]] — estado técnico detalhado dos serviços
- [[PROTOCOLO-INICIALIZACAO]] — boot sequence de sessão IA
- [[11-MULTI-IA-FLUXO]] — papel de cada IA externa (Grok, ChatGPT, Codex)
- [[08-HISTORICO-DECISOES]] — decisões grandes registradas
- [[CONSCIENCIA]] — documento mestre
