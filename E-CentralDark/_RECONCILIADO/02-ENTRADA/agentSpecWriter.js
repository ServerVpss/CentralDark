/**
 * agentSpecWriter.ts — porta de packages/shell/src/main/agentSpecWriter.ts
 * para o sidecar Node puro (sem Electron). Idêntico em lógica; usa node:fs/promises
 * diretamente (sem import Electron).
 */
import { promises as fs } from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
export async function writeAgentSpec(filePath, patch) {
    if (filePath.endsWith('agent.json')) {
        await writeAgentJsonSpec(filePath, patch);
        return;
    }
    const original = await fs.readFile(filePath, 'utf8');
    const match = FRONTMATTER_RE.exec(original);
    let frontmatter = {};
    let body = original;
    if (match) {
        const parsed = parseYaml(match[1]);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            frontmatter = parsed;
        }
        body = match[2];
    }
    if (patch.tools !== undefined) {
        if (patch.tools === null)
            delete frontmatter.tools;
        else
            frontmatter.tools = patch.tools;
    }
    if (patch.category !== undefined) {
        if (patch.category === null || patch.category === '')
            delete frontmatter.category;
        else
            frontmatter.category = patch.category;
    }
    if (patch.model !== undefined) {
        if (patch.model === null || patch.model === '')
            delete frontmatter.model;
        else
            frontmatter.model = patch.model;
    }
    if (patch.effort !== undefined) {
        if (patch.effort === null || patch.effort === '')
            delete frontmatter.effort;
        else
            frontmatter.effort = patch.effort;
    }
    const overclockExisting = frontmatter.overclock && typeof frontmatter.overclock === 'object' && !Array.isArray(frontmatter.overclock)
        ? { ...frontmatter.overclock }
        : {};
    if (patch.allowedSkills !== undefined) {
        if (patch.allowedSkills === null)
            delete overclockExisting.allowedSkills;
        else
            overclockExisting.allowedSkills = patch.allowedSkills;
    }
    if (patch.systemPrompt === null) {
        delete overclockExisting.systemPrompt;
    }
    else {
        overclockExisting.systemPrompt = patch.systemPrompt;
    }
    if (Object.keys(overclockExisting).length === 0) {
        delete frontmatter.overclock;
    }
    else {
        frontmatter.overclock = overclockExisting;
    }
    const yaml = stringifyYaml(frontmatter).trimEnd();
    const next = `---\n${yaml}\n---\n${body.startsWith('\n') ? body.slice(1) : body}`;
    await fs.writeFile(filePath, next, 'utf8');
}
async function writeAgentJsonSpec(filePath, patch) {
    const original = await fs.readFile(filePath, 'utf8');
    let parsed = {};
    try {
        const raw = JSON.parse(original);
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            parsed = raw;
        }
    }
    catch {
        // malformed — start from empty object
    }
    if (patch.systemPrompt === null) {
        delete parsed.system_prompt;
    }
    else {
        parsed.system_prompt = patch.systemPrompt;
    }
    if (patch.category !== undefined) {
        if (patch.category === null || patch.category === '')
            delete parsed.category;
        else
            parsed.category = patch.category;
    }
    if (patch.model !== undefined) {
        if (patch.model === null || patch.model === '')
            delete parsed.model;
        else
            parsed.model = patch.model;
    }
    if (patch.effort !== undefined) {
        if (patch.effort === null || patch.effort === '')
            delete parsed.effort;
        else
            parsed.effort = patch.effort;
    }
    const overclockExisting = parsed.overclock && typeof parsed.overclock === 'object' && !Array.isArray(parsed.overclock)
        ? { ...parsed.overclock }
        : {};
    if (patch.tools !== undefined) {
        if (patch.tools === null)
            delete overclockExisting.tools;
        else
            overclockExisting.tools = patch.tools;
    }
    if (patch.allowedSkills !== undefined) {
        if (patch.allowedSkills === null)
            delete overclockExisting.allowedSkills;
        else
            overclockExisting.allowedSkills = patch.allowedSkills;
    }
    if (Object.keys(overclockExisting).length === 0) {
        delete parsed.overclock;
    }
    else {
        parsed.overclock = overclockExisting;
    }
    await fs.writeFile(filePath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
}
//# sourceMappingURL=agentSpecWriter.js.map