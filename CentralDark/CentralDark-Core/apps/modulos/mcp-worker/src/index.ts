/**
 * Cloudflare Workers entrypoint para o servidor MCP CentralDark.
 *
 * Reutiliza o servidor MCP existente (apps/modulos/mcp/src/mcp-server.js),
 * adaptando para o runtime Cloudflare Workers via WebStandardStreamableHTTPServerTransport.
 *
 * Preserva: autenticação, OAuth, Supabase, regras e identidade CentralDark.
 * Não publica: segredos, tools administrativas, terminal remoto ou controle da Casa.
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildServer } from "../../mcp/src/mcp-server.js";

// Configuração do Workers
interface Env {
  CENTRALDARK_MCP_REMOTE_TOKEN: string;
  CENTRALDARK_ADMIN_KEY: string;
  MCP_SESSION_SECRET: string;
}

// Cookie name for MCP session
const SESSION_COOKIE = "mcp_session_id";

// Parse Authorization header for Bearer token
function parseBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return null;
  const parts = authorization.trim().split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

// Cloudflare Workers fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "CentralDark MCP",
          api: "/mcp",
          ui: "https://admin.centralldark.com/sala-controle",
          platform: "cloudflare-workers",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // MCP streamable HTTP endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
      // Require authentication: no Bearer token = 401
      const token = parseBearerToken(request);
      if (!token) {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: "Unauthorized: missing Bearer token",
            },
            id: null,
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "WWW-Authenticate": "Bearer",
            },
          }
        );
      }

      // Build server with the token (authorization)
      const server = buildServer({
        token,
        label: "centraldark-mcp-workers",
        clientLabel: "cloudflare-workers",
        // Only authorized reading tools by default
        admin: false,
        oauthScope: "mcp",
      });

        // Create Web Standard transport (Cloudflare Workers compatible)
        const transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });

        // Connect the server to the transport
        await server.connect(transport);

        // Handle the request and get the response
        const response = await transport.handleRequest(request);

        // Clone response to preserve headers and body
        const responseBody = await response.body;
        const responseHeaders = new Headers(response.headers);

        // Remove dangerous headers
        responseHeaders.delete("transfer-encoding");
        responseHeaders.delete("connection");

        return new Response(responseBody, {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (error) {
        console.error("[CENTRALDARK-MCP] Cloudflare Workers error:", error);
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Internal server error",
            },
            id: null,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // CORS preflight
    if (url.pathname === "/mcp" && request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Authorization,Content-Type,Accept,MCP-Protocol-Version,Mcp-Session-Id",
          "Access-Control-Expose-Headers": "Mcp-Session-Id",
        },
      });
    }

    // Health check
    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "CentralDark MCP",
          api: "/mcp",
          ui: "https://admin.centralldark.com/sala-controle",
          platform: "cloudflare-workers",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
