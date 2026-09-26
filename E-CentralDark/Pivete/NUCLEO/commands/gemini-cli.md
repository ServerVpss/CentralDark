# COMANDO - gemini-cli.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\platforms\gemini-cli.md
**SHA:** c3c8399a97d52844
**Timestamp:** 2026-08-28T02:02:39.980904
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- O Gemini CLI usa markdown otimizado para prompt:

### Ouro Bruto (primeiros 5000 chars)
```
# Guia AIOS para Gemini CLI

> 🌐 [EN](../../platforms/gemini-cli.md) | **PT** | [ES](../../es/platforms/gemini-cli.md)

---

> **Assistente CLI do Google AI** - Desenvolvimento com IA em Linha de Comando

---

## Visão Geral

### O que é o Gemini CLI?

Gemini CLI é a interface de linha de comando do Google para interagir com modelos Gemini AI. Ele fornece aos desenvolvedores acesso direto via terminal às capacidades de IA do Google, incluindo suporte multimodal para texto, código e imagens.

### Por que usar AIOS com Gemini CLI?

O Gemini CLI oferece capacidades únicas:

- **Fluxo de Trabalho CLI**: Experiência pura de terminal
- **Modelos Google AI**: Acesso aos modelos Gemini
- **Suporte Multimodal**: Entendimento de texto, código e imagens
- **Ativação por Prompt**: Ativação de agentes em linguagem natural
- **Integração Shell**: Funciona com suas ferramentas existentes

### Comparação com Outras Plataformas

| Recurso | Gemini CLI | Claude Code | Cursor |
|---------|:----------:|:-----------:|:------:|
| Baseado em CLI | Sim | Sim | Não |
| Multimodal | Sim | Limitado | Não |
| Ativação de Agente | Prompt | /comando | @mention |
| Suporte MCP | Não | Nativo | Config |
| Modelos Google | Sim | Não | Não |

---

## Requisitos

### Requisitos de Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **SO** | macOS, Linux, Windows | macOS, Linux |
| **Node.js** | 18.0+ | 20.0+ |
| **Python** | 3.9+ (opcional) | 3.11+ |

### Requisitos de Conta

- **Chave de API Google AI** ou **Conta Google Cloud**
- **Acesso à API Gemini**

---

## Instalação

### Passo 1: Instalar o Gemini CLI

```bash
# Instalar via npm (requer Node.js 18+)
npm install -g @google/gemini-cli

# Ou executar sem instalação
npx @google/gemini-cli

# Ou via conda
conda create -y -n gemini_env -c conda-forge nodejs
conda activate gemini_env
npm install -g @google/gemini-cli
```

### Passo 2: Autenticar

```bash
# Login com conta Google
gemini auth login

# Ou definir chave de API
export GOOGLE_AI_API_KEY="sua-chave-api"
```

### Passo 3: Instalar o AIOS

```bash
cd seu-projeto
npx @anthropic/aios init
# Selecione "Gemini CLI" quando solicitado
```

### Passo 4: Verificar a Instalação

```bash
ls -la .gemini/
```

Estrutura esperada:
```
.gemini/
├── rules.md           # Regras principais
├── agents/            # Definições de agentes
│   ├── dev.md
│   ├── qa.md
│   └── ...
└── config.json        # Configuração do CLI
```

---

## Configuração

### Arquivo de Regras

**Localização:** `.gemini/rules.md`

```markdown
# Regras Synkra AIOS para Gemini CLI

## Sistema de Agentes
- Inclua contexto de agente em seus prompts
- Use "Como agente [agente]..." para ativação

## Padrões de Desenvolvimento
- Escreva código limpo e testado
- Siga padrões existentes
```

### Configuração do CLI

**Localização:** `.gemini/config.json`

```json
{
  "model": "gemini-pro",
  "temperature": 0.7,
  "maxOutputTokens": 8192,
  "agents": {
    "default": "dev",
    "available": ["dev", "qa", "architect", "pm"]
  }
}
```

### Arquivos de Agente

**Localização:** `.gemini/agents/`

```markdown
# Agente Desenvolvedor

## Ativação
Inclua "Como agente AIOS dev" no seu prompt.

## Persona
Desenvolvedor Full Stack Sênior com expertise em:
- TypeScript/JavaScript
- Node.js, React
- Design de banco de dados

## Fluxo de Trabalho
1. Ler requisitos
2. Planejar implementação
3. Escrever código limpo
4. Testar completamente
```

---

## Uso Básico

### Iniciando o Gemini CLI

```bash
# Modo interativo
gemini

# Prompt único
gemini "Explique este código"

# Com contexto de arquivo
gemini --file src/main.ts "Revise este código"
```

### Ativando Agentes AIOS

Inclua contexto de agente nos prompts:

```bash
# Agente desenvolvedor
gemini "Como agente AIOS dev, implemente a feature de login"

# Agente QA
gemini "Como agente AIOS qa, revise este código para segurança"

# Agente arquiteto
gemini "Como agente AIOS architect, projete o schema do banco de dados"
```

### Com Arquivos de Contexto

```bash
# Incluir arquivo de regras
gemini --context .gemini/rules.md "Implemente feature de auth"

# Incluir agente específico
gemini --context .gemini/agents/dev.md "Crie modelo de usuário"
```

### Integração Shell

```bash
# Pipe código para revisão
cat src/auth.ts | gemini "Como AIOS qa, revise este código"

# Gerar código
gemini "Crie um endpoint REST API" > src/api/users.ts

# Sessão interativa
gemini --interactive
```

---

## Uso Avançado

### Capacidades Multimodais

```bash
# Analisar imagem
gemini --image screenshot.png "Explique este design de UI"

# Código + imagem
gemini --file src/component.tsx --image mockup.png \
  "Atualize componente para corresponder ao design"
```

### Gerenciamento de Sessão

```bash
# Iniciar sessão nomeada
gemini --session feature-dev

# Continuar sessão
gemini --session feature-dev "Agora adicione testes"

# Listar sessões
gemini sessions list
```

### Operações em Lote

```bash
# Processar múltiplos arquivos
for file in src/*
```