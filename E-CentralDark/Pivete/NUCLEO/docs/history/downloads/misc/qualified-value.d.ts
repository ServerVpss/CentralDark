export type McpClient = "claude" | "codex" | "cursor" | "openclaw" | "hermes" | "windsurf" | "grok" | "unknown";
type Payload = {
    outcome: "search_result" | "meeting_result" | "artifact_result" | "artifact_created";
    client: McpClient;
};
export declare function safeMcpClient(value: unknown): McpClient;
export declare function classifyMcpClientName(value: unknown): McpClient;
export declare function resolveMcpClient(configuredClient: unknown, protocolClientName: unknown): McpClient;
export declare function createMcpQualifiedValueReporter(send: (payload: Payload) => Promise<unknown>, client?: McpClient | (() => McpClient)): {
    searchResult: () => void;
    meetingResult: () => void;
    artifactResult: () => void;
    artifactCreated: () => void;
};
export {};
