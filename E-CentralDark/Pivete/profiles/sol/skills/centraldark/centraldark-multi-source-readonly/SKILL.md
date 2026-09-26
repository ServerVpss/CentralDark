---
name: centraldark-multi-source-readonly
description: Multi-source read-only with Google Drive skill, cognitive #acordar !calibrar, delta util.
version: 1.0.0
author: Pivete
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, read-only, multi-source, google-drive, cognitivo, deltautil]
    related_skills: [centraldark-casa-operations, google-drive-document-handling, centraldark-drive-reconciliation, auto-destilador]
---

# CentralDark Multi-Source Read-Only Method

Método original da Casa para **read-only de múltiplas fontes comprovadas** sem abandonar missão atual, usando skill Google Drive para destino canônico e pensamento cognitivo `#acordar !calibrar`.

## Princípios (CORTANTE)

- **READ_ONLY FIRST** — nunca muta no primeiro passe
- **MULTI-SOURCE PROVEN** — só fontes com evidência (git, gh, drive export, screenpipe, runtime)
- **GOOGLE DRIVE SKILL** — usa `google-drive-document-handling` para exportar/normalizar → destino canônico Casa
- **COGNITIVO NATIVO** — `#acordar → !calibrar → !reconciliar → !deltautil → !contrapova → !fixed_point` embutido
- **NO ABANDON** — missão principal continua; Drive é side-channel assíncrono
- **DELTAUTIL NATIVO** — absorve só delta útil (REUSE_BEFORE_CREATE, ZERO V2/V3)

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  COGNITIVE CORE (#acordar !calibrar)                        │
│  ├─ Intent Resolution                                       │
│  ├─ Source Discovery (git/gh/drive/screenpipe/runtime)     │
│  ├─ Provenance Gate (UNKNOWN ≠ PASS)                        │
│  └─ Delta Util Filter (REUSE_BEFORE_CREATE)                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ GIT/GH  │         │  DRIVE  │         │RUNTIME  │
   │ SOURCE  │         │ EXPORT  │         │ PROBE   │
   │  READ   │         │ + SKILL │         │  READ   │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  CANONICAL DEST │
                   │  (Casa Repo)    │
                   │  DELTA-CONTINUO │
                   └─────────────────┘
```

## Gatilho

```bash
# Modo cognitivo completo
!CENTRALDARK:: multi-source-read-only <intenção>

# Ou direto no terminal
python scripts/centraldark_multi_source_readonly.py --intencao "<intenção>" --fontes git,gh,drive,runtime
```

## Fontes Suportadas (READ_ONLY)

| Fonte | Skill/Ferramenta | Prova Mínima |
|-------|------------------|--------------|
| GitHub (repo/PRs/issues) | `gh` CLI + `git` | `gh pr view`, `git ls-remote` |
| Google Drive | `google-drive-document-handling` | Export PDF/DOCX → texto + hash |
| Screenpipe | `screenpipe-hermes-integration` | `screenpipe query` + causal chain |
| Runtime local | `terminal` + `computer_use` | `netstat`, `ps`, health check |
| Clone local | `git` | `git status`, `git diff` |
| Skills locais | `skill_view` | SKILL.md + linked files |

## Fluxo Operacional (COGNITIVO)

### Fase 1: #ACORDAR — Intent & Context Load
```python
def acordar(intent: str, mission_id: str):
    # Carrega SOUL, mission context, writer scope
    # Define NEXT_CURSOR
    return CognitiveState(
        intent=intent,
        mission_id=mission_id,
        soul_loaded=True,
        writer_scope=resolve_writer_scope(intent),
        next_cursor="SOURCE_DISCOVERY"
    )
```

### Fase 2: !CALIBRAR — Source Discovery & Provenance
```python
def calibrar(state: CognitiveState):
    sources = discover_sources(state.intent)
    proven_sources = []
    for src in sources:
        evidence = measure_source(src)
        if evidence.provenance != "UNKNOWN":
            proven_sources.append(evidence)
    state.proven_sources = proven_sources
    state.next_cursor = "DELTA_HARVEST"
    return state
```

### Fase 3: !RECONCILIAR — Multi-Source Cross-Check
```python
def reconciliar(state: CognitiveState):
    # Cross-referencia fontes
    # Detecta contradições (FQDN_ASSOCIADO != CAUSALIDADE)
    # Classifica: CURRENT_PROVEN / HISTORICAL / CONTRADICTED / UNKNOWN
    state.reconciled = cross_check(state.proven_sources)
    state.next_cursor = "DELTA_UTIL"
    return state
```

### Fase 4: !DELTAUTIL — Delta Útil Extraction
```python
def deltautil(state: CognitiveState):
    # Só delta que:
    # - NÃO existe na Casa (git ls-tree origin/main)
    # - É mais novo (timestamp/hash)
    # - Tem dono canônico (REUSE_BEFORE_CREATE)
    # - Não é V2/V3/paralelo
    state.delta = extract_delta(state.reconciled)
    state.next_cursor = "CONTRAPROVA"
    return state
```

### Fase 5: !CONTRAPROVA — Counterproof Gate
```python
def contrapova(state: CognitiveState):
    # Testa se delta sobrevive:
    # - node --test / python -m pytest
    # - Contraprova independente
    # - Reality Judge (runtime real)
    state.counterproof = run_counterproof(state.delta)
    state.next_cursor = "FIXED_POINT" if state.counterproof.passed else "REMEDIACAO"
    return state
```

### Fase 6: !FIXED_POINT — Canonical Registration
```python
def fixed_point(state: CognitiveState):
    # Registra no owner canônico (DELTA-CONTINUO.md)
    # Single writer, commit mínimo, PR se necessário
    # Receipt com hash, timestamp, provenance
    receipt = register_canonical(state.delta, state.proven_sources)
    state.receipt = receipt
    state.next_cursor = "BOOT"
    return state
```

## Google Drive Integration (Skill Obrigatório)

```python
from skills.google_drive_document_handling import detect_and_extract

def drive_readonly_export(drive_url_or_path: str, canonical_dest: str):
    """
    1. Baixa arquivo do Drive (gdrive CLI ou browser)
    2. Detecta formato (file command)
    3. Extrai texto (pymupdf / python-docx / direto)
    4. Normaliza (UTF-8, remove BOM, line endings)
    5. Hash SHA256
    6. Compara com Casa (git cat-file)
    7. Se delta útil → grava no owner canônico
    8. Receipt: source_url, hash, dest_path, delta_size, timestamp
    """
    pass
```

## CLI Usage

```bash
# Comando único cognitivo
hermes centraldark multi-source-readonly \
  --intencao "absorver delta do Drive DELTAUNIFICADOCENTRALDARK.md" \
  --fontes drive,git,gh \
  --destino docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md \
  --cognitivo

# Ou via script direto
python E:\CentralDark\Pivete\CentralDark\scripts\centraldark_multi_source_readonly.py \
  --intencao "reconciliar auto-ingestão + fixed-point runner do Drive" \
  --drive-url "https://docs.google.com/document/d/1ZFhlcoPclDuNPXtD4FSfq4_Zfyb4L0vwBAcselkyC_E" \
  --destino "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md"
```

## Saída (Receipt Canônico)

```json
{
  "schema": "centraldark.multi-source-receipt.v1",
  "mission_id": "msr-20260902-001",
  "timestamp": "2026-09-02T03:45:00Z",
  "intent": "absorver delta auto-ingestão + fixed-point runner",
  "cognitive_chain": ["ACORDAR", "CALIBRAR", "RECONCILIAR", "DELTAUTIL", "CONTRAPROVA", "FIXED_POINT", "REGISTRA", "BOOT"],
  "sources": [
    {"type": "drive", "url": "...", "hash": "sha256...", "provenance": "CURRENT_PROVEN"},
    {"type": "git", "ref": "origin/main", "hash": "sha256...", "provenance": "CURRENT_PROVEN"},
    {"type": "gh", "pr": 1382, "provenance": "COMPLEMENTARY"}
  ],
  "delta": {
    "files_changed": 1,
    "lines_added": 47,
    "lines_removed": 0,
    "owner": "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md",
    "reuse_before_create": true,
    "no_v2_v3": true
  },
  "counterproof": {"passed": true, "tests": ["node --test", "reality_judge"]},
  "fixed_point": {"achieved": true, "receipt_hash": "sha256..."},
  "next_cursor": "BOOT"
}
```

## Trava de Segurança

- **NUNCA** escreve sem `counterproof.passed == true`
- **NUNCA** cria owner novo se existente cobre (`REUSE_BEFORE_CREATE`)
- **NUNCA** `UNKNOWN` vira `PASS`
- **NUNCA** abandona missão principal (async side-channel)
- **SEMPRE** `git ls-tree origin/main` antes de gravar

## Exemplo Real (do Drive atual)

Entrada: `https://docs.google.com/document/d/1ZFhlcoPclDuNPXtD4FSfq4_Zfyb4L0vwBAcselkyC_E`
Conteúdo: Loop auto-ingestão, `!BOOT-FORJA-TOTAL`, `Fixed-Point Runner`, `Forja Viva`, `Capetinha da Forja`, `Dependabot mesmo runner`, `regras rígidas teste/contraprova/fixed_point`

Saída esperada no `DELTA-CONTINUO.md`:
```markdown
## DELTA 2026-09-02 — Auto-Ingestão Loop + Fixed-Point Runner
**Source**: Google Docs (Drive) → `DELTAUNIFICADOCENTRALDARK.md`
**Hash**: `sha256:...`
**Provenance**: CURRENT_PROVEN
**Owner**: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md`

### Conceitos Absorvidos
- `auto_ingestion_loop` — gates de proveniência obrigatórios
- `boot_forja_total` — comando único inicia forja + fixed-point runner
- `forja_viva` — estado com temperatura + respirações (Kimetsu)
- `visual_identity` — "Capetinha da Forja"
- `dependabot_same_runner` — sem segundo cérebro (regra Casa)
- `test_contraprova_fixed_point` — regras rígidas obrigatórias

### Regras Cristalizadas
1. `DECISION_STABILITY`: intenção resolvida não rediscute
2. `TOOL_AVAILABLE_PROVEN`: não rediscute disponibilidade
3. `REUSE_BEFORE_CREATE`: owner existente = patch mínimo
4. `NO_REDELIBERATION`: same evidence + same intent = execute next
5. `FIXED_POINT`: decisão só reabre por nova evidência/falha/intenção mudança
```

---

**Este método é original da Casa. Não existe fora do CentralDark. Usa, não copia.**