# Hermes Agent - Guia de Referência Operacional

**Fonte:** `E:\CentralDark\Pivete\hermes.html`  
**Data:** 2026-08-24 20:32:00 -0300  
**Status:** ✅ OURO EXTRAÍDO  
**Owner:** SEGREDO/CHEFE  
**Classificação:** CANÔNICO (Referência Hermes Agent)  

---

## 🎯 RESUMO EXECUTIVO

**Hermes Agent** é um agente de IA **autoaperfeiçoável** e de **código aberto** da Nous Research.

- **Funcionamento:** CLI + Gateway de mensagens multiplataforma
- **Armazenamento:** Identidade durável em disco + memória persistente
- **Capacidades:** Skills que melhoram com o uso
- **Compatibilidade:** Qualquer provedor LLM compatível com OpenAI

### Provedores Suportados (20+)
- Nous Portal
- OpenRouter
- Anthropic
- GitHub Copilot
- z.ai
- Kimi
- MiniMax
- DeepSeek
- Qwen Cloud
- Hugging Face
- Google
- xAI/SuperGrok
- Endpoints auto-hospedados (Ollama, vLLM, SGLang, llama.cpp, LM Studio, etc.)

### Novidades v0.14.0 (16 de maio de 2026)
- OAuth do SuperGrok com contexto de **1 milhão de tokens** (grok-4.3)
- Proxy local compatível com OpenAI para provedores OAuth (`hermes proxy`)
- Suporte nativo a `x_search`
- Instalação via PyPI (descontinuada na v0.19.0)
- Instalação sob demanda de dependências
- **22 plataformas de mensagens** (incluindo LINE e SimpleX Chat)
- `/handoff`
- Diagnósticos semânticos de LSP após gravações
- `video_generate` unificado
- `computer_use` via cua-driver
- Versão beta nativa para Windows
- Resolução de 12 itens P0 e 50 itens P1

---

## 📌 CINCO SISTEMAS CRÍTICOS

Domine estes cinco sistemas e o Hermes se tornará um **multiplicador de produtividade**:

1. **Resolução de provedores** — Como os fluxos de autenticação são convertidos em chamadas de API
2. **Hierarquia de configuração** — `config.yaml` + `.env` + `auth.json` + `SOUL.md` + `AGENTS.md`
3. **Sistema de ferramentas + toolsets** — O que o agente pode fazer, com permissões definidas por plataforma
4. **Sistema de skills** — Memória procedural que o agente cria e aprimora
5. **Gateway + cron + profiles** — Como executar o Hermes onde você está presente, não apenas onde você se encontra fisicamente

---

## ⚡ PRINCIPAIS CONCLUSÕES

### 🔑 Autenticação do Provedor (3 Caminhos)
1. **Chave de API** no `~/.hermes/.env` (OpenRouter, z.ai, Kimi, MiniMax, DeepSeek, Hugging Face, Google)
2. **OAuth** via `hermes model` ou `hermes auth` (Nous Portal, OpenAI Codex, GitHub Copilot, Anthropic) → credenciais em `~/.hermes/auth.json`
3. **Endpoint personalizado** no `config.yaml` (Ollama, vLLM, SGLang, llama.cpp, LM Studio)

> **Regra:** Escolha o caminho correspondente ao seu provedor, não aquele que simplesmente parece mais familiar.

### 🔄 Troca de Provedor
- `hermes model` — Orientação interativa por todos os provedores
- `/model provider:model` — Trocar durante uma sessão **sem perder histórico**
  - Exemplos: `/model zai:glm-5`, `/model openrouter:anthropic/claude-sonnet-4`
  - `/model custom:local:qwen-2.5` — Endpoint customizado nomeado
  - `/model custom` — Auto-detecta o modelo do endpoint local

### 📝 Arquivos de Configuração (Superfície Editável)
- `~/.hermes/config.yaml` — Configurações (modelo, terminal, TTS, compressão, etc.)
- `~/.hermes/.env` — **SEGREDOS** (chaves de API)
- `~/.hermes/auth.json` — Credenciais OAuth (gerenciado pelo Hermes)
- `~/.hermes/SOUL.md` — **Identidade primária** (slot #1 no system prompt)
- `~/.hermes/MEMORY.md` — Memória persistente (gerenciado pelo Hermes)
- `~/.hermes/skills/` — Skills (gerenciado pelo Hermes)

> **Regra:** Você pode editar `SOUL.md` manualmente. O restante é modificado pelo próprio agente.

### 🔄 Hermes é o Sucessor do OpenClaw
- `hermes claw migrate` — Importa automaticamente 30+ categorias de estado

### ⚡ Qualidade do Serviço = Qualidade do Modelo Auxiliar
Visão, resumo de conteúdo da web, compressão e gravação da memória usam um **LLM auxiliar separado**.

- **Padrão:** Gemini Flash
- **Seleção automática:** OpenRouter → Nous → Codex
- **Aviso:** Se nenhum estiver configurado, esses recursos **perderão qualidade silenciosamente**

---

## 🏗️ ESTRUTURA DE DIRETÓRIOS CANÔNICA

```
~/.hermes/
├── config.yaml        # Configurações (modelo, terminal, TTS, compressão, etc.)
├── .env               # SEGREDOS (chaves de API)
├── auth.json          # Credenciais OAuth (Nous Portal, Codex, Anthropic)
├── SOUL.md            # Identidade primária (slot #1 no system prompt)
├── memories/          # Memória persistente (MEMORY.md, USER.md)
├── skills/            # Skills (bundled + agent-created + hub-installed)
├── cron/              # Tarefas agendadas
├── sessions/          # Estado das sessões do gateway
└── logs/              # agent.log, gateway.log, errors.log (segredos auto-ocultos)
```

> **Nota:** Cada arquivo tem uma função específica. Não há sobreposição. Se você quiser saber "onde o Hermes armazena X", a resposta estará entre esses arquivos.

---

## 🔄 LOOP DE CONVERSA (Modelo Mental)

O Hermes é estruturado em torno de um **único loop de conversa** que pode ser invocado por qualquer ponto de entrada:

### Pontos de Entrada
1. **CLI** (`cli.py`)
2. **Gateway de mensagens** (`gateway/run.py`)
3. **Adaptador ACP** (integração com editores)
4. **Executor em lote**
5. **Servidor API**

Todos chamam `AIAgent.run_conversation()` em `run_agent.py`, que:

1. **Monta o prompt do sistema** usando:
   - `SOUL.md`
   - `MEMORY.md`
   - `USER.md`
   - `skills/`
   - Arquivos de contexto
   - Orientações sobre ferramentas
   - via `prompt_builder.py`

2. **Resolve o provedor em tempo de execução** via `runtime_provider.py`
   - Método de autenticação
   - URL base
   - Modo API

3. **Chama o provedor** usando um de três modos API:
   - `chat_completions`
   - `codex_responses`
   - `anthropic_messages`

4. **Encaminha chamadas de ferramentas** via `model_tools.py` e registro central (`tools/registry.py`)

5. **Repete** até o modelo produzir uma resposta final

6. **Salva a sessão** no SQLite com FTS5

> **Insight:** Entender esse loop é importante porque todos os recursos (personalidades, memória, skills, compressão e fallback) se conectam a uma dessas etapas.

---

## 🌐 GATEWAY DE MENSAGENS (22 Plataformas)

- Telegram
- Discord
- Slack
- WhatsApp
- Signal
- Email
- Google Chat
- LINE
- SimpleX Chat
- Microsoft Teams (integração ponta-a-ponta)
- ... e mais

> **Nota:** Todas as plataformas usam o **mesmo loop de conversa** (COMMAND_REGISTRY compartilhado). Por isso, os mesmos comandos slash funcionam no terminal e no Telegram.

---

## 📚 SISTEMA DE SKILLS

- **Divulgação progressiva** — Skills são reveladas conforme necessário
- **Hub de skills** — Repositório central de skills
- **Criação automática** — O Hermes cria skills com base na experiência
- **Local:** `~/.hermes/skills/`

---

## 🎯 NOVIDADES v0.19.0 (Versão Quicksilver - 20 de julho de 2026)

- **Redução de 80%** no tempo até o primeiro token
- Gerenciamento de cobranças pelo terminal
- Fontes de segredos de gerenciadores de senhas
- Aprovações inteligentes por padrão
- Subagentes observáveis
- Entrega de respostas resistente a falhas
- **~2.245 commits**, **~1.065 PRs mesclados**, **~3.300 issues encerradas**, **450+ colaboradores**

---

## 📊 COMPARAÇÃO: HERMES vs CLAUDE CODE

| Recurso | Hermes | Claude Code |
|---------|--------|-------------|
| Código Aberto | ✅ | ❌ |
| Multi-provedor | ✅ (20+ provedores) | ❌ (Anthropic apenas) |
| Gateway de mensagens | ✅ (22 plataformas) | ❌ |
| Autoaperfeiçoável | ✅ | ❌ |
| Memória persistente | ✅ | ❌ |
| Skills personalizáveis | ✅ | ❌ |
| Execução de comandos | ✅ | ✅ |
| Integração com editores | ✅ (ACP) | ✅ |

---

## 📞 COMANDOS PRINCIPAIS

| Comando | Descrição |
|---------|-----------|
| `hermes model` | Gerenciamento de modelos (troca, lista, configura) |
| `hermes auth` | Autenticação (OAuth para provedores) |
| `hermes proxy` | Proxy local para provedores OAuth |
| `hermes claw migrate` | Migração do OpenClaw |
| `/model provider:model` | Trocar modelo durante sessão |
| `/handoff` | Transferência de contexto |

---

## 🎯 CONEXÃO COM CENTRALDARK

Este guia é **Referência Canônica** para:
- Entender a arquitetura do Hermes Agent
- Configurar provedores e autenticação
- Gerenciar skills e memórias
- Integrar com a CentralDark

**Owner:** SEGREDO/CHEFE  
**Status:** ✅ CANÔNICO  
**Uso:** Referência operacional para Hermes na CentralDark
