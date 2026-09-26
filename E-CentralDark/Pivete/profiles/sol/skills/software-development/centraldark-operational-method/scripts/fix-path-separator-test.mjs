#!/usr/bin/env node
/**
 * Fix path separator assertion in validar-identidade-operacional.test.mjs
 * Windows returns backslash paths, test expects forward slash.
 * Run from repo root: node scripts/lupa/fix-path-separator-test.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const TEST_FILE = resolve('scripts/lupa/validar-identidade-operacional.test.mjs');

async function fixPathSeparator() {
  const content = await readFile(TEST_FILE, 'utf8');
  
  // Find the failing assertion around line 610
  // The issue: actual 'src\\adapter.ts' vs expected 'src/adapter.ts'
  // Fix: normalize both sides to use path.sep or forward slash
  
  const fixed = content.replace(
    /assert\.strictEqual\(actual, expected\);/,
    `// Normalize path separators for cross-platform compatibility
    const normalizedActual = actual.replace(/\\\\/g, '/');
    const normalizedExpected = expected.replace(/\\\\/g, '/');
    assert.strictEqual(normalizedActual, normalizedExpected);`
  );
  
  if (fixed !== content) {
    await writeFile(TEST_FILE, fixed, 'utf8');
    console.log('✅ Fixed path separator assertion in validar-identidade-operacional.test.mjs');
  } else {
    console.log('⚠️ Pattern not found, manual fix needed');
    console.log('Search for: assert.strictEqual(actual, expected); near line 610');
  }
}

fixPathSeparator().catch(console.error);