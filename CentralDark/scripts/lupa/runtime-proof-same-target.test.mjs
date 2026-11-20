import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leia = readFileSync(new URL('../../LEIA-ME-IA.md', import.meta.url), 'utf8');
const capacidades = readFileSync(new URL('../../docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md', import.meta.url), 'utf8');

assert.match(leia, /TOOLS_MUST_BE_MEASURED_PER_SURFACE_PER_SESSION=true|runtime.*tools aplicáveis|runtime\/tools aplicáveis/i, 'LEIA-ME-IA deve exigir tools/runtime medidos na superfície aplicável');
assert.match(capacidades, /VERIFY\s*→\s*usar o check aplicável ao claim feito|VERIFY O CLAIM CERTO/i, 'DNA cognitivo deve prender a prova ao claim correto');

const resolveCapabilities = ({ brand, tools }) => ({
  brand,
  github: tools.includes('github'),
  shell: tools.includes('shell'),
  localExecutor: tools.includes('shell') || tools.includes('desktop_commander'),
});

const chatgptNoTools = resolveCapabilities({ brand: 'ChatGPT', tools: [] });
const chatgptWithShell = resolveCapabilities({ brand: 'ChatGPT', tools: ['shell'] });
const claudeWithShell = resolveCapabilities({ brand: 'Claude Chat', tools: ['shell'] });

assert.equal(chatgptNoTools.localExecutor, false, 'ChatGPT sem tool não ganha execução por marca');
assert.equal(chatgptWithShell.localExecutor, true, 'CHAT_GLOBAL com shell autorizado ganha capability executora');
assert.equal(claudeWithShell.localExecutor, true, 'capability equivalente independe da marca do chat');
assert.notEqual(chatgptNoTools.localExecutor, chatgptWithShell.localExecutor, 'mesma marca pode ter capabilities diferentes por sessão');

const classify = ({ claimTarget, observedTarget, effectObserved }) => {
  if (claimTarget !== observedTarget) return 'PROOF_TARGET_MISMATCH';
  return effectObserved ? 'PASS' : 'UNPROVEN';
};

assert.equal(
  classify({ claimTarget: 'CHAT_GLOBAL_GITHUB', observedTarget: 'CHAT_GLOBAL_GITHUB', effectObserved: true }),
  'PASS',
  'efeito observado no próprio runtime aplicável deve provar o claim correspondente',
);

assert.equal(
  classify({ claimTarget: 'CHAT_GLOBAL_GITHUB', observedTarget: 'VPS', effectObserved: true }),
  'PROOF_TARGET_MISMATCH',
  'não exigir VPS para provar um claim cujo runtime observado é CHAT_GLOBAL + GitHub',
);

console.log('runtime-proof-same-target: PASS');
