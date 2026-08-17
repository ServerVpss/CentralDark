import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { injectPatternAdmin } from '../src/admin-patterns-ui.js';

const registryUrl = new URL('../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json', import.meta.url);

test('registro canônico contém os três comandos governáveis', async () => {
  const registry = JSON.parse(await readFile(registryUrl, 'utf8'));
  assert.equal(registry.status, 'CANONICAL');
  assert.equal(registry.policy.registration_rule, 'PROVEN_ADMINISTRABLE -> REGISTER_HERE -> PANEL_AUTO_RENDER');

  const ids = new Set(registry.items.map((item) => item.id));
  assert.deepEqual(ids, new Set(['acordar', 'calibrar', 'multibussola']));

  const multi = registry.items.find((item) => item.id === 'multibussola');
  assert.equal(multi.command, '!MULTIBUSSOLA');
  assert.deepEqual(
    new Set(multi.directions.map((item) => item.symbol)),
    new Set(['↑', '↓', '→', '←', '↔', '↗', '↖', '↘', '↙', '✣']),
  );
});

test('injector existente materializa a Central de Comandos sem segundo painel', () => {
  const html = `
    <style>__PATTERN_ADMIN_STYLE__</style>
    <nav>__PATTERN_ADMIN_TAB__</nav>
    <main>__PATTERN_ADMIN_PANE__</main>
    <script>
      function $(id){ return document.getElementById(id); }
      function dataHoraBr(v){ return v; }
      __PATTERN_ADMIN_SCRIPT__
    </script>
  `;

  const rendered = injectPatternAdmin(html);
  assert.match(rendered, /data-p="commands"/);
  assert.match(rendered, /Central de Comandos/);
  assert.match(rendered, /!MULTIBUSSOLA/);
  assert.match(rendered, /#ACORDAR/);
  assert.match(rendered, /!CALIBRAR/);
  assert.match(rendered, /compass-grid/);
  assert.doesNotMatch(rendered, /__ADMIN_REGISTRY_JSON__/);
  assert.doesNotMatch(rendered, /__PATTERN_ADMIN_/);
});
