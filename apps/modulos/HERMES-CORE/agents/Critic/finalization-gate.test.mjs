import assert from 'node:assert/strict';
import test from 'node:test';
import { auditarFinalizacao, resultadoAprovadoPeloCritic } from './agent.mjs';

const concluir = (extra = {}) => ({
  terminou: true,
  ferramenta: 'notificar_progresso',
  args: { mensagem: 'missão concluída com evidência' },
  _modelo_usado: 'test-model',
  ...extra,
});

const mutacaoArquivo = () => ({
  etapa_titulo: 'editar', ferramenta: 'escrever_arquivo', args: { path: 'a.mjs' },
  resultado: 'gravado', ok: true,
});

test('resultado efetivo exige Executor e Critic verdes', () => {
  assert.equal(resultadoAprovadoPeloCritic({ ok: true }, { aprovado: true }), true);
  assert.equal(resultadoAprovadoPeloCritic({ ok: true }, { aprovado: false }), false);
  assert.equal(resultadoAprovadoPeloCritic({ ok: false }, { aprovado: true }), false);
  assert.equal(resultadoAprovadoPeloCritic({ ok: true }, null), false);
});

test('bloqueia terminou=true sem histórico/evidência', () => {
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [] });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.match(r.parecer, /histórico vazio/);
});

test('bloqueia mutação sem teste comportamental posterior', () => {
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [mutacaoArquivo()] });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('aprova mutação seguida de teste comportamental bem-sucedido', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'testar', ferramenta: 'shell', args: { comando: 'node --test a.test.mjs' }, resultado: 'pass 4', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.status, 'PASS');
  assert.equal(r.receipt.behavior_test_after_mutation_index, 1);
  assert.equal(r.receipt.checks.mutation_has_later_behavior_test, true);
});

test('git status é leitura e não exige teste posterior quando não houve mutação', () => {
  const historico = [{
    etapa_titulo: 'status', ferramenta: 'git', args: { acao: 'status' }, resultado: 'clean', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.last_mutation_index, -1);
});

test('git status depois de mutação não substitui teste comportamental', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'status', ferramenta: 'git', args: { acao: 'status' }, resultado: 'modified a.mjs', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('sha256sum depois de mutação é prova de estado, não teste comportamental', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'hash', ferramenta: 'shell', args: { comando: 'sha256sum a.mjs' }, resultado: 'abc  a.mjs', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('handler ping/http genérico não prova comportamento do artefato mutado', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'ping', ferramenta: 'handler', args: { acao: 'ping' }, resultado: 'pong', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('redirecionamento shell conta como mutação e exige teste comportamental', () => {
  const historico = [{
    etapa_titulo: 'escrever-shell', ferramenta: 'shell', args: { comando: 'printf x > a.txt' },
    resultado: 'ok', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.last_mutation_index, 0);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('escrita Python em shell conta como mutação', () => {
  const historico = [{
    etapa_titulo: 'escrever-python', ferramenta: 'shell',
    args: { comando: `python3 -c "open('a.txt','w').write('x')"` },
    resultado: 'ok', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.last_mutation_index, 0);
});

test('T12: node fs.writeFileSync conta como mutação e bloqueia sem teste', () => {
  const historico = [{
    etapa_titulo: 'escrever-node', ferramenta: 'shell',
    args: { comando: `node -e "require('fs').writeFileSync('tmp-x.mjs','export default 1')"` },
    resultado: 'ok', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.last_mutation_index, 0);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('T12: appendFileSync/createWriteStream também são mutações Node', () => {
  for (const comando of [
    `node -e "require('node:fs').appendFileSync('x.log','x')"`,
    `node -e "require('fs').createWriteStream('x.log')"`,
  ]) {
    const historico = [{ etapa_titulo: 'node-write', ferramenta: 'shell', args: { comando }, resultado: 'ok', ok: true }];
    const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
    assert.equal(r.aprovado, false, comando);
    assert.equal(r.receipt.last_mutation_index, 0, comando);
  }
});

test('T13a: node --check prova sintaxe, não comportamento', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'sintaxe', ferramenta: 'shell', args: { comando: 'node --check a.mjs' }, resultado: 'ok', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.behavior_test_after_mutation_index, -1);
});

test('T13a: typecheck lint e build isolados não substituem teste comportamental', () => {
  for (const comando of ['tsc --noEmit', 'eslint a.mjs', 'npm run typecheck', 'npm run build']) {
    const historico = [
      mutacaoArquivo(),
      { etapa_titulo: 'static', ferramenta: 'shell', args: { comando }, resultado: 'ok', ok: true },
    ];
    const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
    assert.equal(r.aprovado, false, comando);
    assert.equal(r.receipt.behavior_test_after_mutation_index, -1, comando);
  }
});

test('T13b: node --check seguido de node --test pode satisfazer o gate', () => {
  const historico = [
    mutacaoArquivo(),
    { etapa_titulo: 'sintaxe', ferramenta: 'shell', args: { comando: 'node --check a.mjs' }, resultado: 'ok', ok: true },
    { etapa_titulo: 'comportamento', ferramenta: 'shell', args: { comando: 'node --test a.test.mjs' }, resultado: 'pass', ok: true },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.behavior_test_after_mutation_index, 2);
});

test('echo de marcador não conta como teste', () => {
  const historico = [
    mutacaoArquivo(),
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
