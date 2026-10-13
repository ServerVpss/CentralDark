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

async function requestOwner(path: "/health" | "/status" | "/start" | "/confirm" | "/logout" | "/qr/start" | "/qr/status" | "/qr/password" | "/qr/cancel",
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


// QR is an alternative of the existing Telegram user login, never a second owner.
// Telegram login tokens are short-lived; the browser receives only a PNG for display.
const qrSchema = z.discriminatedUnion("action", [
  z.object({action:z.literal("qrStart")}),
  z.object({action:z.literal("qrStatus"),id:z.string().uuid()}),
  z.object({action:z.literal("qrPassword"),id:z.string().uuid(),password:z.string().min(1).max(256)}),
  z.object({action:z.literal("qrCancel"),id:z.string().uuid()}),
]);

export type VinculoQrTelegram = {
  ok: boolean;
  estado: "QR_PENDING" | "STARTING" | "NEEDS_2FA" | "VERIFYING_2FA" |
    "CONNECTED" | "CANCELLED" | "FAILED" | "QR_NOT_FOUND" | "QR_EXPIRED" |
    "CONFIG_BLOCKED" | "UNREACHABLE" | "ACTION_FAILED";
  id: string | null;
  image: string | null;
  expiresAt: number | null;
  detalhe: string;
};

export const gerenciarQrTelegram = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .inputValidator((input)=>qrSchema.parse(input))
  .handler(async ({context,data}):Promise<VinculoQrTelegram> => {
    await requireAdmin(context);
    if (data.action === "qrStart") {
      const current = await state();
      if (current.estado !== "READY") return {ok:false,estado:current.estado==="CONFIG_BLOCKED"?
        "CONFIG_BLOCKED":"ACTION_FAILED",id:null,image:null,expiresAt:null,detalhe:current.detalhe};
    }
    try {
      const endpoint = data.action === "qrStart" ? "/qr/start" :
        data.action === "qrStatus" ? "/qr/status" :
        data.action === "qrPassword" ? "/qr/password" : "/qr/cancel";
      const input = data.action === "qrStart" ? {} :
        data.action === "qrPassword" ? {id:data.id,password:data.password} : {id:data.id};
      const {http,payload} = await requestOwner(endpoint,input);
      const stateName = String((payload as Payload & {status?:string}).status || "ACTION_FAILED");
      const allowedStates = ["QR_PENDING","STARTING","NEEDS_2FA","VERIFYING_2FA",
        "CONNECTED","CANCELLED","FAILED","QR_NOT_FOUND","QR_EXPIRED"];
      const estado = (allowedStates.includes(stateName) ? stateName : "ACTION_FAILED") as VinculoQrTelegram["estado"];
      const candidateImage = (payload as Payload & {qrDataUrl?:string}).qrDataUrl;
      const expires = (payload as Payload & {expiresAt?:number}).expiresAt;
      const id = (payload as Payload & {id?:string}).id;
      // No raw tg:// URI or session string crosses the Admin ServerFn.
      const image = http===200 && estado==="QR_PENDING" && typeof candidateImage==="string" &&
        /^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(candidateImage) &&
        candidateImage.length < 180000 ? candidateImage : null;
      return {ok:http===200 && payload.ok===true, estado,
        id:typeof id==="string" && /^[a-f0-9-]{36}$/i.test(id)?id:null,
        image,expiresAt:typeof expires==="number" && Number.isFinite(expires)?expires:null,
        detalhe:estado==="QR_PENDING"?"Escaneie o QR com seu Telegram autenticado.":
          estado==="CONNECTED"?"Sessão MTProto salva no owner existente.":
          estado==="NEEDS_2FA"?"Digite a senha de duas etapas do Telegram.":
          estado==="VERIFYING_2FA"?"Validando senha no Telegram.":
          estado==="CANCELLED"?"QR cancelado; nenhuma conta foi desconectada.":
          estado==="QR_EXPIRED"?"O QR expirou; inicie novamente.":
          estado==="FAILED"?"Telegram não concluiu a autenticação. Tente novamente.":
          estado==="STARTING"?"Aguardando o primeiro QR do Telegram.":
          "QR não está disponível neste momento; nenhuma sessão foi alterada."};
    } catch {
      return {ok:false,estado:"UNREACHABLE",id:null,image:null,expiresAt:null,
        detalhe:"Owner MTProto não respondeu; a sessão existente foi preservada."};
    }
  });
