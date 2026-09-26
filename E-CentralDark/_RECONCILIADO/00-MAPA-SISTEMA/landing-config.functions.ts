import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";

// Tipos da config
export type LandingSections = {
  intro: boolean;
  hero: boolean;
  metrics: boolean;
  features: boolean;
  connections: boolean;
  comparison: boolean;
  plans: boolean;
  security: boolean;
  final_cta: boolean;
};
export type LandingMetric = { value: string; label: string };
export type LandingComparisonRow = { feature: string; us: boolean; them: boolean };
export type LandingHero = {
  badge: string;
  headline_pre: string;
  headline_highlight: string;
  headline_post: string;
  subheadline: string;
  cta_primary: string;
  cta_secondary: string;
  trust_badges: string[];
};
export type LandingPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: string;
  max_users: number;
  max_connections: number;
  max_sectors: number;
  max_messages_per_month: number;
  max_campaigns_per_month: number;
  allow_byok: boolean;
  sort_order: number;
};
export type LandingConfig = {
  sections: LandingSections;
  metrics: LandingMetric[];
  comparison: LandingComparisonRow[];
  hero: LandingHero;
  plans: LandingPlan[];
  intro_duration_ms: number;
  intro_show_on_app: boolean;
};

// PÚBLICA — landing carrega sem login.
export const getLandingConfig = createServerFn({ method: "GET" }).handler(async (): Promise<LandingConfig> => {
  const [{ data: cfg, error: e1 }, { data: plans, error: e2 }] = await Promise.all([
    supabaseAdmin.rpc("get_landing_config"),
    supabaseAdmin
      .from("plans")
      .select("id,slug,name,description,price_cents,currency,interval,max_users,max_connections,max_sectors,max_messages_per_month,max_campaigns_per_month,allow_byok,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const c = (cfg ?? {}) as Partial<LandingConfig>;
  const defaultSections: LandingSections = {
    intro: true, hero: true, metrics: true, features: true, connections: true,
    comparison: true, plans: true, security: true, final_cta: true,
  };
  return {
    sections: { ...defaultSections, ...(c.sections ?? {}) } as LandingSections,
    metrics: (c.metrics ?? []) as LandingMetric[],
    comparison: (c.comparison ?? []) as LandingComparisonRow[],
    hero: (c.hero ?? {
      badge: "", headline_pre: "", headline_highlight: "", headline_post: "",
      subheadline: "", cta_primary: "Teste grátis", cta_secondary: "Falar com especialista",
      trust_badges: [],
    }) as LandingHero,
    plans: (plans ?? []) as LandingPlan[],
    intro_duration_ms: typeof c.intro_duration_ms === "number" ? c.intro_duration_ms : 2200,
    intro_show_on_app: typeof c.intro_show_on_app === "boolean" ? c.intro_show_on_app : true,
  };
});

// MASTER — leitura completa pra editor
async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

export const adminGetLandingConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select("landing_sections,landing_metrics,landing_comparison,landing_hero,intro_duration_ms,intro_show_on_app")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const sectionsSchema = z.object({
  intro: z.boolean(),
  hero: z.boolean(),
  metrics: z.boolean(),
  features: z.boolean(),
  connections: z.boolean(),
  comparison: z.boolean(),
  plans: z.boolean(),
  security: z.boolean(),
  final_cta: z.boolean(),
});
const metricSchema = z.object({ value: z.string().min(1).max(20), label: z.string().min(1).max(80) });
const comparisonSchema = z.object({ feature: z.string().min(1).max(120), us: z.boolean(), them: z.boolean() });
const heroSchema = z.object({
  badge: z.string().max(160),
  headline_pre: z.string().max(80),
  headline_highlight: z.string().max(80),
  headline_post: z.string().max(80),
  subheadline: z.string().max(400),
  cta_primary: z.string().min(1).max(40),
  cta_secondary: z.string().min(1).max(40),
  trust_badges: z.array(z.string().min(1).max(60)).max(6),
});

export const adminUpdateLandingConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    landing_sections: sectionsSchema.optional(),
    landing_metrics: z.array(metricSchema).max(8).optional(),
    landing_comparison: z.array(comparisonSchema).max(20).optional(),
    landing_hero: heroSchema.optional(),
    intro_duration_ms: z.number().int().min(500).max(15000).optional(),
    intro_show_on_app: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const updates: Record<string, unknown> = {};
    if (data.landing_sections) updates.landing_sections = data.landing_sections;
    if (data.landing_metrics) updates.landing_metrics = data.landing_metrics;
    if (data.landing_comparison) updates.landing_comparison = data.landing_comparison;
    if (data.landing_hero) updates.landing_hero = data.landing_hero;
    if (typeof data.intro_duration_ms === "number") updates.intro_duration_ms = data.intro_duration_ms;
    if (typeof data.intro_show_on_app === "boolean") updates.intro_show_on_app = data.intro_show_on_app;
    if (Object.keys(updates).length === 0) return { ok: true };

    const { data: before } = await supabaseAdmin
      .from("master_settings")
      .select("landing_sections,landing_metrics,landing_comparison,landing_hero,intro_duration_ms,intro_show_on_app")
      .eq("id", 1).maybeSingle();

    const { error } = await supabaseAdmin.from("master_settings").update(updates as never).eq("id", 1);
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin", action: "landing_config_updated",
      actorUserId: context.userId, entity: "master_settings", entityId: "1",
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...updates },
      payload: { fields: Object.keys(updates) },
    });
    return { ok: true };
  });
