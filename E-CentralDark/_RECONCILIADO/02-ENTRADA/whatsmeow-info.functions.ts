// Leitura pública do GitHub pra mostrar versão atual do Whatsmeow e WuzAPI no
// painel master. Fase 1 (leitura) — sem auth GitHub, só endpoint público.
// Sem token: 60 req/h por IP da VPS, o que é mais que suficiente.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type RepoInfo = {
  repo: string;
  latest_commit_sha: string | null;
  latest_commit_short: string | null;
  latest_commit_message: string | null;
  latest_commit_date: string | null;
  latest_tag: string | null;
  latest_tag_date: string | null;
  error: string | null;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function fetchRepoInfo(repo: string): Promise<RepoInfo> {
  const base: RepoInfo = {
    repo,
    latest_commit_sha: null,
    latest_commit_short: null,
    latest_commit_message: null,
    latest_commit_date: null,
    latest_tag: null,
    latest_tag_date: null,
    error: null,
  };

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "MultiZap-Master-Panel",
  };

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const [commitsRes, tagsRes, releasesRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, { headers, signal: ctrl.signal }),
        fetch(`https://api.github.com/repos/${repo}/tags?per_page=1`, { headers, signal: ctrl.signal }),
        fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers, signal: ctrl.signal }),
      ]);

      if (commitsRes.ok) {
        const arr = (await commitsRes.json()) as Array<{
          sha?: string;
          commit?: { message?: string; author?: { date?: string } };
        }>;
        const c = arr?.[0];
        if (c?.sha) {
          base.latest_commit_sha = c.sha;
          base.latest_commit_short = c.sha.slice(0, 7);
          base.latest_commit_message = (c.commit?.message ?? "").split("\n")[0].slice(0, 200);
          base.latest_commit_date = c.commit?.author?.date ?? null;
        }
      } else if (commitsRes.status === 403) {
        base.error = "Rate limit do GitHub atingido. Tente em alguns minutos.";
      } else {
        base.error = `GitHub commits HTTP ${commitsRes.status}`;
      }

      // Prioriza release oficial (tem data publicada); se não houver, cai pra tags.
      if (releasesRes.ok) {
        const r = (await releasesRes.json()) as { tag_name?: string; published_at?: string };
        if (r?.tag_name) {
          base.latest_tag = r.tag_name;
          base.latest_tag_date = r.published_at ?? null;
        }
      }
      if (!base.latest_tag && tagsRes.ok) {
        const arr = (await tagsRes.json()) as Array<{ name?: string }>;
        if (arr?.[0]?.name) base.latest_tag = arr[0].name!;
      }
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    base.error = e instanceof Error ? e.message : String(e);
  }

  return base;
}

export const getWhatsappEngineInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [wuzapi, whatsmeow] = await Promise.all([
      fetchRepoInfo("asternic/wuzapi"),
      fetchRepoInfo("tulir/whatsmeow"),
    ]);
    return { wuzapi, whatsmeow, checked_at: new Date().toISOString() };
  });
