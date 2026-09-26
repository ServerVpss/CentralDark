// Adapter MisticPay — Etapa 3
// Usa credenciais do workspace_payment_gateways (jsonb credentials).
// NUNCA expor credentials no retorno; apenas status/ids.

export type MisticPayCreds = {
  client_id: string;
  client_secret: string;
  base_url?: string;
};

export type CreatePixInput = {
  amount: number;
  payerName: string;
  payerDocument?: string | null;
  description: string;
  clientTransactionId: string;
  webhookUrl?: string | null;
};

export type CreatePixResult = {
  ok: true;
  externalId: string;
  status: string;
  copyPaste: string | null;
  qrcodeBase64: string | null;
  qrcodeUrl: string | null;
  raw: unknown;
} | { ok: false; status: number; message: string; raw: unknown };

const DEFAULT_BASE = "https://api.misticpay.com";

function headers(creds: MisticPayCreds) {
  return {
    ci: creds.client_id,
    cs: creds.client_secret,
    "Content-Type": "application/json",
  };
}

export function extractMisticCreds(jsonb: unknown): MisticPayCreds | null {
  if (!jsonb || typeof jsonb !== "object") return null;
  const j = jsonb as Record<string, unknown>;
  const client_id = (j.client_id ?? j.ci) as string | undefined;
  const client_secret = (j.client_secret ?? j.cs) as string | undefined;
  if (!client_id || !client_secret) return null;
  return {
    client_id,
    client_secret,
    base_url: (j.base_url as string | undefined) ?? DEFAULT_BASE,
  };
}

export async function misticHealthCheck(creds: MisticPayCreds): Promise<{ ok: boolean; status: number; message?: string }> {
  const base = creds.base_url ?? DEFAULT_BASE;
  try {
    const res = await fetch(`${base}/api/users/info`, { method: "GET", headers: headers(creds) });
    return { ok: res.ok, status: res.status, message: res.ok ? undefined : await res.text().catch(() => "") };
  } catch (e) {
    return { ok: false, status: 0, message: (e as Error).message };
  }
}

export async function misticCreatePix(creds: MisticPayCreds, input: CreatePixInput): Promise<CreatePixResult> {
  const base = creds.base_url ?? DEFAULT_BASE;
  const body: Record<string, unknown> = {
    amount: input.amount,
    payerName: input.payerName,
    transactionId: input.clientTransactionId,
    description: input.description,
  };
  if (input.payerDocument) body.payerDocument = input.payerDocument;
  if (input.webhookUrl) body.projectWebhook = input.webhookUrl;

  let res: Response;
  try {
    res = await fetch(`${base}/api/transactions/create`, {
      method: "POST",
      headers: headers(creds),
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, status: 0, message: (e as Error).message, raw: null };
  }
  const json = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    return { ok: false, status: res.status, message: (json as { message?: string })?.message ?? `HTTP ${res.status}`, raw: json };
  }
  const d = (json as { data?: Record<string, unknown> })?.data ?? {};
  return {
    ok: true,
    externalId: String(d.transactionId ?? ""),
    status: String(d.transactionState ?? "PENDENTE"),
    copyPaste: (d.copyPaste as string | undefined) ?? null,
    qrcodeBase64: (d.qrCodeBase64 as string | undefined) ?? null,
    qrcodeUrl: (d.qrcodeUrl as string | undefined) ?? null,
    raw: json,
  };
}

export async function misticCheckStatus(creds: MisticPayCreds, externalId: string) {
  const base = creds.base_url ?? DEFAULT_BASE;
  const res = await fetch(`${base}/api/transactions/check`, {
    method: "POST",
    headers: headers(creds),
    body: JSON.stringify({ transactionId: externalId }),
  });
  const json = await res.json().catch(() => ({} as Record<string, unknown>));
  return { ok: res.ok, status: res.status, body: json };
}
