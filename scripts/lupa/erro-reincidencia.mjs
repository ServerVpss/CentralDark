#!/usr/bin/env node
// FABLE JUDGE — reincidência de erro registrado.
// Segundo leitor read-only: não muta nada, só julga.
// Lei: REGISTRAR != APRENDER. Aprendizado sem detector é prosa.
// Um erro registrado que volta é falha de aprendizado, não erro novo.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export const REGISTRY_PATH = 'docs/CONSCIENCIA/ERROS-REGISTRADOS.json';

// Documentar um erro não é cometê-lo. Estes caminhos descrevem erros de propósito.
export const ISENTOS = Object.freeze([
  'docs/CONSCIENCIA/ERROS-REGISTRADOS.json',
  'docs/CONSCIENCIA/APRENDIZADOS.md',
  'scripts/lupa/erro-reincidencia.mjs',
  'scripts/lupa/erro-reincidencia.test.mjs',
]);

export const ISENTOS_PREFIXO = Object.freeze([
  'docs/CONSCIENCIA/APRENDIZADOS/',
]);

const DIRS_PULADOS = new Set(['.git', 'node_modules', '.cache', 'coverage', 'dist', 'build']);

export function isento(caminho) {
  const p = caminho.split('\\').join('/');
  if (ISENTOS.includes(p)) return true;
  return ISENTOS_PREFIXO.some((prefixo) => p.startsWith(prefixo));
}

export function carregarRegistro(raiz = process.cwd()) {
  const caminho = join(raiz, REGISTRY_PATH);
  if (!existsSync(caminho)) {
    throw new Error(`registro ausente: ${REGISTRY_PATH}`);
  }
  return JSON.parse(readFileSync(caminho, 'utf8'));
}

// HISTORICAL != CURRENT. Reincidência é cometer o erro DE NOVO depois de
// registrá-lo — não é ter cometido antes. Com --intervalo, os detectores de
// arquivo olham só o que o intervalo alterou; sem ele, auditam a árvore inteira.
export function arquivosAlterados(raiz, intervalo) {
  try {
    const saida = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', intervalo], {
      cwd: raiz, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    });
    return new Set(saida.split(/\r?\n/).filter(Boolean).map((p) => p.split('\\').join('/')));
  } catch {
    return null;
  }
}

function listarArquivos(raiz, extensoes, apenas = null) {
  const aceita = new Set(extensoes.map((e) => e.toLowerCase()));
  const encontrados = [];
  const visitar = (dir) => {
    let entradas = [];
    try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entrada of entradas) {
      if (entrada.isSymbolicLink()) continue;
      const absoluto = join(dir, entrada.name);
      if (entrada.isDirectory()) {
        if (DIRS_PULADOS.has(entrada.name)) continue;
        visitar(absoluto);
        continue;
      }
      if (!entrada.isFile()) continue;
      if (!aceita.has(extname(entrada.name).toLowerCase())) continue;
      const rel = relative(raiz, absoluto).split('\\').join('/');
      if (isento(rel)) continue;
      if (apenas && !apenas.has(rel)) continue;
      encontrados.push({ rel, absoluto });
    }
  };
  visitar(raiz);
  return encontrados;
}

function lerTexto(caminho, limite = 4 * 1024 * 1024) {
  try {
    const texto = readFileSync(caminho, 'utf8');
    return texto.length > limite ? null : texto;
  } catch {
    return null;
  }
}

// ── detector: padrao_proibido ───────────────────────────────────────────────
export function detectarPadraoProibido(erro, raiz, apenas = null) {
  const { padrao, escopo } = erro.detector;
  const re = new RegExp(padrao, 'i');
  const achados = [];
  for (const { rel, absoluto } of listarArquivos(raiz, escopo, apenas)) {
    const texto = lerTexto(absoluto);
    if (texto == null) continue;
    const linhas = texto.split(/\r?\n/);
    for (let i = 0; i < linhas.length; i++) {
      if (re.test(linhas[i])) {
        achados.push({ id: erro.id, path: rel, line: i + 1 });
        break; // uma ocorrência por arquivo já prova a reincidência
      }
    }
  }
  return achados;
}

// ── detector: delete_sem_recibo ─────────────────────────────────────────────
const RM_DESTRUTIVO = /\brm\s+-[a-z]*[rf][a-z]*\s/i;

export function detectarDeleteSemRecibo(erro, raiz, apenas = null) {
  const { escopo, marcadores_recibo: marcadores } = erro.detector;
  const achados = [];
  for (const { rel, absoluto } of listarArquivos(raiz, escopo, apenas)) {
    const texto = lerTexto(absoluto);
    if (texto == null) continue;
    if (!RM_DESTRUTIVO.test(texto)) continue;
    const temRecibo = marcadores.some((m) => new RegExp(m, 'i').test(texto));
    if (!temRecibo) achados.push({ id: erro.id, path: rel, line: null });
  }
  return achados;
}

// ── detector: commit_anuncia_prova_sem_conteudo ─────────────────────────────
// Substância = conteúdo, não caractere. `{}`, `[]`, `,` e afins não provam nada.
// Contraprova que forçou este critério: o commit 41f1f7e85 anunciava "proof of
// mirrors" e seu diff eram três linhas `+{}` — não vazias, porém sem informação.
const MINIMO_CARACTERES_DE_CONTEUDO = 3;

export function linhaTemConteudo(linha) {
  const conteudo = linha.replace(/[^\p{L}\p{N}]/gu, '');
  return conteudo.length >= MINIMO_CARACTERES_DE_CONTEUDO;
}

export function medirDiff(diff) {
  const corpo = diff
    .split(/\r?\n/)
    .filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
  const adicoes = corpo.filter((l) => l.startsWith('+')).map((l) => l.slice(1).trim());
  const remocoes = corpo.filter((l) => l.startsWith('-'));
  return {
    adicoes_substantivas: adicoes.filter(linhaTemConteudo).length,
    remocoes: remocoes.length,
  };
}

// Compatibilidade: soma das duas margens, usada por chamadores antigos.
export function linhasSubstantivas(diff) {
  const corpo = diff
    .split(/\r?\n/)
    .filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l))
    .map((l) => l.slice(1).trim());
  return corpo.filter(linhaTemConteudo).length;
}

// Remover é entregar. Um commit que apaga carrega a deleção como substância,
// mesmo com zero linha de conteúdo somada. Contraprova que forçou este critério:
// 328dfb027 remedia o falso verde citando as palavras "proof/inventory" e foi
// acusado de ser o próprio falso verde que estava consertando.
export function avaliarCommit(erro, mensagem, diff) {
  const re = new RegExp(erro.detector.padrao_alegacao, 'i');
  if (!re.test(mensagem)) return null;
  const { adicoes_substantivas: adicoes, remocoes } = medirDiff(diff);
  if (adicoes >= erro.detector.minimo_linhas_substantivas) return null;
  if (remocoes > 0) return null;
  return { substantivas: adicoes };
}

function commitsDoIntervalo(raiz, intervalo) {
  try {
    const saida = execFileSync('git', ['log', '--format=%H', intervalo], {
      cwd: raiz, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    });
    return saida.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function dadosDoCommit(raiz, sha) {
  const rodar = (args) => execFileSync('git', args, {
    cwd: raiz, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  try {
    const mensagem = rodar(['log', '-1', '--format=%B', sha]);
    const diff = rodar(['show', '--format=', '--unified=0', sha]);
    return { mensagem, diff };
  } catch {
    return null;
  }
}

export function detectarCommitSemConteudo(erro, raiz, intervalo) {
  if (!intervalo) return [];
  const achados = [];
  for (const sha of commitsDoIntervalo(raiz, intervalo)) {
    const dados = dadosDoCommit(raiz, sha);
    if (!dados) continue;
    const veredito = avaliarCommit(erro, dados.mensagem, dados.diff);
    if (veredito) {
      achados.push({
        id: erro.id,
        path: `commit:${sha.slice(0, 9)}`,
        line: null,
        detalhe: `alega prova, diff tem ${veredito.substantivas} linha(s) substantiva(s)`,
      });
    }
  }
  return achados;
}

// ── juiz ────────────────────────────────────────────────────────────────────
export function julgar(raiz = process.cwd(), opcoes = {}) {
  const registro = carregarRegistro(raiz);
  const apenas = opcoes.intervalo ? arquivosAlterados(raiz, opcoes.intervalo) : null;
  const achados = [];
  let mecanizados = 0;
  let naoMecanizaveis = 0;

  for (const erro of registro.erros) {
    const tipo = erro.detector?.tipo;
    if (tipo === 'NAO_MECANIZAVEL' || tipo === 'META') {
      naoMecanizaveis++;
      continue;
    }
    mecanizados++;
    if (tipo === 'padrao_proibido') {
      achados.push(...detectarPadraoProibido(erro, raiz, apenas));
    } else if (tipo === 'delete_sem_recibo') {
      achados.push(...detectarDeleteSemRecibo(erro, raiz, apenas));
    } else if (tipo === 'commit_anuncia_prova_sem_conteudo') {
      achados.push(...detectarCommitSemConteudo(erro, raiz, opcoes.intervalo));
    } else {
      achados.push({
        id: erro.id,
        path: REGISTRY_PATH,
        line: null,
        detalhe: `detector desconhecido: ${tipo}`,
      });
    }
  }

  return {
    ok: achados.length === 0,
    total_registrados: registro.erros.length,
    mecanizados,
    nao_mecanizaveis: naoMecanizaveis,
    escopo: apenas ? `delta:${apenas.size} arquivo(s)` : 'arvore-completa',
    achados,
  };
}

function principal() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--intervalo');
  const intervalo = idx !== -1 ? args[idx + 1] : null;
  const raiz = process.cwd();

  let relatorio;
  try {
    relatorio = julgar(raiz, { intervalo });
  } catch (e) {
    console.log(`REINCIDENCIA_ERRO REGISTRO_ILEGIVEL :: ${e.message}`);
    console.log('REINCIDENCIA_OK=0 JUDGE=FABLE MUTATION=false ERROS=1');
    process.exit(1);
  }

  for (const a of relatorio.achados) {
    const local = a.line ? `${a.path}:${a.line}` : a.path;
    const erro = carregarRegistro(raiz).erros.find((e) => e.id === a.id);
    const detalhe = a.detalhe ? ` :: ${a.detalhe}` : ` :: ${erro?.titulo ?? ''}`;
    console.log(`REINCIDENCIA_ERRO ${a.id} ${local}${detalhe}`);
  }

  console.log(
    `REINCIDENCIA_OK=${relatorio.ok ? 1 : 0} JUDGE=FABLE MUTATION=false `
    + `REGISTRADOS=${relatorio.total_registrados} MECANIZADOS=${relatorio.mecanizados} `
    + `NAO_MECANIZAVEIS=${relatorio.nao_mecanizaveis} ERROS=${relatorio.achados.length}`,
  );

  process.exit(relatorio.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('erro-reincidencia.mjs')) {
  principal();
}
