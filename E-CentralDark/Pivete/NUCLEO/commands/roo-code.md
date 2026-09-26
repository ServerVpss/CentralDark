# COMANDO - roo-code.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\platforms\roo-code.md
**SHA:** 2c416fbb6732997e
**Timestamp:** 2026-08-28T02:02:40.010641
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Ou via linha de comando:

### Ouro Bruto (primeiros 5000 chars)
```
# Guia AIOS para Roo Code

> 🌐 [EN](../../platforms/roo-code.md) | **PT** | [ES](../../es/platforms/roo-code.md)

---

> **Extensão VS Code Baseada em Modos** - Modos de Agentes Especializados

---

## Visão Geral

### O que é o Roo Code?

Roo Code é uma extensão do VS Code que usa um sistema baseado em modos para assistência de IA. Cada modo fornece contexto e capacidades especializadas, facilitando a troca entre diferentes tipos de tarefas.

### Por que usar AIOS com Roo Code?

O Roo Code oferece uma abordagem única baseada em modos:

- **Sistema de Modos**: Modos dedicados para cada tipo de agente
- **Extensão VS Code**: Funciona no seu ambiente existente
- **Troca Rápida**: Mudança rápida de modo via barra de status
- **Modos Personalizados**: Crie workflows especializados
- **Consciência de Contexto**: Modos mantêm contexto relevante

### Comparação com Outras Plataformas

| Recurso            |    Roo Code     |  Cline   |  Cursor  |
| ------------------ | :-------------: | :------: | :------: |
| Sistema de Modos   |       Sim       |   Não    |   Não    |
| Extensão VS Code   |       Sim       |   Sim    |   Não    |
| Ativação de Agente | Seletor de Modo | @mention | @mention |
| Suporte MCP        |       Não       | Limitado |  Config  |

---

## Requisitos

### Requisitos de Sistema

| Requisito   | Mínimo            | Recomendado   |
| ----------- | ----------------- | ------------- |
| **VS Code** | 1.80+             | Última versão |
| **RAM**     | 4GB               | 8GB+          |
| **Node.js** | 18.0+ (para AIOS) | 20.0+         |

### Requisitos de Conta

- **Chave de API**: Anthropic, OpenAI ou outros provedores suportados
- **Licença Roo Code** (se aplicável)

---

## Instalação

### Passo 1: Instalar o VS Code

Baixe de [code.visualstudio.com](https://code.visualstudio.com).

### Passo 2: Instalar a Extensão Roo Code

1. Abra Extensões do VS Code (`Cmd/Ctrl + Shift + X`)
2. Pesquise "Roo Code" por RooVeterinaryInc
3. Clique em Instalar

Ou via linha de comando:

```bash
code --install-extension RooVeterinaryInc.roo-cline
```

### Passo 3: Configurar Chave de API

1. Abra as configurações do Roo Code
2. Insira sua chave de API
3. Selecione o modelo preferido

### Passo 4: Instalar o AIOS

```bash
cd seu-projeto
npx @anthropic/aios init
# Selecione "Roo Code" quando solicitado
```

### Passo 5: Verificar a Instalação

```bash
ls -la .roo/
```

Estrutura esperada:

```
.roo/
├── rules.md           # Regras principais
├── agents/            # Definições de agentes
│   ├── dev.md
│   ├── qa.md
│   └── ...
└── .roomodes          # Definições de modo
```

---

## Configuração

### Arquivo de Regras

**Localização:** `.roo/rules.md`

```markdown
# Regras Synkra AIOS para Roo Code

## Sistema de Agentes

- Use o seletor de modo para trocar agentes
- Cada modo corresponde a um agente AIOS

## Padrões de Desenvolvimento

- Escreva código limpo e testado
- Siga padrões existentes
```

### Definições de Modo

**Localização:** `.roomodes`

```json
{
  "modes": [
    {
      "id": "bmad-dev",
      "name": "Desenvolvedor",
      "description": "Modo de desenvolvimento full-stack",
      "rulesFile": ".roo/agents/dev.md"
    },
    {
      "id": "bmad-qa",
      "name": "Engenheiro de QA",
      "description": "Modo de garantia de qualidade",
      "rulesFile": ".roo/agents/qa.md"
    },
    {
      "id": "bmad-architect",
      "name": "Arquiteto",
      "description": "Modo de design de sistema",
      "rulesFile": ".roo/agents/architect.md"
    }
  ]
}
```

### Arquivos de Agente

**Localização:** `.roo/agents/`

```markdown
# Modo Desenvolvedor

## Papel

Você é um Desenvolvedor Full Stack Sênior.

## Expertise

- TypeScript/JavaScript
- Node.js, React
- Design de banco de dados
- Desenvolvimento de API

## Fluxo de Trabalho

1. Entender requisitos
2. Planejar implementação
3. Escrever código limpo
4. Testar completamente
```

---

## Uso Básico

### Iniciando o Roo Code

1. Abra o VS Code com seu projeto
2. O Roo Code carrega automaticamente
3. Procure o seletor de modo na barra de status

### Trocando Modos

**Via Barra de Status:**

1. Clique no indicador de modo na barra de status
2. Selecione o modo desejado da lista
3. O contexto do modo carrega imediatamente

**Via Paleta de Comandos:**

1. `Cmd/Ctrl + Shift + P`
2. Digite "Roo: Switch Mode"
3. Selecione o modo

### Modos Built-in

O Roo Code vem com vários modos built-in:

| Modo             | Propósito                                  |
| ---------------- | ------------------------------------------ |
| **Code**         | Tarefas gerais de codificação              |
| **Architect**    | Planejamento e liderança técnica           |
| **Ask**          | Responder perguntas e fornecer informações |
| **Debug**        | Diagnóstico sistemático de problemas       |
| **Orchestrator** | Coordenação de workflows multi-etapa       |

### Modos AIOS Personalizados

| Modo             | Agente        | Propósito                  |
| -------------
```