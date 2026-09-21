import test from "node:test";
import assert from "node:assert/strict";
import { vpsLazyTools, normalizeSearchLimits } from "../src/tools/vps/vps-lazy.js";
import { githubTools } from "../src/tools/github/github-tools.js";

function tool(list, name) {
    const found = list.find((item) => item.name === name);
    assert.ok(found, `missing tool ${name}`);
    return found;
}

test("search_files aceita pedido acima do teto e normaliza para limite seguro", () => {
    const search = tool(vpsLazyTools, "search_files");
    const parsed = search.inputSchema.parse({
        query: "aprendizados.json",
        root: "project",
        path: "apps/modulos",
        maxFiles: 3000,
        maxMatches: 600,
        maxBytesPerFile: 900000,
    });
    const limits = normalizeSearchLimits(parsed);
    assert.deepEqual(limits.requested, {
        maxFiles: 3000,
        maxMatches: 600,
        maxBytesPerFile: 900000,
    });
    assert.deepEqual(limits.applied, {
        maxFiles: 2000,
        maxMatches: 200,
        maxBytesPerFile: 500000,
    });
    assert.equal(limits.clamped, true);
});

test("github_read transforma 404 de ref em miss de sensor com rota local, sem falso 'arquivo inexistente'", async () => {
    const read = tool(githubTools, "github_read");
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
    });
    try {
        const result = await read.handler({
            path: "apps/modulos/grupo-evolucao/missions/drift-1789941665983.json",
            ref: "d6d83c4691d4b6e5f6d3c1d15231a2575be89279",
            maxBytes: 600,
        }, { token: "test-token" });
        const body = JSON.parse(result.content[0].text);
        assert.equal(body.status, "NAO_ENCONTRADO_NO_GITHUB_REF");
        assert.equal(body.sourceScope, "GIT_COMMITTED_OBJECT_ONLY");
        assert.equal(body.worldAbsenceProven, false);
        assert.equal(body.runtimeLocalMayExist, true);
        assert.equal(body.nextAction, "MEASURE_ALTERNATE_SENSOR_BEFORE_DECLARING_MISSING_OR_BLOCKED");
        assert.equal(body.alternateAuthorizedRoutes[0].tool, "read_file");
        assert.equal(body.alternateAuthorizedRoutes[0].path, "apps/modulos/grupo-evolucao/missions/drift-1789941665983.json");
    }
    finally {
        globalThis.fetch = originalFetch;
    }
});
