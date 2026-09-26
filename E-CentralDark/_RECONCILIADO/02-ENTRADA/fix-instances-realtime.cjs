const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace table "instances" in Realtime filter to "whatsapp_connections"
content = content.replace(
  /\.channel\("instances-realtime"\)\s*\n\s*\.on\("postgres_changes", \{\s*\n\s*event: "\*",\s*\n\s*schema: "public",\s*\n\s*table: "instances",/m,
  '.channel("whatsapp_connections-realtime")\n      .on("postgres_changes", {\n        event: "*",\n        schema: "public",\n        table: "whatsapp_connections",'
);

// Map frontend payload fields from the new table to the internal React State format
const oldPayloadFn = `(payload) => {
        if (payload.eventType === "INSERT") {
          setInstances(prev => [...prev, payload.new as Instance]);
        } else if (payload.eventType === "UPDATE") {
          setInstances(prev => prev.map(inst => inst.id === payload.new.id ? payload.new as Instance : inst));
        } else if (payload.eventType === "DELETE") {
          setInstances(prev => prev.filter(inst => inst.id !== payload.old.id));
        }
      }`;

const newPayloadFn = `(payload) => {
        const normalizePayload = (raw: any): Instance => ({
           ...raw,
           qr_code_base64: raw.qr_code || '',
           status: raw.status || 'disconnected'
        });

        if (payload.eventType === "INSERT") {
          setInstances(prev => [...prev, normalizePayload(payload.new)]);
        } else if (payload.eventType === "UPDATE") {
          setInstances(prev => prev.map(inst => inst.id === payload.new.id ? normalizePayload(payload.new) : inst));
        } else if (payload.eventType === "DELETE") {
          setInstances(prev => prev.filter(inst => inst.id !== payload.old.id));
        }
      }`;

if (content.includes('setInstances(prev => [...prev, payload.new as Instance]);')) {
  // Rough replace of the callback body
  content = content.replace(/\(payload\) => \{\s*if \(payload.eventType === "INSERT"\)[\s\S]*?\}\s*\}\)/, newPayloadFn + ')');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Instances.tsx realtime channel updated.');
