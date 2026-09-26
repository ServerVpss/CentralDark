# COMANDO - fix-sync-avatar.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\tools\legacy-fixes\fix-sync-avatar.cjs
**SHA:** 4f0ee2411faeddcb
**Timestamp:** 2026-08-26T19:32:56.501403
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = content.indexOf(targetFunction);

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js');
let content = fs.readFileSync(file, 'utf8');

const targetFunction = `async function syncContactsFromWuzapi`;

if (content.includes(targetFunction)) {
    // We will find the implementation of syncContactsFromWuzapi and replace it
    const start = content.indexOf(targetFunction);
    let end = content.indexOf('async function syncMessagesFromWuzapi', start);
    if (end === -1) end = content.indexOf('async function ', start + 100);
    if (end === -1) end = content.length;

    const oldBlock = content.slice(start, end);

    const newBlock = `async function syncContactsFromWuzapi(instanceId, workspaceId, wuzapiToken) {
  const wuzapiClient = require('./wuzapiClient');
  logger.info('contacts_sync_start', { instanceId, workspaceId });
  
  try {
    const contactsData = await wuzapiClient.getContacts({ token: wuzapiToken });
    
    if (!contactsData || typeof contactsData !== 'object') {
      logger.warn('contacts_sync_no_data', { response: typeof contactsData });
      return { synced: 0, total: 0 };
    }

    const contactsList = Array.isArray(contactsData) 
      ? contactsData 
      : Object.entries(contactsData).map(([jid, data]) => ({ jid, ...data }));

    let synced = 0;
    
    // Batch processing avatars
    for (let i = 0; i < contactsList.length; i++) {
      const c = contactsList[i];
      const rawJid = c.jid || c.id || c.phone || c.number || null;
      if (!rawJid) continue;
      
      const phone = rawJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
      
      const pushName = c.PushName || c.pushName || c.push_name || null;
      const fullName = c.FullName || c.full_name || null;
      const businessName = c.BusinessName || c.business_name || null;
      const verifiedName = c.VerifiedName || c.verifiedName || null;
      const firstName = c.FirstName || c.first_name || null;
      
      const bestName = fullName || businessName || pushName || firstName || phone;
      
      let avatar_url = null;
      let avatar_id = null;
      let avatar_type = null;
      let avatar_direct_path = null;

      // Rate limit / prevent overloading avatar fetch
      // If we don't already have an avatar, or we want to do opportunist fetch.
      // But we shouldn't do it for 6000 contacts. We'll only do it for a small batch or if specific condition met.
      // Let's do it opportunisticly or limit to first 50 just for the sync to not break.
      if (i < 50) {
        try {
          const avatarData = await wuzapiClient.getUserAvatar({ token: wuzapiToken, phone: rawJid, preview: true });
          if (avatarData && avatarData.url) {
            avatar_url = avatarData.url;
            avatar_id = avatarData.id || null;
            avatar_type = avatarData.type || null;
            avatar_direct_path = avatarData.direct_path || null;
          }
        } catch(e) {
          logger.warn('contacts_sync_avatar_failed', { phone: rawJid });
        }
      }

      await upsertContact(workspaceId, {
        phone,
        jid: rawJid,
        name: bestName,
        push_name: pushName,
        full_name: fullName,
        business_name: businessName,
        first_name: firstName,
        avatar_url,
        avatar_id,
        avatar_type,
        avatar_direct_path,
        tags: ['whatsapp'],
      });
      synced++;
    }

    logger.info('contacts_sync_done', { synced, total: contactsList.length });
    await logEvent('contacts.sync.completed', 'info', { 
      instanceId, workspaceId, synced, total: contactsList.length 
    });
    
    return { synced, total: contactsList.length };
  } catch (err) {
    logger.error('contacts_sync_error', { instanceId, error: err.message });
    return { synced: 0, total: 0, error: err.message };
  }
}

`;
    
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log('syncContactsFromWuzapi updated with avatars');
} else {
    console.log('Target function not found.');
}

```