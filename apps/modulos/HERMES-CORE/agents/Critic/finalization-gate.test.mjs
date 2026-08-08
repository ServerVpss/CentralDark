import assert from 'node:assert/strict';
import test from 'node:test';
import { auditarFinalizacao } from './agent.mjs';

const concluir = (extra = {}) => ({
  terminou: true,
  ferramenta: 'notificar_progresso',
  args: { mensagem: 'missão concluída com evidência' },
  _modelo_usado: 'test-model',
  ...extra,
});

test('bloqueia terminou=true sem histórico/evidência', () => {
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [] });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.match(r.parecer, /histórico vazio/);
});

test('bloqueia mutação sem validação posterior', () => {
  const historico = [{
    etapa_titulo: 'editar', ferramenta: 'escrever_arquivo', args: { path: 'a.mjs' },
    resultado: 'gravado', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem validação/);
});

test('aprova mutação seguida de teste bem-sucedido', () => {
  const historico = [
    { etapa_titulo: 'editar', ferramenta: 'escrever_arquivo', args: { path: 'a.mjs' }, resultado: 'gravado', ok: true },
    { etapa_titulo: 'testar', ferramenta: 'shell', args: { comando: 'node --test a.test.mjs' }, resultado: 'pass 4', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.status, 'PASS');
  assert.equal(r.receipt.validation_after_mutation_index, 1);
});

test('echo de marcador não conta como teste', () => {
  const historico = [
    { etapa_titulo: 'editar', ferramenta: 'escrever_arquivo', args: { path: 'a.mjs' }, resultado: 'gravado', ok: true },
    { etapa_titulo: 'fake', ferramenta: 'shell', args: { comando: 'echo TSC_OK' }, resultado: 'TSC_OK', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
});

test('bloqueia última etapa reprovada pelo Critic', () => {
  const historico = [{
    etapa_titulo: 'ler', ferramenta: 'ler_arquivo', args: { path: 'x' },
    resultado: 'conteúdo', ok: true, critic: 'prova insuficiente',
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /reprovação do Critic/);
});

test('bloqueia última etapa com falha', () => {
  const historico = [{
    etapa_titulo: 'check', ferramenta: 'shell', args: { comando: 'node --check a.mjs' },
    resultado: 'SyntaxError', ok: false,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /última etapa não está aprovada/);
});

test('permite missão read-only com ação observada e aprovada', () => {
  const historico = [{
    etapa_titulo: 'ler', ferramenta: 'ler_arquivo', args: { path: 'docs/x.md' },
    resultado: 'conteúdo lido', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
});

test('bloqueia conclusão com ferramenta errada ou sem resumo', () => {
  const historico = [{ etapa_titulo: 'ler', ferramenta: 'ler_arquivo', args: { path: 'x' }, resultado: 'ok', ok: true }];
  const r = auditarFinalizacao({
    missao: 'x',
    decisao: { terminou: true, ferramenta: 'shell', args: {}, pensamento: '' },
    historico,
  });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /notificar_progresso/);
  assert.match(r.parecer, /resumo final ausente/);
});

test('receipt é determinístico para a mesma entrada', () => {
  const historico = [{ etapa_titulo: 'ler', ferramenta: 'ler_arquivo', args: { path: 'x' }, resultado: 'ok', ok: true }];
  const a = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  const b = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.deepEqual(a.receipt, b.receipt);
});
