import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Lê o estado atual do onboarding do usuário logado.
export const getOnboardingState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed_at, onboarding_step")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      completed: !!data?.onboarding_completed_at,
      step: data?.onboarding_step ?? 0,
    };
  });

// Salva o passo atual (pra retomar depois).
export const saveOnboardingStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ step: z.number().int().min(0).max(50) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_step: data.step })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Marca como concluído (ou reabre, se reset=true).
export const setOnboardingCompleted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reset: z.boolean().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed_at: data.reset ? null : new Date().toISOString(),
        onboarding_step: data.reset ? 0 : undefined,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
