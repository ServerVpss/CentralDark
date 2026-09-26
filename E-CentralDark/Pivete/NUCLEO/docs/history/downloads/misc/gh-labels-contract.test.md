# OUTRO - gh-labels-contract.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\bots\lib\gh-labels-contract.test.mjs
**SHA:** aa495fbcaae22263
**Timestamp:** 2026-08-28T02:57:33.955901
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ]) assert.ok(source.includes(`[\"${legacy}\"`) || source.includes(`['${legacy}'`), `alias sem regra: ${legacy}`);

### Ouro Bruto (primeiros 5000 chars)
```
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(HERE, 'gh.mjs'), 'utf8');

test('bots passam labels por canonicalLabels antes de criar/atualizar issue', () => {
  assert.match(source, /createIssue[\s\S]*labels:\s*canonicalLabels\(labels\)/);
  assert.match(source, /updateIssue[\s\S]*labels:\s*canonicalLabels\(labels\)/);
});

test('aliases operacionais legados possuem destino canônico', () => {
  for (const legacy of [
    'assign:chatgpt', 'assign:claude', 'assign:codex', 'assign:grok',
    'assign:supabase-bot', 'assign:lovable', 'auto', 'bug',
    'p0', 'p1', 'p2', 'p3', 'sentinela', 'vigia', 'revisao-humana',
    'needs-codex-review', 'permito-segredo', 'permito-pivete', 'stale', 'superseded',
  ]) assert.ok(source.includes(`[\"${legacy}\"`) || source.includes(`['${legacy}'`), `alias sem regra: ${legacy}`);
});

test('normalização é case-insensitive e preserva a label visual canônica de autoridade', () => {
  assert.match(source, /toLocaleLowerCase\("pt-BR"\)/);
  assert.match(source, /\["👑 permito-segredo", \["👑 PERMITO-SEGREDO"\]\]/);
  assert.match(source, /LABEL_ALIASES\.get\(folded\)/);
});

test('Lovable não é agente operacional e PIVETE não vira autoridade por label', () => {
  assert.doesNotMatch(source, /AGENTE-LOVABLE/);
  assert.match(source, /\["assign:lovable", \["🎨 FRONTEND"\]\]/);
  assert.match(source, /\["permito-pivete", \[\]\]/);
});

```