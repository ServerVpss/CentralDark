import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(path, 'utf8');
}

test('Emerald is the real first-run default and dark palettes share dark syntax mode', async () => {
  const [store, root, toolInvocations, diffView, codeMirror] = await Promise.all([
    source('apps/modulos/Bolt/source/app/lib/stores/theme.ts'),
    source('apps/modulos/Bolt/source/app/root.tsx'),
    source('apps/modulos/Bolt/source/app/components/chat/ToolInvocations.tsx'),
    source('apps/modulos/Bolt/source/app/components/workbench/DiffView.tsx'),
    source('apps/modulos/Bolt/source/app/components/editor/codemirror/cm-theme.ts'),
  ]);

  assert.match(store, /DEFAULT_THEME: Theme = 'emerald'/);
  assert.match(store, /\['dark', 'operational', 'forge'\]/);
  assert.match(root, /theme = 'emerald'/);
  assert.match(toolInvocations, /isDarkTheme\(theme\) \? 'dark-plus'/);
  assert.equal((diffView.match(/isDarkTheme\(theme\) \? 'github-dark'/g) ?? []).length, 3);
  assert.equal((codeMirror.match(/isDarkTheme\(theme\)/g) ?? []).length, 2);
});

test('Forge foil surfaces use artifact-specific readable foregrounds', async () => {
  const [variables, artifact] = await Promise.all([
    source('apps/modulos/Bolt/source/app/styles/variables.scss'),
    source('apps/modulos/Bolt/source/app/components/chat/Artifact.tsx'),
  ]);

  assert.match(variables, /--bolt-elements-artifacts-textPrimary: #2b1c08/);
  assert.match(variables, /--bolt-elements-artifacts-textSecondary: #6b5636/);
  assert.match(artifact, /var\(--bolt-elements-artifacts-textPrimary\)/);
  assert.match(artifact, /var\(--bolt-elements-artifacts-textSecondary\)/);
});
