---
name: routing
description: Règles de routage vers les skills métiers
---

# Règles de Routage Web Agency

Ce document définit les règles de routage des requêtes vers les skills appropriés.

## Principe

> Une requête = Un skill principal identifié

## Matrice de Routage par Mots-clés

### Project Management

| Mots-clés | Skill |
|-----------|-------|
| brief, besoin, demande client, RFP, cahier des charges | `project-management/avant-projet` |
| devis, estimation, chiffrage, budget, proposition | `project-management/avant-projet` |
| planning, jalon, milestone, Gantt, deadline | `project-management/pilotage` |
| avancement, suivi, reporting, statut | `project-management/pilotage` |
| réunion, CR, compte-rendu, PV | `project-management/communication` |
| email, relance, message client | `project-management/communication` |
| recette, validation, test client, PV recette | `project-management/livraison` |
| facture, facturation, paiement | `project-management/facturation` |

### Direction Technique (Stratégie)

| Mots-clés | Skill |
|-----------|-------|
| choix stack, framework, technologie | `direction-technique/avant-projet` |
| audit existant, legacy, migration | `direction-technique/avant-projet` |
| architecture, patterns, ADR | `direction-technique/architecture` |
| specs techniques, spécification | `direction-technique/specification` |
| estimation technique, chiffrage dev | `direction-technique/estimation` |
| qualité, standards, dette technique | `direction-technique/qualite` |
| sécurité, OWASP, RGPD, vulnérabilité | `direction-technique/securite` |
| performance, optimisation, SLO | `direction-technique/performance` |

### Lead Dev (Coordination)

| Mots-clés | Skill |
|-----------|-------|
| PR, pull request, review code, merge request | `lead-dev/code-review` |
| qualité code, sécurité code, performance code | `lead-dev/code-review` |
| tâche, assignation, daily, standup, blocage | `lead-dev/team-coordination` |
| sprint support, débloquer dev | `lead-dev/team-coordination` |
| choix librairie, quel pattern, refactoring | `lead-dev/technical-decisions` |
| dette technique priorisation | `lead-dev/technical-decisions` |
| feedback code, onboarding dev, formation | `lead-dev/mentoring` |
| bonnes pratiques, évaluation niveau | `lead-dev/mentoring` |
| release, deploy check, hotfix, changelog | `lead-dev/delivery` |
| merge strategy, stratégie branches | `lead-dev/delivery` |

### Web Dev Process (Processus)

| Mots-clés | Skill |
|-----------|-------|
| user story, requirement, scope | `web-dev-process/discovery` |
| wireframe, mockup, UI/UX, design système | `web-dev-process/design` |
| git, repo, CI/CD, pipeline, linter | `web-dev-process/setup` |
| code review, PR, conventions | `web-dev-process/development` |
| test unitaire, e2e, accessibilité | `web-dev-process/testing` |
| deploy, staging, production, rollback | `web-dev-process/deployment` |
| monitoring, logs, alerting, bug | `web-dev-process/maintenance` |

### Next.js (Implémentation)

| Mots-clés | Skill |
|-----------|-------|
| Next.js, App Router, page.tsx, layout.tsx | `nextjs-expert/app-router` |
| Server Component, Client Component, RSC | `nextjs-expert/server-components` |
| Server Action, revalidation, fetch cache | `nextjs-expert/data` |
| SSR, SSG, ISR, middleware, Edge | `nextjs-expert/rendering` |
| next/image, next/font, bundle | `nextjs-expert/optimization` |
| Vercel, Docker, next.config.js | `nextjs-expert/deployment` |
| Playwright Next.js, Vitest Next.js | `nextjs-expert/testing` |

### WordPress (Implémentation)

| Mots-clés | Skill |
|-----------|-------|
| CPT, taxonomy, hook, filter, PHP WP | `wordpress-gutenberg-expert/wp-core` |
| block, Gutenberg, registerBlockType | `wordpress-gutenberg-expert/gutenberg-blocks` |
| theme.json, block theme, FSE | `wordpress-gutenberg-expert/theme` |
| wp-env, WP-CLI, @wordpress/scripts | `wordpress-gutenberg-expert/tooling` |
| PHPUnit WP, Jest WP, Playwright WP | `wordpress-gutenberg-expert/testing` |

### Design System

| Mots-clés | Skill |
|-----------|-------|
| design tokens, couleurs, typo, spacing | `design-system-foundations/foundations` |
| bouton, input, icône, badge | `design-system-foundations/atoms` |
| formulaire, card, modal, navigation | `design-system-foundations/molecules` |
| layout, page template, hero | `design-system-foundations/templates` |

### DevOps (Implémentation)

| Mots-clés | Skill |
|-----------|-------|
| GitHub Actions, GitLab CI, workflow, pipeline | `devops/cicd` |
| Dockerfile, docker-compose, image, container | `devops/containers` |
| Kubernetes, K8s, Helm, pod, deployment | `devops/kubernetes` |
| Terraform, AWS, GCP, VPC, IaC | `devops/infrastructure` |
| Prometheus, Grafana, logs, alerting | `devops/monitoring` |
| Blue-Green, Canary, rollback, feature flag | `devops/deployment` |

### ⚠️ Domaines Non Couverts (Skills Planifiés - Non Disponibles)

Ces domaines ne sont **pas encore implémentés**. Ne pas router vers ces skills.

| Mots-clés | Domaine | Action |
|-----------|---------|--------|
| audit, benchmark, stratégie digitale | Strategy | → Demander clarification à l'utilisateur |
| maquette, logo, charte, branding, DA | Design | → Demander clarification à l'utilisateur |
| rédaction, copywriting, SEO éditorial | Content | → Demander clarification à l'utilisateur |
| SEO, SEA, analytics, social media | Marketing | → Demander clarification à l'utilisateur |

> **Si l'utilisateur demande ces domaines** : Expliquer que ces skills sont prévus mais non disponibles.
> Proposer d'utiliser les skills existants si applicable (ex: `design-system-foundations` pour aspects UI).

## Arbre de Décision

```
Requête utilisateur
│
├─ Concerne le CLIENT ou le PROJET ?
│  └─ → project-management
│
├─ Concerne une DÉCISION technique STRATÉGIQUE ?
│  └─ → direction-technique
│
├─ Concerne la COORDINATION d'équipe dev ?
│  ├─ Code review, PR, qualité ? → lead-dev/code-review
│  ├─ Tâches, daily, blocage ? → lead-dev/team-coordination
│  ├─ Choix lib, pattern ? → lead-dev/technical-decisions
│  ├─ Formation, mentoring ? → lead-dev/mentoring
│  └─ Release, deploy, hotfix ? → lead-dev/delivery
│
├─ Concerne un PROCESSUS de dev ?
│  └─ → web-dev-process
│
├─ Concerne l'implémentation FRONTEND ?
│  └─ → frontend-developer (ou react-expert)
│
├─ Concerne Next.js spécifiquement ?
│  └─ → nextjs-expert
│
├─ Concerne l'implémentation BACKEND ?
│  └─ → backend-developer
│
├─ Concerne DevOps (CI/CD, containers, K8s, IaC, monitoring) ?
│  └─ → devops
│
├─ Concerne WordPress/Gutenberg ?
│  └─ → wordpress-gutenberg-expert
│
├─ Concerne le DESIGN SYSTEM ?
│  └─ → design-system-foundations
│
└─ Autre domaine (strategy, design, content, marketing) ?
   └─ → Ces skills ne sont pas encore disponibles. Demander clarification.
```

## Matrice de Désambiguïsation

### Mots-clés Ambigus - Règles de Priorité

Ces mots-clés apparaissent dans plusieurs skills. Utiliser le contexte pour router :

| Mot-clé | Contexte → Skill | Règle |
|---------|------------------|-------|
| **architecture** | Décision stratégique → `direction-technique/architecture` | Si "quelle architecture ?" |
| | Process/workflow → `web-dev-process/design/architecture` | Si "comment structurer ?" |
| | Backend spécifique → `backend-developer/architecture` | Si code/patterns concrets |
| **performance** | Politique/SLO → `direction-technique/performance` | Si objectifs, budgets |
| | Process de mesure → `web-dev-process/testing/performance` | Si "comment mesurer ?" |
| | Code frontend → `frontend-developer/performance` | Si Core Web Vitals, bundle |
| | Code backend → `backend-developer/performance` | Si cache, profiling |
| | Next.js → `nextjs-expert/optimization` | Si next/image, next/font |
| **sécurité** | Politique RGPD/OWASP → `direction-technique/securite` | Si audit, conformité |
| | Process de test → `web-dev-process/testing/security` | Si "comment tester ?" |
| | Revue de code → `lead-dev/code-review/security-review` | Si review PR |
| | Implémentation auth → `backend-developer/auth-security` | Si code JWT, hash |
| **code review** | Politique équipe → `direction-technique/qualite/code-review` | Si règles d'approbation |
| | Process/checklist → `web-dev-process/development/code-review` | Si workflow review |
| | Faire une review → `lead-dev/code-review` | Si "reviewer cette PR" |
| **tests** | Stratégie globale → `direction-technique/qualite` | Si coverage min, politique |
| | Process/pyramide → `web-dev-process/testing` | Si "quelle approche ?" |
| | Code frontend → `frontend-developer/testing` | Si Jest, RTL |
| | Code backend → `backend-developer/testing` | Si PHPUnit, Supertest |
| | Code Next.js → `nextjs-expert/testing` | Si Playwright + Next |
| | Code WordPress → `wordpress-gutenberg-expert/testing` | Si PHPUnit WP |
| **deploy** | Stratégie globale → `direction-technique/infrastructure` | Si blue-green, politique |
| | Checklist/release → `lead-dev/delivery` | Si "prêt à déployer ?" |
| | Process → `web-dev-process/deployment` | Si "comment déployer ?" |
| | Config Next.js → `nextjs-expert/deployment` | Si Vercel, Docker Next |
| | Config DevOps → `devops/deployment` | Si Blue-Green, Canary, K8s |
| **CI/CD** | Politique → `direction-technique/infrastructure/strategie-cicd` | Si "quelle stratégie ?" |
| | Process → `web-dev-process/setup/cicd` | Si principes, étapes |
| | Config → `devops/cicd` | Si GitHub Actions, GitLab CI |
| **containers** | Dockerfile, images → `devops/containers` | Si Docker, registry |
| | Orchestration → `devops/kubernetes` | Si K8s, Helm |
| **monitoring** | Politique → `direction-technique/infrastructure` | Si objectifs SLO |
| | Config → `devops/monitoring` | Si Prometheus, Grafana |
| **infrastructure** | Stratégie → `direction-technique/infrastructure` | Si choix cloud |
| | IaC → `devops/infrastructure` | Si Terraform, AWS, GCP |

### Règle de Décision en 4 Étapes

```
1. SPÉCIFICITÉ : Le mot-clé le plus spécifique gagne
   "audit sécurité RGPD" → direction-technique/securite/conformite-rgpd
   "audit sécurité code" → lead-dev/code-review/security-review

2. NIVEAU D'ABSTRACTION : Identifier POURQUOI vs QUOI vs COMMENT
   "Quelle politique de tests ?" → direction-technique (POURQUOI)
   "Quelle pyramide de tests ?" → web-dev-process (QUOI)
   "Comment écrire ce test ?" → skill technique (COMMENT)

3. CONTEXTE TECHNOLOGIQUE : Si techno explicite, router vers skill techno
   "tests Next.js" → nextjs-expert/testing
   "tests React" → react-expert/testing
   "tests backend" → backend-developer/testing

4. EN DERNIER RECOURS : Demander clarification à l'utilisateur
   "Vous parlez de tests : politique, process, ou implémentation ?"
```

### Matrice RACI Simplifiée

| Concern | Décide (POURQUOI) | Définit Process (QUOI) | Coordonne | Exécute (COMMENT) |
|---------|-------------------|------------------------|-----------|-------------------|
| Stack technique | direction-technique | - | - | - |
| Architecture | direction-technique | web-dev-process | lead-dev | skills techniques |
| Code review | direction-technique | web-dev-process | lead-dev | - |
| Tests | direction-technique | web-dev-process | lead-dev | skills techniques |
| CI/CD | direction-technique | web-dev-process | lead-dev | devops |
| Performance | direction-technique | web-dev-process | lead-dev | skills techniques |
| Sécurité | direction-technique | web-dev-process | lead-dev | backend-developer |
| Deploy | direction-technique | lead-dev | lead-dev | devops |
| Monitoring | direction-technique | web-dev-process | lead-dev | devops |
| Infrastructure | direction-technique | web-dev-process | lead-dev | devops |
| Containers | direction-technique | devops | lead-dev | devops |
| Kubernetes | direction-technique | devops | lead-dev | devops |

## Priorité en Cas d'Ambiguïté

1. **Match exact** : Mot-clé présent dans la table
2. **Spécificité** : Mot-clé composé > mot-clé simple
3. **Niveau d'abstraction** : POURQUOI → QUOI → COMMENT
4. **Contexte conversation** : Skill déjà utilisé récemment
5. **Demander clarification** : Si vraiment ambigu

## Références

- [Composition des skills](./composition.md)
- [Points d'escalade](./escalation.md)
