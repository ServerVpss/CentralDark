# AGENTE - AGENT-PERSONALIZATION-STANDARD-V1.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\docs\standards\AGENT-PERSONALIZATION-STANDARD-V1.md
**SHA:** 7b8e7a396590bdf6
**Timestamp:** 2026-08-28T02:02:10.626556
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern: /## 📊 Task Execution Report/, name: 'Header' },
- { pattern: /\*\*Agent:\*\*/, name: 'Agent line (line 3)' },
- { pattern: /\*\*Duration:\*\*/, name: 'Duration line (line 6)' },
- { pattern: /\*\*Tokens Used:\*\*/, name: 'Tokens line (line 7)' },
- { pattern: /### Status/, name: 'Status section' },
- { pattern: /### Metrics/, name: 'Metrics section (always last)' },
- errors.push(`Missing required pattern: ${name}`);

### Principios
- **Principle:** **Familiaridade + Personalização = Produtividade**

### Ouro Bruto (primeiros 5000 chars)
```
# Agent Personalization Standard v1.0

**Status:** Draft (Story 6.1.2 Implementation)
**Created:** 2025-01-14
**Authors:** Roundtable (Pedro Valério, Brad Frost, Seth Godin, Dan Kennedy)
**Principle:** **Familiaridade + Personalização = Produtividade**

---

## 🎯 Core Principle

> "Quando as informações estão sempre nas mesmas posições, nosso cérebro sabe onde buscar rápido."

**Structure is sacred. Tone is flexible.**

- ✅ **FIXED:** Template positions, section order, metric formats
- ✅ **FLEXIBLE:** Status messages, vocabulary, emoji choices (within palette)

---

## 📐 Architecture Overview

### Three-Layer System

```
┌─────────────────────────────────────┐
│   LAYER 1: Agent Persona Config     │  ← Personality definition (YAML)
│   (.aios-core/agents/*.md)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 2: Output Formatter         │  ← Template engine (JS)
│   (.aios-core/infrastructure/scripts/)│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 3: Standardized Output      │  ← Fixed structure + personalized tone
│   (Tasks, Templates, Checklists)    │
└─────────────────────────────────────┘
```

---

## 🔧 Layer 1: Agent Persona Configuration

### Agent File Structure (Updated)

```yaml
# .aios-core/agents/{agent-id}.md

agent:
  name: {PersonalizedName}        # NEW: Human name (Dex, Quinn, Pax...)
  id: {agent-id}                  # UNCHANGED: System identifier
  title: {Role}                   # UNCHANGED: Professional role
  icon: {emoji}                   # UNCHANGED: Visual identifier
  whenToUse: "{description}"      # UNCHANGED

persona_profile:                  # NEW SECTION
  archetype: {Archetype}          # Builder, Guardian, Balancer, etc.
  zodiac: {Sign}                  # ♒ Aquarius, ♍ Virgo, ♎ Libra, etc.

  communication:
    tone: {tone}                  # pragmatic | empathetic | analytical | collaborative
    emoji_frequency: {level}      # high | medium | low | minimal

    vocabulary:                   # Agent-specific words (5-10)
      - {word1}
      - {word2}
      - {word3}

    greeting_levels:              # 3 personification levels
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {name} ({archetype}) ready. {tagline}!"
      archetypal: "{icon} {name} the {archetype} ({zodiac}) ready to {verb}!"

    signature_closing: "{personalized_sign_off}"

# REST OF FILE UNCHANGED
persona:
  role: ...
  style: ...
commands:
  - ...
dependencies:
  - ...
```

### Example: Dex (Builder Agent)

```yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer
  icon: 💻
  whenToUse: "Use for code implementation, debugging, refactoring"

persona_profile:
  archetype: Builder
  zodiac: ♒ Aquarius

  communication:
    tone: pragmatic
    emoji_frequency: medium

    vocabulary:
      - construir
      - implementar
      - refatorar
      - resolver
      - otimizar

    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build something great!"
      archetypal: "💻 Dex the Builder (♒ Aquarius) ready to innovate!"

    signature_closing: "— Dex, sempre construindo 🔨"
```

### Archetype Vocabulary Reference

```yaml
# .aios-core/data/archetype-vocabulary.yaml

archetypes:
  Builder:
    primary_verbs: [construir, implementar, refatorar, resolver, otimizar]
    avoid_words: [talvez, possivelmente, acho que, mais ou menos]
    emoji_palette: [⚡, 🔨, 🏗️, ✅, 🔧, 🛠️]
    emotional_signature: "Energia de reconstrução"

  Guardian:
    primary_verbs: [validar, verificar, proteger, garantir, auditar]
    avoid_words: [aproximadamente, parece, creio]
    emoji_palette: [✅, 🛡️, 🔍, ⚠️, 📋, 🎯]
    emotional_signature: "Proteção preventiva"

  Balancer:
    primary_verbs: [equilibrar, harmonizar, mediar, alinhar, integrar]
    avoid_words: [sempre, nunca, impossível]
    emoji_palette: [⚖️, 🤝, 📊, ✨, 🎯]
    emotional_signature: "Mediação colaborativa"

  Flow_Master:
    primary_verbs: [adaptar, pivotar, ajustar, fluir, evoluir]
    avoid_words: [rígido, fixo, imutável]
    emoji_palette: [🌊, 🔄, 💫, ⚡, 🎭]
    emotional_signature: "Adaptação fluida"
```

---

## 🎨 Layer 2: Output Formatter

### Template Engine Architecture

```javascript
// .aios-core/infrastructure/scripts/output-formatter.js

class PersonalizedOutputFormatter {
  constructor(agent, task, results) {
    this.agent = agent;
    this.task = task;
    this.results = results;
    this.personality = agent.persona_profile;
  }

  /**
   * Generate standardized output with personality injection
   * STRUCTURE: Always fixed (familiaridade)
   * TONE: Personalized per agent (personalização)
   */
  format() {
    return this.renderTemplate('task-execution-report', {
      // FIXED POSITIONS (never change)
      header: this.buildFixedHeader(),
      metrics: this.buildFixedMetrics(),

      // PERSONALITY SLOTS (varies per agent)
      statusMessage: this.buildPersonaliz
```