import { readFileSync } from 'node:fs';
import zlib from 'node:zlib';

const buf = readFileSync(process.argv[2]);
const streams = [];

let i = 0;
while (true) {
  const s = buf.indexOf('stream', i);
  if (s === -1) break;
  const e = buf.indexOf('endstream', s);
  if (e === -1) break;
  let start = s + 6;
  if (buf[start] === 0x0d) start++;
  if (buf[start] === 0x0a) start++;
  const raw = buf.subarray(start, e);
  let data = null;
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { data = fn(raw); break; } catch { /* not this codec */ }
  }
  if (data) streams.push(data.toString('latin1'));
  i = e + 9;
}

const ESC = { n: '\n', r: '\r', t: '\t', b: '', f: '', '(': '(', ')': ')' };
ESC['\\'] = '\\';

function unesc(s) {
  return s
    .replace(/\\([0-7]{1,3})/g, (m, o) => String.fromCharCode(parseInt(o, 8)))
    .replace(/\\(.)/g, (m, c) => (c in ESC ? ESC[c] : c));
}

const linhas = [];
for (const content of streams) {
  const re = /\(((?:[^()\\]|\\[\s\S])*)\)\s*Tj|\[((?:[^\[\]\\]|\\[\s\S])*)\]\s*TJ|\bTd\b|\bTD\b|\bT\*\b|\bET\b/g;
  let m;
  let linha = '';
  while ((m = re.exec(content))) {
    if (m[1] !== undefined) {
      linha += unesc(m[1]);
    } else if (m[2] !== undefined) {
      const parts = m[2].match(/\((?:[^()\\]|\\[\s\S])*\)/g) || [];
      linha += parts.map((p) => unesc(p.slice(1, -1))).join('');
    } else {
      if (linha.trim()) linhas.push(linha);
      linha = '';
    }
  }
  if (linha.trim()) linhas.push(linha);
}

console.log(linhas.join('\n'));
