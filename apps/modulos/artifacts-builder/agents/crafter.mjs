#!/usr/bin/env node
// 🎨 ARTIFACTS CRAFTER v1.0 — Worker 24/7 que cria missões de artefato em loop
// Gera artefatos do sistema CentralDark automaticamente, um por vez
// Ciclo: pensar → escrever missão .md → esperar builder processar → repetir

import { writeFile, mkdir, readFile, readdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notificar, linha, kv } from '../utils/notify.mjs';

const BASE = dirname(dirname(fileURLToPath(import.meta.url)));
const MISSIONS_DIR = join(BASE, 'missions/pendente');
const CONCLUIDAS_DIR = join(BASE, 'missions/concluidas');
const LOGS_DIR = join(BASE, 'logs');
const CRAFTER_LOG = join(LOGS_DIR, 'crafter-cycle.log');

const CICLO_MS = 15000; // 15s entre ciclos
const MAX_ARTEFATOS_POR_CICLO = 1; // 1 por vez
const NOTIFICAR_A_CADA = 5; // Notifica a cada 5 ciclos

// ── Catálogo de ideias de artefatos do sistema CentralDark ──
const CATALOGO = [
  // === INFRA & SISTEMA ===
  {
    nome: 'Monitor de Logs CentralDark',
    tipo: 'react-spa',
    desc: 'Visualizador de logs em tempo real de todos os módulos PM2. Tail -f no browser com filtro por módulo, nível (info/warn/error), e busca full-text.',
    requisitos: [
      'Streaming de logs dos 24 processos PM2',
      'Filtro por nome do módulo',
      'Filtro por nível (INFO/WARN/ERROR)',
      'Busca full-text com highlight',
      'Auto-scroll com pausa',
      'Tema escuro com verde neon',
      'Badge de contagem de erros',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'HealthCheck VPS - Painel de Recursos',
    tipo: 'react-spa',
    desc: 'Painel de monitoramento da VPS: CPU, RAM, disco, processos, temperatura. Gráficos em tempo real com histórico das últimas 24h.',
    requisitos: [
      'Gráfico de CPU (%) com histórico',
      'Gráfico de RAM (usada/livre)',
      'Disco: uso por partição',
      'Top 5 processos por CPU',
      'Temperatura da VPS',
      'Uptime e load average',
      'Atualização a cada 3s',
      'Alertas visuais quando >80%',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Gerenciador de Processos PM2',
    tipo: 'react-spa',
    desc: 'Interface web para gerenciar os 24 processos PM2: start/stop/restart, ver logs, monitorar CPU/memória por processo.',
    requisitos: [
      'Lista completa dos 24 processos',
      'Status 🟢/🔴 com cor',
      'Ações: start, stop, restart (via API)',
      'Gráfico de CPU por processo',
      'Gráfico de memória por processo',
      'Busca por nome',
      'Ordenação: críticos primeiro',
      'Confirmação antes de ações destrutivas',
    ],
    rotas: ['/'],
    tema: 'dark',
  },

  // === IA & ARSENAL ===
  {
    nome: 'Batalha de IAs - Arena',
    tipo: 'react-spa',
    desc: 'Arena visual onde o usuário faz uma pergunta e vê Gemini, GPT-5.5, Claude Sonnet e Claude Opus respondendo em tempo real, lado a lado, com votação.',
    requisitos: [
      'Input de pergunta do usuário',
      '4 painéis lado a lado (Gemini, GPT-5.5, Sonnet, Opus)',
      'Streaming de resposta em tempo real em cada painel',
      'Timer de latência por modelo',
      'Botão de voto (qual respondeu melhor)',
      'Histórico de batalhas anteriores',
      'Ranking de vitórias por modelo',
      'Tema arena/gladiador',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Conselho de Tutores - Visualização',
    tipo: 'react-spa',
    desc: 'Visualização dos 6 tutores do Arsenal Council (Fabler, GPT-5.5, Gemini 3 Flash, GPT-5.4, Gemini 2.5 Pro, GPT-5) com seus papéis, personalidades, e estatísticas de uso.',
    requisitos: [
      '6 cards com emoji, nome, modelo, papel',
      'Indicador de "última consulta"',
      'Estatísticas: vezes consultado, tokens gastos',
      'Relações entre tutores (quem consulta quem)',
      'Mini grafo de conexões entre tutores',
      'Tema roxo neon (#a78bfa)',
      'Animações de glow no tutor ativo',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Debate Histórico - Timeline',
    tipo: 'react-spa',
    desc: 'Timeline visual de todos os debates já realizados pelo Arsenal Council. Cada debate é um card expansível com as rodadas, votos e veredito final.',
    requisitos: [
      'Timeline cronológica vertical',
      'Card por debate: data, modelo vencedor, resumo',
      'Expansão para ver rodadas completas',
      'Busca por palavra-chave',
      'Filtro por modelo vencedor',
      'Estatísticas: total de debates, modelo mais vencedor',
      'Tema escuro com linhas de conexão',
    ],
    rotas: ['/'],
    tema: 'dark',
  },

  // === MISSÕES & HERMES ===
  {
    nome: 'Quadro de Missões do Hermes',
    tipo: 'react-spa',
    desc: 'Kanban board das missões do Hermes: Pendente → Em Andamento → Concluída. Cada card mostra prioridade, tempo, e detalhes da execução.',
    requisitos: [
      '3 colunas: Pendente, Em Andamento, Concluída',
      'Card por missão: nome, prioridade (🔴🟡🟢), tempo',
      'Arrastar entre colunas (drag & drop)',
      'Clique para ver detalhes completos',
      'Badge de contagem por coluna',
      'Auto-refresh a cada 10s',
      'Tema escuro com cores de prioridade',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Relatório de Evolução - Diário',
    tipo: 'react-spa',
    desc: 'Relatório diário de evolução do sistema: artefatos criados, debates realizados, missões concluídas, mudanças no grafo, e métricas de saúde.',
    requisitos: [
      'Card do dia atual com resumo',
      'Timeline de eventos do dia',
      'Métricas: artefatos, debates, missões',
      'Gráfico de atividade nas últimas 24h',
      'Seção de "aprendizados do dia"',
      'Botão de exportar relatório',
      'Tema escuro com verde neon',
    ],
    rotas: ['/'],
    tema: 'dark',
  },

  // === GRAFO & VISUALIZAÇÃO ===
  {
    nome: 'Grafo 3D Interativo - Explorer',
    tipo: 'react-spa',
    desc: 'Visualização 3D do grafo completo da CentralDark com 315+ nós. Rotação automática, clique para focar, zoom, e painel de detalhes ao lado.',
    requisitos: [
      'Renderização 3D com Three.js ou ForceGraph3D',
      '315+ nós com cores por categoria',
      'Rótulos flutuantes nos nós',
      'Clique para focar e ver detalhes',
      'Painel lateral com info do nó selecionado',
      'Busca por nome do nó',
      'Legenda de cores',
      'Botão de reset de câmera',
      'Tema escuro com glow',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Mapa de Dependências do Sistema',
    tipo: 'react-spa',
    desc: 'Mapa interativo mostrando todas as dependências entre módulos da CentralDark. Quem chama quem, portas, protocolos, e status das conexões.',
    requisitos: [
      'Grafo dirigido de dependências',
      'Cores por tipo de conexão (HTTP, WS, MCP, FS)',
      'Clique no nó para ver dependências',
      'Filtro por tipo de conexão',
      'Indicador de saúde da conexão',
      'Mini-mapa para navegação',
      'Tema escuro com linhas brilhantes',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  // === NOVOS 10 ARTEFATOS — EXPANSÃO DO GRIMÓRIO ===
  {
    nome: 'Terminal Web - Console CentralDark',
    tipo: 'react-spa',
    desc: 'Terminal interativo no navegador com comandos para gerenciar o ecossistema: pm2 status, logs, restart, deploy. Estilo Matrix verde no preto.',
    requisitos: [
      'Prompt de comando estilo terminal',
      'Comandos: help, status, logs [modulo], restart [modulo]',
      'Histórico de comandos (seta pra cima)',
      'Auto-scroll com pausa',
      'Resposta em tempo real via API',
      'Tema Matrix: verde #00ff41 no fundo preto',
      'Efeito CRT scanlines',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Painel de Tokens e Custos',
    tipo: 'react-spa',
    desc: 'Dashboard de consumo de tokens de todas as IAs do ecossistema: gasto por modelo, por agente, por dia. Gráficos de pizza e barras.',
    requisitos: [
      'Gasto total do dia/semana/mês',
      'Top 5 modelos mais caros',
      'Top 5 agentes que mais consomem',
      'Gráfico de pizza por modelo',
      'Gráfico de barras por dia',
      'Alerta quando gasto diário > limite',
      'Tema escuro com dourado',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Mapa de Portas e Serviços',
    tipo: 'react-spa',
    desc: 'Visualização de todas as portas abertas na VPS, quais processos estão ouvindo, e status de cada serviço. Scan automático.',
    requisitos: [
      'Lista de portas com processo e PID',
      'Status 🟢/🔴 por porta',
      'Busca por porta ou nome',
      'Cores por categoria (HTTP, WS, MCP, DB)',
      'Botão de scan manual',
      'Tema escuro com azul neon',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Biblioteca de Feitiços - Grimório',
    tipo: 'react-spa',
    desc: 'Grimório visual com todos os comandos mágicos do sistema: invocar artefato, summon debate, scan portas, etc. Cada feitiço com nome, descrição, e botão de execução.',
    requisitos: [
      'Grid de cards de feitiços',
      'Cada card: nome, emoji, descrição, botão "Invocar"',
      'Categorias: Invocação, Batalha, Diagnóstico, Manutenção',
      'Animação de brilho ao invocar',
      'Histórico de feitiços lançados',
      'Tema escuro com roxo e dourado',
      'Efeito de partículas ao executar',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Cronograma de Evolução - Roadmap',
    tipo: 'react-spa',
    desc: 'Roadmap visual do ecossistema CentralDark com milestones passados e futuros. Timeline horizontal com cards expansíveis.',
    requisitos: [
      'Timeline horizontal com scroll',
      'Milestones: passado (verde), presente (azul), futuro (cinza)',
      'Card por milestone: data, título, descrição, status',
      'Filtro por categoria (infra, ia, bot, mcp)',
      'Barra de progresso geral',
      'Tema escuro com gradiente',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Sala de Guerra - War Room',
    tipo: 'react-spa',
    desc: 'Painel tático com métricas ao vivo do ecossistema: uptime geral, agentes online, artefatos, debates, alerts. Big numbers com animação.',
    requisitos: [
      'Big numbers animados (contagem subindo)',
      'Métricas: agentes online, artefatos, debates, uptime',
      'Mini gráficos sparkline por métrica',
      'Alertas recentes (últimos 10)',
      'Status geral: 🟢 OPERACIONAL / 🟡 DEGRADADO / 🔴 CRÍTICO',
      'Auto-refresh a cada 10s',
      'Tema escuro com vermelho neon',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Editor de Missões do Hermes',
    tipo: 'react-spa',
    desc: 'Interface visual para criar missões do Hermes sem precisar editar arquivos .md. Formulário com preview e envio direto.',
    requisitos: [
      'Formulário: nome, tipo, descrição, requisitos, rotas, tema',
      'Preview ao vivo do .md sendo gerado',
      'Botão "Criar Missão" que escreve o arquivo',
      'Lista das últimas missões criadas',
      'Validação de campos obrigatórios',
      'Tema escuro com laranja',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Central de Notificações',
    tipo: 'react-spa',
    desc: 'Histórico de todas as notificações enviadas pelo sistema: Telegram, alerts, eventos. Busca e filtro por tipo e data.',
    requisitos: [
      'Timeline de notificações',
      'Filtro por tipo: alerta, info, sucesso, erro',
      'Filtro por data',
      'Busca por texto',
      'Badge de não lidas',
      'Tema escuro com azul claro',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Perfil do Sistema - Diagnóstico',
    tipo: 'react-spa',
    desc: 'Diagnóstico completo do sistema: versões, dependências, uptime, saúde dos módulos, recomendações automáticas.',
    requisitos: [
      'Info: OS, Node, PM2, uptime',
      'Saúde dos módulos (checklist)',
      'Recomendações automáticas baseadas em falhas',
      'Botão "Executar Diagnóstico"',
      'Exportar relatório em JSON',
      'Tema escuro com ciano',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
  {
    nome: 'Jogo da Velha - IA vs IA',
    tipo: 'react-spa',
    desc: 'Jogo da velha onde duas IAs do Arsenal Council jogam uma contra a outra. Espectador pode ver o raciocínio de cada jogada.',
    requisitos: [
      'Tabuleiro 3x3 interativo',
      'IA vs IA: Gemini vs GPT (ou escolha)',
      'Mostrar raciocínio de cada jogada',
      'Placar de vitórias',
      'Botão "Nova Partida"',
      'Tema escuro com cores dos modelos',
      'Animação nas jogadas',
    ],
    rotas: ['/'],
    tema: 'dark',
  },
];

let cicloAtual = 0;
let artefatosCriados = 0;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [Ciclo ${cicloAtual}] ${msg}`;
  console.log(line);
}

async function logToFile(msg) {
  try {
    await appendFile(CRAFTER_LOG, msg + '\n', 'utf8');
  } catch(e) { console.error("[crafter] logToFile:", e.message || e); }
}

function slugify(s) {
  // Remove acentos, espaços viram hífen simples, sem duplicar
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50) || `a-${Date.now()}`;
}

async function criarMissao(artefato) {
  const { nome, tipo, desc, requisitos, rotas, tema } = artefato;
  
  const content = `# ${nome}\n\n## Tipo\n${tipo}\n\n## Descrição\n${desc}\n\n## Requisitos\n${requisitos.map(r => `- ${r}`).join('\n')}\n\n## Rotas\n${rotas.join('\n')}\n\n## Tema\n${tema}\n`;

  const slug = slugify(nome);
  const caminho = join(MISSIONS_DIR, `${slug}.md`);
  
  await writeFile(caminho, content, 'utf8');
  return caminho;
}

async function missaoFoiProcessada(slug) {
  // Verifica se já foi movida para concluídas
  if (!existsSync(CONCLUIDAS_DIR)) return false;
  const files = await readdir(CONCLUIDAS_DIR);
  return files.some(f => f.includes(slug));
}

async function aguardarProcessamento(slug, timeoutMs = 60000) {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    if (await missaoFoiProcessada(slug)) return true;
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

async function ciclo() {
  cicloAtual++;
  
  // Pega o próximo artefato do catálogo (round-robin)
  const idx = (cicloAtual - 1) % CATALOGO.length;
  const artefato = CATALOGO[idx];
  const slug = slugify(artefato.nome);
  
  log(`📦 Artefato #${artefatosCriados + 1}: "${artefato.nome}" (${idx + 1}/${CATALOGO.length})`);
  
  // Verifica se já foi criado antes
  if (await missaoFoiProcessada(slug)) {
    log(`⏭️  Já processado: ${slug}, pulando`);
    return false;
  }
  
  // Cria a missão
  try {
    const caminho = await criarMissao(artefato);
    artefatosCriados++;
    log(`✅ Missão criada: ${caminho}`);
    await logToFile(`CRIADO: ${artefato.nome} → ${caminho}`);
    return true;
  } catch (e) {
    log(`❌ Erro ao criar missão: ${e.message}`);
    await logToFile(`ERRO: ${artefato.nome} → ${e.message}`);
    return false;
  }
}

// ── Loop principal ──
async function loop() {
  log('🎨 Artifacts Crafter iniciado — 24/7');
  log(`📋 Catálogo: ${CATALOGO.length} artefatos`);
  await logToFile(`=== CRAFTER INICIADO === ${new Date().toISOString()} ===`);
  
  while (true) {
    try {
      await ciclo();
    } catch (e) {
      log(`❌ Erro no ciclo: ${e.message}`);
      await logToFile(`ERRO CICLO: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, CICLO_MS));
  }
}

// ── Se executado diretamente ──
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Se passar --burst, faz N ciclos rápido e sai
  const burstMode = process.argv.includes('--burst');
  const burstCount = parseInt(process.argv[process.argv.indexOf('--burst') + 1]) || 10;
  
  if (burstMode) {
    log(`🔥 MODO BURST: ${burstCount} artefatos`);
    (async () => {
      for (let i = 0; i < burstCount; i++) {
        await ciclo();
        await new Promise(r => setTimeout(r, 2000)); // 2s entre cada burst
      }
      log(`🏁 Burst concluído: ${artefatosCriados} artefatos criados`);
      process.exit(0);
    })();
  } else {
    loop().catch(e => { console.error('Fatal:', e); process.exit(1); });
  }
}