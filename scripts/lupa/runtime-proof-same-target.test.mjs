import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leia = readFileSync(new URL('../../LEIA-ME-IA.md', import.meta.url), 'utf8');
const capacidades = readFileSync(new URL('../../docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md', import.meta.url), 'utf8');

assert.match(leia, /runtime.*tools aplicáveis|runtime\/tools aplicáveis/i, 'LEIA-ME-IA deve exigir runtime/tools aplicáveis ao escopo');
assert.match(capacidades, /VERIFY O CLAIM CERTO/, 'DNA cognitivo deve prender a prova ao claim correto');

const classify = ({ claimTarget, observedTarget, effectObserved }) => {
  if (claimTarget !== observedTarget) return 'PROOF_TARGET_MISMATCH';
  return effectObserved ? 'PASS' : 'UNPROVEN';
};

assert.equal(
  classify({ claimTarget: 'CHATGPT_SOL_GITHUB', observedTarget: 'CHATGPT_SOL_GITHUB', effectObserved: true }),
  'PASS',
  'efeito observado no próprio runtime aplicável deve provar o claim correspondente',
);

assert.equal(
  classify({ claimTarget: 'CHATGPT_SOL_GITHUB', observedTarget: 'VPS', effectObserved: true }),
  'PROOF_TARGET_MISMATCH',
  'não exigir VPS para provar um claim cujo runtime observado é ChatGPT/SOL + GitHub',
);

console.log('runtime-proof-same-target: PASS');
