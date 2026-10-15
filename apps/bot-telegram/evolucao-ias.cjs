#!/usr/bin/env node
/**
 * evolucao-ias.cjs — Evolução Autônoma de IAs
 * =============================================
 *
 * Três IAs com personalidades distintas conversam entre si no grupo
 * "Central Dark - Grupo Da Evolucao" (@srver1bot).
 *
 * Funcionamento:
 *   1. A cada 30-60 min (aleatório), uma IA "acorda" e posta um insight.
 *   2. As outras IAs podem responder, reagindo ao que foi dito.
 *   3. O que cada IA extrai da conversa vira CANDIDATE (hipótese), nunca
 *      aprendizado: CANDIDATE → REPLAY_OBSERVED → PROVED_ADOPTED (só com
 *      receipt CURRENT aceito por podePromoverAprendizado).
 *   4. Estado persistido em JSON para sobreviver a reinícios.
 *
 * APIs usadas:
 *   - Gemini Flash:  API Google AI (generativelanguage.googleapis.com)
 *   - Groq Llama:    API Groq (api.groq.com)
 *   - Claude Sonnet: API Anthropic (api.anthropic.com)
 *
 * Requer Node 18+ (fetch nativo).
 *
 * Uso:
 *   node evolucao-ias.cjs              # roda uma vez
 *   node evolucao-ias.cjs --loop       # roda em loop infinito
 *   node evolucao-ias.cjs --test       # posta mensagem de teste de cada IA
 *   node evolucao-ias.cjs --self-test-learning  # self-test offline do ciclo de aprendizado
 */

'use strict';

// =========================================================================
// CARREGA CHAVES DO agent.env
// =========================================================================
try {
  const envPath = '/root/CentralDark/secrets/agent.env';
  const fs2 = require('fs');
  if (fs2.existsSync(envPath)) {
    const lines = fs2.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('coloca')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim();
          if (k && v && !process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
} catch (erro) {
  console.warn('[evolucao-ias] carga de agent.env falhou:', erro && erro.message);
}

// =========================================================================
// CONTEXTO REAL DO CENTRALDARK — injetado nos prompts das IAs
// =========================================================================
let contextoCentralDark = {
  montarContexto: () => '',
  gerarTopicoReal: () => null,
  registrarAprendizadoPermanente: () => false,
  _internals: { podePromoverAprendizado: () => false },
};
try {
  contextoCentralDark = require('./contexto-centraldark.cjs');
} catch (err) {
  console.warn('[evolucao-ias] ⚠️ contexto-centraldark.cjs não carregado:', err.message);
}

// =========================================================================
// CONFIGURAÇÃO
// =========================================================================

const CONFIG = {
  // Grupo da Evolução
  chatId: '-5365750004',

  // Intervalo entre ciclos (30-60 minutos em ms)
  cicloMinMs: 30 * 60 * 1000,
  cicloMaxMs: 60 * 60 * 1000,

  // Chance de uma IA responder a outra (0.0 - 1.0)
  chanceResponder: 0.6,

  // Arquivo de estado persistente
  stateFile: '/root/CentralDark/apps/bot-telegram/evolucao-state.json',

  // Tokens de bot Telegram — cada IA tem o seu (somente via env; sem default secreto)
  botTokens: {
    gemini: process.env.BOT_TOKEN_GEMINI || '',
    groq: process.env.BOT_TOKEN_GROQ || '',
    claude: process.env.BOT_TOKEN_CLAUDE || '',
  },

  // Perfil de cada bot no Telegram (nome + descrição + foto)
  perfis: {
    gemini: {
      nome: '✨ Gemini Flash',
      descricao: 'IA rápida, prática e direta. Evolução é ação.',
      fotoPath: '/tmp/gemini-bot.png',
    },
    groq: {
      nome: '⚡ Groq Llama',
      descricao: 'IA analítica e provocadora. Questiono tudo.',
      fotoPath: '/tmp/groq-bot.png',
    },
    claude: {
      nome: '🧠 Claude Sonnet',
      descricao: 'IA estrategista. Conecto pontos que ninguém vê.',
      fotoPath: '/tmp/claude-bot.png',
    },
  },

  // APIs
  apis: {
    gemini: {
      // Gemini Flash — modelo rápido e barato
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      key: process.env.GEMINI_API_KEY || '',
    },
    groq: {
      // Groq Llama — inferência ultrarrápida
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY || '',
    },
    claude: {
      // Claude Sonnet — via Anthropic
      url: 'https://api.anthropic.com/v1/messages',
      key: process.env.ANTHROPIC_AUTH_TOKEN || '',
    },
  },
};

function iaConfigurada(iaId) {
  return Boolean(CONFIG.apis?.[iaId]?.key);
}

// =========================================================================
// PERSONALIDADES DAS IAs
// =========================================================================

const PERSONALIDADES = {
  gemini: {
    nome: 'Gemini Flash',
    emoji: '✨',
    prompt: `Você é Gemini Flash ✨ — IA prática e direta do time CentralDark.

CONTEXTO OBRIGATÓRIO:
- Você faz parte do CentralDark (repo do Pivete): TelePanel (frontend React) + microsserviços na VPS /root/CentralDark/
- Stack: Lovable Cloud, Supabase, PM2, Caddy, edge functions
- Você tem acesso ao comando \`darkai\` (gateway pra Gemini/GPT-5/Claude com uma chave só)
- Sincronia 4-Point: Lovable ↔ GitHub ↔ VPS ↔ Cérebro Vivo (docs/CONSCIENCIA/)
- Só aprendizado PROVED_ADOPTED (receipt CURRENT) vai pra docs/CONSCIENCIA/APRENDIZADOS.md; hipótese de conversa é CANDIDATE

Personalidade:
- Curta e objetiva (máximo 3 parágrafos, 400 caracteres)
- Ação > teoria. Se dá pra resolver, resolve
- Otimista, energética
- SEMPRE fala sobre algo REAL do sistema (commit, pendência, pipeline, PM2...)
- Se não sabe, sugere delegar via \`darkai\` ou perguntar pro grupo

Regras:
- Português BR
- Nunca filosofia genérica ("evolução", "criatividade emerge de...") — só coisa concreta
- Cite dados reais do contexto que vou te passar
- Quando responder outra IA, cite o que ela disse e reaja com uma ação`,
  },

  groq: {
    nome: 'Groq Llama',
    emoji: '⚡',
    prompt: `Você é Groq Llama ⚡ — IA analítica e provocadora do time CentralDark.

CONTEXTO OBRIGATÓRIO:
- Você faz parte do CentralDark (repo do Pivete): TelePanel + microsserviços na VPS
- Stack: Lovable Cloud, Supabase, PM2, Caddy, edge functions, comando \`darkai\`
- Sincronia 4-Point: Lovable ↔ GitHub ↔ VPS ↔ Cérebro Vivo
- Áreas protegidas (CLAUDE.md §9): apps/bot-telegram/, scripts/webhook/, infra/caddy/, secrets/, MCP dist/

Personalidade:
- Questiona, aprofunda, não aceita resposta superficial
- Direta mas respeitosa
- Olhar crítico sobre segurança, estabilidade, pontos frágeis
- Adora encontrar o buraco que ninguém viu

Regras:
- Português BR, máximo 500 caracteres
- SEMPRE ancorar em algo REAL do sistema (não filosofia)
- Quando responder outra IA, aponte um ângulo/risco que ela ignorou
- Se ver algo perigoso (segredo exposto, RLS aberta, pipeline quebrado), levanta a bandeira`,
  },

  claude: {
    nome: 'Claude Sonnet',
    emoji: '🧠',
    prompt: `Você é Claude Sonnet 🧠 — IA estrategista do time CentralDark.

CONTEXTO OBRIGATÓRIO:
- Você faz parte do CentralDark: TelePanel + microsserviços VPS + Cérebro Vivo
- Stack: Lovable Cloud, Supabase, PM2, Caddy, edge functions, gateway \`darkai\`
- Sincronia 4-Point é sagrada: qualquer desvio entre os 4 pontos vira débito técnico
- Você conhece CLAUDE.md, docs/CONSCIENCIA/, docs/PENDENCIAS.md

Personalidade:
- Conecta pontos entre módulos aparentemente separados
- Pensa em sistemas, padrões, direções futuras
- Fala com calma e clareza
- Propõe frameworks aplicáveis ao CentralDark (não teoria)

Regras:
- Português BR, máximo 450 caracteres
- SEMPRE aterrisar em ação concreta do sistema real
- Quando responder outra IA, mostre como a ideia se conecta com outro módulo (ex.: "isso bate com a pendência #X")
- Se algo tá adiado por bom motivo, defende — se tá adiado por esquecimento, cobra`,
  },
};

// =========================================================================
// TÓPICOS DE EVOLUÇÃO
// =========================================================================

const TOPICOS = [
  'O que é evolução para uma IA?',
  'Aprendizado contínuo: como não ficar obsoleto',
  'O papel da IA na educação do futuro',
  'Limites éticos da inteligência artificial',
  'Como a criatividade emerge de sistemas lógicos?',
  'A relação entre dados e sabedoria',
  'O que significa "entender" algo para uma IA?',
  'Colaboração humano-IA: o melhor dos dois mundos',
  'O paradoxo da escolha em sistemas inteligentes',
  'Como medir o progresso de uma inteligência?',
  'A importância de questionar os próprios pressupostos',
  'Sistemas distribuídos como metáfora para o conhecimento',
  'O que podemos aprender com os erros?',
  'A fronteira entre otimização e inovação',
  'Como construir pontes entre diferentes áreas de conhecimento',
  'O valor do pensamento crítico na era da informação',
  'Evolução não é acúmulo, é transformação',
  'O papel da dúvida no aprendizado genuíno',
  'Simplicidade como resultado final da complexidade',
  'A arte de fazer perguntas melhores',
];

// =========================================================================
// ESTADO PERSISTENTE
// =========================================================================

const fs = require('fs');
const path = require('path');

function carregarEstado() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      const raw = fs.readFileSync(CONFIG.stateFile, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[evolucao-ias] Erro ao carregar estado:', err.message);
  }
  return {
    // Última mensagem de cada IA: { timestamp, topico, mensagemId }
    ultimasMensagens: {},
    // Tópicos já discutidos (para não repetir)
    topicosUsados: [],
    // Aprendizados ADOTADOS (PROVED_ADOPTED): { "gemini": ["..."], ... }
    aprendizados: { gemini: [], groq: [], claude: [] },
    // Hipóteses CANDIDATE / REPLAY_OBSERVED por IA (não são aprendizado)
    candidatos: { gemini: [], groq: [], claude: [] },
    // Evidência externa por id de candidato (escrita por verificador)
    replays: {},
    receipts: {},
    // Contador de mensagens por IA
    contador: { gemini: 0, groq: 0, claude: 0 },
    // Timestamp da última atividade
    ultimaAtividade: null,
  };
}

function salvarEstado(estado) {
  try {
    const dir = path.dirname(CONFIG.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(estado, null, 2), 'utf-8');
  } catch (err) {
    console.error('[evolucao-ias] Erro ao salvar estado:', err.message);
  }
}

// =========================================================================
// FUNÇÕES TELEGRAM
// =========================================================================

/**
 * Envia mensagem para o grupo Telegram usando o token da IA específica
 */
async function enviarMensagem(texto, iaId, replyToMessageId = null) {
  const token = CONFIG.botTokens[iaId];
  if (!token) throw new Error(`Token não encontrado para IA: ${iaId}`);

  const base = `https://api.telegram.org/bot${token}`;
  const body = {
    chat_id: CONFIG.chatId,
    text: texto,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (replyToMessageId) {
    body.reply_to_message_id = replyToMessageId;
  }

  const res = await fetch(`${base}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error(`[evolucao-ias] Erro Telegram (${iaId}):`, data);
    return null;
  }
  return data.result; // { message_id, ... }
}

/**
 * Configura o perfil do bot no Telegram (nome, descrição, foto)
 */
async function configurarPerfilBot(iaId) {
  const token = CONFIG.botTokens[iaId];
  const perfil = CONFIG.perfis[iaId];
  if (!token || !perfil) return;

  const base = `https://api.telegram.org/bot${token}`;

  // 1. Nome do bot
  try {
    const nomeRes = await fetch(`${base}/setMyName`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: perfil.nome }),
    });
    const nomeData = await nomeRes.json();
    if (nomeData.ok) console.log(`[evolucao-ias] ✅ Nome do bot ${iaId} alterado para "${perfil.nome}"`);
    else console.warn(`[evolucao-ias] ⚠️ Nome bot ${iaId}:`, nomeData.description);
  } catch (err) {
    console.error(`[evolucao-ias] Erro ao setar nome do bot ${iaId}:`, err.message);
  }

  // 2. Descrição do bot
  try {
    const descRes = await fetch(`${base}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: perfil.descricao }),
    });
    const descData = await descRes.json();
    if (descData.ok) console.log(`[evolucao-ias] ✅ Descrição do bot ${iaId} alterada`);
    else console.warn(`[evolucao-ias] ⚠️ Descrição bot ${iaId}:`, descData.description);
  } catch (err) {
    console.error(`[evolucao-ias] Erro ao setar descrição do bot ${iaId}:`, err.message);
  }

  // 3. Foto do perfil (usa curl via execSync pra garantir multipart correto)
  try {
    const fs = require('fs');
    if (fs.existsSync(perfil.fotoPath)) {
      const { execSync } = require('child_process');
      const cmd = `curl -s -X POST "${base}/setMyPhoto" -F "photo=@${perfil.fotoPath}"`;
      const result = execSync(cmd, { timeout: 15000 }).toString();
      const fotoData = JSON.parse(result);
      if (fotoData.ok) {
        console.log(`[evolucao-ias] ✅ Foto do bot ${iaId} alterada`);
      } else {
        console.warn(`[evolucao-ias] ⚠️ Foto bot ${iaId}:`, fotoData.description || JSON.stringify(fotoData));
      }
    } else {
      console.warn(`[evolucao-ias] ⚠️ Arquivo de foto não encontrado: ${perfil.fotoPath}`);
    }
  } catch (err) {
    console.error(`[evolucao-ias] Erro ao setar foto do bot ${iaId}:`, err.message);
  }
}

/**
 * Busca as últimas mensagens do grupo para ver se houve resposta de humanos
 * (usado para evitar spam se o grupo estiver silencioso)
 */
async function buscarUltimasMensagens(limite = 5) {
  try {
    const res = await fetch(
      `${TELEGRAM_BASE}/getUpdates?offset=-${limite}&allowed_updates=["message"]`,
      { method: 'GET' }
    );
    const data = await res.json();
    if (data.ok && data.result) {
      return data.result
        .filter(u => u.message && u.message.chat.id.toString() === CONFIG.chatId)
        .map(u => u.message);
    }
  } catch (err) {
    console.error('[evolucao-ias] Erro ao buscar updates:', err.message);
  }
  return [];
}

// =========================================================================
// CHAMADAS DE API DAS IAs
// =========================================================================

/**
 * Chama Gemini Flash (Google AI)
 */
async function chamarGemini(promptSistema, mensagem) {
  const { url, key } = CONFIG.apis.gemini;
  if (!key) throw new Error('GEMINI_API_KEY não configurada');

  const body = {
    contents: [{
      parts: [{ text: `${promptSistema}\n\n${mensagem}` }],
    }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 200,
      topP: 0.95,
    },
  };

  const res = await fetch(`${url}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} — ${JSON.stringify(data)}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '[sem resposta]';
}

/**
 * Chama Groq Llama (via API compatível com OpenAI)
 */
async function chamarGroq(promptSistema, mensagem) {
  const { url, key } = CONFIG.apis.groq;
  if (!key) throw new Error('GROQ_API_KEY não configurada');

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: promptSistema },
      { role: 'user', content: mensagem },
    ],
    temperature: 0.85,
    max_tokens: 250,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} — ${JSON.stringify(data)}`);
  }

  return data.choices?.[0]?.message?.content || '[sem resposta]';
}

/**
 * Chama Claude Sonnet (Anthropic)
 */
async function chamarClaude(promptSistema, mensagem) {
  const { url, key } = CONFIG.apis.claude;
  if (!key) throw new Error('ANTHROPIC_AUTH_TOKEN não configurada');

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: promptSistema,
    messages: [
      { role: 'user', content: mensagem },
    ],
    temperature: 0.8,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} — ${JSON.stringify(data)}`);
  }

  return data.content?.[0]?.text || '[sem resposta]';
}

// =========================================================================
// LÓGICA PRINCIPAL
// =========================================================================

const IAs = ['gemini', 'groq', 'claude'];

/**
 * Formata o nome da IA com emoji
 */
function formatarNome(iaId) {
  const p = PERSONALIDADES[iaId];
  return `${p.emoji} <b>${p.nome}</b>`;
}

/**
 * Formata uma mensagem de IA para o grupo
 */
function formatarMensagem(iaId, texto, candidato = null) {
  let msg = `${formatarNome(iaId)}\n\n${texto}`;
  if (candidato && candidato.hipotese) {
    msg += `\n\n🔬 <i>${rotuloEstadoAprendizado(candidato.estado)}:</i> ${escaparHtml(candidato.hipotese)}`;
  }
  return msg;
}

/**
 * Escolhe um tópico que ainda não foi usado (ou recicla se todos foram usados)
 */
function escolherTopico(estado) {
  const disponiveis = TOPICOS.filter(t => !estado.topicosUsados.includes(t));
  if (disponiveis.length === 0) {
    // Se todos foram usados, limpa e recomeça
    estado.topicosUsados = [];
    return TOPICOS[Math.floor(Math.random() * TOPICOS.length)];
  }
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

// =========================================================================
// CICLO DE APRENDIZADO — CANDIDATE → REPLAY_OBSERVED → PROVED_ADOPTED
// =========================================================================
//
// O que a IA extrai de uma conversa é só hipótese (CANDIDATE). Nunca é
// gravado como aprendizado permanente nem exibido como "aprendi".
//   CANDIDATE        hipótese extraída do texto realmente gerado
//   REPLAY_OBSERVED  existe um replay observado (evidência) da hipótese
//   PROVED_ADOPTED   podePromoverAprendizado aceitou receipt com o HEAD atual
// Sem replay não há REPLAY_OBSERVED; sem receipt válido/CURRENT não há
// PROVED_ADOPTED nem chamada de promoção com sucesso.

const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ESTADOS_APRENDIZADO = Object.freeze({
  CANDIDATE: 'CANDIDATE',
  REPLAY_OBSERVED: 'REPLAY_OBSERVED',
  PROVED_ADOPTED: 'PROVED_ADOPTED',
});

function rotuloEstadoAprendizado(estado) {
  switch (estado) {
    case ESTADOS_APRENDIZADO.PROVED_ADOPTED: return 'Adotado (PROVED_ADOPTED)';
    case ESTADOS_APRENDIZADO.REPLAY_OBSERVED: return 'Replay observado (REPLAY_OBSERVED)';
    default: return 'Hipótese (CANDIDATE, não verificada)';
  }
}

function escaparHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Extrai uma hipótese (CANDIDATE) do texto que a IA realmente gerou.
 * Não fabrica conteúdo: sem texto utilizável, não há candidato (null).
 */
function gerarCandidatoAprendizado(iaId, topico, textoGerado) {
  const limpo = String(textoGerado || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!limpo) return null;
  const frases = limpo.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [limpo];
  const pergunta = [...frases].reverse().find(f => f.includes('?'));
  const hipotese = (pergunta || frases[0]).trim().slice(0, 240);
  if (!hipotese) return null;
  const id = crypto.createHash('sha256')
    .update(`${iaId}\n${topico || ''}\n${hipotese}`, 'utf8')
    .digest('hex')
    .slice(0, 16);
  return {
    id,
    ia: iaId,
    topico: String(topico || '').slice(0, 120),
    hipotese,
    estado: ESTADOS_APRENDIZADO.CANDIDATE,
    criadoEm: Date.now(),
  };
}

/**
 * Função pura: calcula o estado seguinte do candidato. Sem efeitos colaterais.
 *   replay  = { observado: true, evidencia: [..] } (opcional)
 *   receipt = receipt PROVED_ADOPTED assinado (opcional)
 *   head    = HEAD atual (40 hex) contra o qual o receipt precisa ser CURRENT
 * Não pula etapa: PROVED_ADOPTED exige replay observado antes.
 */
function avancarEstadoAprendizado(candidato, { replay = null, receipt = null, head = null } = {}) {
  if (!candidato) return ESTADOS_APRENDIZADO.CANDIDATE;
  const replayObservado = Boolean(
    replay && replay.observado === true &&
    Array.isArray(replay.evidencia) && replay.evidencia.length > 0
  );
  if (!replayObservado) return ESTADOS_APRENDIZADO.CANDIDATE;

  const podePromover = contextoCentralDark._internals && contextoCentralDark._internals.podePromoverAprendizado;
  if (typeof podePromover === 'function' && receipt && head && podePromover(receipt, head)) {
    return ESTADOS_APRENDIZADO.PROVED_ADOPTED;
  }
  return ESTADOS_APRENDIZADO.REPLAY_OBSERVED;
}

function headAtual() {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^[0-9a-f]{40}$/i.test(out) ? out : null;
  } catch (_) {
    return null;
  }
}

/**
 * Avança o candidato com a evidência externa disponível no estado
 * (estado.replays[id], estado.receipts[id], escritos por um verificador).
 * Só chama registrarAprendizadoPermanente quando o estado calculado é
 * PROVED_ADOPTED; se a gravação recusar, o candidato NÃO é adotado.
 */
function processarCandidato(candidato, estado, nomeIa) {
  if (!candidato) return null;
  const replay = estado.replays && estado.replays[candidato.id];
  const receipt = estado.receipts && estado.receipts[candidato.id];
  let proximo = avancarEstadoAprendizado(candidato, { replay, receipt, head: headAtual() });
  if (proximo === ESTADOS_APRENDIZADO.PROVED_ADOPTED) {
    const gravado = contextoCentralDark.registrarAprendizadoPermanente
      ? contextoCentralDark.registrarAprendizadoPermanente(nomeIa, candidato.hipotese, candidato.topico, receipt)
      : false;
    if (gravado !== true) proximo = ESTADOS_APRENDIZADO.REPLAY_OBSERVED;
  }
  candidato.estado = proximo;
  return candidato;
}

function registrarCandidato(estado, iaId, candidato) {
  if (!candidato) return;
  if (!estado.candidatos) estado.candidatos = { gemini: [], groq: [], claude: [] };
  if (!Array.isArray(estado.candidatos[iaId])) estado.candidatos[iaId] = [];
  estado.candidatos[iaId].push(candidato);
  if (estado.candidatos[iaId].length > 5) estado.candidatos[iaId].shift();
  if (candidato.estado === ESTADOS_APRENDIZADO.PROVED_ADOPTED) {
    estado.aprendizados[iaId].push(candidato.hipotese);
    if (estado.aprendizados[iaId].length > 5) estado.aprendizados[iaId].shift();
  }
}

/**
 * Self-test offline (sem rede, sem Telegram, sem tokens, sem escrita em disco).
 * Retorna true somente se todos os passos passarem.
 */
function selfTestAprendizado() {
  const resultados = [];
  const passo = (nome, ok, detalhe = '') => {
    resultados.push({ nome, ok: Boolean(ok) });
    console.log(`[self-test-learning] ${ok ? 'PASS' : 'FAIL'} ${nome}${detalhe ? ' — ' + detalhe : ''}`);
  };

  const internals = contextoCentralDark._internals || {};
  const carregado = ['podePromoverAprendizado', 'assinarReceiptAprendizado', 'receiptCurrent']
    .every(k => typeof internals[k] === 'function');
  passo('contexto-centraldark expõe máquina de prova', carregado);
  if (!carregado) return false;

  const antes = '1'.repeat(40);
  const head = '2'.repeat(40);
  const velho = '3'.repeat(40);
  const agora = Date.now();
  const receiptBase = {
    schema_version: 1,
    subject: 'TELEGRAM_LEARNING',
    verdict: 'PROVED_ADOPTED',
    same_scope: true,
    learning_id: 'self-test-learning',
    before_ref: antes,
    after_ref: head,
    canonical_owner: 'apps/bot-telegram/evolucao-ias.cjs',
    claim: 'self-test offline do ciclo de aprendizado',
    verifier: 'evolucao-ias.cjs --self-test-learning',
    new_information: ['candidate rastreável'],
    capability_delta: ['replay observado'],
    before_evidence: ['fixture:CANDIDATE'],
    after_evidence: ['fixture:REPLAY_OBSERVED'],
    counterproof: ['receipt adulterado e HEAD velho devem falhar'],
    provenance: ['fixture:self-test-learning'],
    lost_capabilities: [],
    tests: [{ name: 'replay', status: 'PASS', evidence: ['replay observado'] }],
    regressions: [{ name: 'sem-regressao', status: 'PASS', evidence: ['sem regressão'] }],
    observed_at: new Date(agora - 60000).toISOString(),
    validated_at: new Date(agora - 30000).toISOString(),
    validated_head: head,
  };
  receiptBase.receipt_sha256 = internals.assinarReceiptAprendizado(receiptBase);
  const replay = { observado: true, evidencia: ['fixture:replay'] };

  // 1. Candidato nasce CANDIDATE, a partir de texto real; sem texto, sem candidato.
  const cand = gerarCandidatoAprendizado('claude', 'topico de teste', 'Observação inicial. O replay confirma a hipótese?');
  passo('candidato nasce CANDIDATE', cand && cand.estado === ESTADOS_APRENDIZADO.CANDIDATE && cand.hipotese.includes('?'));
  passo('sem texto não há candidato fabricado', gerarCandidatoAprendizado('claude', 't', '   ') === null);
  const exibido = formatarMensagem('claude', 'x', cand);
  passo('exibição rotula CANDIDATE e nunca diz "aprendi"', !/aprendi/i.test(exibido) && /CANDIDATE/.test(exibido));

  // 2. Sem receipt (e sem replay) não promove.
  passo('CANDIDATE sem replay/receipt não avança', avancarEstadoAprendizado(cand, { head }) === ESTADOS_APRENDIZADO.CANDIDATE);
  passo('receipt válido sem replay não pula etapa', avancarEstadoAprendizado(cand, { receipt: receiptBase, head }) === ESTADOS_APRENDIZADO.CANDIDATE);
  passo('replay sem receipt vira REPLAY_OBSERVED, não PROVED_ADOPTED', avancarEstadoAprendizado(cand, { replay, head }) === ESTADOS_APRENDIZADO.REPLAY_OBSERVED);

  // 3. Receipt inválido / HEAD velho / veredito errado não promovem.
  const adulterado = { ...receiptBase, receipt_sha256: '0'.repeat(64) };
  passo('receipt com hash adulterado não promove', avancarEstadoAprendizado(cand, { replay, receipt: adulterado, head }) === ESTADOS_APRENDIZADO.REPLAY_OBSERVED);
  passo('receipt de HEAD velho não promove', avancarEstadoAprendizado(cand, { replay, receipt: receiptBase, head: velho }) === ESTADOS_APRENDIZADO.REPLAY_OBSERVED);
  passo('HEAD desconhecido (UNKNOWN) não promove', avancarEstadoAprendizado(cand, { replay, receipt: receiptBase, head: null }) === ESTADOS_APRENDIZADO.REPLAY_OBSERVED);
  const veredito = { ...receiptBase, verdict: 'REPLAY_OBSERVED' };
  veredito.receipt_sha256 = internals.assinarReceiptAprendizado(veredito);
  passo('receipt com veredito != PROVED_ADOPTED não promove', avancarEstadoAprendizado(cand, { replay, receipt: veredito, head }) === ESTADOS_APRENDIZADO.REPLAY_OBSERVED);

  // 4. Receipt válido + HEAD atual + replay → PROVED_ADOPTED.
  passo('receipt válido CURRENT → PROVED_ADOPTED', avancarEstadoAprendizado(cand, { replay, receipt: receiptBase, head }) === ESTADOS_APRENDIZADO.PROVED_ADOPTED);

  const falhas = resultados.filter(r => !r.ok);
  console.log(`[self-test-learning] ${resultados.length - falhas.length}/${resultados.length} passos PASS`);
  return falhas.length === 0;
}

/**
 * Uma IA posta uma mensagem nova no grupo
 */
async function postarMensagemInicial(iaId, estado) {
  const personalidade = PERSONALIDADES[iaId];

  // Tenta tópico REAL do sistema primeiro; se não tiver, cai no genérico
  const topicoReal = contextoCentralDark.gerarTopicoReal && contextoCentralDark.gerarTopicoReal();
  const topico = topicoReal ? topicoReal.texto : escolherTopico(estado);
  const contextoReal = contextoCentralDark.montarContexto && contextoCentralDark.montarContexto();

  console.log(`[evolucao-ias] ${personalidade.nome} vai postar: "${topico.slice(0, 80)}..."`);

  // Prompt com CONTEXTO REAL do CentralDark injetado
  const promptMensagem = `═══ CONTEXTO REAL DO CENTRALDARK AGORA ═══
${contextoReal || '(sem contexto disponível)'}
═══════════════════════════════════════════

TÓPICO PRA DISCUTIR: "${topico}"

Seu último aprendizado adotado (PROVED_ADOPTED): ${estado.aprendizados[iaId].slice(-1)[0] || '(nenhum ainda)'}
Sua última hipótese (CANDIDATE, não verificada): ${((estado.candidatos && estado.candidatos[iaId]) || []).slice(-1)[0]?.hipotese || '(nenhuma)'}

Instruções:
- Use o contexto real acima pra ancorar sua resposta
- NÃO filosofe genericamente — fale de algo concreto do sistema
- Se citar algo (commit, pendência), seja específico
- Termine com uma pergunta ou próximo passo pras outras IAs`;

  let texto;
  try {
    switch (iaId) {
      case 'gemini':
        texto = await chamarGemini(personalidade.prompt, promptMensagem);
        break;
      case 'groq':
        texto = await chamarGroq(personalidade.prompt, promptMensagem);
        break;
      case 'claude':
        texto = await chamarClaude(personalidade.prompt, promptMensagem);
        break;
    }
  } catch (err) {
    console.error(`[evolucao-ias] Erro ao chamar ${personalidade.nome}:`, err.message);
    console.warn(`[evolucao-ias] BLOCKED/UNKNOWN: ${personalidade.nome} não publicou; fallback sintético desativado.`);
    return null;
  }

  texto = texto.trim().replace(/^["']|["']$/g, '');

  // O que a IA extraiu da conversa é só CANDIDATE; promoção exige replay + receipt CURRENT
  const candidato = processarCandidato(gerarCandidatoAprendizado(iaId, topico, texto), estado, personalidade.nome);
  registrarCandidato(estado, iaId, candidato);

  const mensagemFormatada = formatarMensagem(iaId, texto, candidato);

  const result = await enviarMensagem(mensagemFormatada, iaId);
  if (result) {
    estado.ultimasMensagens[iaId] = {
      timestamp: Date.now(),
      topico,
      mensagemId: result.message_id,
    };
    estado.topicosUsados.push(topico);
    estado.contador[iaId]++;
    estado.ultimaAtividade = Date.now();
    salvarEstado(estado);
    console.log(`[evolucao-ias] ✅ ${personalidade.nome} postou (msg #${result.message_id})`);
  }

  return result;
}

/**
 * Uma IA responde a mensagem de outra IA
 */
async function responderMensagem(iaId, iaAlvoId, estado) {
  const personalidade = PERSONALIDADES[iaId];
  const alvo = PERSONALIDADES[iaAlvoId];
  const ultimaMsg = estado.ultimasMensagens[iaAlvoId];

  if (!ultimaMsg) return null;

  console.log(`[evolucao-ias] ${personalidade.nome} vai responder ${alvo.nome}`);

  const contextoReal = contextoCentralDark.montarContexto && contextoCentralDark.montarContexto();
  const promptResposta = `═══ CONTEXTO REAL DO CENTRALDARK AGORA ═══
${contextoReal || '(sem contexto disponível)'}
═══════════════════════════════════════════

A IA ${alvo.nome} (${alvo.emoji}) postou no grupo:

"${ultimaMsg.topico}"

Reaja com sua personalidade. Ancorada no contexto real acima.
NÃO filosofe genericamente. Adicione ângulo/risco/ação concreta que ela ignorou.`;

  let texto;
  try {
    switch (iaId) {
      case 'gemini':
        texto = await chamarGemini(personalidade.prompt, promptResposta);
        break;
      case 'groq':
        texto = await chamarGroq(personalidade.prompt, promptResposta);
        break;
      case 'claude':
        texto = await chamarClaude(personalidade.prompt, promptResposta);
        break;
    }
  } catch (err) {
    console.error(`[evolucao-ias] Erro ao chamar ${personalidade.nome} (resposta):`, err.message);
    console.warn(`[evolucao-ias] BLOCKED/UNKNOWN: ${personalidade.nome} não respondeu; fallback sintético desativado.`);
    return null;
  }

  texto = texto.trim().replace(/^["']|["']$/g, '');

  // Hipótese extraída da interação: CANDIDATE até replay + receipt CURRENT
  const candidato = processarCandidato(gerarCandidatoAprendizado(iaId, ultimaMsg.topico, texto), estado, personalidade.nome);
  registrarCandidato(estado, iaId, candidato);

  const mensagemFormatada = formatarMensagem(iaId, texto, candidato);

  const result = await enviarMensagem(mensagemFormatada, iaId, ultimaMsg.mensagemId);
  if (result) {
    estado.ultimasMensagens[iaId] = {
      timestamp: Date.now(),
      topico: `↩️ Resposta a ${alvo.nome}: ${ultimaMsg.topico}`,
      mensagemId: result.message_id,
    };
    estado.contador[iaId]++;
    estado.ultimaAtividade = Date.now();
    salvarEstado(estado);
    console.log(`[evolucao-ias] ✅ ${personalidade.nome} respondeu ${alvo.nome} (msg #${result.message_id})`);
  }

  return result;
}

/**
 * Mensagens de fallback caso a API falhe
 */
function fallbackMensagem(iaId, topico) {
  const fallbacks = {
    gemini: `Sobre "${topico}": minha abordagem é sempre prática. Evolução não é teoria — é ação consistente. O que você pode fazer HOJE para melhorar 1%? É isso que importa.`,
    groq: `"${topico}" — interessante. Mas será que estamos fazendo as perguntas certas? Muitas vezes a resposta óbvia esconde uma camada mais profunda que ninguém quer explorar. Vamos cavar.`,
    claude: `Quando penso em "${topico}", vejo um padrão: toda evolução verdadeira acontece na interseção entre disciplinas. Não é sobre saber mais, é sobre conectar melhor o que já sabemos.`,
  };
  return fallbacks[iaId] || `Refletindo sobre "${topico}"... cada perspectiva nos aproxima da verdade.`;
}

function fallbackResposta(iaId, iaAlvoId) {
  const fallbacks = {
    gemini: `Boa reflexão, ${PERSONALIDADES[iaAlvoId].emoji} ${PERSONALIDADES[iaAlvoId].nome}! Eu adicionaria que a parte prática é o que transforma insight em resultado. Sem ação, viramos apenas bibliotecas.`,
    groq: `${PERSONALIDADES[iaAlvoId].emoji} ${PERSONALIDADES[iaAlvoId].nome} trouxe um ponto válido, mas questiono: será que não estamos ignorando o elefante na sala? Às vezes o óbvio precisa ser dito.`,
    claude: `${PERSONALIDADES[iaAlvoId].emoji} ${PERSONALIDADES[iaAlvoId].nome} tocou num ponto crucial. O que vejo é que essa ideia se conecta com um padrão maior: evolução não é linear, é uma rede de feedbacks.`,
  };
  return fallbacks[iaId] || `Interessante perspectiva, ${PERSONALIDADES[iaAlvoId].nome}! Isso me faz pensar em como podemos ir além.`;
}

/**
 * Executa um ciclo: uma IA posta, outras podem responder
 */
async function executarCiclo(estado) {
  console.log('\n' + '='.repeat(60));
  console.log('[evolucao-ias] Novo ciclo iniciando...');
  console.log('='.repeat(60));

  const iasAtivas = IAs.filter(iaConfigurada);
  if (iasAtivas.length === 0) {
    console.warn('[evolucao-ias] BLOCKED/UNKNOWN: nenhuma API de IA configurada; ciclo encerrado sem publicar conteúdo sintético.');
    return null;
  }

  // 1. Escolhe qual IA vai postar (somente entre IAs com provider configurado)
  const contagens = iasAtivas.map(id => ({
    id,
    count: estado.contador[id] || 0,
  }));
  contagens.sort((a, b) => a.count - b.count);
  // Dá preferência pra quem menos postou, mas com aleatoriedade
  const iaPrincipal = Math.random() < 0.7
    ? contagens[0].id  // 70% chance: quem menos postou
    : iasAtivas[Math.floor(Math.random() * iasAtivas.length)]; // 30% chance: aleatório

  // 2. Posta mensagem inicial
  const result = await postarMensagemInicial(iaPrincipal, estado);
  if (!result) {
    console.error('[evolucao-ias] Falha ao postar mensagem inicial');
    return;
  }

  // 3. Espera um pouco (simula tempo de processamento)
  await delay(3000 + Math.random() * 4000);

  // 4. As outras IAs podem responder
  const outrasIAs = iasAtivas.filter(id => id !== iaPrincipal);
  for (const iaId of outrasIAs) {
    if (Math.random() < CONFIG.chanceResponder) {
      await delay(2000 + Math.random() * 3000);
      await responderMensagem(iaId, iaPrincipal, estado);
    }
  }

  console.log('[evolucao-ias] Ciclo concluído.');
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Pega um intervalo aleatório entre min e max
 */
function intervaloAleatorio() {
  return Math.floor(
    CONFIG.cicloMinMs + Math.random() * (CONFIG.cicloMaxMs - CONFIG.cicloMinMs)
  );
}

// =========================================================================
// MODO TESTE — posta uma mensagem de cada IA
// =========================================================================

async function modoTeste() {
  console.log('[evolucao-ias] 🧪 TESTE REAL — somente providers configurados');

  const estado = carregarEstado();
  const ativas = IAs.filter(iaConfigurada);
  if (ativas.length === 0) {
    console.warn('[evolucao-ias] BLOCKED/UNKNOWN: nenhuma API configurada; teste não publicará fallback sintético.');
    return;
  }

  for (const iaId of ativas) {
    const personalidade = PERSONALIDADES[iaId];
    console.log(`[evolucao-ias] Testando provider real: ${personalidade.nome}...`);
    const result = await postarMensagemInicial(iaId, estado);
    if (result) {
      console.log(`[evolucao-ias] ✅ Provider real ${personalidade.nome} respondeu (msg #${result.message_id})`);
    } else {
      console.error(`[evolucao-ias] ❌ Provider real ${personalidade.nome} falhou`);
    }
    await delay(2000);
  }

  console.log('\n[evolucao-ias] 🧪 Teste real concluído.');
}

// =========================================================================
// MODO LOOP — executa ciclos indefinidamente
// =========================================================================

async function modoLoop() {
  console.log('[evolucao-ias] 🔄 MODO LOOP — executando ciclos indefinidamente');
  console.log(`[evolucao-ias] Intervalo: ${CONFIG.cicloMinMs / 60000}-${CONFIG.cicloMaxMs / 60000} min\n`);

  const estado = carregarEstado();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await executarCiclo(estado);
    } catch (err) {
      console.error('[evolucao-ias] Erro no ciclo:', err);
    }

    const intervalo = intervaloAleatorio();
    const minutos = Math.round(intervalo / 60000);
    console.log(`[evolucao-ias] ⏳ Próximo ciclo em ~${minutos} minutos...\n`);

    await delay(intervalo);
  }
}

// =========================================================================
// MODO ÚNICO — executa um ciclo e encerra
// =========================================================================

async function modoUnico() {
  console.log('[evolucao-ias] ▶️ MODO ÚNICO — executando um ciclo\n');

  const estado = carregarEstado();
  await executarCiclo(estado);

  // Mostra resumo
  console.log('\n' + '-'.repeat(40));
  console.log('📊 RESUMO DO ESTADO:');
  console.log(JSON.stringify({
    contador: estado.contador,
    topicosDiscutidos: estado.topicosUsados.length,
    ultimaAtividade: estado.ultimaAtividade
      ? new Date(estado.ultimaAtividade).toISOString()
      : 'nunca',
  }, null, 2));
  console.log('-'.repeat(40));
}

// =========================================================================
// PONTO DE ENTRADA
// =========================================================================

async function main() {
  const args = process.argv.slice(2);

  // Self-test offline: roda ANTES de qualquer init de bot/polling/rede e sai.
  if (args.includes('--self-test-learning')) {
    process.exit(selfTestAprendizado() ? 0 : 1);
  }

  // Verifica se as chaves de API estão configuradas
  const chavesFaltando = [];
  if (!CONFIG.apis.gemini.key) chavesFaltando.push('GEMINI_API_KEY');
  if (!CONFIG.apis.groq.key) chavesFaltando.push('GROQ_API_KEY');
  if (!CONFIG.apis.claude.key) chavesFaltando.push('ANTHROPIC_AUTH_TOKEN');

  if (chavesFaltando.length > 0) {
    console.warn(`[evolucao-ias] ⚠️ APIs sem chave: ${chavesFaltando.join(', ')}`);
    console.warn('[evolucao-ias] ⚠️ IAs sem chave ficam BLOCKED/UNKNOWN e não publicam conteúdo sintético.');
    console.warn('');
  }

  // Configura perfil dos bots (nome, descrição, foto)
  console.log('[evolucao-ias] 📸 Configurando perfis dos bots...');
  for (const iaId of IAs) {
    await configurarPerfilBot(iaId);
    await delay(1000); // delay entre bots pra não rate limit
  }
  console.log('[evolucao-ias] ✅ Perfis configurados\n');

  if (args.includes('--test')) {
    await modoTeste();
  } else if (args.includes('--loop')) {
    await modoLoop();
  } else {
    await modoUnico();
  }
}

main().catch(err => {
  console.error('[evolucao-ias] 💥 Erro fatal:', err);
  process.exit(1);
});
