# COMANDO - codemode.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\cloudflare\skills\agents-sdk\references\codemode.md
**SHA:** 8c97dba1eea39ff8
**Timestamp:** 2026-08-26T18:31:13.990574
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: async ({ location }) => `Weather: ${location} 72°F`
- execute: async ({ to, subject, body }) => `Email sent to ${to}`
- prompt: "You are a helpful assistant...",

### Ouro Bruto (primeiros 5000 chars)
```
# Code Mode (Experimental)

Code Mode generates executable JavaScript instead of making individual tool calls. This significantly reduces token usage and enables complex multi-tool workflows.

## Why Code Mode?

Traditional tool calling:
- One tool call per LLM request
- Multiple round-trips for chained operations
- High token usage for complex workflows

Code Mode:
- LLM generates code that orchestrates multiple tools
- Single execution for complex workflows
- Self-debugging and error recovery
- Ideal for MCP server orchestration

## Setup

### 1. Wrangler Config

```jsonc
{
  "name": "my-agent-worker",
  "compatibility_flags": ["experimental", "enable_ctx_exports"],
  "durable_objects": {
    // "class_name" must match your Agent class name exactly
    "bindings": [{ "name": "MyAgent", "class_name": "MyAgent" }]
  },
  "migrations": [
    // Required: list all Agent classes for SQLite storage
    { "tag": "v1", "new_sqlite_classes": ["MyAgent"] }
  ],
  "services": [
    {
      "binding": "globalOutbound",
      // "service" must match "name" above
      "service": "my-agent-worker",
      "entrypoint": "globalOutbound"
    },
    {
      "binding": "CodeModeProxy",
      "service": "my-agent-worker",
      "entrypoint": "CodeModeProxy"
    }
  ],
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

### 2. Export Required Classes

```typescript
// Export the proxy for tool execution (required for codemode)
export { CodeModeProxy } from "@cloudflare/codemode/ai";

// Define outbound fetch handler for security filtering
export const globalOutbound = {
  fetch: async (input: string | URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(
      typeof input === "string"
        ? input
        : typeof input === "object" && "url" in input
          ? input.url
          : input.toString()
    );
    // Block certain domains if needed
    if (url.hostname === "blocked.example.com") {
      return new Response("Not allowed", { status: 403 });
    }
    return fetch(input, init);
  }
};
```

### 3. Install Dependencies

```bash
npm install @cloudflare/codemode ai @ai-sdk/openai zod
```

### 4. Use Code Mode in Agent

```typescript
import { Agent } from "agents";
import { experimental_codemode as codemode } from "@cloudflare/codemode/ai";
import { streamText, tool, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "cloudflare:workers";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get weather for a location",
    parameters: z.object({ location: z.string() }),
    execute: async ({ location }) => `Weather: ${location} 72°F`
  }),
  sendEmail: tool({
    description: "Send an email",
    parameters: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
    execute: async ({ to, subject, body }) => `Email sent to ${to}`
  })
};

export class MyAgent extends Agent<Env, State> {
  tools = {};

  // Method called by codemode proxy
  callTool(functionName: string, args: unknown[]) {
    return this.tools[functionName]?.execute?.(args, {
      abortSignal: new AbortController().signal,
      toolCallId: "codemode",
      messages: []
    });
  }

  async onChatMessage() {
    this.tools = { ...tools, ...this.mcp.getAITools() };

    const { prompt, tools: wrappedTools } = await codemode({
      prompt: "You are a helpful assistant...",
      tools: this.tools,
      globalOutbound: env.globalOutbound,
      loader: env.LOADER,
      proxy: this.ctx.exports.CodeModeProxy({
        props: {
          binding: "MyAgent",  // Class name
          name: this.name,     // Instance name
          callback: "callTool" // Method to call
        }
      })
    });

    const result = streamText({
      system: prompt,
      model: openai("gpt-4o"),
      messages: await convertToModelMessages(this.state.messages),
      tools: wrappedTools  // Use wrapped tools, not original
    });

    // ... handle stream
  }
}
```

## Generated Code Example

When user asks "Check the weather in NYC and email me the forecast", codemode generates:

```javascript
async function executeTask() {
  const weather = await codemode.getWeather({ location: "NYC" });

  await codemode.sendEmail({
    to: "user@example.com",
    subject: "NYC Weather Forecast",
    body: `Current weather: ${weather}`
  });

  return { success: true, weather };
}
```

## MCP Server Orchestration

Code Mode excels at orchestrating multiple MCP servers:

```javascript
async function executeTask() {
  // Query file system MCP
  const files = await codemode.listFiles({ path: "/projects" });

  // Query database MCP
  const status = await codemode.queryDatabase({
    query: "SELECT * FROM projects WHERE name = ?",
    params: [files[0].name]
  });

  // Conditional logic based on results
  if (status.length === 0) {
    await codemode.createTask({
      title: `Review: ${files[0].name}`,
      priority: "high"
    });
  }

  return { files, status };
}
```

## When to
```