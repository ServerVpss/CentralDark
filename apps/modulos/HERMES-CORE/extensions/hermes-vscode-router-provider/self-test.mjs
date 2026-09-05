import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('./extension.js', import.meta.url), 'utf8');
const caps = fs.readFileSync(new URL('./CAPABILITIES.yml', import.meta.url), 'utf8');

const required = [
  'centraldarkGit.status', 'centraldarkGit.graph', 'centraldarkGit.currentLineBlame',
  'centraldarkGit.toggleFileBlame', 'centraldarkGit.fileHistory', 'centraldarkGit.lineHistory',
  'centraldarkGit.commitDetails', 'centraldarkGit.compareRevision', 'centraldarkGit.refs',
  'centraldarkGit.worktrees', 'centraldarkGit.createWorktree', 'centraldarkGit.checkoutBranch',
  'centraldarkGit.stashes', 'centraldarkGit.contributors', 'centraldarkGit.launchpad',
  'centraldarkGit.copyPatch', 'centraldarkGit.openRemote', 'centraldarkGit.refresh'
];

const manifestCommands = new Set((manifest.contributes?.commands || []).map(x => x.command));
const missingManifest = required.filter(x => !manifestCommands.has(x));
const missingSource = required.filter(x => !source.includes(x));
const failures = [];
if (manifest.publisher !== 'centraldark-local') failures.push('publisher');
if (manifest.name !== 'hermes-vscode-router-provider') failures.push('identity');
if (missingManifest.length) failures.push(`manifest:${missingManifest.join(',')}`);
if (missingSource.length) failures.push(`source:${missingSource.join(',')}`);
for (const marker of ['CLEAN_ROOM_BEHAVIORAL_REIMPLEMENTATION','SEALED_UNCHANGED_CAPABILITY','UNKNOWN_UNTIL_CASA_MEASURES']) {
  if (!caps.includes(marker)) failures.push(`capability_contract:${marker}`);
}

console.log(`EXTENSION_ID=${manifest.publisher}.${manifest.name}`);
console.log(`COMMANDS=${required.length}`);
console.log(`MANIFEST_COMMANDS=${manifestCommands.size}`);
console.log(`MISSING_MANIFEST=${missingManifest.length}`);
console.log(`MISSING_SOURCE=${missingSource.length}`);
console.log(`SELF_TEST=${failures.length ? 'FAIL' : 'PASS'}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
