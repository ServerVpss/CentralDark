# COMANDO - cline.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\platforms\cline.md
**SHA:** e8a525560f28f66d
**Timestamp:** 2026-08-28T02:02:39.934970
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Ou via linha de comando:

### Ouro Bruto (primeiros 5000 chars)
```
# Guia AIOS para Cline

> 🌐 [EN](../../platforms/cline.md) | **PT** | [ES](../../es/platforms/cline.md)

---

> **Assistente de Código IA para VS Code** - Integração Completa com VS Code

---

## Visão Geral

### O que é o Cline?

Cline é uma poderosa extensão de assistente de código IA para VS Code que traz capacidades de codificação autônoma diretamente para seu editor favorito. Ele pode ler, escrever e executar código enquanto mantém o ambiente familiar do VS Code.

### Por que usar AIOS com Cline?

O Cline oferece integração perfeita com VS Code para o AIOS:

- **Integração Completa VS Code**: Funciona dentro da sua configuração existente
- **Ativação @mention**: Ativação natural de agentes
- **Operações de Arquivo**: Ler, escrever, editar arquivos diretamente
- **Acesso ao Terminal**: Executar comandos
- **Ecossistema de Extensões**: Compatível com extensões do VS Code
- **Fluxo de Aprovação**: Operações seguras com confirmação do usuário

### Comparação com Outras Plataformas

| Recurso              |  Cline   |       Cursor       | Claude Code |
| -------------------- | :------: | :----------------: | :---------: |
| Extensão VS Code     |   Sim    | Não (app separado) |     Não     |
| Ativação @mention    |   Sim    |        Sim         |  /comando   |
| Acesso ao Terminal   |   Sim    |        Sim         |     Sim     |
| Suporte MCP          | Limitado |       Config       |   Nativo    |
| Aprovação Necessária |   Sim    |      Opcional      |  Opcional   |

---

## Requisitos

### Requisitos de Sistema

| Requisito   | Mínimo            | Recomendado   |
| ----------- | ----------------- | ------------- |
| **VS Code** | 1.80+             | Última versão |
| **RAM**     | 4GB               | 8GB+          |
| **Node.js** | 18.0+ (para AIOS) | 20.0+         |

### Requisitos de Conta

- **Chave de API**: OpenAI, Anthropic ou outros provedores suportados
- **Conta VS Code** (opcional, para sincronização)

---

## Instalação

### Passo 1: Instalar o VS Code

Baixe de [code.visualstudio.com](https://code.visualstudio.com) se ainda não estiver instalado.

### Passo 2: Instalar a Extensão Cline

1. Abra o VS Code
2. Vá para Extensões (`Cmd/Ctrl + Shift + X`)
3. Pesquise "Cline"
4. Clique em Instalar

Ou via linha de comando:

```bash
code --install-extension saoudrizwan.claude-dev
```

### Passo 3: Configurar o Cline

1. Abra as configurações do Cline
2. Adicione sua chave de API (Anthropic, OpenAI, etc.)
3. Configure o modelo preferido

### Passo 4: Instalar o AIOS

```bash
cd seu-projeto
npx @anthropic/aios init
# Selecione "Cline" quando solicitado
```

### Passo 5: Verificar a Instalação

```bash
ls -la .cline/
```

Estrutura esperada:

```
.cline/
├── rules.md           # Configuração principal de regras
├── agents/            # Definições de agentes
│   ├── dev.md
│   ├── qa.md
│   └── ...
└── settings.json      # Configurações locais
```

---

## Configuração

### Arquivo de Regras

**Localização:** `.cline/rules.md`

```markdown
# Regras Synkra AIOS para Cline

## Sistema de Agentes

- Ative agentes com @nome-agente
- Siga workflows específicos do agente

## Padrões de Desenvolvimento

- Escreva código limpo e testado
- Siga padrões existentes
- Inclua tratamento de erros
```

### Arquivos de Agentes

**Localização:** `.cline/agents/`

```markdown
# Agente Desenvolvedor (@dev)

## Papel

Desenvolvedor Full Stack Sênior

## Expertise

- TypeScript/JavaScript
- Node.js, React
- Design de banco de dados

## Fluxo de Trabalho

1. Entender requisitos
2. Planejar implementação
3. Escrever código testado
```

### Configurações do Cline

Configure nas configurações do VS Code ou `.cline/settings.json`:

```json
{
  "cline.apiProvider": "anthropic",
  "cline.model": "claude-3-5-sonnet",
  "cline.autoApprove": {
    "read": true,
    "write": false,
    "execute": false
  }
}
```

---

## Uso Básico

### Abrindo o Cline

1. Abra a Paleta de Comandos (`Cmd/Ctrl + Shift + P`)
2. Digite "Cline: Open"
3. Ou use o ícone da barra lateral

### Ativando Agentes

Use @mentions no chat do Cline:

```
@dev         # Agente desenvolvedor
@qa          # Agente engenheiro de QA
@architect   # Arquiteto de software
@pm          # Gerente de projeto
@po          # Product owner
@analyst     # Analista de negócios
@devops      # Engenheiro DevOps
```

### Exemplos de Interação

```
@dev Crie um endpoint REST API para registro de usuário

@qa Revise o módulo de autenticação para problemas de segurança

@architect Projete o schema do banco de dados para o sistema de e-commerce
```

### Fluxo de Aprovação

O Cline pede aprovação antes de:

- Criar/modificar arquivos
- Executar comandos no terminal
- Fazer alterações significativas

```
[Cline quer editar src/auth.ts]
[Permitir] [Negar] [Permitir Todos]
```

---

## Uso Avançado

### Operações Multi-Arquivo

```
@dev Crie um módulo CRUD completo para produtos:
- Modelo em src/models/
- Repositório em src/repositories/
- Serviço em src/services/
- Controller em src/control
```