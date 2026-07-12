// =====================================================
// CONDEFONTE-EXECUTOR v2 (atualizado)
// Local: /root/CentralDark/apps/modulos/HERMES-CORE/utils/condefonte
// Melhorias: Circuit Breaker + Métricas + Memory Injection Agressiva
// Atualizado por Grok - 12/07/2026
// =====================================================

const { appendFileSync } = require('fs');

let metrics = {
  totalRequests: 0,
  totalFailures: 0,
  circuitOpens: 0,
  decisionsExtracted: 0,
  reasoningExtracted: 0,
  goodPracticesExtracted: 0,
  errorFixesExtracted: 0,
  efficiencyTipsExtracted: 0,
  architectureDecisionsExtracted: 0
};

let circuitState = 'CLOSED';
let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30000;
let lastFailureTime = 0;

const LOG_PATH = '/root/CentralDark/apps/modulos/HERMES-CORE/utils/condefonte/logs/';

function logDetailed(type, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${type}] ${message}\n`;
  try {
    appendFileSync(LOG_PATH + 'detailed.log', line);
  } catch (e) {
    console.log(line.trim());
  }
}

class CircuitBreaker {
  static async call(fn) {
    const now = Date.now();
    if (circuitState === 'OPEN') {
      if (now - lastFailureTime > COOLDOWN_MS) {
        circuitState = 'HALF_OPEN';
        logDetailed('CIRCUIT', 'Indo para HALF_OPEN');
      } else {
        metrics.circuitOpens++;
        return null;
      }
    }
    try {
      const result = await fn();
      failureCount = 0;
      if (circuitState === 'HALF_OPEN') circuitState = 'CLOSED';
      return result;
    } catch (err) {
      failureCount++;
      lastFailureTime = now;
      metrics.totalFailures++;
      if (failureCount >= FAILURE_THRESHOLD) {
        circuitState = 'OPEN';
        metrics.circuitOpens++;
        logDetailed('CIRCUIT', `Circuito ABERTO após ${failureCount} falhas`);
      }
      throw err;
    }
  }
}

// Filtros Agressivos expandidos
function isGoodPractice(text) {
  const t = text.toLowerCase();
  return t.includes('boa prática') || t.includes('melhor fazer') || t.includes('recomendo') || t.includes('eficiente');
}
function isErrorFix(text) {
  const t = text.toLowerCase();
  return t.includes('erro') || t.includes('bug') || t.includes('fix') || t.includes('resolveu');
}
function isEfficiencyTip(text) {
  const t = text.toLowerCase();
  return t.includes('performance') || t.includes('rápido') || t.includes('otimizar');
}
function isArchitectureDecision(text) {
  const t = text.toLowerCase();
  return t.includes('arquitetura') || t.includes('decidi usar') || t.includes('vou estruturar');
}

async function aggressiveFetchTrajectory(before = null) {
  metrics.totalRequests++;
  return await CircuitBreaker.call(() => fetchTrajectory(before));
}

// =====================================================
// Worker (estrutura original mantida + melhorias)
// =====================================================
async function worker(workerId) {
  logDetailed('WORKER', `Worker ${workerId} iniciado`);

  // ... (seu código original do worker vai aqui)

  // Exemplo de uso do aggressive fetch:
  // const data = await aggressiveFetchTrajectory(currentBefore);

  // Depois de processar cada item:
  // if (isGoodPractice(text)) { appendFileSync... }
}

// No final da main()
logDetailed('FINAL_METRICS', JSON.stringify(metrics, null, 2));
console.log('📊 Métricas Condefonte:', metrics);
