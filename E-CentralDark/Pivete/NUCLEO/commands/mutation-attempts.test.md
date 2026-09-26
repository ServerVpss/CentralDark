# COMANDO - mutation-attempts.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\agents\Critic\mutation-attempts.test.mjs
**SHA:** eb801806e0b98c8b
**Timestamp:** 2026-08-28T02:56:26.292434
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- { etapa_titulo: 'test', ferramenta: 'shell', args: { comando: 'node --test x.test.mjs' }, resultado: 'pass', ok: true },

### Decisoes
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import test from 'node:test';
import { auditarFinalizacao } from './agent.mjs';

const concluir = {
  terminou: true,
  estado: 'FATO',
  ferramenta: 'notificar_progresso',
  args: { mensagem: 'fim com prova' },
};

test('T15: tentativa de escrita falhada continua sendo mutação potencial', () => {
  const historico = [
    { etapa_titulo: 'write', ferramenta: 'escrever_arquivo', args: { path: 'x.mjs' }, resultado: 'falhou no meio', ok: false, critic: 'falha' },
    { etapa_titulo: 'read', ferramenta: 'ler_arquivo', args: { path: 'x.mjs' }, resultado: 'parcial', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.mutations_total, 1);
  assert.equal(r.receipt.mutation_proofs[0].mutation_step_ok, false);
  assert.equal(r.receipt.unproven_mutations[0].kind, 'LOCAL');
});

test('T15: teste comportamental posterior pode fechar o estado após tentativa local falhada', () => {
  const historico = [
    { etapa_titulo: 'write', ferramenta: 'escrever_arquivo', args: { path: 'x.mjs' }, resultado: 'falhou no meio', ok: false, critic: 'falha' },
    { etapa_titulo: 'fix', ferramenta: 'escrever_arquivo', args: { path: 'x.mjs' }, resultado: 'gravado', ok: true },
    { etapa_titulo: 'test', ferramenta: 'shell', args: { comando: 'node --test x.test.mjs' }, resultado: 'pass', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.mutations_total, 2);
  assert.equal(r.receipt.unproven_mutations.length, 0);
});

test('T15: retry de aprender pode provar tentativa parcial anterior da mesma lição', () => {
  const base = { etapa_titulo: 'learn', ferramenta: 'aprender', args: { categoria: 'x', licao: 'ouro' } };
  const historico = [
    { ...base, resultado: 'ledger falhou', ok: false, critic: 'falha' },
    { ...base, resultado: 'LEARNING_PERSISTENCE_VERIFIED=true categoria=x json=true ledger=true', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.mutations_total, 2);
  assert.equal(r.receipt.mutation_proofs[0].proof_index, 1);
  assert.equal(r.receipt.mutation_proofs[1].proof_index, 1);
});

test('T15: retry de git com HEAD remoto verificado fecha tentativa anterior', () => {
  const base = { etapa_titulo: 'push', ferramenta: 'git', args: { acao: 'commit_push' } };
  const historico = [
    { ...base, resultado: 'PUSH PENDENTE', ok: false, critic: 'falha' },
    { ...base, resultado: `REMOTE_HEAD_VERIFIED=${'b'.repeat(40)}`, ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir, historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.mutations_total, 2);
  assert.equal(r.receipt.unproven_mutations.length, 0);
});

```