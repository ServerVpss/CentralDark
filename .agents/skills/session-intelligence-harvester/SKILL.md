---
name: session-intelligence-harvester
description: Extract actionable intelligence from session logs, chat exports, and agent transcripts. Use when you need to distill patterns, decisions, and learnings from historical sessions.
---

# Session Intelligence Harvester

Extract actionable intelligence from session logs and agent transcripts.

## Core Concept
Sessions contain dense operational intelligence: decisions made, errors encountered, patterns discovered, tools used. This skill extracts that intelligence systematically.

## What to Harvest
- **Decisions**: What was chosen and why
- **Errors**: What failed, root cause, fix
- **Patterns**: Recurring approaches that worked
- **Tools**: Which tools succeeded/failed
- **Gaps**: Missing knowledge, tools, or processes
- **Contradictions**: Conflicting information discovered

## Extraction Process
1. **Ingest** → Session JSONL, chat export, transcript
2. **Segment** → By topic, phase, participant
3. **Classify** → Decision, error, pattern, tool, gap, contradiction
4. **Extract** → Structured record with evidence (quote + context)
5. **Deduplicate** → Merge same findings across sessions
6. **Crystallize** → Feed to `knowledge-compiler`

## Windows Notepad LocalState — mineração em lote

Use esta fonte quando o CHEFE entregar o estado do próprio Notepad do Windows para recuperar várias abas de uma vez, inclusive abas nunca salvas como `.txt`.

### Fonte observada

```text
%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\
├── WindowState\
└── TabState\
```

`WindowState` descreve a composição/ordem das janelas e abas. `TabState` guarda o estado individual das abas e pode conter texto ainda não salvo ou referência ao arquivo de origem.

### Regra de colheita

```text
LOCALSTATE
→ INVENTARIAR WindowState + TabState
→ RECONSTRUIR abas/janelas
→ EXTRAIR texto recuperável + caminho de origem quando existir
→ DEREFERENCIAR arquivo original somente quando necessário e permitido
→ DEDUPLICAR por conteúdo/identidade estável
→ CLASSIFICAR
→ QUARENTENAR sensível
→ CRISTALIZAR somente inteligência útil
```

A próxima IA deve preferir esta mineração em lote a pedir ao CHEFE que abra/copiei cada aba manualmente.

### Classificação mínima

- `CURRENT_CANDIDATE`: informação que pode descrever o presente, ainda exige revalidação.
- `HISTORICAL_REFERENCE`: lembrança, plano, checkpoint ou estado antigo minerável.
- `DUPLICATE`: conteúdo repetido; manter uma identidade principal.
- `SENSITIVE_QUARANTINE`: `.env`, senha, token, cookie, chave, credencial, sessão, auth ou material equivalente.
- `DISCARD`: ruído sem valor operacional ou cognitivo.

### Travas

```text
NOTEPAD_STATE != CANONICAL_TRUTH
UNSAVED_TAB != SAFE_TO_PERSIST
HISTORICAL != CURRENT
DOCUMENTED != EXECUTED
SECRET_DETECTED -> SENSITIVE_QUARANTINE
RAW_LOCALSTATE -> DO_NOT_COMMIT
```

- Nunca commitar `LocalState` bruto, `TabState`/`WindowState` binário ou ZIP cru como memória canônica.
- Nunca persistir `.env`, `auth.json`, access token, refresh token, API key, cookie, senha, chave SSH ou sessão em relatório/skill/commit.
- Conteúdo sensível pode ser detectado para classificação, mas deve ser omitido/redigido do resultado persistente.
- Um caminho de arquivo salvo é referência; quando a verdade atual depender dele, reabra/releia a fonte atual em vez de confiar na cópia histórica da aba.
- Abas não salvas podem conter ouro histórico, mas só entram na memória depois de extração, dedupe, classificação e remoção de segredo.
- Se a estrutura do formato do Notepad mudar, marcar `UNVERIFIABLE` e remapear; não adivinhar offsets/formato.

### Evidência mínima por lote

Registrar sem segredo:

```text
SOURCE=WINDOWS_NOTEPAD_LOCALSTATE
WINDOWS_FOUND=
TABS_FOUND=
UNSAVED_TABS=
FILE_BACKED_TABS=
DEDUPED_ITEMS=
SENSITIVE_QUARANTINED=
HISTORICAL_ITEMS=
CURRENT_CANDIDATES=
FORMAT_VERIFIED=SIM|NAO|UNVERIFIABLE
```

O objetivo é preservar o **mental e a inteligência** contidos nas abas, não preservar bytes temporários do aplicativo.

## Output Format
```json
{
  "session_id": "...",
  "findings": [
    {
      "type": "decision|error|pattern|tool|gap|contradiction",
      "summary": "one-line",
      "evidence": "verbatim quote with context",
      "confidence": 0.9,
      "tags": ["architecture", "security", "performance"]
    }
  ]
}
```

## Integration
- Results → `knowledge-compiler` for crystallization
- Patterns → `meta-lupa` for falsification
- Gaps → `knowledge-compiler` as new capability requests

## Automation
- Run on session end (hook)
- Batch process historical exports
- Incremental: only new sessions since last harvest
EOF
echo "session-intelligence-harvester SKILL.md criado"