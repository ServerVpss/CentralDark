const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js');
let content = fs.readFileSync(file, 'utf8');

const oldUpsert = `async function upsertContact(workspaceId, contactData) {
  if (!workspaceId || !contactData || !contactData.phone) return null;
  
  // Busca contato existente
  const existing = await rest('GET', \`contacts\`, null, 
    \`workspace_id=eq.\${workspaceId}&phone=eq.\${encodeURIComponent(contactData.phone)}&select=id\`);
  
  const payload = {
    workspace_id: workspaceId,
    name: contactData.name || contactData.push_name || contactData.phone,
    phone: contactData.phone,
    tags: contactData.tags || [],
    notes: contactData.notes || null,
    is_blocked: !!contactData.is_blocked,
    updated_at: new Date().toISOString(),
  };

  if (existing && existing.length > 0) {
    // Atualiza existente
    await rest('PATCH', \`contacts\`, payload, \`id=eq.\${existing[0].id}\`);
    logger.info('contact_updated', { phone: contactData.phone });
    return existing[0];
  } else {
    // Cria novo
    payload.created_at = new Date().toISOString();
    const result = await rest('POST', 'contacts', payload);
    logger.info('contact_created', { phone: contactData.phone });
    return result;
  }
}`;

const newUpsert = `async function upsertContact(workspaceId, contactData) {
  if (!workspaceId || !contactData || !contactData.phone) return null;
  
  // Busca contato existente para não sobrescrever nome locked
  const existingReq = await rest('GET', \`contacts\`, null, 
    \`workspace_id=eq.\${workspaceId}&phone=eq.\${encodeURIComponent(contactData.phone)}&select=id,name_locked,name_source\`);
  
  const existing = existingReq && existingReq.length > 0 ? existingReq[0] : null;

  const payload = {
    workspace_id: workspaceId,
    phone: contactData.phone,
    jid: contactData.jid || null,
    tags: contactData.tags || [],
    notes: contactData.notes || null,
    is_blocked: !!contactData.is_blocked,
    updated_at: new Date().toISOString(),
  };

  // Respeita nomes manuais
  let nameLocked = existing && (existing.name_locked === true || existing.name_source === 'manual');
  
  if (!nameLocked) {
    if (contactData.name) payload.name = contactData.name;
    payload.name_source = contactData.name_source || 'whatsapp_sync';
  }
  
  if (contactData.push_name !== undefined) payload.push_name = contactData.push_name;
  if (contactData.full_name !== undefined) payload.full_name = contactData.full_name;
  if (contactData.business_name !== undefined) payload.business_name = contactData.business_name;
  if (contactData.first_name !== undefined) payload.first_name = contactData.first_name;
  
  if (contactData.avatar_url !== undefined) payload.avatar_url = contactData.avatar_url;
  if (contactData.avatar_id !== undefined) payload.avatar_id = contactData.avatar_id;
  if (contactData.avatar_type !== undefined) payload.avatar_type = contactData.avatar_type;
  if (contactData.avatar_direct_path !== undefined) payload.avatar_direct_path = contactData.avatar_direct_path;

  if (existing) {
    // Atualiza existente
    await rest('PATCH', \`contacts\`, payload, \`id=eq.\${existing.id}\`);
    logger.info('contact_updated', { phone: contactData.phone });
    return existing;
  } else {
    // Cria novo
    payload.created_at = new Date().toISOString();
    const result = await rest('POST', 'contacts', payload);
    logger.info('contact_created', { phone: contactData.phone });
    return result;
  }
}`;

content = content.replace(oldUpsert, newUpsert);
fs.writeFileSync(file, content, 'utf8');
console.log('upsertContact updated');
