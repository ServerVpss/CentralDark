import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadInventorySupplements } from './inventory-supplements.mjs';

function write(root, relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value), 'utf8');
}

test('loads sanitized supplements into allowed inventory groups', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-supplement-'));
  try {
    write(root, 'apps/modulos/hub/scripts/inventory-supplements/material.json', {
      kind: 'SANITIZED_INVENTORY_SUPPLEMENT',
      sanitized: true,
      source_is_authority: false,
      items: [{
        id: 'material:test',
        name: 'Material Test',
        group: 'ARTEFATOS',
        type: 'USER_MATERIAL_BUNDLE',
        status: 'SNAPSHOT_OBSERVED',
        owner: 'material.json',
        summary: 'Registro sanitizado.',
      }],
    });

    const items = loadInventorySupplements(root, ['ARTEFATOS']);
    assert.equal(items.length, 1);
    assert.equal(items[0].id, 'material:test');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects supplement that can become authority', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-supplement-'));
  try {
    write(root, 'apps/modulos/hub/scripts/inventory-supplements/material.json', {
      kind: 'SANITIZED_INVENTORY_SUPPLEMENT',
      sanitized: true,
      source_is_authority: true,
      items: [],
    });
    assert.throws(() => loadInventorySupplements(root, ['ARTEFATOS']), /HOUSE_INVENTORY_SUPPLEMENT_INVALID/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
