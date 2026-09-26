# OUTRO - memoria-longa.test.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\skills\externas\memoria-longa.test.cjs
**SHA:** 234a61a697f5a708
**Timestamp:** 2026-08-28T02:56:06.943162
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const originalExecute = obsidianWriter.execute;
- obsidianWriter.execute = async (params) => {
- obsidianWriter.execute = originalExecute;

### Ouro Bruto (primeiros 5000 chars)
```
const test = require('node:test');
const assert = require('node:assert/strict');

const obsidianWriter = require('./obsidian-writer.cjs');
const memoriaLonga = require('./memoria-longa.cjs');

test('recall humano sem op reutiliza busca repo-native do BRAIN', async () => {
  const originalExecute = obsidianWriter.execute;
  let observed = null;

  obsidianWriter.execute = async (params) => {
    observed = params;
    return {
      ok: true,
      op: 'search',
      query: params.query,
      graph_expanded: true,
      results: [{ file: 'docs/BRAIN/Obsidian.md', relation: 'DIRECT' }],
    };
  };

  try {
    const result = await memoriaLonga.execute({ query: 'o que temos sobre Obsidian?' });

    assert.deepEqual(observed, {
      op: 'search',
      query: 'Obsidian',
      hops: 1,
      limit: 8,
    });
    assert.equal(result.route, 'repo-native-brain');
    assert.equal(result.originalQuery, 'o que temos sobre Obsidian?');
    assert.equal(result.recallQuery, 'Obsidian');
    assert.equal(result.graph_expanded, true);
  } finally {
    obsidianWriter.execute = originalExecute;
  }
});

test('extrai o assunto sem transformar fala humana em query literal inteira', () => {
  const { extrairConsultaMemoria } = memoriaLonga._test;

  assert.equal(extrairConsultaMemoria('lembra do webhook?'), 'webhook');
  assert.equal(extrairConsultaMemoria('memória sobre deploy!'), 'deploy');
  assert.equal(extrairConsultaMemoria('o que você sabe sobre MetaLupa?'), 'MetaLupa');
  assert.equal(extrairConsultaMemoria('o que temos sobre Obsidian?'), 'Obsidian');
});

```