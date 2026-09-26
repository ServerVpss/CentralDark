# COMANDO - friendly-error.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\friendly-error.ts
**SHA:** 02a1f9b0275379c4
**Timestamp:** 2026-08-26T19:33:44.720366
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const jsonStart = trimmed.indexOf("[");

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Transforma qualquer erro (Zod, Postgres, fetch, Error genérico) em uma
 * mensagem curtinha e amigável em PT-BR, pra mostrar no toast.
 * Sem JSON cru, sem nome técnico de coluna, sem stack trace.
 */

// Dicionário de campos: nome técnico → rótulo humano
const FIELD_LABELS: Record<string, string> = {
  super_admin_notify_connection_id: "WhatsApp de notificação do master",
  super_admin_phone_e164: "Telefone do master",
  meta_app_id: "Meta App ID",
  meta_app_secret: "Meta App Secret",
  meta_config_id: "Meta Config ID",
  baileys_server_url: "URL do servidor Baileys",
  baileys_server_token: "Token do servidor Baileys",
  baileys_webhook_secret: "Segredo do webhook Baileys",
  email: "E-mail",
  password: "Senha",
  name: "Nome",
  phone: "Telefone",
  phone_e164: "Telefone",
  display_name: "Nome de exibição",
  workspace_id: "Workspace",
  connection_id: "Conexão",
  body: "Mensagem",
  title: "Título",
  url: "Link",
  slug: "Identificador",
  domain: "Domínio",
};

function labelOf(path: (string | number)[]): string {
  const key = String(path[path.length - 1] ?? "");
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ");
}

function zodCodeToText(code: string, message: string): string {
  switch (code) {
    case "invalid_string":
      if (/uuid/i.test(message)) return "precisa ser selecionado";
      if (/email/i.test(message)) return "não é um e-mail válido";
      if (/url/i.test(message)) return "não é um link válido";
      return "está em formato inválido";
    case "too_small":
      return "está muito curto";
    case "too_big":
      return "está muito longo";
    case "invalid_type":
      return "está faltando ou em tipo errado";
    case "invalid_enum_value":
      return "tem um valor não aceito";
    default:
      return "está inválido";
  }
}

/** Detecta o JSON de erros do Zod e devolve algo legível. */
function parseZodErrors(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("ZodError")) return null;
  const jsonStart = trimmed.indexOf("[");
  if (jsonStart < 0) return null;
  try {
    const arr = JSON.parse(trimmed.slice(jsonStart)) as Array<{
      path?: (string | number)[];
      message?: string;
      code?: string;
    }>;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const issues = arr.slice(0, 3).map((i) => {
      const field = labelOf(i.path ?? []);
      const what = zodCodeToText(i.code ?? "", i.message ?? "");
      return `${field} ${what}`;
    });
    const extra = arr.length > 3 ? ` (+${arr.length - 3} outros)` : "";
    return `Confira os campos: ${issues.join("; ")}${extra}.`;
  } catch {
    return null;
  }
}

/** Erros vindos do Postgres / Supabase. */
function parsePgError(raw: string): string | null {
  const s = raw.toLowerCase();
  if (s.includes("duplicate key") || s.includes("unique constraint"))
    return "Esse registro já existe. Use um valor diferente.";
  if (s.includes("violates foreign key"))
    return "Referência inválida — o item ligado a esse registro não existe mais.";
  if (s.includes("violates not-null"))
    return "Falta preencher um campo obrigatório.";
  if (s.includes("permission denied") || s.includes("row-level security"))
    return "Você não tem permissão pra fazer essa ação.";
  if (s.includes("connection") && s.includes("refused"))
    return "Não conseguimos falar com o servidor agora. Tente em alguns segundos.";
  return null;
}

/** Pega um Error / string qualquer e devolve mensagem amigável curta. */
export function friendlyError(err: unknown, fallback = "Algo deu errado. Tente de novo."): string {
  if (!err) return fallback;
  const raw = err instanceof Error ? err.message : String(err);
  if (!raw || raw === "{}" || raw === "undefined") return fallback;

  return (
    parseZodErrors(raw) ??
    parsePgError(raw) ??
    // se já é curto e em PT-BR, devolve direto
    (raw.length < 160 && /[áéíóúãõçà]|\b(erro|falha|inválid|obrigatóri)/i.test(raw)
      ? raw
      : fallback)
  );
}

```