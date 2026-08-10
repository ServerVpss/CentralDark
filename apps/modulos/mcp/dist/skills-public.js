// Rotas públicas de skills — servem diretamente as skills instaladas no
// checkout vivo do CentralDark. A fonte é .agents/skills/, nunca um mirror.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "./log.js";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(process.env.CENTRALDARK_REPO_ROOT || path.join(MODULE_DIR, "../../../.."));
export const SKILLS_DIR = path.join(REPO_ROOT, ".agents", "skills");
const SOURCE_OF_TRUTH = "ServerVpss/CentralDark";
function isNomeSeguro(nome) {
    return /^[a-z0-9][a-z0-9-]{1,63}$/i.test(nome);
}
function stripQuotes(value) {
    return value.trim().replace(/^["']|["']$/g, "");
}
export function parseFrontmatter(md) {
    const normalized = String(md || "").replace(/\r\n/g, "\n");
    const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match)
        return { meta: {}, body: normalized };
    const lines = match[1].split("\n");
    const meta = {};
    for (let i = 0; i < lines.length; i += 1) {
        const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!kv)
            continue;
        const key = kv[1];
        const raw = kv[2].trim();
        if (/^[>|][+-]?$/.test(raw)) {
            const parts = [];
            while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
                i += 1;
                parts.push(lines[i].trim());
            }
            meta[key] = parts.join(raw.startsWith(">") ? " " : "\n").trim();
            continue;
        }
        if (raw === "") {
            const list = [];
            while (i + 1 < lines.length) {
                const item = lines[i + 1].match(/^\s+-\s+(.+)$/);
                if (!item)
                    break;
                i += 1;
                list.push(stripQuotes(item[1]));
            }
            meta[key] = list;
            continue;
        }
        meta[key] = stripQuotes(raw);
    }
    return { meta, body: match[2] };
}
function sha256(content) {
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}
function canonicalPath(nome) {
    return `.agents/skills/${nome}/SKILL.md`;
}
export function getInstalledSkill(nome) {
    if (!isNomeSeguro(nome))
        return null;
    const file = path.join(SKILLS_DIR, nome, "SKILL.md");
    try {
        const content = fs.readFileSync(file, "utf8");
        const { meta } = parseFrontmatter(content);
        return {
            nome: meta.name || nome,
            pasta: nome,
            versao: meta.version || "unversioned",
            descricao: meta.description || "",
            agentes: Array.isArray(meta.agents) ? meta.agents : [],
            canonical_path: canonicalPath(nome),
            sha256: sha256(content),
            source_of_truth: SOURCE_OF_TRUTH,
            content,
        };
    }
    catch (error) {
        log.warn("skill_local_read_error", { nome, error: String(error) });
        return null;
    }
}
export function listInstalledSkills() {
    let entries = [];
    try {
        entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    }
    catch (error) {
        log.error("skills_local_dir_error", { path: SKILLS_DIR, error: String(error) });
        return [];
    }
    return entries
        .filter((entry) => entry.isDirectory() && isNomeSeguro(entry.name))
        .map((entry) => getInstalledSkill(entry.name))
        .filter(Boolean)
        .sort((a, b) => a.pasta.localeCompare(b.pasta));
}
function setCorsAndCache(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Estado vivo: não permitir que um cache de 5 min vire fonte de verdade.
    res.setHeader("Cache-Control", "no-store");
}
function gerarInstallSh(nome, baseUrl) {
    return `#!/usr/bin/env bash
# Instalador da skill "${nome}" do CentralDark vivo.
set -euo pipefail
SKILL_NOME="${nome}"
BASE_URL="${baseUrl}"
SKILL_URL="\${BASE_URL}/skills/\${SKILL_NOME}/SKILL.md"
TMP="$(mktemp)"
trap 'rm -f "\${TMP}"' EXIT
curl -fsSL "\${SKILL_URL}" -o "\${TMP}"

detectar_destino() {
  if [ -d "\$HOME/.claude" ]; then echo "\$HOME/.claude/skills/\${SKILL_NOME}"; return; fi
  if [ -d "\$HOME/.cursor" ]; then echo "\$HOME/.cursor/skills/\${SKILL_NOME}"; return; fi
  if [ -d "\$HOME/.config/codex" ]; then echo "\$HOME/.config/codex/skills/\${SKILL_NOME}"; return; fi
  if [ -d "\$HOME/.config/claude" ]; then echo "\$HOME/.config/claude/skills/\${SKILL_NOME}"; return; fi
  echo "\$HOME/.ia-skills/\${SKILL_NOME}"
}
DEST="$(detectar_destino)"
mkdir -p "\${DEST}"
mv "\${TMP}" "\${DEST}/SKILL.md"
trap - EXIT
echo "SKILL_INSTALLED=\${DEST}/SKILL.md"
`;
}
export async function handleSkillsList(_req, res, baseUrl) {
    setCorsAndCache(res);
    const skills = listInstalledSkills();
    if (!fs.existsSync(SKILLS_DIR)) {
        res.status(503).json({ ok: false, erro: "Diretório canônico .agents/skills ausente.", source_of_truth: SOURCE_OF_TRUTH });
        return;
    }
    res.json({
        ok: true,
        source_of_truth: SOURCE_OF_TRUTH,
        canonical_root: ".agents/skills",
        total: skills.length,
        skills: skills.map(({ content: _content, ...skill }) => ({
            ...skill,
            url_skill_md: `${baseUrl}/skills/${skill.pasta}/SKILL.md`,
            url_install: `${baseUrl}/skills/${skill.pasta}/install.sh`,
        })),
        routing: "descobrir todas; carregar somente a skill cujo gatilho/descrição se aplica à missão",
    });
}
export async function handleSkillManifest(req, res, baseUrl) {
    setCorsAndCache(res);
    const nome = String(req.params.nome || "");
    if (!isNomeSeguro(nome)) {
        res.status(400).json({ ok: false, erro: "Nome inválido." });
        return;
    }
    const skill = getInstalledSkill(nome);
    if (!skill) {
        res.status(404).json({ ok: false, erro: `Skill '${nome}' não encontrada em .agents/skills/.` });
        return;
    }
    res.json({
        ok: true,
        ...skill,
        url_skill_md: `${baseUrl}/skills/${nome}/SKILL.md`,
        url_install: `${baseUrl}/skills/${nome}/install.sh`,
        conteudo_skill_md: skill.content,
    });
}
export async function handleSkillRaw(req, res) {
    setCorsAndCache(res);
    const nome = String(req.params.nome || "");
    const skill = getInstalledSkill(nome);
    if (!skill) {
        res.status(isNomeSeguro(nome) ? 404 : 400).type("text/plain").send(isNomeSeguro(nome) ? `Skill '${nome}' não encontrada.` : "Nome inválido.");
        return;
    }
    res.setHeader("X-CentralDark-Skill-SHA256", skill.sha256);
    res.setHeader("X-CentralDark-Skill-Path", skill.canonical_path);
    res.type("text/markdown; charset=utf-8").send(skill.content);
}
export async function handleSkillInstaller(req, res, baseUrl) {
    setCorsAndCache(res);
    const nome = String(req.params.nome || "");
    if (!isNomeSeguro(nome)) {
        res.status(400).type("text/plain").send("# Nome inválido\nexit 1\n");
        return;
    }
    if (!getInstalledSkill(nome)) {
        res.status(404).type("text/plain").send(`# Skill '${nome}' não encontrada\nexit 1\n`);
        return;
    }
    res.type("text/x-shellscript; charset=utf-8").send(gerarInstallSh(nome, baseUrl));
}
//# sourceMappingURL=skills-public.js.map