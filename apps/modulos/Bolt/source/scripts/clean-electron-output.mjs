import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve(process.cwd(), 'dist');
rmSync(output, { recursive: true, force: true });
console.log(`ELECTRON_OUTPUT_CLEAN=${output}`);
