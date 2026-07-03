import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MISSOES_DIR = join(import.meta.dirname, 'MISSOES');

export function criarMissao(slug, descricao) {
  const dir = join(MISSOES_DIR, slug);
  mkdirSync(dir, { recursive: true });
  const state = {
    missao_id: slug, descricao, status: 'inicio',
    passo_atual: 0, total_passos: 0, passos_concluidos: [],
    historico_erros: [], aprendizados_gerados: 0,
    ultimo_checkpoint: new Date().toISOString(),
    branch: `hermes/${slug}`
  };
  writeFileSync(join(dir, 'state.json'), JSON.stringify(state, null, 2));
  return state;
}

export function lerState(slug) {
  const path = join(MISSOES_DIR, slug, 'state.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function salvarCheckpoint(slug, state) {
  state.ultimo_checkpoint = new Date().toISOString();
  writeFileSync(join(MISSOES_DIR, slug, 'state.json'), JSON.stringify(state, null, 2));
}

export function recuperarMissaoPausada() {
  if (!existsSync(MISSOES_DIR)) return null;
  const pastas = require('fs').readdirSync(MISSOES_DIR);
  for (const pasta of pastas) {
    const state = lerState(pasta);
    if (state && state.status === 'em_andamento') return state;
  }
  return null;
}

export function listarMissoes() {
  if (!existsSync(MISSOES_DIR)) return [];
  return require('fs').readdirSync(MISSOES_DIR).map(pasta => lerState(pasta)).filter(Boolean);
}
