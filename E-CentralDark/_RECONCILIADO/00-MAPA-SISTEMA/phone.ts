// Normalizador único de telefone para unificar contatos Meta + QR/WuzAPI.
// NÃO está conectado a nenhum webhook ainda (Passo 2 do plano de unificação).
//
// Objetivo: receber qualquer formato sujo (jid, lid, com/sem DDI, com máscara)
// e devolver um E.164 sem "+" (só dígitos), pronto pra ser chave canônica.
//
// Exemplos:
//   normalizeE164("+55 11 99999-0001")             -> "5511999990001"
//   normalizeE164("5511999990001@s.whatsapp.net")  -> "5511999990001"
//   normalizeE164("11999990001")                   -> "5511999990001"
//   normalizeE164("551199990001")                  -> "551199990001"  (fixo SP, sem 9)
//   normalizeE164("abc")                           -> null
//   normalizeE164("")                              -> null
//   normalizeE164(null)                            -> null
//
// Regras Brasil (defaultCountry='55'):
//   - 10 dígitos (DDD + 8) ........ assume BR, prefixa 55 -> 12 dígitos
//   - 11 dígitos (DDD + 9 + 8) .... assume BR, prefixa 55 -> 13 dígitos
//   - 12 dígitos começando com 55 . já tem DDI BR (fixo) — mantém
//   - 13 dígitos começando com 55 . já tem DDI BR (móvel) — mantém
//   - 8 ou 9 dígitos (sem DDD) .... NULL (inseguro, falta DDD)
//   - <8 ou >15 dígitos ........... NULL (inválido por E.164)
//   - Não-BR (qualquer outro DDI) . mantém como veio, se 8..15 dígitos
//
// IMPORTANTE: a função é defensiva — quando não der pra inferir com segurança,
// retorna null. Quem chamar decide o fallback.

export type PhoneInput = string | number | null | undefined;

// Sufixos JID que correspondem a um TELEFONE REAL — podemos extrair os dígitos.
const PHONE_JID_SUFFIXES = [
  "@s.whatsapp.net",
  "@c.us",
  "@g.us", // grupo — ainda assim limpamos; quem chama decide se aceita grupo
  "@broadcast",
];

// `@lid` (Linked Identity) é um identificador INTERNO do WhatsApp, NÃO é telefone.
// Nunca converter "123...@lid" para "+123..." — não dá pra mandar mensagem pra isso.
// Quem precisa do LID original deve usar o JID cru, não passar por normalizeE164.
export function isLidJid(raw: PhoneInput): boolean {
  if (raw === null || raw === undefined) return false;
  return String(raw).trim().toLowerCase().endsWith("@lid");
}

export function normalizeE164(
  raw: PhoneInput,
  defaultCountry: string = "55",
): string | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;

  // LID nunca vira telefone — retorna null pra quem chamar decidir o fallback.
  if (s.endsWith("@lid")) return null;

  // Remove sufixos JID (whatsmeow/baileys) que correspondem a telefone real
  for (const suf of PHONE_JID_SUFFIXES) {
    if (s.endsWith(suf)) {
      s = s.slice(0, -suf.length);
      break;
    }
  }

  // Detecta DDI explícito via "+" antes de limpar símbolos
  const hasExplicitCountry = s.trimStart().startsWith("+");

  // Remove parte depois de ":" (ex: "5511999990001:42" usado em alguns lid)
  const colonIdx = s.indexOf(":");
  if (colonIdx > 0) s = s.slice(0, colonIdx);

  // Mantém só dígitos
  const digits = s.replace(/\D+/g, "");
  if (!digits) return null;

  // Limites E.164: 8..15 dígitos é o aceitável de entrada
  if (digits.length < 8 || digits.length > 15) return null;

  // Se veio com "+" explícito, é DDI internacional — não aplica heurística BR
  if (hasExplicitCountry) return digits;



  const dc = (defaultCountry || "").replace(/\D+/g, "") || "55";

  // Brasil — heurística específica
  if (dc === "55") {
    // 10 = DDD + fixo 8 dígitos     -> prefixa 55
    // 11 = DDD + móvel 9 dígitos    -> prefixa 55
    if (digits.length === 10 || digits.length === 11) {
      return dc + digits;
    }
    // 12 = 55 + DDD + fixo (8)
    // 13 = 55 + DDD + móvel (9)
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
      return digits;
    }
    // 8 ou 9 dígitos puros: falta DDD, inseguro
    if (digits.length === 8 || digits.length === 9) return null;

    // Qualquer outro tamanho (14..15) — provavelmente outro país; mantém como veio.
    return digits;
  }

  // Outros países: devolve só dígitos (sem heurística).
  return digits;
}

/**
 * Versão estrita: igual a normalizeE164 mas devolve string ("") em vez de null,
 * útil pra usar como chave em objetos sem precisar tratar null.
 * Não use pra gravar no banco — use normalizeE164 e trate o null.
 */
export function normalizeE164OrEmpty(raw: PhoneInput, defaultCountry: string = "55"): string {
  return normalizeE164(raw, defaultCountry) ?? "";
}

/**
 * Detecta telefones FAKE criados a partir de LID do WhatsApp (Linked Identity).
 * LIDs viram strings tipo "+124223842459759" (15 dígitos, DDI improvável) quando
 * o webhook antigo strip o "@lid" e gravou só os dígitos. Esses números NÃO
 * existem no WhatsApp — mandar mensagem pra eles é aceito pela WuzAPI mas
 * nunca chega ao destinatário.
 *
 * Regra conservadora:
 *  - termina com "@lid" → é LID cru, não é telefone.
 *  - 14+ dígitos E não começa com "55" (Brasil) → provável LID fake.
 *  - Telefones internacionais reais raramente passam de 13 dígitos.
 * Quem chamar deve bloquear o envio e mostrar mensagem amigável ao atendente.
 */
export function looksLikeLidFakePhone(raw: PhoneInput): boolean {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim().toLowerCase();
  if (!s) return false;
  if (s.endsWith("@lid")) return true;
  const digits = s.replace(/\D+/g, "");
  if (!digits) return false;
  if (digits.length >= 14 && !digits.startsWith("55")) return true;
  return false;
}
