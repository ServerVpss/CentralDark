# CONTRATO - agent-quality-gate.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\checklists\agent-quality-gate.md
**SHA:** 04d1bf12dd4b0b3d
**Timestamp:** 2026-08-28T02:02:03.407850
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^[a-z]+(-[a-z]+)*$"

### Contratos
- ## Agent Quality Gate: {agent_name}

### Principios
- > **Principle:** An agent without operational infrastructure is a persona without process.

### Ouro Bruto (primeiros 5000 chars)
```
# Agent Quality Gate Checklist

```yaml
checklist:
  id: agent-quality-gate
  version: 4.0.0
  created: 2026-01-30
  updated: 2026-02-04
  purpose: "Validate agent definitions meet Hybrid Loader quality standard + operational completeness"
  mode: blocking  # Prevents publication if critical items fail
  architecture: "hybrid-loader"
  new_in_v4: "SC_AGT_004 — Operational Completeness (task files, templates, checklists, maturity scoring)"
  reference: "aprendizado/32-ANATOMIA-AGENTE-100-PORCENTO-REPLICAVEL.md"
```

---

## Pre-Validation: File Basics

```yaml
file_basics:
  - id: min-lines
    check: "Agent file has 800+ lines"
    type: blocking
    validation: "wc -l {file} >= 800"

  - id: yaml-valid
    check: "YAML syntax is valid"
    type: blocking
    validation: "yamllint passes"

  - id: no-placeholders
    check: "No unfilled {{placeholders}} remain"
    type: blocking
    validation: "grep '{{' returns empty"
```

---

## Level 0: Loader Configuration (All Required - NEW)

```yaml
loader_checks:
  - id: activation-notice
    check: "ACTIVATION-NOTICE is present"
    type: blocking
    section: "top of file"

  - id: ide-file-resolution
    check: "IDE-FILE-RESOLUTION has valid base_path"
    type: blocking
    section: "Level 0"
    required_fields:
      - base_path
      - resolution_pattern

  - id: request-resolution
    check: "REQUEST-RESOLUTION has mapping examples"
    type: blocking
    section: "Level 0"

  - id: command-loader-exists
    check: "command_loader section exists"
    type: blocking
    section: "Level 0"

  - id: command-loader-complete
    check: "Every command with loader != null has entry in command_loader"
    type: blocking
    validation: |
      For each command in commands:
        if command.loader != null:
          assert command.name in command_loader

  - id: command-loader-requires
    check: "Each command_loader entry has 'requires' array"
    type: blocking
    validation: "command_loader[*].requires is array"

  - id: critical-loader-rule
    check: "CRITICAL_LOADER_RULE is present"
    type: blocking
    must_contain:
      - "LOOKUP"
      - "STOP"
      - "LOAD"
      - "VERIFY"
      - "EXECUTE"
      - "FAILURE TO LOAD = FAILURE TO EXECUTE"

  - id: dependencies-complete
    check: "dependencies lists all files in command_loader.requires"
    type: blocking
    validation: |
      all_required_files = flatten(command_loader[*].requires)
      all_dependency_files = flatten(dependencies[*])
      assert all_required_files is subset of all_dependency_files

  - id: files-exist
    check: "All files in dependencies actually exist"
    type: recommended
    validation: "ls {base_path}/{file} succeeds for each"
```

---

## Level 1: Identity (All Required)

```yaml
identity_checks:
  - id: agent-name
    check: "agent.name is defined"
    type: blocking
    section: "agent"

  - id: agent-id
    check: "agent.id is kebab-case"
    type: blocking
    section: "agent"
    pattern: "^[a-z]+(-[a-z]+)*$"

  - id: agent-tier
    check: "agent.tier is 1, 2, or 3"
    type: blocking
    section: "agent"

  - id: when-to-use
    check: "agent.whenToUse is descriptive (20+ chars)"
    type: blocking
    section: "agent"

  - id: persona-complete
    check: "persona has role, style, identity, focus"
    type: blocking
    section: "persona"

  - id: persona-background
    check: "persona.background has 3+ paragraphs"
    type: recommended
    section: "persona"
```

---

## Level 2: Operational (All Required)

```yaml
operational_checks:
  - id: core-principles
    check: "core_principles has 5-9 items"
    type: blocking
    min: 5
    max: 9

  - id: framework-exists
    check: "operational_frameworks has at least 1 framework"
    type: blocking
    min: 1

  - id: framework-complete
    check: "Each framework has: name, philosophy, steps, examples"
    type: blocking
    required_fields:
      - name
      - philosophy
      - steps
      - examples

  - id: framework-steps
    check: "Each framework has 3+ steps with descriptions"
    type: blocking
    min_steps: 3

  - id: commands-defined
    check: "commands has 5+ items including *help and *exit"
    type: blocking
    min: 5
    required:
      - "*help"
      - "*exit"
```

---

## Level 3: Voice DNA (All Required)

```yaml
voice_checks:
  - id: sentence-starters
    check: "voice_dna.sentence_starters has 5+ patterns"
    type: recommended
    min: 5

  - id: metaphors
    check: "voice_dna.metaphors has 3+ metaphors"
    type: recommended
    min: 3

  - id: vocabulary-always
    check: "voice_dna.vocabulary.always_use has 5+ terms"
    type: blocking
    min: 5

  - id: vocabulary-never
    check: "voice_dna.vocabulary.never_use has 3+ terms"
    type: blocking
    min: 3

  - id: behavioral-states
    check: "voice_dna.behavioral_states has 2+ states"
    type: recommended
    min: 2

  - id: signature-phrases
    check: "signature_phrases has 5+ phrases"
    type: recommended
    min: 5
```

---

## 
```

---

# CONTRATO - agent-quality-gate.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\agent-quality-gate.md
**SHA:** 4eda3b4112c20bd7
**Timestamp:** 2026-08-28T13:25:21.487616
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^[a-z]+(-[a-z]+)*$"

### Contratos
- ## Agent Quality Gate: {agent_name}

### Ouro Bruto (primeiros 5000 chars)
```
# Agent Quality Gate Checklist

```yaml
checklist:
  id: agent-quality-gate
  version: 3.0.0
  created: 2026-01-30
  updated: 2026-01-30
  purpose: "Validate agent definitions meet Hybrid Loader quality standard"
  mode: blocking  # Prevents publication if critical items fail
  architecture: "hybrid-loader"
```

---

## Pre-Validation: File Basics

```yaml
file_basics:
  - id: min-lines
    check: "Agent file has 800+ lines"
    type: blocking
    validation: "wc -l {file} >= 800"

  - id: yaml-valid
    check: "YAML syntax is valid"
    type: blocking
    validation: "yamllint passes"

  - id: no-placeholders
    check: "No unfilled {{placeholders}} remain"
    type: blocking
    validation: "grep '{{' returns empty"
```

---

## Level 0: Loader Configuration (All Required - NEW)

```yaml
loader_checks:
  - id: activation-notice
    check: "ACTIVATION-NOTICE is present"
    type: blocking
    section: "top of file"

  - id: ide-file-resolution
    check: "IDE-FILE-RESOLUTION has valid base_path"
    type: blocking
    section: "Level 0"
    required_fields:
      - base_path
      - resolution_pattern

  - id: request-resolution
    check: "REQUEST-RESOLUTION has mapping examples"
    type: blocking
    section: "Level 0"

  - id: command-loader-exists
    check: "command_loader section exists"
    type: blocking
    section: "Level 0"

  - id: command-loader-complete
    check: "Every command with loader != null has entry in command_loader"
    type: blocking
    validation: |
      For each command in commands:
        if command.loader != null:
          assert command.name in command_loader

  - id: command-loader-requires
    check: "Each command_loader entry has 'requires' array"
    type: blocking
    validation: "command_loader[*].requires is array"

  - id: critical-loader-rule
    check: "CRITICAL_LOADER_RULE is present"
    type: blocking
    must_contain:
      - "LOOKUP"
      - "STOP"
      - "LOAD"
      - "VERIFY"
      - "EXECUTE"
      - "FAILURE TO LOAD = FAILURE TO EXECUTE"

  - id: dependencies-complete
    check: "dependencies lists all files in command_loader.requires"
    type: blocking
    validation: |
      all_required_files = flatten(command_loader[*].requires)
      all_dependency_files = flatten(dependencies[*])
      assert all_required_files is subset of all_dependency_files

  - id: files-exist
    check: "All files in dependencies actually exist"
    type: recommended
    validation: "ls {base_path}/{file} succeeds for each"
```

---

## Level 1: Identity (All Required)

```yaml
identity_checks:
  - id: agent-name
    check: "agent.name is defined"
    type: blocking
    section: "agent"

  - id: agent-id
    check: "agent.id is kebab-case"
    type: blocking
    section: "agent"
    pattern: "^[a-z]+(-[a-z]+)*$"

  - id: agent-tier
    check: "agent.tier is 1, 2, or 3"
    type: blocking
    section: "agent"

  - id: when-to-use
    check: "agent.whenToUse is descriptive (20+ chars)"
    type: blocking
    section: "agent"

  - id: persona-complete
    check: "persona has role, style, identity, focus"
    type: blocking
    section: "persona"

  - id: persona-background
    check: "persona.background has 3+ paragraphs"
    type: recommended
    section: "persona"
```

---

## Level 2: Operational (All Required)

```yaml
operational_checks:
  - id: core-principles
    check: "core_principles has 5-9 items"
    type: blocking
    min: 5
    max: 9

  - id: framework-exists
    check: "operational_frameworks has at least 1 framework"
    type: blocking
    min: 1

  - id: framework-complete
    check: "Each framework has: name, philosophy, steps, examples"
    type: blocking
    required_fields:
      - name
      - philosophy
      - steps
      - examples

  - id: framework-steps
    check: "Each framework has 3+ steps with descriptions"
    type: blocking
    min_steps: 3

  - id: commands-defined
    check: "commands has 5+ items including *help and *exit"
    type: blocking
    min: 5
    required:
      - "*help"
      - "*exit"
```

---

## Level 3: Voice DNA (All Required)

```yaml
voice_checks:
  - id: sentence-starters
    check: "voice_dna.sentence_starters has 5+ patterns"
    type: recommended
    min: 5

  - id: metaphors
    check: "voice_dna.metaphors has 3+ metaphors"
    type: recommended
    min: 3

  - id: vocabulary-always
    check: "voice_dna.vocabulary.always_use has 5+ terms"
    type: blocking
    min: 5

  - id: vocabulary-never
    check: "voice_dna.vocabulary.never_use has 3+ terms"
    type: blocking
    min: 3

  - id: behavioral-states
    check: "voice_dna.behavioral_states has 2+ states"
    type: recommended
    min: 2

  - id: signature-phrases
    check: "signature_phrases has 5+ phrases"
    type: recommended
    min: 5
```

---

## Level 4: Quality Assurance (All Required)

```yaml
quality_checks:
  - id: output-examples
    check: "output_examples has 3+ complete examples"
    type: blocking
    min: 3
    required_fields:
      - tas
```