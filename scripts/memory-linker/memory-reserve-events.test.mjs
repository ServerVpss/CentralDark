import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadMemoryReserveEvents, parseMemoryReserve } from './memory-reserve-events.mjs';

const HEAD = 'a'.repeat(40);

function md() {
  return `---
title: Lembranças
---

## 📌 Entradas

### [2026-08-16T01:20] Squash rápido precisa remedir a main
- **Data:** 2026-08-16
- **Tags:** regra, github, squash
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-09-15
- **Promovida:** nao
- **Tipo:** RULE
- **Target:** docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md
- **Sessão:** chat-a
- **Fonte:** chatgpt:web

Conteúdo: depois do squash rápido remedir main e continuar na mesma intenção

### [2026-08-16T02:20] Mesmo padrão apareceu de novo
- **Data:** 2026-08-16
- **Tags:** regra, github
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-09-15
- **Promovida:** nao

Conteúdo: depois do squash rápido remedir main e continuar sem reclamar de conflito

### [2026-06-01T10:00] Velha e expirada
- **Data:** 2026-06-01
- **Tags:** memoria
- **Relevância:** baixa
- **Eixo:** passado
- **Expira:** 2026-07-01
- **Promovida:** nao

Conteúdo: não deve entrar no Dream Review atual
`;
}

test('preserva metadados reais e não inventa sessão quando ela falta', () => {
  const result = parseMemoryReserve(md(), { headSha: HEAD, today: '2026-08-16' });
  assert.equal(result.scanned, 3);
  assert.equal(result.events.length, 2);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].reason, 'EXPIRED');

  const first = result.events[0];
  assert.equal(first.kind, 'RULE');
  assert.equal(first.target, 'docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md');
  assert.equal(first.session_id, 'chat-a');
  assert.equal(first.source, 'chatgpt:web');
  assert.equal(first.head_sha, HEAD);

  const second = result.events[1];
  assert.equal(second.kind, 'RULE');
  assert.equal(second.session_id, 'UNKNOWN_SESSION');
  assert.equal(second.source, 'mcp:consolidar_pensamento');
  assert.equal(second.target, 'docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md');
});

test('arquivo ausente é medido como ausente, não vira erro nem sessão inventada', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-memory-reserve-'));
  try {
    const result = loadMemoryReserveEvents({ headSha: HEAD, filePath: path.join(dir, 'missing.md') });
    assert.equal(result.status, 'MEMORY_RESERVE_MISSING');
    assert.deepEqual(result.events, []);
    assert.equal(result.scanned, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
