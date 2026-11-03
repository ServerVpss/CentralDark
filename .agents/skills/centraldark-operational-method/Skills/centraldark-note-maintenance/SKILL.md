---
name: centraldark-note-maintenance
category: devops
description: "Use when reconciling CentralDark notes with 10 required metadata properties per 'Atualização Viva' rule. Single owner, preserves creation date, tracks timestamps separately, extends PROVEN_CRYSTAL replay logic."
version: "1.0.0"
triggers:
  - "Fixed Point note reconciliation delta > 0"
  - "MASTER-CYCLE phase ATUALIZAR_NOTAS_VIVAS"
  - "SOUL-SOL boot flag LIVE_NOTE_UPDATE_ENABLED=true"
  - "HUD field NOTAS_DESATUALIZADAS > 0"
owner: ".agents/skills/centraldark-note-maintenance/SKILL.md"
source_of_truth:
  - "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"
  - "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml"
  - "docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md"
references:
  - "references/profile-soul-local-reconcile.md"
  - "references/delegacao-economica-com-prova.md"
scripts:
  - "scripts/reconcile_notes.py"
  - "scripts/verify_notes.py"
  - "scripts/hud_notas_desatualizadas.py"
execution_mode: "single_writer"
enforcement:
  - "unknown_not_pass"
  - "reuse_before_create"
  - "one_writer_per_scope"
  - "preserve_creation_date"
  - "hash_sha256_content"
  - "rastro_append_only"
---

# centraldark-note-maintenance

**Single owner skill** for maintaining CentralDark notes compliance with the "Atualização Viva de Arquivos e Notas" rule.

## 10 Required Properties (Every Note)

| Property | Purpose | Format |
|----------|---------|--------|
| `data_criacao` | Original creation date (preserved) | YYYY-MM-DD |
| `ultima_atualizacao` | Last content update | ISO 8601 |
| `ultima_modificacao` | Last structural change | ISO 8601 |
| `ultima_verificacao` | Last verification pass | ISO 8601 |
| `fuso_horario` | Timezone for all timestamps | America/Sao_Paulo |
| `hash_conteudo` | SHA256 of markdown body | 64-char hex |
| `rastro` | Append-only change trace | Array of objects |
| `grupo_notas` | Group directory name | 01-cabeca-intencao, etc. |
| `relacionado_a` | Related note filenames | Array of strings |
| `estado_evidencia` | Evidence state | PROVED, UNKNOWN, PENDING, BLOCKED |

## Groups (Reuse Existing Directories)

1. `01-cabeca-intencao` — intention, secrets, core decisions, CHEFE authority
2. `02-loop-mestre` — master loop, kaizen, reconciliation, cyclic processes
3. `03-evidencias-contraprovas` — evidence, counterproof, validation, gates
4. `04-pendencias-bloqueios` — pending, blockers, sync issues, gaps
5. `05-aprendizados-kaizen` — learnings, principles, evolution, patterns

## Replay Logic (Extends PROVEN_CRYSTAL)

- **Same fingerprint (hash_conteudo)** → replay reconciliation, no revalidation
- **Changed content** → revalidate affected notes only
- **Missing properties** → add with current timestamps, preserve creation date
- **Moved between groups** → update `grupo_notas`, append to `rastro`

## HUD Integration

- Field: `NOTAS_DESATUALIZADAS`
- Source: Fixed Point note reconciliation delta
- Trigger: delta > 0 → MASTER-CYCLE phase ATUALIZAR_NOTAS_VIVAS

## Fiscal Verification

Uses `scripts/trigger-fabric/rastro_fiscal.py` with check: `ALL_NOTES_HAVE_10_PROPS_AND_VALID_HASH`
Pass condition: `ZERO_NOTES_MISSING_PROPS`

## Invocation

```bash
# Full reconciliation
python scripts/reconcile_notes.py --all

# Verify only
python scripts/verify_notes.py --all

# HUD metric
python scripts/hud_notas_desatualizadas.py
```

## Constraints

- **One writer** — only this skill modifies note metadata
- **Preserve creation date** — never overwrite `data_criacao`
- **Append-only rastro** — never remove or rewrite trace entries
- **Unknown ≠ Pass** — missing properties = BLOCKED until resolved
- **No bulk rewrite** — only touch notes that need updates