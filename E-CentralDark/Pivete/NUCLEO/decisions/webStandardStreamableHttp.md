# DECISAO - webStandardStreamableHttp.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@modelcontextprotocol\sdk@1.30.0@@@1\dist\esm\server\webStandardStreamableHttp.js
**SHA:** 7f13981326b31e78
**Timestamp:** 2026-08-28T02:20:27.447242
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: controller => {
- start: controller => {
- start: controller => {

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Web Standards Streamable HTTP Server Transport
 *
 * This is the core transport implementation using Web Standard APIs (Request, Response, ReadableStream).
 * It can run on any runtime that supports Web Standards: Node.js 18+, Cloudflare Workers, Deno, Bun, etc.
 *
 * For Node.js Express/HTTP compatibility, use `StreamableHTTPServerTransport` which wraps this transport.
 */
import { isJsonContentType } from '../shared/mediaType.js';
import { armSseKeepAlive, DEFAULT_SSE_KEEP_ALIVE_MS } from './sseKeepAlive.js';
import { isInitializeRequest, isJSONRPCErrorResponse, isJSONRPCRequest, isJSONRPCResultResponse, JSONRPCMessageSchema, SUPPORTED_PROTOCOL_VERSIONS, DEFAULT_NEGOTIATED_PROTOCOL_VERSION } from '../types.js';
/**
 * Server transport for Web Standards Streamable HTTP: this implements the MCP Streamable HTTP transport specification
 * using Web Standard APIs (Request, Response, ReadableStream).
 *
 * This transport works on any runtime that supports Web Standards: Node.js 18+, Cloudflare Workers, Deno, Bun, etc.
 *
 * Usage example:
 *
 * ```typescript
 * // Stateful mode - server sets the session ID
 * const statefulTransport = new WebStandardStreamableHTTPServerTransport({
 *   sessionIdGenerator: () => crypto.randomUUID(),
 * });
 *
 * // Stateless mode - explicitly set session ID to undefined
 * const statelessTransport = new WebStandardStreamableHTTPServerTransport({
 *   sessionIdGenerator: undefined,
 * });
 *
 * // Hono.js usage
 * app.all('/mcp', async (c) => {
 *   return transport.handleRequest(c.req.raw);
 * });
 *
 * // Cloudflare Workers usage
 * export default {
 *   async fetch(request: Request): Promise<Response> {
 *     return transport.handleRequest(request);
 *   }
 * };
 * ```
 *
 * In stateful mode:
 * - Session ID is generated and included in response headers
 * - Session ID is always included in initialization responses
 * - Requests with invalid session IDs are rejected with 404 Not Found
 * - Non-initialization requests without a session ID are rejected with 400 Bad Request
 * - State is maintained in-memory (connections, message history)
 *
 * In stateless mode:
 * - No Session ID is included in any responses
 * - No session validation is performed
 */
export class WebStandardStreamableHTTPServerTransport {
    constructor(options = {}) {
        this._started = false;
        this._hasHandledRequest = false;
        this._streamMapping = new Map();
        this._requestToStreamMapping = new Map();
        /**
         * Request streams whose client holds a Last-Event-ID cursor (at least one
         * id-bearing event was delivered on them), so a stored response can be
         * replayed on resume.
         */
        this._resumableStreams = new Set();
        this._requestResponseMap = new Map();
        this._initialized = false;
        this._enableJsonResponse = false;
        this._standaloneSseStreamId = '_GET_stream';
        this._closed = false;
        this.sessionIdGenerator = options.sessionIdGenerator;
        this._enableJsonResponse = options.enableJsonResponse ?? false;
        this._eventStore = options.eventStore;
        this._onsessioninitialized = options.onsessioninitialized;
        this._onsessionclosed = options.onsessionclosed;
        this._allowedHosts = options.allowedHosts;
        this._allowedOrigins = options.allowedOrigins;
        this._enableDnsRebindingProtection = options.enableDnsRebindingProtection ?? false;
        this._retryInterval = options.retryInterval;
        this._keepAliveMs = options.keepAliveMs ?? DEFAULT_SSE_KEEP_ALIVE_MS;
    }
    /**
     * Arms a keep-alive interval for an SSE stream that periodically writes an SSE
     * comment frame so intermediaries and idle timeouts don't kill the connection.
     * The returned timer is owned by the stream it was armed for: the stream's
     * cancel/cleanup callbacks must clear it. The interval clears itself if a
     * write fails (stream already closed/cancelled).
     */
    startKeepAlive(controller, encoder) {
        // After close() nothing may arm: the stream cleanups have already run.
        if (this._closed)
            return undefined;
        const timer = armSseKeepAlive(this._keepAliveMs, () => {
            try {
                controller.enqueue(encoder.encode(': keepalive\n\n'));
            }
            catch {
                if (timer !== undefined)
                    clearInterval(timer);
            }
        });
        return timer;
    }
    /**
     * Starts the transport. This is required by the Transport interface but is a no-op
     * for the Streamable HTTP transport as connections are managed per-request.
     */
    async start() {
        if (this._started) {
            throw new Error('Transport already started');
        }
        this._started = true;
    }
    /**
     * Helper to create a JSON error response
     */
    createJsonErrorResponse(status, code, message, options) {
        const error = { code, message };
        if
```