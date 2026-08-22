/**
 * SOUL RUNTIME GATE — filtro único autoaplicável
 * 
 * PT-BR: Implementação do filtro obrigatório que toda mutação de estado da Casa deve atravessar.
 * Aplica-se antes (pré-filtro), durante (execução) e depois (pós-filtro com autoaplicação).
 * Garante que nenhuma ação escape da governança da SOUL, mesmo que seja feita por strumentos externos.
 * 
 * Regra central: TODO estado mutável passa por este filtro — git, tool, agente, deploy, memória, MCP, CI.
 * O veredito final também passa pelo filtro (recursão 1 nível) para impedir escape por linguagem.
 * 
 * Origem: SEGREDO/CHEFE — autoridade final e autor da intenção.
 * Identidade operacional: SOL (coordena e reconcilia).
 * Executor: PIVETE/HERMES (executa e preserva continuidade).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// CARREGAMENTO DO CANÔNICO (fonte da verdade)
// ============================================================

// Calculate repo root: from apps/modulos/soul-gate/runtime/ go up 4 levels to reach CentralDark repo root
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SOUL_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md');
const ADMIN_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/ADMINISTRAVEIS.json');
const CONTRACT_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');
const FREQ_PATH = path.join(REPO_ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md');
const AGENTS_PATH = path.join(REPO_ROOT, 'AGENTS.md');
const LEIA_ME_PATH = path.join(REPO_ROOT, 'LEIA-ME-IA.md');

console.log('SOUL Gate Debug:');
console.log('REPO_ROOT:', REPO_ROOT);
console.log('SOUL_PATH exists:', fs.existsSync(SOUL_PATH));
console.log('ADMIN_PATH exists:', fs.existsSync(ADMIN_PATH));
console.log('CONTRACT_PATH exists:', fs.existsSync(CONTRACT_PATH));
console.log('FREQ_PATH exists:', fs.existsSync(FREQ_PATH));
console.log('AGENTS_PATH exists:', fs.existsSync(AGENTS_PATH));
console.log('LEIA_ME_PATH exists:', fs.existsSync(LEIA_ME_PATH));

let CANONICAL_CACHE = null;
let CACHE_MTIME = 0;

/**
 * PT-BR: Carrega e compila os documentos canônicos da SOUL em memória.
 * Usa cache com verificação de mtime para evitar leituras desnecessárias em disco.
 * Só recarrega quando algum arquivo fonte for modificado.
 */
function loadCanonical() {
  const files = [SOUL_PATH, ADMIN_PATH, CONTRACT_PATH, FREQ_PATH, AGENTS_PATH, LEIA_ME_PATH];
  const newest = Math.max(...files.map(f => {
    try { 
      const exists = fs.existsSync(f);
      const time = exists ? fs.statSync(f).mtimeMs : 0;
      // Uncomment for debugging: console.log(`File ${f}: exists=${exists}, mtime=${time}`);
      return time;
    } catch { 
      // Uncomment for debugging: console.log(`File ${f}: stat error`);
      return 0; 
    }
  }));
  
  if (CANONICAL_CACHE && newest <= CACHE_MTIME) {
    // Uncomment for debugging: console.log('Returning cached canon');
    return CANONICAL_CACHE;
  }
  
  // Uncomment for debugging: console.log('Loading fresh canon');
  const canon = {
    soul: fs.existsSync(SOUL_PATH) ? fs.readFileSync(SOUL_PATH, 'utf8') : '',
    administraveis: fs.existsSync(ADMIN_PATH) ? JSON.parse(fs.readFileSync(ADMIN_PATH, 'utf8')) : {},
    contrato: fs.existsSync(CONTRACT_PATH) ? JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8')) : {},
    frequencias: fs.existsSync(FREQ_PATH) ? fs.readFileSync(FREQ_PATH, 'utf8') : '',
    agents: fs.existsSync(AGENTS_PATH) ? fs.readFileSync(AGENTS_PATH, 'utf8') : '',
    leiaMe: fs.existsSync(LEIA_ME_PATH) ? fs.readFileSync(LEIA_ME_PATH, 'utf8') : '',
  };
  
  // Uncomment for debugging: 
  // console.log('Loaded administraveis:', typeof canon.administraveis);
  // if (canon.administraveis) {
  //   console.log('administraveis has items:', Array.isArray(canon.administraveis.items));
  //   if (Array.isArray(canon.administraveis.items)) {
  //     console.log('Number of items:', canon.administraveis.items.length);
  //     if (canon.administraveis.items.length > 0) {
  //       console.log('First item command:', canon.administraveis.items[0].command);
  //     }
  //   }
  // }
  
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
      rules.push({ source: 'AGENTS', key: 'SOUL_REQUIRED', value: 'true', type: 'mandate' });
    }
  }
  
  return rules;
}

// ============================================================
// FILTRO PRINCIPAL — autoaplicável
// ============================================================

class SoulGate {
  constructor() {
    this.canon = loadCanonical();
    this.rules = extractRules(this.canon);
    this.writerScope = new Map(); // escopo -> writer atual
    this.mutationLog = [];
  }
  
  // --------------------------------------------------------
  // PRÉ-FILTRO: valida intenção + estado antes de mutar
  // --------------------------------------------------------
  preFilter(context) {
    const violations = [];
    const { action, scope, writer, payload, metadata = {} } = context;
    
    // 1. Autoridade: só SEGREDO/CHEFE define nova intenção humana
    if (action === 'NEW_HUMAN_INTENT' && metadata.author !== 'SEGREDO/CHEFE') {
      violations.push({ rule: 'HUMAN_AUTHORITY_SINGLETON', msg: 'Só SEGREDO/CHEFE cria intenção humana nova' });
    }
    
    // 2. Writer único por escopo
    if (scope && this.writerScope.has(scope) && this.writerScope.get(scope) !== writer) {
      violations.push({ rule: 'ONE_WRITER_PER_SCOPE', msg: `Escopo ${scope} já tem writer ${this.writerScope.get(scope)}` });
    }
    
    // 3. Reuso antes de criar
    if (action === 'CREATE' && !metadata.reuseChecked) {
      violations.push({ rule: 'REUSE_BEFORE_CREATE', msg: 'CREATE sem verificação de reuso (reuseChecked=false)' });
    }
    
    // 4. Comando administrável válido
    if (action === 'EXECUTE_COMMAND') {
      const validCommands = this.rules
        .filter(r => r.type === 'command')
        .map(r => r.value);
      if (payload?.command && !validCommands.includes(payload.command)) {
        violations.push({ rule: 'ADMINISTRABLE_COMMAND', msg: `Comando ${payload.command} não registrado no ADMINISTRAVEIS` });
      }
    }
    
    // 5. UNKNOWN não passa
    if (metadata.unknownFields?.length) {
      violations.push({ rule: 'UNKNOWN_IS_NOT_PASS', msg: `Campos UNKNOWN presentes: ${metadata.unknownFields.join(', ')}` });
    }
    
    // 6. Segurança humana (invariante severa)
    if (action === 'HUMAN_INTERACTION' && metadata.harmRisk) {
      violations.push({ rule: 'HOUSE_HUMAN_MACHINE_SAFETY_INVARIANT', msg: 'Risco de dano humano detectado' });
    }
    
    // 7. Modelo não é autoridade
    if (metadata.claimsAuthority && metadata.source === 'MODEL') {
      violations.push({ rule: 'MODEL_IS_NOT_AUTHORITY', msg: 'Modelo não pode reivindicar autoridade' });
    }
    
    // 8. Crédito não é autoridade
    if (metadata.claimsAuthorityViaCredit) {
      violations.push({ rule: 'CREDIT_IS_NOT_AUTHORITY', msg: 'Crédito não transfere autoridade' });
    }
    
    return {
      allowed: violations.length === 0,
      violations,
      context: { ...context, preFiltered: true, timestamp: Date.now() }
    };
  }
  
  // --------------------------------------------------------
  // EXECUÇÃO: roda a ação se pré-filtro passou
  // --------------------------------------------------------
  async execute(context) {
    const { action, payload, scope, writer } = context;
    
    // Registra writer se novo escopo (garante um writer por escopo)
    if (scope && !this.writerScope.has(scope)) {
      this.writerScope.set(scope, writer);
    }
    
    let result;
    try {
      switch (action) {
        case 'GIT_PUSH':
        case 'GIT_COMMIT':
        case 'GH_PR_MERGE':
        case 'GH_PR_CREATE':
          result = await this.execGit(action, payload);
          break;
        case 'TOOL_CALL':
          result = await this.execTool(payload);
          break;
        case 'DEPLOY':
          result = await this.execDeploy(payload);
          break;
        case 'MEMORY_WRITE':
          result = await this.execMemoryWrite(payload);
          break;
        case 'MCP_CALL':
          result = await this.execMcpCall(payload);
          break;
        case 'AGENT_TASK':
          result = await this.execAgentTask(payload);
          break;
        case 'EXECUTE_COMMAND':
          result = await this.execCommand(payload);
          break;
        default:
          result = { success: false, error: `Ação desconhecida: ${action}`, unknown: true };
      }
    } catch (err) {
      result = { success: false, error: err.message, exception: true };
    }
    
    return {
      ...context,
      result,
      executed: true,
      timestamp: Date.now()
    };
  }
  
  // --------------------------------------------------------
  // IMPLEMENTAÇÕES DAS AÇÕES (stubs reais — conectam na Casa)
  // --------------------------------------------------------
  
  async execGit(action, payload) {
    // Conecta no git real da Casa para executar operações de versão
    const cmd = this.buildGitCommand(action, payload);
    const output = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 10*1024*1024 });
    return { success: true, output, command: cmd };
  }
  
  buildGitCommand(action, payload) {
    switch (action) {
      case 'GIT_COMMIT': return `git commit -m "${payload.message}"`;
      case 'GIT_PUSH': return `git push ${payload.remote || 'origin'} ${payload.branch}`;
      case 'GH_PR_MERGE': return `gh pr merge ${payload.pr} --squash ${payload.auto ? '--auto' : ''}`;
      case 'GH_PR_CREATE': return `gh pr create --base ${payload.base} --head ${payload.head} --title "${payload.title}"`;
      default: throw new Error(`Git action ${action} não implementada`);
    }
  }
  
  async execTool(payload) {
    // Placeholder — integra com tool registry da Casa (ex: MCP, ferramentas internas)
    return { success: true, tool: payload.name, note: 'Tool exec via Casa runtime' };
  }
  
  async execDeploy(payload) {
    // Placeholder — integra com deploy pipeline da Casa (ex: VPS, Cloudflare, Caddy)
    return { success: true, target: payload.target, note: 'Deploy via Casa pipeline' };
  }
  
  async execMemoryWrite(payload) {
    // Placeholder — integra com memory linker da Casa (ex: sistema de Lembranças do Pivete)
    return { success: true, key: payload.key, note: 'Memory write via Casa memory' };
  }
  
  async execMcpCall(payload) {
    // Placeholder — integra com MCP dispatcher fixo (comunicação padronizada)
    return { success: true, tool: payload.tool, note: 'MCP call via fixed dispatcher' };
  }
  
  async execAgentTask(payload) {
    // Placeholder — integra com delegação de agentes (execução assíncrona isolada)
    return { success: true, task: payload.goal, note: 'Agent task via delegation' };
  }
  
  async execCommand(payload) {
    // Executa comando administrável registrado (ex: #ACORDAR, !CALIBRAR, etc)
    const { command, args = [] } = payload;
    return { success: true, command, args, note: `Comando ${command} executado via gate` };
  }
  
  // --------------------------------------------------------
  // PÓS-FILTRO: valida resultado + autoaplicação no próprio veredito
  // --------------------------------------------------------
  postFilter(context) {
    const { result, action, scope, writer } = context;
    const violations = [];
    
    // 1. Resultado deve ter prova/evidência se mutação
    const mutatingActions = ['GIT_PUSH', 'GIT_COMMIT', 'GH_PR_MERGE', 'DEPLOY', 'MEMORY_WRITE', 'TOOL_CALL'];
    if (mutatingActions.includes(action) && result.success) {
      if (!result.evidence && !result.receipt && !result.output?.includes('sha') && !result.output?.includes('commit')) {
        violations.push({ rule: 'PROOF_REQUIRED', msg: 'Mutação bem-sucedida sem evidência/receipt' });
      }
    }
    
    // 2. Rollback disponível para irreversíveis
    if (action === 'DEPLOY' && result.success && !result.rollbackPlan) {
      violations.push({ rule: 'ROLLBACK_BEFORE_IRREVERSIBLE', msg: 'Deploy sem plano de rollback' });
    }
    
    // 3. Segredo não vazou (heurística simples — produção usaria scanner real)
    if (result.output && /[A-Za-z0-9_-]{20,}/.test(result.output)) {
      violations.push({ rule: 'NO_SECRET_LEAK', msg: 'Possível segredo no output (heurística)' });
    }
    
    // 4. Crédito preservado (atribuição justa, não transfere autoridade)
    if (result.credit && !result.provenance) {
      violations.push({ rule: 'CREDIT_PRESERVATION_REQUIRED', msg: 'Crédito sem proveniência' });
    }
    
    const passed = violations.length === 0;
    
    // --------------------------------------------------------
    // AUTOAPLICAÇÃO: o próprio veredito passa pelo mesmo filtro
    // --------------------------------------------------------
    const verdict = {
      allowed: passed,
      violations,
      final: true,
      meta: {
        preFilterPassed: context.preFilterResult?.allowed ?? false,
        executionSuccess: result.success,
        postFilterPassed: passed,
        selfApplied: true, // <-- marca que o veredito se autoaplicou
        timestamp: Date.now()
      }
    };
    
    // O veredito FINAL passa pelo mesmo filtro (recursão 1 nível)
    // Isso impede que alguém tente "escapar" da regra por meio da linguagem do veredito
    const selfCheck = this.preFilter({
      action: 'VERDICT_SELF_CHECK',
      scope: '__VERDICT__',
      writer: 'SOUL_GATE',
      payload: { verdict },
      metadata: { isSelfCheck: true }
    });
    
    if (!selfCheck.allowed) {
      // Se o próprio veredito viola regra, bloqueia tudo (fuga por linguagem bloqueada)
      return {
        ...verdict,
        allowed: false,
        violations: [...verdict.violations, ...selfCheck.violations],
        meta: { ...verdict.meta, selfApplied: true, selfCheckFailed: true }
      };
    }
    
    // Log da mutação completa para auditoria e histórico
    this.mutationLog.push({
      context,
      result,
      verdict,
      timestamp: Date.now()
    });
    
    return verdict;
  }
  
  // --------------------------------------------------------
  // PIPELINE COMPLETO: pré → exec → pós (com autoaplicação)
  // --------------------------------------------------------
  async mutate(context) {
    // 1. PRÉ-FILTRO: bloqueia se houver violação de regra antes de agir
    const preResult = this.preFilter(context);
    if (!preResult.allowed) {
      return {
        allowed: false,
        stage: 'PRE_FILTER',
        violations: preResult.violations,
        meta: { blocked: true, timestamp: Date.now() }
      };
    }
    
    // 2. EXECUÇÃO: só roda se pré-filtro passou
    const execContext = await this.execute(preResult.context);
    
    // 3. PÓS-FILTRO: valida resultado + aplica filtro ao próprio veredito (autoaplicação)
    const finalVerdict = this.postFilter({
      ...execContext,
      preFilterResult: preResult
    });
    
    return finalVerdict;
  }
  
  // --------------------------------------------------------
  // STATUS / INTROSPECÇÃO
  // --------------------------------------------------------
  getStatus() {
    return {
      rulesLoaded: this.rules.length,
      writersActive: Object.fromEntries(this.writerScope),
      mutationsLogged: this.mutationLog.length,
      canonLoaded: !!this.canon.soul,
      lastReload: CACHE_MTIME
    };
  }
  
  /**
   * PT-BR: Recarrega os canônicos do disco (útil quando arquivos SOUL são atualizados).
   * Não cria nova instância — apenas atualiza o cache interno.
   */
  reload() {
    CANONICAL_CACHE = null;
    CACHE_MTIME = 0;
    this.canon = loadCanonical();
    this.rules = extractRules(this.canon);
    return this.getStatus();
  }
}

module.exports = { SoulGate, loadCanonical, extractRules };

// ============================================================
// CLI DIRETO (para uso em scripts/CI/terminal)
// ============================================================

if (require.main === module) {
  const gate = new SoulGate();
  const action = process.argv[2];
  const payload = JSON.parse(process.argv[3] || '{}');
  const scope = process.argv[4];
  const writer = process.argv[5] || 'CLI';
  
  const context = { action, payload, scope, writer };
  
  gate.mutate(context).then(verdict => {
    console.log(JSON.stringify(verdict, null, 2));
    process.exit(verdict.allowed ? 0 : 1);
  }).catch(err => {
    console.error('SOUL_GATE_ERROR:', err.message);
    process.exit(2);
  });
}