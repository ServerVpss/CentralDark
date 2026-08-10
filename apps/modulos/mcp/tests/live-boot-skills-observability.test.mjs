import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getInstalledSkill, listInstalledSkills, REPO_ROOT, SKILLS_DIR } from "../src/skills-public.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = path.resolve(HERE, "..");
const read = (relative) => fs.readFileSync(path.join(MCP_ROOT, relative), "utf8");

const sourceSkills = read("src/skills-public.js");
const sourceSkillTools = read("src/tools/skills/skill.js");
const sourceServer = read("src/mcp-server.js");
const auditLogger = read("src/audit-logger.js");
const correlation = read("src/correlation.js");
const index = read("src/index.js");
const admin = read("src/admin.js");

function installedSkillFolders() {
    return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, entry.name, "SKILL.md")))
        .map((entry) => entry.name)
        .sort();
}

test("skills canônicas são descobertas do checkout vivo sem mirror", () => {
    assert.equal(path.basename(REPO_ROOT), "CentralDark");
    assert.match(sourceSkills, /\.agents["', ]+.*skills|\.agents\/skills/s);
    assert.match(sourceSkills, /Cache-Control["', ]+,?["' ]*no-store|no-store/);
    assert.doesNotMatch(sourceSkills, /clone-deck|raw\.githubusercontent\.com/);
    assert.doesNotMatch(sourceSkillTools, /clone-deck|raw\.githubusercontent\.com|`skills\//);

    const expected = installedSkillFolders();
    const actual = listInstalledSkills().map((skill) => skill.pasta).sort();
    assert.deepEqual(actual, expected);
    assert.ok(actual.length > 0, "inventário de skills não pode ser vazio");

    for (const nome of actual) {
        const skill = getInstalledSkill(nome);
        assert.ok(skill, `skill ${nome} precisa ser legível`);
        assert.ok(skill.nome, `skill ${nome} precisa de name`);
        assert.ok(skill.descricao, `skill ${nome} precisa de description`);
        assert.match(skill.canonical_path, /^\.agents\/skills\/.+\/SKILL\.md$/);
        assert.match(skill.sha256, /^[a-f0-9]{64}$/);
    }
    console.log(`SKILLS_DENOMINATOR=${expected.length} SKILLS_PASS=${actual.length}`);
});

test("boot MCP usa LEIA-ME-IA vivo e roteia skill por pertinência", () => {
    assert.match(sourceServer, /LEIA-ME-IA\.md/);
    assert.match(sourceServer, /liveBootInstructions\(\)/);
    assert.match(sourceServer, /SKILL_ROUTING=DISCOVER_ALL_LOAD_ONLY_APPLICABLE/);
    assert.match(sourceServer, /FRESH_CHEFE_DELTA=PRIORITY_HYPOTHESIS_VERIFY_AGAINST_LIVE_STATE/);
    assert.match(sourceServer, /CHEFE_NAO_FICA_CEGO=REPO_OWNED_ACTION_REQUIRES_SANITIZED_OBSERVABILITY/);
    assert.doesNotMatch(sourceServer, /PIVETE_BOOT_INSTRUCTIONS|SINCRONIA 4-POINT|@srver1bot|PERMITO PIVETE/);
});

test("toda tool call auditada carrega o mesmo correlation id da request", () => {
    const wrapper = sourceServer.match(/function auditEntry\([\s\S]*?\n\}/)?.[0] || "";
    assert.match(wrapper, /auditToolExecution/);
    assert.match(wrapper, /correlationId:\s*options\.cid\s*\?\?\s*null/);
    const directCalls = sourceServer.match(/auditToolExecution\s*\(/g) || [];
    assert.equal(directCalls.length, 1, "auditToolExecution deve passar somente pelo wrapper correlacionado");
    assert.ok((sourceServer.match(/auditEntry\s*\(/g) || []).length >= 5, "todos os caminhos de tools/list e tools/call devem auditar");
});

test("observabilidade existente continua alcançável sem criar painel paralelo", () => {
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

test("tools MCP de skill usam a mesma fonte canônica local", () => {
    for (const token of ["getInstalledSkill", "listInstalledSkills", ".agents/skills", "ServerVpss/CentralDark"]) {
        assert.ok(sourceSkillTools.includes(token), `token ausente: ${token}`);
    }
    assert.match(sourceSkillTools, /DISCOVER_ALL_LOAD_ONLY_APPLICABLE/);
    assert.doesNotMatch(sourceSkillTools, /github\.com\/.+\/skills|skills\/<nome>/);
});

test("denominador de prova do contrato é fechado", () => {
    const checks = [
        fs.existsSync(path.join(REPO_ROOT, "LEIA-ME-IA.md")),
        fs.existsSync(SKILLS_DIR),
        !sourceSkills.includes("clone-deck"),
        sourceServer.includes("liveBootInstructions()"),
        sourceServer.includes("correlationId: options.cid ?? null"),
        auditLogger.includes("mcp_tool_execution"),
        correlation.includes("X-Correlation-Id"),
        index.includes('/admin/logs/stream'),
    ];
    const pass = checks.filter(Boolean).length;
    console.log(`CONTRACT_DENOMINATOR=${checks.length} CONTRACT_PASS=${pass}`);
    assert.equal(pass, checks.length, "100% só é permitido quando numerador = denominador explícito");
});
