import { MCPHealth, MCPTool } from '../types/mcp';
import { hubAuth } from '../integrations/supabase/hub-client';

export interface SourceDeltaResult {
  source_id: string;
  kind: 'mcp-tools' | 'github-release';
  status: 'NO_CHANGE' | 'DELTA_FOUND' | 'REJECTED' | 'ERROR';
  changed_fields: string[];
  absorbed: number;
  dropped_duplicate: number;
  rejected: number;
  pending_refinery: number;
  detail?: Record<string, unknown>;
  error?: Record<string, unknown>;
}

// Esta interface é usada por SyncButton.tsx
export interface SyncResult {
  status: string;
  success: boolean;
  tools_found: number;
  tools_added: number;
  tools_updated: number;
  sources_scanned: number;
  delta_found: number;
  absorbed: number;
  dropped_duplicate: number;
  rejected: number;
  pending_refinery: number;
  no_change: boolean;
  sources: SourceDeltaResult[];
  errors?: Record<string, unknown>[];
}

const MCP_API_URL = 'https://mcp.centralldark.com';
const MCP_WS_URL = 'wss://mcp.centralldark.com/ws';

export const mcpClient = {
  async getHealth(): Promise<MCPHealth> {
    const res = await fetch(`${MCP_API_URL}/health`);
    if (!res.ok) throw new Error('MCP Health check failed');
    return res.json();
  },

  async getTools(): Promise<MCPTool[]> {
    const res = await fetch(`${MCP_API_URL}/tools.json`);
    if (!res.ok) throw new Error('Failed to fetch tools from MCP');
    return res.json();
  },

  // SOURCE_DELTA: o botão do HUB chama o owner real `catalog-sync`.
  // Não inventa uma rota de sincronização paralela no MCP canônico.
  async syncCatalog(): Promise<SyncResult> {
    const { data, error } = await hubAuth.functions.invoke('catalog-sync', {
      method: 'POST',
      body: { trigger: 'hub-admin-button' },
    });
    if (error) throw new Error(`SOURCE_DELTA_FAILED: ${error.message}`);
    if (!data || data.success !== true) {
      const safeError = data?.error?.SAFE_ERROR || data?.errors?.[0]?.SAFE_ERROR || 'SOURCE_DELTA returned failure';
      throw new Error(String(safeError));
    }
    return data as SyncResult;
  },

  getWsUrl(): string {
    return MCP_WS_URL;
  },
};
