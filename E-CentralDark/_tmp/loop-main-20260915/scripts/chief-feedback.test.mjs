import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repo = '/root/CentralDark';
const dataDir = mkdtempSync(join(tmpdir(), 'centraldark-chief-feedback-'));
process.env.CENTRALDARK_CHIEF_FEEDBACK_DIR = dataDir;
process.env.CENTRALDARK_CHIEF_FEEDBACK_LEDGER = join(dataDir, 'events.jsonl');
process.env.CENTRALDARK_CHIEF_FEEDBACK_SUMMARY = join(dataDir, 'summary.json');

const enginePath = join(repo, 'scripts/lib/chief-feedback-engine.cjs');
delete require.cache[require.resolve(enginePath)];
const engine = require(enginePath);

try {
  assert.equal(engine.detectFeedback('obrigado').suggestedPoints, 1, 'obrigado -> +1');
  assert.equal(engine.detectFeedback('gostei').suggestedPoints, 1, 'gostei -> +1');
  assert.equal(engine.detectFeedback('obrgado +1 ponto').suggestedPoints, 1, 'obrgado +1 ponto -> +1');
  assert.equal(engine.detectFeedback('+3 pontos').suggestedPoints, 3, '+3 pontos -> +3');
  assert.equal(engine.detectFeedback('obrigado, gostei, ficou perfeito, você é foda').suggestedPoints, 1, 'feedback composto -> +1');
  assert.equal(engine.detectFeedback('sem feedback material').suggestedPoints, 0, 'sem feedback -> +0');
  assert.equal(engine.detectFeedback('saldçade de tu de coraçaop <3 bom te er de volta').suggestedPoints, 1, 'saudade/coração/de volta -> +1');

  const quoted = engine.detectFeedback('```\nExemplo: obrigado +1 ponto\n```\nTexto citado/documentação contendo obrigado não registra.');
  assert.equal(quoted.detected, false, 'texto citado/documentação não registra automaticamente');
  assert.equal(quoted.suppressed, true, 'texto citado deve ser suprimido');

  const first = engine.recordFeedback({
    message: 'obrigado +1 ponto',
    source: 'telegram',
    surface: 'telegram',
    metadata: { message_id: '42', source_ref: 'telegram:1:42' },
  });
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(first.points_added, 1);

  const duplicate = engine.recordFeedback({
    message: 'obrigado +1 ponto',
    source: 'telegram',
    surface: 'telegram',
    metadata: { message_id: '42', source_ref: 'telegram:1:42' },
  });
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.points_added, 0);
  assert.equal(duplicate.code, 'EVENT_ALREADY_REGISTERED');

  const imported = engine.recordFeedback({
    message: '+3 pontos, muito bem',
    source: 'session-history',
    surface: 'session-history',
    metadata: { source_ref: '@session:test#1', imported: true, timestamp: '2026-09-01T00:00:00.000Z' },
    imported: true,
  });
  assert.equal(imported.points_added, 3);

  const cliA = engine.recordFeedback({
    message: 'valeu',
    source: 'cli',
    surface: 'cli',
    metadata: { source_ref: 'cli' },
  });
  assert.equal(cliA.ok, true);
  assert.equal(cliA.duplicate, false);
  assert.equal(cliA.points_added, 1, 'CLI sem message_id não colide com outro CLI');

  const cliB = engine.recordFeedback({
    message: '+2 pontos pra voce',
    source: 'cli',
    surface: 'cli',
    metadata: { source_ref: 'cli' },
  });
  assert.equal(cliB.duplicate, false);
  assert.equal(cliB.points_added, 2, '+2 pontos CLI entra separado');

  const status = engine.getStatus();
  assert.equal(status.total_satisfaction_points, 7);
  assert.equal(status.imported_satisfaction_points, 3);
  assert.equal(status.live_satisfaction_points, 4);
  assert.equal(status.level, 2);
  assert.equal(status.points_to_next, 3);

  const rebuilt = engine.rebuildSummary();
  assert.equal(rebuilt.total_satisfaction_points, status.total_satisfaction_points, 'summary reconstruível a partir do ledger');

  const cliCard = engine.renderSatisfactionCard(status);
  assert.match(cliCard, /CENTRALDARK/);
  assert.match(cliCard, /Satisfação/);
  const telegramCard = engine.renderTelegramCard(status);
  assert.match(telegramCard, /^<pre>/);
  assert.match(telegramCard, /EVOLUÇÃO DO CHEFE/);

  const cliEnv = {
    ...process.env,
    CENTRALDARK_CHIEF_FEEDBACK_DIR: dataDir,
    CENTRALDARK_CHIEF_FEEDBACK_LEDGER: join(dataDir, 'events.jsonl'),
    CENTRALDARK_CHIEF_FEEDBACK_SUMMARY: join(dataDir, 'summary.json'),
  };
  const detectRun = spawnSync('node', [join(repo, 'scripts/chief-feedback.cjs'), 'detect', 'gostei muito'], { encoding: 'utf8', env: cliEnv });
  assert.equal(detectRun.status, 0, detectRun.stderr);
  assert.equal(JSON.parse(detectRun.stdout).detected, true);
  const statusRun = spawnSync('node', [join(repo, 'scripts/chief-feedback.cjs'), 'status', '--json'], { encoding: 'utf8', env: cliEnv });
  assert.equal(statusRun.status, 0, statusRun.stderr);
  assert.equal(JSON.parse(statusRun.stdout).total_satisfaction_points, 7);
  const cardRun = spawnSync('node', [join(repo, 'scripts/chief-feedback.cjs'), 'card'], { encoding: 'utf8', env: cliEnv });
  assert.equal(cardRun.status, 0, cardRun.stderr);
  assert.match(cardRun.stdout, /CENTRALDARK/);

  const invalidDir = mkdtempSync(join(tmpdir(), 'centraldark-chief-feedback-invalid-'));
  const invalidLedger = join(invalidDir, 'events.jsonl');
  const invalidSummary = join(invalidDir, 'summary.json');
  require('node:fs').writeFileSync(invalidLedger, '{broken json}\n');
  assert.throws(
    () => engine.readLedger(invalidLedger),
    /CHIEF_FEEDBACK_LEDGER_INVALID/,
    'ledger inválido deve falhar explicitamente',
  );
  rmSync(invalidDir, { recursive: true, force: true });
} finally {
  rmSync(dataDir, { recursive: true, force: true });
}
