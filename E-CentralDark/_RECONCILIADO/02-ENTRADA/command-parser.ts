// Parser de comandos do robô MultiZap — Etapa 3
// Reconhece comandos textuais de PIX vindos de cliente ou atendente.

export type ParsedCommand =
  | { kind: "pix_create"; amount: number; source: "customer" | "agent"; note?: string }
  | { kind: "pix_status"; source: "customer" | "agent" }
  | { kind: "pix_cancel"; source: "agent" }
  | { kind: "pix_list_pending"; source: "agent" }
  | { kind: "cash_summary"; source: "agent" }
  | { kind: "paid_claim"; source: "customer" }
  | { kind: "help"; source: "customer" | "agent" }
  | { kind: "none" };

const num = (raw: string): number | null => {
  // aceita "R$ 50,00", "50.00", "50", "  R$  35 "
  const s = raw.replace(/r\$/gi, "").replace(/\s+/g, "").replace(",", ".");
  const m = s.match(/(-?\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const v = Number(m[1]);
  return Number.isFinite(v) && v > 0 ? v : null;
};

const PAID_CLAIMS = /^(j[aá]\s+)?(paguei|enviei|feito|pago|pix\s+enviado|comprovante)\b/i;

export function parseChatCommand(input: string, opts: { isAgent: boolean }): ParsedCommand {
  if (!input) return { kind: "none" };
  const raw = input.trim();
  if (!raw) return { kind: "none" };
  const lower = raw.toLowerCase();
  const source = opts.isAgent ? "agent" : "customer";

  // ---- Atendente (prefixo /)
  if (opts.isAgent) {
    if (/^\/(pix|cobrar)\s+/i.test(lower)) {
      const rest = raw.replace(/^\/(pix|cobrar)\s+/i, "");
      const amount = num(rest);
      if (amount === null) return { kind: "pix_create", amount: NaN as number, source };
      const note = rest.replace(/^[^a-zA-Z]*[\d.,\s]+/, "").trim().slice(0, 200) || undefined;
      return { kind: "pix_create", amount, source, note };
    }
    if (/^\/(ver\s*pix|pagamento|status)\b/i.test(lower)) return { kind: "pix_status", source };
    if (/^\/(cancelar\s*pix)\b/i.test(lower)) return { kind: "pix_cancel", source: "agent" };
    if (/^\/(pendentes|pix\s*pendentes)\b/i.test(lower)) return { kind: "pix_list_pending", source: "agent" };
    if (/^\/(caixa|resumo)\b/i.test(lower)) return { kind: "cash_summary", source: "agent" };
    if (/^\/(ajuda|help)\b/i.test(lower)) return { kind: "help", source };
    // /cobrar sem barra
    if (/^cobrar\s+/i.test(lower)) {
      const amount = num(raw.replace(/^cobrar\s+/i, ""));
      return { kind: "pix_create", amount: amount ?? (NaN as number), source };
    }
  }

  // ---- Cliente ou atendente (sem barra)
  if (/^(gerar\s+pix|gerar\s+pagamento|gerar)\s+/i.test(lower)) {
    const amount = num(raw.replace(/^(gerar\s+pix|gerar\s+pagamento|gerar)\s+/i, ""));
    return { kind: "pix_create", amount: amount ?? (NaN as number), source };
  }
  if (/^(pix|pagamento)\s+/i.test(lower)) {
    const amount = num(raw.replace(/^(pix|pagamento)\s+/i, ""));
    return { kind: "pix_create", amount: amount ?? (NaN as number), source };
  }
  if (/^status\s+(pagamento|pix)\b/i.test(lower) || /^ver\s+pix\b/i.test(lower)) {
    return { kind: "pix_status", source };
  }
  if (!opts.isAgent && PAID_CLAIMS.test(lower)) return { kind: "paid_claim", source: "customer" };
  if (/^ajuda\b/i.test(lower)) return { kind: "help", source };

  return { kind: "none" };
}
