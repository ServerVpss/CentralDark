# Windows + pytest — contorno de PermissionError em tempfile

## Sintoma
Ao rodar `pytest` em testes que criam arquivos temporários (ex: `deny_delete.py`
usa `tempfile.NamedTemporaryFile`, `ledger_check.py` etc), o collector ou o teste
quebra com:

```
PermissionError: [WinError 5] Acesso negado: 'C:\\Users\\danda\\AppData\\Local\\Temp\\pytest-of-danda\\pytest-current'
```
ou
```
FileNotFoundError: [Errno 2] No such file or directory: 'C:\\tmp\\pytest_pr1\\tmpkfnj5xyc'
```

Causa: o Python no Windows (uv cpython-3.11) resolve o temp dir padrão para
`AppData\Local\Temp` (sem permissão de escrita sob alguns perfis/MSYS) ou para
um path MSYS (`/tmp` → `C:\tmp`) que não existe.

## Fix determinístico (usado 26-27/07, promoção MAE)
Forçar `tempfile.tempdir` para um path Windows **real** e existente, ANTES do pytest,
e passar `TMPDIR/TEMP/TMP` no env:

```bash
mkdir -p "C:/tmp/pytest_mae/b"
TMPDIR="C:/tmp/pytest_mae" TEMP="C:/tmp/pytest_mae" TMP="C:/tmp/pytest_mae" python -c "
import tempfile, os
os.makedirs('C:/tmp/pytest_mae', exist_ok=True)
tempfile.tempdir = 'C:/tmp/pytest_mae'
import pytest
rc = pytest.main(['-q','-p','no:cacheprovider','--basetemp=C:/tmp/pytest_mae/b',
    'caminho/do/teste.py'])
raise SystemExit(rc)
"
```

Pontos-chave:
- Usar `C:/tmp/...` (Windows real), NÃO `/tmp/...` (MSYS vira `C:\tmp` que pode não existir).
- Setar `tempfile.tempdir` em código É obrigatório quando o teste chama `tempfile` direto
  (env var sozinha não pega o `tempfile` já importado).
- `--basetemp` + `-p no:cacheprovider` evita lixo de cache entre runs.

## Import de módulo irmão em testes separados de scripts/
Quando os testes ficam em `testes/` e os módulos em `scripts/` (estrutura canônica
do CentralDark `.agents/skills/meta-lupa/`), o import `from deny_delete import (...)`
falha com `ModuleNotFoundError`. Corrigir inserindo no topo de cada teste:

```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
```

Isso preserva a lógica do teste; só aponta o loader pro lugar certo. Menor mudança
segura ao promover um harness de uma pasta plana (`mae/runners/`) para a estrutura
`scripts/` + `testes/` do repo.
