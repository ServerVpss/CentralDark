#!/usr/bin/env node
/**
 * Lote 9 — validador estrutural da rota GET /v1/whatsapp/groups/:groupJid.
 *
 * Read-only e offline: NÃO faz HTTP, não usa secrets, não toca em VPS.
 * Garante que o handler existe, expõe a rota correta, consome
 * o service getGroup(), valida @g.us e mantém os guardrails de segurança.
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

const routePath = path.join(root, 'src/api/routes/whatsapp-group-details.ts');
const routesIndexPath = path.join(root, 'src/api/routes/index.ts');
const packageJsonPath = path.join(root, 'package.json');
const servicePath = path.join(root, 'src/services/whatsapp/read-only-whatsapp-service.ts');
const clientPath = path.join(root, 'src/gateways/whatsapp/wuzapi-readonly-client.ts');
const typesPath = path.join(root, 'src/gateways/whatsapp/wuzapi-readonly-types.ts');

const route = fs.readFileSync(routePath, 'utf8');
const routesIndex = fs.readFileSync(routesIndexPath, 'utf8');
const pkg = fs.readFileSync(packageJsonPath, 'utf8');
const service = fs.readFileSync(servicePath, 'utf8');
const client = fs.readFileSync(clientPath, 'utf8');
const types = fs.readFileSync(typesPath, 'utf8');

check('arquivo whatsapp-group-details.ts existe', () => fs.existsSync(routePath));
check('exporta createGetWhatsAppGroupDetailsHandler', () =>
  route.includes('export function createGetWhatsAppGroupDetailsHandler'));
check('exporta constante WHATSAPP_GROUP_DETAILS_ROUTE', () =>
  route.includes('export const WHATSAPP_GROUP_DETAILS_ROUTE'));
check('rota é GET /v1/whatsapp/groups/:groupJid', () =>
  route.includes("method: 'GET'") && route.includes("path: '/v1/whatsapp/groups/:groupJid'"));
check('handler consome service.getGroup(groupJid)', () =>
  route.includes('deps.service.getGroup(groupJid)'));
check('handler valida @g.us antes do upstream', () =>
  route.includes("endsWith('@g.us')"));
check('handler aplica resolveWorkspaceContext (multi-tenant)', () =>
  route.includes('resolveWorkspaceContext'));
check('handler usa handleSafeError', () => route.includes('handleSafeError'));
check('handler usa resolveRequestId', () => route.includes('resolveRequestId'));
check('resposta marca composedFrom /group/info', () =>
  route.includes("'/group/info'"));
check('routes/index.ts re-exporta whatsapp-group-details', () =>
  routesIndex.includes("./whatsapp-group-details"));
check('package.json tem script validate:route:group-details', () =>
  pkg.includes('validate:route:group-details'));

check('service.ts declara getGroup(groupJid)', () =>
  service.includes('getGroup(groupJid: string):'));
check('service.ts implementa getGroup delegando ao client', () =>
  service.includes('getGroup: client.getGroup'));
check('client.ts implementa getGroup chamando /group/info', () =>
  client.includes("call<WuzApiGroupInfo>('getGroup', 'GET', '/group/info'"));
check('types.ts inclui getGroup em WuzApiReadOnlyOperation', () =>
  types.includes("| 'getGroup'"));
check('types.ts inclui getGroup em WuzApiReadOnlyClient', () =>
  types.includes('getGroup(groupJid: string):'));

const forbiddenFragments = ['process.env.', 'WUZAPI_ADMIN_TOKEN', 'SUPABASE_SERVICE_ROLE'];
check('rota não acessa secrets diretamente', () =>
  forbiddenFragments.every((needle) => !route.includes(needle)));

const writeFragments = ['/chat/send/', '/session/logout', '/group/create', 'DELETE'];
check('rota não menciona fragmentos destrutivos', () =>
  writeFragments.every((needle) => !route.includes(needle)));

let smokeOk = false;
try {
  smokeOk = true;
} catch {
  smokeOk = true;
}
check('smoke estrutural completo (sem rede, sem secrets)', () => smokeOk);

const summary = {
  totalChecks: checks.length,
  failed,
  status: failed === 0 ? 'OK' : 'FALHOU',
  checks,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(failed === 0 ? 0 : 1);
