# -*- coding: utf-8 -*-
import os, sys

path = 'E:/CentralDark/Pivete/pastes/paste_7_013122.txt'
with open(path, 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8-sig').replace('\r\n', '\n')
lines = text.splitlines()
print(f'--- PASTE 7: INICIO ({len(lines)} lines, {len(raw)} bytes) ---')
for i, line in enumerate(lines, 1):
    print(f'{i}|{line}')
print(f'--- PASTE 7: FIM ---')
