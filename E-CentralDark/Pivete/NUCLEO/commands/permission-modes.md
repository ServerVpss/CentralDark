# COMANDO - permission-modes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\permission-modes.md
**SHA:** 04a37636be743618
**Timestamp:** 2026-08-28T02:02:34.967163
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- │  Execute: ❌         │  Execute: ⚠️ confirm│  Execute: ✅       │
- - execute: npm install lodash
- - execute: npm test
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traduccion: ES
  Original: /docs/guides/permission-modes.md
  Ultima sincronizacion: 2026-01-29
-->

# Guia de Modos de Permisos

> Controla cuanta autonomia tienen los agentes AIOS sobre tu sistema.

---

## Vision General

Los Modos de Permisos te permiten controlar el nivel de autonomia que tienen los agentes AIOS. Ya sea que estes explorando un nuevo codebase o ejecutando builds completamente autonomos, hay un modo para tu flujo de trabajo.

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 EXPLORE         │  ⚠️ ASK             │  ⚡ AUTO           │
│  Navegacion segura  │  Confirmar cambios  │  Autonomia total  │
├─────────────────────────────────────────────────────────────┤
│  Read: ✅            │  Read: ✅            │  Read: ✅          │
│  Write: ❌           │  Write: ⚠️ confirmar│  Write: ✅         │
│  Execute: ❌         │  Execute: ⚠️ confirm│  Execute: ✅       │
│  Delete: ❌          │  Delete: ⚠️ confirmar│  Delete: ✅        │
└─────────────────────────────────────────────────────────────┘
```

---

## Inicio Rapido

```bash
# Verificar modo actual
*mode

# Cambiar a modo explore (seguro)
*mode explore

# Cambiar a modo ask (equilibrado - por defecto)
*mode ask

# Cambiar a modo auto (yolo)
*mode auto
# o
*yolo
```

---

## Modos Explicados

### 🔍 Modo Explore

**Mejor para:** Primera exploracion, aprender un codebase, auditorias de solo lectura

```
*mode explore
```

En modo Explore:

- ✅ Leer cualquier archivo
- ✅ Buscar en el codebase
- ✅ Ejecutar comandos de solo lectura (git status, ls, etc.)
- ❌ No puede escribir o editar archivos
- ❌ No puede ejecutar comandos potencialmente destructivos
- ❌ No puede ejecutar operaciones de build/deploy

**Ejemplos de operaciones bloqueadas:**

- Herramientas `Write` / `Edit`
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ Modo Ask (Por Defecto)

**Mejor para:** Desarrollo diario, equilibrio entre seguridad y productividad

```
*mode ask
```

En modo Ask:

- ✅ Leer cualquier archivo
- ⚠️ Operaciones de escritura requieren confirmacion
- ⚠️ Operaciones de ejecucion requieren confirmacion
- ⚠️ Operaciones destructivas requieren aprobacion explicita

**Flujo de confirmacion:**

```
⚠️ Confirmacion Requerida

Operacion: write
Herramienta: Edit

Archivo: `src/components/Button.tsx`

[Proceder] [Omitir] [Cambiar a Auto]
```

---

### ⚡ Modo Auto

**Mejor para:** Usuarios avanzados, builds autonomos, flujos de trabajo confiables

```
*mode auto
# o
*yolo
```

En modo Auto:

- ✅ Acceso completo de lectura
- ✅ Acceso completo de escritura
- ✅ Acceso completo de ejecucion
- ✅ Sin confirmaciones requeridas

**Advertencia:** Usar con precaucion. El agente puede modificar y eliminar archivos sin preguntar.

---

## Indicador de Modo

Tu modo actual siempre es visible en el saludo del agente:

```
🏛️ Aria (Architect) listo! [⚠️ Ask]

Comandos Rapidos:
...
```

La insignia muestra:

- `[🔍 Explore]` - Modo solo lectura
- `[⚠️ Ask]` - Modo confirmacion (por defecto)
- `[⚡ Auto]` - Modo autonomia total

---

## Configuracion

El modo se persiste en `.aios/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## Clasificacion de Operaciones

El sistema clasifica las operaciones en 4 tipos:

| Tipo        | Ejemplos                                        |
| ----------- | ----------------------------------------------- |
| **read**    | `Read`, `Glob`, `Grep`, `git status`, `ls`      |
| **write**   | `Write`, `Edit`, `mkdir`, `touch`, `git commit` |
| **execute** | `npm install`, `npm run`, ejecucion de tasks    |
| **delete**  | `rm`, `git reset --hard`, `DROP TABLE`          |

### Comandos Seguros (Siempre Permitidos)

Estos comandos siempre estan permitidos, incluso en modo Explore:

```bash
# Git (solo lectura)
git status, git log, git diff, git branch

# Sistema de archivos (solo lectura)
ls, pwd, cat, head, tail, wc, find, grep

# Informacion de paquetes
npm list, npm outdated, npm audit

# Informacion del sistema
node --version, npm --version, uname, whoami
```

### Comandos Destructivos (Precaucion Extra)

Estos activan la clasificacion de delete y requieren aprobacion explicita incluso en modo Ask:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## Integracion con ADE

El Autonomous Development Engine (ADE) respeta los modos de permisos:

| Modo        | Comportamiento ADE              |
| ----------- | ------------------------------- |
| **Explore** | Solo planifica, sin ejecucion   |
| **Ask**     | Agrupa operaciones para aprobar |
| **Auto**    | Ejecucion autonoma completa     |

### Aprobacion por Lotes en Modo Ask

Al ejecutar flujos de trabajo autonomos, las operaciones se agrupan:

```
⚠️ Confirmacion por Lotes

Las siguientes 5 operaciones seran ejecutadas:
- write: Crear src/components/NewFeature.tsx
- write: Actualizar src/index.ts
- execute: npm install lodash
- write: Agregar tests/newFeature.test.ts
- execute: npm tes
```

---

# COMANDO - permission-modes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\permission-modes.md
**SHA:** 7bf6356f865404d4
**Timestamp:** 2026-08-28T02:02:39.466043
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - execute: npm install lodash
- - execute: npm test
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/guides/permission-modes.md
  Última sincronização: 2026-01-29
-->

# Guia de Modos de Permissão

> Controle o nível de autonomia que os agentes AIOS têm sobre seu sistema.

---

## Visão Geral

Os Modos de Permissão permitem controlar o nível de autonomia dos agentes AIOS. Seja explorando um novo codebase ou executando builds totalmente autônomos, há um modo para seu workflow.

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 EXPLORAR        │  ⚠️ PERGUNTAR       │  ⚡ AUTO           │
│  Navegação segura   │  Confirmar mudanças │  Autonomia total  │
├─────────────────────────────────────────────────────────────┤
│  Ler: ✅            │  Ler: ✅             │  Ler: ✅          │
│  Escrever: ❌       │  Escrever: ⚠️ confirmar │  Escrever: ✅  │
│  Executar: ❌       │  Executar: ⚠️ confirmar │  Executar: ✅  │
│  Deletar: ❌        │  Deletar: ⚠️ confirmar  │  Deletar: ✅   │
└─────────────────────────────────────────────────────────────┘
```

---

## Início Rápido

```bash
# Verificar modo atual
*mode

# Mudar para modo explorar (seguro)
*mode explore

# Mudar para modo perguntar (balanceado - padrão)
*mode ask

# Mudar para modo auto (yolo)
*mode auto
# ou
*yolo
```

---

## Modos Explicados

### 🔍 Modo Explorar

**Melhor para:** Primeira exploração, aprender um codebase, auditorias somente leitura

```
*mode explore
```

No modo Explorar:

- ✅ Ler qualquer arquivo
- ✅ Pesquisar no codebase
- ✅ Executar comandos somente leitura (git status, ls, etc.)
- ❌ Não pode escrever ou editar arquivos
- ❌ Não pode executar comandos potencialmente destrutivos
- ❌ Não pode executar operações de build/deploy

**Exemplos de operações bloqueadas:**

- Ferramentas `Write` / `Edit`
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ Modo Perguntar (Padrão)

**Melhor para:** Desenvolvimento diário, equilíbrio entre segurança e produtividade

```
*mode ask
```

No modo Perguntar:

- ✅ Ler qualquer arquivo
- ⚠️ Operações de escrita requerem confirmação
- ⚠️ Operações de execução requerem confirmação
- ⚠️ Operações destrutivas requerem aprovação explícita

**Fluxo de confirmação:**

```
⚠️ Confirmação Necessária

Operação: write
Ferramenta: Edit

Arquivo: `src/components/Button.tsx`

[Prosseguir] [Pular] [Mudar para Auto]
```

---

### ⚡ Modo Auto

**Melhor para:** Usuários avançados, builds autônomos, workflows confiáveis

```
*mode auto
# ou
*yolo
```

No modo Auto:

- ✅ Acesso total de leitura
- ✅ Acesso total de escrita
- ✅ Acesso total de execução
- ✅ Sem confirmações necessárias

**Aviso:** Use com cautela. O agente pode modificar e deletar arquivos sem perguntar.

---

## Indicador de Modo

Seu modo atual está sempre visível na saudação do agente:

```
🏛️ Aria (Architect) pronta! [⚠️ Perguntar]

Comandos Rápidos:
...
```

O badge mostra:

- `[🔍 Explorar]` - Modo somente leitura
- `[⚠️ Perguntar]` - Modo com confirmação (padrão)
- `[⚡ Auto]` - Modo autonomia total

---

## Configuração

O modo é persistido em `.aios/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## Classificação de Operações

O sistema classifica operações em 4 tipos:

| Tipo        | Exemplos                                        |
| ----------- | ----------------------------------------------- |
| **read**    | `Read`, `Glob`, `Grep`, `git status`, `ls`      |
| **write**   | `Write`, `Edit`, `mkdir`, `touch`, `git commit` |
| **execute** | `npm install`, `npm run`, execução de tasks     |
| **delete**  | `rm`, `git reset --hard`, `DROP TABLE`          |

### Comandos Seguros (Sempre Permitidos)

Estes comandos são sempre permitidos, mesmo no modo Explorar:

```bash
# Git (somente leitura)
git status, git log, git diff, git branch

# Sistema de arquivos (somente leitura)
ls, pwd, cat, head, tail, wc, find, grep

# Informações de pacotes
npm list, npm outdated, npm audit

# Informações do sistema
node --version, npm --version, uname, whoami
```

### Comandos Destrutivos (Cautela Extra)

Estes disparam classificação delete e requerem aprovação explícita mesmo no modo Perguntar:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## Integração com ADE

O Autonomous Development Engine (ADE) respeita os modos de permissão:

| Modo          | Comportamento do ADE              |
| ------------- | --------------------------------- |
| **Explorar**  | Apenas planejamento, sem execução |
| **Perguntar** | Agrupa operações para aprovação   |
| **Auto**      | Execução totalmente autônoma      |

### Aprovação em Lote no Modo Perguntar

Ao executar workflows autônomos, operações são agrupadas:

```
⚠️ Confirmação em Lote

As seguintes 5 operações serão executadas:
- write: Criar src/components/NewFeature.tsx
- write: Atualizar src/index.ts
- execute: npm install lodash
- write: Adicionar tests/newFeature.test.ts
- execute: npm test

[Aprovar Todas] [Revisar Cada] [Cancelar]
```

---

## Melhores Práticas

### P
```