# MISSAO - continuity-guard.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\continuity-guard.mjs
**SHA:** c3522a083532a3dd
**Timestamp:** 2026-08-28T02:56:26.453845
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- reasons.push(`CONTROL_HEAD_MISSING:${field}`);

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from 'node:crypto';

export const REQUIRED_CONTINUITY_FIELDS = Object.freeze([
  'objetivo',
  'autoridade',
  'coordenador',
  'escritor',
  'escopo',
  'ambiente',
  'classe_de_acao',
  'baseline',
  'backup',
  'rollback',
  'receipt',
  'head_sha',
]);

const HEAD_SHA_RE = /^[0-9a-f]{40}$/i;
const HEAD_BOUND_FIELDS = Object.freeze(['baseline', 'backup', 'rollback', 'receipt']);

function present(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && typeof value === 'object' && Object.keys(value).length > 0;
}

export function validateContinuityState(state) {
  const reasons = [];
  const value = state && typeof state === 'object' && !Array.isArray(state) ? state : {};

  for (const field of REQUIRED_CONTINUITY_FIELDS) {
    if (!present(value[field])) reasons.push(`MISSING_FIELD:${field}`);
  }

  const headSha = typeof value.head_sha === 'string' ? value.head_sha.trim() : '';
  if (headSha && !HEAD_SHA_RE.test(headSha)) reasons.push('HEAD_SHA_INVALID');
  if (value.autoridade && value.autoridade !== 'SEGREDO/CHEFE') {
    reasons.push('AUTHORITY_MISMATCH');
  }
  if (value.coordenador && value.coordenador !== 'SOL') {
    reasons.push('COORDINATOR_MISMATCH');
  }

  if (HEAD_SHA_RE.test(headSha)) {
    for (const field of HEAD_BOUND_FIELDS) {
      const control = value[field];
      if (!control || typeof control !== 'object' || Array.isArray(control)) continue;
      if (!HEAD_SHA_RE.test(String(control.head_sha || ''))) {
        reasons.push(`CONTROL_HEAD_MISSING:${field}`);
      } else if (String(control.head_sha).toLowerCase() !== headSha.toLowerCase()) {
        reasons.push(`CONTROL_HEAD_MISMATCH:${field}`);
      }
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  return {
    ok: uniqueReasons.length === 0,
    state: uniqueReasons.length === 0 ? 'READY' : 'BLOCKED',
    head_sha: HEAD_SHA_RE.test(headSha) ? headSha : null,
    reasons: uniqueReasons,
  };
}

export function continuityBlockReceipt({ mission, source, validation }) {
  const stable = {
    schema: 'centraldark.hermes-continuity-block.v1',
    result: 'BLOCKED',
    mission: String(mission || 'unknown').slice(0, 120),
    source: String(source || 'unknown').slice(0, 200),
    head_sha: validation?.head_sha || null,
    reasons: [...(validation?.reasons || [])].sort(),
  };
  return {
    ...stable,
    fingerprint: createHash('sha256').update(JSON.stringify(stable)).digest('hex'),
  };
}

```