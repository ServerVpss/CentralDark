const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let content = fs.readFileSync(file, 'utf8');

const oldGetQR = `  async getQRCode(connectionId: string): Promise<string | null> {
    try {
      const res = await fetch(\`https://proxy.multizap.dev/connections/\${connectionId}/qr\`);
      
      if (!res.ok) {
         if (res.status === 401) {
            throw new Error("Sessão Inválida: Token não autorizado na WuzAPI.");
         } else {
            throw new Error(\`Falha no Gateway: HTTP \${res.status}\`);
         }
      }`;

const newGetQR = `  async getQRCode(connectionId: string): Promise<string | null> {
    try {
      const res = await fetch(\`https://proxy.multizap.dev/connections/\${connectionId}/qr\`);
      
      if (!res.ok) {
         if (res.status === 401) {
            throw new Error("Sessão Inválida: Token não autorizado na WuzAPI.");
         } else if (res.status === 409) {
            throw new Error("409: Token não sincronizado no Gateway.");
         } else {
            throw new Error(\`Falha no Gateway: HTTP \${res.status}\`);
         }
      }`;

if (content.includes(oldGetQR)) {
  content = content.replace(oldGetQR, newGetQR);
  fs.writeFileSync(file, content, 'utf8');
  console.log("instanceService.ts getQR updated.");
}
