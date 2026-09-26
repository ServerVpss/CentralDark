export declare function wakeLockFilePath(): string;
/**
 * Tenta assumir o wake. Retorna ok=true (ganhou ou já era dono) ou ok=false com o dono atual
 * (`ownerIsDev`) quando outra instância viva já detém — startLive() deve recusar sem conectar.
 */
export declare function acquireWakeLock(isDev: boolean, path?: string): {
    ok: boolean;
    ownerIsDev?: boolean;
};
/** Libera o lock só se esta instância (PID) é a dona — nunca derruba a posse de outra instância. */
export declare function releaseWakeLock(path?: string): void;
//# sourceMappingURL=JarvisWakeLock.d.ts.map