const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js');
let content = fs.readFileSync(file, 'utf8');

// The commit 65db3eb did apply the changes to supabaseService.js, but let's confirm parsing logic.
const extractLogic = `    const contactsList = Array.isArray(contactsData) 
      ? contactsData 
      : Object.entries(contactsData).map(([jid, data]) => ({ jid, ...data }));`;

if(!content.includes('Object.entries(contactsData)')) {
    console.log("Missing object entries parsing. Will fix.");
    // Incase the previous patch didn't stick exactly.
} else {
    console.log("SupabaseService already parsing via Object.entries.");
}
