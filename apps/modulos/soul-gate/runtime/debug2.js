const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// CARREGAMENTO DO CANÔNICO (fonte da verdade)
// ============================================================

const REPO_ROOT = path.resolve(__dirname, '../../..');
const SOUL_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md');
const ADMIN_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/ADMINISTRAVEIS.json');
const CONTRACT_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');
const FREQ_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md');
const AGENTS_PATH = path.join(REPO_ROOT, 'AGENTS.md');
const LEIA_ME_PATH = path.join(REPO_ROOT, 'LEIA-ME-IA.md');

console.log('DEBUG: REPO_ROOT =', REPO_ROOT);
console.log('DEBUG: ADMIN_PATH =', ADMIN_PATH);
console.log('DEBUG: ADMIN_PATH exists =', fs.existsSync(ADMIN_PATH));

let CANONICAL_CACHE = null;
let CACHE_MTIME = 0;

function loadCanonical() {
  console.log('DEBUG: loadCanonical called');
  const files = [SOUL_PATH, ADMIN_PATH, CONTRACT_PATH, FREQ_PATH, AGENTS_PATH, LEIA_ME_PATH];
  const newest = Math.max(...files.map(f => {
    try { 
      const exists = fs.existsSync(f);
      const time = exists ? fs.statSync(f).mtimeMs : 0;
      console.log(`DEBUG: ${f} -> exists=${exists}, mtime=${time}`);
      return time;
    } catch { 
      console.log(`DEBUG: ${f} -> stat error`);
      return 0; 
    }
  }));
  console.log('DEBUG: newest mtime =', newest);
  
  if (CANONICAL_CACHE && newest <= CACHE_MTIME) {
    console.log('DEBUG: returning cached canon');
    return CANONICAL_CACHE;
  }
  
  console.log('DEBUG: loading fresh canon');
  const canon = {
    soul: fs.existsSync(SOUL_PATH) ? fs.readFileSync(SOUL_PATH, 'utf8') : '',
    administraveis: fs.existsSync(ADMIN_PATH) ? JSON.parse(fs.readFileSync(ADMIN_PATH, 'utf8')) : {},
    contrato: fs.existsSync(CONTRACT_PATH) ? JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8')) : {},
    frequencias: fs.existsSync(FREQ_PATH) ? fs.readFileSync(FREQ_PATH, 'utf8') : '',
    agents: fs.existsSync(AGENTS_PATH) ? fs.readFileSync(AGENTS_PATH, 'utf8') : '',
    leiaMe: fs.existsSync(LEIA_ME_PATH) ? fs.readFileSync(LEIA_ME_PATH, 'utf8') : '',
  };
  
  console.log('DEBUG: canon.administraveis =', typeof canon.administraveis);
  if (canon.administraveis) {
    console.log('DEBUG: canon.administraveis keys =', Object.keys(canon.administraveis));
    if (canon.administraveis.items) {
      console.log('DEBUG: canon.administraveis.items length =', canon.administraveis.items.length);
      console.log('DEBUG: first item command =', canon.administraveis.items[0]?.command);
    }
  }
  
  CANONICAL_CACHE = canon;
  CACHE_MTIME = newest;
  return canon;
}

// ============================================================
// EXTRAÇÃO DE REGRAS OPERACIONAIS (compiladas do canônico)
// ============================================================

function extractRules(canon) {
  const rules = [];
  
  // SOUL: identidade, autoridade, proibidos
  if (canon.soul) {
    const lines = canon.soul.split('\n');
    let inBoot = false;
    for (const line of lines) {
      if (line.includes('CARTÃO DE BOOT') || line.includes('BOOT_CARD')) inBoot = true;
      if (inBoot && line.includes('=') && !line.startsWith('>') && !line.startsWith('#')) {
        const [k, v] = line.split('=').map(s => s.trim());
        if (k && v) rules.push({ source: 'SOUL', key: k, value: v, type: 'constraint' });
      }
    }
  }
  
  // ADMINISTRAVEIS: comandos canônicos (note: canon.administraveis is the parsed JSON object)
  if (canon.administraveis && Array.isArray(canon.administraveis.items)) {
    console.log('DEBUG: extracting commands from administraveis.items');
    for (const item of canon.administraveis.items) {
      if (item.command && item.administrable) {
        rules.push({ 
          source: 'ADMINISTRAVEIS', 
          key: 'ADMINISTRABLE_COMMAND', 
          value: item.command,
          type: 'command',
          owner: item.owner
        });
      }
    }
  }
  
  // CONTRATO: reconciliação obrigatória
  if (canon.contrato) {
    rules.push({ source: 'CONTRATO', key: 'REUSE_BEFORE_CREATE', value: 'true', type: 'mandate' });
    rules.push({ source: 'CONTRATO', key: 'ONE_WRITER_PER_SCOPE', value: 'true', type: 'mandate' });
    rules.push({ source: 'CONTRATO', key: 'UNKNOWN_IS_NOT_PASS', value: 'true', type: 'mandate' });
    rules.push({ source: 'CONTRATO', key: 'NO_V1_V2_V3', value: 'true', type: 'mandate' });
  }
  
  // AGENTS.md: regras operacionais
  if (canon.agents) {
    if (canon.agents.includes('REUSE_BEFORE_CREATE_REQUIRED')) {
      rules.push({ source: 'AGENTS', key: 'REUSE_BEFORE_CREATE', value: 'true', type: 'mandate' });
    }
    if (canon.agents.includes('SOUL_REQUIRED')) {
      rules.push({ source: 'AGENTS', key: 'SOUL_REQUIRED', value: 'value': 'true', type: 'mandate' });
    }
  }
  
  return rules;
}

// Test it
const canon = loadCanonical();
console.log('FINAL: canon.administraveis exists =', !!canon.administraveis);
if (canon.administraveis) {
  console.log('FINAL: canon.administraveis has items =', Array.isArray(canon.administraveis.items));
  if (Array.isArray(canon.administraveis.items)) {
    console.log('FINAL: command count =', canon.administraveis.items.filter(i=>i.command && i.administrable).length);
  }
}
const rules = extractRules(canon);
console.log('FINAL: rules length =', rules.length);
console.log('FINAL: command rules =', rules.filter(r=>r.type==='command').map(r=>r.value));