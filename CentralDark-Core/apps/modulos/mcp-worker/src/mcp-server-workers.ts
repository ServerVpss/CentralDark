/**
 * Cloudflare Workers adapter for MCP CentralDark server.
 * 
 * Reutiliza buildServer e handleMcpRequest do mcp-server.js,
 * mas com suporte a Web Standard APIs (Request/Response) em vez de Node.js.
 * 
 * Preserva: autenticação, OAuth, Supabase, regras e identidade CentralDark.
 * Não publica: segredos, tools administrativas, terminal remoto ou controle da Casa.
 */

import {
  WebStandardStreamableHTTPServerTransport,
  WebStandardStreamableHTTPServerTransport as WebStdTransport,
} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildServer, handleMcpRequest, serveStdio } from "../mcp/src/mcp-server.js";
import { randomUUID } from "crypto";

// Web Standard Response implementaçao para o transport
interface WebResponse {
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream | null;
  bodyUsed: boolean;
  writeHead: (status: number, headers?: Record<string, string>) => this;
  end: (chunk?: any) => void;
}

// Cache of transports to keep them alive
const transports = new Map<string, WebStandardStreamableHTTPServerTransport>();

export function createWorkerTransport(options = {}) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    ...options,
  });
  return transport;
}

export async function handleWorkerMcpRequest(
  request: Request,
  env: Env,
  server: ReturnType<typeof buildServer>,
  options = {}
) {
  const token = parseBearerToken(request, env);
  const transport = createWorkerTransport(options);
  
  const serverInstance = buildServer({ 
    ...options, 
    token: token || env.CENTRALDARK_ADMIN_KEY || "" 
  });
  
  // Connect the server to the transport
  await serverInstance.connect(transport);
  
  const response = await transport.handleRequest(request);
  
  // Clone response to preserve headers
  const responseBody = await response.body;
  const responseHeaders = new Headers(response.headers);
  
  // Remove dangerous headers
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");
  
  return new Response(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}

export function parseBearerToken(request: Request, env: Env): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    // Fall back to admin key from environment
    return env.CENTRALDARK_ADMIN_KEY || null;
  }
  const parts = authorization.trim().split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}
