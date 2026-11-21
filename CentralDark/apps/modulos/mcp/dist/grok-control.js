import fs from "node:fs";
import path from "node:path";
import { getGrokControlCatalog, readGrokControlState, } from "../../HERMES-CORE/core/grok-build-adapter.mjs";
import { appendCentralEvent } from "./log-funnel.js";
function allowedSet(items) {
    return new Set((items || []).filter((x) => x?.admin_selectable).map((x) => x.id));
}
function select(value, allowed, fallback, label) {
    const out = String(value ?? fallback).trim();
    if (!allowed.has(out)) {
        const error = new Error(`${label}_NOT_ADMIN_SELECTABLE`);
        error.code = "GROK_CONTROL_INVALID";
        throw error;
    }
    return out;
}
function bool(value, fallback) {
    return value == null ? fallback : value === true;
}
function normalizedSelection(input = {}) {
    const catalog = getGrokControlCatalog();
    const current = readGrokControlState();
    const modes = allowedSet(catalog.invocation_modes);
    const agents = allowedSet(catalog.agent_profiles);
    const permissions = allowedSet(catalog.permission_modes);
    const models = allowedSet(catalog.models);
    const efforts = allowedSet(catalog.reasoning_efforts);
    const next = {
        invocation_mode: select(input.invocation_mode, modes, current.invocation_mode, "INVOCATION_MODE"),
        agent_profile: select(input.agent_profile, agents, current.agent_profile, "AGENT_PROFILE"),
        permission_mode: select(input.permission_mode, permissions, current.permission_mode, "PERMISSION_MODE"),
        model: select(input.model, models, current.model, "MODEL"),
        reasoning_effort: select(input.reasoning_effort, efforts, current.reasoning_effort, "REASONING_EFFORT"),
        subagents_enabled: bool(input.subagents_enabled, current.subagents_enabled),
        plan_enabled: bool(input.plan_enabled, current.plan_enabled),
    };
    if (next.invocation_mode === "READ_ONLY_AUDIT") {
        next.agent_profile = "explore";
        next.permission_mode = "plan";
        next.subagents_enabled = false;
        next.plan_enabled = true;
    }
    return { catalog, next };
}
function writeSecureJson(file, value) {
    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    try {
        fs.chmodSync(dir, 0o700);
    }
    catch { }
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
    fs.renameSync(tmp, file);
    try {
        fs.chmodSync(file, 0o600);
    }
    catch { }
}
function evidenceFor(catalog, group, id) {
    const row = (catalog[group] || []).find((x) => x.id === id);
    return row?.evidence || "DOCUMENTED_OR_UNKNOWN";
}
export function getGrokControlDashboard() {
    const catalog = getGrokControlCatalog();
    const state = readGrokControlState();
    return {
        status: "OK",
        catalog,
        state,
        selected_evidence: {
            invocation_mode: evidenceFor(catalog, "invocation_modes", state.invocation_mode),
            agent_profile: evidenceFor(catalog, "agent_profiles", state.agent_profile),
            model: evidenceFor(catalog, "models", state.model),
        },
        activation: {
            state: "SELECTED_NOT_RUNTIME_PROVEN",
            selected_is_active: false,
            reason: "A seleção é default para próximas invocações do adapter; só log de execução prova uso ativo.",
        },
        proof_boundary: {
            UNKNOWN_IS_NOT_PASS: true,
            SELECTED_IS_NOT_ACTIVE: true,
            AVAILABLE_IS_NOT_OBSERVED: true,
            ADMIN_SELECTION_GRANTS_MUTATION_AUTHORITY: false,
        },
    };
}
export function setGrokControlSelection(input = {}, actor = "admin") {
    const { catalog, next } = normalizedSelection(input);
    const payload = {
        schema: "centraldark.grok-mode-state.v1",
        ...next,
        updated_at: new Date().toISOString(),
        updated_by: String(actor || "admin").slice(0, 80),
        selection_is_runtime_proof: false,
        mutation_authority_granted: false,
    };
    writeSecureJson(catalog.state_path, payload);
    appendCentralEvent({
        sector: "control",
        source: "mcp-admin",
        actor: "admin",
        kind: "grok_mode_selected",
        level: "info",
        key: "grok-mode-selection",
        tags: ["grok", "mode", "selection", "not-proof"],
        message: `Grok default selecionado: ${next.invocation_mode} / ${next.agent_profile} / ${next.model}`,
        data: {
            ...next,
            selected_is_runtime_proof: false,
            mutation_authority_granted: false,
        },
    });
    return getGrokControlDashboard();
}
//# sourceMappingURL=grok-control.js.map