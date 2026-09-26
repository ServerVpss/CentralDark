# COMANDO - operational-score.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\operational-score.mjs
**SHA:** 9e6d3418fd082733
**Timestamp:** 2026-08-28T02:56:40.547249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- export const OPERATIONAL_SCORE_CONTRACT = Object.freeze({

### Gaps
- if (!String(signature[field] || '').trim()) problems.push(`CAPABILITY_FIELD_MISSING:${key}:${field}`);
- if (repoRoot && !existsSync(resolve(repoRoot, signature.owner))) problems.push(`CAPABILITY_OWNER_MISSING:${key}:${signature.owner}`);
- if (!String(event[field] ?? '').trim()) problems.push(`MACHINE_EVENT_FIELD_MISSING:${field}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const OPERATIONAL_SCORE_CONTRACT = Object.freeze({
  OPERATIONAL_SCORE: true,
  MACHINE_EVENT_IS_AUTHORITY: true,
  HUMAN_PRESENTATION_IS_PROJECTION: true,
  EMOJI_IS_TELEMETRY_NOT_LOGIC: true,
  MUSICAL_MARKER_IS_TELEMETRY_NOT_LOGIC: true,
  UNKNOWN_CAPABILITY_FAILS_CLOSED: true,
  ZERO_DEPLOY: true,
});

export const CAPABILITY_SIGNATURES = Object.freeze({
  META_LUPA: Object.freeze({
    capability_id: 'META_LUPA',
    owner: '.agents/skills/meta-lupa/SKILL.md',
    semantic_role: 'investigacao_e_contraprova',
    signature_family: 'SCIENCE_NAVIGATION',
    visual_candidates: Object.freeze(['🔍', '🛡️', '🔬', '🧭']),
    musical_candidates: Object.freeze(['♩', '♪']),
    verbs: Object.freeze(['contraprovando', 'investigando', 'falsificando']),
  }),
  METACOGNICAO: Object.freeze({
    capability_id: 'METACOGNICAO',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'recalibracao_de_crenca_e_metodo',
    signature_family: 'MIND_SCIENCE',
    visual_candidates: Object.freeze(['🧠', '🪞', '🔬']),
    musical_candidates: Object.freeze(['♫', '♩']),
    verbs: Object.freeze(['recalibrando', 'revisando metodo', 'medindo delta']),
  }),
  MINERACAO: Object.freeze({
    capability_id: 'MINERACAO',
    owner: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md',
    semantic_role: 'extracao_de_capacidade',
    signature_family: 'CRAFT_GEMS',
    visual_candidates: Object.freeze(['⛏️', '💎', '🔎', '🪨']),
    musical_candidates: Object.freeze(['♪', '♩']),
    verbs: Object.freeze(['minerando', 'extraindo delta', 'garimpando capacidade']),
  }),
  DREAM_REVIEW: Object.freeze({
    capability_id: 'DREAM_REVIEW',
    owner: 'scripts/memory-linker/dream-review.mjs',
    semantic_role: 'destilacao_e_revisao_de_aprendizado',
    signature_family: 'MIND_CRAFT',
    visual_candidates: Object.freeze(['🌙', '🧪', '🧩']),
    musical_candidates: Object.freeze(['♫', '♬']),
    verbs: Object.freeze(['destilando', 'revisando aprendizado', 'comparando padroes']),
  }),
  ARTIFACT_TO_CAPABILITY: Object.freeze({
    capability_id: 'ARTIFACT_TO_CAPABILITY',
    owner: 'scripts/memory-linker/artifact-capability.mjs',
    semantic_role: 'materia_para_capacidade_candidata',
    signature_family: 'CRAFT_NAVIGATION',
    visual_candidates: Object.freeze(['🧱', '🧰', '🧭']),
    musical_candidates: Object.freeze(['♪', '♩']),
    verbs: Object.freeze(['classificando materia', 'extraindo sinais', 'roteando candidato']),
  }),
  CRISTALIZACAO: Object.freeze({
    capability_id: 'CRISTALIZACAO',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'persistencia_de_aprendizado_provado',
    signature_family: 'GEMS',
    visual_candidates: Object.freeze(['💎', '🔷', '🧊']),
    musical_candidates: Object.freeze(['♬', '♫']),
    verbs: Object.freeze(['cristalizando', 'persistindo ouro', 'tornando herdavel']),
  }),
  FIXED_POINT: Object.freeze({
    capability_id: 'FIXED_POINT',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'fechamento_comprovado_do_denominador_aplicavel',
    signature_family: 'SIGNALS_GEMS',
    visual_candidates: Object.freeze(['✅', '🎯', '💎']),
    musical_candidates: Object.freeze(['♬']),
    verbs: Object.freeze(['fechando denominador', 'confirmando ponto fixo']),
  }),
});

const BEHAVIORAL_MAP = Object.freeze({
  RHYTHM: 'OPERATIONAL_CADENCE', RITMO: 'OPERATIONAL_CADENCE',
  CADENCE: 'OPERATIONAL_CADENCE', CADENCIA: 'OPERATIONAL_CADENCE',
  TEMPO: 'OPERATIONAL_CADENCE',
  PAUSE: 'WAIT_FOR_NEW_INFORMATION', PAUSA: 'WAIT_FOR_NEW_INFORMATION',
  SILENCE: 'NO_NEW_INFORMATION_NOOP', SILENCIO: 'NO_NEW_INFORMATION_NOOP',
  CRESCENDO: 'INCREASE_DEPTH_WHILE_INFORMATION_GAIN_CONTINUES',
  DECRESCENDO: 'REDUCE_ACTIVITY_WHEN_DELTA_CONVERGES',
  REFRAIN: 'REASSERT_MISSION_INVARIANTS', REFRAO: 'REASSERT_MISSION_INVARIANTS',
  BRIDGE: 'STRATEGY_TRANSITION', PONTE: 'STRATEGY_TRANSITION',
  COUNTERPOINT: 'COMPARE_INDEPENDENT_HYPOTHESES', CONTRAPONTO: 'COMPARE_INDEPENDENT_HYPOTHESES',
  HARMONY: 'CAPABILITIES_COOPERATE_WITHOUT_SEMANTIC_MERGE', HARMONIA: 'CAPABILITIES_COOPERATE_WITHOUT_SEMANTIC_MERGE',
  DISSONANCE: 'INVESTIGATE_CONFLICTING_EVIDENCE', DISSONANCIA: 'INVESTIGATE_CONFLICTING_EVIDENCE',
  TENSION: 'UNRESOLVED_HYPOTHESIS', TENSAO: 'UNRESOLVED_HYPOTHESIS',
  RESOLUTION: 'PROVEN_CLOSURE', RESOLUCAO: 'PROVEN_CLOSURE',
  DYNAMICS: 'INVESTIGATION_INTENSITY', DINAMICA: 'INVESTIGATION_INTENSITY',
  CLIMAX: 'FINAL_COUNTERPROOF',
  CODA: 'FINAL_RECEIPT_AND_CLOSURE',
});

const BEHAVIORAL_REUSE = Object.freeze({
  REASSERT_MISSION_INVARIANTS: 'METACOGNICAO',
  COMPARE_INDEPENDENT_HYPOTHESES: 'META_LUPA',
  INVESTIGATE_CONFLICTING_EVIDENCE: 'META_LUPA',
  PROVEN_CLOSURE: 'FIXED_POINT',
  FINAL_COUNTERPROOF: 'META_LUPA',
});

const EVENT_STATUSES = new Set(['PASS', 'FAIL', 'UNKNOWN', 'ANOMALY', 'ACHADO_PENDENTE', 'BLOCKED']);

```