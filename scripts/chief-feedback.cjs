#!/usr/bin/env node
'use strict';

const engine = require('./lib/chief-feedback-engine.cjs');

function hasJsonFlag(args) {
  return args.includes('--json');
}

function stripFlags(args) {
  return args.filter((arg) => arg !== '--json');
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printMaybeJson(value, json, renderer) {
  if (json) return printJson(value);
  if (renderer) return process.stdout.write(`${renderer(value)}\n`);
  return printJson(value);
}

function main(argv = process.argv.slice(2)) {
  const json = hasJsonFlag(argv);
  const clean = stripFlags(argv);
  const [cmd = 'status', ...rest] = clean;
  const message = rest.join(' ');

  if (cmd === 'detect') return printJson(engine.detectFeedback(message, { surface: 'cli' }));
  if (cmd === 'classify') return printJson(engine.classifyFeedback(message, { surface: 'cli' }));
  if (cmd === 'record') {
    return printJson(engine.recordFeedback({
      message,
      source: process.env.CENTRALDARK_FEEDBACK_SOURCE || 'cli',
      surface: 'cli',
      metadata: {
        source_ref: process.env.CENTRALDARK_FEEDBACK_SOURCE_REF || '',
        message_id: process.env.CENTRALDARK_FEEDBACK_MESSAGE_ID || '',
      },
    }));
  }
  if (cmd === 'status') return printMaybeJson(engine.getStatus(), json);
  if (cmd === 'card') return process.stdout.write(`${engine.renderSatisfactionCard(engine.getStatus())}\n`);
  if (cmd === 'telegram-card') return process.stdout.write(`${engine.renderTelegramCard(engine.getStatus())}\n`);
  if (cmd === 'history') return printJson(engine.getHistory());
  if (cmd === 'rebuild-summary' || cmd === 'verify') return printJson(engine.rebuildSummary());
  process.stderr.write('Uso: chief-feedback.cjs detect|classify|record|status|card|telegram-card|history|verify|rebuild-summary [--json] [mensagem]\n');
  process.exitCode = 2;
}

if (require.main === module) main();

module.exports = {
  ...engine,
  detect: engine.detectFeedback,
  record: engine.recordFeedback,
  status: engine.getStatus,
  formatTelegramCard: engine.renderTelegramCard,
};
