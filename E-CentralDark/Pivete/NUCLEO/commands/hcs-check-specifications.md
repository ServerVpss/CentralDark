# COMANDO - hcs-check-specifications.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\hcs-check-specifications.md
**SHA:** 13238cc3c3f3401d
**Timestamp:** 2026-08-28T02:02:34.424456
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: 'src/**/*.ts'
- const pattern = new RegExp(`^#+\\s*${section}`, 'im');
- const altPattern = new RegExp(`^#+\\s*(${getAlternatives(section).join('|')})`, 'im');
- pattern: 'TODO|FIXME|HACK'

### Contratos
- negate: true # Falla si se encuentra patrón

### Gaps
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/en/architecture/hcs-check-specifications.md | Sincronización: 2026-01-26 -->

# Especificaciones de Verificaciones HCS

> 🌐 [EN](../../architecture/hcs-check-specifications.md) | [PT](../../pt/architecture/hcs-check-specifications.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura de Verificaciones](#arquitectura-de-verificaciones)
- [Dominio 1: Coherencia del Proyecto](#dominio-1-coherencia-del-proyecto)
- [Dominio 2: Entorno Local](#dominio-2-entorno-local)
- [Dominio 3: Salud del Repositorio](#dominio-3-salud-del-repositorio)
- [Dominio 4: Entorno de Despliegue](#dominio-4-entorno-de-despliegue)
- [Dominio 5: Integración de Servicios](#dominio-5-integración-de-servicios)
- [Matriz de Verificación IDE/CLI](#matriz-de-verificación-idecli)
- [Extensión de Verificaciones Personalizadas](#extensión-de-verificaciones-personalizadas)
- [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)

---

## Descripción General

El Sistema de Verificación de Salud (HCS) realiza verificaciones diagnósticas en 5 dominios, totalizando más de 33 verificaciones individuales. Cada verificación tiene:

- **ID Único:** Para seguimiento y reportes
- **Severidad:** CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Nivel de Auto-reparación:** 1 (silencioso), 2 (con confirmación), 3 (guía manual), N/A
- **Modo:** quick (solo verificaciones rápidas), full (todas las verificaciones)
- **Duración Objetivo:** Tiempo de ejecución esperado

### Resumen de Conteo de Verificaciones

| Dominio                  | Total Verificaciones | Modo Rápido | Modo Completo |
| ------------------------ | -------------------- | ----------- | ------------- |
| Coherencia del Proyecto  | 8                    | 4           | 8             |
| Entorno Local            | 8                    | 5           | 8             |
| Salud del Repositorio    | 8                    | 3           | 8             |
| Entorno de Despliegue    | 5                    | 2           | 5             |
| Integración de Servicios | 4                    | 4           | 4             |
| **Total**                | **33**               | **18**      | **33**        |

---

## Arquitectura de Verificaciones

### Decisión de Arquitectura: Patrón Híbrido

Basado en investigación de la industria, HCS usa una **arquitectura híbrida** combinando:

1. **Verificaciones basadas en código** para funcionalidad core (rendimiento, lógica compleja)
2. **Verificaciones basadas en YAML** para extensibilidad (verificaciones personalizadas, específicas del proyecto)

```
┌─────────────────────────────────────────────────────────────┐
│                    Motor de Health Check                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Checks Core (JS)   │    │ Checks Custom (YAML) │       │
│  │                      │    │                       │       │
│  │  • Coherencia Proy.  │    │  • Específicos proy.  │       │
│  │  • Entorno Local     │    │  • Convenciones equipo│       │
│  │  • Salud Repositorio │    │  • Tests integración  │       │
│  └──────────┬───────────┘    └───────────┬───────────┘       │
│             │                            │                   │
│             └────────────┬───────────────┘                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Check Runner                         │  │
│  │  • Ejecución paralela    • Caché                      │  │
│  │  • Manejo de timeout     • Agregación de resultados   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Auto-reparación                      │  │
│  │  Nivel 1 → Auto    Nivel 2 → Confirmar   Nivel 3 → Guía│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Interfaz de Verificación

```javascript
// Interfaz core de verificación (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // ej., "PC-001"
    this.name = options.name; // Nombre legible
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // Sobrescribir en subclase
  async check(context) {
    // Retorna { passed: boolean
```

---

# COMANDO - hcs-check-specifications.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\hcs-check-specifications.md
**SHA:** 1641b1b8d83643dc
**Timestamp:** 2026-08-28T02:02:38.706775
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 'Execute: npm audit para detalhes',
- 'Execute: npm audit fix para correções automáticas',
- 'Execute: gh auth login',

### Padroes
- pattern: 'src/**/*.ts'
- const pattern = new RegExp(`^#+\\s*${section}`, 'im');
- const altPattern = new RegExp(`^#+\\s*(${getAlternatives(section).join('|')})`, 'im');
- pattern: 'TODO|FIXME|HACK'

### Contratos
- negate: true # Falhar se padrão encontrado

### Gaps
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-check-specifications.md | Sincronização: 2026-01-26 -->

# Especificações de Verificação do HCS

> 🌐 [EN](../../architecture/hcs-check-specifications.md) | **PT** | [ES](../../es/architecture/hcs-check-specifications.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Verificação](#arquitetura-de-verificação)
- [Domínio 1: Coerência do Projeto](#domínio-1-coerência-do-projeto)
- [Domínio 2: Ambiente Local](#domínio-2-ambiente-local)
- [Domínio 3: Saúde do Repositório](#domínio-3-saúde-do-repositório)
- [Domínio 4: Ambiente de Implantação](#domínio-4-ambiente-de-implantação)
- [Domínio 5: Integração de Serviços](#domínio-5-integração-de-serviços)
- [Matriz de Verificação IDE/CLI](#matriz-de-verificação-idecli)
- [Extensão de Verificação Customizada](#extensão-de-verificação-customizada)
- [Considerações de Performance](#considerações-de-performance)

---

## Visão Geral

O Sistema de Verificação de Saúde (HCS) realiza verificações diagnósticas em 5 domínios, totalizando mais de 33 verificações individuais. Cada verificação possui:

- **ID Único:** Para rastreamento e relatórios
- **Severidade:** CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Nível de Auto-Recuperação:** 1 (silencioso), 2 (com confirmação), 3 (guia manual), N/A
- **Modo:** quick (apenas verificações rápidas), full (todas as verificações)
- **Duração Alvo:** Tempo de execução esperado

### Resumo da Contagem de Verificações

| Domínio                 | Total de Verificações | Modo Rápido | Modo Completo |
| ----------------------- | --------------------- | ----------- | ------------- |
| Coerência do Projeto    | 8                     | 4           | 8             |
| Ambiente Local          | 8                     | 5           | 8             |
| Saúde do Repositório    | 8                     | 3           | 8             |
| Ambiente de Implantação | 5                     | 2           | 5             |
| Integração de Serviços  | 4                     | 4           | 4             |
| **Total**               | **33**                | **18**      | **33**        |

---

## Arquitetura de Verificação

### Decisão de Arquitetura: Padrão Híbrido

Baseado em pesquisa da indústria, o HCS usa uma **arquitetura híbrida** combinando:

1. **Verificações baseadas em código** para funcionalidade core (performance, lógica complexa)
2. **Verificações baseadas em YAML** para extensibilidade (verificações customizadas, específicas do projeto)

```
┌─────────────────────────────────────────────────────────────┐
│                    Motor de Health Check                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ Verificações Core   │    │ Verificações Custom │        │
│  │      (JS)           │    │      (YAML)         │        │
│  │                     │    │                     │        │
│  │  • Coerência Projeto│    │  • Específicas proj │        │
│  │  • Ambiente Local   │    │  • Convenções equipe│        │
│  │  • Saúde Repositório│    │  • Testes integração│        │
│  └──────────┬──────────┘    └───────────┬─────────┘        │
│             │                           │                   │
│             └───────────┬───────────────┘                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Executor de Verificações            │  │
│  │  • Execução paralela    • Cache                      │  │
│  │  • Tratamento timeout   • Agregação de resultados    │  │
│  └───────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Auto-Recuperação                    │  │
│  │  Nível 1 → Auto   Nível 2 → Confirmar   Nível 3 → Guia│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Interface de Verificação

```javascript
// Interface core de verificação (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // ex: "PC-001"
    this.name = options.name; // Nome legível por humanos
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // Sobrescrever na subclasse
  async check(context) {
    // Retorna { passed: boolean, message: string, details?: any }
    throw new Error('N
```