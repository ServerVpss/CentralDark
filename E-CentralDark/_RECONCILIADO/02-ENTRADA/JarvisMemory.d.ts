/**
 * JarvisMemory — memória persistida do Jarvis (C-055) sobre o motor SharedMemory
 * (T-021.4, `~/.overclock-ssh/shared-memory.db`). Uso INTERNO do Jarvis: as tools
 * memory_* NÃO são re-expostas no MCP público.
 *
 * Modelo: 1 fato = 1 scope (`jarvis::<key>`). Como o SharedMemory mantém UMA
 * entrada current por scope (cadeia supersedes), regravar a mesma key atualiza
 * a preferência sem duplicar ("default 3 panes" → "default 2 panes" substitui).
 * forget() é soft-delete (is_current=0) — a cadeia sobrevive pra auditoria, e
 * redizer o fato o ressuscita.
 */
import type { SharedMemory } from '@overclock-app/bus';
/** Normaliza uma key falada em slug estável (acentos fora, kebab-case). */
export declare function slugifyMemoryKey(key: string): string;
export interface JarvisMemoryEntry {
    key: string;
    content: string;
    updatedAt: number;
}
export declare class JarvisMemory {
    private readonly getStore;
    constructor(getStore: () => SharedMemory | undefined);
    get available(): boolean;
    /** Grava/atualiza um fato. Mesma key = supersede; mesma (key, content) = no-op. */
    remember(key: string, content: string): {
        ok: boolean;
        key?: string;
        error?: string;
    };
    /** Lista fatos vivos; com query, filtra por substring em key ou content. */
    recall(query?: string): JarvisMemoryEntry[];
    /** Esquece por key exata, senão por substring — retorna as keys esquecidas. */
    forget(target: string): {
        ok: boolean;
        forgotten: string[];
    };
    /**
     * Bloco de contexto injetado no system prompt (brain SDK e voz Live).
     * Vazio quando não há memórias. Cap de chars: memórias mais recentes primeiro.
     */
    contextBlock(): string;
}
//# sourceMappingURL=JarvisMemory.d.ts.map