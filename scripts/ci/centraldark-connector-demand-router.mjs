#!/usr/bin/env node

import process from 'node:process';

export const CONNECTORS = Object.freeze({
  GitHub: {
    domains: ['repo', 'pr', 'issue', 'commit', 'branch', 'workflow', 'check', 'release', 'ruleset'],
    canWebhookOnDemand: true,
    secretPolicy: 'NO_SECRET_IN_CODE_OR_RECEIPT',
  },
  Gmail: {
    domains: ['email', 'inbox', 'thread', 'draft', 'attachment'],
    canWebhookOnDemand: true,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Google_Calendar: {
    domains: ['calendar', 'meeting', 'event', 'agenda', 'free_busy', 'invitation'],
    canWebhookOnDemand: true,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Google_Contacts: {
    domains: ['contact', 'person', 'recipient', 'attendee', 'directory'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Google_Drive: {
    domains: ['drive', 'doc', 'sheet', 'slide', 'file', 'folder'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Malwarebytes: {
    domains: ['phishing', 'scam', 'domain', 'link', 'phone', 'email_reputation'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Notion: {
    domains: ['notion', 'page', 'database', 'task', 'workspace_doc'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  OpenAI_Platform: {
    domains: ['openai_api_key', 'openai_platform', 'api_key_setup'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_IN_CHAT',
  },
  Plugin_Management: {
    domains: ['plugin', 'connector_discovery', 'integration_discovery'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  Remote_Desktop_Commander: {
    domains: ['local_file', 'remote_desktop', 'terminal', 'casa', 'windows', 'runtime_local'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
  files: {
    domains: ['conversation_file', 'library_file', 'attachment', 'pdf', 'zip', 'image', 'document'],
    canWebhookOnDemand: false,
    secretPolicy: 'NO_SECRET_EXPOSURE',
  },
});

export const RULE_ZERO_ORDER = Object.freeze([
  'CHEFE_INTENT',
  'CENTRALDARK',
  'LIVE_STATE',
  'ALIGNMENT',
  'MINIMAL_DELTA',
  'EVIDENCE',
  'COUNTERPROOF',
  'REALITY_JUDGE',
]);

export const LOCALES = Object.freeze(['pt-BR', 'en-US', 'es']);

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function routeDemand(input = '') {
  const text = normalizeText(input);
  const selected = [];

  for (const [name, config] of Object.entries(CONNECTORS)) {
    const hit = config.domains.some((domain) => text.includes(normalizeText(domain).replace(/_/g, ' ')) || text.includes(normalizeText(domain)));
    if (hit) selected.push(name);
  }

  if (/\b(pr|pull request|issue|commit|workflow|github|repo|branch|check)\b/i.test(input)) selected.push('GitHub');
  if (/\b(email|gmail|inbox|thread|draft)\b/i.test(input)) selected.push('Gmail');
  if (/\b(calendar|agenda|meeting|evento|reuniao)\b/i.test(input)) selected.push('Google_Calendar');
  if (/\b(contact|contato|pessoa|recipient|attendee)\b/i.test(input)) selected.push('Google_Contacts');
  if (/\b(drive|doc|sheet|slide|arquivo|folder|pasta)\b/i.test(input)) selected.push('Google_Drive');
  if (/\b(remote desktop|commander|casa|windows|runtime local|terminal)\b/i.test(input)) selected.push('Remote_Desktop_Commander');
  if (/\b(pdf|zip|attachment|anexo|print|image|imagem|arquivo da conversa)\b/i.test(input)) selected.push('files');
  if (/\b(plugin|connector|conector|integracao|integration)\b/i.test(input)) selected.push('Plugin_Management');
  if (/\b(phishing|scam|malware|dominio suspeito|link suspeito)\b/i.test(input)) selected.push('Malwarebytes');
  if (/\b(notion|database|workspace doc)\b/i.test(input)) selected.push('Notion');
  if (/\b(openai api|api key|openai platform|sk-proj)\b/i.test(input)) selected.push('OpenAI_Platform');

  return [...new Set(selected)];
}

export function planConnectorActivation(input = {}) {
  const demand = String(input.demand ?? '');
  const requestedWebhook = Boolean(input.requestedWebhook);
  const connectors = routeDemand(demand);
  const unknownDemand = connectors.length === 0;

  return {
    status: unknownDemand ? 'UNKNOWN_DEMAND' : 'ROUTED_ON_DEMAND',
    ruleZeroOrder: RULE_ZERO_ORDER,
    localeAxes: LOCALES,
    connectors: connectors.map((name) => ({
      name,
      activation: 'ON_DEMAND_ONLY',
      canWebhookOnDemand: CONNECTORS[name].canWebhookOnDemand,
      webhookAction: requestedWebhook && CONNECTORS[name].canWebhookOnDemand
        ? 'DISCOVER_SCHEMA_BEFORE_CREATE'
        : requestedWebhook
          ? 'BLOCKED_NO_WEBHOOK_SCHEMA_FOR_CONNECTOR'
          : 'NO_WEBHOOK_REQUESTED',
      secretPolicy: CONNECTORS[name].secretPolicy,
    })),
    forbidden: [
      'ACTIVATE_ALL_CONNECTORS_BLINDLY',
      'WEBHOOK_WITHOUT_SCHEMA',
      'SECRET_IN_CODE_OR_RECEIPT',
      'UNKNOWN_AS_PASS',
      'DOCUMENTED_AS_EXECUTED',
      'ACTION_AS_PROOF',
      'V2_V3_V4_WITHOUT_PROVEN_GAP',
    ],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const demand = process.argv.slice(2).join(' ');
  const plan = planConnectorActivation({ demand, requestedWebhook: /webhook/i.test(demand) });
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  process.exit(plan.status === 'UNKNOWN_DEMAND' ? 2 : 0);
}
