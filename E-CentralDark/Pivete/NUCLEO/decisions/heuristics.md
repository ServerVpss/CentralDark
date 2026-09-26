# DECISAO - heuristics.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\config\heuristics.yaml
**SHA:** 1b0a89e6a14d1098
**Timestamp:** 2026-08-28T13:25:25.370523
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - condition: "guardrails_missing = true"

### Ouro Bruto (primeiros 5000 chars)
```
# HEURISTICS ENGINE - Squad-Creator
# Source patterns: PV_BS_001, PV_PA_001, PV_PM_001, AN_KE_001, AN_KE_002, AN_KE_003
# Version: 2.0
# Last Updated: 2026-02-10

heuristics_engine:
  version: "2.0"
  philosophy: |
    "Se você cria impossibilidades, cada um vai ter infinitas possibilidades
    de pegar aquilo e adaptar para a realidade dele."
    Heurísticas são atalhos de decisão baseados em padrões comprovados.

  source_artifacts:
    # Pedro Valério (Build)
    - "minds/pedro_valerio/heuristics/PV_BS_001.md"
    - "minds/pedro_valerio/heuristics/PV_PA_001.md"
    - "minds/pedro_valerio/heuristics/PV_PM_001.md"
    # OalaNicolas (Extraction)
    - "minds/oalanicolas/heuristics/AN_KE_001.md"
    - "minds/oalanicolas/heuristics/AN_KE_002.md"
    - "minds/oalanicolas/heuristics/AN_KE_003.md"

  # ============================================
  # SC_HE_001 - VISION ALIGNMENT (Future Back-Casting)
  # ============================================
  SC_HE_001:
    name: "Vision Alignment"
    source: "PV_BS_001"
    phase: "architecture"
    mode: "*eng-*"
    description: |
      Strategic alignment validation using future back-casting.
      Evaluates whether proposed actions directly enable the squad vision.

    weights:
      squad_vision_clarity: 0.9
      agent_coverage: 0.8
      workflow_coherence: 0.7

    thresholds:
      vision_clarity: 0.7
      agent_coverage: 0.8
      workflow_coherence: 0.7

    decision_tree: |
      IF (squad_vision_clarity >= 0.7 AND agent_coverage >= 0.8)
        THEN APPROVE → Proceed to DNA extraction

      ELSE IF (squad_vision_clarity >= 0.7 AND agent_coverage < 0.8)
        THEN REVIEW → Add missing agents

      ELSE IF (squad_vision_clarity < 0.7)
        THEN VETO → Return to Discovery, clarify vision

    veto_conditions:
      - condition: "squad_vision_clarity < 0.7"
        action: "VETO - Vision unclear"
        recovery: "Define clear squad purpose and scope"
        maps_to: "SC_VC_002"

    validation_questions:
      - "O propósito do squad está claramente definido?"
      - "Quais problemas específicos esse squad resolve?"
      - "Os agents cobrem todas as capabilities necessárias?"
      - "Os workflows conectam os agents corretamente?"

    output:
      type: "decision"
      values: ["APPROVE", "REVIEW", "VETO"]

    integration:
      checkpoint: "architecture-review"
      pass_action: "Proceed to Phase 3 (DNA Extraction)"
      fail_action: "Return to Discovery with feedback"

  # ============================================
  # SC_HE_002 - AGENT COHERENCE (Systemic Coherence Scan)
  # ============================================
  SC_HE_002:
    name: "Agent Coherence"
    source: "PV_PA_001"
    phase: "agent_creation"
    mode: "*arq-*"
    description: |
      Coherence validation for agent DNA and behavior.
      Truthfulness (authenticity to source) has VETO power.

    weights:
      dna_authenticity: 1.0     # VETO power
      voice_coherence: 0.9
      thinking_coherence: 0.8
      behavior_consistency: 0.7

    thresholds:
      dna_authenticity: 0.7     # Must be authentic
      voice_coherence: 0.7
      thinking_coherence: 0.7
      behavior_consistency: 0.8

    decision_tree: |
      PRIMARY BRANCH:
        IF (dna_authenticity < 0.7 OR fabricated_content_detected)
          THEN VETO → Agent is not authentic to source

      SECONDARY BRANCH:
        ELSE IF (voice_coherence < 0.7 OR thinking_coherence < 0.7)
          THEN REVIEW → DNA needs refinement

      TERTIARY BRANCH:
        ELSE IF (behavior_consistency < 0.8)
          THEN REVIEW → Run more smoke tests

      SUCCESS:
        IF (all thresholds met)
          THEN APPROVE → Agent ready for integration

    veto_conditions:
      - condition: "dna_authenticity < 0.7"
        action: "VETO - Agent not authentic"
        recovery: "Return to DNA extraction with more sources"
        maps_to: "SC_VC_005"

      - condition: "fabricated_content_detected = true"
        action: "VETO - Fabricated content found"
        recovery: "Remove fabricated content, verify all claims"
        maps_to: "SC_VC_003"

    validation_questions:
      - "O agent soa como a pessoa real?"
      - "Os frameworks usados são documentados ou inventados?"
      - "As citações têm [SOURCE:] verificável?"
      - "O comportamento é consistente em múltiplos testes?"

    authenticity_assessment:
      authentic:
        description: "DNA matches verifiable sources"
        score_range: [0.7, 1.0]
        action: "APPROVE"

      questionable:
        description: "Some content cannot be verified"
        score_range: [0.4, 0.7]
        action: "REVIEW - Verify sources"

      fabricated:
        description: "Content clearly invented or contradicts sources"
        score_range: [0.0, 0.4]
        action: "VETO - Remove fabricated content"

    output:
      type: "decision"
      values: ["APPROVE", "REVIEW", "VETO"]

    integration:
      checkpoint: "agent-coherence-review"
      pass_action: "Pr
```