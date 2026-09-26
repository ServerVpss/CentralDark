# Hermes Agent - Autenticação e Provedores (OURO)

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1132-1522)  
**Data:** 2026-08-24 20:35:00 -0300  
**Status:** ✅ OURO EXTRAÍDO E PROVADO  
**Owner:** SEGREDO/CHEFE  
**Classificação:** CANÔNICO (Autenticação Crítica)  
**SHA256:** (a gerar pelo Hermes)  

---

## 🎯 **MATRIZ COMPLETA DE PROVEDORES (22+)**

Hermes oferece suporte nativo a **~22 provedores**, além de endpoints personalizados.  
(v0.19.0 adiciona: Fireworks AI, DeepInfra, Upstage Solar)

---

## 🔐 **TRÊS CAMINHOS DE AUTENTICAÇÃO**

Todos os provedores seguem **um destes três padrões**:

### 🔹 **Caminho 1 — Chave de API no `.env`**
**Local:** `~/.hermes/.env`  
**Uso:** Chave lida na inicialização  
**Provedores:**
- OpenRouter
- AI Gateway (Vercel)
- z.ai/GLM (ZhipuAI)
- Kimi/Moonshot
- MiniMax (incluindo MiniMax China)
- Alibaba Cloud/DashScope
- Kilo Code
- OpenCode Zen
- OpenCode Go
- DeepSeek
- Hugging Face
- Google/Gemini
- Maioria dos provedores externos

**Novidade v0.19.0:**
- Interface conectável **SecretSource** pode buscar segredos no:
  - Bitwarden (referências `op://`)
  - 1Password
- Vários cofres habilitados simultaneamente
- Precedência determinística
- Avisos de conflito
- Procedência por variável
- `.env` continua como fallback

> **Nota:** Isso é diferente do token de inicialização do Bitwarden Secrets Manager (v0.15.0).  
> SecretSource **substitui o próprio arquivo de texto simples**.

---

### 🔹 **Caminho 2 — OAuth via `hermes model` ou `hermes auth`**
**Processo:**
1. Inicia fluxo de código de dispositivo
2. Abre navegador
3. Armazena credenciais em `~/.hermes/auth.json`
4. Pode importar credenciais existentes de Claude Code ou Codex CLI

**Provedores:**
- Nous Portal (login por OAuth, baseado em assinatura)
- OpenAI Codex (código de dispositivo do ChatGPT, usa modelos Codex)
- GitHub Copilot (código de dispositivo OAuth)
- Anthropic (Claude Pro/Max)

---

### 🔹 **Caminho 3 — Endpoint Personalizado no `config.yaml`**
**Uso:** Qualquer API compatível com OpenAI  
**Configuração:** `hermes model` → Custom endpoint → Persiste no `config.yaml`

**Provedores:**
- Ollama
- vLLM
- SGLang
- llama.cpp
- LM Studio
- Proxy LiteLLM
- Together AI
- Groq
- Azure OpenAI
- Seu próprio servidor auto-hospedado

---

## 📋 **MATRIZ COMPLETA POR PROVEDOR**

| **Provedor** | **Caminho** | **Configuração** | **Notas** |
|--------------|-------------|------------------|-----------|
| **Nous Portal** | OAuth | `hermes model` (OAuth) | Baseado em assinatura |
| **OpenAI Codex** | OAuth | `hermes model` (código dispositivo ChatGPT) | Usa modelos Codex |
| **GitHub Copilot** | OAuth ou Token | `hermes model` (OAuth) ou `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `gh auth token` | |
| **GitHub Copilot ACP** | Subprocesso local | `hermes model` (requer CLI copilot no PATH + `copilot login`) | |
| **Anthropic** | OAuth ou Chave API | `hermes model` (prioriza Claude Code) ou `ANTHROPIC_API_KEY` ou `ANTHROPIC_TOKEN` | |
| **OpenRouter** | Chave API | `OPENROUTER_API_KEY` em `~/.hermes/.env` | |
| **AI Gateway (Vercel)** | Chave API | `AI_GATEWAY_API_KEY` em `~/.hermes/.env` | Provedor: `ai-gateway` |
| **z.ai / GLM** | Chave API | `GLM_API_KEY` em `~/.hermes/.env` | Provedor: `zai` |
| **Kimi / Moonshot** | Chave API | `KIMI_API_KEY` em `~/.hermes/.env` | Provedor: `kimi-coding` |
| **MiniMax** | Chave API | `MINIMAX_API_KEY` em `~/.hermes/.env` | Provedor: `minimax` |
| **DeepSeek** | Chave API | `DEEPSEEK_API_KEY` em `~/.hermes/.env` | Provedor: `deepseek` |
| **Hugging Face** | Chave API | `HUGGINGFACE_API_KEY` em `~/.hermes/.env` | Provedor: `huggingface` |
| **Google/Gemini** | Chave API | `GOOGLE_API_KEY` em `~/.hermes/.env` | Provedor: `google` |
| **Fireworks AI** | Chave API | `FIREWORKS_API_KEY` em `~/.hermes/.env` | v0.19.0+ |
| **DeepInfra** | Chave API | `DEEPINFRA_API_KEY` em `~/.hermes/.env` | v0.19.0+ |
| **Upstage Solar** | Chave API | `UPSTAGE_API_KEY` em `~/.hermes/.env` | v0.19.0+ |

---

## 🔄 **TROCA DE MODELO DURANTE SESSÃO**

### Comando: `/model provider:model`

**Funcionamento:**
- Troca de modelo **sem perder histórico**
- Persiste conversação, memória e skills
- Resolve provedor automaticamente

**Exemplos:**
```bash
# Trocar para GLM-5 da Z-AI
/model zai:glm-5

# Trocar para Claude Sonnet via OpenRouter
/model openrouter:anthropic/claude-sonnet-4

# Trocar para endpoint local named
/model custom:local:qwen-2.5

# Auto-detectar modelo do endpoint local
/model custom
```

**Detecção Automática:**
- Se nenhum modelo especificado, auto-detecta via `/v1/models` API do endpoint

---

## 📌 **DICAS CRÍTICAS DE AUTENTICAÇÃO**

### ⚠️ **Problema: Recursos com Qualidade Reduzida**
Visão, resumo de conteúdo web, compressão e gravação da memória usam um **LLM auxiliar separado**.

- **Padrão:** Gemini Flash
- **Seleção automática:** OpenRouter → Nous → Codex
- **Aviso:** Se nenhum estiver configurado, estes recursos **perderão qualidade silenciosamente**

### 🎯 **Solução:**
Configure explicitamente os slots auxiliares para seu provedor principal:
```yaml
# Em ~/.hermes/config.yaml
auxiliary_model: "provider:model"
```

---

## 🔍 **DIAGNÓSTICO DE AUTENTICAÇÃO**

### Verificar provedor atual:
```bash
hermes model
```

### Testar conexão:
```bash
hermes model test
```

### Ver credenciais armazenadas:
```bash
# OAuth
cat ~/.hermes/auth.json

# API Keys
cat ~/.hermes/.env
```

---

## 🎯 **CONEXÃO COM CENTRALDARK**

Este documento é **Referência Canônica de Autenticação** para:
- Configurar todos os provedores da CentralDark
- Garantir autenticação segura (SecretSource + Bitwarden/1Password)
- Trocar modelos sem perda de contexto
- Diagnosticar problemas de autenticação

**Owner:** SEGREDO/CHEFE  
**Status:** ✅ CANÔNICO  
**Uso:** Autenticação operacional para Hermes na CentralDark  

---

## ✅ **PROVA (CHECKSUM)**

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1132-1522)  
**Método:** Extração manual + limpeza de tags HTML  
**Data:** 2026-08-24 20:35:00 -0300  
**Validação:** Conteúdo verificado contra original  
**SHA256:** (a ser gerado pelo Hermes local)
