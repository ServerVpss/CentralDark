#!/usr/bin/env node
// 🧠 HERMES → ARTIFACTS BUILDER — Agente de criação de artefatos
// Integra o Hermes Core com o Artifacts Builder
// Quando o Hermes detecta uma necessidade de artefato, cria uma missão .md

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = dirname(dirname(fileURLToPath(import.meta.url)));
const MISSIONS_DIR = join(BASE, 'missions/pendente');
const LOGS_DIR = join(BASE, 'logs');

// Garantir que as pastas existem
await mkdir(MISSIONS_DIR, { recursive: true });
await mkdir(LOGS_DIR, { recursive: true });

/**
 * Cria uma missão de artefato para o Artifacts Builder processar
 * @param {Object} opts
 * @param {string} opts.nome - Nome do artefato
 * @param {string} opts.tipo - Tipo (react-page, react-spa, dashboard, etc)
 * @param {string} opts.desc - Descrição
 * @param {string[]} opts.requisitos - Lista de requisitos
 * @param {string[]} opts.rotas - Rotas da SPA
 * @param {string} opts.tema - 'dark' | 'light'
 * @returns {Promise<string>} caminho do arquivo criado
 */
export async function criarMissaoArtefato(opts) {
  const { nome, tipo = 'react-page', desc = '', requisitos = [], rotas = ['/'], tema = 'dark' } = opts;

  const content = `# ${nome}

## Tipo
${tipo}

## Descrição
${desc}

## Requisitos
${requisitos.map(r => `- ${r}`).join('\n')}

## Rotas
${rotas.join('\n')}

## Tema
${tema}
`;

  const slug = nome.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) || `artefato-${Date.now()}`;

  const caminho = join(MISSIONS_DIR, `${slug}.md`);
  await writeFile(caminho, content, 'utf8');

  console.log(`[Hermes→Artifacts] Missão criada: ${caminho}`);
  return caminho;
}

/**
 * Lista todas as missões pendentes
 */
export async function listarMissoesPendentes() {
  if (!existsSync(MISSIONS_DIR)) return [];
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(MISSIONS_DIR);
  return files.filter(f => f.endsWith('.md')).sort();
}

/**
 * Lista artefatos já construídos
 */
export async function listarArtefatos() {
  const PUBLIC = join(BASE, 'public');
  if (!existsSync(PUBLIC)) return [];
  const { readdir } = await import('node:fs/promises');
  const pastas = (await readdir(PUBLIC, { withFileTypes: true }))
    .filter(d => d.isDirectory() && d.name !== 'assets');
  
  const items = [];
  for (const pasta of pastas) {
    try {
      const manifest = JSON.parse(await readFile(join(PUBLIC, pasta.name, 'manifest.json'), 'utf8'));
      items.push(manifest);
    } catch {}
  }
  return items;
}

// Se executado diretamente, testa
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const acao = process.argv[2] || 'listar';
  
  if (acao === 'criar') {
    const nome = process.argv[3] || 'Teste Automático';
    const desc = process.argv[4] || 'Artefato gerado automaticamente pelo Hermes';
    const reqs = (process.argv[5] || 'Funcionalidade principal').split(',').map(s => s.trim());
    
    criarMissaoArtefato({
      nome,
      desc,
      requisitos: reqs,
      rotas: ['/'],
      tema: 'dark'
    }).then(caminho => {
      console.log(`✅ Missão criada em ${caminho}`);
      process.exit(0);
    }).catch(e => {
      console.error(`❌ ${e.message}`);
      process.exit(1);
    });
  } else {
    listarMissoesPendentes().then(files => {
      console.log(`📋 Missões pendentes: ${files.length}`);
      files.forEach(f => console.log(`  - ${f}`));
      return listarArtefatos();
    }).then(arts => {
      console.log(`\n🏗️ Artefatos construídos: ${arts.length}`);
      arts.forEach(a => console.log(`  - ${a.nome} (${a.tipo}) → /${a.slug}/`));
      process.exit(0);
    });
  }
}
