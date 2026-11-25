import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const moduleRoot = fileURLToPath(new URL("../", import.meta.url));
test("MCP root discovery is portable, validated and independent of cwd", () => {
    const sandbox = mkdtempSync(path.join(tmpdir(), "cd-root-"));
    try {
        const root = path.join(sandbox, "renamed-project");
        const core = path.join(root, "CentralDark-Core");
        const foreign = path.join(sandbox, "unrelated");
        mkdirSync(foreign, { recursive: true });
        mkdirSync(path.join(foreign, ".git"));
        for (const dir of ["agent", "gateway", "CentralDark-Core/apps/modulos/mcp/src", "CentralDark-Core/apps/modulos/mcp/dist"]) {
            mkdirSync(path.join(root, dir), { recursive: true });
        }
        for (const file of ["CENTRALDARK_AI_BOOT.yaml", "LEIA-ME-IA.md"]) writeFileSync(path.join(core, file), "");
        writeFileSync(path.join(root, "package.json"), '{"type":"module"}');
        for (const variant of ["src", "dist"]) {
            const target = path.join(core, "apps/modulos/mcp", variant, "config.js");
            copyFileSync(path.join(moduleRoot, variant, "config.js"), target);
            const invoke = (vars = {}, entry = target) => {
                const env = { ...process.env };
                delete env.CENTRALDARK_REPO_ROOT;
                delete env.VPS_REPO_PATH;
                Object.assign(env, vars);
                return spawnSync(process.execPath, ["--input-type=module", "-e",
                    "import {pathToFileURL} from 'node:url'; const {config}=await import(pathToFileURL(process.argv[1]).href); console.log(JSON.stringify([config.vps.repoPath, config.vps.corePath, config.log.dir]));",
                    entry], { env, cwd: foreign, encoding: "utf8" });
            };
            for (const vars of [
                {}, { VPS_REPO_PATH: "/root/CentralDark" },
                { CENTRALDARK_REPO_ROOT: "auto", VPS_REPO_PATH: "auto" },
                { CENTRALDARK_REPO_ROOT: "." },
                { CENTRALDARK_REPO_ROOT: "CentralDark-Core" },
                { CENTRALDARK_REPO_ROOT: core },
                { CENTRALDARK_REPO_ROOT: foreign, VPS_REPO_PATH: root },
                { CENTRALDARK_REPO_ROOT: foreign },
            ]) {
                const result = invoke(vars);
                assert.equal(result.status, 0, result.stderr);
                assert.deepEqual(JSON.parse(result.stdout), [root, core, path.join(root, "logs")]);
            }
            const orphan = path.join(foreign, "config.mjs");
            copyFileSync(target, orphan);
            const denied = invoke({}, orphan);
            assert.notEqual(denied.status, 0);
            assert.match(denied.stderr, /CENTRALDARK_REPO_ROOT_NOT_FOUND/);
            const explicit = invoke({ CENTRALDARK_REPO_ROOT: root }, orphan);
            assert.equal(explicit.status, 0, explicit.stderr);
        }
    } finally {
        rmSync(sandbox, { recursive: true, force: true });
    }
});
