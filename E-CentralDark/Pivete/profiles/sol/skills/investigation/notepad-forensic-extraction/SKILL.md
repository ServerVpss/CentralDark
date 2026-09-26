---
name: notepad-forensic-extraction
description: Extrair texto de Notepad .bin via python strings/utf16le.
---

# Notepad Forensic Extraction

## Trigger
- Minerar Notepad LocalState para handoff, auditoria ou reconciliação
- Investigar abas/janelas não salvas do Windows Notepad
- Cruzar estado Notepad com estado vivo CentralDark

## Pipeline (compatível centraldark-harvest)
1. **LOCALSTATE** — `%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\`
2. **INVENTARIAR** — `WindowState/*.bin` + `TabState/*.bin`
3. **EXTRAIR** — Python ASCII + UTF-16LE decode
4. **DEDUPLICAR** — Hash/texto único
5. **CLASSIFICAR** — CURRENT_CANDIDATE | HISTORICAL_REFERENCE | DUPLICATE | SENSITIVE_QUARANTINE | DISCARD
6. **CRUZAR** — Comparar com git HEAD, runtime, skills, docs
7. **CRISTALIZAR** — Só inteligência útil, owner correto

## Extração técnica (comprovada)

```python
import re, os, glob

def extract_strings(data, min_len=4):
    ascii_strs = [m.decode("ascii", errors="ignore") 
                  for m in re.findall(b"[\x20-\x7E]{" + str(min_len).encode() + b",}", data)]
    utf16_strs = []
    try:
        for m in re.finditer(b"((?:[\x20-\x7E]\x00){" + str(min_len).encode() + b",})", data):
            utf16_strs.append(m.group(0).decode("utf-16le", errors="ignore"))
    except:
        pass
    return sorted(set(ascii_strs + utf16_strs), key=len, reverse=True)

base = r"C:\Users\<user>\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState"
for f in glob.glob(os.path.join(base, "TabState", "*.bin")):
    with open(f, "rb") as fh:
        data = fh.read()
    strings = extract_strings(data, 4)
    # filtrar keywords: youtube, erro, screenpipe, sol, fixed point, etc.
```

## Regras forenses
- `LOCAL_REALITY = JUDGE` — realidade observada localmente decide
- `HISTORICAL != CURRENT` — dados antigos não sobrescrevem medições atuais
- `UNKNOWN != PASS` — ausência de evidência não é prova
- `DOCUMENTED != EXECUTED` — documentação não é execução
- `NOTEPAD_STATE != CANONICAL_TRUTH` — estado Notepad não é verdade canônica
- `UNSAVED_TAB != SAFE_TO_PERSIST` — abas não salvas não são seguras para persistir

## Proibições
- Não criar nova API/serviço/daemon
- Não alterar firewall/VPN/DNS/rotas
- Não duplicar owner (centraldark-harvest, session-intelligence-harvester)

## Referências
- `references/notepad-bin-extraction.md` — receita completa + exemplos
- `references/screenpipe-port-map.md` — portas Screenpipe (3030, 3031, 8788, 8099)
- `references/gatilhos-yaml-pattern.md` — padrão gatilhos YAML