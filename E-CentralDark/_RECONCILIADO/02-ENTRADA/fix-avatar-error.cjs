const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js');
let content = fs.readFileSync(file, 'utf8');

// Ensure that avatar error doesn't break the sync loop
// We previously wrapped it in a try-catch, let's verify.
if (content.includes("catch(e) {")) {
  content = content.replace("catch(e) {", "catch(e) {\n          // Do nothing, let it gracefully fall back to null avatar");
  fs.writeFileSync(file, content, 'utf8');
}
