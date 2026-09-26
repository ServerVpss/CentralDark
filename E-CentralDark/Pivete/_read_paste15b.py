# -*- coding: utf-8 -*-
import os, sys

path = 'E:/CentralDark/Pivete/pastes/paste_15_020535.txt'
out  = 'E:/CentralDark/Pivete/_paste15_out.txt'

with open(path, 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8-sig')

if b'\r\n' in raw:
    text = raw.decode('utf-8-sig')
    lines = text.replace('\r\n', '\n').splitlines()
else:
    lines = raw.decode('utf-8-sig').splitlines()

buf = []
buf.append('TAMANHO_BYTES_ORIGINAL=' + str(len(raw)))
buf.append('CRLF_PRESENTE=' + str(b'\r\n' in raw))
buf.append('LINHAS=' + str(len(lines)))
buf.append('---CONTEUDO---')
for i, line in enumerate(lines, 1):
    buf.append(str(i) + '|' + line)

with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(buf) + '\n')

print('SAVED=' + out)
print('TAMANHO_BYTES=' + str(len(raw)))
print('CRLF=' + str(b'\r\n' in raw))
print('LINHAS=' + str(len(lines)))
print('---RESUMO---')
print('\n'.join(buf[:60]))
