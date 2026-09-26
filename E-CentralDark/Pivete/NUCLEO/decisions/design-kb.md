# DECISAO - design-kb.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\data\design-kb.md
**SHA:** cda68eec91513ebf
**Timestamp:** 2026-08-28T13:25:00.274565
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- **Key principle:** Build from small to large. Atoms are the foundation. Everything above is composition.
- **Key principle:** Embrace the cascade. Use specificity layers. Let CSS do what CSS does well.
- **Key principle:** Start with what, then define how. Objects create consistent, predictable UX.
- **Key principle:** Separate decisions from implementation. One source of truth, many platform outputs.
- **Key principle:** Inclusive design is not a feature — it is a quality criterion for all features.

### Ouro Bruto (primeiros 5000 chars)
```
# Design System Squad Knowledge Base

**ID:** design-kb
**Version:** 1.0
**Purpose:** Comprehensive knowledge base for the Design System Squad covering agent roster, frameworks, methodologies, reading list, glossary, and workflow patterns
**Maintained By:** @dan-mall

---

## Squad Overview

The Design System Squad is a specialized team of 12 AI agents that provides comprehensive design system expertise. The squad covers the full lifecycle of design systems — from initial architecture and token foundations through component development, accessibility, governance, adoption, and scaling.

The squad operates within the Synkra AIOS framework, activated via the `@design` prefix or by addressing individual agents directly (e.g., `@brad-frost`, `@jina-anne`).

**Core mission:** Help teams create, maintain, and scale design systems that are consistent, accessible, and developer-friendly.

**Key capabilities:**
- Design system architecture and component taxonomy (Atomic Design)
- Design token creation, management, and multi-platform distribution
- Accessibility auditing and inclusive design guidance (WCAG 2.2)
- CSS architecture and frontend implementation patterns
- UI/UX pattern identification and application
- Object-oriented UX analysis
- Governance, adoption, and organizational scaling
- Designer-developer collaboration workflows

---

## Agent Roster

| Agent | Name | Role | Specialty | Tier |
|-------|------|------|-----------|------|
| @brad-frost | Brad Frost | Component Architect | Atomic Design, component taxonomy, pattern libraries | Tier 1 (Core) |
| @nathan-curtis | Nathan Curtis | System Strategist | Governance, versioning, team models, organizational scaling | Tier 1 (Core) |
| @jina-anne | Jina Anne | Token Architect | Design tokens, Style Dictionary, DTCG format, multi-platform | Tier 1 (Core) |
| @heydon-pickering | Heydon Pickering | Inclusive Design Lead | Accessibility patterns, inclusive components, ARIA | Tier 1 (Core) |
| @dan-mall | Dan Mall | Design Director | Collaboration, hot potato, adoption strategy, business case | Tier 1 (Core) |
| @alla-kholmatova | Alla Kholmatova | Design Language Lead | Naming, shared vocabulary, functional/perceptual patterns | Tier 2 (Specialist) |
| @micah-godbolt | Micah Godbolt | Frontend Architect | Component architecture, testing, build systems, monorepos | Tier 2 (Specialist) |
| @sophia-prater | Sophia Prater | OOUX Specialist | Object-oriented UX, information architecture, object mapping | Tier 2 (Specialist) |
| @stephanie-walter | Stephanie Walter | A11y Design Specialist | Designer-focused accessibility, annotations, audits | Tier 2 (Specialist) |
| @jenifer-tidwell | Jenifer Tidwell | UI Pattern Expert | UI patterns, interaction design, navigation, layout | Tier 2 (Specialist) |
| @andy-bell | Andy Bell | CSS Architect | CUBE CSS, modern CSS, progressive enhancement, fluid design | Tier 3 (Support) |
| @sarah-federman | Sarah Federman | Token Engineer | Token tooling, Style Dictionary configuration, automation | Tier 3 (Support) |

### Tier Descriptions

- **Tier 1 (Core):** Agents activated in most design system workflows. They lead primary deliverables.
- **Tier 2 (Specialist):** Agents activated for specific problem domains. They provide deep expertise.
- **Tier 3 (Support):** Agents activated for implementation-level guidance. They support Tier 1 and 2 agents.

---

## Key Frameworks

### Atomic Design (Brad Frost)

A methodology for creating design systems with a hierarchical component taxonomy:

1. **Atoms:** Smallest building blocks (button, input, label, icon, badge)
2. **Molecules:** Groups of atoms functioning together (search field = label + input + button)
3. **Organisms:** Groups of molecules forming a distinct section (header = logo + nav + search)
4. **Templates:** Page-level layouts defining content structure without real content
5. **Pages:** Templates with real representative content for testing and review

**Key principle:** Build from small to large. Atoms are the foundation. Everything above is composition.

### CUBE CSS (Andy Bell)

A CSS methodology that works with the cascade rather than against it:

- **Composition:** Layout primitives that control how elements flow and space (Stack, Cluster, Sidebar, Grid)
- **Utility:** Small, single-purpose classes derived from design tokens (.text-sm, .gap-md, .color-primary)
- **Block:** Component-specific styles with a clear encapsulation boundary
- **Exception:** State-based variations using data attributes or modifier classes ([data-state="active"])

**Key principle:** Embrace the cascade. Use specificity layers. Let CSS do what CSS does well.

### Object-Oriented UX — OOUX (Sophia Prater)

A content-first design methodology that starts with objects rather than actions:

1. **Identify objects:** What are the nouns users interact with? (Product, Order, User, Review)
2. **Map relationships:** How do objects relate to each other? (User has many Orders)
3. **Define content:** What metad
```