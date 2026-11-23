export interface McpTool {
  id: string;
  name: string;
  description: string;
  input_schema: any;
  server_id: string;
  is_enabled: boolean;
  health_status: 'healthy' | 'unstable' | 'down';
  last_sync: string;
}

export interface McpServer {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline';
  version: string;
  capabilities: string[];
}

export interface SyncResult {
  status: 'success' | 'error';
  tools_added: number;
  tools_updated: number;
  errors: string[];
}
// Aliases usados pelo mcp-client (compat com nomes MCP*)
export type MCPTool = McpTool;

export interface MCPHealth {
  status: string;
  uptime?: number;
  version?: string;
  [k: string]: unknown;
}
