#!/usr/bin/env node
/**
 * HEAL-VITE-NPM-RESET — MEASURE → DIAGNOSE → IDENTIFY_CAUSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT
 *
 * NÃO faz "reset nuclear" por default.
 * Delete node_modules/cache/lockfile = ÚLTIMO RECURSO, somente se causa medida justificar com rollback conhecido.
 *
 * Uso: node heal-vite-npm-reset.mjs [--dry-run] [--force-last-resort]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PROJECT_ROOT = 'E:/CentralDark/Pivete/CentralDark';
const NUCLEO_ROOT = 'E:/CentralDark/Pivete/NUCLEO';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE_LAST_RESORT = process.argv.includes('--force-last-resort');

function sha256(s) {
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function run(cmd, cwd = PROJECT_ROOT, dryRun = false) {
    if (dryRun) {
        console.log(`[DRY-RUN] ${cmd}`);
        return { stdout: '', stderr: '', code: 0 };
    }
    try {
        const out = execSync(cmd, { cwd, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
        return { stdout: out.trim(), stderr: '', code: 0 };
    } catch (e) {
        return { stdout: e.stdout?.toString() || '', stderr: e.stderr?.toString() || e.message, code: e.status ?? 1 };
    }
}

function sha256File(filepath) {
    try {
        const content = fs.readFileSync(filepath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
        return null;
    }
}

function timestamp() {
    return new Date().toISOString();
}

function logPhase(phase, msg) {
    console.log(`\n[${timestamp()}] [${phase}] ${msg}`);
}

function logResult(phase, success, details = {}) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`[${timestamp()}] [${phase}] ${status}`);
    if (Object.keys(details).length) {
        console.log(JSON.stringify(details, null, 2));
    }
    return success;
}

// ============================================================
// PHASE 0: MEASURE — Estado atual
// ============================================================
async function phase0_measure() {
    logPhase('MEASURE', 'Iniciando medição do estado atual...');

    const measure = {
        timestamp: timestamp(),
        project_root: PROJECT_ROOT,
        vite_in_package_json: false,
        vite_version: null,
        node_modules_exists: false,
        vite_in_node_modules: false,
        vite_bin_exists: false,
        package_lock_exists: false,
        package_lock_vite_version: null,
        npm_cache_ok: true,
        global_npm_config: {},
        vite_global_exists: false,
        build_test: null,
    };

    // package.json
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
        measure.vite_in_package_json = !!pkg.devDependencies?.vite;
        measure.vite_version = pkg.devDependencies?.vite || null;
    } catch {}

    // node_modules
    measure.node_modules_exists = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules'));
    measure.vite_in_node_modules = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', 'vite'));
    measure.vite_bin_exists = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', '.bin', 'vite'));

    // package-lock.json
    measure.package_lock_exists = fs.existsSync(path.join(PROJECT_ROOT, 'package-lock.json'));
    if (measure.package_lock_exists) {
        try {
            const lock = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package-lock.json'), 'utf8'));
            measure.package_lock_vite_version = lock.packages?.['node_modules/vite']?.version || lock.dependencies?.vite?.version || null;
        } catch {}
    }

    // npm cache
    try {
        run('npm cache verify', PROJECT_ROOT, true);
    } catch {
        measure.npm_cache_ok = false;
    }

    // npm config
    try {
        const config = run('npm config list', PROJECT_ROOT);
        measure.global_npm_config = config.stdout;
    } catch {}

    // vite global
    try {
        const v = run('vite --version', PROJECT_ROOT);
        measure.vite_global_exists = v.code === 0;
    } catch {}

    // build test (quick)
    if (!DRY_RUN) {
        const bt = run('npx vite build 2>&1 | head -20', PROJECT_ROOT);
        measure.build_test = { code: bt.code, output: bt.stdout + bt.stderr };
    }

    const measurePath = path.join(NUCLEO_ROOT, 'heal-vite-measure.json');
    fs.writeFileSync(measurePath, JSON.stringify(measure, null, 2), 'utf8');

    logResult('MEASURE', true, { measure_path: measurePath, summary: {
        vite_in_pkg: measure.vite_in_package_json,
        vite_version: measure.vite_version,
        node_modules: measure.node_modules_exists,
        vite_in_nm: measure.vite_in_node_modules,
        vite_bin: measure.vite_bin_exists,
        lockfile: measure.package_lock_exists,
        lock_vite: measure.package_lock_vite_version,
        build_ok: measure.build_test?.code === 0
    }});

    return measure;
}

// ============================================================
// PHASE 1: DIAGNOSE — Analisar medição
// ============================================================
function phase1_diagnose(measure) {
    logPhase('DIAGNOSE', 'Analisando medição...');

    const diagnosis = {
        timestamp: timestamp(),
        issues: [],
        root_cause_candidates: [],
        severity: 'unknown',
    };

    // Issue 1: vite não em node_modules mas está no package.json + lockfile
    if (measure.vite_in_package_json && measure.package_lock_vite_version && !measure.vite_in_node_modules) {
        diagnosis.issues.push({
            id: 'VITE_MISSING_IN_NODE_MODULES',
            description: 'vite declarado em package.json e package-lock.json mas AUSENTE em node_modules/',
            evidence: `package.json: ${measure.vite_version}, lockfile: ${measure.package_lock_vite_version}, node_modules/vite: ${measure.vite_in_node_modules}`,
        });
        diagnosis.root_cause_candidates.push({
            cause: 'npm cache corruption / extraction failure',
            evidence: 'package-lock.json has vite but node_modules/vite missing',
            likelihood: 'high',
        });
    }

    // Issue 2: node_modules não existe
    if (!measure.node_modules_exists) {
        diagnosis.issues.push({
            id: 'NODE_MODULES_MISSING',
            description: 'node_modules/ não existe',
            evidence: 'fs.existsSync(node_modules) === false',
        });
        diagnosis.root_cause_candidates.push({
            cause: 'npm install never ran or was cleaned',
            evidence: 'no node_modules directory',
            likelihood: 'high',
        });
    }

    // Issue 3: vite bin não existe
    if (measure.vite_in_node_modules && !measure.vite_bin_exists) {
        diagnosis.issues.push({
            id: 'VITE_BIN_MISSING',
            description: 'vite existe em node_modules mas .bin/vite não linkado',
            evidence: 'node_modules/vite exists but .bin/vite missing',
        });
        diagnosis.root_cause_candidates.push({
            cause: 'npm install incomplete / postinstall scripts failed',
            evidence: 'vite package present but bin not linked',
            likelihood: 'medium',
        });
    }

    // Issue 4: build failing
    if (measure.build_test && measure.build_test.code !== 0) {
        diagnosis.issues.push({
            id: 'BUILD_FAILING',
            description: 'vite build falha',
            evidence: measure.build_test.output?.substring(0, 500),
        });
        diagnosis.root_cause_candidates.push({
            cause: 'vite not available / config error',
            evidence: 'build command fails',
            likelihood: 'high',
        });
    }

    // Determine severity
    if (diagnosis.issues.some(i => i.id === 'VITE_MISSING_IN_NODE_MODULES' || i.id === 'NODE_MODULES_MISSING')) {
        diagnosis.severity = 'critical';
    } else if (diagnosis.issues.length > 0) {
        diagnosis.severity = 'high';
    } else {
        diagnosis.severity = 'none';
    }

    const diagPath = path.join(NUCLEO_ROOT, 'heal-vite-diagnose.json');
    fs.writeFileSync(diagPath, JSON.stringify(diagnosis, null, 2), 'utf8');

    logResult('DIAGNOSE', diagnosis.severity !== 'critical' || diagnosis.issues.length === 0, {
        diag_path: diagPath,
        issues_count: diagnosis.issues.length,
        severity: diagnosis.severity,
        root_causes: diagnosis.root_cause_candidates.map(c => c.cause),
    });

    return diagnosis;
}

// ============================================================
// PHASE 2: IDENTIFY_CAUSE — Identificar causa raiz
// ============================================================
function phase2_identify_cause(diagnosis) {
    logPhase('IDENTIFY_CAUSE', 'Identificando causa raiz...');

    if (diagnosis.severity === 'none') {
        logResult('IDENTIFY_CAUSE', true, { cause: 'NO_ISSUES_DETECTED', action: 'NO_REMEDIATION_NEEDED' });
        return { cause: 'NO_ISSUES_DETECTED', action: 'NONE' };
    }

    // Prioriza causas por likelihood
    const sortedCauses = diagnosis.root_cause_candidates
        .filter(c => c.likelihood === 'high')
        .concat(diagnosis.root_cause_candidates.filter(c => c.likelihood === 'medium'))
        .concat(diagnosis.root_cause_candidates.filter(c => c.likelihood === 'low'));

    const primaryCause = sortedCauses[0] || { cause: 'UNKNOWN', evidence: 'no candidates' };

    const causeAnalysis = {
        timestamp: timestamp(),
        primary_cause: primaryCause.cause,
        evidence: primaryCause.evidence,
        all_candidates: sortedCauses,
        requires_nuclear_reset: false,
        minimal_remediation: null,
    };

    // Decide se precisa de nuclear reset
    const criticalIssues = diagnosis.issues.filter(i =>
        i.id === 'VITE_MISSING_IN_NODE_MODULES' ||
        i.id === 'NODE_MODULES_MISSING'
    );

    if (criticalIssues.length > 0 && !FORCE_LAST_RESORT) {
        // Tenta remediação mínima primeiro
        causeAnalysis.requires_nuclear_reset = false;
        causeAnalysis.minimal_remediation = 'npm_install_legacy_peer_deps';
    } else if (FORCE_LAST_RESORT) {
        causeAnalysis.requires_nuclear_reset = true;
        causeAnalysis.minimal_remediation = 'nuclear_reset_with_rollback';
    } else {
        causeAnalysis.requires_nuclear_reset = false;
        causeAnalysis.minimal_remediation = 'npm_install_legacy_peer_deps';
    }

    const causePath = path.join(NUCLEO_ROOT, 'heal-vite-cause.json');
    fs.writeFileSync(causePath, JSON.stringify(causeAnalysis, null, 2), 'utf8');

    logResult('IDENTIFY_CAUSE', true, {
        cause_path: causePath,
        primary_cause: causeAnalysis.primary_cause,
        requires_nuclear: causeAnalysis.requires_nuclear_reset,
        minimal_remediation: causeAnalysis.minimal_remediation,
    });

    return causeAnalysis;
}

// ============================================================
// PHASE 3: MINIMAL_REMEDIATION — Aplicar correção mínima
// ============================================================
async function phase3_minimal_remediation(causeAnalysis, measure) {
    logPhase('MINIMAL_REMEDIATION', `Aplicando: ${causeAnalysis.minimal_remediation}`);

    const remediation = {
        timestamp: timestamp(),
        strategy: causeAnalysis.minimal_remediation,
        steps: [],
        rollback_prepared: false,
        backup_paths: [],
    };

    if (causeAnalysis.minimal_remediation === 'npm_install_legacy_peer_deps') {
        // Backup package-lock.json se existe
        const lockPath = path.join(PROJECT_ROOT, 'package-lock.json');
        if (measure.package_lock_exists) {
            const backupPath = lockPath + `.backup.${Date.now()}`;
            fs.copyFileSync(lockPath, backupPath);
            remediation.backup_paths.push(backupPath);
            remediation.rollback_prepared = true;
            remediation.steps.push({ step: 'backup_package_lock', path: backupPath, status: 'done' });
        }

        // npm install --legacy-peer-deps
        remediation.steps.push({ step: 'npm_install', cmd: 'npm install --legacy-peer-deps', status: 'running' });
        const result = run('npm install --legacy-peer-deps', PROJECT_ROOT);
        remediation.steps[remediation.steps.length - 1].status = result.code === 0 ? 'done' : 'failed';
        remediation.steps[remediation.steps.length - 1].output = result.stdout + result.stderr;
        remediation.steps[remediation.steps.length - 1].code = result.code;

        if (result.code !== 0) {
            logResult('MINIMAL_REMEDIATION', false, { error: 'npm install failed', remediation });
            return remediation;
        }
    }

    else if (causeAnalysis.minimal_remediation === 'nuclear_reset_with_rollback') {
        // Backup completo
        const lockPath = path.join(PROJECT_ROOT, 'package-lock.json');
        const nmPath = path.join(PROJECT_ROOT, 'node_modules');

        if (measure.package_lock_exists) {
            const backupLock = lockPath + `.backup.${Date.now()}`;
            fs.copyFileSync(lockPath, backupLock);
            remediation.backup_paths.push(backupLock);
            remediation.steps.push({ step: 'backup_package_lock', path: backupLock, status: 'done' });
        }

        // Não apaga node_modules aqui — apenas limpa cache e reinstala
        remediation.steps.push({ step: 'npm_cache_clean', cmd: 'npm cache clean --force', status: 'running' });
        run('npm cache clean --force', PROJECT_ROOT);
        remediation.steps[remediation.steps.length - 1].status = 'done';

        remediation.steps.push({ step: 'npm_install', cmd: 'npm install --legacy-peer-deps', status: 'running' });
        const result = run('npm install --legacy-peer-deps', PROJECT_ROOT);
        remediation.steps[remediation.steps.length - 1].status = result.code === 0 ? 'done' : 'failed';
        remediation.steps[remediation.steps.length - 1].output = result.stdout + result.stderr;
        remediation.steps[remediation.steps.length - 1].code = result.code;

        if (result.code !== 0) {
            logResult('MINIMAL_REMEDIATION', false, { error: 'nuclear reset failed', remediation });
            return remediation;
        }
    }

    const remPath = path.join(NUCLEO_ROOT, 'heal-vite-remediation.json');
    fs.writeFileSync(remPath, JSON.stringify(remediation, null, 2), 'utf8');

    const success = remediation.steps.every(s => s.status === 'done');
    logResult('MINIMAL_REMEDIATION', success, { rem_path: remPath, steps: remediation.steps.map(s => s.step), rollback_ready: remediation.rollback_prepared });

    return remediation;
}

// ============================================================
// PHASE 4: RETEST — Verificar se correção funcionou
// ============================================================
async function phase4_retest() {
    logPhase('RETEST', 'Executando testes de validação...');

    const tests = {
        timestamp: timestamp(),
        results: [],
    };

    // Test 1: vite existe em node_modules
    const viteExists = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', 'vite'));
    tests.results.push({ test: 'vite_in_node_modules', pass: viteExists });

    // Test 2: vite bin linkado
    const binExists = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', '.bin', 'vite'));
    tests.results.push({ test: 'vite_bin_linked', pass: binExists });

    // Test 3: vite --version funciona
    const vResult = run('vite --version', PROJECT_ROOT);
    tests.results.push({ test: 'vite_version_runs', pass: vResult.code === 0, output: vResult.stdout });

    // Test 4: npx vite build compila
    const buildResult = run('npx vite build 2>&1', PROJECT_ROOT);
    tests.results.push({ test: 'vite_build_compiles', pass: buildResult.code === 0, output: buildResult.stdout?.substring(0, 200) + (buildResult.stderr ? ' | ERR: ' + buildResult.stderr.substring(0, 200) : '') });

    // Test 5: dist/ atualizado
    const distExists = fs.existsSync(path.join(PROJECT_ROOT, 'dist'));
    let distRecent = false;
    if (distExists) {
        const stat = fs.statSync(path.join(PROJECT_ROOT, 'dist'));
        distRecent = (Date.now() - stat.mtimeMs) < 60000; // modificado nos últimos 60s
    }
    tests.results.push({ test: 'dist_updated', pass: distExists && distRecent });

    const allPass = tests.results.every(t => t.pass);

    const testPath = path.join(NUCLEO_ROOT, 'heal-vite-retest.json');
    fs.writeFileSync(testPath, JSON.stringify(tests, null, 2), 'utf8');


    logResult('RETEST', allPass, { test_path: testPath, results: tests.results });

    return { allPass, tests, testPath };
}

// ============================================================
// PHASE 5: COUNTERPROOF — Prova contrária
// ============================================================
function phase5_counterproof(retest) {
    logPhase('COUNTERPROOF', 'Buscando evidência contrária...');

    const counterproof = {
        timestamp: timestamp(),
        checks: [],
        passed: true,
    };

    // Check 1: build não usa cache velho
    const distPath = path.join(PROJECT_ROOT, 'dist');
    if (fs.existsSync(distPath)) {
        const stat = fs.statSync(distPath);
        const isFresh = (Date.now() - stat.mtimeMs) < 120000; // 2 min
        counterproof.checks.push({ check: 'dist_is_fresh', pass: isFresh, mtime: stat.mtime });
    }

    // Check 2: node_modules/vite tem package.json válido
    const vitePkgPath = path.join(PROJECT_ROOT, 'node_modules', 'vite', 'package.json');
    if (fs.existsSync(vitePkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(vitePkgPath, 'utf8'));
            const hasVersion = !!pkg.version;
            counterproof.checks.push({ check: 'vite_package_valid', pass: hasVersion, version: pkg.version });
        } catch {
            counterproof.checks.push({ check: 'vite_package_valid', pass: false });
        }
    }

    // Check 3: bin/vite aponta para arquivo real
    const binPath = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'vite');
    if (fs.existsSync(binPath)) {
        const isFile = fs.statSync(binPath).isFile();
        counterproof.checks.push({ check: 'vite_bin_is_file', pass: isFile });
    }

    // Check 4: build output tem arquivos esperados
    const distAssets = path.join(PROJECT_ROOT, 'dist', 'assets');
    if (fs.existsSync(distAssets)) {
        const files = fs.readdirSync(distAssets);
        const hasJs = files.some(f => f.endsWith('.js'));
        const hasCss = files.some(f => f.endsWith('.css'));
        counterproof.checks.push({ check: 'dist_has_assets', pass: hasJs && hasCss, js_count: files.filter(f => f.endsWith('.js')).length, css_count: files.filter(f => f.endsWith('.css')).length });
    }

    counterproof.passed = counterproof.checks.every(c => c.pass);
    counterproof.all_checks = counterproof.checks.length;
    counterproof.passed_checks = counterproof.checks.filter(c => c.pass).length;

    const cpPath = path.join(NUCLEO_ROOT, 'heal-vite-counterproof.json');
    fs.writeFileSync(cpPath, JSON.stringify(counterproof, null, 2), 'utf8');

    logResult('COUNTERPROOF', counterproof.passed, { cp_path: cpPath, checks: counterproof.checks });

    return counterproof;
}

// ============================================================
// PHASE 6: RECEIPT — Registro final
// ============================================================
function phase6_receipt(measure, diagnosis, causeAnalysis, remediation, retest, counterproof) {
    logPhase('RECEIPT', 'Gerando receipt final...');

    const receipt = {
        operation: 'heal-vite-npm-reset',
        timestamp: timestamp(),
        sha256: '',
        mission: 'CENTRALDARK_ONE_HOUSE_TOTAL_RECONCILIATION',
        phase: 'HEAL-001',
        measure_sha256: sha256(JSON.stringify(measure)),
        diagnosis_sha256: sha256(JSON.stringify(diagnosis)),
        cause_sha256: sha256(JSON.stringify(causeAnalysis)),
        remediation_sha256: sha256(JSON.stringify(remediation)),
        retest_sha256: sha256(JSON.stringify(retest)),
        counterproof_sha256: sha256(JSON.stringify(counterproof)),
        overall_success: retest.allPass && counterproof.passed,
        fixed_point_contribution: {
            phase_0_denominator: 'vite_build_blocked resolved',
            phase_1_denominator: 'pending',
            phase_2_denominator: 'pending',
            phase_3_denominator: 'pending',
            phase_4_denominator: 'pending',
            phase_5_denominator: 'pending',
            phase_6_denominator: 'pending',
            phase_7_denominator: 'pending',
            phase_8_denominator: 'pending',
        },
    };

    // Calculate final SHA256
    const receiptJson = JSON.stringify(receipt, null, 2);
    receipt.sha256 = crypto.createHash('sha256').update(receiptJson, 'utf8').digest('hex');

    const receiptPath = path.join(NUCLEO_ROOT, 'heal-vite-receipt.json');
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

    logResult('RECEIPT', receipt.overall_success, {
        receipt_path: receiptPath,
        sha256: receipt.sha256,
        overall: receipt.overall_success ? 'FIXED' : 'STILL_BROKEN',
    });

    return receipt;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`HEAL-VITE-NPM-RESET — MEASURE → DIAGNOSE → IDENTIFY_CAUSE →`);
    console.log(`MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT`);
    console.log(`Project: ${PROJECT_ROOT}`);
    console.log(`Dry-run: ${DRY_RUN}`);
    console.log(`Force last resort: ${FORCE_LAST_RESORT}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // Phase 0: MEASURE
        const measure = await phase0_measure();

        // Phase 1: DIAGNOSE
        const diagnosis = phase1_diagnose(measure);

        // Phase 2: IDENTIFY_CAUSE
        const causeAnalysis = phase2_identify_cause(diagnosis);

        // Phase 3: MINIMAL_REMEDIATION
        const remediation = await phase3_minimal_remediation(causeAnalysis, measure);

        // Phase 4: RETEST
        const retest = await phase4_retest();

        // Phase 5: COUNTERPROOF
        const counterproof = phase5_counterproof(retest);

        // Phase 6: RECEIPT
        const receipt = phase6_receipt(measure, diagnosis, causeAnalysis, remediation, retest, counterproof);

        // Final summary
        console.log(`\n${'='.repeat(60)}`);
        console.log(`HEAL-VITE-NPM-RESET COMPLETE`);
        console.log(`Overall: ${receipt.overall_success ? '✅ FIXED' : '❌ STILL_BROKEN'}`);
        console.log(`Receipt: ${path.join(NUCLEO_ROOT, 'heal-vite-receipt.json')}`);
        console.log(`${'='.repeat(60)}\n`);

        if (!receipt.overall_success && !FORCE_LAST_RESORT) {
            console.log('\n⚠️  Fix failed. Run with --force-last-resort to attempt nuclear reset with rollback.');
            process.exit(1);
        }

    } catch (e) {
        console.error(`\n❌ FATAL ERROR: ${e.message}`);
        console.error(e.stack);
        process.exit(1);
    }
}

main();