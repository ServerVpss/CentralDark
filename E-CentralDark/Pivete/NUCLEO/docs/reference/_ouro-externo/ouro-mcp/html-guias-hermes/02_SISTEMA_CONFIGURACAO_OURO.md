# Hermes Agent - Sistema de Configuração (OURO)

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1523-1595)  
**Data:** 2026-08-24 20:37:00 -0300  
**Status:** ✅ OURO EXTRAÍDO E PROVADO  
**Owner:** SEGREDO/CHEFE  
**Classificação:** CANÔNICO (Configuração Crítica)  
**SHA256:** (a gerar pelo Hermes)  

---

## 🎯 **SISTEMA DE CONFIGURAÇÃO EM CAMADAS**

O Hermes tem um **sistema de configuração em camadas** com ordem de precedência:

```
PASSO 1: CLI Arguments      (substituição por execução)
    ↓
PASSO 2: Environment Variables (aplicadas na inicialização)
    ↓
PASSO 3: config.yaml          (fonte da verdade de longo prazo)
    ↓
PASSO 4: .env                 (SOMENTE segredos)
    ↓
PASSO 5: Built-in Defaults     (quando nada mais definir)
```

**Regra:** Camadas superiores **substituem** as inferiores.

---

## 📁 **ESTRUTURA DE ARQUIVOS CANÔNICA**

```
~/.hermes/
├── config.yaml       # Todas as configurações (modelo, terminal, TTS, compressão, memória, toolsets, ...)
├── .env              # SEGREDOS (chaves API, tokens de bots, senhas)
├── auth.json         # Credenciais OAuth (Nous Portal, Codex, Anthropic)
├── SOUL.md           # Identidade primária do agente (slot #1 no system prompt)
├── memories/         # Memória persistente (MEMORY.md, USER.md)
├── skills/           # Skills (bundled + agent-created + hub-installed)
├── cron/             # Tarefas agendadas
├── sessions/         # Estado das sessões do gateway
└── logs/              # agent.log, gateway.log, errors.log (segredos auto-ocultos)
```

---

## 🔑 **REGRAS DE SEPARAÇÃO: config.yaml vs .env**

| **Tipo** | **Local** | **Exemplos** |
|----------|-----------|--------------|
| **Segredos** | `.env` | Chaves API, tokens de bots, senhas |
| **Configurações** | `config.yaml` | Modelo, backend do terminal, compressão, limites de memória, toolsets |

> **⚠️ IMPORTANTE:** Quando uma configuração está definida em **ambos**, o `config.yaml` **prevalece** para configurações não-secretas.

---

## 🔄 **INTERPOLAÇÃO DE SEGREDOS NO config.yaml**

Segredos podem ser **referenciados** no `config.yaml` usando interpolação no estilo shell:

```yaml
# Exemplo: config.yaml
auxiliary:
  vision:
    api_key: ${GOOGLE_API_KEY}
    base_url: ${CUSTOM_VISION_URL}
  delegation:
    api_key: ${DELEGATION_KEY}
```

> **Vantagem:** Mantém segredos fora do config.yaml, mas permite referência direta.

---

## 🛠️ **GERENCIAMENTO DA CONFIGURAÇÃO (CLI)**

| **Comando** | **Descrição** | **v0.19.0+** |
|-------------|----------------|----------------|
| `hermes config` | Ver configuração atual | ✅ |
| `hermes config show` | Mesma coisa que acima | ✅ |
| `hermes config edit` | Abrir config.yaml no editor | ✅ |
| `hermes config set KEY VAL` | Definir valor específico | ✅ |
| `hermes config get KEY` | Imprimir único valor | ✅ |
| `hermes config unset KEY` | Remover chave (aplica default) | ✅ |
| `hermes config path` | Imprimir caminho do config.yaml | ✅ |
| `hermes config env-path` | Imprimir caminho do .env | ✅ |
| `hermes config check` | Verificar opções ausentes (pós-updates) | ✅ |
| `hermes config migrate` | Adicionar opções ausentes interativamente | ✅ |

---

## 📝 **EXEMPLOS PRÁTICOS**

### Configurar modelo:
```bash
hermes config set model anthropic/claude-opus-4
```

### Configurar backend do terminal:
```bash
hermes config set terminal.backend docker
```

### Configurar chave de API (vai para .env):
```bash
hermes config set OPENROUTER_API_KEY sk-or-...
```

---

## ⚠️ **POST-UPDATE CHECKLIST**

**APÓS CADA `hermes update`**, execute:

```bash
# 1. Verificar configurações ausentes
hermes config check

# 2. Migrar configurações (interativo)
hermes config migrate
```

> **Por quê?** Detecta novas opções de configuração que ainda não estão no seu arquivo.

---

## 🌍 **LOCALIZAÇÃO (i18n)**

### v0.13.0+
- 7 localidades: Chinês (simplificado), Japonês, Alemão, Espanhol, Francês, Ucraniano, Turco
- Determinação: `LC_ALL` / `LANG` ou chave `locale:` no config.yaml
- Padrão: Inglês (fonte da verdade)

### v0.14.0
- +8 localidades (total: 16)
- Tradução completa: Comandos do gateway + dashboard web
- Documentação: Disponível em zh-Hans apenas (por enquanto)

---

## 🎭 **PROFILES - INSTÂNCIAS ISOLADAS**

**O que são:** Várias instâncias isoladas do Hermes, cada uma com:
- Sua própria configuração
- Suas próprias sessões
- Suas próprias skills
- Sua própria memória
- Seu próprio PID do gateway

**Uso:** Executar "Hermes de trabalho" e "Hermes pessoal" lado a lado, **sem acesso ao estado um do outro**.

### Comandos de Profile:

| **Comando** | **Descrição** |
|-------------|----------------|
| `hermes profile list` | Listar todos os profiles |
| `hermes profile create work --clone` | Clonar do profile atual |
| `hermes profile use work` | Definir como padrão |
| `hermes profile alias work --name h-work` | Criar script wrapper |
| `hermes profile export work -o work-backup.tar.gz` | Exportar profile |
| `hermes profile import work-backup.tar.gz --name restored` | Importar profile |
| `hermes -p work chat -q "Hello"` | Execução pontual sem trocar profile |

### Estrutura:
- Cada profile recebe seu próprio `HERMES_HOME`
- Padrão: `~/.hermes-{name}/`
- Vários profiles podem executar gateway **simultaneamente sem interferir**

---

## 🎯 **CONEXÃO COM CENTRALDARK**

Este documento é **Referência Canônica de Configuração** para:
- Entender o sistema de configuração em camadas
- Gerenciar config.yaml e .env
- Trabalhar com profiles isolados
- Localização (i18n)
- Migração de configurações

**Owner:** SEGREDO/CHEFE  
**Status:** ✅ CANÔNICO  
**Uso:** Configuração operacional para Hermes na CentralDark  

---

## ✅ **PROVA (CHECKSUM)**

**Fonte:** `E:\CentralDark\Pivete\hermes.html` (linhas 1523-1595)  
**Método:** Extração manual + limpeza de tags HTML  
**Data:** 2026-08-24 20:37:00 -0300  
**Validação:** Conteúdo verificado contra original  
**SHA256:** (a ser gerado pelo Hermes local)
