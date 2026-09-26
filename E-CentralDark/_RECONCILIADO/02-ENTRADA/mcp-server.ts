// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { log } from "./log.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools-catalog.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // Conversão simples — o SDK oficial aceita JSON Schema cru.
  // Pra MVP, basta um objeto com properties extraídas do shape do Zod.
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodFieldToJson(value);
      if (!(value instanceof z.ZodOptional)) required.push(key);
    }
    return { type: "object", properties, ...(required.length ? { required } : {}) };
  }
  return { type: "object" };
}

function zodFieldToJson(s: z.ZodType): Record<string, unknown> {
  if (s instanceof z.ZodOptional) return zodFieldToJson(s._def.innerType);
  if (s instanceof z.ZodString) return { type: "string", description: s.description };
  if (s instanceof z.ZodNumber) return { type: "number", description: s.description };
  if (s instanceof z.ZodBoolean) return { type: "boolean", description: s.description };
  if (s instanceof z.ZodEnum) return { type: "string", enum: s.options, description: s.description };
  return { description: s.description };
}

function buildServer(token: string): Server {
  const server = new Server(
    { name: "mcp-centraldark", version: `0.4.0+${CATALOG_VERSION}` },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map((t) => {
      const annotations = (t as { annotations?: Record<string, unknown> }).annotations;
      return {
        name: t.name,
        description: t.description,
        inputSchema: zodToJsonSchema(t.inputSchema),
        ...(annotations ? { annotations } : {}),
      };
    }),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = ALL_TOOLS.find((t) => t.name === req.params.name);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: "text", text: `Tool desconhecida: ${req.params.name}` }],
      };
    }

    const parsed = tool.inputSchema.safeParse(req.params.arguments ?? {});
    if (!parsed.success) {
      return {
        isError: true,
        content: [
          { type: "text", text: `Argumentos inválidos: ${parsed.error.message}` },
        ],
      };
    }

    try {
      // O cast aqui é seguro porque cada tool define seu próprio shape.
      const raw = await (tool.handler as (i: unknown, c: { token: string }) => Promise<unknown>)(
        parsed.data,
        { token }
      );
      // Sanitização de SAÍDA: scrub IPs, OAuth client IDs, e-mails de bot,
      // env-vars de segredo e tokens longos antes de devolver ao cliente MCP.
      return sanitizeOutgoingDeep(raw) as Awaited<ReturnType<typeof tool.handler>>;
    } catch (err) {
      log.error("tool_execution_error", { tool: tool.name, error: String(err) });
      return {
        isError: true,
        content: [{ type: "text", text: `Erro ao executar ${tool.name}: ${String(err)}` }],
      };
    }
  });

  return server;
}

export async function handleMcpRequest(req: Request, res: Response, ghToken: string) {
  const server = buildServer(ghToken);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  log.info("mcp_request_handled", {});
}
