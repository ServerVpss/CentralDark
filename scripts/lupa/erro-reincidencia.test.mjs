import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  REGISTRY_PATH,
  carregarRegistro,
  isento,
  linhasSubstantivas,
  linhaTemConteudo,
  medirDiff,
  avaliarCommit,
  detectarPadraoProibido,
  detectarDeleteSemRecibo,
  julgar,
} from './erro-reincidencia.mjs';

// ── fixture ─────────────────────────────────────────────────────────────────
function repoFalso(erros) {
  const raiz = mkdtempSync(join(tmpdir(), 'reincidencia-'));
  mkdirSync(join(raiz, 'docs', 'CONSCIENCIA'), { recursive: true });
  writeFileSync(
    join(raiz, REGISTRY_PATH),
    JSON.stringify({ schema_version: 1, erros }, null, 2),
  );
  return raiz;
}

const ERRO_PADRAO = {
  id: 'EX1',
  titulo: 'padrao proibido de teste',
  detector: {
    tipo: 'padrao_proibido',
    padrao: 'PROIBIDO_XYZ',
    escopo: ['.md'],
    motivo: 'teste',
  },
};

// ── registro ────────────────────────────────────────────────────────────────
test('registro canônico do repo é JSON válido e tem detector em todo erro', () => {
  const registro = carregarRegistro(process.cwd());
  assert.ok(Array.isArray(registro.erros));
  assert.ok(registro.erros.length > 0);
  for (const erro of registro.erros) {
    assert.ok(erro.id, 'erro sem id');
    assert.ok(erro.titulo, `${erro.id} sem titulo`);
    assert.ok(erro.detector?.tipo, `${erro.id} sem detector.tipo`);
    assert.ok(erro.detector.motivo, `${erro.id} sem detector.motivo`);
  }
});

test('todo erro não-mecanizável declara o motivo — UNKNOWN não vira PASS silencioso', () => {
  const registro = carregarRegistro(process.cwd());
  const naoMec = registro.erros.filter((e) => e.detector.tipo === 'NAO_MECANIZAVEL');
  assert.ok(naoMec.length > 0, 'esperado ao menos um não-mecanizável declarado');
  for (const erro of naoMec) {
    assert.ok(erro.detector.motivo.length > 20, `${erro.id}: motivo raso`);
  }
});

// ── isenção ─────────────────────────────────────────────────────────────────
test('documentar o erro não conta como cometer o erro', () => {
  assert.equal(isento('docs/CONSCIENCIA/ERROS-REGISTRADOS.json'), true);
  assert.equal(isento('docs/CONSCIENCIA/APRENDIZADOS/qualquer-coisa.md'), true);
  assert.equal(isento('scripts/lupa/erro-reincidencia.mjs'), true);
  assert.equal(isento('apps/modulos/algum/arquivo.md'), false);
});

// ── padrao_proibido ─────────────────────────────────────────────────────────
test('padrão proibido é detectado em arquivo comum', () => {
  const raiz = repoFalso([ERRO_PADRAO]);
  try {
    writeFileSync(join(raiz, 'sujo.md'), 'linha ok\ncontém PROIBIDO_XYZ aqui\n');
    const achados = detectarPadraoProibido(ERRO_PADRAO, raiz);
    assert.equal(achados.length, 1);
    assert.equal(achados[0].path, 'sujo.md');
    assert.equal(achados[0].line, 2);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('padrão proibido NÃO dispara dentro de APRENDIZADOS/', () => {
  const raiz = repoFalso([ERRO_PADRAO]);
  try {
    mkdirSync(join(raiz, 'docs', 'CONSCIENCIA', 'APRENDIZADOS'), { recursive: true });
    writeFileSync(
      join(raiz, 'docs', 'CONSCIENCIA', 'APRENDIZADOS', 'relato.md'),
      'o agente escreveu PROIBIDO_XYZ e isso foi o erro\n',
    );
    assert.deepEqual(detectarPadraoProibido(ERRO_PADRAO, raiz), []);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('padrão proibido respeita o escopo de extensão', () => {
  const raiz = repoFalso([ERRO_PADRAO]);
  try {
    writeFileSync(join(raiz, 'fora-do-escopo.txt'), 'PROIBIDO_XYZ\n');
    assert.deepEqual(detectarPadraoProibido(ERRO_PADRAO, raiz), []);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

// ── delete_sem_recibo ───────────────────────────────────────────────────────
const ERRO_DELETE = {
  id: 'EX4',
  titulo: 'delete sem recibo',
  detector: {
    tipo: 'delete_sem_recibo',
    escopo: ['.sh'],
    marcadores_recibo: ['RECEIPT', 'RECIBO', 'PROVA'],
    motivo: 'teste',
  },
};

test('rm -rf sem recibo é reincidência', () => {
  const raiz = repoFalso([ERRO_DELETE]);
  try {
    writeFileSync(join(raiz, 'limpa.sh'), '#!/bin/bash\nrm -rf /alvo/qualquer\n');
    const achados = detectarDeleteSemRecibo(ERRO_DELETE, raiz);
    assert.equal(achados.length, 1);
    assert.equal(achados[0].path, 'limpa.sh');
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('rm -rf com recibo citado passa', () => {
  const raiz = repoFalso([ERRO_DELETE]);
  try {
    writeFileSync(
      join(raiz, 'limpa.sh'),
      '#!/bin/bash\n# RECIBO: commit abc1234 provou duplicata por hash\nrm -rf /alvo\n',
    );
    assert.deepEqual(detectarDeleteSemRecibo(ERRO_DELETE, raiz), []);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('script sem rm destrutivo não é acusado', () => {
  const raiz = repoFalso([ERRO_DELETE]);
  try {
    writeFileSync(join(raiz, 'ok.sh'), '#!/bin/bash\nls -la\n');
    assert.deepEqual(detectarDeleteSemRecibo(ERRO_DELETE, raiz), []);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

// ── commit que alega prova ──────────────────────────────────────────────────
const ERRO_COMMIT = {
  id: 'EX9',
  titulo: 'commit alega prova sem conteudo',
  detector: {
    tipo: 'commit_anuncia_prova_sem_conteudo',
    padrao_alegacao: '\\b(prova|proof|recibo|receipt|inventor(y|io))\\b',
    minimo_linhas_substantivas: 3,
    motivo: 'teste',
  },
};

test('linhasSubstantivas ignora cabeçalho de diff e linhas vazias', () => {
  const diff = [
    '--- a/x.md', '+++ b/x.md',
    '+conteudo real um', '+conteudo real dois', '+   ', '-removida',
  ].join('\n');
  assert.equal(linhasSubstantivas(diff), 3);
});

test('substância é conteúdo, não caractere: `{}` não conta', () => {
  assert.equal(linhaTemConteudo('{}'), false);
  assert.equal(linhaTemConteudo('[]'), false);
  assert.equal(linhaTemConteudo('  ,  '), false);
  assert.equal(linhaTemConteudo('ok'), false, '2 caracteres ainda é raso');
  assert.equal(linhaTemConteudo('medicao real'), true);
});

test('medirDiff separa adições substantivas de remoções', () => {
  const diff = ['--- a/x', '+++ b/x', '+conteudo real', '+{}', '-linha antiga'].join('\n');
  assert.deepEqual(medirDiff(diff), { adicoes_substantivas: 1, remocoes: 1 });
});

test('reproduz E09 real: mensagem alega prova, diff são três `+{}`', () => {
  const diffCanvas = [
    '--- /dev/null', '+++ b/a.canvas', '+{}',
    '--- /dev/null', '+++ b/b.canvas', '+{}',
    '--- /dev/null', '+++ b/c.canvas', '+{}',
  ].join('\n');
  const veredito = avaliarCommit(ERRO_COMMIT, 'docs: inventory — proof of mirrors', diffCanvas);
  assert.notEqual(veredito, null, 'deveria acusar o falso verde');
  assert.equal(veredito.substantivas, 0);
});

test('commit que só REMOVE não é falso verde — deletar é entregar', () => {
  const diffRemocao = ['--- a/a.canvas', '+++ /dev/null', '-{}', '-{}', '-{}'].join('\n');
  const veredito = avaliarCommit(
    ERRO_COMMIT,
    'fix: remove canvas vazios que o commit de "proof of inventory" trouxe',
    diffRemocao,
  );
  assert.equal(veredito, null, 'remediação por deleção não pode ser acusada');
});

test('commit que alega prova E entrega conteúdo passa', () => {
  const diffReal = [
    '--- a/a.md', '+++ b/a.md',
    '+medicao: 287 -> 77 linhas', '+exports perdidos: 2', '+teste: 0/4 -> 4/4',
  ].join('\n');
  assert.equal(avaliarCommit(ERRO_COMMIT, 'fix: recibo da prova', diffReal), null);
});

test('commit que não alega prova nenhuma não é julgado por este detector', () => {
  const diffVazio = ['--- a/a.md', '+++ b/a.md', '+'].join('\n');
  assert.equal(avaliarCommit(ERRO_COMMIT, 'chore: bump deps', diffVazio), null);
});

// ── juiz ────────────────────────────────────────────────────────────────────
test('juiz agrega e conta mecanizados vs não-mecanizáveis', () => {
  const raiz = repoFalso([
    ERRO_PADRAO,
    { id: 'EXN', titulo: 'nao mec', detector: { tipo: 'NAO_MECANIZAVEL', motivo: 'x' } },
  ]);
  try {
    writeFileSync(join(raiz, 'sujo.md'), 'PROIBIDO_XYZ\n');
    const r = julgar(raiz);
    assert.equal(r.ok, false);
    assert.equal(r.total_registrados, 2);
    assert.equal(r.mecanizados, 1);
    assert.equal(r.nao_mecanizaveis, 1);
    assert.equal(r.achados.length, 1);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('repo limpo é verde', () => {
  const raiz = repoFalso([ERRO_PADRAO]);
  try {
    writeFileSync(join(raiz, 'limpo.md'), 'nada demais aqui\n');
    const r = julgar(raiz);
    assert.equal(r.ok, true);
    assert.equal(r.achados.length, 0);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('detector desconhecido falha fechado, não passa silencioso', () => {
  const raiz = repoFalso([{ id: 'EXZ', titulo: 'z', detector: { tipo: 'inventado', motivo: 'x' } }]);
  try {
    const r = julgar(raiz);
    assert.equal(r.ok, false);
    assert.match(r.achados[0].detalhe, /detector desconhecido/);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('registro ausente falha fechado', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'reincidencia-vazio-'));
  try {
    assert.throws(() => julgar(raiz), /registro ausente/);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});
