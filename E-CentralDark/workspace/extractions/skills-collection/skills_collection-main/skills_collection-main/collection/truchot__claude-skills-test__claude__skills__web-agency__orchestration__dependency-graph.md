---
name: dependency-graph
description: Graphe des dépendances entre skills
version: 1.0.0
---

# Skill Dependency Graph

Ce document visualise les relations et dépendances entre les 12 skills de web-agency.

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WEB-AGENCY                                      │
│                           Méta-Orchestrateur                                 │
│                           (409 agents total)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
   │  GESTION    │           │  TECHNIQUE  │           │   DESIGN    │
   │  PROJET     │           │  (Dev)      │           │  (Futur)    │
   └─────────────┘           └─────────────┘           └─────────────┘
```

## Hiérarchie des Skills (3 Niveaux)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NIVEAU 1 : STRATÉGIE                                                        │
│  (POURQUOI - Décisions, politiques, standards)                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     direction-technique (52)                          │  │
│  │  Architecture • Choix technologiques • Standards • Estimation         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                   ┌────────────────┼────────────────┐                       │
│                   ▼                ▼                ▼                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  NIVEAU 2 : OPÉRATIONS / PROCESSUS                                          │
│  (QUOI/QUI - Méthodologie, process, coordination)                           │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ web-dev-process  │  │ testing-process  │  │    lead-dev      │          │
│  │      (61)        │  │      (25)        │  │      (27)        │          │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤          │
│  │ QUOI: Méthodo    │  │ QUOI: Tests      │  │ QUI: Coordination│          │
│  │ • 7 phases       │  │ • Stratégie      │  │ • Code review    │          │
│  │ • Checklists     │  │ • Types tests    │  │ • Mentoring      │          │
│  │ • Workflows      │  │ • Qualité/Perf   │  │ • Delivery       │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│            │                    │                    │                      │
│            └────────────────────┼────────────────────┘                      │
│                                 ▼                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  NIVEAU 3 : IMPLÉMENTATION                                                   │
│  (COMMENT - Code, configuration, patterns)                                   │
│                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │frontend- │ │ backend- │ │  devops  │ │wordpress-│ │ design-  │          │
│  │developer │ │developer │ │          │ │gutenberg │ │ system   │          │
│  │   (33)   │ │   (32)   │ │   (30)   │ │   (41)   │ │   (21)   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│       │            │            │            │                              │
│       │      ┌─────┴─────┐      │            │                              │
│       │      ▼           ▼      │            │                              │
│  ┌──────────────┐  ┌──────────────┐                                        │
│  │ react-expert │  │nextjs-expert │                                        │
│  │     (28)     │  │     (35)     │                                        │
│  └──────────────┘  └──────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Séparé (Gestion Projet):
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                    project-management (24)                                │
  │  Brief • Estimation • Planning • Communication • Livraison • Facturation │
  └──────────────────────────────────────────────────────────────────────────┘
```

## Graphe des Dépendances

### Dépendances Directes

```
direction-technique
├── web-dev-process       [suit les politiques tech]
├── testing-process       [suit les standards qualité]
├── lead-dev              [applique les décisions]
├── frontend-developer    [implémente les specs]
├── backend-developer     [implémente les specs]
├── devops                [déploie selon les standards]
├── wordpress-gutenberg   [implémente les specs WP]
└── design-system         [applique les guidelines]

web-dev-process
├── testing-process       [s'intègre dans les phases]
├── frontend-developer    [phase implementation]
├── backend-developer     [phase implementation]
├── devops                [phase setup/deployment]
└── wordpress-gutenberg   [phase implementation]

lead-dev
├── frontend-developer    [code review, mentoring]
├── backend-developer     [code review, mentoring]
├── devops                [review infra]
└── wordpress-gutenberg   [code review]

frontend-developer
├── react-expert          [spécialisation React]
├── nextjs-expert         [spécialisation Next.js]
└── design-system         [consomme les tokens/composants]

backend-developer
├── devops                [collaboration déploiement]
└── nextjs-expert         [Server Components, API Routes]

project-management
├── direction-technique   [estimation technique]
└── [tous les skills]     [coordination projet]
```

### Relations par Domaine Technique

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOMAINE: TESTING                                    │
│                                                                              │
│  testing-process (STRATÉGIE - 25 agents)                                    │
│  │ • Définit QUOI/QUAND tester                                              │
│  │ • Pyramide, TDD/BDD, planning                                            │
│  │ • Qualité, performance, sécurité                                         │
│  │                                                                           │
│  └──▶ Skills d'IMPLÉMENTATION (COMMENT tester)                              │
│       ├── frontend-developer/testing/   [vitest, RTL, playwright]          │
│       ├── backend-developer/testing/    [jest, supertest, db tests]        │
│       ├── react-expert/testing/         [hooks, components, mocks]         │
│       ├── nextjs-expert/testing/        [server components, e2e]           │
│       └── wordpress-gutenberg/testing/  [wp-env, jest for blocks]          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOMAINE: SÉCURITÉ                                   │
│                                                                              │
│  direction-technique/securite (POLITIQUE - 5 agents)                        │
│  │ • Définit les politiques sécurité                                        │
│  │ • RGPD, audit, gestion secrets                                           │
│  │                                                                           │
│  testing-process/security (TESTS - 4 agents)                                │
│  │ • Tests OWASP, dépendances, headers                                      │
│  │                                                                           │
│  └──▶ Skills d'IMPLÉMENTATION                                               │
│       ├── backend-developer/auth-security/ [JWT, OAuth, crypto]             │
│       ├── devops/security/                 [container security]             │
│       └── wordpress-gutenberg/security/    [nonces, sanitization]           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOMAINE: DEVOPS                                     │
│                                                                              │
│  direction-technique/devops (POLITIQUE)                                     │
│  │ • Standards CI/CD, environnements                                        │
│  │                                                                           │
│  web-dev-process/setup (PROCESS)                                            │
│  │ • Checklists setup, workflows                                            │
│  │                                                                           │
│  └──▶ devops (IMPLÉMENTATION - 30 agents)                                   │
│       • CI/CD, containers, K8s, IaC, monitoring                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Matrice de Collaboration

| Skill Source | → Collabore avec | Type de Relation |
|--------------|------------------|------------------|
| direction-technique | tous | dépendance descendante |
| web-dev-process | testing-process | complémentaire |
| web-dev-process | lead-dev | synchronisation |
| lead-dev | frontend-developer | review, mentoring |
| lead-dev | backend-developer | review, mentoring |
| frontend-developer | react-expert | spécialisation |
| frontend-developer | nextjs-expert | spécialisation |
| frontend-developer | design-system | consommation |
| backend-developer | devops | déploiement |
| backend-developer | nextjs-expert | Server Components |
| testing-process | tous skills techniques | méthodologie |
| project-management | tous | coordination |

## Flux de Travail Typiques

### Nouveau Projet Web

```
project-management
        │
        ▼ (brief)
direction-technique
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
web-dev-process                         lead-dev
        │                                      │
        ├──────────────┐                       │
        ▼              ▼                       ▼
testing-process    devops            (coordination)
        │              │                       │
        │              ▼                       │
        │         [infra ready]                │
        │              │                       │
        ├──────────────┴───────────────────────┤
        ▼                                      ▼
frontend-developer                    backend-developer
        │                                      │
        ├── react-expert                       │
        └── design-system                      │
                │                              │
                └──────────────┬───────────────┘
                               ▼
                        [application]
                               │
                               ▼
                    project-management
                        (livraison)
```

### Bug Fix Critique

```
project-management (notification client)
        │
        ▼
direction-technique/support (diagnostic)
        │
        ├─────────────────────────┐
        ▼                         ▼
lead-dev (coordination)     testing-process (reproduction)
        │                         │
        ▼                         │
[frontend/backend]-developer ◄────┘
        │
        ▼
devops (hotfix deploy)
        │
        ▼
project-management (notification client)
```

## Bonnes Pratiques

### Composition Verticale (Haut → Bas)

```
TOUJOURS respecter la hiérarchie :
1. POURQUOI (direction-technique)
2. QUOI (web-dev-process, testing-process)
3. QUI (lead-dev)
4. COMMENT (skills implémentation)
```

### Composition Horizontale (Parallèle)

```
OK pour paralléliser :
- frontend-developer + backend-developer
- react-expert + design-system
- testing-process + devops (setup)

NE PAS paralléliser :
- direction-technique + implémentation (sans validation)
- lead-dev review + merge (avant approbation)
```

## Références

- [ADR-005 : Frontières de responsabilités](../docs/adr/005-skill-responsibility-boundaries.md)
- [ADR-006 : Hiérarchie lead-dev/web-dev-process](../docs/adr/006-hierarchy-clarification.md)
- [Règles de routage](./routing.md)
- [Composition des skills](./composition.md)
