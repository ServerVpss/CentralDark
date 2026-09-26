#!/usr/bin/env node
/**
 * Lote 10 — validador estrutural da rota
 * GET /v1/whatsapp/messages/:chatId/history.
 *
 * Read-only e offline: NÃO faz HTTP, não usa secrets, não toca em VPS.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const checks = [];
let failed = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) {
      failed += 1;
      checks.push({ label, ok: false, detail: 'retornou false' });
    } else {
      checks.push({ label, ok: true });
    }
  } catch (err) {
    failed += 1;
    checks.push({ label, ok: false, detail: err.message });
  }
}

const routePath = path.join(root, 'src/api/routes/whatsapp-message-history.ts');
const routesIndexPath = path.join(root, 'src/api/routes/index.ts');
const packageJsonPath = path.join(root, 'package.json');
const servicePath = path.join(root, 'src/services/whatsapp/read-only-whatsapp-service.ts');
const clientPath = path.join(root, 'src/gateways/whatsapp/wuzapi-readonly-client.ts');
const typesPath = path.join(root, 'src/gateways/whatsapp/wuzapi-readonly-types.ts');
const auditPath = path.join(root, 'src/gateways/whatsapp/wuzapi-readonly-audit.ts');

const route = fs.readFileSync(routePath, 'utf8');
const routesIndex = fs.readFileSync(routesIndexPath, 'utf8');
const pkg = fs.readFileSync(packageJsonPath, 'utf8');
const service = fs.readFileSync(servicePath, 'utf8');
const client = fs.readFileSync(clientPath, 'utf8');
const types = fs.readFileSync(typesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');

check('arquivo whatsapp-message-history.ts existe', () => fs.existsSync(routePath));
check('exporta createGetWhatsAppMessageHistoryHandler', () =>
  route.includes('export function createGetWhatsAppMessageHistoryHandler'));
check('exporta constante WHATSAPP_MESSAGE_HISTORY_ROUTE', () =>
  route.includes('export const WHATSAPP_MESSAGE_HISTORY_ROUTE'));
check('rota é GET /v1/whatsapp/messages/:chatId/history', () =>
  route.includes("method: 'GET'") &&
  route.includes("path: '/v1/whatsapp/messages/:chatId/history'"));
check('handler consome service.getChatHistory(...)', () =>
  route.includes('deps.service.getChatHistory('));
check('handler valida sufixo de chatId (@s.whatsapp.net|@g.us|@lid)', () =>
  route.includes("endsWith('@g.us')") &&
  route.includes("endsWith('@s.whatsapp.net')") &&
  route.includes("endsWith('@lid')"));
check('handler aplica limite máximo seguro', () =>
  route.includes('WHATSAPP_HISTORY_MAX_LIMIT') &&
  route.includes('Math.min'));
check('handler aplica resolveWorkspaceContext (multi-tenant)', () =>
  route.includes('resolveWorkspaceContext'));
check('handler usa handleSafeError', () => route.includes('handleSafeError'));
check('handler usa resolveRequestId', () => route.includes('resolveRequestId'));
check('resposta marca composedFrom /chat/history', () =>
  route.includes("'/chat/history'"));
check('routes/index.ts re-exporta whatsapp-message-history', () =>
  routesIndex.includes('./whatsapp-message-history'));
check('package.json tem script validate:route:message-history', () =>
  pkg.includes('validate:route:message-history'));

check('service.ts declara getChatHistory(query)', () =>
  service.includes('getChatHistory('));
check('service.ts delega getChatHistory ao client', () =>
  service.includes('getChatHistory: client.getChatHistory'));
check('client.ts implementa getChatHistory chamando /chat/history', () =>
  client.includes("'getChatHistory'") && client.includes("'/chat/history'"));
check('types.ts inclui getChatHistory em WuzApiReadOnlyOperation', () =>
  types.includes("| 'getChatHistory'"));
check('types.ts inclui getChatHistory em WuzApiReadOnlyClient', () =>
  types.includes('getChatHistory(query:'));
check('audit.ts allowlist contém /chat/history', () =>
  audit.includes("operation: 'getChatHistory'") && audit.includes("'/chat/history'"));

const forbiddenFragments = ['process.env.', 'WUZAPI_ADMIN_TOKEN', 'SUPABASE_SERVICE_ROLE'];
check('rota não acessa secrets diretamente', () =>
  forbiddenFragments.every((needle) => !route.includes(needle)));

const writeFragments = ['/chat/send/', '/session/logout', '/group/create', 'DELETE'];
check('rota não menciona fragmentos destrutivos', () =>
  writeFragments.every((needle) => !route.includes(needle)));

check('smoke estrutural completo (sem rede, sem secrets)', () => true);

const summary = {
  totalChecks: checks.length,
  failed,
  status: failed === 0 ? 'OK' : 'FALHOU',
  checks,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(failed === 0 ? 0 : 1);
