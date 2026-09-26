# Hermes Agent - Comandos CLI (OURO)

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1596-1894)  
**Data:** 2026-08-24 20:40:00 -0300  
**Status:** ✅ OURO EXTRAÍDO E PROVADO  
**Owner:** SEGREDO/CHEFE  
**Classificação:** CANÔNICO (CLI Reference)  
**SHA256:** (a gerar pelo Hermes)  

---

## 🎯 **COMANDOS CLI - REFERÊNCIA PRÁTICA**

Esta seção é uma **referência prática** dos comandos CLI de nível superior.  
Para a referência oficial, consulte a documentação derivada do código.

---

## ⚙️ **OPÇÕES GLOBAIS**

```
hermes [global-options] command [subcommand/options]
```

| **Opção** | **Descrição** |
|-----------|----------------|
| `--version, -V` | Exibe a versão e encerra |
| `--profile name, -p name` | Seleciona qual profile do Hermes será usado |
| `--resume session, -r session` | Retoma uma sessão pelo ID ou título |
| `--continue [name], -c [name]` | Retoma a sessão mais recente (ou busca título) |
| `--worktree, -w` | Inicia em um git worktree isolado |
| `--yolo` | Ignora solicitações de aprovação para comandos perigosos |
| `--safe-mode` | Modo de segurança mínimo para isolar problemas (v0.19.0+) |
| `--pass-session-id` | Inclui o ID da sessão no prompt de sistema |

---

## 📋 **COMANDOS DE NÍVEL SUPERIOR**

### 💬 **Conversação e Execução**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes chat` | Chat interativo ou execução única |
| `hermes` (sem argumentos) | Abre chat interativo |

### 🎯 **Configuração Principal**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes model` | Escolhe interativamente provedor e modelo padrão |
| `hermes setup` | Assistente de configuração interativo |
| `hermes auth` | Gerencia credenciais (add, list, remove, redefine, estratégia) |
| `hermes config` | Exibe, edita, migra e consulta configuração |

### 🌐 **Gateway e Mensagens**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes gateway` | Executa ou gerencia o gateway de mensagens |
| `hermes cron` | Inspeciona e executa agendador cron |
| `hermes webhook` | Gerencia assinaturas dinâmicas de webhook |
| `hermes pairing` | Aprova ou revoga códigos de pareamento |

### 🔍 **Diagnóstico e Logs**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes status` | Exibe status do agente, autenticação e plataformas |
| `hermes doctor` | Diagnostica problemas de configuração e dependências |
| `hermes dump` | Gera resumo da configuração para suporte |
| `hermes logs` | Visualiza, acompanha e filtra logs |

### 📦 **Skills e Memória**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes skills` | Explora, instala, publica e audita skills |
| `hermes memory` | Configura provedor de memória externo |

### 🔧 **Integração**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes acp` | Executa como servidor ACP (integração com editores) |
| `hermes mcp` | Gerencia configuração do servidor MCP |
| `hermes plugins` | Gerencia plugins |
| `hermes tools` | Configura ferramentas habilitadas por plataforma |

### 📊 **Sessões e Análises**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes sessions` | Explora, exporta, remove sessões (v0.19.0: +formatos Markdown, Quarto, HTML) |
| `hermes insights` | Exibe análises de tokens, custos e atividades |

### 🗃️ **Perfis e Backup**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes profile` | Gerencia profiles (várias instâncias isoladas) |
| `hermes backup` | Backup completo de configurações, sessões, skills e memória (v0.9.0+) |
| `hermes import` | Restaura a partir de backup |

### 🌐 **Plataformas Específicas**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes whatsapp` | Configura e pareia ponte do WhatsApp |

### 📰 **Sistema**
| **Comando** | **Finalidade** |
|-------------|----------------|
| `hermes version` | Exibe informações da versão |
| `hermes update` | Baixa código mais recente e reinstala dependências |
| `hermes uninstall` | Remove Hermes do sistema (`--full` exclui configurações/dados) |
| `hermes completion` | Exibe scripts de preenchimento automático (bash/zsh) |
| `hermes serve` | Executa servidor API sem interface (v0.19.0+) |
| `hermes dashboard` | Inicia dashboard web local (v0.9.0+) |
| `hermes debug share` | Upload de relatório de depuração para pastebin (v0.9.0+) |

---

## 💬 **`hermes chat` — PONTO DE ENTRADA PRINCIPAL**

Executar `hermes` sem argumentos **abre o chat interativo**.  
`hermes chat` é a forma explícita.

### Exemplos Práticos:

```bash
# Chat interativo
hermes chat

# One-shot, não interativo
hermes chat -q "Summarize the latest PRs"

# Especificar provedor e modelo
hermes chat --provider openrouter --model anthropic/claude-sonnet-4

# Habilitar toolsets específicos
hermes chat --toolsets web,terminal,skills

# Modo programático (somente JSON)
hermes chat --quiet -q "Return only JSON"

# Retomar sessão diretamente
hermes chat --resume abc123

# Criar git worktree isolado
hermes chat --worktree -q "Review repo and open a PR"

# Checkpoints antes de alterações destrutivas
hermes chat --checkpoints

# Ignorar solicitações de aprovação
hermes chat --yolo

# Tag de origem da sessão
hermes chat --source tool

# Número máximo de iterações com ferramentas
hermes chat --max-turns 90
```

### Opções Principais:

| **Opção** | **Descrição** |
|-----------|----------------|
| `-q, --query "..."` | Prompt não interativo de execução única |
| `-m, --model model` | Substitui modelo nesta execução |
| `-t, --toolsets csv` | Habilita toolsets separados por vírgulas |
| `--provider provider` | Força uso de provedor específico |
| `-s, --skills name` | Pré-carrega uma ou mais skills |
| `-v, --verbose` | Saída detalhada |
| `-Q, --quiet` | Modo programático (sem banner, loading, preview) |
| `--resume session` | Retoma sessão pelo ID |
| `--worktree` | Cria git worktree isolado |
| `--checkpoints` | Habilita checkpoints do sistema de arquivos |
| `--yolo` | Ignora solicitações de aprovação |
| `--source tag` | Tag de origem (padrão: cli, use `tool` para integrações) |
| `--max-turns N` | Máximo de iterações com ferramentas (padrão: 90) |

---

## ⚙️ **`hermes setup` — ASSISTENTE COMPLETO**

Executa o assistente de configuração completo ou abre diretamente uma seção:

```bash
# Assistente completo interativo
hermes setup

# Configuração específica
hermes setup model           # Provedor e modelo apenas
hermes setup terminal        # Backend do terminal apenas
hermes setup gateway         # Plataformas de mensagens apenas
hermes setup tools           # Ferramentas (habilitar/desabilitar por plataforma)
hermes setup agent           # Comportamento do agente apenas

# Opções
hermes setup --non-interactive  # Modo não interativo
hermes setup --reset            # Reset config para defaults antes do setup
```

---

## 📜 **`hermes logs` — CONSULTA ESTRUTURADA DE LOGS**

`hermes logs` é **mais avançado** que `tail -f` — permite filtrar por nível, ID da sessão e intervalo de tempo.

### Exemplos:

```bash
# Últimas 50 linhas do agent.log
hermes logs

# Acompanhar em tempo real
hermes logs -f

# Últimas 100 linhas do gateway.log
hermes logs gateway -n 100

# Avisos dos últimos 60 minutos
hermes logs --level WARNING --since 1h

# Filtrar por ID da sessão
hermes logs --session abc123

# Acompanhar errors.log dos últimos 30 minutos
hermes logs errors --since 30m -f

# Listar todos os arquivos de log com tamanhos
hermes logs list
```

### Arquivos de Log:

| **Arquivo** | **Conteúdo** | **Nível** |
|-------------|--------------|-----------|
| `agent.log` | Todas as atividades do agente (API calls, tool forwarding, session lifecycle, INFO+) | INFO+ |
| `errors.log` | Apenas avisos e erros (subconjunto filtrado de agent.log) | WARNING+ |
| `gateway.log` | Atividades do gateway de mensagens (conexões, encaminhamento, webhooks) | INFO+ |

> **Rotação:** Automática via `RotatingFileHandler` do Python.  
> Procure por: `agent.log.1`, `agent.log.2`, etc.

---

## 🩺 **`hermes doctor` — DIAGNÓSTICO**

**Primeiro comando** a executar quando algo der errado:

```bash
# Diagnóstico completo
hermes doctor

# Diagnóstico com tentativa de correção automática
hermes doctor --fix
```

**O que verifica:**
- Validade da configuração
- Presença de dependências
- Disponibilidade de chaves de API
- Status dos serviços
- Reparos automáticos (com `--fix`)

### Compartilhamento de Diagnóstico:

```bash
# Gera resumo compacto em texto simples
hermes dump
```

> **Nota:** Chaves de API são **automaticamente ocultadas**.  
> Pronto para ser colado em issues do GitHub ou conversas no Discord.

---

## 📌 **COMANDOS ESSENCIAIS PARA CENTRALDARK**

### Setup Inicial:
```bash
# Configuração completa
hermes setup

# Verificar configuração
hermes config check
hermes config migrate

# Ver status
hermes status
```

### Autenticação:
```bash
# Configurar provedor
hermes model

# Gerenciar credenciais
hermes auth

# Testar conexão
hermes doctor
```

### Execução:
```bash
# Chat interativo
hermes chat

# One-shot
hermes -q "Resuma este repositório"

# Com worktree
hermes -w chat
```

---

## 🎯 **CONEXÃO COM CENTRALDARK**

Este documento é **Referência Canônica de CLI** para:
- Executar Hermes na CentralDark
- Gerenciar sessões e provedores
- Diagnosticar problemas
- Automatizar workflows

**Owner:** SEGREDO/CHEFE  
**Status:** ✅ CANÔNICO  
**Uso:** Execução operacional para Hermes na CentralDark  

---

## ✅ **PROVA (CHECKSUM)**

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1596-1894)  
**Método:** Extração manual + limpeza de tags HTML  
**Data:** 2026-08-24 20:40:00 -0300  
**Validação:** Conteúdo verificado contra original  
**SHA256:** (a ser gerado pelo Hermes local)
