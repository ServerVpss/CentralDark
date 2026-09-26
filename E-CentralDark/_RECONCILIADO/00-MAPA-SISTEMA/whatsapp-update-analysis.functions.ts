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
  try {
    const res = await fetch(url, {
      headers: { ...ghHeaders(), Accept: "application/vnd.github.raw" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractWhatsmeowRef(goMod: string): { ref: string | null; pseudo_sha: string | null } {
  // procura linha tipo: "	go.mau.fi/whatsmeow v0.0.0-20240220123456-abcdef123456"
  const lines = goMod.split("\n");
  for (const l of lines) {
    const m = l.match(/go\.mau\.fi\/whatsmeow\s+([^\s/]+)/i);
    if (m) {
      const ref = m[1];
      // pseudo-version sha = últimos 12 chars depois do último '-'
      const sm = ref.match(/-([a-f0-9]{12})$/i);
      return { ref, pseudo_sha: sm ? sm[1] : null };
    }
  }
  return { ref: null, pseudo_sha: null };
}

export const analyzeWuzapiUpdate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AnalysisResult> => {
    await assertSuperAdmin(context.userId);
    const repo = "asternic/wuzapi";
    const lastVpsUpdateAt = await getLastVpsUpdateAt();
    const lastVpsTs = lastVpsUpdateAt ? new Date(lastVpsUpdateAt).getTime() : 0;

    const base: AnalysisResult = {
      repo,
      checked_at: new Date().toISOString(),
      last_vps_update_at: lastVpsUpdateAt,
      commits: [],
      new_commits_count: 0,
      risk: "none",
      risk_reasons: [],
      whatsmeow: { ref: null, pseudo_sha: null, detected_from: null, recently_bumped: false },
      block_direct_update: false,
      error: null,
    };

    try {
      // 1) lista commits
      const arr = (await fetchJson(`https://api.github.com/repos/${repo}/commits?per_page=30`)) as Array<{
        sha: string;
        html_url?: string;
        commit?: { message?: string; author?: { name?: string; date?: string } };
      }>;

      // 2) lê go.mod do HEAD pra extrair referência atual do whatsmeow
      const goMod = await fetchRaw(`https://api.github.com/repos/${repo}/contents/go.mod?ref=HEAD`);
      if (goMod) {
        const { ref, pseudo_sha } = extractWhatsmeowRef(goMod);
        base.whatsmeow.ref = ref;
        base.whatsmeow.pseudo_sha = pseudo_sha;
        base.whatsmeow.detected_from = "go.mod@HEAD";
      }

      // 3) detalha até 10 commits (priorizando os novos) pra olhar arquivos
      const preliminar = arr.map((c) => {
        const date = c.commit?.author?.date ?? null;
        const ts = date ? new Date(date).getTime() : 0;
        return { c, ts, isNew: lastVpsTs > 0 ? ts > lastVpsTs : false };
      });
      const toInspect = [
        ...preliminar.filter((x) => x.isNew),
        ...preliminar.filter((x) => !x.isNew),
      ].slice(0, 10);

      const fileMap = new Map<string, string[]>();
      await Promise.all(
        toInspect.map(async ({ c }) => {
          try {
            const detail = await fetchJson(`https://api.github.com/repos/${repo}/commits/${c.sha}`, 8_000);
            const files = Array.isArray(detail?.files)
              ? (detail.files as Array<{ filename?: string }>).map((f) => f.filename ?? "").filter(Boolean)
              : [];
            fileMap.set(c.sha, files);
          } catch {
            // se falhar, segue sem files (cai pra classificação por título)
          }
        })
      );

      // 4) classifica
      let maxNewWeight = 0;
      const reasons = new Set<string>();

      const commits: CommitItem[] = preliminar.map(({ c, isNew }) => {
        const msg = (c.commit?.message ?? "").split("\n")[0].slice(0, 200);
        const files = fileMap.get(c.sha) ?? [];
        const titleW = tagByTitle(msg);
        const { weight: fileW, touched } = tagByFiles(files);
        const finalW = Math.max(titleW, fileW);

        // whatsmeow bump?
        const touchedGo = files.some((f) => /^go\.(mod|sum)$/i.test(f));
        const mentionsWmeow = touchedGo && (
          // se whatsmeow aparece no msg ou se for um simples bump de deps
          /whatsmeow/i.test(msg) || /go\.mod|go\.sum|deps|bump/i.test(msg)
        );
        if (isNew && mentionsWmeow) {
          base.whatsmeow.recently_bumped = true;
          reasons.add(`Commit novo mexe em go.mod/go.sum (possível bump do Whatsmeow): ${c.sha.slice(0, 7)}`);
        }

        if (isNew) {
          if (finalW > maxNewWeight) maxNewWeight = finalW;
          if (finalW >= 3) {
            reasons.add(`Alto impacto em ${c.sha.slice(0, 7)}: "${msg.slice(0, 70)}"${touched.length ? ` (${touched.slice(0, 2).join(", ")})` : ""}`);
          }
        }

        return {
          sha: c.sha,
          short: c.sha.slice(0, 7),
          message: msg,
          date: c.commit?.author?.date ?? null,
          author: c.commit?.author?.name ?? null,
          url: c.html_url ?? `https://github.com/${repo}/commit/${c.sha}`,
          is_new: isNew,
          files_inspected: fileMap.has(c.sha),
          touched_files: touched,
          risk_tags: weightToTag(finalW),
        };
      });

      const newCount = commits.filter((x) => x.is_new).length;
      base.commits = commits;
      base.new_commits_count = newCount;

      if (newCount === 0) base.risk = "none";
      else if (maxNewWeight >= 3) base.risk = "high";
      else if (maxNewWeight >= 2 || base.whatsmeow.recently_bumped) base.risk = "medium";
      else base.risk = "low";

      base.block_direct_update = base.risk === "high";

      if (newCount > 0 && reasons.size === 0) {
        if (base.risk === "medium") reasons.add("Mudanças em dependências, webhook ou build.");
        else if (base.risk === "low") reasons.add("Mudanças pequenas: fixes, docs, testes.");
      }
      base.risk_reasons = Array.from(reasons).slice(0, 6);

      // 5) salva histórico (best-effort, não derruba a chamada se falhar)
      try {
        await supabaseAdmin.from("wuzapi_update_checks").insert({
          checked_by: context.userId,
          repo,
          latest_remote_sha: commits[0]?.sha ?? null,
          risk: base.risk,
          new_commits_count: newCount,
          new_commits: commits.filter((c) => c.is_new).slice(0, 20).map((c) => ({
            sha: c.short, message: c.message, date: c.date,
            tags: c.risk_tags, touched: c.touched_files,
          })),
          whatsmeow_ref: base.whatsmeow.ref,
          whatsmeow_recently_bumped: base.whatsmeow.recently_bumped,
          risk_reasons: base.risk_reasons,
          source: "manual",
        });
      } catch (e) {
        console.warn("[wuzapi-analysis] falha ao gravar histórico:", e);
      }

      return base;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      base.error = msg.includes("403") ? "Rate limit do GitHub atingido. Tente em alguns minutos." : msg;
      return base;
    }
  });

// ─────────────────────────────────────────────────────────────
// Histórico das últimas verificações (pra exibir na UI)
// ─────────────────────────────────────────────────────────────

export type UpdateCheckHistoryItem = {
  id: string;
  created_at: string;
  checked_by_email: string | null;
  risk: RiskLevel;
  new_commits_count: number;
  latest_remote_sha: string | null;
  whatsmeow_ref: string | null;
  whatsmeow_recently_bumped: boolean;
};

export const listWuzapiUpdateChecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UpdateCheckHistoryItem[]> => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("wuzapi_update_checks")
      .select("id, created_at, checked_by, risk, new_commits_count, latest_remote_sha, whatsmeow_ref, whatsmeow_recently_bumped")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error("Falha ao ler histórico.");

    const ids = Array.from(new Set((data ?? []).map((r) => r.checked_by).filter(Boolean))) as string[];
    const emails = new Map<string, string>();
    if (ids.length > 0) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      for (const p of profs ?? []) emails.set(p.id, p.email ?? "");
    }

    return (data ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      checked_by_email: r.checked_by ? emails.get(r.checked_by) ?? null : null,
      risk: r.risk as RiskLevel,
      new_commits_count: r.new_commits_count,
      latest_remote_sha: r.latest_remote_sha,
      whatsmeow_ref: r.whatsmeow_ref,
      whatsmeow_recently_bumped: r.whatsmeow_recently_bumped,
    }));
  });
