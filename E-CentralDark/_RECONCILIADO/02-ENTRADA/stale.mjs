#!/usr/bin/env node
// Escala issues da sentinela que passaram do TTL.
import { execSync } from 'node:child_process';

const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const TTL = Number(process.env.TTL_DIAS || 7);

const out = execSync(
  `gh issue list -R "${REPO}" --state open --label sentinela --json number,title,createdAt,labels --limit 100`,
  { encoding: 'utf8' }
);
const issues = JSON.parse(out);
const agora = Date.now();

for (const i of issues) {
  const idade = (agora - new Date(i.createdAt).getTime()) / 86400000;
  const labels = i.labels.map((l) => l.name);
  if (idade < TTL) continue;
  if (labels.includes('stale')) continue;
  try {
    execSync(`gh issue edit ${i.number} -R "${REPO}" --add-label stale`, { stdio: 'ignore' });
    execSync(
      `gh issue comment ${i.number} -R "${REPO}" -b "⏰ Stale: ${Math.round(idade)}d sem PR linkado. Bot dono precisa agir ou reassignar."`,
      { stdio: 'ignore' }
    );
    console.log(`Stale: #${i.number} (${Math.round(idade)}d)`);
  } catch (e) {
    console.error(`Erro #${i.number}:`, e.message);
  }
}
