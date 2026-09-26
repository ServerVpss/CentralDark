/**
 * ============================================================
 * MEMORY TOOLS — RSI Loop ↔ Memória de Longo Prazo
 * CentralDark / Pivete / NÚCLEO
 * ============================================================
 * 
 * Contrato: 03-memoria/CONTRATO-RSI-LOOP.md
 * Fonte da verdade: arquivos (Markdown + JSON) + fingerprint
 * Modo: append-only
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const MEMORY_ROOT = process.env.MEMORY_ROOT || path.resolve(__dirname, '..');
const GLOBAL_LEDGER_PATH = path.join(MEMORY_ROOT, 'ledger', 'xp-ledger-global.json');
const SEMANTICA_PATH = path.join(MEMORY_ROOT, 'semantica');
const EPISODICA_PATH = path.join(MEMORY_ROOT, 'episodica', 'ciclos');
const SKILLS_PATH = path.join(MEMORY_ROOT, 'skills');

// ============================================================
// HELPERS
// ============================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJSON(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[memory] Erro ao ler JSON: ${filePath}`, err.message);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function appendJSONL(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf8');
}

/**
 * Gera fingerprint determinístico
 * FINGERPRINT = SHA256(MISSION_ID + causa_raiz + teste + evidência + HEAD_SHA)
 */
function generateFingerprint({ missionId, causaRaiz = '', teste = '', evidencia = '', headSha = '' }) {
  const payload = [missionId, causaRaiz, teste, evidencia, headSha].join('|');
  return 'sha256:' + crypto.createHash('sha256').update(payload).digest('hex');
}

function nowISO() {
  return new Date().toISOString();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ============================================================
// TOOL 1: check_fingerprint
// ============================================================

/**
 * Verifica se um fingerprint já existe no Ledger Global.
 * Retorna { exists: boolean, entry?: object }
 */
function checkFingerprint(fingerprint) {
  const ledger = readJSON(GLOBAL_LEDGER_PATH, { entries: [] });
  const found = (ledger.entries || []).find(e => e.fingerprint === fingerprint);

  return {
    exists: !!found,
    entry: found || null,
    message: found
      ? `EVENTO_JA_REGISTRADO — XP_GAINED=0`
      : `Fingerprint novo — pode conceder XP`
  };
}

// ============================================================
// TOOL 2: read_memory
// ============================================================

/**
 * Lê memória de longo prazo.
 * 
 * @param {object} params
 * @param {'padroes'|'causas-raiz'|'guardrails-aprendidos'|'licoes'|'episodica'|'skill'|'ledger'} params.tipo
 * @param {string} [params.skill] - obrigatório se tipo === 'skill'
 * @param {string} [params.query] - filtro textual simples
 * @param {number} [params.limit=10]
 */
function readMemory({ tipo, skill = null, query = null, limit = 10 }) {
  let basePath;

  switch (tipo) {
    case 'padroes':
      basePath = path.join(SEMANTICA_PATH, 'padroes');
      break;
    case 'causas-raiz':
      basePath = path.join(SEMANTICA_PATH, 'causas-raiz');
      break;
    case 'guardrails-aprendidos':
      basePath = path.join(SEMANTICA_PATH, 'guardrails-aprendidos');
      break;
    case 'licoes':
      basePath = path.join(SEMANTICA_PATH, 'licoes');
      break;
    case 'episodica':
      basePath = EPISODICA_PATH;
      break;
    case 'skill':
      if (!skill) throw new Error('readMemory(tipo=skill) exige o parâmetro skill');
      basePath = path.join(SKILLS_PATH, skill);
      break;
    case 'ledger':
      return {
        global: readJSON(GLOBAL_LEDGER_PATH, { entries: [] }),
        local: skill
          ? readJSON(path.join(SKILLS_PATH, skill, 'xp-ledger.json'), null)
          : null
      };
    default:
      throw new Error(`Tipo de memória inválido: ${tipo}`);
  }

  if (!fs.existsSync(basePath)) {
    return { items: [], total: 0 };
  }

  const files = fs.readdirSync(basePath)
    .filter(f => f.endsWith('.md') || f.endsWith('.json'))
    .filter(f => f !== '_index.md' && f !== 'README.md');

  let items = files.map(file => {
    const full = path.join(basePath, file);
    const content = fs.readFileSync(full, 'utf8');
    return {
      file,
      path: full,
      content: content.slice(0, 4000), // evita estourar contexto
      preview: content.slice(0, 300)
    };
  });

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(i =>
      i.content.toLowerCase().includes(q) || i.file.toLowerCase().includes(q)
    );
  }

  return {
    items: items.slice(0, limit),
    total: items.length,
    tipo,
    skill: skill || null
  };
}

// ============================================================
// TOOL 3: write_memory
// ============================================================

/**
 * Escreve na memória de longo prazo (append-only / novo arquivo).
 * 
 * @param {object} params
 * @param {'padrao'|'causa-raiz'|'guardrail'|'licao'|'ciclo'} params.tipo
 * @param {string} params.titulo
 * @param {string} params.conteudo - corpo markdown
 * @param {string} params.missionId
 * @param {string} params.skillOrigem
 * @param {string} [params.causaRaiz]
 * @param {string} [params.teste]
 * @param {string} [params.evidencia]
 * @param {string} [params.headSha]
 * @param {object} [params.extraFrontmatter]
 */
function writeMemory({
  tipo,
  titulo,
  conteudo,
  missionId,
  skillOrigem,
  causaRaiz = '',
  teste = '',
  evidencia = '',
  headSha = '',
  extraFrontmatter = {}
}) {
  const fingerprint = generateFingerprint({
    missionId,
    causaRaiz,
    teste,
    evidencia,
    headSha
  });

  // 1. Verificar duplicação
  const check = checkFingerprint(fingerprint);
  if (check.exists) {
    return {
      success: false,
      reason: 'EVENTO_JA_REGISTRADO',
      fingerprint,
      xp_gained: 0,
      message: check.message
    };
  }

  // 2. Determinar pasta e nome do arquivo
  const tipoMap = {
    'padrao': path.join(SEMANTICA_PATH, 'padroes'),
    'causa-raiz': path.join(SEMANTICA_PATH, 'causas-raiz'),
    'guardrail': path.join(SEMANTICA_PATH, 'guardrails-aprendidos'),
    'licao': path.join(SEMANTICA_PATH, 'licoes'),
    'ciclo': EPISODICA_PATH
  };

  const targetDir = tipoMap[tipo];
  if (!targetDir) {
    throw new Error(`Tipo de escrita inválido: ${tipo}`);
  }

  ensureDir(targetDir);

  const slug = slugify(titulo);
  const filename = `${new Date().toISOString().slice(0, 10)}-${slug}.md`;
  const filePath = path.join(targetDir, filename);

  // 3. Montar frontmatter + conteúdo
  const frontmatter = {
    title: titulo,
    tipo,
    fingerprint,
    skill_origem: skillOrigem,
    mission_id: missionId,
    created: nowISO().slice(0, 10),
    ...extraFrontmatter
  };

  const yaml = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n');

  const fullContent = `---\n${yaml}\n---\n\n# ${titulo}\n\n${conteudo}\n`;

  fs.writeFileSync(filePath, fullContent, 'utf8');

  return {
    success: true,
    fingerprint,
    file: filePath,
    tipo,
    message: `Memória gravada com sucesso: ${filename}`
  };
}

// ============================================================
// TOOL 4: update_ledger (local + global)
// ============================================================

/**
 * Atualiza ledger local da skill + ledger global.
 * Só concede XP se fingerprint for novo.
 */
function updateLedger({
  skill,
  event,
  xp,
  missionId,
  causaRaiz = '',
  teste = '',
  evidencia = '',
  headSha = '',
  meta = {}
}) {
  const fingerprint = generateFingerprint({
    missionId,
    causaRaiz,
    teste,
    evidencia,
    headSha
  });

  const check = checkFingerprint(fingerprint);
  if (check.exists) {
    return {
      success: false,
      reason: 'EVENTO_JA_REGISTRADO',
      fingerprint,
      xp_gained: 0
    };
  }

  const timestamp = nowISO();
  const entry = {
    event,
    xp,
    timestamp,
    fingerprint,
    skill,
    mission_id: missionId,
    ...meta
  };

  // --- Ledger Local ---
  const localPath = path.join(SKILLS_PATH, skill, 'xp-ledger.json');
  let local = readJSON(localPath, {
    candidate_ref: `${skill}@unknown`,
    level: 1,
    tier: 'OPACA',
    total_xp: 0,
    history: [],
    current_level: 1,
    xp_to_next_level: 100
  });

  local.history = local.history || [];
  local.history.push(entry);
  local.total_xp = Math.max(0, (local.total_xp || 0) + xp);

  // Cálculo simples de level (fórmula do sistema: ceil(100 * 1.15^(LEVEL-1)))
  let level = 1;
  let xpAcc = 0;
  while (true) {
    const needed = Math.ceil(100 * Math.pow(1.15, level - 1));
    if (xpAcc + needed > local.total_xp) break;
    xpAcc += needed;
    level++;
  }
  local.current_level = level;
  local.level = level;
  local.xp_to_next_level = Math.ceil(100 * Math.pow(1.15, level - 1)) - (local.total_xp - xpAcc);

  // Tier
  if (local.total_xp >= 50) local.tier = 'OMNIVISOR';
  else if (local.total_xp >= 30) local.tier = 'PRISMATICA';
  else if (local.total_xp >= 10) local.tier = 'MONOCULO';
  else local.tier = 'OPACA';

  writeJSON(localPath, local);

  // --- Ledger Global ---
  let global = readJSON(GLOBAL_LEDGER_PATH, {
    version: '1.0.0',
    updated_at: timestamp,
    total_xp_global: 0,
    entries: [],
    policy: { mode: 'append-only', checksum: 'sha256', dedup_by: 'fingerprint', min_xp: 0 }
  });

  global.entries = global.entries || [];
  global.entries.push(entry);
  global.total_xp_global = (global.total_xp_global || 0) + xp;
  global.updated_at = timestamp;

  writeJSON(GLOBAL_LEDGER_PATH, global);

  return {
    success: true,
    fingerprint,
    xp_gained: xp,
    new_total_xp: local.total_xp,
    level: local.current_level,
    tier: local.tier,
    message: `XP +${xp} concedido. Total: ${local.total_xp} | Level ${local.current_level} (${local.tier})`
  };
}

// ============================================================
// TOOL 5: emit_xp_receipt
// ============================================================

function emitXpReceipt({ skill, fingerprint, xp, level, tier, event }) {
  const receipt = {
    type: 'XP_RECEIPT',
    skill,
    event,
    fingerprint,
    xp,
    level,
    tier,
    timestamp: nowISO()
  };

  // Também grava um recibo legível na pasta da skill
  const receiptDir = path.join(SKILLS_PATH, skill, 'recibos');
  ensureDir(receiptDir);
  const receiptFile = path.join(receiptDir, `${Date.now()}-${slugify(event)}.json`);
  writeJSON(receiptFile, receipt);

  return receipt;
}

// ============================================================
// TOOL 6: run_memory_sync (conveniência)
// ============================================================

/**
 * Fluxo completo e seguro de gravação + XP:
 * 1. Gera fingerprint
 * 2. Verifica duplicação
 * 3. Escreve memória semântica/episódica (se pedido)
 * 4. Atualiza ledgers
 * 5. Emite recibo
 */
function runMemorySync({
  tipoMemoria = null,   // 'padrao' | 'causa-raiz' | 'guardrail' | 'licao' | 'ciclo' | null
  titulo = null,
  conteudo = null,
  skill,
  event,
  xp = 0,
  missionId,
  causaRaiz = '',
  teste = '',
  evidencia = '',
  headSha = '',
  extraFrontmatter = {}
}) {
  const fingerprint = generateFingerprint({ missionId, causaRaiz, teste, evidencia, headSha });

  // 1. Check
  const check = checkFingerprint(fingerprint);
  if (check.exists) {
    return {
      success: false,
      reason: 'EVENTO_JA_REGISTRADO',
      fingerprint,
      xp_gained: 0,
      steps: ['check_fingerprint']
    };
  }

  const steps = ['check_fingerprint'];
  let writeResult = null;

  // 2. Write memory (opcional)
  if (tipoMemoria && titulo && conteudo) {
    writeResult = writeMemory({
      tipo: tipoMemoria,
      titulo,
      conteudo,
      missionId,
      skillOrigem: skill,
      causaRaiz,
      teste,
      evidencia,
      headSha,
      extraFrontmatter
    });
    steps.push('write_memory');

    if (!writeResult.success) {
      return { ...writeResult, steps };
    }
  }

  // 3. Update ledger
  const ledgerResult = updateLedger({
    skill,
    event,
    xp,
    missionId,
    causaRaiz,
    teste,
    evidencia,
    headSha
  });
  steps.push('update_ledger');

  // 4. Emit receipt
  const receipt = emitXpReceipt({
    skill,
    fingerprint,
    xp: ledgerResult.xp_gained || 0,
    level: ledgerResult.level,
    tier: ledgerResult.tier,
    event
  });
  steps.push('emit_xp_receipt');

  return {
    success: true,
    fingerprint,
    xp_gained: ledgerResult.xp_gained,
    level: ledgerResult.level,
    tier: ledgerResult.tier,
    write: writeResult,
    receipt,
    steps
  };
}

// ============================================================
// EXPORTS — interface dos tools
// ============================================================

module.exports = {
  // Tools principais
  check_fingerprint: checkFingerprint,
  read_memory: readMemory,
  write_memory: writeMemory,
  update_ledger: updateLedger,
  emit_xp_receipt: emitXpReceipt,
  run_memory_sync: runMemorySync,

  // Helpers úteis
  generateFingerprint,
  MEMORY_ROOT
};
