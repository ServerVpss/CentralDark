/**
 * JarvisWakeLock — mutex de wake/listening entre instâncias dev↔prod no MESMO mic (F-117).
 *
 * "2 Jarvis falando comigo": dev e prod, cada um com wake/listening ativo, respondem os dois
 * à mesma fala. Mesma classe de bug da família isolamento-por-identidade (F-010/F-017/F-018/
 * F-019/F-025) — o mic/wake é mais um recurso compartilhado entre instâncias que nasceu sem
 * identidade. Fix: lockfile de posse (`~/.overclock-ssh/jarvis-wake.lock`) com PID+identidade —
 * a primeira instância que liga o orb detém o wake; a outra recusa startLive() e indica.
 *
 * Decisão de posse é do USUÁRIO, não de dev-vs-prod (F-117 dossiê): default = primeira a ligar.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
export function wakeLockFilePath() {
    return join(homedir(), '.overclock-ssh', 'jarvis-wake.lock');
}
/** true se o PID ainda está vivo (signal 0 não mata). EPERM (existe, sem permissão pra sinalizar
 *  — ex. PID 1) ainda conta como vivo; só ESRCH (processo inexistente) é morto. */
function isPidAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (err) {
        return err?.code === 'EPERM';
    }
}
function readLock(path) {
    if (!existsSync(path))
        return null;
    try {
        const data = JSON.parse(readFileSync(path, 'utf8'));
        if (typeof data?.pid !== 'number')
            return null;
        return data;
    }
    catch {
        return null;
    }
}
/**
 * Tenta assumir o wake. Retorna ok=true (ganhou ou já era dono) ou ok=false com o dono atual
 * (`ownerIsDev`) quando outra instância viva já detém — startLive() deve recusar sem conectar.
 */
export function acquireWakeLock(isDev, path = wakeLockFilePath()) {
    const existing = readLock(path);
    if (existing && existing.pid !== process.pid && isPidAlive(existing.pid)) {
        return { ok: false, ownerIsDev: existing.isDev };
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify({ pid: process.pid, isDev, acquiredAt: Date.now() }));
    return { ok: true };
}
/** Libera o lock só se esta instância (PID) é a dona — nunca derruba a posse de outra instância. */
export function releaseWakeLock(path = wakeLockFilePath()) {
    const existing = readLock(path);
    if (!existing || existing.pid !== process.pid)
        return;
    try {
        unlinkSync(path);
    }
    catch { /* já sumiu */ }
}
//# sourceMappingURL=JarvisWakeLock.js.map