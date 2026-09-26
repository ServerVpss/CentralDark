# CONTRATO - finalization-gate.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\agents\Critic\finalization-gate.test.mjs
**SHA:** 4b4f187fa586efaa
**Timestamp:** 2026-08-28T02:56:26.306478
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- etapa_titulo: 'testar', ferramenta: 'shell', args: { comando: `node --test ${arquivo}` },
- { etapa_titulo: 'hash', ferramenta: 'shell', args: { comando: 'sha256sum a.mjs' }, resultado: 'abc  a.mjs', ok: true },
- etapa_titulo: 'escrever-shell', ferramenta: 'shell', args: { comando: 'printf x > a.txt' },
- args: { comando: `python3 -c "open('a.txt','w').write('x')"` },
- args: { comando: `node -e "require('fs').writeFileSync('tmp-x.mjs','export default 1')"` },
- { etapa_titulo: 'sintaxe', ferramenta: 'shell', args: { comando: 'node --check a.mjs' }, resultado: 'ok', ok: true },
- { etapa_titulo: 'sintaxe', ferramenta: 'shell', args: { comando: 'node --check a.mjs' }, resultado: 'ok', ok: true },
- { etapa_titulo: 'fake', ferramenta: 'shell', args: { comando: 'echo TSC_OK' }, resultado: 'TSC_OK', ok: true },
- etapa_titulo: 'check', ferramenta: 'shell', args: { comando: 'node --check a.mjs' },

### Decisoes
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [] });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico: [mutacaoArquivo()] });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });
- const r = auditarFinalizacao({ missao: 'x', decisao: concluir(), historico });

### Gaps
- args: { acao: 'http', metodo: 'GET', url: 'https://app.invalid/health' },

### Ouro Bruto (primeiros 5000 chars)
```
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
  assert.equal(r.receipt.schema_version, 2);
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
    args: { comando
```