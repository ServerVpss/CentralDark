/**
 * voiceSafeText — defesa em profundidade da camada de voz (C-062).
 *
 * TODO texto injetado na sessão de voz (Gemini Live via injectContext — narração
 * de resultado, tela do usuário) passa por aqui ANTES de virar contexto falável.
 * A voz NUNCA deve soletrar sintaxe: blocos de código, inline code, chamadas
 * `mcp__*`, JSON. Mesmo que uma mensagem técnica vaze (ex. wake de handoff com
 * `Mais detalhes: mcp__overclock__handoff_list({ids:["h-5t"]})` visível na tela),
 * o que chega ao TTS é só a parte humana.
 *
 * Módulo puro (string → string) pra ser unit-testável sem sidecar vivo.
 */
/** Chamada de tool MCP com args — tolera 1 nível de parênteses/chaves aninhados. */
const MCP_CALL_RE = /\bmcp__[\w.-]+\s*\((?:[^()]|\([^()]*\))*\)/g;
/** Nome de tool MCP solto (sem args). */
const MCP_NAME_RE = /\bmcp__[\w.-]+\b/g;
/** Objeto JSON "de payload": tem cara de {"key": ...} ou {key: ...}. */
const JSON_BLOB_RE = /\{[^{}]*(?:"[^"]*"|\w+)\s*:[^{}]*\}/g;
/** Inline code cujo conteúdo é sintaxe (não uma palavra narrável tipo `main`). */
const CODE_CHARS_RE = /[{}()[\];=\\|<>$]|::|__|\bmcp\b/;
export function voiceSafeText(text) {
    let out = text;
    // Blocos cercados somem inteiros — nunca são narráveis.
    out = out.replace(/```[\s\S]*?```/g, ' ');
    // Chamadas mcp__ (com e sem args).
    out = out.replace(MCP_CALL_RE, ' ');
    out = out.replace(MCP_NAME_RE, ' ');
    // Ponteiro do wake message que ficou órfão depois do strip da chamada
    // ("Mais detalhes:" sem nada narrável na frente).
    out = out.replace(/\b(?:Mais detalhes|Responda via):?\s*(?![\wÀ-ú"'`])/g, ' ');
    // JSON de payload — algumas passadas pra desmontar aninhamento raso.
    for (let i = 0; i < 3; i += 1) {
        const next = out.replace(JSON_BLOB_RE, ' ');
        if (next === out)
            break;
        out = next;
    }
    // Inline code: mantém palavra simples (`main` → main), remove sintaxe.
    out = out.replace(/`([^`\n]*)`/g, (_m, inner) => CODE_CHARS_RE.test(inner) ? ' ' : inner);
    return out.replace(/\s+/g, ' ').trim();
}
//# sourceMappingURL=voiceSafeText.js.map