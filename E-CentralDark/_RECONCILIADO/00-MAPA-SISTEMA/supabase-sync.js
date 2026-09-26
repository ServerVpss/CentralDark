/**
 * Supabase Sync Bridge
 * 
 * Roda na VPS. Monitora instâncias no Supabase e sincroniza status/QR com WuzAPI.
 * 
 * Carrega variáveis de:
 *   1. /root/Multizap/secrets/wabot.env (cofre existente na VPS)
 *   2. .env local (fallback)
 *   3. Variáveis de ambiente do PM2
 * 
 * Variáveis necessárias (NÃO commitar valores):
 *   SUPABASE_URL          - URL do projeto Supabase
 *   SUPABASE_SERVICE_KEY  - Service role key
 *   WUZAPI_URL            - URL do WuzAPI (default: http://127.0.0.1:8081)
 *   WUZAPI_TOKEN          - Token do WuzAPI
 *   SYNC_INTERVAL_MS      - Intervalo de polling (default: 10000)
 */

// Carregar envs: primeiro o cofre da VPS, depois .env local como fallback
const path = require('path');
try { require('dotenv').config({ path: '/root/Multizap/secrets/wabot.env', override: false }); } catch(e) {}
try { require('dotenv').config({ path: path.join(__dirname, '.env'), override: false }); } catch(e) {}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const WUZAPI_URL = process.env.WUZAPI_URL || 'http://127.0.0.1:8081';
const WUZAPI_TOKEN = process.env.WUZAPI_TOKEN || process.env.WUZAPI_ADMIN_TOKEN || '';
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL_MS || '10000', 10);

const { logTimeBR } = require('../lib/log-time.cjs');
function log(level, msg) {
  console.log(`[${logTimeBR()}] [${level}] [supabase-sync] ${msg}`);
}

async function supabaseREST(method, pathStr, body) {
  const url = `${SUPABASE_URL}/rest/v1/${pathStr}`;
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${pathStr}: ${res.status} ${text}`);
  }
  return res.json();
}

async function wuzapiCall(method, pathStr, body, customToken = null, isAdmin = false) {
  const url = `${WUZAPI_URL}${pathStr}`;
  
  // Se for admin, passa via 'Authorization'. Se for normal, via 'Token' ou o customToken da instancia
  const headers = { 'Content-Type': 'application/json' };
  
  if (isAdmin) {
    headers['Authorization'] = WUZAPI_TOKEN;
  } else {
    headers['Token'] = customToken || WUZAPI_TOKEN;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(url, opts);
  
  if (!res.ok) {
     const txt = await res.text().catch(()=>'');
     throw new Error(`HTTP ${res.status} - ${txt}`);
  }
  
  return res.json().catch(() => ({}));
}

async function updateInstance(id, updates) {
  return supabaseREST('PATCH', `whatsapp_connections?id=eq.${id}`, updates);
}

async function syncInstance(instance) {
  try {
    // 1. Precisamos garantir que a instância existe na WuzAPI.
    // O id do supabae é mapeado para a wuzapi_instance_id
    // Extrai o identificador fiel (O Gateway deve sempre rastrear via connection_id)
    const wuzapiId = instance.connection_id || instance.wuzapi_instance_id || instance.id;
    let statusData;
    let instanceToken = instance.wuzapi_token || null;

    // 2. Se o backend ainda não tem um token da WuzAPI, devemos criar o user lá via porta Admin
    if (!instanceToken) {
       try {
         log('INFO', `${instance.name}: registrando user na WuzAPI...`);
         // Alguns forks do WuzAPI usam POST /user para criar usuarios, ou GET /admin/users para listar
         let createRes = null;
         try {
           createRes = await wuzapiCall('POST', '/user', { name: wuzapiId }, null, true);
         } catch(e) {
           createRes = await wuzapiCall('POST', '/admin/users', { name: wuzapiId }, null, true);
         }
         if (createRes && createRes.token) {
           instanceToken = createRes.token;
         } else if (createRes && createRes.Token) {
           instanceToken = createRes.Token;
         }

         if (instanceToken) {
           // Guarda o token gerado no Supabase para nunca perdê-lo
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
           
           // SOLUÇÃO DE SPLIT-BRAIN: O Gateway Node (proxy) precisa desse token no arquivo de cache local
           // para que a rota /qr e /status funcionem quando o frontend chamar a API do proxy.
           try {
             const fs = require('fs');
             const path = require('path');
             const connPath = '/root/Multizap/gateway/data/connections.json';
             if (fs.existsSync(connPath)) {
               const state = JSON.parse(fs.readFileSync(connPath, 'utf8'));
               const existing = state.connections.find(c => c.connection_id === wuzapiId || c.id === wuzapiId);
               if (existing) {
                 existing.wuzapi_token = instanceToken;
               } else {
                 state.connections.push({
                   connection_id: wuzapiId,
                   workspace_id: instance.workspace_id,
                   name: instance.name,
                   provider: 'wuzapi',
                   status: 'disconnected',
                   wuzapi_instance_id: wuzapiId,
                   wuzapi_token: instanceToken,
                   created_at: new Date().toISOString(),
                   updated_at: new Date().toISOString()
                 });
               }
               fs.writeFileSync(connPath, JSON.stringify(state, null, 2), 'utf8');
               log('INFO', `${instance.name}: token injetado no connections.json do Gateway.`);
             }
           } catch(e) {
             log('WARN', `Falha ao injetar token no connections.json do Gateway: ${e.message}`);
           }
         } else {
           throw new Error("Token não retornado pela WuzAPI");
         }
       } catch (err) {
         log('WARN', `${instance.name}: erro ao registrar user na WuzAPI: ${err.message}`);
         return; // Nao tenta conectar se nao tem token
       }
    }

    // 3. Avaliando Status Real na WuzAPI
    try {
      statusData = await wuzapiCall('GET', `/session/status`, null, instanceToken);
    } catch (err) {
      // 401 ou 500. Se 401, a sessão não tá montada no websocket do GO.
      log('INFO', `${instance.name}: iniciando socket /session/connect...`);
      try {
        const events = ['Message', 'ReadReceipt', 'HistorySync', 'ChatPresence'];
        try {
          await wuzapiCall('POST', '/session/connect', { Subscribe: events, events: events.join(','), Immediate: true }, instanceToken);
        } catch(e) {
          if (e.message.includes('405')) {
             await wuzapiCall('GET', '/session/connect?Immediate=true', null, instanceToken);
          } else throw e;
        }
        // Tenta buscar o QR (que também devolve status se não logado) ou o status novamente
        statusData = await wuzapiCall('GET', `/session/status`, null, instanceToken);
      } catch (createErr) {
        log('WARN', `${instance.name}: falha socket: ${createErr.message}`);
        
        // Se a chamada explodiu (ex: token inválido de vez), marca desconectado
        await updateInstance(instance.id, { status: 'disconnected', qr_code_base64: '' });
        return;
      }
    }
    
    // 4. Se ele tá connectado, mas precisa de QR Code (state = unpaired)
    if (statusData && (statusData.state === 'unpaired' || statusData.state === 'UNPAIRED')) {
       try {
         const qrRes = await wuzapiCall('GET', '/session/qr', null, instanceToken);
         if (qrRes && (qrRes.qrcode || qrRes.qr)) {
            statusData.qrcode = qrRes.qrcode || qrRes.qr;
         }
       } catch(e) {
         // ignora, mantem status normal
       }
    }

    if (!statusData) return;

    const updates = {
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    // WuzAPI Whatsmeow returns state
    const realState = String(statusData.state || statusData.status || '').toLowerCase();
    const isConnected = realState === 'connected' || realState === 'logged_in' || realState === 'loggedin' || statusData.connected === true;

    if (isConnected) {
      updates.status = 'connected';
      updates.qr_code = '';
      if (statusData.phone || statusData.jid) {
        updates.phone = (statusData.phone || statusData.jid || '').replace('@s.whatsapp.net', '');
      }
      // updates.wuzapi_instance_id = wuzapiId; // Remover se nao existir coluna nativa. Ou salvar no jsonb session_data
    } else if (statusData.qrcode || statusData.qr) {
      updates.status = 'qr_code';
      updates.qr_code = statusData.qrcode || statusData.qr || '';
    } else {
      updates.status = 'disconnected';
    }

    const changed = updates.status !== instance.status ||
                    updates.qr_code !== instance.qr_code ||
                    updates.phone !== instance.phone;

    if (changed) {
      await updateInstance(instance.id, updates);
      log('OK', `${instance.name}: ${instance.status} → ${updates.status}`);
    }
  } catch (err) {
    log('ERROR', `Sync ${instance.name}: ${err.message}`);
  }
}

async function syncLoop() {
  try {
    const instances = await supabaseREST('GET', 'whatsapp_connections?select=*&order=created_at.asc');
    for (const inst of instances) {
      await syncInstance(inst);
    }
  } catch (err) {
    log('ERROR', `Loop: ${err.message}`);
  }
}

function start() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('FATAL', 'SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos.');
    log('INFO', 'Verificar /root/Multizap/secrets/wabot.env ou .env local');
    process.exit(1);
  }

  log('START', `Sync Bridge (intervalo: ${SYNC_INTERVAL}ms)`);
  log('INFO', `Supabase: ${SUPABASE_URL}`);
  log('INFO', `WuzAPI: ${WUZAPI_URL}`);

  syncLoop();
  setInterval(syncLoop, SYNC_INTERVAL);
}

if (require.main === module) start();
module.exports = { start, syncLoop, syncInstance };
