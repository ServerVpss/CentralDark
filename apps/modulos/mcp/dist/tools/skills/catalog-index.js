// Projecao deterministica de metadados; nao e um segundo catalogo nem loader.
// Autoridade: main do repositorio autenticado; instalacao/runtime sao provas separadas.
const ROOTS = ["skills/", ".agents/skills/"];
const LIMIT_MAX = 100;

export function indexSkillTree(payload) {
  if (!payload || !Array.isArray(payload.tree)) throw new Error("SKILL_TREE_UNAVAILABLE");
  if (payload.truncated === true) throw new Error("SKILL_TREE_TRUNCATED");
  const entries = payload.tree
    .filter((entry) => entry?.type === "blob" && typeof entry.path === "string")
    .filter((entry) => ROOTS.some((prefix) => entry.path.startsWith(prefix)))
    .filter((entry) => entry.path.endsWith("/SKILL.md"))
    .map((entry) => {
      const path = entry.path;
      const seg = path.split("/");
      const name = seg.at(-2);
      const archived = path.includes("/.archive/");
      return {
        id: `repo:${path}`,
        nome: name,
        path,
        sha: entry.sha ?? null,
        origem: path.startsWith("skills/") ? "portable" : "agents",
        archived,
        estado: archived ? "ARCHIVED_SOURCE" : "DISCOVERED_SOURCE_ONLY",
        carregada: "UNKNOWN",
        executada: "UNKNOWN",
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR") || a.path.localeCompare(b.path));
  const seenPaths = new Set();
  for (const e of entries) {
    if (!/^[\w.\/-]+$/.test(e.path) || e.path.includes("..") || seenPaths.has(e.path)) {
      throw new Error("INVALID_OR_DUPLICATE_SKILL_PATH");
    }
    seenPaths.add(e.path);
  }
  return entries;
}

export function searchSkills(entries, { busca = "", incluir_arquivadas = false, limit = 50, offset = 0 } = {}) {
  const q = String(busca ?? "").toLocaleLowerCase("pt-BR").trim();
  const all = entries.filter((e) => (incluir_arquivadas || !e.archived) &&
    (!q || [e.nome, e.path, e.origem].some((s) => s.toLocaleLowerCase("pt-BR").includes(q))));
  const boundedLimit = Math.max(1, Math.min(LIMIT_MAX, Number.isFinite(limit) ? Math.floor(limit) : 50));
  const boundedOffset = Math.max(0, Number.isFinite(offset) ? Math.floor(offset) : 0);
  return {
    total: all.length,
    limit: boundedLimit,
    offset: boundedOffset,
    has_more: boundedOffset + boundedLimit < all.length,
    skills: all.slice(boundedOffset, boundedOffset + boundedLimit),
  };
}

export function resolveSkill(entries, { nome, path }) {
  const candidates = entries.filter((e) => !e.archived && (path ? e.path === path : e.nome === nome));
  if (candidates.length === 0) return { estado: "NOT_FOUND", candidates: [] };
  if (candidates.length > 1) return { estado: "AMBIGUOUS", candidates: candidates.map(({ id, nome, path }) => ({ id, nome, path })) };
  return { estado: "RESOLVED", entry: candidates[0] };
}
