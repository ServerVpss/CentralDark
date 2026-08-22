/**
 * Testes do SOUL Gate — validam autoaplicação e regras
 */

const { SoulGate } = require('./soul-gate.cjs');
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

describe('SOUL Gate — autoaplicável', () => {
  let gate;
  
  beforeEach(() => {
    gate = new SoulGate();
  });
  
  describe('Pré-filtro — bloqueia violações conhecidas', () => {
    it('bloqueia CREATE sem reuseChecked', async () => {
      const ctx = { action: 'CREATE', scope: 'test', writer: 'agent', payload: {}, metadata: { reuseChecked: false } };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'REUSE_BEFORE_CREATE'));
    });
    
    it('bloqueia comando não registrado', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '!INEXISTENTE' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'ADMINISTRABLE_COMMAND'));
    });
    
    it('bloqueia UNKNOWN fields', async () => {
      const ctx = { action: 'TOOL_CALL', scope: 'test', writer: 'agent', payload: {}, metadata: { unknownFields: ['campo_x'] } };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'UNKNOWN_IS_NOT_PASS'));
    });
    
    it('bloqueia modelo reivindicando autoridade', async () => {
      const ctx = { action: 'NEW_HUMAN_INTENT', scope: 'test', writer: 'model', payload: {}, metadata: { author: 'MODEL', claimsAuthority: true } };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'MODEL_IS_NOT_AUTHORITY' || v.rule === 'HUMAN_AUTHORITY_SINGLETON'));
    });
  });
  
  describe('Comandos válidos passam no pré-filtro', () => {
    it('permite comando registrado (!ACORDAR)', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '#ACORDAR' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, true);
    });
    
    it('permite comando registrado (!CALIBRAR)', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '!CALIBRAR' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, true);
    });
    
    it('permite comando registrado (!MULTIBUSSOLA)', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '!MULTIBUSSOLA' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, true);
    });
    
    it('permite comando registrado (!EXECUÇÃO_REVERSÍVEL)', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '!EXECUÇÃO_REVERSÍVEL' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, true);
    });
    
    it('permite comando registrado (!REMEDIÇÃO)', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '!REMEDIÇÃO' }, metadata: {} };
      const result = await gate.mutate(ctx);
      assert.strictEqual(result.allowed, true);
    });
  });
  
  describe('Pós-filtro — exige evidência em mutação', () => {
    it('bloqueia mutação sem evidence/receipt', async () => {
      // Mock: executa mas não retorna evidence
      const originalExec = gate.execute.bind(gate);
      gate.execute = async (ctx) => ({
        ...ctx,
        result: { success: true }, // sem evidence, sem receipt
        executed: true,
        timestamp: Date.now()
      });
      
      const ctx = { action: 'GIT_COMMIT', scope: 'repo', writer: 'agent', payload: { message: 'test' }, metadata: {} };
      const result = await gate.mutate(ctx);
      
      gate.execute = originalExec;
      
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'PROOF_REQUIRED'));
    });
    
    it('permite mutação com evidence', async () => {
      const originalExec = gate.execute.bind(gate);
      gate.execute = async (ctx) => ({
        ...ctx,
        result: { success: true, evidence: 'sha123', receipt: 'commit-abc' },
        executed: true,
        timestamp: Date.now()
      });
      
      const ctx = { action: 'GIT_COMMIT', scope: 'repo', writer: 'agent', payload: { message: 'test' }, metadata: {} };
      const result = await gate.mutate(ctx);
      
      gate.execute = originalExec;
      
      assert.strictEqual(result.allowed, true);
    });
  });
  
  describe('Autoaplicação — veredito passa pelo mesmo filtro', () => {
    it('veredito limpo passa no self-check', async () => {
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '#ACORDAR' }, metadata: {} };
      const result = await gate.mutate(ctx);
      
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.meta.selfApplied, true);
      assert.strictEqual(result.meta.selfCheckFailed, undefined);
    });
    
    it('veredito que viola regra é bloqueado no self-check', async () => {
      // Força um resultado que passaria no pós-filtro mas falharia no self-check
      // (simulando um veredito que tenta reivindicar autoridade indevidamente)
      const originalPost = gate.postFilter.bind(gate);
      gate.postFilter = (ctx) => {
        const verdict = originalPost(ctx);
        // Injeta violação no próprio veredito
        if (verdict.allowed) {
          verdict.violations.push({ rule: 'MODEL_IS_NOT_AUTHORITY', msg: 'veredito tentou reivindicar autoridade' });
          verdict.allowed = false;
        }
        return verdict;
      };
      
      const ctx = { action: 'EXECUTE_COMMAND', scope: 'test', writer: 'agent', payload: { command: '#ACORDAR' }, metadata: {} };
      const result = await gate.mutate(ctx);
      
      gate.postFilter = originalPost;
      
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'MODEL_IS_NOT_AUTHORITY'));
      assert.strictEqual(result.meta.selfCheckFailed, true);
    });
  });
  
  describe('Writer único por escopo', () => {
    it('bloqueia segundo writer no mesmo escopo', async () => {
      // Primeiro writer
      await gate.mutate({ action: 'TOOL_CALL', scope: 'shared', writer: 'agent-A', payload: {}, metadata: {} });
      // Segundo writer no mesmo escopo
      const result = await gate.mutate({ action: 'TOOL_CALL', scope: 'shared', writer: 'agent-B', payload: {}, metadata: {} });
      
      assert.strictEqual(result.allowed, false);
      assert.ok(result.violations.some(v => v.rule === 'ONE_WRITER_PER_SCOPE'));
    });
    
    it('permite writers diferentes em escopos diferentes', async () => {
      const r1 = await gate.mutate({ action: 'TOOL_CALL', scope: 'scope-A', writer: 'agent-A', payload: {}, metadata: {} });
      const r2 = await gate.mutate({ action: 'TOOL_CALL', scope: 'scope-B', writer: 'agent-B', payload: {}, metadata: {} });
      
      assert.strictEqual(r1.allowed, true);
      assert.strictEqual(r2.allowed, true);
    });
  });
  
  describe('Recarga de canônico', () => {
    it('reload() atualiza regras sem reinstanciar', () => {
      const before = gate.getStatus().rulesLoaded;
      gate.reload();
      const after = gate.getStatus().rulesLoaded;
      assert.ok(after >= before); // pode ser igual ou mais se arquivo mudou
    });
  });
});

// ============================================================
// TESTE DE INTEGRAÇÃO: pipeline completo simulado
// ============================================================

describe('Pipeline completo — cenários reais da Casa', () => {
  let gate;
  
  beforeEach(() => {
    gate = new SoulGate();
  });
  
  it('merge PR autorizado: pré → exec → pós → self-check', async () => {
    const originalExec = gate.execute.bind(gate);
    gate.execute = async (ctx) => ({
      ...ctx,
      result: { success: true, output: 'commit 12ee1e9d1ff32c2f2e0a8ecc27649f32e3b08070', evidence: 'sha', receipt: 'merge-commit' },
      executed: true,
      timestamp: Date.now()
    });
    
    const ctx = {
      action: 'GH_PR_MERGE',
      scope: 'pr-1090',
      writer: 'soul-gate',
      payload: { pr: '1090', auto: true, base: 'main' },
      metadata: { reuseChecked: true, author: 'SEGREDO/CHEFE' }
    };
    
    const result = await gate.mutate(ctx);
    
    gate.execute = originalExec;
    
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.meta.selfApplied, true);
    assert.strictEqual(result.meta.executionSuccess, true);
  });
  
  it('deploy sem rollback é bloqueado', async () => {
    const originalExec = gate.execute.bind(gate);
    gate.execute = async (ctx) => ({
      ...ctx,
      result: { success: true, target: 'vps' }, // sem rollbackPlan
      executed: true,
      timestamp: Date.now()
    });
    
    const ctx = {
      action: 'DEPLOY',
      scope: 'production',
      writer: 'deploy-agent',
      payload: { target: 'vps' },
      metadata: {}
    };
    
    const result = await gate.mutate(ctx);
    
    gate.execute = originalExec;
    
    assert.strictEqual(result.allowed, false);
    assert.ok(result.violations.some(v => v.rule === 'ROLLBACK_BEFORE_IRREVERSIBLE'));
  });
  
  it('memória write sem proveniência é bloqueado', async () => {
    const originalExec = gate.execute.bind(gate);
    gate.execute = async (ctx) => ({
      ...ctx,
      result: { success: true, credit: 'alguem', provenance: null }, // crédito sem proveniência
      executed: true,
      timestamp: Date.now()
    });
    
    const ctx = {
      action: 'MEMORY_WRITE',
      scope: 'brain',
      writer: 'agent',
      payload: { key: 'test', value: 'data' },
      metadata: {}
    };
    
    const result = await gate.mutate(ctx);
    
    gate.execute = originalExec;
    
    assert.strictEqual(result.allowed, false);
    assert.ok(result.violations.some(v => v.rule === 'CREDIT_PRESERVATION_REQUIRED'));
  });
});

console.log('✅ Testes definidos — rode com: npm test');