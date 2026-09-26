/**
 * jarvisLivePrompt — system instruction for the Gemini Live voice session (F-056).
 *
 * Ported from _refs/overclock-jarvis/packages/shell/src/main/jarvisLivePrompt.ts.
 * Distinct from buildJarvisSystemPrompt() (core): this is the LIVE (audio in/out)
 * layer, which only exposes 4 coarse voice tools (delegar/consultar/ler/navegar) —
 * real tool execution (squad_open, pane_spawn, ...) happens in the Agent SDK brain
 * that 'delegar' hands off to via JarvisService.send().
 */
/** C-070: personalização do usuário injetada no system prompt da Live. */
export interface LivePersona {
    userName?: string;
    customPrompt?: string;
    assistantName?: string;
}
export declare function getLivePrompt(workspace: string, persona?: LivePersona): string;
//# sourceMappingURL=jarvisLivePrompt.d.ts.map