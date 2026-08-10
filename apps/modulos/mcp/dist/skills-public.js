// Fronteira pública de skills.
// Conteúdo canônico de .agents/skills pertence ao repositório privado e só é
// entregue por tools MCP autenticadas (skill_listar/skill_instalar/status/atualizar).
const SOURCE_OF_TRUTH = "ServerVpss/CentralDark";
const CANONICAL_ROOT = ".agents/skills";
function setPublicHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
}
function publicBoundary() {
    return {
        ok: false,
        status: "AUTHENTICATED_MCP_REQUIRED",
        source_of_truth: SOURCE_OF_TRUTH,
        canonical_root: CANONICAL_ROOT,
        public_content: false,
        instruction: "Conecte via MCP autenticado e use skill_listar/skill_instalar. Conteúdo privado não é servido por rota pública.",
    };
}
export async function handleSkillsList(_req, res) {
    setPublicHeaders(res);
    res.status(401).json(publicBoundary());
}
export async function handleSkillManifest(_req, res) {
    setPublicHeaders(res);
    res.status(401).json(publicBoundary());
}
export async function handleSkillRaw(_req, res) {
    setPublicHeaders(res);
    res.status(401).type("text/plain").send("AUTHENTICATED_MCP_REQUIRED\n");
}
export async function handleSkillInstaller(_req, res) {
    setPublicHeaders(res);
    res.status(401).type("text/plain").send("# AUTHENTICATED_MCP_REQUIRED\nexit 1\n");
}
//# sourceMappingURL=skills-public.js.map