import { chmod, readdir } from 'node:fs/promises';
import path from 'node:path';

if (process.platform === 'win32') {
  console.log('HUB_DIST_PERMISSIONS=SKIP_WINDOWS');
  process.exit(0);
}

const root = path.resolve('dist');

async function walk(dir) {
  await chmod(dir, 0o755);
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) await chmod(full, 0o644);
  }
}

await walk(root);
console.log('HUB_DIST_PERMISSIONS=PASS D755_F644');
