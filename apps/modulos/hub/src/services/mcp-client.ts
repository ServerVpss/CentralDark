import { MCPHealth, MCPTool } from '../types/mcp';

const MCP_API_URL = 'https://mcp.centralldark.com';
const MCP_WS_URL = 'wss://mcp.centralldark.com/ws';

export const mcpClient = {
  async getHealth(): Promise<MCPHealth> {
    const res = await fetch(`${MCP_API_URL}/health`);
    if (!res.ok) throw new Error('MCP Health check failed');
    return res.json();
  },

  async getTools(): Promise<MCPTool[]> {
    const res = await fetch(`${MCP_API_URL}/tools`);
    if (!res.ok) throw new Error('Failed to fetch tools');
    return res.json();
  },

  subscribeToHealth(callback: (health: MCPHealth) => void) {
    const ws = new WebSocket(MCP_WS_URL);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'health_update') {
          callback(data.payload);
        }
      } catch (err) {
        console.error('WS Message error:', err);
      }
    };

    return () => ws.close();
  },

  async syncTools(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${MCP_API_URL}/sync`, { method: 'POST' });
    return res.json();
  },

  // usado pelo SyncButton do catálogo — mesma rota /sync, formato de resultado detalhado
  async syncCatalog(): Promise<{ status: string; tools_found: number; tools_added: number; tools_updated: number; errors?: string[] }> {
    const res = await fetch(`${MCP_API_URL}/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha na sincronização do catálogo');
    return res.json();
  }
};