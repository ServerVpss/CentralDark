const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/routes/webhooks.routes.js');
let content = fs.readFileSync(file, 'utf8');

const replaceStr = `  // Supabase Contacts & Events block omitted here for brevity (following same logic)`;
const replaceWith = `
  // Salva contato automaticamente se for mensagem recebida de numero desconhecido/conhecido
  if (normalized.event === 'message.received' && conn && conn.workspace_id && normalized.from && !normalized.is_from_me) {
    if (supabaseService) {
      const phone = normalized.from.replace('@s.whatsapp.net', '').replace('@c.us', '');
      supabaseService.upsertContact(conn.workspace_id, {
        phone,
        jid: normalized.from,
        name: normalized.push_name || phone,
        push_name: normalized.push_name,
        tags: ['whatsapp'],
      }).catch(() => {});
    }
  }

  // Registra eventos de conexao no Supabase
  if (normalized.event && normalized.event.startsWith('connection.') && conn && conn.workspace_id && supabaseService) {
    supabaseService.logEvent(
      \`wuzapi.\${normalized.event}\`,
      normalized.event === 'connection.error' ? 'error' : 'info',
      { connection_id: conn.connection_id, workspace_id: conn.workspace_id }
    ).catch(() => {});
  }
`;

content = content.replace(replaceStr, replaceWith);
fs.writeFileSync(file, content, 'utf8');
console.log('webhooks.routes.js updated');
