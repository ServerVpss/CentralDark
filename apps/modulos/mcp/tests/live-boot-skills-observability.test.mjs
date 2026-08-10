import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(MCP_ROOT, "../../..");
const SKILLS_DIR = path.join(REPO_ROOT, ".agents", "skills");
const read = (relative) => fs.readFileSync(path.join(MCP_ROOT, relative), "utf8");

const sourcePublicSkills = read("src/skills-public.js");
const sourceSkillTools = read("src/tools/skills/skill.js");
const sourceServer = read("src/mcp-server.js");
const auditLogger = read("src/audit-logger.js");
const correlation = read("src/correlation.js");
const index = read("src/index.js");
const admin = read("src/admin.js");

function installedSkillFiles() {
    return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ nome: entry.name, file: path.join(SKILLS_DIR, entry.name, "SKILL.md") }))
        .filter((item) => fs.existsSync(item.file))
        .sort((a, b) => a.nome.localeCompare(b.nome));
}

test("100% das skills instaladas têm identidade mínima e são alcançáveis por diretório genérico", () => {
    const skills = installedSkillFiles();
    assert.ok(skills.length > 0, "inventário de .agents/skills não pode ser vazio");
    let pass = 0;
    for (const skill of skills) {
        const md = fs.readFileSync(skill.file, "utf8").replace(/\r\n/g, "\n");
        assert.match(md, /^---\n[\s\S]*?\n---\n/, `${skill.nome}: frontmatter ausente`);
        const frontmatter = md.match(/^---\n([\s\S]*?)\n---\n/)?.[1] || "";
        assert.match(frontmatter, /^name:\s*.+$/m, `${skill.nome}: name ausente`);
        assert.match(frontmatter, /^description:\s*(?:.+|[>|][+-]?)$/m, `${skill.nome}: description ausente`);
        pass += 1;
    }
    assert.match(sourceSkillTools, /const SKILL_ROOT = "\.agents\/skills"/);
    assert.match(sourceSkillTools, /listarPasta\(ctx\.token, SKILL_ROOT\)/);
    assert.match(sourceSkillTools, /for \(const entry of entradas\)/);
    assert.match(sourceSkillTools, /`\$\{entry\.path\}\/SKILL\.md`/);
    console.log(`SKILLS_DENOMINATOR=${skills.length} SKILLS_PASS=${pass}`);
});

test("skill routing autenticado usa GitHub vivo e não mirror/cache local", () => {
    for (const token of ["config.github.owner", "config.github.repo", "gh.getFileContent", ".agents/skills", "DISCOVER_ALL_LOAD_ONLY_APPLICABLE"]) {
        assert.ok(sourceSkillTools.includes(token), `token ausente: ${token}`);
    }
    assert.doesNotMatch(sourceSkillTools, /clone-deck|raw\.githubusercontent\.com|readFileSync|CACHE_TTL/);
    assert.match(sourceSkillTools, /blob_sha/);
});

test("rota pública não vaza conteúdo privado de skill", () => {
    assert.match(sourcePublicSkills, /AUTHENTICATED_MCP_REQUIRED/);
    assert.match(sourcePublicSkills, /public_content:\s*false/);
    assert.match(sourcePublicSkills, /status\(401\)/);
    assert.doesNotMatch(sourcePublicSkills, /readFileSync|raw\.githubusercontent\.com|clone-deck|conteudo_skill_md/);
});

test("boot MCP vem do GitHub autenticado e falha fechado sem contexto", () => {
    assert.match(sourceServer, /gh\.getFileContent/);
    assert.match(sourceServer, /LEIA-ME-IA\.md/);
    assert.match(sourceServer, /BOOT_CHANNEL=GITHUB_AUTHENTICATED_DEFAULT_BRANCH/);
    assert.match(sourceServer, /SKILL_ROUTING=DISCOVER_ALL_LOAD_ONLY_APPLICABLE/);
    assert.match(sourceServer, /FRESH_CHEFE_DELTA=PRIORITY_HYPOTHESIS_VERIFY_AGAINST_LIVE_STATE/);
    assert.match(sourceServer, /CHEFE_NAO_FICA_CEGO=REPO_OWNED_ACTION_REQUIRES_SANITIZED_OBSERVABILITY/);
    assert.match(sourceServer, /STATUS=BLOCKED_BOOT_CONTEXT/);
    assert.match(sourceServer, /ROLE=READ_ONLY/);
    assert.doesNotMatch(sourceServer, /PIVETE_BOOT_INSTRUCTIONS|SINCRONIA 4-POINT|@srver1bot|PERMITO PIVETE|readFileSync/);
});

test("menos é mais: GitHub vivo só é carregado no initialize", () => {
    assert.match(sourceServer, /includeLiveInstructions:\s*method === "initialize"/);
    assert.match(sourceServer, /options\.includeLiveInstructions\s*\?\s*await liveBootInstructions\(options\.token\)\s*:\s*steadyInstructions\(\)/);
    assert.match(sourceServer, /BOOT_CONTEXT=INITIALIZE_ONLY/);
    assert.match(sourceServer, /SKILL_ROUTING=LOAD_ONLY_APPLICABLE/);
});

test("toda execução de tool passa pelo audit wrapper e chega ao stream com o mesmo cid", () => {
    const wrapper = sourceServer.match(/function auditEntry\([\s\S]*?\n\}/)?.[0] || "";
    assert.match(wrapper, /auditToolExecution/);
    assert.match(wrapper, /const cid = options\.cid \?\? null/);
    assert.match(wrapper, /correlationId:\s*cid/);
    assert.match(wrapper, /log\.info\("mcp_tool_execution"/);
    assert.match(wrapper, /\bcid,/);
    assert.match(wrapper, /toolName:\s*entry\.toolName/);
    assert.match(wrapper, /durationMs:/);
    assert.match(wrapper, /auditTrail:\s*true/);
    assert.equal((sourceServer.match(/auditToolExecution\s*\(/g) || []).length, 1);
    assert.ok((sourceServer.match(/auditEntry\s*\(/g) || []).length >= 5);
});

test("CHEFE_NAO_FICA_CEGO reutiliza observabilidade existente", () => {
    assert.match(auditLogger, /mcp_tool_execution/);
    assert.match(auditLogger, /sanitizeValue|sanitizeForLog/);
    assert.match(correlation, /X-Correlation-Id/);
    assert.match(correlation, /http_request_start/);
    assert.match(correlation, /http_request_end/);
    assert.match(index, /\/admin\/api\/logs/);
    assert.match(index, /\/admin\/api\/metricas/);
    assert.match(index, /\/admin\/logs\/stream/);
    assert.match(admin, /export function adminLogsStream/);
    assert.match(admin, /pushAdminLog/);
});

test("100% só pode ser declarado sobre denominador fechado", () => {
    const checks = [
        fs.existsSync(path.join(REPO_ROOT, "LEIA-ME-IA.md")),
        fs.existsSync(SKILLS_DIR),
        sourceSkillTools.includes(".agents/skills"),
        sourceSkillTools.includes("gh.getFileContent"),
        sourceServer.includes("BOOT_CHANNEL=GITHUB_AUTHENTICATED_DEFAULT_BRANCH"),
        sourceServer.includes('includeLiveInstructions: method === "initialize"'),
        sourceServer.includes("correlationId: cid"),
        sourceServer.includes('log.info("mcp_tool_execution"'),
        sourcePublicSkills.includes("AUTHENTICATED_MCP_REQUIRED"),
        auditLogger.includes("mcp_tool_execution"),
        correlation.includes("X-Correlation-Id"),
        index.includes('/admin/logs/stream'),
    ];
    const pass = checks.filter(Boolean).length;
    console.log(`CONTRACT_DENOMINATOR=${checks.length} CONTRACT_PASS=${pass}`);
    assert.equal(pass, checks.length, "sem numerador = denominador explícito, claim 100% é proibido");
});
