import assert from 'node:assert/strict';
import test from 'node:test';
import { auditarFinalizacao, resultadoAprovadoPeloCritic } from './agent.mjs';

const concluir = (extra = {}) => ({
  terminou: true,
  estado: 'FATO',
  ferramenta: 'notificar_progresso',
  args: { mensagem: 'missão concluída com evidência' },
  _modelo_usado: 'test-model',
  ...extra,
});

const mutacaoArquivo = () => ({
  etapa_titulo: 'editar', ferramenta: 'escrever_arquivo', args: { path: 'a.mjs' },
  resultado: 'gravado', ok: true,
});

const testeNode = (arquivo = 'a.test.mjs') => ({
  etapa_titulo: 'testar', ferramenta: 'shell', args: { comando: `node --test ${arquivo}` },
  resultado: 'pass', ok: true,
});

const continuidadeFixa = (extra = {}) => ({
  next_cursor: 'FIXED_POINT',
  next_readonly_probe: '',
  open_work: 0,
  recoverable_unknown: 0,
  recoverable_fail: 0,
  writer_conflict: false,
  oracle_uncertainty: false,
  human_frontier: false,
  reality_judge: 'PASS',
  ...extra,
});

test('continuidade declarada bloqueia conclusão enquanto NEXT_CURSOR não chega ao fixed point', () => {
  const r = auditarFinalizacao({
    missao: 'x',
    decisao: concluir({ continuity: continuidadeFixa({ next_cursor: 'REMEASURE_RUNTIME' }) }),
    historico: [testeNode()],
  });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.equal(r.receipt.continuation.continuation_required, true);
  assert.match(r.parecer, /NEXT_CURSOR=FIXED_POINT/);
});

test('continuidade declarada preserva parent ativo com probe, trabalho, unknown, falha ou conflito', () => {
  for (const [name, extra] of [
    ['probe', { next_readonly_probe: 'health' }],
    ['work', { open_work: 1 }],
    ['unknown', { recoverable_unknown: 1 }],
    ['fail', { recoverable_fail: 1 }],
    ['writer', { writer_conflict: true }],
    ['oracle', { oracle_uncertainty: true }],
  ]) {
    const r = auditarFinalizacao({
      missao: 'x', decisao: concluir({ continuity: continuidadeFixa(extra) }), historico: [testeNode()],
    });
    assert.equal(r.aprovado, false, name);
    assert.equal(r.receipt.continuation.continuation_required, true, name);
  }
});

test('continuidade declarada só permite conclusão com fixed point, zero residual e Reality Judge PASS', () => {
  const r = auditarFinalizacao({
    missao: 'x', decisao: concluir({ continuity: continuidadeFixa() }), historico: [testeNode()],
  });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.status, 'PASS');
  assert.equal(r.receipt.continuation.continuation_required, false);
});

test('continuidade declarada sem Reality Judge PASS não fecha sem fronteira humana', () => {
  const r = auditarFinalizacao({
    missao: 'x',
    decisao: concluir({ continuity: continuidadeFixa({ reality_judge: 'UNKNOWN' }) }),
    historico: [testeNode()],
  });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /REALITY_JUDGE=PASS/);
});
test('contrato contínuo explícito não fecha sem receipt de continuidade', () => {
  const r = auditarFinalizacao({
    missao: '!CENTRALDARK #ACORDAR\nCONTINUE_SAME_GOAL=true\n',
    decisao: concluir(),
    historico: [testeNode()],
  });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.continuation.contract_required, true);
  assert.equal(r.receipt.continuation.declared, false);
  assert.match(r.parecer, /contrato de continuidade ativo/);
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
  assert.equal(r.receipt.schema_version, 3);
  assert.match(r.parecer, /histórico vazio/);
});

test('bloqueia mutação sem teste comportamental posterior', () => {
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [mutacaoArquivo()] });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /mutação sem teste comportamental/);
});

test('aprova mutação seguida de teste comportamental bem-sucedido', () => {
  const historico = [mutacaoArquivo(), testeNode()];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.status, 'PASS');
  assert.equal(r.receipt.behavior_test_after_mutation_index, 1);
  assert.equal(r.receipt.checks.mutation_has_later_behavior_test, true);
  assert.equal(r.receipt.checks.all_mutations_proved, true);
});

test('git status é leitura e não exige teste posterior quando não houve mutação', () => {
  const historico = [{
    etapa_titulo: 'status', ferramenta: 'git', args: { acao: 'status' }, resultado: 'clean', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.last_mutation_index, -1);
  assert.equal(r.receipt.mutations_total, 0);
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

test('handler ping/http genérico não prova comportamento do artefato local mutado', () => {
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
    testeNode(),
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.behavior_test_after_mutation_index, 2);
});

test('T14: aprendizado só passa com read-back dos dois destinos emitido pelo Executor', () => {
  const semProva = [{
    etapa_titulo: 'aprender', ferramenta: 'aprender', args: { categoria: 'x', licao: 'ouro' },
    resultado: 'salvo', ok: true,
  }];
  const bloqueado = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: semProva });
  assert.equal(bloqueado.aprovado, false);
  assert.match(bloqueado.parecer, /LEARNING_PERSISTENCE_VERIFIED/);

  const comProva = [{ ...semProva[0], resultado: 'LEARNING_PERSISTENCE_VERIFIED=true categoria=x json=true ledger=true' }];
  const aprovado = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: comProva });
  assert.equal(aprovado.aprovado, true);
  assert.equal(aprovado.receipt.mutation_proofs[0].proof_kind, 'DUAL_STORE_READBACK');
});

test('T14: git commit_push só passa com confirmação do HEAD remoto', () => {
  const base = {
    etapa_titulo: 'push', ferramenta: 'git', args: { acao: 'commit_push' }, ok: true,
  };
  const bloqueado = auditarFinalizacao({
    missao: 'x', decisao: concluir(), historico: [{ ...base, resultado: 'Everything up-to-date' }],
  });
  assert.equal(bloqueado.aprovado, false);
  assert.match(bloqueado.parecer, /REMOTE_HEAD_VERIFIED/);

  const aprovado = auditarFinalizacao({
    missao: 'x', decisao: concluir(),
    historico: [{ ...base, resultado: `REMOTE_HEAD_VERIFIED=${'a'.repeat(40)}` }],
  });
  assert.equal(aprovado.aprovado, true);
  assert.equal(aprovado.receipt.mutation_proofs[0].proof_kind, 'REMOTE_HEAD_READBACK');
});

test('T14: handler remoto mutável sem pós-condição específica nunca vira verde por HTTP 200', () => {
  const historico = [{
    etapa_titulo: 'deploy', ferramenta: 'handler',
    args: { acao: 'deploy', url: 'https://deploy.invalid' },
    resultado: 'deploy: 200 ok', ok: true,
  }];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.match(r.parecer, /verify_url \+ verify_contains/);
  assert.equal(r.receipt.unproven_mutations[0].kind, 'REMOTE_HANDLER');
});

test('T14: handler remoto só passa com GET posterior no verify_url e conteúdo esperado', () => {
  const historico = [
    {
      etapa_titulo: 'deploy', ferramenta: 'handler',
      args: {
        acao: 'deploy', url: 'https://deploy.invalid',
        verify_url: 'https://app.invalid/health', verify_contains: 'version=abc123',
      },
      resultado: 'deploy: 200 ok', ok: true,
    },
    {
      etapa_titulo: 'provar', ferramenta: 'handler',
      args: { acao: 'http', metodo: 'GET', url: 'https://app.invalid/health' },
      resultado: 'HTTP 200 {"status":"ok","version":"version=abc123"}', ok: true,
    },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.mutation_proofs[0].proof_kind, 'REMOTE_POSTCONDITION');
  assert.equal(r.receipt.mutation_proofs[0].proof_index, 1);
});

test('T14: mutação anterior sem prova não é escondida por mutação posterior auto-verificada', () => {
  const historico = [
    mutacaoArquivo(),
    {
      etapa_titulo: 'aprender', ferramenta: 'aprender', args: { categoria: 'x', licao: 'ouro' },
      resultado: 'LEARNING_PERSISTENCE_VERIFIED=true categoria=x json=true ledger=true', ok: true,
    },
  ];
  const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.mutations_total, 2);
  assert.equal(r.receipt.unproven_mutations.length, 1);
  assert.equal(r.receipt.unproven_mutations[0].kind, 'LOCAL');
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
