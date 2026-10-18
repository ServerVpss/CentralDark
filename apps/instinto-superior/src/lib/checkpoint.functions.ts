import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CheckpointView = {
  ok: boolean;
  state: string;
  mission?: string;
  last_step?: string;
  next_cursor?: string;
  intent?: string;
  receipt_sha256?: string;
  verified_steps?: number;
  events?: number;
  at?: string;
  plan_ready?: boolean;
  owner?: string;
};

/** VPS/Hermes owner. This is an authenticated readback, not another checkpoint engine. */
async function authorized(context: {
  supabase: {
    from: (name: string) => any;
  };
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Response("Proibido", { status: 403 });
}

async function checkpointCLI(args: string[]): Promise<{ ok: boolean; payload: CheckpointView }> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { existsSync } = await import("node:fs");
  const script = "/root/.hermes/centraldark/bin/centraldark-entry.py";
  if (!existsSync(script)) {
    return { ok: false, payload: { ok: false, state: "VPS_CHECKPOINT_OWNER_NOT_MOUNTED" } };
  }
  try {
    const result = await promisify(execFile)("python3", [script, ...args], {
      timeout: 12_000, maxBuffer: 96 * 1024, encoding: "utf8",
    });
    const payload = JSON.parse(result.stdout) as CheckpointView;
    if (!payload || typeof payload.ok !== "boolean" || typeof payload.state !== "string") {
      return { ok: false, payload: { ok: false, state: "CHECKPOINT_RESPONSE_INVALID" } };
    }
    return { ok: payload.ok, payload };
  } catch {
    return { ok: false, payload: { ok: false, state: "VPS_CHECKPOINT_RUNTIME_UNREACHABLE" } };
  }
}

export const lerUltimoCheckpointCentralDark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CheckpointView> => {
    await authorized(context);
    return (await checkpointCLI(["--status"])).payload;
  });

export const continuarUltimaMissaoCentralDark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CheckpointView> => {
    await authorized(context);
    const snapshot = await checkpointCLI(["--status"]);
    if (!snapshot.ok || !snapshot.payload.plan_ready) {
      return {
        ...snapshot.payload,
        state: snapshot.ok ? "WAITING_FOR_PROVEN_EXECUTION_PLAN" : snapshot.payload.state,
      };
    }
    const { spawn } = await import("node:child_process");
    // Sem entrada arbitrária do navegador: executa exclusivamente o último plano
    // privado, previamente validado e idempotente pelo checkpoint owner.
    return await new Promise<CheckpointView>((resolve) => {
      const child = spawn("python3", ["/root/.hermes/centraldark/bin/centraldark-entry.py", "--continue"], {
        cwd: "/root", detached: true, stdio: "ignore",
      });
      child.once("error", () => resolve({ ...snapshot.payload, state: "DISPATCH_FAILED", ok: false }));
      child.once("spawn", () => {
        child.unref();
        resolve({ ...snapshot.payload, state: "DISPATCHED_AWAITING_RECEIPT", ok: true });
      });
    });
  });
