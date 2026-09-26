/**
 * Args de MCP do codex (espelha bootstrap ~6014): codex recebe o servidor MCP via
 * `-c mcp_servers.overclock.url=<toml>` em vez de arquivo. tomlString = JSON.stringify
 * (TOML basic string, escapa "/\). serverUrl = mcpHost.streamableHttpUrl('codex', ...).
 */
export declare function codexMcpArgs(serverUrl: string): string[];
/**
 * Escreve <cwd>/.gemini/settings.json (mcpServers.overclock=http + security.auth
 * herdado do global p/ não travar no "Waiting for authentication" + contextFileName
 * + ui.hideContextSummary + hooksConfig.enabled=false) e o overclock-context.md.
 * serverUrl = mcpHost.streamableHttpUrl('gemini', model, providerId).
 */
export declare function ensureGeminiMcpConfig(cwd: string, serverUrl: string): Promise<void>;
/**
 * Merge mcpServers.overclock={serverUrl,disabled:false,enabledTools} num mcp_config.json
 * do antigravity. Espelha bootstrap 1715 (config inválido → backup .invalid-, não throw).
 */
export declare function writeAntigravityMcpConfig(configPath: string, serverUrl: string, enabledTools: string[]): Promise<void>;
/**
 * Injeta o MCP do Overclock no antigravity: contextFileName no workspace + mcp_config.json
 * nos 4 paths candidatos do home (config/antigravity/antigravity-cli/antigravity-ide).
 * homeBase parametrizado p/ testabilidade (default homedir()). serverUrl =
 * mcpHost.streamableHttpUrl('antigravity', ...). Espelha bootstrap 1694.
 */
/**
 * Registra o servidor MCP do Overclock no Grok CLI via `grok mcp add --scope user`.
 * Idempotente: remove entrada anterior (se existir) antes de re-adicionar com a URL
 * atual (que embute callerPaneId). serverUrl = mcpHost.streamableHttpUrl('grok', ...).
 */
export declare function ensureGrokMcpConfig(serverUrl: string): Promise<void>;
export declare function ensureAntigravityMcpConfig(cwd: string, serverUrl: string, enabledTools: string[], homeBase?: string): Promise<void>;
//# sourceMappingURL=mcpCliInject.d.ts.map