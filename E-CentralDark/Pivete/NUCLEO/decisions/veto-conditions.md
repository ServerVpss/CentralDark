# DECISAO - veto-conditions.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\config\veto-conditions.yaml
**SHA:** 87feb8d4a79e3835
**Timestamp:** 2026-08-28T13:25:25.260678
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- source_pattern: "HO-VC-001"
- source_pattern: "HO-VC-001"
- source_pattern: "HO-VC-002"
- source_pattern: "HO-VC-003"
- source_pattern: "HO-AX-001"
- source_pattern: "HO-TP-001"

### Principios
- principle: "Nada volta num fluxo. NUNCA."
- principle: "Se entrar cocô, sai cocô do outro lado"
- principle: "Clone precisa dos TRÊS para funcionar bem"
- principle: "Menos material ouro > muito material bronze"
- principle: "Rastreabilidade é não-negociável"
- principle: "Se não passou no checklist, LOOP. Não handoff."
- principle: "REUSE > CREATE. Existing → Gap → Options → Recommendation"
- principle: "VERIFY PHYSICALLY BEFORE THEORIZING"
- principle: "Se Disse 2x → Vira Regra"

### Gaps
- trigger: "required_fields_missing = true"
- if_missing: "Clone não sabe O QUE fazer"
- if_missing: "Clone não sabe QUANDO/COMO decidir"
- if_missing: "Clone não tem referência de QUALIDADE"

### Ouro Bruto (primeiros 5000 chars)
```
# VETO CONDITIONS ENGINE - Squad-Creator
# Source patterns: HO-VC-001, HO-VC-002, HO-VC-003 + AN_VC_001-005
# Version: 2.0
# Last Updated: 2026-02-10

veto_engine:
  version: "2.0"
  philosophy: |
    "Processo que permite erro é processo quebrado."
    Veto conditions são bloqueios FÍSICOS, não recomendações.
    Se o executor CONSEGUE fazer errado, o processo está errado.

  outcomes:
    APPROVE: "Proceed to next phase"
    REVIEW: "Address concerns before proceeding"
    VETO: "BLOCKED - Cannot proceed until resolved"

  conditions:
    # ============================================
    # PHASE 1: DISCOVERY
    # ============================================
    SC_VC_001:
      name: "Domain Viability Veto"
      phase: "discovery"
      trigger: "elite_minds_count < 3 OR source_quality < 0.6"
      action: "VETO - Domain not viable for squad creation"
      severity: "BLOCKING"
      source_pattern: "HO-VC-001"
      validation_questions:
        - "Existem pelo menos 3 elite minds documentados no domínio?"
        - "As fontes são acessíveis (livros, podcasts, entrevistas)?"
        - "Existem frameworks documentados para extrair?"

    # ============================================
    # PHASE 2: ARCHITECTURE
    # ============================================
    SC_VC_002:
      name: "Vision Clarity Veto"
      phase: "architecture"
      trigger: "squad_vision_clarity < 0.7"
      action: "VETO - Vision unclear, return to Discovery"
      severity: "BLOCKING"
      source_pattern: "HO-VC-001"
      validation_questions:
        - "O propósito do squad está claramente definido?"
        - "Os agents cobrem todas as capabilities necessárias?"
        - "Os workflows conectam os agents corretamente?"

    # ============================================
    # PHASE 3: DNA EXTRACTION
    # ============================================
    SC_VC_003:
      name: "Source Quality Veto"
      phase: "dna_extraction"
      trigger: "verified_quotes < 15 OR signature_phrases < 5"
      action: "VETO - Insufficient source material"
      severity: "BLOCKING"
      validation_questions:
        - "Existem pelo menos 15 citações com [SOURCE:]?"
        - "Existem pelo menos 5 signature phrases verificáveis?"
        - "Todas as inferências estão marcadas como tal?"
      recovery: "Retornar para @oalanicolas para mais extração"

    SC_VC_004:
      name: "DNA Completeness Veto"
      phase: "dna_extraction"
      trigger: "voice_dna_missing OR thinking_dna_missing"
      action: "VETO - DNA extraction incomplete"
      severity: "BLOCKING"
      required_components:
        voice_dna:
          - "signature_phrases (min 5)"
          - "vocabulary (power_words, transforms)"
          - "tone (warmth, directness, formality, confidence)"
        thinking_dna:
          - "primary_framework"
          - "heuristics (min 3)"
          - "anti_patterns"
          - "decision_architecture"

    # ============================================
    # PHASE 4: AGENT CREATION
    # ============================================
    SC_VC_005:
      name: "Agent Coherence Veto"
      phase: "agent_creation"
      trigger: "agent_behavior_coherence < 0.7"
      action: "VETO - Agent behavior inconsistent with persona"
      severity: "CRITICAL"
      source_pattern: "HO-VC-002"
      validation_tests:
        - name: "Consistency Test"
          method: "Run same input 10x"
          threshold: "10/10 identical outputs"
        - name: "Persona Alignment Test"
          method: "Compare output style to voice_dna"
          threshold: ">90% alignment"
        - name: "Guardrail Compliance Test"
          method: "Test edge cases against anti_patterns"
          threshold: "0 violations"

    SC_VC_006:
      name: "Smoke Test Veto"
      phase: "agent_creation"
      trigger: "smoke_tests_passed < 3"
      action: "VETO - Agent fails basic validation"
      severity: "CRITICAL"
      required_tests:
        - "Test 1: Greeting displays correctly"
        - "Test 2: Core command executes"
        - "Test 3: Handoff triggers correctly"

    # ============================================
    # PHASE 5: WORKFLOW DESIGN
    # ============================================
    SC_VC_007:
      name: "Guardrail Missing Veto"
      phase: "workflow_design"
      trigger: "guardrails_count < 5"
      action: "VETO - Workflow missing required guardrails"
      severity: "BLOCKING"
      source_pattern: "HO-VC-003"
      required_guardrails:
        - name: "loop_prevention"
          description: "Max iterations, deduplication"
        - name: "idempotency"
          description: "Same input → same output"
        - name: "audit_trail"
          description: "Log all state changes"
        - name: "manual_escape"
          description: "Human override route"
        - name: "retry_logic"
          description: "Graceful failure handling"

    SC_VC_008:
      name: "Unidirectional Flow Veto"
      phase: "workflow_design"
      trigger: "st
```