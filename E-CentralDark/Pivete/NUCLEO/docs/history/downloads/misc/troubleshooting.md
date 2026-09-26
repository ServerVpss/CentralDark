# Agent Troubleshooting

Common issues and solutions for Cloudflare Agents.

## Connection Issues

### "WebSocket connection failed"

**Symptoms:** Client cannot connect to agent.

**Causes & Solutions:**

1. **Worker not deployed**
   ```bash
   wrangler deployments list
   wrangler deploy  # If not deployed
   ```

2. **Wrong URL path**
   ```javascript
   // Ensure your routing handles the agent path
   // Client:
   new WebSocket("wss://my-worker.workers.dev/agent/user123");

   // Worker must route to agent:
   if (url.pathname.startsWith("/agent/")) {
     const id = url.pathname.split("/")[2];
     return env.AGENT.get(env.AGENT.idFromName(id)).fetch(request);
   }
   ```

3. **CORS issues (browser clients)**
   Agents handle WebSocket upgrades automatically, but ensure your entry worker doesn't block the request.

### "Connection closed unexpectedly"

1. **Agent threw an error**
   ```bash
   wrangler tail  # Check for exceptions
   ```

2. **Message handler crashed**
   ```typescript
   async onMessage(connection: Connection, message: string) {
     try {
       // Your logic
     } catch (error) {
       console.error("Message handling error:", error);
       connection.send(JSON.stringify({ type: "error", message: error.message }));
     }
   }
   ```

3. **Hibernation woke agent with stale connection**
   Ensure you handle reconnection gracefully in client code.

## State Issues

### "State not persisting"

**Causes:**

1. **Didn't call `setState()`**
   ```typescript
   // Wrong - direct mutation doesn't persist
   this.state.messages.push(newMessage);

   // Correct - use setState
   this.setState({
     ...this.state,
     messages: [...this.state.messages, newMessage],
   });
   ```

2. **Agent crashed before state saved**
   `setState()` is durable, but if agent crashes during processing before `setState()`, changes are lost.

3. **Wrong agent instance**
   Each unique ID gets a separate agent. Ensure clients connect to the same ID.

### "State out of sync between clients"

`setState()` automatically syncs to all connected clients via `onStateUpdate()`. If sync isn't working:

1. **Check `onStateUpdate` is implemented**
   ```typescript
   onStateUpdate(state: State, source: string) {
     // This fires when state changes from any source
     console.log("State updated:", state, "from:", source);
   }
   ```

2. **Client not listening for state updates**
   ```typescript
   // React hook handles this automatically
   const { state } = useAgent({ agent: "my-agent", name: id });

   // Manual WebSocket - listen for state messages
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.type === "state_update") {
       updateLocalState(data.state);
     }
   };
   ```

### "State too large" / Performance issues

State is serialized as JSON. Keep it small:

```typescript
// Bad - storing everything in state
interface State {
  allMessages: Message[];  // Could be thousands
  allDocuments: Document[];
}

// Good - state for hot data, SQL for cold
interface State {
  recentMessages: Message[];  // Last 50 only
  currentDocument: Document | null;
}

// Store full history in SQL
await this.sql`INSERT INTO messages ...`;
```

## SQL Issues

### "no such table"

Table not created. Create in `onStart()`:

```typescript
async onStart() {
  await this.sql`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
```

### "SQL logic error"

Check your query syntax. Use tagged templates correctly:

```typescript
// Wrong - string interpolation (SQL injection risk!)
await this.sql`SELECT * FROM users WHERE id = '${userId}'`;

// Correct - parameterized query
await this.sql`SELECT * FROM users WHERE id = ${userId}`;
```

### SQL query returns empty

1. **Wrong table name**
2. **Data in different agent instance** (each agent ID has isolated storage)
3. **Query conditions don't match**

Debug:
```typescript
const tables = await this.sql`
  SELECT name FROM sqlite_master WHERE type='table'
`;
console.log("Tables:", tables);

const count = await this.sql`SELECT COUNT(*) as count FROM messages`;
console.log("Message count:", count);
```

## Scheduled Task Issues

### "Task never fires"

1. **Method name mismatch**
   ```typescript
   // Schedule references method that must exist
   await this.schedule(60, "sendReminder", { ... });

   // Method must be defined on the class
   async sendReminder(data: any) {
     // This method MUST exist
   }
   ```

2. **Cron syntax error**
   ```typescript
   // Invalid cron
   await this.schedule("every 5 minutes", "task", {});  // Wrong

   // Valid cron
   await this.schedule("*/5 * * * *", "task", {});  // Every 5 minutes
   ```

3. **Task was cancelled**
   ```typescript
   const schedules = await this.getSchedules();
   console.log("Active schedules:", schedules);
   ```

### "Task fires multiple times"

If you schedule in `onStart()` without checking:

```typescript
async onStart() {
  // Bad - schedules new task every time agent wakes
  await this.schedule("0 9 * * *", "dailyTask", {});

  // Good - check first
  const schedules = await this.getSchedules();
  const hasDaily = schedules.some(s => s.callback === "dailyTask");
  if (!hasDaily) {
    await this.schedule("0 9 * * *", "dailyTask", {});
  }
}
```

## Deployment Issues

### "Class MyAgent is not exported"

```typescript
// src/index.ts - Must export the class
export { MyAgent } from "./agent";

// Or if defined in same file
export class MyAgent extends Agent { ... }
```

### "Durable Object not found"

Check `wrangler.toml`:

```toml
[durable_objects]
bindings = [{ name = "AGENT", class_name = "MyAgent" }]

[[migrations]]
tag = "v1"
new_classes = ["MyAgent"]
```

### "Migration required"

When adding new Durable Object classes:

```toml
[[migrations]]
tag = "v2"  # Increment from previous
new_classes = ["NewAgentClass"]

# Or for renames
# renamed_classes = [{ from = "OldName", to = "NewName" }]
```

## AI Integration Issues

### "AI binding not found"

Add to `wrangler.toml`:

```toml
[ai]
binding = "AI"
```

### "Model not found" / "Rate limited"

```typescript
// Check model name is correct
const response = await this.env.AI.run(
  "@cf/meta/llama-3-8b-instruct",  // Exact model name
  { messages: [...] }
);

// Handle rate limits
try {
  const response = await this.env.AI.run(...);
} catch (error) {
  if (error.message.includes("rate limit")) {
    // Retry with backoff or use queue
  }
}
```

### "Streaming not working"

```typescript
// Enable streaming
const stream = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
  messages: [...],
  stream: true,  // Must be true
});

// Iterate over stream
for await (const chunk of stream) {
  connection.send(JSON.stringify({ type: "chunk", content: chunk.response }));
}
```

## Debugging Tips

### Enable Verbose Logging

```typescript
export class MyAgent extends Agent<Env, State> {
  async onStart() {
    console.log("Agent starting, state:", JSON.stringify(this.state));
  }

  async onConnect(connection: Connection) {
    console.log("Client connected:", connection.id);
  }

  async onMessage(connection: Connection, message: string) {
    console.log("Received message:", message);
    // ... handle
    console.log("State after:", JSON.stringify(this.state));
  }

  async onClose(connection: Connection) {
    console.log("Client disconnected:", connection.id);
  }
}
```

View logs:
```bash
wrangler tail --format pretty
```

### Test Locally First

```bash
npm start
# Connect with test client or use browser console:
# new WebSocket("ws://localhost:8787/agent/test")
```

### Inspect State

Add a debug endpoint:

```typescript
async onRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/debug") {
    return Response.json({
      state: this.state,
      schedules: await this.getSchedules(),
    });
  }

  return new Response("Not found", { status: 404 });
}
```


---

# OUTRO - troubleshooting.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-workflows\references\troubleshooting.md
**SHA:** acd0b028c533f7ac
**Timestamp:** 2026-08-26T18:42:42.624136
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Fix:** Check that `RENDER_SDK_SOCKET_PATH` points to a valid, writable path. Use the Render CLI for local dev. Set `RENDER_SDK_AUTO_START=false` to disable auto-start and start manually if needed.

### Ouro Bruto (primeiros 5000 chars)
```
# Troubleshooting

Common issues and fixes when developing with Render Workflows, sourced from the SDK source code and official docs.

## Contents

- Task server issues
- Task registration issues
- Task execution issues
- Client issues
- Connection and networking
- Local development gotchas
- Limits reference

## Task Server Issues

### Task server won't start

**Symptom:** `render workflows dev` fails or hangs.

| Cause | Fix |
|-------|-----|
| CLI version < 2.11.0 | Run `render --version` to check. Upgrade: `brew upgrade render` (macOS) or reinstall via the install script. |
| Wrong start command | Python: `render workflows dev -- python workflows/main.py`. TypeScript: `render workflows dev -- npx tsx workflows/main.ts`. |
| Missing `app.start()` (Python) | Add `if __name__ == "__main__": app.start()` at the bottom of your entry point. |
| Port already in use | Use `--port` flag: `render workflows dev --port 8121 -- ...` |

### `app.start()` fails with `ValueError` (Python)

**Symptom:** `ValueError` about missing `RENDER_SDK_MODE` or `RENDER_SDK_SOCKET_PATH`.

**Cause:** `app.start()` expects env vars that the Render CLI sets automatically. Running `python main.py` directly (without the CLI) triggers this.

**Fix:** Always start via the CLI: `render workflows dev -- python workflows/main.py`. The CLI sets the required env vars.

### Auto-start crashes with `process.exit(1)` (TypeScript)

**Symptom:** Process exits immediately with no useful error message.

**Cause:** The SDK auto-starts the task server via `setImmediate` when `RENDER_SDK_SOCKET_PATH` is set. If `startTaskServer()` throws, the SDK calls `process.exit(1)` with only a `console.error`.

**Fix:** Check that `RENDER_SDK_SOCKET_PATH` points to a valid, writable path. Use the Render CLI for local dev. Set `RENDER_SDK_AUTO_START=false` to disable auto-start and start manually if needed.

## Task Registration Issues

### "Task not found" in CLI

**Symptom:** `render workflows tasks list --local` shows no tasks or is missing expected tasks.

| Cause | Fix |
|-------|-----|
| Module not imported (Python) | Ensure your entry point imports all task files or uses `Workflows.from_workflows()`. |
| Module not imported (TypeScript) | Add `import './your-task-file'` to your `index.ts` entry point. |
| Server not running | Start the local task server first, then run `list --local` in a second terminal. |
| Missing `--local` flag | Without `--local`, the CLI lists deployed (remote) tasks, not local ones. |

### Late registration after auto-start (TypeScript)

**Symptom:** Dynamically imported tasks are not available for execution; a warning appears in logs.

**Cause:** The SDK auto-starts via `setImmediate` after synchronous module loading. Tasks registered after that (e.g., via dynamic `import()`) miss the registration window.

**Fix:** Define all tasks at module scope using synchronous `import './module'` statements. Avoid dynamic imports for task files.

### Duplicate task names

**Symptom:** Python raises `ValueError("Task '{name}' already registered")`. TypeScript silently overwrites the previous task.

**Cause:** Two tasks registered with the same `name`.

**Fix:** Use unique names for every task. When using `Workflows.from_workflows()` in Python, a `ValueError` is raised if any imported apps share a task name.

### Empty task name (TypeScript)

**Symptom:** `Error: Task function must have a name or name must be provided`.

**Fix:** Always pass `name` in the options object: `task({ name: "myTask" }, function myTask() { ... })`.

## Task Execution Issues

### Subtask hangs forever

**Symptom:** A task that calls other tasks never completes.

| Cause | Fix |
|-------|-----|
| Missing `await` | Subtask calls return a `TaskInstance` (Python) or `Promise` (TypeScript), not the result. You must `await` them. |
| Missing `async` keyword | Python: chaining tasks must be declared `async def`. TypeScript: must use `async function`. |
| Sequential instead of parallel | If you `await` each subtask individually, they run serially. Use `asyncio.gather()` (Python) or `Promise.all()` (TypeScript) for parallel execution. |

### Calling subtask outside a task context (Python)

**Symptom:** `RuntimeError` about running a subtask outside task execution context.

**Cause:** Task functions that are decorated with `@app.task` can only trigger subtask runs when called from within another executing task. Calling them from regular code (e.g., a script or REPL) fails because the internal `_current_client` context is not set.

**Fix:** To trigger tasks from outside a task, use the SDK client (`Render()` or `RenderAsync()`) with `start_task()` or `run_task()`. Subtask syntax is only for task-to-task chaining.

### Mixed positional and keyword arguments (Python)

**Symptom:** `ValueError` about not mixing positional and keyword arguments.

**Cause:** The Python SDK does not allow calling a subtask with both `*args` and `**kwargs` simultaneously.

**Fix:** Use either positional arg
```