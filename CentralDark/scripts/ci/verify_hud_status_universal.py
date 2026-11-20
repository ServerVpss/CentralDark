#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs' / 'CONSCIENCIA' / 'PADRAO-HUD-STATUS-UNIVERSAL.md'

REQUIRED = [
    'termo humano universal primeiro + termo técnico entre parênteses',
    '🔄 Na fila para rodar',
    '`queued`',
    '⏳ Rodando / aguardando resultado',
    '`pending` / `in_progress`',
    '🟢 Pronto para juntar',
    '`OPEN / MERGEABLE`',
    '🧬 Versão exata sendo testada',
    '`HEAD`',
    '🌳 Versão principal de destino',
    '`BASE / main`',
    '🧪 Testes da mesma versão atual',
    '`SAME_HEAD_CI`',
    '`UNKNOWN != PASS`',
    '`MERGED != DEPLOYED`',
]
def main() -> int:
    if not DOC.exists():
        print(f'HUD_STATUS_UNIVERSAL=FAIL missing={DOC}')
        return 1

    text = DOC.read_text(encoding='utf-8')
    missing = [item for item in REQUIRED if item not in text]

    has_human_first = 'Exemplo correto:' in text and 'Exemplo incorreto:' in text
    has_operational_consequence = 'consequência operacional' in text

    if missing or not has_human_first or not has_operational_consequence:
        print('HUD_STATUS_UNIVERSAL=FAIL')
        print('missing=' + repr(missing))
        print('human_first=' + str(has_human_first))
        print('operational_consequence=' + str(has_operational_consequence))
        return 1

    print('HUD_STATUS_UNIVERSAL=PASS human_first=TRUE technical_preserved=TRUE unknown_not_pass=TRUE')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
