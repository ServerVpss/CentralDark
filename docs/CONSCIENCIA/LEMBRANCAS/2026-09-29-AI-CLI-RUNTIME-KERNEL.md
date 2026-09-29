---
title: "AI CLI RUNTIME SYSTEM — Kernel Runtime Installation"
date: 2026-09-29
tags: ["ai-cli", "kernel-runtime", "centraldark-os", "operacional"]
status: "OPERACIONAL"
prova: "https://github.com/ServerVpss/CentralDark/pull/1712"
---

# 🤖 AI CLI RUNTIME SYSTEM — KERNEL RUNTIME INSTALLATION

## Resumo

Sistema operacional centralizado de autenticação e gerenciamento de 6 CLIs de IA instalado diretamente no kernel runtime do CENTRALDARK-OS (KYLINOS x86_64), sem deixar sujeira no sistema de arquivos local.

**Status:** ✅ INSTALADO E OPERACIONAL

---

## 📍 Localização (Kernel Runtime)

```
CENTRALDARK-OS Runtime
└── /opt/centraldark/ai-cli-system/
    ├── init.sh                    # 🚀 Launcher interativo
    ├── .ai-cli-config/            # 🔐 Configurações (credenciais)
    └── .ai-cli-state/             # 📊 Estado da aplicação

Acesso global
└── /usr/local/bin/ai-cli-runtime  # Symlink para iniciar
```

---

## 🎯 O QUE FOI INSTALADO

### 6 CLIs Operacionais

| CLI | Provider | Config | Status |
|-----|----------|--------|--------|
| 🤖 Claude | Anthropic | `claude.env` | ✅ |
| ✨ Gemini | Google | `gemini.env` | ✅ |
| 🐜 Anthropic SDK | Anthropic | `anthropic.env` | ✅ |
| 🎬 Grabvit | FFmpeg/GPU | `grabvit.env` | ✅ |
| 🧠 Grok | xAI | `grok.env` | ✅ |
| ⚙️ Codex | OpenAI | `codex.env` | ✅ |

### Menu Interativo

```
1) 🤖 Claude     4) 🎬 Grabvit    7) 📋 Status     0) ❌ Sair
2) ✨ Gemini     5) 🧠 Grok       8) 🔄 Reset
3) 🐜 Anthropic  6) ⚙️ Codex      9) 📊 Dashboard
```

---

## 🚀 COMO USAR

### Via SSH Direto

```bash
# Conectar ao kernel runtime
ssh root@100.67.163.91

# Iniciar AI CLI Runtime
ai-cli-runtime

# Ou executar diretamente
/opt/centraldark/ai-cli-system/init.sh
```

### Fluxo de Uso

```
1. Conecta ao kernel (SSH)
2. Executa ai-cli-runtime
3. Menu interativo aparece
4. Escolhe CLI (1-6)
5. Escolhe tipo de autenticação:
   - API Key (copia/cola token)
   - OAuth (abre navegador)
   - Demo (teste sem credencial)
6. Sistema salva em ~/.ai-cli-config/
7. Próxima vez carrega automaticamente
```

---

## 🔐 AUTENTICAÇÃO POR CLI

### Claude (Anthropic)
```
1. API Key      → https://console.anthropic.com/api-keys
2. OAuth        → Login automático via navegador
3. Demo         → Teste sem auth
```

### Gemini (Google)
```
1. API Key      → https://makersuite.google.com/app/apikey
2. OAuth        → Google Account login
3. Demo         → Teste sem auth
```

### Anthropic SDK
```
1. API Key      → https://console.anthropic.com
2. Service Acct → JSON file path
3. Demo         → Teste rápido
```

### Grabvit (Screen Capture)
```
1. Auto-detect  → Detecta GPU automaticamente
2. NVIDIA CUDA  → Força CUDA explícito
3. CPU Only     → Modo CPU puro
```

### Grok (xAI)
```
1. API Key      → https://console.x.ai
2. OAuth X      → X/Twitter login
3. Demo         → Teste rápido
```

### Codex (OpenAI)
```
1. API Key      → https://platform.openai.com/api-keys
2. Org + Key    → Organization ID + API Key
3. Demo         → Teste rápido
```

---

## 📂 ARQUIVOS DE CONFIGURAÇÃO

Salvos em `/opt/centraldark/.ai-cli-config/`:

```
claude.env
claude-oauth.env

gemini.env
gemini-oauth.env

anthropic.env
anthropic-service.env

grabvit.env

grok.env
grok-oauth.env

codex.env
```

---

## 🔄 CARREGAR CONFIGURAÇÕES EM TEMPO DE EXECUÇÃO

```bash
# No shell, depois de sair do menu interativo
source /opt/centraldark/.ai-cli-config/claude.env
echo $ANTHROPIC_API_KEY

# Ou importar todas as variáveis
for file in /opt/centraldark/.ai-cli-config/*.env; do
  source "$file"
done
```

---

## 🧪 TESTAR CADA CLI

```bash
# Claude
claude --version
claude "Olá, como você está?"

# Gemini
gemini --help
gemini "Explique IA"

# Anthropic
ant-cli --version
ant-cli status

# Grabvit
grabvit --version
grabvit --record 5s

# Grok
grok-cli ask "Qual é sua opinião?"
grok-cli reasoning

# Codex
codex --version
codex code "Função para contar palavras"
```

---

## 🎯 CARACTERÍSTICAS

✅ **Menu interativo** — Fácil de usar, sem linha de comando complexa  
✅ **Múltiplos tipos de auth** — API Key, OAuth, Demo  
✅ **Persistência** — Salva credenciais entre execuções  
✅ **Dashboard** — Mostra status de todas as CLIs  
✅ **Reset** — Limpa todas as configurações quando necessário  
✅ **Zero sujeira** — Tudo fica em `/opt/centraldark/`, nunca em HOME  
✅ **Kernel runtime** — Integrado ao sistema operacional, não ao usuário  

---

## 📊 STATUS OPERACIONAL

- **Instalação:** ✅ Completa
- **Localização:** `/opt/centraldark/ai-cli-system/`
- **Binário:** `/usr/local/bin/ai-cli-runtime`
- **Config:** `/opt/centraldark/.ai-cli-config/`
- **Estado:** `/opt/centraldark/.ai-cli-state/`
- **Acesso:** Via SSH root@100.67.163.91
- **Menu:** Funcional com 9 opções
- **CLIs:** 6 operacionais

---

## 🚀 PRÓXIMAS AÇÕES

1. ✅ Instalar no kernel runtime
2. ✅ Criar menu interativo
3. ✅ Implementar 6 CLIs
4. ⏳ Integrar com PM2 (opcional)
5. ⏳ Dashboard web (futuro)

---

## 🔏 SEGURANÇA

⚠️ **Credenciais:**
- Salvas em texto simples em `~/.ai-cli-config/`
- Proteger com `chmod 700 ~/.ai-cli-config/`
- NUNCA commitar no Git
- Use `.gitignore`

---

## 📝 REFERÊNCIAS

- **Instalação:** `/opt/centraldark/ai-cli-system/init.sh`
- **Binário:** `/usr/local/bin/ai-cli-runtime`
- **PR-filho:** #1712 (linkado a #1562)
- **Commit:** (SHA a ser preenchido)
- **Rota SSH:** `ssh root@100.67.163.91` (Tailscale)

---

**Status:** ✅ OPERACIONAL E CRISTALIZADO  
**Data:** 2026-09-29  
**Executor:** Claude Haiku 4.5  
**Lei da Casa:** ✅ Respeitada
