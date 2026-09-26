/**
 * Hub Central — Orquestrador de Integrações
 * 
 * Controla todas as integrações: iniciar, parar, status, health.
 * Ponto de entrada único para o sistema de integrações.
 * 
 * Uso:
 *   const hub = require('./integracoes/hub/hub');
 *   hub.list();
 *   await hub.start('telegram');
 *   hub.status();
 */

const integrations = {};

// Registrar integrações disponíveis
function register(name, module) {
  integrations[name] = {
    module,
    state: 'stopped',
    startedAt: null,
  };
}

// Registrar built-in
try { register('telegram', require('../telegram/bot')); } catch(e) {}
try { register('whatsapp', require('../whatsapp/bot')); } catch(e) {}
try { register('ai', require('../ai/bot')); } catch(e) {}
try { register('monitor', require('../monitor/bot')); } catch(e) {}
try { register('payments', require('../payments/bot')); } catch(e) {}
try { register('github', require('../github/bot')); } catch(e) {}

module.exports = {
  // Listar integrações disponíveis
  list() {
    return Object.entries(integrations).map(([name, int]) => ({
      name,
      description: int.module.description,
      version: int.module.version,
      state: int.state,
      startedAt: int.startedAt,
    }));
  },

  // Iniciar uma integração
  async start(name, config = {}) {
    const int = integrations[name];
    if (!int) return { ok: false, error: `Integração "${name}" não encontrada` };
    if (int.state === 'running') return { ok: true, message: 'Já rodando' };

    int.module.init(config);
    const result = await int.module.start();
    if (result.ok) {
      int.state = 'running';
      int.startedAt = new Date().toISOString();
    }
    return result;
  },

  // Parar uma integração
  async stop(name) {
    const int = integrations[name];
    if (!int) return { ok: false, error: `Integração "${name}" não encontrada` };

    const result = await int.module.stop();
    int.state = 'stopped';
    int.startedAt = null;
    return result;
  },

  // Status de tudo
  status() {
    return Object.entries(integrations).map(([name, int]) => ({
      name,
      state: int.state,
      startedAt: int.startedAt,
      ...(int.module.status ? int.module.status() : {}),
    }));
  },

  // Health check de tudo
  async healthCheck() {
    const results = {};
    for (const [name, int] of Object.entries(integrations)) {
      if (int.module.healthCheck) {
        results[name] = await int.module.healthCheck();
      } else {
        results[name] = { ok: int.state === 'running' };
      }
    }
    return results;
  },

  // Registrar integração customizada
  register,

  // Acessar módulo diretamente
  get(name) {
    return integrations[name]?.module || null;
  },
};
