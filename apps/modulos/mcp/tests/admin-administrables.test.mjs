import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { injectPatternAdmin } from '../src/admin-patterns-ui.js';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const registryUrl = new URL('../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json', import.meta.url);
const MARKER = /^\s*ADMINISTRABLE_COMMAND\s*=\s*(\S+)\s*$/gm;

async function readRegistry() {
  return JSON.parse(await readFile(registryUrl, 'utf8'));
}

async function declaredAdministrableCommands() {
  const tracked = execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter((file) => /(?:^LEIA-ME-IA\.md$|\.(?:md|mdc)$)/i.test(file));

  const commands = new Set();
  for (const file of tracked) {
    const text = await readFile(join(repoRoot, file), 'utf8');
    const canonical = file === 'LEIA-ME-IA.md' || /^status:\s*["']?CAN[OÔ]NICO["']?/im.test(text.slice(0, 900));
    if (!canonical) continue;
    for (const match of text.matchAll(MARKER)) commands.add(match[1]);
  }
  return commands;
}

test('registro canônico preserva os três comandos baseline e aceita expansão', async () => {
  const registry = await readRegistry();
  assert.equal(registry.status, 'CANONICAL');
  assert.equal(registry.policy.registration_rule, 'PROVEN_ADMINISTRABLE -> REGISTER_HERE -> PANEL_AUTO_RENDER');
  assert.equal(registry.policy.declaration_marker, 'ADMINISTRABLE_COMMAND=<gatilho>');

  const ids = new Set(registry.items.map((item) => item.id));
  for (const required of ['acordar', 'calibrar', 'multibussola']) {
    assert.ok(ids.has(required), `baseline administrável ausente: ${required}`);
  }

  const multi = registry.items.find((item) => item.id === 'multibussola');
  assert.equal(multi.command, '!MULTIBUSSOLA');
  assert.equal(multi.title, 'Multi Bússola');
  assert.equal(multi.spoken_name, 'Multi Bússola');
  assert.equal(multi.pronunciation_pt_br, 'MÚL-ti BÚS-so-la');
  assert.equal(multi.meta_spoken_alias, 'Meta Bússola');
  assert.match(multi.meta_semantics, /META_MULTIBUSSOLA/);
  assert.equal(registry.items.some((item) => /^!META[-_]?BUSSOLA$/i.test(item.command || '')), false,
    'Meta Bússola é leitura humana de META_MULTIBUSSOLA, não novo comando');
  assert.deepEqual(
    new Set(multi.directions.map((item) => item.symbol)),
    new Set(['↑', '↓', '→', '←', '↔', '↗', '↖', '↘', '↙', '✣']),
  );
});

test('todo comando administrável declarado no canônico está registrado e todo registro tem owner real', async () => {
  const registry = await readRegistry();
  const declared = await declaredAdministrableCommands();
  const registered = new Set();
  const ids = new Set();

  for (const item of registry.items) {
    assert.equal(item.administrable, true, `${item.id}: registro deve ser explicitamente administrável`);
    assert.ok(item.id && !ids.has(item.id), `id ausente ou duplicado: ${item.id}`);
    ids.add(item.id);
    assert.ok(item.command && !registered.has(item.command), `comando ausente ou duplicado: ${item.command}`);
    registered.add(item.command);

    const owner = join(repoRoot, item.owner);
    const ownerText = await readFile(owner, 'utf8');
    assert.ok(ownerText.includes(item.command), `${item.command}: owner ${item.owner} não contém o gatilho`);
  }

  assert.deepEqual(declared, registered,
    'ADMINISTRABLE_COMMAND no canônico e ADMINISTRAVEIS.json precisam permanecer bijetivos');
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
  assert.match(rendered, /Multi Bússola/);
  assert.match(rendered, /!MULTIBUSSOLA/);
  assert.match(rendered, /#ACORDAR/);
  assert.match(rendered, /!CALIBRAR/);
  assert.match(rendered, /compass-grid/);
  assert.doesNotMatch(rendered, /__ADMIN_REGISTRY_JSON__/);
  assert.doesNotMatch(rendered, /__PATTERN_ADMIN_/);
});
