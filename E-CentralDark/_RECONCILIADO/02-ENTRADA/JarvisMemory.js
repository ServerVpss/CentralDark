const SCOPE_PREFIX = 'jarvis::';
const CONTEXT_BLOCK_MAX_CHARS = 4000;
/** Normaliza uma key falada em slug estável (acentos fora, kebab-case). */
export function slugifyMemoryKey(key) {
    return key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'fato';
}
function toEntry(row) {
    return {
        key: row.scope.slice(SCOPE_PREFIX.length),
        content: row.content,
        updatedAt: row.updated_at,
    };
}
export class JarvisMemory {
    getStore;
    constructor(getStore) {
        this.getStore = getStore;
    }
    get available() {
        return Boolean(this.getStore());
    }
    /** Grava/atualiza um fato. Mesma key = supersede; mesma (key, content) = no-op. */
    remember(key, content) {
        const store = this.getStore();
        if (!store)
            return { ok: false, error: 'memória indisponível (SharedMemory não inicializado)' };
        const slug = slugifyMemoryKey(key);
        try {
            store.write(SCOPE_PREFIX + slug, content.trim(), { source: 'jarvis' });
            return { ok: true, key: slug };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    }
    /** Lista fatos vivos; com query, filtra por substring em key ou content. */
    recall(query) {
        const store = this.getStore();
        if (!store)
            return [];
        const rows = store.listCurrentByScopePrefix(SCOPE_PREFIX);
        if (!query?.trim())
            return rows.map(toEntry);
        const q = query.trim().toLowerCase();
        return rows
            .filter((r) => r.content.toLowerCase().includes(q) || r.scope.slice(SCOPE_PREFIX.length).includes(slugifyMemoryKey(q)))
            .map(toEntry);
    }
    /** Esquece por key exata, senão por substring — retorna as keys esquecidas. */
    forget(target) {
        const store = this.getStore();
        if (!store)
            return { ok: false, forgotten: [] };
        const slug = slugifyMemoryKey(target);
        if (store.forget(SCOPE_PREFIX + slug) > 0)
            return { ok: true, forgotten: [slug] };
        const matches = this.recall(target);
        const forgotten = [];
        for (const m of matches) {
            if (store.forget(SCOPE_PREFIX + m.key) > 0)
                forgotten.push(m.key);
        }
        return { ok: forgotten.length > 0, forgotten };
    }
    /**
     * Bloco de contexto injetado no system prompt (brain SDK e voz Live).
     * Vazio quando não há memórias. Cap de chars: memórias mais recentes primeiro.
     */
    contextBlock() {
        const entries = this.recall();
        if (entries.length === 0)
            return '';
        const lines = [];
        let used = 0;
        let dropped = 0;
        for (const e of entries) {
            const line = `- [${e.key}] ${e.content.replace(/\s+/g, ' ')}`;
            if (used + line.length > CONTEXT_BLOCK_MAX_CHARS) {
                dropped++;
                continue;
            }
            lines.push(line);
            used += line.length;
        }
        const suffix = dropped > 0 ? `\n(+${dropped} memórias antigas omitidas — use memory_recall pra buscar)` : '';
        return `MEMÓRIA PERSISTIDA (fatos e preferências que o usuário JÁ te disse — use sem re-perguntar; cite honestamente "lembro que..." ao aplicar):\n${lines.join('\n')}${suffix}`;
    }
}
//# sourceMappingURL=JarvisMemory.js.map