// Envio outbound real pelo canal MultiZap QR / WuzAPI via MultiZap-Gateway HTTPS.
// NUNCA toca em Recargas Brasil, /root/whatsapp-server, porta 3000, PM2 whatsapp-server
// nem auth_info_baileys. Só fala com ${MULTIZAP_GATEWAY_URL}/messages/send-text|send-media.
//
// O Gateway autentica via Bearer MULTIZAP_GATEWAY_TOKEN (server-only); o token NUNCA
// trafega para o frontend e nunca é logado.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";
import type { DispatchInput, DispatchResult } from "@/lib/whatsapp-send.server";

const HOURLY_LIMIT = 250;

function onlyDigits(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

function maskPhone(p: string): string {
  const d = onlyDigits(p);
  if (d.length <= 4) return "***";
  return `${d.slice(0, 4)}****${d.slice(-2)}`;
}

function resolveGatewayConnectionId(conn: {
  phone_number_id: string | null;
  baileys_session_id?: string | null;
  session_data?: unknown;
}): string | null {
  const sd = (conn.session_data ?? null) as { gateway_connection_id?: string } | null;
  return (
    sd?.gateway_connection_id ||
    conn.baileys_session_id ||
    conn.phone_number_id ||
    null
  );
}

type WuzapiGatewaySendResponse = {
  id?: string | null;
  message_id?: string | null;
  success?: boolean;
  code?: number;
  details?: string;
  Details?: string;
  data?: {
    id?: string | null;
    Id?: string | null;
    message_id?: string | null;
    MessageID?: string | null;
    Details?: string;
    details?: string;
  } | null;
};

function getWuzapiMessageId(data: WuzapiGatewaySendResponse | null | undefined): string | null {
  return data?.id ?? data?.message_id ?? data?.data?.id ?? data?.data?.Id ?? data?.data?.message_id ?? data?.data?.MessageID ?? null;
}

function getWuzapiDetails(data: WuzapiGatewaySendResponse | null | undefined): string | null {
  return data?.details ?? data?.Details ?? data?.data?.details ?? data?.data?.Details ?? null;
}

function isWuzapiAccepted(data: WuzapiGatewaySendResponse | null | undefined): boolean {
  if (!data) return false;
  if (data.success === false) return false;
  if (typeof data.code === "number" && data.code >= 400) return false;
  return data.success === true || getWuzapiMessageId(data) !== null || /sent|success|ok/i.test(getWuzapiDetails(data) ?? "");
}

export async function sendWuzapiMessage(input: DispatchInput): Promise<DispatchResult> {
  const started = Date.now();

  // 1. Carrega a conexão (já validada por dispatchWhatsAppMessage, mas pegamos os campos extras aqui).
  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,phone_number_id,baileys_session_id,session_data,status,provider")
    .eq("id", input.connectionId)
    .single();
  if (!conn) {
    return { ok: false, code: "NOT_FOUND", message: "Conexão MultiZap QR não encontrada." };
  }

  // 2. Provider tem que ser MultiZap QR / WuzAPI.
  if (conn.provider !== "wuzapi_gateway" && conn.provider !== "multizap_qr") {
    return {
      ok: false,
      code: "BLOCKED",
      message: `Provider '${conn.provider}' não é MultiZap QR/WuzAPI.`,
    };
  }

  // 3. Templates Meta não rolam em WuzAPI — só texto livre (e mídia futuramente).
  if (input.templateName) {
    return {
      ok: false,
      code: "BLOCKED",
      message: "Templates Meta só funcionam em conexões Meta Cloud API. Use texto livre no MultiZap QR.",
    };
  }
  if (input.interactive) {
    return {
      ok: false,
      code: "BLOCKED",
      message: "Mensagens interativas com botões ainda não estão disponíveis no MultiZap QR/WuzAPI.",
    };
  }

  // 4. Travas do master/workspace (mesmas usadas no caminho Meta).
  const { data: ctrl } = await supabaseAdmin
    .from("workspace_controls")
    .select("is_paused,block_whatsapp_send,block_whatsapp_media,paused_reason")
    .eq("workspace_id", conn.workspace_id)
    .maybeSingle();
  if (ctrl?.is_paused) {
    return {
      ok: false,
      code: "BLOCKED",
      message: ctrl.paused_reason
        ? `Conta pausada pelo administrador: ${ctrl.paused_reason}`
        : "Conta pausada pelo administrador.",
    };
  }
  if (ctrl?.block_whatsapp_send) {
    return { ok: false, code: "BLOCKED", message: "Envio de WhatsApp bloqueado pelo administrador." };
  }
  if (input.media && ctrl?.block_whatsapp_media) {
    return { ok: false, code: "BLOCKED", message: "Envio de mídia bloqueado pelo administrador." };
  }

  // 5. Status da conexão.
  // ANTES de bloquear por status stale ('error'/'disconnected'/'throttled'/'unknown'),
  // revalida o estado real direto no Gateway. Isso evita falso negativo quando a
  // conexão está viva (recebendo no webhook) mas o CRM ainda tem o status antigo
  // de uma tentativa anterior. Reaproveita `gatewayCall` (mesmo utilitário usado
  // por todo o resto do CRM) — NUNCA mexe em Gateway/WuzAPI/VPS.
  if (conn.status !== "connected") {
    const gwIdForCheck = resolveGatewayConnectionId(conn);
    if (!gwIdForCheck) {
      return {
        ok: false,
        code: "BLOCKED",
        message:
          "Conexão MultiZap QR sem vínculo com o Gateway. Refaça o pareamento do QR em /app/canais.",
      };
    }
    console.log(
      `[wuzapi-send] CONEXAO QR STATUS REFRESH conn=${conn.id} status_crm=${conn.status} → consultando Gateway`,
    );
    const probe = await gatewayCall<{ status?: string; phone_number?: string | null }>(
      `/connections/${encodeURIComponent(gwIdForCheck)}/status`,
      { method: "GET" },
      { timeoutMs: 6000 },
    );
    const remoteStatus = String(probe.data?.status ?? "").toLowerCase();
    const isReallyConnected =
      probe.ok && (remoteStatus === "connected" || remoteStatus === "online");

    if (isReallyConnected) {
      // Auto-cura: Gateway confirmou conectado, então o status do CRM estava
      // velho. Promove para 'connected' e limpa o último erro.
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({ status: "connected", last_error: null, last_error_at: null })
        .eq("id", conn.id);
      conn.status = "connected";
      console.log(
        `[wuzapi-send] CONEXAO QR AUTO RECUPERADA conn=${conn.id} remote_status=${remoteStatus}`,
      );
    } else {
      const probeStatusLabel = probe.ok
        ? remoteStatus || "desconhecido"
        : `falha_consulta:${probe.error?.kind ?? "unknown"}`;
      console.warn(
        `[wuzapi-send] CONEXAO QR REALMENTE DESCONECTADA conn=${conn.id} status_crm=${conn.status} remote=${probeStatusLabel}`,
      );
      return {
        ok: false,
        code: "BLOCKED",
        message:
          "O WhatsApp dessa conexão não está conectado no momento. Abra /app/canais, leia o QR Code de novo e tente enviar.",
      };
    }
  }

  // 6. Rate limit / cooldown locais (mesmo schema usado pra Meta — protege o número do banimento).
  const now = new Date();
  const { data: rate } = await supabaseAdmin
    .from("whatsapp_rate_state")
    .select("*")
    .eq("connection_id", conn.id)
    .maybeSingle();
  if (rate?.cooldown_until && new Date(rate.cooldown_until) > now) {
    return {
      ok: false,
      code: "COOLDOWN",
      message: `Em cooldown anti-ban até ${new Date(rate.cooldown_until).toLocaleString("pt-BR")}.`,
    };
  }
  const currentHour = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000).toISOString();
  const hourCount = rate && rate.hour_bucket === currentHour ? rate.hour_count : 0;
  if (hourCount >= HOURLY_LIMIT) {
    return { ok: false, code: "RATE_LIMIT", message: `Limite anti-ban atingido (${HOURLY_LIMIT}/h).` };
  }

  // 7. Resolve o ID que o Gateway conhece e normaliza o destinatário.
  const gatewayConnId = resolveGatewayConnectionId(conn);
  if (!gatewayConnId) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Conexão MultiZap QR sem gateway_connection_id — refaça o pareamento do QR.",
    };
  }
  // Grupos preservam o JID completo (`...@g.us`); só privado é normalizado pra dígitos.
  const rawTo = String(input.to ?? "").trim();
  const isGroup = rawTo.toLowerCase().endsWith("@g.us");
  const to = isGroup ? rawTo : onlyDigits(rawTo);
  if (isGroup) {
    // JID de grupo: precisa ter pelo menos algum dígito antes do "@g.us"
    if (to.length <= "@g.us".length) {
      return { ok: false, code: "BLOCKED", message: "Grupo de destino inválido." };
    }
  } else if (to.length < 8) {
    return { ok: false, code: "BLOCKED", message: "Número de destino inválido." };
  }

  const isMedia = !!input.media;
  const text = input.text ?? input.media?.caption ?? "";
  const logMessageType = isMedia ? input.media!.type : "text";

  // 8. Chama o Gateway. O token nunca aparece nos logs (gatewayCall sanitiza).
  const path = isMedia ? "/messages/send-media" : "/messages/send-text";
  const body = isMedia
    ? {
        connection_id: gatewayConnId,
        to,
        type: input.media!.type,
        media_url: input.media!.link,
        caption: input.media!.caption ?? null,
      }
    : { connection_id: gatewayConnId, to, message: text };

  // Log de payload sanitizado (sem token, telefone mascarado) pra diagnosticar 400.
  console.log(
    `[wuzapi-send] → workspace=${conn.workspace_id} conn=${conn.id} ticket=${input.ticketId ?? "-"} ` +
      `tipo=${isGroup ? "grupo" : "privado"} destino=${isGroup ? to : maskPhone(to)} has_g_us=${isGroup} ` +
      `endpoint=${path} payload_keys=${Object.keys(body).join(",")} body_len=${text.length}`,
  );

  const call = await gatewayCall<WuzapiGatewaySendResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const latency = Date.now() - started;

  // 9. Erro do Gateway → registra falha e devolve código amigável.
  if (!call.ok) {
    const kind = call.error?.kind ?? "unknown";
    const status = call.status ?? 0;
    const rawErrMsg = call.error?.message ?? "Falha ao falar com o MultiZap-Gateway.";

    // 401 do CRM → Gateway: token Bearer do Gateway divergente / ausente.
    // (Diferente de Gateway → WuzAPI 401, que vira `wuzapi_rejected` 502 aqui;
    //  e de Gateway → CRM 401, que aparece nos logs do Gateway, não nesse caminho.)
    const isCrmToGateway401 = status === 401 || kind === "unauthorized";
    const isBadRequest = status === 400;
    const errMsg = isCrmToGateway401
      ? "Integração WhatsApp não autorizada. Verifique o token do Gateway."
      : isBadRequest
        ? `Destino do grupo inválido ou payload recusado pela WuzAPI.${rawErrMsg ? ` (detalhe: ${rawErrMsg})` : ""}`
        : rawErrMsg;

    type FailCode = "OUT_OF_WINDOW" | "COOLDOWN" | "RATE_LIMIT" | "META_ERROR" | "NOT_FOUND" | "BLOCKED" | "CIRCUIT_OPEN" | "TIMEOUT" | "NETWORK";
    let outCode: FailCode;
    if (kind === "timeout") outCode = "TIMEOUT";
    else if (isCrmToGateway401) outCode = "BLOCKED";
    else if (status === 429) outCode = "RATE_LIMIT";
    else if (status === 409 || status === 404) outCode = "BLOCKED";
    else if (isBadRequest) outCode = "BLOCKED";
    else if (
      kind === "connection_refused" ||
      kind === "dns_error" ||
      kind === "tls_error" ||
      kind === "network_error"
    )
      outCode = "NETWORK";
    else outCode = "META_ERROR"; // reaproveita o código existente pra erros de upstream

    // Cooldown progressivo: só aplica quando o erro pode indicar risco real de
    // rajada/upstream instável. NÃO aplicar cooldown para:
    // - CRM → Gateway 401: erro de configuração de token, não risco anti-ban.
    // - HTTP 400: payload/destino inválido, a sessão QR continua viva.
    const shouldApplyCooldown =
      status === 429 ||
      status >= 500 ||
      kind === "timeout" ||
      kind === "connection_refused" ||
      kind === "dns_error" ||
      kind === "tls_error" ||
      kind === "network_error";

    const consec = shouldApplyCooldown ? (rate?.consecutive_errors ?? 0) + 1 : (rate?.consecutive_errors ?? 0);

    if (shouldApplyCooldown) {
      const cooldownMin = status === 429 ? 30 : Math.min(consec * 2, 60);
      const cooldownUntil = new Date(now.getTime() + cooldownMin * 60_000).toISOString();
      await supabaseAdmin.from("whatsapp_rate_state").upsert({
        connection_id: conn.id,
        workspace_id: conn.workspace_id,
        hour_bucket: currentHour,
        hour_count: hourCount,
        cooldown_until: cooldownUntil,
        last_429_at: status === 429 ? now.toISOString() : rate?.last_429_at ?? null,
        consecutive_errors: consec,
        updated_at: now.toISOString(),
      });
    }

    // Só rebaixa o `status` da conexão quando o erro indica problema REAL
    // de canal (auth, queda, 5xx, rede). HTTP 400 = payload/destino ruim;
    // a sessão WuzAPI continua viva e não pode ser marcada como 'error',
    // senão a próxima tentativa fica bloqueada na checagem de status.
    const shouldDowngrade =
      !isBadRequest &&
      !isCrmToGateway401 &&
      (status === 409 ||
        status >= 500 ||
        kind === "connection_refused" ||
        kind === "dns_error" ||
        kind === "tls_error" ||
        kind === "network_error");
    const downgradeTo = status === 409 ? "disconnected" : "error";
    await supabaseAdmin
      .from("whatsapp_connections")
      .update({
        last_error: errMsg.slice(0, 500),
        last_error_at: now.toISOString(),
        ...(shouldDowngrade ? { status: downgradeTo } : {}),
      })
      .eq("id", conn.id);
    const errorTag = isCrmToGateway401
      ? "crm_to_gateway_unauthorized"
      : kind;
    await supabaseAdmin.from("whatsapp_message_log").insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      direction: "outbound",
      contact_phone: to,
      ticket_id: input.ticketId ?? null,
      body: text || null,
      message_type: logMessageType,
      status: "failed",
      error_code: `wuzapi:${errorTag}:${status || "0"}`,
      error_message: errMsg,
      is_template: false,
    });

    if (isCrmToGateway401) {
      console.warn(
        `[wuzapi-send] ✗ CRM→Gateway 401 (token Bearer do Gateway inválido/divergente; não aplicado cooldown e não rebaixado status da conexão) workspace=${conn.workspace_id} conn=${conn.id} latency=${latency}ms`,
      );
    } else {
      console.warn(
        `[wuzapi-send] ✗ workspace=${conn.workspace_id} conn=${conn.id} kind=${kind} status=${status} latency=${latency}ms`,
      );
    }
    return { ok: false, code: outCode, message: errMsg };
  }


  const upstreamCode = call.data?.code ?? null;
  const upstreamDetails = getWuzapiDetails(call.data) ?? null;
  if (!isWuzapiAccepted(call.data)) {
    const errMsg = upstreamDetails || `WuzAPI não confirmou envio${upstreamCode ? ` (code=${upstreamCode})` : ""}.`;
    await supabaseAdmin.from("whatsapp_message_log").insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      direction: "outbound",
      contact_phone: to,
      ticket_id: input.ticketId ?? null,
      body: text || null,
      message_type: logMessageType,
      status: "failed",
      error_code: `wuzapi:unconfirmed:${upstreamCode ?? "no_code"}`,
      error_message: errMsg,
      is_template: false,
    });
    console.warn(
      `[wuzapi-send] ✗ workspace=${conn.workspace_id} conn=${conn.id} unconfirmed upstreamCode=${upstreamCode ?? "-"} detail=${upstreamDetails ?? "-"} latency=${latency}ms`,
    );
    return { ok: false, code: "META_ERROR", message: errMsg };
  }

  // 10. Sucesso. Reseta cooldown, incrementa contador, loga e marca a conexão como conectada.
  const messageId = getWuzapiMessageId(call.data);

  await supabaseAdmin.from("whatsapp_rate_state").upsert({
    connection_id: conn.id,
    workspace_id: conn.workspace_id,
    hour_bucket: currentHour,
    hour_count: hourCount + 1,
    cooldown_until: null,
    consecutive_errors: 0,
    updated_at: now.toISOString(),
  });
  await supabaseAdmin.from("whatsapp_message_log").insert({
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    direction: "outbound",
    contact_phone: to,
    ticket_id: input.ticketId ?? null,
    message_id: messageId,
    body: text || null,
    message_type: logMessageType,
    status: "sent",
    is_template: false,
  });
  if (conn.status !== "connected") {
    await supabaseAdmin
      .from("whatsapp_connections")
      .update({ status: "connected", last_error: null, last_error_at: null })
      .eq("id", conn.id);
  }

  console.log(
    `[wuzapi-send] ✓ workspace=${conn.workspace_id} conn=${conn.id} to=${maskPhone(to)} latency=${latency}ms upstreamCode=${upstreamCode ?? "-"} detail=${upstreamDetails ?? "-"} msgId=${messageId ?? "-"}`,
  );
  return { ok: true, messageId };
}
