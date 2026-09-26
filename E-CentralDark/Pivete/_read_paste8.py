import sys
path = '/e/CentralDark/Pivete/pastes/paste_8_005839.txt'
with open(path, 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8-sig')
crlf = b'\r\n' in raw
print(f'TAMANHO_BYTES={len(raw)}')
print(f'LINES={len(text.splitlines())}')
print(f'CRLF={crlf}')
lines = text.replace('\r\n', '\n').splitlines()
for i, line in enumerate(lines, 1):
    print(f'{i}|{line}')
