# Notepad .bin Extraction — Receita Completa

## Localização padrão (Windows)
```
%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\
├── WindowState\        # layout/ordem das janelas (.bin pequenos ~200B)
├── TabState\           # estado das abas: texto + meta + path origem (.bin variados)
├── LocalState.zip      # exportação histórica (~50 sessões em "TabState - Copia/")
└── LocalState_extracted\
    ├── TabState - Copia\     # sessões históricas extraídas
    └── WindowState - Copia\  # janelas históricas extraídas
```

## Código de extração (validado 2026-09-04)

```python
import re, os, glob, hashlib
from pathlib import Path

def extract_strings(data: bytes, min_len: int = 4) -> list[str]:
    """Extrai strings ASCII printable + UTF-16LE de bytes .bin do Notepad."""
    # ASCII printable
    ascii_strs = [m.decode("ascii", errors="ignore") 
                  for m in re.findall(b"[\x20-\x7E]{" + str(min_len).encode() + b",}", data)]
    # UTF-16LE (Notepad Windows usa)
    utf16_strs = []
    try:
        pattern = b"((?:[\x20-\x7E]\x00){" + str(min_len).encode() + b",})"
        for m in re.finditer(pattern, data):
            utf16_strs.append(m.group(0).decode("utf-16le", errors="ignore"))
    except Exception:
        pass
    # dedup + sort por tamanho (maiores primeiro = mais contexto)
    return sorted(set(ascii_strs + utf16_strs), key=len, reverse=True)

def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def harvest_notepad(base_path: str = None) -> dict:
    if base_path is None:
        base_path = os.path.expandvars(
            r"%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState"
        )
    
    result = {
        "window_state": [],
        "tab_state_current": [],
        "tab_state_historical": [],
        "metadata": {"base_path": base_path}
    }
    
    # WindowState atual
    ws_dir = os.path.join(base_path, "WindowState")
    for f in sorted(glob.glob(os.path.join(ws_dir, "*.bin"))):
        with open(f, "rb") as fh:
            data = fh.read()
        result["window_state"].append({
            "file": os.path.basename(f),
            "size": len(data),
            "sha256": sha256_file(f),
            "strings": extract_strings(data, 5)[:10]
        })
    
    # TabState atual
    ts_dir = os.path.join(base_path, "TabState")
    for f in sorted(glob.glob(os.path.join(ts_dir, "*.bin"))):
        with open(f, "rb") as fh:
            data = fh.read()
        strs = extract_strings(data, 4)
        result["tab_state_current"].append({
            "file": os.path.basename(f),
            "size": len(data),
            "sha256": sha256_file(f),
            "string_count": len(strs),
            "strings": strs[:20]
        })
    
    # Histórico (se extraído)
    hist_dir = os.path.join(base_path, "LocalState_extracted", "TabState - Copia")
    if os.path.isdir(hist_dir):
        for f in sorted(glob.glob(os.path.join(hist_dir, "*.bin"))):
            with open(f, "rb") as fh:
                data = fh.read()
            strs = extract_strings(data, 4)
            if strs:
                result["tab_state_historical"].append({
                    "file": os.path.basename(f),
                    "size": len(data),
                    "sha256": sha256_file(f),
                    "string_count": len(strs),
                    "strings": strs[:15]
                })
    
    return result

# Uso rápido
if __name__ == "__main__":
    import json
    data = harvest_notepad()
    print(json.dumps(data, indent=2, ensure_ascii=False))
```

## Exemplos de saída (sessão 2026-09-04)

### WindowState (2 arquivos, ~213 bytes cada)
- `8fe6885c-9863-4e9d-9f57-434991ca2ff5.0.bin` — strings: `["9gKkm"]`
- `8fe6885c-9863-4e9d-9f57-434991ca2ff5.1.bin` — strings: `["9gKkm"]`
*Interpretação: apenas identificadores de layout/janela, sem texto de usuário.*

### TabState atual (11 arquivos, 20–8889 bytes)
| Arquivo | Tamanho | Strings-chave |
|---------|---------|---------------|
| `51ae1419-87d6-48bc-8fe8-95db84213fe9.bin` | 8889 | SOUL-SOL.md, REUSE_BEFORE_CREATE, fixed point, E:\CentralDark\workspace\skills\sol-orquestradora |
| `984af3a3-df21-49c2-838e-59ca30f939d7.bin` | 1403 | `https://docs.google.com/document/...`, `!CENTRALDARK #ACORDAR #CRISTALIZAR`, DELTAUNIFICADOCENTRALDARK.md |
| `e3726397-ac81-4538-89e7-2e72186acfbd.bin` | 1105 | `https://accounts.x.ai/oauth2/device?user_code=ZGBD-XBC9`, `hermes auth add xai-oauth` |
| `6fa3cb33-3d07-4e47-8588-ab25b53e8736.bin` | 4711 | REUSE/ABSORB/SUPERSEDE/HISTORICAL/UNKNOWN/REMOVE-CANDIDATE, register before report |
| `f66020e5-3fe0-4186-85d2-609d47551986.bin` | 3679 | executor HERMES vs CODEX, FEAT(FIXED-POINT), PERMITO-SEGREDO |
| `fef0f0a0-1dc7-4134-8662-b1b966277cd1.bin` | 1597 | INPUT VALIDATION, TESTE DISCRIMINANTE, COUNTERPROOF, REALITY JUDGE |
| `0eb609ef-0ba3-4cbd-974c-50e544195ec5.bin` | 5141 | Screenpipe core provider, disassemble apps, single organism entry |
| `f7df20f2-9cb6-4104-9c47-fe77a739674b.bin` | 872 | APPCENTRALDARK EVOLUIR, 11360 entradas, fixed point, GARIMPO-CHEFE |
| `22df6d6b-7d9a-4afe-bec4-b03f64b30112.bin` | 188 | `E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\hermes-forensic-map.json` |
| `fb920186-1345-4e3c-b682-d577b7509530.bin` | 132 | `E:\CentralDark\hermes-webui\start.ps1` |

### Histórico (TabState - Copia ~50+ arquivos)
- YouTube: `https://www.youtube.com/watch?v=gAqKzoTiJ0k` (em `cb661cab-...bin`)
- Erros/FAIL: MCP startup failed, CommandNotFound, pytest missing, auth failed, FAIL_BASE/TO_SKIPPED
- Forense: reproduziu erro, contraprova, fixed point, RSI cycle

## Palavras-chave úteis para filtro
```python
KEYWORDS = [
    "youtube", "youtu", "yt.com", "watch?v",
    "erro", "error", "fail", "FAIL",
    "screenpipe", "sol", "SOL",
    "fixed point", "ponto fixo",
    "reuse", "REUSE_BEFORE_CREATE",
    "absorver", "APPCENTRALDARK",
    "forense", "forensic",
    "hermes", "HERMES",
    "centraldark", "CENTRALDARK",
    "git", "commit", "pr", "branch",
    "vps", "deploy", "prod",
    "auth", "token", "oauth",
]
```

## Classificação automática (heurística)

```python
def classify_item(strings: list[str], filepath: str) -> str:
    text = " ".join(strings).lower()
    
    # Sensível: tokens, codes, paths com credenciais
    if any(k in text for k in ["user_code=", "oauth", "token=", "auth add", "api_key"]):
        return "SENSITIVE_QUARANTINE"
    
    # Atual: menções a estado vivo, comandos recentes, SOUL, fixed point
    if any(k in text for k in ["fixed point", "reuse_before_create", "sol", "hermes", 
                                "screenpipe", "centraldark", "appcentraldark"]):
        return "CURRENT_CANDIDATE"
    
    # Histórico: youtube links, erros velhos, snapshots antigos
    if any(k in text for k in ["youtube.com/watch", "youtu.be", "fail_base", "fail_to_skipped"]):
        return "HISTORICAL_REFERENCE"
    
    # Duplicado: mesmo hash de outro arquivo
    # (verificar sha256 duplicados)
    
    return "DISCARD"
```

## Integração com centraldark-harvest
- Esta skill faz etapa 1-3 (LOCALSTATE, INVENTARIAR, EXTRAIR)
- `centraldark-harvest` faz 4-9 (DEDUPLICAR, CLASSIFICAR, QUARENTENAR, CRUZAR, CRISTALIZAR)
- Owner da extração bruta: `notepad-forensic-extraction`
- Owner da inteligência consolidada: `centraldark-harvest` / `session-intelligence-harvester`

## Limitações conhecidas
- `.bin` formato não documentado pela Microsoft; extração via strings é heurística
- UTF-16LE pega texto Unicode mas pode ter falsos positivos
- Janelas (WindowState) não contêm texto de abas — só layout
- Abas não salvas (UNSAVED_TAB) podem ser parciais ou corrompidas
- `LocalState.zip` não extraído automaticamente — requer unzip manual prévio