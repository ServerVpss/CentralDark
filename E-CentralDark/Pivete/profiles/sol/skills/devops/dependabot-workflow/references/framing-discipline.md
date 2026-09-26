# Framing and Classification Discipline (from session corrections)

Session-corrected framing rules that apply when reporting diagnosis or synthesis findings — not just for dependabot, but as the default voice for this class of analysis.

## 1. "Gap" is a strong word — prefer "formalization" when the capability already exists

When you find documentation, taxonomy, or didactics that improve how an existing capability is expressed, that is **not** a capability gap.

Write:
```
CAPABILITY_GAP = false
EXPLICIT_TAXONOMY_GAP = candidate   # or documentation gap, or formalization candidate
```

Do not write "there is a gap" and then immediately describe something that is just formalization of an already-working capability. The stronger claim requires a real missing capability, not a missing label.

## 2. Compound profile, not "three agents"

When a persona or role profile can be read as SRE + Pragmatic Programmer + SDET, say so as a **single compound operational profile**, not as "spawn three agents".

```
ROLE_PROFILE =
  SRE
  + PRAGMATIC_PROGRAMMER
  + SDET
```

Only spin multiple agents when there is a real, material gain from independent parallel work — not to re-describe one profile three ways.

## 3. Determinism requires controlled state — do not overclaim

Do not reduce "same input → same output" to a universal law. That is false in any system with clock, network, database, concurrency, or external state.

Use the precise form:

```
MESMO_INPUT + MESMO_ESTADO_CONTROLADO + MESMAS_PREMISAS
→ COMPORTAMENTO ESPERADO REPRODUZÍVEL
```

When you claim determinism, state what is held fixed and what is out of scope.

## 4. State can change mid-session — re-measure before declaring

Do not anchor a finding to a main SHA you read once and never re-check. In this session, `origin/main` moved from `c8df7c72...` to `5d7b1149...` while analysis was running.

Before any verdict that depends on state, re-measure:
```
START_MAIN = <sha at first read>
FINAL_MAIN = <sha at verdict>
HEAD_CHANGED_DURING_MISSION = SIM or NAO
```

If it changed, incorporate the delta; do not hide it under a snapshot taken earlier.

## 5. Classify the cause before proposing the remedy

For the dependabot loop specifically:
- `DEPENDABOT_BUG = não provado` — you did not prove a bug.
- `PR_STATE_CONFLICT = provado` — the dirty history is real and observable.
- `REBASE_LOOP_CAUSE = edição externa + repetição do comando` — the loop is self-inflicted rebase retries.
- `RECREATE = destrutivo para edições externas, portanto não automático` — recreate is a deliberate choice, not an automatic fix.

Reporting the cause classification before the remedy is the difference between an observation and a diagnosis.

## 6. Keep the gold list short and honest

When you synthesize an external source (e.g. a course), resist the temptation to inflate the delta. In this session, the honest gold from INEMA.CLUB was:

- Taxonomia explícita de diff como linguagem de leitura (formalização, não capacidade nova).
- Argumento de segurança do "espelho" como justificativa didática (reforço, não novidade).

Everything else was reforço/proveniência of something the target already crystallized. Say that. Do not pad the delta to look bigger.

## Pitfall

Writing a long synthesis and then burying the real delta under a wall of "overlap" notes is the opposite of Menos é Mais. Lead with the honest classification, then support it.
