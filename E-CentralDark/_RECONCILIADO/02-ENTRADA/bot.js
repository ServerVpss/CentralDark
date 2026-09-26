// WhatsApp Integration — Módulo principal
// Gerencia conexões via Supabase. Gateway chamado APENAS pela VPS.

let _state = 'stopped';

module.exports = {
  name: 'whatsapp',
  version: '1.0.0',
  description: 'WhatsApp via WuzAPI/Whatsmeow — conexões, QR, mensagens',

  init(config = {}) { _state = 'stopped'; return { ok: true }; },
  async start() { _state = 'running'; return { ok: true }; },
  async stop() { _state = 'stopped'; return { ok: true }; },
  status() { return { name: this.name, state: _state }; },
  async healthCheck() { return { ok: _state === 'running' }; },
};
