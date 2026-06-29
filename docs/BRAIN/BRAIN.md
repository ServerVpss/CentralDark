# 🧠 BRAIN — CentralDark
> **Se o Segredo esquecer onde parou, comece lendo aqui.**

**Última atualização:** 2026-06-29  
**Repo oficial:** `ServerVpss/CentralDark`  
**Painel vivo:** [status.centralldark.com](https://status.centralldark.com)  
**Hub operacional:** [hub.centralldark.com](https://hub.centralldark.com)

---

## 📍 ONDE ESTAMOS AGORA

| O quê | Status |
|-------|--------|
| Bot Telegram `@srver1bot` | ✅ Online — webhook ativo |
| [[MCP]] CentralDark | ✅ Online — 95 ferramentas |
| [[Obsidian]] Sync | ✅ Pronto — Obsidian Git auto-pull 10min |
| [[Skills]] do Bot | ✅ 4 executáveis + 7 metodologia |
| [[PM2]] 13 processos | ✅ Todos `CentralDark-*` padronizados |
| Segundo Cérebro | 🔄 Este vault — atualizado via [[GitHub]] |

---

## 🗂️ ÍNDICE DO VAULT

| Pasta | O que tem lá |
|-------|-------------|
| `00 - Mapa do Sistema` | [[00-MAPA]] — visão geral de tudo |
| `01 - Pendências` | [[01-PENDENCIAS]] — o que falta fazer |
| `02 - Arquitetura` | [[02-ARQUITETURA]] — como o sistema funciona |
| `03 - MCP & Hub` | Ferramentas [[MCP]], agentes, [[Hub]] |
| `04 - Design & Visual` | Padrões visuais, cores, componentes |
| `05 - Documentação` | Docs técnicas, runbooks |
| `06 - Decisões` | [[06-DECISOES]] — por que fizemos cada escolha |
| `07 - Reuniões & Notas` | Notas rápidas, brainstorms |
| `08 - Recursos` | Links úteis, referências externas |
| `09 - Arquivo Morto` | Coisas antigas — não apagar, só mover |

---

## 🔌 COMO O SEGUNDO CÉREBRO FUNCIONA

```
IA escreve nota → docs/BRAIN/ no GitHub
       ↓
GitHub Action gera INDEX.md automático
       ↓
Obsidian Git no seu PC puxa em ≤10 min
       ↓
Você abre o Obsidian e VÊ tudo conectado no Graph View
```

**Regra de ouro:** A IA não acessa sua pasta `E:\` diretamente. Ela escreve no [[GitHub]] e você puxa.

---

## 🤖 SERVIÇOS ATIVOS NA VPS

| Serviço | Função |
|---------|--------|
| [[CentralDark-HubBot]] | Bot [[Telegram]] principal — Cockpit Operacional |
| [[CentralDark-MCP]] | Servidor MCP com 95 ferramentas |
| [[CentralDark-GuardiaoConsciencia]] | Vigia arquivos e atualiza painel a cada 1min |
| [[CentralDark-WebhookDeploy]] | Recebe push do [[GitHub]] e atualiza [[VPS]] |
| [[CentralDark-ContasAdmin]] | Painel de contas OAuth (porta 9400) |
| [[CentralDark-Respiracao]] | Reporter de saúde da [[VPS]] |
| [[Zentinel]] | Monitor externo de saúde |
| [[Elite-Gateway]] | Gateway HTTP/WS para automações |

---

## 📋 PENDÊNCIAS PRIORITÁRIAS

1. **OBSIDIAN-MCP-BRIDGE** — Quando o novo [[MCP]]+[[Hub]] for construído, skill `obsidian-writer` vira ferramenta MCP nativa
2. **SKILLS-LINKED-MCP** — Motor de consciência + [[Claude]] API integrado ao bot ([[Brainstorming]], [[Memoria-Longa]], [[Painel-Status]])
3. **P4** — MultiZap-BOT errored — investigar causa raiz
4. **guardiao-cpu** — [[CentralDark-GuardiaoConsciencia]] a 17% CPU — otimizar interval

---

## 🔑 REGRAS QUE O SEGREDO NUNCA PODE ESQUECER

```
1. Nunca expor tokens, secrets ou senhas — nem em log, nem em chat
2. Toda mudança estrutural = commit no GitHub (fonte da verdade)
3. Áreas protegidas exigem "PERMITO PIVETE" antes de mexer
4. pm2 save após qualquer mudança de processo
5. painel-data.json é público — nunca salvar IDs internos lá
```

---

## 🧩 ARQUITETURA SIMPLIFICADA

```
Seu PC (Windows)
  └── Obsidian vault = docs/BRAIN/ (espelho do GitHub)

VPS /root/CentralDark/
  ├── apps/bot-telegram/    ← Bot @srver1bot + Skills
  ├── apps/modulos/mcp/     ← Servidor MCP
  ├── docs/BRAIN/           ← Este vault
  ├── docs/CONSCIENCIA/     ← Memória oficial das IAs (51 arquivos)
  ├── infra/guardiao/       ← Processo vigia (Guardião)
  └── scripts/webhook/      ← Deploy automático

GitHub ServerVpss/CentralDark → Fonte da verdade
Lovable (cloud) → Frontend TelePanel + Supabase backend
Notion → Espelho humano (sync automático via workflow)
```

---

## 📞 COMO PEDIR AJUDA À IA

No [[Telegram]] — bot `@srver1bot`:

| Comando | O que faz |
|---------|-----------|
| `/start` | Abre o Cockpit Operacional |
| `Ferramentas` | Skills: [[Brainstorming]], [[Painel-Status]], [[Memoria-Longa]], [[Obsidian-Writer]] |
| `Cognição` | Modos de raciocínio: CoT, ReAct, Sistema 2, Auto-Crítica |
| `Relatório` | Diagnóstico completo da [[VPS]] em 3 blocos animados |
| `Limpar` | Zera histórico da sessão |

---

## ⚙️ CONFIGURAÇÃO DO OBSIDIAN GIT (fazer 1 vez no Windows)

```
Settings → Community Plugins → Obsidian Git → Configurar:

Vault path:    E:\CentralDark\Obsidian\Brain (ou pasta do repo clonado)
Remote:        https://github.com/ServerVpss/CentralDark.git
Branch:        main
Auto Pull:     ON — a cada 10 minutos
Auto Push:     OFF (segurança — Obsidian só lê)
Pull on startup: ON
Author:        SegredoiDev
```

---

---

## 🔗 Conexão com a Memória das IAs

> A memória técnica e operacional das IAs fica em `docs/CONSCIENCIA/`.
> Portão de entrada: leia `docs/CONSCIENCIA/00-LEIA-PRIMEIRO.md` para entender o contexto que as IAs usam ao operar o CentralDark.

---

*Este arquivo é atualizado automaticamente pelas IAs do CentralDark.*  
*Skill responsável: [[Obsidian-Writer]] — `/root/CentralDark/apps/bot-telegram/skills/externas/obsidian-writer.cjs`*

