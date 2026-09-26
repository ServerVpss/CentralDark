# Debugging Transcript — Auto-Destilador v1.0 (2026-08-23)

## Session Summary
Built and debugged a watchdog-based automatic distillation system that monitors `E:\CentralDark\_MAPA_CASA\Nova pasta*` and automatically classifies, distills, crystallizes, and writes files to canonical NUCLEO locations.

---

## Key Bugs Fixed

### 1. Wrong Write Path (escrever_cristal)
**Problem:** `os.makedirs(os.path.dirname(destino_abs))` created parent of target dir, then `os.path.join(os.path.dirname(destino_abs), base_name)` wrote to sibling of target dir.
**Fix:** 
```python
os.makedirs(destino_abs, exist_ok=True)
filepath = os.path.join(destino_abs, base_name)
```

### 2. ZIP Handler — Windows File Locking (WinError 32)
**Problem:** `ZipFile` context manager holds handle; `arquivar_original` tries to move while handle open.
**Workaround:** Archive ZIP to `misc/` on lock error; internal files already processed.
**Better fix (pending):** Extract → archive ZIP first (releases handle) → process extracted files sync.

### 3. ZIP Handler — Extraction Cleanup Race
**Problem:** `shutil.rmtree(extract_dir)` ran before sync processing completed; extracted files deleted mid-read.
**Fix:** Collect extracted file list first → archive ZIP → process each file sync → then cleanup.

### 4. Special Handler Debounce Tracking
**Problem:** Special handlers (zip, pdf, image) returned early without adding to `pending_files`, causing double-processing or lost events.
**Fix:** Add to `pending_files` before spawning debounce thread.

### 5. Sync Processing for Extracted Files
**Problem:** `process_file()` uses debounce (5s); extracted files need immediate processing.
**Solution:** Added `process_file_sync()` bypassing debounce, called directly from `handle_zip()` after ZIP archived.

---

## Architecture Patterns Established

### Classification Pipeline
```
filename patterns (regex) → content keywords → fallback misc
```

### File Type Routing
| Extension | Handler | Output |
|-----------|---------|--------|
| .txt, .md | process_file | text → classify → crystallize |
| .zip | handle_zip | extract → archive ZIP → sync process each |
| .png, .jpg, .jpeg, .webp, .gif | handle_image | PIL metadata → content → crystallize |
| .pdf | handle_pdf | pymupdf/pdfplumber/PyPDF2 → text → crystallize |

### Crystallization Gates (FORJA)
```python
portoes = {
    "ocorrencias": total_itens >= 1,
    "ganho": total_itens > 0,
    "contraprova": True,  # simplified
    "sha": True
}
```

### CARVE Audit Trail
Every crystallization emits to `rastro.jsonl`:
```json
{
  "carve": {"ancora": "AUTO_DESTILADOR", "missao": "AUTO_CRISTALIZACAO", "sha": "..."},
  "curva": "Arquivo X -> Destilado -> Cristalizado (TIPO) -> destino",
  "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
  "veredito": "CRISTAL",
  "carry": "Cristal TIPO adicionado ao NUCLEO; arquivo original arquivado em history/downloads/"
}
```

---

## NUCLEO Destination Mapping
| Classificação | Destino Canônico | History Category |
|---------------|------------------|------------------|
| commands | `NUCLEO/commands/` | `history/downloads/comandos/` |
| contracts | `NUCLEO/contracts/` | `history/downloads/contratos/` |
| decisions | `NUCLEO/decisions/` | `history/downloads/decisoes/` |
| patterns | `NUCLEO/patterns/` | `history/downloads/padroes/` |
| missions | `NUCLEO/missions/` | `history/downloads/missoes/` |
| docs/reference | `NUCLEO/docs/reference/` | `history/downloads/arquitetura/` |
| forense/chrome/agente | `history/downloads/<categoria>/` | same |

---

## Dependencies Installed
```bash
pip install watchdog pillow pymupdf pdfplumber PyPDF2
# All available in Hermes venv
```

---

## Watchdog Commands
```bash
# Start
python auto_destilador.py

# Test single file (sync)
python -c "
from auto_destilador import DestiladorHandler
h = DestiladorHandler()
h.process_file_sync('path/to/file.txt')
"
```

---

## Known Limitations
1. **Windows ZIP locking** — ZIP archived to `misc/` on lock; internal files still processed
2. **No OCR** — Images only get metadata; text extraction needs Tesseract
3. **No nested ZIP** — Extracted ZIPs not recursively processed
4. **Debounce fixed at 5s** — Not configurable per file type
5. **Classification keyword-based** — No ML/embedding classification yet

---

## Next Improvements (Priority)
1. Fix ZIP locking: extract → close ZipFile → archive ZIP → process sync
2. Add OCR support (pytesseract) for images
3. Recursive ZIP extraction
4. Configurable debounce per extension
5. Embedding-based classification fallback