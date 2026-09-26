export interface AgentSpecPatch {
    /** undefined = leave frontmatter untouched; null = delete. */
    tools?: string[] | null;
    /** undefined = leave frontmatter untouched; null = delete. */
    allowedSkills?: string[] | null;
    systemPrompt: string | null;
    /** Squad task/role written top-level (`category:`) — read by the agent parser. */
    category?: string | null;
    /** Per-CLI LLM written top-level (`model:`) in this CLI's agent file. */
    model?: string | null;
    /** Per-CLI reasoning effort written top-level (`effort:`) — read by the agent parser. */
    effort?: string | null;
}
export declare function writeAgentSpec(filePath: string, patch: AgentSpecPatch): Promise<void>;
//# sourceMappingURL=agentSpecWriter.d.ts.map