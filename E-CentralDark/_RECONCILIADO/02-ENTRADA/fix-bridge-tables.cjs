const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/'instances\?select=\*&order=created_at\.asc'/g, "'whatsapp_connections?select=*&order=created_at.asc'");
content = content.replace(/instances\?id=eq\./g, 'whatsapp_connections?id=eq.');

// Adapt the updates structure for whatsapp_connections
// Instead of updates.qr_code_base64, it's updates.qr_code
const oldUpdatesAssign = `      updates.qr_code_base64 = '';
      if (statusData.phone || statusData.jid) {
        updates.phone = (statusData.phone || statusData.jid || '').replace('@s.whatsapp.net', '');
      }
      updates.wuzapi_instance_id = wuzapiId;
    } else if (statusData.qrcode || statusData.qr) {
      updates.status = 'qr_code';
      updates.qr_code_base64 = statusData.qrcode || statusData.qr || '';
    } else {
      updates.status = 'disconnected';
    }

    const changed = updates.status !== instance.status ||
                    updates.qr_code_base64 !== instance.qr_code_base64 ||`;

const newUpdatesAssign = `      updates.qr_code = '';
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
                    updates.qr_code !== instance.qr_code ||`;

content = content.replace(oldUpdatesAssign, newUpdatesAssign);

// Adjust instance property reads (qr_code_base64 to qr_code)
content = content.replace(/updates\.qr_code_base64 !== instance\.qr_code_base64/g, 'updates.qr_code !== instance.qr_code');

fs.writeFileSync(file, content, 'utf8');
console.log('supabase-sync bridge table targets updated.');
