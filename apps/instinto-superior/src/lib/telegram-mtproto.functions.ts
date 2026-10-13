import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Reutiliza o MTProto GramJS existente, exclusivamente via loopback do host.
// Conta de usuario utiliza sessao MTProto; token de bot jamais serve para login.
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), phone: z.string().regex(/^\+?\d{8,15}$/) }),
  z.object({ action: z.literal("confirm"), phone: z.string().regex(/^\+?\d{8,15}$/),
    code: z.string().regex(/^\d{4,8}$/), password: z.string().max(256).optional() }),
  z.object({ action: z.literal("logout"), confirmation: z.literal("DESCONECTAR_TELEGRAM") }),
]);

type Payload = { ok?: boolean; service?: string; configured?: boolean; connected?: boolean;
  needsPassword?: boolean; me?: {id?: string; firstName?: string; username?: string} };
export type VinculoTelegram = {
  estado: "CONNECTED" | "READY" | "CONFIG_BLOCKED" | "UNREACHABLE";
  connected: boolean; detalhe: string;
  me: {id: string; firstName: string; username: string} | null;
};

async function requireAdmin(ctx: {supabase: any; userId: string}) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role")
    .eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (error || !data) throw new Response("Proibido", {status: 403});
}

function baseUrl() {
  const value = process.env["CENTRALDARK_MTPROTO_CONTROL_URL"] || "http://127.0.0.1:8790";
  const url = new URL(value);
  if (url.protocol !== "http:" ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw Error("MTProto deve ser acessado apenas pelo owner no loopback da VPS");
  }
  return url.origin;
}

async function requestOwner(path: "/health" | "/status" | "/start" | "/confirm" | "/logout",
  body?: Record<string, string>) {
  const response = await fetch(baseUrl() + path, {
    method: body ? "POST" : "GET",
    headers: { accept: "application/json", ...(body ? {"content-type": "application/json"} : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  // O dono permanece com telefones/codigos/senhas/session string.
  const payload = await response.json().catch(() => ({})) as Payload;
  return {http: response.status, payload};
}

async function state(): Promise<VinculoTelegram> {
  try {
    const health = await requestOwner("/health");
    if (health.http !== 200 || health.payload.service !== "telegram-mtproto") {
      return {estado:"UNREACHABLE",connected:false,me:null,detalhe:"Serviço MTProto não respondeu neste host."};
    }
    if (!health.payload.configured) {
      return {estado:"CONFIG_BLOCKED",connected:false,me:null,
        detalhe:"Faltam API ID/API HASH da conta de aplicativo no cofre da VPS."};
    }
    const result = await requestOwner("/status");
    if (result.http !== 200 || result.payload.ok !== true) {
      return {estado:"UNREACHABLE",connected:false,me:null,detalhe:"Sessão não pode ser conferida agora."};
    }
    if (result.payload.connected) {
      const user = result.payload.me;
      return {estado:"CONNECTED",connected:true,
        me: user?.id ? {id:String(user.id),firstName:String(user.firstName||"").slice(0,80),
          username:String(user.username||"").slice(0,80)} : null,
        detalhe:"Conta Telegram autenticada pelo MTProto existente."};
    }
    return {estado:"READY",connected:false,me:null,detalhe:"Pronto para autenticar uma conta Telegram."};
  } catch {
    return {estado:"UNREACHABLE",connected:false,me:null,detalhe:"Owner MTProto inacessível nesta implantação."};
  }
}

export const lerVinculoTelegram = createServerFn({method:"GET"})
  .middleware([requireSupabaseAuth])
  .handler(async ({context}): Promise<VinculoTelegram> => {
    await requireAdmin(context);
    return state();
  });

export const operarVinculoTelegram = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => schema.parse(input))
  .handler(async ({context,data}) => {
    await requireAdmin(context);
    const current = await state();
    if (!["READY","CONNECTED"].includes(current.estado)) {
      return {ok:false,estado:current.estado,needsPassword:false,detalhe:current.detalhe};
    }
    if (data.action === "start" && current.connected) {
      return {ok:false,estado:"ALREADY_CONNECTED",needsPassword:false,
        detalhe:"Conta já vinculada; sessão anterior preservada."};
    }
    try {
      const result = data.action === "start" ?
        await requestOwner("/start", {phone:data.phone}) :
        data.action === "confirm" ?
        await requestOwner("/confirm", {phone:data.phone,code:data.code,
          ...(data.password ? {password:data.password} : {})}) :
        await requestOwner("/logout", {});
      if (result.http === 401 && result.payload.needsPassword) {
        return {ok:false,estado:"NEEDS_2FA",needsPassword:true,detalhe:"Digite a senha de duas etapas."};
      }
      if (result.http !== 200 || result.payload.ok !== true) {
        return {ok:false,estado:"ACTION_FAILED",needsPassword:false,
          detalhe:"Telegram não confirmou. Confira os dados e consulte o estado."};
      }
      return {ok:true,estado:data.action === "start" ? "CODE_SENT" :
        data.action === "confirm" ? "CONNECTED" : "DISCONNECTED",
        needsPassword:false,detalhe:data.action === "start" ? "Código solicitado. Veja seu Telegram." :
          data.action === "confirm" ? "Conta conectada; sessão salva no owner da VPS." :
            "Sessão desconectada do MTProto."};
    } catch {
      return {ok:false,estado:"OWNER_UNREACHABLE",needsPassword:false,
        detalhe:"Não foi possível confirmar a operação. Consulte o estado antes de repetir."};
    }
  });
