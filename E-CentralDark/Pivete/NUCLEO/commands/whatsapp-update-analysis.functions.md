# COMANDO - whatsapp-update-analysis.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\whatsapp-update-analysis.functions.ts
**SHA:** d0cbafd4c8dff1a1
**Timestamp:** 2026-08-26T19:33:48.468553
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- risk: RiskLevel;
- risk: "none",
- if (newCount === 0) base.risk = "none";
- else if (maxNewWeight >= 3) base.risk = "high";
- else if (maxNewWeight >= 2 || base.whatsmeow.recently_bumped) base.risk = "medium";
- else base.risk = "low";
- base.block_direct_update = base.risk === "high";
- if (base.risk === "medium") reasons.add("Mudanças em dependências, webhook ou build.");
- else if (base.risk === "low") reasons.add("Mudanças pequenas: fixes, docs, testes.");
- risk: base.risk,

### Ouro Bruto (primeiros 5000 chars)
```
// Fase 2 — Verificar atualizações + classificar risco (versão 2).
// Agora olha também:
// - arquivos alterados em cada commit (não só o título)
// - mudanças em go.mod / go.sum / whatsmeow / session / auth / database
// - referência atual do Whatsmeow usada pelo WuzAPI (lida do go.mod no HEAD)
// - se o WuzAPI bumpou Whatsmeow recentemente
// Cada verificação é salva em wuzapi_update_checks (histórico auditável).
// Token do GitHub (GITHUB_PAT) é usado SÓ no servidor.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type CommitItem = {
  sha: string;
  short: string;
  message: string;
  date: string | null;
  author: string | null;
  url: string;
  is_new: boolean;
  files_inspected: boolean;
  touched_files: string[]; // só os "interessantes"
  risk_tags: string[]; // ["alto"], ["médio"], ["baixo"]
};

type RiskLevel = "low" | "medium" | "high" | "none";

type AnalysisResult = {
  repo: string;
  checked_at: string;
  last_vps_update_at: string | null;
  commits: CommitItem[];
  new_commits_count: number;
  risk: RiskLevel;
  risk_reasons: string[];
  whatsmeow: {
    ref: string | null;            // ex: "v0.0.0-20240220-abcd123"
    pseudo_sha: string | null;     // sha curto dentro do ref pseudo-version
    detected_from: string | null;  // "go.mod@HEAD"
    recently_bumped: boolean;      // se algum commit novo mexeu em go.mod/go.sum com whatsmeow
  };
  block_direct_update: boolean;    // true se risco alto → exigir canary
  error: string | null;
};

// Palavras-chave no TÍTULO
const HIGH_TITLE = [
  "breaking", "break:", "security", "vulnerab", "cve",
  "auth", "session", "migration", "schema change", "rewrite",
  "drop ", "remove ", "deprecate", "protocol",
];
const MEDIUM_TITLE = [
  "deps", "dependenc", "bump ", "upgrade", "refactor",
  "build", "ci:", "perf", "performance", "config",
  "webhook", "event", "message",
];
const LOW_TITLE = [
  "fix", "docs", "doc:", "readme", "typo", "lint",
  "test", "comment", "format", "style:",
];

// Palavras-chave nos PATHS de arquivos
const HIGH_PATH = [
  "auth", "session", "database", "db.go", "migrations/",
  "protocol", "whatsmeow", "crypto", "encrypt",
];
const MEDIUM_PATH = [
  "webhook", "events", "send", "receive", "message",
  "go.mod", "go.sum",
];
const LOW_PATH = [
  "readme", ".md", "docs/", "test", "_test.go",
  "license", ".github/", ".gitignore",
];

function tagByTitle(msg: string): number {
  const m = msg.toLowerCase();
  if (HIGH_TITLE.some((k) => m.includes(k))) return 3;
  if (MEDIUM_TITLE.some((k) => m.includes(k))) return 2;
  if (LOW_TITLE.some((k) => m.includes(k))) return 1;
  return 0;
}

function tagByFiles(files: string[]): { weight: number; touched: string[] } {
  const interesting: string[] = [];
  let weight = 0;
  for (const f of files) {
    const fl = f.toLowerCase();
    if (HIGH_PATH.some((k) => fl.includes(k))) {
      interesting.push(f);
      weight = Math.max(weight, 3);
    } else if (MEDIUM_PATH.some((k) => fl.includes(k))) {
      interesting.push(f);
      weight = Math.max(weight, 2);
    } else if (LOW_PATH.some((k) => fl.includes(k))) {
      // não adiciona em interesting pra não poluir
      if (weight === 0) weight = 1;
    }
  }
  return { weight, touched: interesting.slice(0, 8) };
}

function weightToTag(w: number): string[] {
  if (w >= 3) return ["alto"];
  if (w >= 2) return ["médio"];
  if (w >= 1) return ["baixo"];
  return [];
}

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function getLastVpsUpdateAt(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("master_settings")
    .select("wuzapi_update_status")
    .maybeSingle();
  const v = (data?.wuzapi_update_status ?? null) as { last_update_at?: string | null } | null;
  return v?.last_update_at ?? null;
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "MultiZap-Master-Panel",
  };
  const tok = process.env.GITHUB_PAT;
  if (tok) h.Authorization = `Bearer ${tok}`;
  return h;
}

async function fetchJson(url: string, timeoutMs = 10_000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: ghHeaders(), signal: ctrl.signal });
    if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function fetchRaw(url: string, timeoutMs = 10_000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  t
```