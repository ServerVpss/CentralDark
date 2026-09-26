import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = 'E:/CentralDark/Pivete/CentralDark';

function run(cmd, cwd = PROJECT_ROOT) {
    try {
        return execSync(cmd, { cwd, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (e) {
        return e.stdout?.toString() || e.stderr?.toString() || e.message;
    }
}

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

console.log('\n=== DIAGNÓSTICO PROFUNDO NPM/VITE ===\n');

// 1. Verificar o que tem em node_modules
console.log('\n1. Conteúdo de node_modules (primeiros 30):');
const nmPath = path.join(PROJECT_ROOT, 'node_modules');
if (fs.existsSync(nmPath)) {
    const entries = fs.readdirSync(nmPath).sort();
    console.log(`   Total entries: ${entries.length}`);
    console.log(`   Primeiros 30: ${entries.slice(0, 30).join(', ')}`);
    console.log(`   Tem 'vite'? ${fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', 'vite'))}`);
    console.log(`   Tem '@vitejs'? ${fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', '@vitejs'))}`);
} else {
    console.log('   node_modules NÃO EXISTE');
}

// 2. Verificar package-lock.json
console.log('\n2. package-lock.json - entrada vite:');
try {
    const lock = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package-lock.json'), 'utf8'));
    const viteLock = lock.packages?.['node_modules/vite'];
    if (viteLock) {
        console.log(`   version: ${viteLock.version}`);
        console.log(`   resolved: ${viteLock.resolved}`);
        console.log(`   integrity: ${viteLock.integrity?.substring(0, 50)}...`);
        console.log(`   dev: ${viteLock.dev}`);
    } else {
        console.log('   vite NÃO ENCONTRADO no lockfile packages');
    }
} catch (e) {
    console.log('   Erro lendo lockfile:', e.message);
}

// 3. npm ls vite
console.log('\n3. npm ls vite:');
const lsVite = run('npm ls vite 2>&1');
console.log(lsVite);

// 4. npm install dry-run verbose
console.log('\n4. npm install --dry-run --legacy-peer-deps (primeiras 50 linhas):');
const dryRun = run('npm install --dry-run --legacy-peer-deps 2>&1 | head -50');
console.log(dryRun);

// 5. Verificar cache npm
console.log('\n5. npm cache:');
const cacheDir = run('npm config get cache');
console.log(`   cache dir: ${cacheDir}`);
try {
    const cacheVerify = run('npm cache verify 2>&1');
    console.log(cacheVerify.substring(0, 500));
} catch {}

// 6. Verificar se vite está no cache
console.log('\n6. Procurar vite no cache:');
try {
    const cacheDir = run('npm config get cache').trim();
    const findCmd = `find "${cacheDir}" -name "*vite*" -name "*.tgz" 2>/dev/null | head -10`;
    const cacheVite = run(findCmd);
    console.log(cacheVite || '   não encontrado');
} catch {}

// 7. Tentar instalar apenas vite com verbose
console.log('\n7. Tentar instalar APENAS vite com verbose (últimas 30 linhas):');
const installVite = run('npm install vite@5.4.21 --save-dev --legacy-peer-deps --verbose 2>&1 | tail -30');
console.log(installVite);

// 8. Verificar se agora existe
console.log('\n8. Verificar se vite apareceu:');
const vitePath = path.join(PROJECT_ROOT, 'node_modules', 'vite');
console.log(`   Existe: ${fs.existsSync(vitePath)}`);
if (fs.existsSync(vitePath)) {
    const entries = fs.readdirSync(vitePath);
    console.log(`   Conteúdo: ${entries.slice(0, 10).join(', ')}`);
}

// 9. Tentar build
console.log('\n9. Tentar build:');
const buildResult = run('npx vite build 2>&1 | tail -30');
console.log(buildResult.substring(0, 1000));

// 10. Verificar .bin
console.log('\n10. node_modules/.bin:');
const binPath = path.join(PROJECT_ROOT, 'node_modules', '.bin');
if (fs.existsSync(binPath)) {
    const bins = fs.readdirSync(binPath).filter(f => f.includes('vite'));
    console.log(`   vite bins: ${bins.join(', ') || 'NENHUM'}`);
}

console.log('\n=== FIM DIAGNÓSTICO ===');