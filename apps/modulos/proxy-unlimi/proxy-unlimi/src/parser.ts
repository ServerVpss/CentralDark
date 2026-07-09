/**
 * Stateful streaming parser that converts the upstream token stream into a
 * sequence of OpenAI-shaped events.
 *
 * Upstream emits tool calls inline within `delta` frames using this format:
 *
 *    <tool_call name="read" tool_call_id="tc_2f3c4d5e6a7b8c9d">
 *    {"filePath": "/home/pedro/Documentos/YouTube/unlimitedAI"}
 *    </tool_call>
 *
 * Key points the parser depends on:
 *   - The open tag carries `name="..."` and `tool_call_id="..."` attributes.
 *   - The body between the tags is JUST the arguments JSON (no outer
 *     {"name":...,"arguments":...} wrapper).
 *   - Tags may be split across many small `delta` chunks, so the parser must
 *     buffer and resync on the `<tool_call ...>` / `</tool_call>` markers.
 *
 * Events emitted:
 *   - { type: "text",      delta }                 -> assistant content delta
 *   - { type: "tool_start", index, id, name }      -> a tool call begins
 *   - { type: "tool_arguments_delta", index, delta } -> arguments JSON delta
 *   - { type: "tool_end",   index }                -> a tool call finished
 *   - { type: "reasoning",  delta }                -> reasoning block (if any)
 *   - { type: "finish",     reason }               -> stream finished
 */
export type ParserEvent =
  | { type: "text"; delta: string }
  | { type: "reasoning"; delta: string }
  | { type: "tool_start"; index: number; id: string; name: string }
  | { type: "tool_arguments_delta"; index: number; delta: string }
  | { type: "tool_end"; index: number }
  | { type: "finish"; reason: string }
  | { type: "done" };

// Built via concatenation so the literal closing tag never appears as a raw
// sequence in this file (avoids confusion with tool-call markup in tooling).
const OPEN_TAG = "<tool" + "_call";
const CLOSE_TAG = "</tool" + "_call>";

interface PendingTool {
  index: number;
  /** tool_call_id from the open-tag attribute (or generated if absent) */
  id: string;
  /** function name from the open-tag attribute (or "" until resolved) */
  name: string;
  /** finalized arguments string (set at tool_end) */
  argumentsBuf: string;
  /** whether the open-tag attributes have been fully parsed */
  headerParsed: boolean;
  /** true once the open tag's `>` has been seen (body streaming begins) */
  bodyStarted: boolean;
  /** raw body accumulated so far (for final JSON reconstruction) */
  rawBody: string;
  /** how many body chars we've already emitted as argument deltas */
  bodyEmitted: number;
  done: boolean;
}

export class ToolCallStreamParser {
  private buffer = "";
  private mode: "text" | "tool" = "text";
  private toolIndex = -1;
  private currentTool: PendingTool | null = null;
  private tools: PendingTool[] = [];
  private finished = false;

  /** Feed a delta string; returns the events produced by this chunk. */
  feedDelta(delta: string): ParserEvent[] {
    if (this.finished) return [];
    this.buffer += delta;
    return this.drain();
  }

  /** Feed a reasoning delta (passed through separately). */
  feedReasoning(delta: string): ParserEvent[] {
    return [{ type: "reasoning", delta }];
  }

  /** Signal that the upstream stream finished. */
  finish(reason: string): ParserEvent[] {
    if (this.finished) return [];
    this.finished = true;
    const events: ParserEvent[] = [];

    if (this.mode === "tool" && this.currentTool) {
      // Ended mid-tool-call (no closing tag) — finalize best-effort.
      this.finalizeTool(this.currentTool, events);
    } else if (this.buffer.length > 0) {
      // Flush any trailing text.
      events.push({ type: "text", delta: this.buffer });
      this.buffer = "";
    }
    events.push({ type: "finish", reason });
    return events;
  }

  /** Mark done. */
  done(): ParserEvent[] {
    if (this.finished) return [];
    return [{ type: "done" }];
  }

  /** All completed tool calls (used by the non-streaming path). */
  get toolCalls(): PendingTool[] {
    return this.tools.filter((t) => t.done);
  }

  /* ---------------------------------------------------------------------- */

  private drain(): ParserEvent[] {
    const events: ParserEvent[] = [];

    if (this.mode === "text") {
      // Look for the opening tag within the buffer. Note OPEN_TAG has no `>`,
      // so it matches `<tool_call` and also `<tool_call ... attrs ...>`.
      const openIdx = this.buffer.indexOf(OPEN_TAG);
      if (openIdx === -1) {
        // No tag yet. Emit text up to a safe lookahead boundary to avoid
        // splitting a potential tag that's still arriving. Keep the last
        // (OPEN_TAG.length - 1) chars buffered.
        const safeLen = this.buffer.length - (OPEN_TAG.length - 1);
        if (safeLen > 0) {
          const text = this.buffer.slice(0, safeLen);
          this.buffer = this.buffer.slice(safeLen);
          events.push({ type: "text", delta: text });
        }
        return events;
      }

      // Emit any text before the tag.
      if (openIdx > 0) {
        const text = this.buffer.slice(0, openIdx);
        if (text.length > 0) events.push({ type: "text", delta: text });
      }
      // Consume the opening tag name; attributes (if any) remain in buffer.
      this.buffer = this.buffer.slice(openIdx + OPEN_TAG.length);

      this.mode = "tool";
      this.toolIndex += 1;
      this.currentTool = {
        index: this.toolIndex,
        id: this.makeToolCallId(),
        name: "",
        argumentsBuf: "",
        headerParsed: false,
        bodyStarted: false,
        rawBody: "",
        bodyEmitted: 0,
        done: false,
      };
      this.tools.push(this.currentTool);

      // Continue draining in tool mode (parse header + body).
      events.push(...this.drainTool());
      return events;
    }

    // mode === "tool"
    events.push(...this.drainTool());
    return events;
  }

  private drainTool(): ParserEvent[] {
    const events: ParserEvent[] = [];
    const tool = this.currentTool;
    if (!tool) return events;

    // Phase 1: parse the open-tag header until we find `>`.
    if (!tool.bodyStarted) {
      const gt = this.buffer.indexOf(">");
      if (gt === -1) {
        // Header not complete yet; keep buffering. No events.
        return events;
      }
      const header = this.buffer.slice(0, gt);
      this.buffer = this.buffer.slice(gt + 1);
      const attrs = parseTagAttributes(header);
      if (attrs.name) tool.name = attrs.name;
      if (attrs.tool_call_id) tool.id = sanitizeToolCallId(attrs.tool_call_id);
      tool.headerParsed = true;
      tool.bodyStarted = true;
      // Emit tool_start now that we know name + id.
      events.push({ type: "tool_start", index: tool.index, id: tool.id, name: tool.name });
      // Strip a single leading newline that the model emits after `>`.
      if (this.buffer.startsWith("\n")) this.buffer = this.buffer.slice(1);
      // Fall through to body handling (may find close tag immediately).
    }

    // Phase 2: stream the body up to the close tag.
    const closeIdx = this.buffer.indexOf(CLOSE_TAG);
    if (closeIdx === -1) {
      // No closing tag yet. Emit body chars we're sure about, keeping the last
      // (CLOSE_TAG.length - 1) chars buffered in case they're the close tag.
      const safeLen = this.buffer.length - (CLOSE_TAG.length - 1);
      if (safeLen > 0) {
        const chunk = this.buffer.slice(0, safeLen);
        this.buffer = this.buffer.slice(safeLen);
        events.push(...this.processBodyChunk(chunk));
      }
      return events;
    }

    // Consume body up through the close tag.
    const inside = this.buffer.slice(0, closeIdx);
    this.buffer = this.buffer.slice(closeIdx + CLOSE_TAG.length);
    events.push(...this.processBodyChunk(inside));
    this.finalizeTool(tool, events);

    // Strip a trailing newline that typically follows the close tag, then
    // return to text mode and keep draining.
    if (this.buffer.startsWith("\n")) this.buffer = this.buffer.slice(1);
    this.mode = "text";
    this.currentTool = null;
    events.push(...this.drain());
    return events;
  }

  /**
   * Stream body chars as argument deltas. The body is the arguments JSON
   * object directly, so we forward it verbatim (trimming surrounding
   * whitespace). We don't depth-track here because the close tag — not JSON
   * depth — delimits the value, and the body may legitimately contain
   * whitespace the client can ignore.
   */
  private processBodyChunk(chunk: string): ParserEvent[] {
    const tool = this.currentTool;
    if (!tool || chunk.length === 0) return [];
    tool.rawBody += chunk;

    // Trim leading whitespace from the very first emitted chunk so the
    // streamed arguments start cleanly with `{` (or a JSON primitive).
    if (tool.bodyEmitted === 0) {
      const trimmed = chunk.replace(/^[\s\n]+/, "");
      tool.bodyEmitted += chunk.length; // count raw chars consumed
      if (trimmed.length === 0) return [];
      return [{ type: "tool_arguments_delta", index: tool.index, delta: trimmed }];
    }

    tool.bodyEmitted += chunk.length;
    return [{ type: "tool_arguments_delta", index: tool.index, delta: chunk }];
  }

  private finalizeTool(tool: PendingTool, events: ParserEvent[]): void {
    if (tool.done) return;
    tool.done = true;

    // Reconstruct the final arguments string from the full raw body.
    const body = tool.rawBody.trim();
    if (body) {
      // The body is already the arguments JSON; keep it verbatim. If it isn't
      // valid JSON, we still surface it (clients may tolerate / log it).
      tool.argumentsBuf = body;
    } else {
      tool.argumentsBuf = "{}";
    }
    events.push({ type: "tool_end", index: tool.index });
  }


  private makeToolCallId(): string {
    return `call_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}


// Sanitize IDs vindos do modelo pra caber no limite OpenAI (<=64 chars).
function sanitizeToolCallId(raw: string): string {
  const MAX = 64;
  const id = String(raw ?? "").trim();
  if (id.length <= MAX) return id || `call_${Date.now().toString(36)}`;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  const tail = (h >>> 0).toString(36);
  const head = id.slice(0, MAX - tail.length - 1);
  const safe = `${head}_${tail}`;
  try { console.error(`[proxy-unlimi] tool_call_id truncado ${id.length}->${safe.length}`); } catch {}
  return safe;
}

/* -------------------------------------------------------------------------- */
/*  Tag-attribute & JSON helpers                                               */
/* -------------------------------------------------------------------------- */

interface TagAttributes {
  name?: string;
  tool_call_id?: string;
}

/**
 * Parse attributes from an open-tag header like:
 *   ` name="read" tool_call_id="tc_2f3c4d5e6a7b8c9d"`
 * Tolerates single or double quotes and arbitrary spacing.
 */
function parseTagAttributes(header: string): TagAttributes {
  const attrs: TagAttributes = {};
  const re = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(header)) !== null) {
    const key = m[1];
    const val = m[2] ?? m[3] ?? "";
    if (key === "name") attrs.name = val;
    else if (key === "tool_call_id") attrs.tool_call_id = val;
  }
  return attrs;
}

export interface CompletedToolCall {
  index: number;
  id: string;
  name: string;
  arguments: string;
}

/** Convenience: read finalized tool calls off a parser instance. */
export function completedToolCalls(parser: ToolCallStreamParser): CompletedToolCall[] {
  return parser.toolCalls.map((t) => ({
    index: t.index,
    id: t.id,
    name: t.name,
    arguments: t.argumentsBuf,
  }));
}
