const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/app.js');
let content = fs.readFileSync(file, 'utf8');

const newRoutes = `// Rota de Health Check
app.get('/health', (req, res) => res.json({ ok: true }));

// Rotas da API
app.use('/messages', require('./routes/messages.routes'));
app.use('/connections', require('./routes/connections.routes'));
app.use('/sync', require('./routes/sync.routes'));

// Rota de webhooks
const webhooksRoutes = require('./routes/webhooks.routes');
app.use('/webhooks', webhooksRoutes);`;

content = content.replace(`// Rota de Health Check
app.get('/health', (req, res) => res.json({ ok: true }));

// Rota de webhooks
const webhooksRoutes = require('./routes/webhooks.routes');
app.use('/webhooks', webhooksRoutes);`, newRoutes);

fs.writeFileSync(file, content, 'utf8');
