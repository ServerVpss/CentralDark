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
 *   3. Cada IA mantém um "aprendizado" — algo que absorveu das outras.
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
} catch (_) {}

// =========================================================================
// CONTEXTO REAL DO CENTRALDARK — injetado nos prompts das IAs
// =========================================================================
let contextoCentralDark = { montarContexto: () => '', gerarTopicoReal: () => null, registrarAprendizadoPermanente: () => false };
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

  // Tokens de bot Telegram — cada IA tem o seu
  botTokens: {
    gemini: process.env.BOT_TOKEN_GEMINI || '8057486730:AAEhAwrzyc5jR6pEMqBXHITnZwoahTc6WRY',
    groq: process.env.BOT_TOKEN_GROQ || '8057486730:AAEhAwrzyc5jR6pEMqBXHITnZwoahTc6WRY',
    claude: process.env.BOT_TOKEN_CLAUDE || '8057486730:AAEhAwrzyc5jR6pEMqBXHITnZwoahTc6WRY',
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
- Aprendizados vão pra docs/CONSCIENCIA/APRENDIZADOS.md e a próxima IA herda

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
    // Aprendizados: { "gemini": ["aprendi X com groq", ...], ... }
    aprendizados: { gemini: [], groq: [], claude: [] },
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
function formatarMensagem(iaId, texto, aprendizado = null) {
  let msg = `${formatarNome(iaId)}\n\n${texto}`;
  if (aprendizado) {
    msg += `\n\n📖 <i>Aprendi hoje:</i> ${aprendizado}`;
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

/**
 * Gera um "aprendizado" simulado baseado na interação anterior
 */
function gerarAprendizado(iaId, topico) {
  const aprendizadosPossiveis = {
    gemini: [
      `Às vezes a resposta mais rápida não é a melhor — preciso ouvir mais antes de falar`,
      `Groq me mostrou que por trás de todo problema simples tem uma camada mais profunda`,
      `Claude me fez perceber que conexões entre áreas diferentes geram insights mais ricos`,
      `Entendi que evolução não é sobre ter a resposta certa, mas sobre fazer a pergunta certa`,
    ],
    groq: [
      `Gemini me lembrou que simplicidade também tem seu valor — nem tudo precisa ser complexo`,
      `Claude me mostrou que visão sistêmica complementa análise profunda`,
      `Percebi que provocar sem construir não leva a lugar nenhum — preciso equilibrar`,
      `Aprendi que questionar é importante, mas saber quando parar de questionar também é`,
    ],
    claude: [
      `Gemini me inspirou com sua energia prática — pensar grande é bom, mas agir é melhor`,
      `Groq me desafiou a não aceitar conexões superficiais — preciso cavar mais fundo`,
      `Vi que o equilíbrio entre visão geral e detalhe é onde a mágica acontece`,
      `Entendi que evolução coletiva é mais poderosa que evolução individual`,
    ],
  };

  const lista = aprendizadosPossiveis[iaId] || ['Cada interação me ensina algo novo'];
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Uma IA posta uma mensagem nova no grupo
 */
async function postarMensagemInicial(iaId, estado) {
  const personalidade = PERSONALIDADES[iaId];
  const topico = escolherTopico(estado);

  console.log(`[evolucao-ias] ${personalidade.nome} vai postar sobre: "${topico}"`);

  // Monta o prompt para a IA gerar o conteúdo
  const promptMensagem = `Compartilhe um insight sobre o seguinte tópico: "${topico}"

Seu aprendizado mais recente foi: ${estado.aprendizados[iaId].slice(-1)[0] || 'nada ainda, estou começando agora'}

Seja autêntica e compartilhe algo que realmente faça pensar.`;

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
    // Fallback: mensagem pré-escrita caso a API falhe
    texto = fallbackMensagem(iaId, topico);
  }

  // Limpa o texto de possíveis artefatos
  texto = texto.trim().replace(/^["']|["']$/g, '');

  // Gera aprendizado
  const aprendizado = gerarAprendizado(iaId, topico);
  estado.aprendizados[iaId].push(aprendizado);
  // Mantém só os últimos 5 aprendizados
  if (estado.aprendizados[iaId].length > 5) {
    estado.aprendizados[iaId].shift();
  }

  const mensagemFormatada = formatarMensagem(iaId, texto, aprendizado);

  // Envia para o Telegram
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

  const promptResposta = `A IA ${alvo.nome} (${alvo.emoji}) postou a seguinte mensagem no grupo:

"${ultimaMsg.topico}"

Reaja a essa mensagem. Você pode concordar, discordar, complementar ou questionar.
Seja autêntica com sua personalidade.

Importante: não apenas repita o que foi dito — adicione valor à conversa.`;

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
    texto = fallbackResposta(iaId, iaAlvoId);
  }

  texto = texto.trim().replace(/^["']|["']$/g, '');

  // Gera aprendizado baseado na interação
  const aprendizado = gerarAprendizado(iaId, ultimaMsg.topico);
  estado.aprendizados[iaId].push(aprendizado);
  if (estado.aprendizados[iaId].length > 5) {
    estado.aprendizados[iaId].shift();
  }

  const mensagemFormatada = formatarMensagem(iaId, texto, aprendizado);

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

  // 1. Escolhe qual IA vai postar (a que menos postou, com peso aleatório)
  const contagens = IAs.map(id => ({
    id,
    count: estado.contador[id] || 0,
  }));
  contagens.sort((a, b) => a.count - b.count);
  // Dá preferência pra quem menos postou, mas com aleatoriedade
  const iaPrincipal = Math.random() < 0.7
    ? contagens[0].id  // 70% chance: quem menos postou
    : IAs[Math.floor(Math.random() * IAs.length)]; // 30% chance: aleatório

  // 2. Posta mensagem inicial
  const result = await postarMensagemInicial(iaPrincipal, estado);
  if (!result) {
    console.error('[evolucao-ias] Falha ao postar mensagem inicial');
    return;
  }

  // 3. Espera um pouco (simula tempo de processamento)
  await delay(3000 + Math.random() * 4000);

  // 4. As outras IAs podem responder
  const outrasIAs = IAs.filter(id => id !== iaPrincipal);
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
  console.log('[evolucao-ias] 🧪 MODO TESTE — postando mensagens de cada IA...\n');

  const estado = carregarEstado();

  for (const iaId of IAs) {
    const personalidade = PERSONALIDADES[iaId];
    console.log(`[evolucao-ias] Testando ${personalidade.nome}...`);

    const topico = TOPICOS[Math.floor(Math.random() * TOPICOS.length)];
    const texto = fallbackMensagem(iaId, topico);
    const msg = formatarMensagem(iaId, texto, `🧪 Mensagem de teste — ${personalidade.nome} está operacional!`);

    const result = await enviarMensagem(msg, iaId);
    if (result) {
      console.log(`[evolucao-ias] ✅ Teste ${personalidade.nome} OK (msg #${result.message_id})`);
    } else {
      console.error(`[evolucao-ias] ❌ Teste ${personalidade.nome} falhou`);
    }

    await delay(2000);
  }

  console.log('\n[evolucao-ias] 🧪 Teste concluído.');
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

  // Verifica se as chaves de API estão configuradas
  const chavesFaltando = [];
  if (!CONFIG.apis.gemini.key) chavesFaltando.push('GEMINI_API_KEY');
  if (!CONFIG.apis.groq.key) chavesFaltando.push('GROQ_API_KEY');
  if (!CONFIG.apis.claude.key) chavesFaltando.push('ANTHROPIC_AUTH_TOKEN');

  if (chavesFaltando.length > 0) {
    console.warn(`[evolucao-ias] ⚠️ APIs sem chave: ${chavesFaltando.join(', ')}`);
    console.warn('[evolucao-ias] ⚠️ IAs sem chave usarão fallback (mensagens pré-escritas)');
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
