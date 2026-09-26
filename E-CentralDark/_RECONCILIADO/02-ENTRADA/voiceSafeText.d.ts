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
export declare function voiceSafeText(text: string): string;
//# sourceMappingURL=voiceSafeText.d.ts.map