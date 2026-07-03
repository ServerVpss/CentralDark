import { MCPHealth, MCPTool } from '../types/mcp';

// Esta interface é usada por SyncButton.tsx
export interface SyncResult {
  status: string;
  tools_found: number;
  tools_added: number;
  tools_updated: number;
  errors?: string[];
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
    // CORREÇÃO: Apontar para o endpoint .json
    const res = await fetch(`${MCP_API_URL}/tools.json`);
    if (!res.ok) throw new Error('Failed to fetch tools from MCP');
    return res.json();
  },

  // FIX: Restaurar método syncCatalog que causou o erro de build
  async syncCatalog(): Promise<SyncResult> {
    const res = await fetch(`${MCP_API_URL}/tools/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync catalog with MCP');
    return res.json();
  },

  // FIX: Restaurar getter da URL do WebSocket
  getWsUrl(): string {
    return MCP_WS_URL;
  },
};
