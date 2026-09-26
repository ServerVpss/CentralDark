// ServerFns CRUD pra chaves PIX estáticas (cadastro fixo por workspace).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KeySchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid(),
  label: z.string().min(1).max(80),
  keyType: z.enum(["cpf", "cnpj", "email", "phone", "random"]),
  keyValue: z.string().min(1).max(255),
  beneficiaryName: z.string().min(1).max(80),
  beneficiaryCity: z.string().min(1).max(40).default("SAO PAULO"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const listPixStaticKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("pix_static_keys")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { keys: rows ?? [] };
  });

export const upsertPixStaticKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => KeySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Se marcou como padrão, desmarca os outros antes
    if (data.isDefault) {
      await supabase
        .from("pix_static_keys")
        .update({ is_default: false })
        .eq("workspace_id", data.workspaceId)
        .eq("is_default", true);
    }

    const payload = {
      workspace_id: data.workspaceId,
      label: data.label,
      key_type: data.keyType,
      key_value: data.keyValue,
      beneficiary_name: data.beneficiaryName,
      beneficiary_city: data.beneficiaryCity,
      is_default: data.isDefault,
      is_active: data.isActive,
      created_by: userId,
    };

    if (data.id) {
      const { error } = await supabase
        .from("pix_static_keys")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: inserted, error } = await supabase
        .from("pix_static_keys")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: inserted.id };
    }
  });

export const deletePixStaticKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("pix_static_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
