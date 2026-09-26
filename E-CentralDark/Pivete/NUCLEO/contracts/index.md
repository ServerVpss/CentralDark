# CONTRATO - index.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\supabase\functions\capability-router\index.ts
**SHA:** b84cca8227a99c4c
**Timestamp:** 2026-08-28T02:55:36.112754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- handoff_contract: {

### Gaps
- if (!(field in task)) errors.push(`TASK_MISSING:${field}`);
- if (!(field in (candidate ?? {}))) errors.push(`CANDIDATE_${index}_MISSING:${field}`);

### Ouro Bruto (primeiros 5000 chars)
```
// Edge function: capability-router
// Roteamento determinístico de tarefas -> capacidades (só admins).
// Porta fiel de .agents/skills/capability-contract-router/scripts/route_capabilities.py
// Ações: route, self_test, contract_info
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("HUB_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("HUB_SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- porta 1:1 de route_capabilities.py ----

interface Task {
  task_id: string;
  required_capabilities: string[];
  optional_capabilities?: string[];
  forbidden_capabilities?: string[];
  writer_scope?: string;
  proof_target?: string;
}

interface Candidate {
  id: string;
  capabilities?: string[];
  available?: boolean;
  writer_conflicts?: string[];
}

interface RoutePayload {
  task: Task;
  candidates: Candidate[];
}

function normalizeCaps(values: unknown[]): string[] {
  const set = new Set<string>();
  for (const v of values ?? []) {
    const s = String(v).trim().toLowerCase();
    if (s) set.add(s);
  }
  return [...set].sort();
}

function validate(payload: Partial<RoutePayload>): string[] {
  const errors: string[] = [];
  const task = payload.task ?? ({} as Task);
  for (const field of ["task_id", "required_capabilities"]) {
    if (!(field in task)) errors.push(`TASK_MISSING:${field}`);
  }
  const candidates = payload.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    errors.push("CANDIDATES_MISSING");
  } else {
    candidates.forEach((candidate, index) => {
      for (const field of ["id", "capabilities"]) {
        if (!(field in (candidate ?? {}))) errors.push(`CANDIDATE_${index}_MISSING:${field}`);
      }
    });
  }
  return errors;
}

function route(payload: Partial<RoutePayload>) {
  const errors = validate(payload);
  if (errors.length) return { status: "BLOCKED_INVALID_INPUT", errors };

  const task = payload.task as Task;
  const required = new Set(normalizeCaps(task.required_capabilities));
  const optional = new Set(normalizeCaps(task.optional_capabilities ?? []));
  const forbidden = new Set(normalizeCaps(task.forbidden_capabilities ?? []));
  const writerScope = task.writer_scope;
  const remaining = new Set(required);

  const selected: { id: string; assigned_capabilities: string[]; all_capabilities: string[] }[] = [];
  const rejected: { id: string; reason: string }[] = [];
  const candidatePool: { id: string; caps: Set<string> }[] = [];

  for (const candidate of payload.candidates as Candidate[]) {
    const candidateId = String(candidate.id);
    const caps = new Set(normalizeCaps(candidate.capabilities ?? []));
    const available = candidate.available ?? true;
    const conflicts = new Set((candidate.writer_conflicts ?? []).map(String));

    let blockedReason: string | null = null;
    if (!available) blockedReason = "UNAVAILABLE";
    else if (writerScope && conflicts.has(writerScope)) blockedReason = "WRITER_CONFLICT";
    else if ([...caps].some((c) => forbidden.has(c))) blockedReason = "FORBIDDEN_CAPABILITY_PRESENT";

    if (blockedReason) {
      rejected.push({ id: candidateId, reason: blockedReason });
      continue;
    }
    candidatePool.push({ id: candidateId, caps });
  }

  while (remaining.size > 0) {
    type Ranked = { coverCount: number; optCount: number; capsCount: number; id: string; cover: string[]; caps: string[] };
    const ranked: Ranked[] = [];

    for (const { id, caps } of candidatePool) {
      if (selected.some((s) => s.id === id)) continue;
      const cover = [...remaining].filter((r) => caps.has(r));
      if (cover.length === 0) continue;
      const optCount = [...optional].filter((o) => caps.has(o)).length;
      ranked.push({ coverCount: cover.length, optCount, capsCount: caps.size, id, cover, caps: [...caps].sort() });
    }

    if (ranked.length === 0) break;

    ranked.sort((a, b) =>
      b.coverCount - a.coverCount ||
      b.optCount - a.optCount ||
      a.capsCount - b.capsCount ||
      a.id.localeCompare(b.id)
    );
    const pick = ranked[0];
    selected.push({
      id: pick.id,
      assigned_capabilities: [...pick.cover].sort(),
      all_capabilities: pick.caps,
    });
    for (const c of pick.cover) remaining.delete(c);
  }

  const covered = [...required].filter((r) => !remaining.has(r)).sort();
  const unresolved = [...remaining].sort();
  const status = unresolved.length === 0 ? "PASS_ROUTE_READY" : "BLOCKED_CAPABILITY_GAP";

  return {
    schema: "centraldark.capability-contract-route.v1",
    task_id: String(task.task_id),
  
```