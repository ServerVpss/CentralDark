# RECONCILIATION INVENTORY — E:\CentralDark
**Date:** 2026-08-29  
**Branch:** reconciliacao/casa-20260829-consolidacao  
**PR:** pending creation  

---

## ITEMS SCANNED

### 1. E:\CentralDark\Pivete\CentralDark (CANONICAL LOCAL REPO)
- **Status:** ✅ CANONICAL_ALREADY
- **Hash:** 0dbb5d2d6210d70c0f0b31dbfa869007ac5cd4f3 (origin/main)
- **Notes:** Active checkout, no modifications needed

### 2. E:\CentralDark\_SOBRA_BRAIN
- **Classification:** MIRROR_OR_DUPLICATE (proven earlier)
- **Owner Declared:** docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md
- **Actual Location in Canonical:** docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/
- **Content Status:** 
  - generalizations.json (13.244 bytes) = SEMANTICALLY_ABSORVIDO_IN_CANONICAL
  - .gitkeep.v1..v8 = COLLISION_ARTIFACT (8 worktrees achated without dedup)
  - duplica MD files = MIRROR_NOISE
- **Action:** DELETE_LOCAL_COPY (KNOWN_SEMANTIC_DUPLICATE_PROVEN)

### 3. E:\CentralDark\_MAPA_CASA
- **Classification:** EVIDENCE + HISTORICAL
- **Contents:**
  - 6bacfd1b-00e9-4daa-a048-b24fe47454bd.png (2.1 MB)
  - Screenpipe Activity reshapes CentralDark integration.html (746 KB)
  - Screenpipe Activity reshapes CentralDark integration_files.zip (47 MB)
  - _MAPA_CASA.zip (125 MB)
- **Purpose:** Evidence archive for reconciliation kit
- **Action:** KEEP_AS_REFERENCE (non-repo artifact, not versioned)

### 4. E:\CentralDark\_RECONCILIATION/OURO/MAPA_CASA/PASTA DO CHEFE
- **Classification:** HISTORICAL + ECHO_MIRROR
- **Contents:**
  - content.pdf (977 KB, timestamp 2026-08-29 14:48)
  - Duplicate of _MAPA_CASA/Screenpipe...integration_files/content.pdf
  - .gitkeep.v1..v8 + multiple named copies of conf files
- **Action:** QUARANTINE (not delete — classify as SOBRA until decision)

### 5. E:\CentralDark\Pivete\worktrees/*
- **Worktrees found:**
  - `absorver-para-hermes` (desktop-absorcao-pr) → branch: absorcao-hermes-desktop
  - `desktop-absorcao` → branch: absorcao-hermes-desktop (stale, merged)
  - others: READ_ONLY for mining only
- **Action:** REUSE_EXISTING (absorber-para-hermes active, one-writer rule holds)

### 6. E:\CentralDark\copilot-worktrees/*
- **Status:** READ_ONLY (not writer, used for reconciliation inspection only)
- **Action:** NO_CHANGES

---

## CLASSIFICATION SUMMARY

| Classification | Count | Action |
|---|---|---|
| CANONICAL_ALREADY | 1 | KEEP |
| MIRROR_OR_DUPLICATE | 2 | DELETE_LOCAL |
| EVIDENCE_HISTORICAL | 2 | KEEP_AS_REFERENCE |
| REUSE_EXISTING_WORKTREE | 1 | USE |
| UNKNOWN | 0 | — |
| SECRET_OR_SENSITIVE | 0 | — |

---

## DECISIONS

1. **_SOBRA_BRAIN:** PROVEN MIRROR → DELETE after recording proof
2. **RECONCILIATION mirrors:** ECHO_ARTIFACTS → QUARANTINE (staged delete)
3. **Worktrees:** ONE_WRITER enforced — absorber-para-hermes is active
4. **Canonical local:** Already clean (no mutations)

---

## NEXT: CREATE PR + COMMIT DELTAS

- PR #PENDING will absorb:
  - Any useful delta from _SOBRA_BRAIN (none found — pure mirror)
  - Configuration/owner updates if needed
  - Reconciliation proof + cleanup records

---

## PAPAGAIO=OFF
DEPLOYMENT=FALSE  
VPS_MUTATION=FALSE
