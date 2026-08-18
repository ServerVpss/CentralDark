const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { _test } = require('./obsidian-writer.cjs');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-brain-'));
  return {
    root,
    write(rel, content) {
      const full = path.join(root, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content, 'utf8');
      return full;
    },
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

test('busca repo-native expande wikilink e backlink sem depender de C:/E:', () => {
  const f = fixture();
  try {
    f.write('Alpha.md', '# Alpha\nTema foguete\nRelacionado: [[Beta]]\n');
    f.write('Beta.md', '# Beta\nContexto vizinho da Alpha.\n');
    f.write('Gamma.md', '# Gamma\nAponta de volta para [[Alpha]].\n');
    f.write('Delta.md', '# Delta\nSem relação.\n');

    const result = _test.searchBrain('foguete', {
      brainDir: f.root,
      hops: 1,
      limit: 10,
      maxChars: 5000,
    });

    const byFile = new Map(result.results.map(item => [item.file, item]));
    assert.equal(byFile.get('docs/BRAIN/Alpha.md').relation, 'DIRECT');
    assert.equal(byFile.get('docs/BRAIN/Beta.md').relation, 'WIKILINK');
    assert.equal(byFile.get('docs/BRAIN/Gamma.md').relation, 'BACKLINK');
    assert.equal(byFile.has('docs/BRAIN/Delta.md'), false);
    assert.equal(result.direct_total, 1);
    assert.equal(result.hops, 1);
  } finally {
    f.cleanup();
  }
});

test('expansão permite no máximo dois hops controlados', () => {
  const f = fixture();
  try {
    f.write('Alpha.md', '# Alpha\nneedle [[Beta]]\n');
    f.write('Beta.md', '# Beta\n[[Gamma]]\n');
    f.write('Gamma.md', '# Gamma\nterceiro nó\n');

    const oneHop = _test.searchBrain('needle', { brainDir: f.root, hops: 1, limit: 10 });
    const twoHops = _test.searchBrain('needle', { brainDir: f.root, hops: 2, limit: 10 });
    const clamped = _test.searchBrain('needle', { brainDir: f.root, hops: 99, limit: 10 });

    assert.equal(oneHop.results.some(item => item.file === 'docs/BRAIN/Gamma.md'), false);
    assert.equal(twoHops.results.some(item => item.file === 'docs/BRAIN/Gamma.md'), true);
    assert.equal(clamped.hops, 2);
  } finally {
    f.cleanup();
  }
});

test('ranking acontece antes do limit', () => {
  const f = fixture();
  try {
    f.write('00-generico.md', '# Genérico\nneedle\n');
    f.write('99-needle-owner.md', '# Owner\nneedle\n');

    const result = _test.searchBrain('needle', {
      brainDir: f.root,
      hops: 0,
      limit: 1,
      maxChars: 5000,
    });

    assert.equal(result.total, 2);
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].file, 'docs/BRAIN/99-needle-owner.md');
    assert.equal(result.truncated, true);
  } finally {
    f.cleanup();
  }
});

test('busca é somente leitura no corpus recebido', () => {
  const f = fixture();
  try {
    const a = f.write('Alpha.md', '# Alpha\nneedle [[Beta]]\n');
    const b = f.write('Beta.md', '# Beta\ncontexto\n');
    const before = new Map([[a, fs.readFileSync(a, 'utf8')], [b, fs.readFileSync(b, 'utf8')]]);

    _test.searchBrain('needle', { brainDir: f.root, hops: 2, limit: 10 });

    assert.equal(fs.readFileSync(a, 'utf8'), before.get(a));
    assert.equal(fs.readFileSync(b, 'utf8'), before.get(b));
  } finally {
    f.cleanup();
  }
});

test('notificação de write não promete sync físico Obsidian sem canal provado', () => {
  const source = fs.readFileSync(path.join(__dirname, 'obsidian-writer.cjs'), 'utf8');
  assert.doesNotMatch(source, /Aparece no Obsidian em ≤10 min/);
  assert.match(source, /Persistido no BRAIN do repositório/);
  assert.match(source, /Sync físico com Obsidian: depende do canal local medido/);
});
