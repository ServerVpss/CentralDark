import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { acquireWakeLock, releaseWakeLock } from './JarvisWakeLock.js';
describe('JarvisWakeLock (F-117)', () => {
    let dir;
    let lockPath;
    afterEach(() => { if (dir)
        rmSync(dir, { recursive: true, force: true }); });
    function fresh() {
        dir = mkdtempSync(join(tmpdir(), 'jarvis-wake-'));
        lockPath = join(dir, 'jarvis-wake.lock');
    }
    it('primeira instância a chamar acquire ganha o lock', () => {
        fresh();
        const result = acquireWakeLock(true, lockPath);
        expect(result.ok).toBe(true);
        expect(existsSync(lockPath)).toBe(true);
    });
    it('segunda instância (PID diferente vivo) é recusada — só a dona escuta', () => {
        fresh();
        // PID 1 (init/kernel) é vivo e garantidamente != process.pid do teste — proxy de
        // "outra instância viva" sem depender de spawnar um processo real.
        writeFileSync(lockPath, JSON.stringify({ pid: 1, isDev: false, acquiredAt: Date.now() }));
        const result = acquireWakeLock(true, lockPath);
        expect(result.ok).toBe(false);
        expect(result.ownerIsDev).toBe(false);
    });
    it('lock de PID morto é substituído sem bloquear', () => {
        fresh();
        // PID improvável de existir.
        writeFileSync(lockPath, JSON.stringify({ pid: 999_999, isDev: true, acquiredAt: Date.now() }));
        const result = acquireWakeLock(false, lockPath);
        expect(result.ok).toBe(true);
    });
    it('release só remove o lock se esta instância (PID atual) é a dona', () => {
        fresh();
        acquireWakeLock(true, lockPath);
        expect(existsSync(lockPath)).toBe(true);
        releaseWakeLock(lockPath);
        expect(existsSync(lockPath)).toBe(false);
    });
    it('release não derruba o lock de outra instância (PID diferente)', () => {
        fresh();
        writeFileSync(lockPath, JSON.stringify({ pid: 1, isDev: false, acquiredAt: Date.now() }));
        releaseWakeLock(lockPath);
        expect(existsSync(lockPath)).toBe(true);
    });
});
//# sourceMappingURL=JarvisWakeLock.test.js.map