# COMANDO - hcs-self-healing-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\hcs-self-healing-spec.md
**SHA:** 20dbe2560f3e12fa
**Timestamp:** 2026-08-28T02:02:34.419936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: '¿Crear coding-standards.md desde plantilla?'
- prompt: '¿Actualizar 3 paquetes con parches de seguridad?'

### Gaps
- ¿Aplicar corrección? [S]í / [N]o / [O]mitir todo: s
- ¿Aplicar corrección? [S]í / [N]o / [O]mitir todo: s

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/en/architecture/hcs-self-healing-spec.md | Sincronización: 2026-01-26 -->

# Especificación de Auto-reparación HCS

> 🌐 [EN](../../architecture/hcs-self-healing-spec.md) | [PT](../../pt/architecture/hcs-self-healing-spec.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Filosofía de Auto-reparación](#filosofía-de-auto-reparación)
- [Definiciones de Niveles](#definiciones-de-niveles)
- [Reglas de Seguridad](#reglas-de-seguridad)
- [Estrategia de Respaldo](#estrategia-de-respaldo)
- [Procedimientos de Reversión](#procedimientos-de-reversión)
- [Directrices de Implementación](#directrices-de-implementación)

---

## Resumen Ejecutivo

Este documento especifica las capacidades de auto-reparación del Sistema de Verificación de Salud de AIOS (HCS). La auto-reparación permite que el sistema corrija automáticamente ciertos problemas mientras mantiene la seguridad y el control del usuario.

### Principios Fundamentales

1. **Seguridad Primero:** Nunca modificar archivos que puedan causar pérdida de datos o problemas de seguridad
2. **Transparencia:** Todas las acciones se registran y son reversibles
3. **Control del Usuario:** Las correcciones críticas requieren confirmación explícita
4. **Incremental:** Comenzar con correcciones seguras, escalar al usuario para problemas complejos

---

## Filosofía de Auto-reparación

### Patrones de la Industria Aplicados

| Sistema        | Enfoque de Auto-reparación                       | Lección para HCS                                   |
| -------------- | ------------------------------------------------ | -------------------------------------------------- |
| **Kubernetes** | Reiniciar contenedores ante falla de liveness    | Recuperación automática para operaciones conocidas |
| **VS Code**    | Auto-actualizar extensiones, bloquear maliciosas | Actualizaciones silenciosas, bloqueos explícitos   |
| **Terraform**  | `apply` solo después de aprobación de `plan`     | Separar detección de remediación                   |
| **npm/yarn**   | `--update-checksums` para corregir integridad    | Comandos de recuperación iniciados por usuario     |
| **Git**        | `reflog` para recuperación                       | Siempre preservar historial/respaldos              |

### Árbol de Decisión

```
Problema Detectado
     │
     ▼
┌─────────────────┐
│ ¿Es la corrección│
│ trivial y        │
│ reversible?      │
└────────┬────────┘
         │
    Sí   │  No
    ▼    │  ▼
┌────────┴──────────┐
│                   │
▼                   ▼
Nivel 1          ┌─────────────────┐
Auto-corregir    │ ¿La corrección  │
silenciosamente  │ modifica datos/ │
                 │ código del      │
                 │ usuario?        │
                 └────────┬────────┘
                          │
                     No   │   Sí
                     ▼    │   ▼
                 ┌────────┴──────────┐
                 │                   │
                 ▼                   ▼
              Nivel 2             Nivel 3
              Solicitar           Guía
              Usuario             Manual
```

---

## Definiciones de Niveles

### Nivel 1: Auto-corrección Silenciosa

**Definición:** Operaciones seguras y reversibles que no requieren confirmación del usuario.

**Características:**

- Cero riesgo de pérdida de datos
- Completamente reversible
- Sin cambios en código/configuración del usuario
- Solo archivos del sistema/framework
- Respaldo siempre creado

**Acciones:**

| Acción                 | Descripción                                           | Respaldo     |
| ---------------------- | ----------------------------------------------------- | ------------ |
| `recreate_config`      | Recrear `.aios/config.yaml` faltante desde plantilla  | Sí           |
| `clear_cache`          | Limpiar archivos de caché obsoletos en `.aios/cache/` | Sí           |
| `create_dirs`          | Crear directorios faltantes del framework             | No (aditivo) |
| `fix_permissions`      | Corregir permisos en archivos del framework           | Sí           |
| `regenerate_lockfile`  | Regenerar integridad del lockfile de paquetes         | Sí           |
| `restart_mcp`          | Reiniciar servidores MCP que no responden             | No           |
| `reset_project_status` | Resetear archivo de estado del proyecto corrupto      | Sí           |

**Ejemplos de Problemas:**

```yaml
# Problemas de Nivel 1 - auto-corregir silenciosamente
- id: PC-001
  description: '.aios/config.yaml faltante'
  severity: CRITICAL
  tier: 1
  action: recreate_config
  message: 'Config recreado desde plantilla'

- id: LE-005
  description: 'Servidor MCP no responde'
  severity: HIGH
  tier: 1
  action: restart_mcp
  message: 'Servidor MCP reiniciado'

- id: RH-008
  description: '.gitignore incompleto'
  seve
```

---

# COMANDO - hcs-self-healing-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\hcs-self-healing-spec.md
**SHA:** 672b7a7787c2805d
**Timestamp:** 2026-08-28T02:02:38.753274
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'Criar coding-standards.md a partir do template?'
- prompt: 'Atualizar 3 pacotes com patches de segurança?'

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-self-healing-spec.md | Sincronização: 2026-01-26 -->

# Especificação de Auto-Recuperação do HCS

> 🌐 [EN](../../architecture/hcs-self-healing-spec.md) | **PT** | [ES](../../es/architecture/hcs-self-healing-spec.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Resumo Executivo](#resumo-executivo)
- [Filosofia de Auto-Recuperação](#filosofia-de-auto-recuperação)
- [Definições de Níveis](#definições-de-níveis)
- [Regras de Segurança](#regras-de-segurança)
- [Estratégia de Backup](#estratégia-de-backup)
- [Procedimentos de Rollback](#procedimentos-de-rollback)
- [Diretrizes de Implementação](#diretrizes-de-implementação)

---

## Resumo Executivo

Este documento especifica as capacidades de auto-recuperação do Sistema de Verificação de Saúde do AIOS (HCS). A auto-recuperação permite que o sistema corrija automaticamente certos problemas enquanto mantém a segurança e o controle do usuário.

### Princípios Fundamentais

1. **Segurança em Primeiro Lugar:** Nunca modificar arquivos que possam causar perda de dados ou problemas de segurança
2. **Transparência:** Todas as ações são registradas e reversíveis
3. **Controle do Usuário:** Correções críticas requerem confirmação explícita
4. **Incremental:** Começar com correções seguras, escalar para o usuário em casos complexos

---

## Filosofia de Auto-Recuperação

### Padrões da Indústria Aplicados

| Sistema        | Abordagem de Auto-Recuperação                  | Lição para o HCS                                         |
| -------------- | ---------------------------------------------- | -------------------------------------------------------- |
| **Kubernetes** | Reiniciar containers em falha de liveness      | Recuperação automática para operações seguras conhecidas |
| **VS Code**    | Auto-atualizar extensões, bloquear maliciosas  | Atualizações silenciosas, bloqueios explícitos           |
| **Terraform**  | `apply` apenas após aprovação do `plan`        | Separar detecção de remediação                           |
| **npm/yarn**   | `--update-checksums` para corrigir integridade | Comandos de recuperação iniciados pelo usuário           |
| **Git**        | `reflog` para recuperação                      | Sempre preservar histórico/backups                       |

### Árvore de Decisão

```
Problema Detectado
     │
     ▼
┌─────────────────┐
│ A correção é    │
│ trivial e       │
│ reversível?     │
└────────┬────────┘
         │
    Sim  │  Não
    ▼    │  ▼
┌────────┴──────────┐
│                   │
▼                   ▼
Nível 1          ┌─────────────────┐
Auto-corrigir    │ A correção      │
silenciosamente  │ modifica dados/ │
                 │ código do       │
                 │ usuário?        │
                 └────────┬────────┘
                          │
                     Não  │   Sim
                     ▼    │   ▼
                 ┌────────┴──────────┐
                 │                   │
                 ▼                   ▼
              Nível 2            Nível 3
              Solicitar          Guia
              Usuário            Manual
```

---

## Definições de Níveis

### Nível 1: Auto-Correção Silenciosa

**Definição:** Operações seguras e reversíveis que não requerem confirmação do usuário.

**Características:**

- Zero risco de perda de dados
- Totalmente reversível
- Sem alterações em código/configuração do usuário
- Apenas arquivos de sistema/framework
- Backup sempre criado

**Ações:**

| Ação                   | Descrição                                                | Backup        |
| ---------------------- | -------------------------------------------------------- | ------------- |
| `recreate_config`      | Recriar `.aios/config.yaml` ausente a partir do template | Sim           |
| `clear_cache`          | Limpar arquivos de cache obsoletos em `.aios/cache/`     | Sim           |
| `create_dirs`          | Criar diretórios de framework ausentes                   | Não (aditivo) |
| `fix_permissions`      | Corrigir permissões de arquivos do framework             | Sim           |
| `regenerate_lockfile`  | Regenerar integridade do lockfile de pacotes             | Sim           |
| `restart_mcp`          | Reiniciar servidores MCP não responsivos                 | Não           |
| `reset_project_status` | Resetar arquivo de status do projeto corrompido          | Sim           |

**Exemplos de Problemas:**

```yaml
# Problemas de Nível 1 - auto-corrigir silenciosamente
- id: PC-001
  description: '.aios/config.yaml ausente'
  severity: CRITICAL
  tier: 1
  action: recreate_config
  message: 'Config recriado a partir do template'

- id: LE-005
  description: 'Servidor MCP não respondendo'
  severity: HIGH
  tier: 1
  action: restart_mcp
  message: 'Servidor MCP reiniciado'

- id: RH-008
  description: '.gitignore incompleto'
  severity: LOW

```