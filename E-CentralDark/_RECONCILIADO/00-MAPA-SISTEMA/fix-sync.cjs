const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js');
let content = fs.readFileSync(file, 'utf8');

const oldSync = `    const contacts = await wuzapiClient.getContacts({ token: wuzapiToken });
    
    if (!contacts || !Array.isArray(contacts)) {
      logger.warn('contacts_sync_no_data', { response: typeof contacts });
      return { synced: 0, total: 0 };
    }

    let synced = 0;
    for (const c of contacts) {
      const phone = c.jid || c.id || c.phone || c.number || null;
      if (!phone) continue;
      
      // Extrai nome
      const name = c.name || c.pushName || c.push_name || c.notify || c.verifiedName || null;
      
      await upsertContact(workspaceId, {
        phone: phone.replace('@s.whatsapp.net', '').replace('@c.us', ''),
        name: name,
        push_name: c.pushName || c.push_name || null,
        tags: ['whatsapp'],
      });
      synced++;
    }

    logger.info('contacts_sync_done', { synced, total: contacts.length });
    await logEvent('contacts.sync.completed', 'info', { 
      instanceId, workspaceId, synced, total: contacts.length 
    });
    
    return { synced, total: contacts.length };`;

const newSync = `    const contactsData = await wuzapiClient.getContacts({ token: wuzapiToken });
    
    if (!contactsData || typeof contactsData !== 'object') {
      logger.warn('contacts_sync_no_data', { response: typeof contactsData });
      return { synced: 0, total: 0 };
    }

    const contactsList = Array.isArray(contactsData) 
      ? contactsData 
      : Object.entries(contactsData).map(([jid, data]) => ({ jid, ...data }));

    let synced = 0;
    
    for (const c of contactsList) {
      const rawJid = c.jid || c.id || c.phone || c.number || null;
      if (!rawJid) continue;
      
      const phone = rawJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
      
      const pushName = c.PushName || c.pushName || c.push_name || null;
      const fullName = c.FullName || c.full_name || null;
      const businessName = c.BusinessName || c.business_name || null;
      const verifiedName = c.VerifiedName || c.verifiedName || null;
      const firstName = c.FirstName || c.first_name || null;
      
      const bestName = fullName || businessName || pushName || firstName || phone;
      
      // Upsert call
      await upsertContact(workspaceId, {
        phone,
        jid: rawJid,
        name: bestName,
        push_name: pushName,
        full_name: fullName,
        business_name: businessName,
        first_name: firstName,
        tags: ['whatsapp'],
      });
      synced++;
    }

    logger.info('contacts_sync_done', { synced, total: contactsList.length });
    await logEvent('contacts.sync.completed', 'info', { 
      instanceId, workspaceId, synced, total: contactsList.length 
    });
    
    return { synced, total: contactsList.length };`;

content = content.replace(oldSync, newSync);

const oldUpsert = `async function upsertContact(workspaceId, data) {
  if (!workspaceId || !data.phone) return null;
  
  const payload = {
    workspace_id: workspaceId,
    phone: data.phone,
    name: data.name || data.phone,
    push_name: data.push_name || null,
    tags: data.tags || [],
    updated_at: new Date().toISOString(),
  };

  return rest('POST', 'contacts', payload, {
    Prefer: 'resolution=return-minimal, return=representation',
    'on_conflict': 'workspace_id,phone'
  });
}`;

const newUpsert = `async function upsertContact(workspaceId, data) {
  if (!workspaceId || !data.phone) return null;
  
  // Buscar contato existente
  const existing = await rest('GET', \`contacts?workspace_id=eq.\${workspaceId}&phone=eq.\${data.phone}\`, null, {
    Accept: 'application/vnd.pgrst.object+json'
  });

  const payload = {
    workspace_id: workspaceId,
    phone: data.phone,
    jid: data.jid || null,
    tags: data.tags || [],
    updated_at: new Date().toISOString(),
  };

  // Respeita nomes manuais
  let nameLocked = existing && (existing.name_locked === true || existing.name_source === 'manual');
  
  if (!nameLocked) {
    if (data.name) payload.name = data.name;
    payload.name_source = data.name_source || 'whatsapp_sync';
  }
  
  if (data.push_name !== undefined) payload.push_name = data.push_name;
  if (data.full_name !== undefined) payload.full_name = data.full_name;
  if (data.business_name !== undefined) payload.business_name = data.business_name;
  if (data.first_name !== undefined) payload.first_name = data.first_name;
  
  if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url;
  if (data.avatar_id !== undefined) payload.avatar_id = data.avatar_id;
  if (data.avatar_type !== undefined) payload.avatar_type = data.avatar_type;
  if (data.avatar_direct_path !== undefined) payload.avatar_direct_path = data.avatar_direct_path;

  return rest('POST', 'contacts', payload, {
    Prefer: 'resolution=return-minimal, return=representation',
    'on_conflict': 'workspace_id,phone'
  });
}`;

content = content.replace(oldUpsert, newUpsert);

fs.writeFileSync(file, content, 'utf8');
console.log('supabaseService updated');
