# COMANDO - squad-migration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\squad-migration.md
**SHA:** 6cbc6e12ee78cc6b
**Timestamp:** 2026-08-28T02:02:35.080681
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Comando:**
- **Comando:**
- **Comando:**
- dryRun: false,

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traduccion: ES
  Original: /docs/en/guides/squad-migration.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Migracion de Squad

> 🌐 [EN](../../guides/squad-migration.md) | [PT](../../pt/guides/squad-migration.md) | **ES**

---

Como migrar squads legacy al formato AIOS 2.1.

## Descripcion General

AIOS 2.1 introdujo un nuevo formato de squad con:

- Arquitectura task-first
- Validacion con JSON Schema
- Distribucion de tres niveles
- Manifiesto estandarizado (`squad.yaml`)

Los squads legacy que usan `config.yaml` o formatos antiguos necesitan migracion.

## Detectando Squads Legacy

### Senales de Formato Legacy

| Indicador             | Legacy        | Actual (2.1+)              |
| --------------------- | ------------- | -------------------------- |
| Archivo de manifiesto | `config.yaml` | `squad.yaml`               |
| Campo de tipo AIOS    | Faltante      | `aios.type: squad`         |
| Version minima        | Faltante      | `aios.minVersion: "2.1.0"` |
| Estructura            | Agent-first   | Task-first                 |

### Comando de Verificacion

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

La salida indicara si se necesita migracion:

```
⚠️ Formato legacy detectado (config.yaml)
   Ejecutar: *migrate-squad ./squads/legacy-squad
```

## Comando de Migracion

### Vista Previa de Cambios (Recomendado Primero)

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

Muestra lo que cambiara sin modificar archivos.

### Ejecutar Migracion

```bash
*migrate-squad ./squads/legacy-squad
```

### Salida Detallada

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

Muestra el progreso detallado paso a paso.

## Que se Migra

### 1. Renombrado de Manifiesto

```
config.yaml → squad.yaml
```

### 2. Campos Agregados

```yaml
# Estos campos se agregan si faltan
aios:
  minVersion: '2.1.0'
  type: squad
```

### 3. Normalizacion de Estructura

Los componentes se reorganizan en la estructura estandar:

```
Antes:
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

Despues:
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. Conversion de Formato de Archivos

Los archivos YAML de agentes se convierten a formato Markdown:

```yaml
# Antes: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# Despues: agents/my-agent.md

# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
name: my-agent
...
\`\`\`
```

## Escenarios de Migracion

### Escenario 1: Squad Simple (solo config.yaml)

**Antes:**

```
my-squad/
├── config.yaml
└── README.md
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Despues:**

```
my-squad/
├── squad.yaml         # Renombrado + actualizado
├── README.md
└── .backup/           # Respaldo creado
    └── pre-migration-2025-12-26/
```

### Escenario 2: Squad con Agentes YAML

**Antes:**

```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Despues:**

```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # Convertido a MD
├── tasks/
│   └── task.md        # Convertido a MD
└── .backup/
```

### Escenario 3: Migracion Parcial (Ya Tiene Algunas Caracteristicas 2.1)

**Antes:**

```
my-squad/
├── squad.yaml         # Ya renombrado
├── agent.yaml         # Aun formato YAML
└── tasks/
    └── task.md        # Ya formato MD
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Resultado:**

- Agrega campos `aios` faltantes al manifiesto
- Convierte archivos YAML restantes
- Omite archivos ya migrados

## Respaldo y Rollback

### Respaldo Automatico

Cada migracion crea un respaldo:

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # Manifiesto original
    ├── agent.yaml     # Archivos originales
    └── ...
```

### Rollback Manual

```bash
# Listar respaldos
ls ./squads/my-squad/.backup/

# Restaurar respaldo especifico
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### Rollback Programatico

```javascript
const { SquadMigrator } = require('./.aios-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## Solucion de Problemas

### "Manifest not found"

```
Error: No manifest found (config.yaml or squad.yaml)
```

**Solucion:** Crear un manifiesto basico:

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: Mi squad

aios:
  minVersion: '2.1.0'
  type: squad

components:
  agents: []
  tasks: []
```

### "Invalid YAML syntax"

```
Error: YAML parse error at line 15
```

**Solucion:**

1. Verificar sintaxis YAML con un validador
2. Problemas comunes: tabs (usar espacios), comillas faltantes
3. Corregir errores, luego reintentar migracion

### "Backup failed"

```
Error: Could not create backup directory
```

**Solucion:**

1. Verificar permisos de escritura: `chmod 755 ./squads/my-squad`
2. Verificar espacio en disco
3. Intentar con sudo (si es aprop
```

---

# COMANDO - squad-migration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\squad-migration.md
**SHA:** a8c66ef2488e1bb7
**Timestamp:** 2026-08-28T02:02:39.553964
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Execute: *migrate-squad ./squads/legacy-squad
- **Comando:**
- **Comando:**
- **Comando:**
- dryRun: false,

### Padroes
- Componentes são reorganizados na estrutura padrão:

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/guides/squad-migration.md
  Última sincronização: 2026-01-26
-->

# Guia de Migração de Squad

> 🌐 [EN](../../guides/squad-migration.md) | **PT** | [ES](../../es/guides/squad-migration.md)

---

Como migrar squads legados para o formato AIOS 2.1.

## Visão Geral

AIOS 2.1 introduziu um novo formato de squad com:

- Arquitetura task-first
- Validação JSON Schema
- Distribuição em três níveis
- Manifesto padronizado (`squad.yaml`)

Squads legados usando `config.yaml` ou formatos mais antigos precisam de migração.

## Detectando Squads Legados

### Sinais de Formato Legado

| Indicador            | Legado        | Atual (2.1+)               |
| -------------------- | ------------- | -------------------------- |
| Arquivo de manifesto | `config.yaml` | `squad.yaml`               |
| Campo AIOS type      | Ausente       | `aios.type: squad`         |
| Versão mínima        | Ausente       | `aios.minVersion: "2.1.0"` |
| Estrutura            | Agent-first   | Task-first                 |

### Comando de Verificação

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

A saída indicará se migração é necessária:

```
⚠️ Formato legado detectado (config.yaml)
   Execute: *migrate-squad ./squads/legacy-squad
```

## Comando de Migração

### Pré-visualizar Mudanças (Recomendado Primeiro)

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

Mostra o que mudará sem modificar arquivos.

### Executar Migração

```bash
*migrate-squad ./squads/legacy-squad
```

### Saída Detalhada

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

Mostra progresso detalhado passo a passo.

## O Que É Migrado

### 1. Renomeação do Manifesto

```
config.yaml → squad.yaml
```

### 2. Campos Adicionados

```yaml
# Estes campos são adicionados se ausentes
aios:
  minVersion: '2.1.0'
  type: squad
```

### 3. Normalização de Estrutura

Componentes são reorganizados na estrutura padrão:

```
Antes:
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

Depois:
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. Conversão de Formato de Arquivo

Arquivos YAML de agent são convertidos para formato Markdown:

```yaml
# Antes: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# Depois: agents/my-agent.md

# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
name: my-agent
...
\`\`\`
```

## Cenários de Migração

### Cenário 1: Squad Simples (apenas config.yaml)

**Antes:**

```
my-squad/
├── config.yaml
└── README.md
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Depois:**

```
my-squad/
├── squad.yaml         # Renomeado + atualizado
├── README.md
└── .backup/           # Backup criado
    └── pre-migration-2025-12-26/
```

### Cenário 2: Squad com Agents YAML

**Antes:**

```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Depois:**

```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # Convertido para MD
├── tasks/
│   └── task.md        # Convertido para MD
└── .backup/
```

### Cenário 3: Migração Parcial (Já Tem Alguns Recursos 2.1)

**Antes:**

```
my-squad/
├── squad.yaml         # Já renomeado
├── agent.yaml         # Ainda formato YAML
└── tasks/
    └── task.md        # Já formato MD
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Resultado:**

- Adiciona campos `aios` ausentes ao manifesto
- Converte arquivos YAML restantes
- Pula arquivos já migrados

## Backup & Rollback

### Backup Automático

Toda migração cria um backup:

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # Manifesto original
    ├── agent.yaml     # Arquivos originais
    └── ...
```

### Rollback Manual

```bash
# Listar backups
ls ./squads/my-squad/.backup/

# Restaurar backup específico
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### Rollback Programático

```javascript
const { SquadMigrator } = require('./.aios-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## Solução de Problemas

### "Manifesto não encontrado"

```
Error: No manifest found (config.yaml or squad.yaml)
```

**Solução:** Crie um manifesto básico:

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: Meu squad

aios:
  minVersion: '2.1.0'
  type: squad

components:
  agents: []
  tasks: []
```

### "Sintaxe YAML inválida"

```
Error: YAML parse error at line 15
```

**Solução:**

1. Verifique sintaxe YAML com um linter
2. Problemas comuns: tabs (use espaços), aspas faltando
3. Corrija erros, depois tente a migração novamente

### "Falha no backup"

```
Error: Could not create backup directory
```

**Solução:**

1. Verifique permissões de escrita: `chmod 755 ./squads/my-squad`
2. Verifique espaço em disco
3. Tente com sudo (se apropriado)

### "Migração incompleta"

```
Warning: Some files could not be mi
```