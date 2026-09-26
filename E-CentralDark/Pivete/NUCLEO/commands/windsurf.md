# COMANDO - windsurf.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\platforms\windsurf.md
**SHA:** 4d8341eb96890aa9
**Timestamp:** 2026-08-28T02:02:35.554732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm test
- - run: npm run build
- - run: npm run deploy

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/platforms/en/windsurf.md | Sincronización: 2026-01-26 -->

# Guía de AIOS para Windsurf

> 🌐 [EN](../../platforms/windsurf.md) | [PT](../../pt/platforms/windsurf.md) | **ES**

---

> **Entorno de Desarrollo Impulsado por IA** - Innovación en Flujo Cascade

---

## Descripción General

### ¿Qué es Windsurf?

Windsurf es un entorno de desarrollo impulsado por IA que introduce "Cascade" - un enfoque innovador para codificación asistida por IA que mantiene contexto en múltiples interacciones y archivos. Construido para desarrolladores que desean una integración profunda de IA en su flujo de trabajo.

### ¿Por qué usar AIOS con Windsurf?

Windsurf ofrece capacidades únicas para AIOS:

- **Cascade Flow**: Mantiene contexto en operaciones complejas
- **Activación @mention**: Sintaxis natural de activación de agentes
- **Supercomplete**: Completación de código avanzada
- **Sistema de Flows**: Ejecución automatizada de flujos de trabajo
- **Soporte MCP**: Extensible mediante configuración
- **Formato Etiquetado XML**: Procesamiento estructurado de reglas

### Comparación con Otras Plataformas

| Característica      | Windsurf | Cursor | Claude Code |
| ------------------- | :------: | :----: | :---------: |
| Cascade Flow        |    Sí    |   No   |     No      |
| Activación @mention |    Sí    |   Sí   |  /command   |
| Supercomplete       |    Sí    |  Tab   |     Tab     |
| Soporte MCP         |  Config  | Config |   Nativo    |
| Formato Reglas XML  |    Sí    |   No   |     No      |

---

## Requisitos

### Requisitos del Sistema

| Requisito            | Mínimo                           | Recomendado  |
| -------------------- | -------------------------------- | ------------ |
| **RAM**              | 4GB                              | 8GB+         |
| **Espacio en Disco** | 500MB                            | 1GB+         |
| **SO**               | macOS 10.15+, Windows 10+, Linux | Más reciente |
| **Node.js**          | 18.0+ (para AIOS)                | 20.0+        |

### Requisitos de Cuenta

- **Cuenta Windsurf** (capa gratuita disponible)
- **Claves API** (opcional): Configurar modelos externos

---

## Instalación

### Paso 1: Instalar Windsurf

1. Descargar desde [codeium.com/windsurf](https://codeium.com/windsurf)
2. Ejecutar el instalador
3. Abrir y crear cuenta

```bash
# macOS (vía Homebrew si está disponible)
brew install --cask windsurf

# O descargar directamente
```

### Paso 2: Instalar AIOS

```bash
cd your-project
npx @anthropic/aios init
# Seleccionar "Windsurf" cuando se solicite
```

### Paso 3: Verificar Instalación

```bash
ls -la .windsurfrules
ls -la .windsurf/
```

Estructura esperada:

```
project/
├── .windsurfrules          # Archivo principal de reglas
└── .windsurf/
    └── rules/              # Reglas de agentes
        ├── dev.md
        ├── qa.md
        └── ...
```

---

## Configuración

### Archivo Principal de Reglas

**Ubicación:** `.windsurfrules` (directorio raíz)

Este archivo utiliza formato de markdown etiquetado en XML:

```markdown
<rules>
# Reglas de Desarrollo Synkra AIOS

## Integración de Agentes

- Usar @agent-name para activar agentes
- Seguir flujos de trabajo específicos de agentes

## Estándares de Desarrollo

- Escribir código limpio y probado
- Seguir convenciones del proyecto
  </rules>

<context>
El contexto específico del proyecto va aquí
</context>
```

### Reglas de Agentes

**Ubicación:** `.windsurf/rules/`

Cada archivo de agente sigue el formato etiquetado en XML:

```markdown
<agent name="dev">
# Agente Desarrollador

## Experiencia

- Desarrollo full-stack
- Prácticas de código limpio

## Flujo de Trabajo

1. Entender requisitos
2. Planificar implementación
3. Escribir código probado
   </agent>
```

### Configuración MCP

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

---

## Uso Básico

### Iniciar Windsurf

1. Abrir tu proyecto en Windsurf
2. Las reglas se cargan automáticamente desde `.windsurfrules`
3. Usar el panel de IA para interacciones

### Activar Agentes

Usar @mentions en el chat de IA:

```
@dev         # Agente Desarrollador
@qa          # Agente Ingeniero QA
@architect   # Arquitecto de Software
@pm          # Gerente de Proyecto
@po          # Propietario del Producto
@sm          # Maestro Scrum
@analyst     # Analista de Negocios
@devops      # Ingeniero DevOps
```

### Ejemplo de Interacciones

```
@dev implementar la autenticación de usuario siguiendo la historia

@qa revisar este módulo por vulnerabilidades de seguridad

@architect diseñar la arquitectura del API gateway
```

### Usar Cascade

Cascade mantiene contexto en las interacciones:

```
# Primera interacción
@dev Crear un modelo de usuario con validación

# Cascade recuerda el contexto
Ahora agregar la capa de repositorio

# Continúa con el mismo contexto
Agregar pruebas unitarias para el repositorio
```

---

#
```

---

# COMANDO - windsurf.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\platforms\windsurf.md
**SHA:** 35c25d5a4afbcb12
**Timestamp:** 2026-08-28T02:02:40.018682
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm test
- - run: npm run build
- - run: npm run deploy

### Ouro Bruto (primeiros 5000 chars)
```
# Guia AIOS para Windsurf

> 🌐 [EN](../../platforms/windsurf.md) | **PT** | [ES](../../es/platforms/windsurf.md)

---

> **Ambiente de Desenvolvimento com IA** - Inovação Cascade Flow

---

## Visão Geral

### O que é o Windsurf?

Windsurf é um ambiente de desenvolvimento com IA que introduz o "Cascade" - uma abordagem inovadora para codificação assistida por IA que mantém contexto através de múltiplas interações e arquivos. Construído para desenvolvedores que querem integração profunda de IA em seu fluxo de trabalho.

### Por que usar AIOS com Windsurf?

O Windsurf oferece capacidades únicas para o AIOS:

- **Cascade Flow**: Mantém contexto através de operações complexas
- **Ativação @mention**: Sintaxe natural de ativação de agentes
- **Supercomplete**: Completação avançada de código
- **Sistema de Flows**: Execução automatizada de workflows
- **Suporte MCP**: Extensível via configuração
- **Formato XML-tagged**: Processamento estruturado de regras

### Comparação com Outras Plataformas

| Recurso           | Windsurf | Cursor | Claude Code |
| ----------------- | :------: | :----: | :---------: |
| Cascade Flow      |   Sim    |  Não   |     Não     |
| Ativação @mention |   Sim    |  Sim   |  /comando   |
| Supercomplete     |   Sim    |  Tab   |     Tab     |
| Suporte MCP       |  Config  | Config |   Nativo    |
| Formato XML       |   Sim    |  Não   |     Não     |

---

## Requisitos

### Requisitos de Sistema

| Requisito           | Mínimo                           | Recomendado   |
| ------------------- | -------------------------------- | ------------- |
| **RAM**             | 4GB                              | 8GB+          |
| **Espaço em Disco** | 500MB                            | 1GB+          |
| **SO**              | macOS 10.15+, Windows 10+, Linux | Última versão |
| **Node.js**         | 18.0+ (para AIOS)                | 20.0+         |

### Requisitos de Conta

- **Conta Windsurf** (tier gratuito disponível)
- **Chaves de API** (opcional): Configurar modelos externos

---

## Instalação

### Passo 1: Instalar o Windsurf

1. Baixe em [codeium.com/windsurf](https://codeium.com/windsurf)
2. Execute o instalador
3. Inicie e crie conta

```bash
# macOS (via Homebrew se disponível)
brew install --cask windsurf

# Ou baixe diretamente
```

### Passo 2: Instalar o AIOS

```bash
cd seu-projeto
npx @anthropic/aios init
# Selecione "Windsurf" quando solicitado
```

### Passo 3: Verificar a Instalação

```bash
ls -la .windsurfrules
ls -la .windsurf/
```

Estrutura esperada:

```
projeto/
├── .windsurfrules          # Arquivo de regras principal
└── .windsurf/
    └── rules/              # Regras de agentes
        ├── dev.md
        ├── qa.md
        └── ...
```

---

## Configuração

### Arquivo de Regras Principal

**Localização:** `.windsurfrules` (diretório raiz)

Este arquivo usa formato markdown com tags XML:

```markdown
<rules>
# Regras de Desenvolvimento Synkra AIOS

## Integração de Agentes

- Use @nome-agente para ativar agentes
- Siga workflows específicos do agente

## Padrões de Desenvolvimento

- Escreva código limpo e testado
- Siga convenções do projeto
  </rules>

<context>
Contexto específico do projeto vai aqui
</context>
```

### Regras de Agentes

**Localização:** `.windsurf/rules/`

Cada arquivo de agente segue o formato XML-tagged:

```markdown
<agent name="dev">
# Agente Desenvolvedor

## Expertise

- Desenvolvimento full-stack
- Práticas de código limpo

## Fluxo de Trabalho

1. Entender requisitos
2. Planejar implementação
3. Escrever código testado
   </agent>
```

### Configuração MCP

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

---

## Uso Básico

### Iniciando o Windsurf

1. Abra seu projeto no Windsurf
2. Regras são carregadas automaticamente de `.windsurfrules`
3. Use o painel de IA para interações

### Ativando Agentes

Use @mentions no chat de IA:

```
@dev         # Agente desenvolvedor
@qa          # Agente engenheiro de QA
@architect   # Arquiteto de software
@pm          # Gerente de projeto
@po          # Product owner
@sm          # Scrum master
@analyst     # Analista de negócios
@devops      # Engenheiro DevOps
```

### Exemplos de Interação

```
@dev implemente a autenticação de usuário seguindo a story

@qa revise este módulo para vulnerabilidades de segurança

@architect projete a arquitetura do API gateway
```

### Usando o Cascade

O Cascade mantém contexto entre interações:

```
# Primeira interação
@dev Crie um modelo de usuário com validação

# O Cascade lembra o contexto
Agora adicione a camada de repositório

# Continua com o mesmo contexto
Adicione testes unitários para o repositório
```

---

## Uso Avançado

### Workflows Cascade

#### Implementação Multi-etapa

```
@dev @cascade
1. Criar o schema do banco de dados
2. Gerar migrations
3. Implementar a camada de modelo
4. Adicionar endpoints de API
5. Escrever testes de integr
```