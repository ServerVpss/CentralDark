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