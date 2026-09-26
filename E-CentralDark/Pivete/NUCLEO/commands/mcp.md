# COMANDO - mcp.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@modelcontextprotocol\sdk@1.30.0@@@1\dist\esm\server\mcp.js
**SHA:** a5caaddfa0f6aade
**Timestamp:** 2026-08-28T02:20:27.005799
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = this._registeredPrompts[ref.name];
- const prompt = this._registeredPrompts[request.params.name];
- const registeredPrompt = {
- const registeredPrompt = this._createRegisteredPrompt(name, undefined, description, argsSchema, cb);
- const registeredPrompt = this._createRegisteredPrompt(name, title, description, argsSchema, cb);

### Ouro Bruto (primeiros 5000 chars)
```
import { Server } from './index.js';
import { normalizeObjectSchema, safeParseAsync, getObjectShape, objectFromShape, getParseErrorMessage, getSchemaDescription, isSchemaOptional, getLiteralValue } from './zod-compat.js';
import { toJsonSchemaCompat } from './zod-json-schema-compat.js';
import { McpError, ErrorCode, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, CompleteRequestSchema, assertCompleteRequestPrompt, assertCompleteRequestResourceTemplate } from '../types.js';
import { isCompletable, getCompleter } from './completable.js';
import { UriTemplate } from '../shared/uriTemplate.js';
import { validateAndWarnToolName } from '../shared/toolNameValidation.js';
import { ExperimentalMcpServerTasks } from '../experimental/tasks/mcp-server.js';
import { ZodOptional } from 'zod';
/**
 * High-level MCP server that provides a simpler API for working with resources, tools, and prompts.
 * For advanced usage (like sending notifications or setting custom request handlers), use the underlying
 * Server instance available via the `server` property.
 */
export class McpServer {
    constructor(serverInfo, options) {
        this._registeredResources = {};
        this._registeredResourceTemplates = {};
        this._registeredTools = {};
        this._registeredPrompts = {};
        this._toolHandlersInitialized = false;
        this._completionHandlerInitialized = false;
        this._resourceHandlersInitialized = false;
        this._promptHandlersInitialized = false;
        this.server = new Server(serverInfo, options);
    }
    /**
     * Access experimental features.
     *
     * WARNING: These APIs are experimental and may change without notice.
     *
     * @experimental
     */
    get experimental() {
        if (!this._experimental) {
            this._experimental = {
                tasks: new ExperimentalMcpServerTasks(this)
            };
        }
        return this._experimental;
    }
    /**
     * Attaches to the given transport, starts it, and starts listening for messages.
     *
     * The `server` object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
     */
    async connect(transport) {
        return await this.server.connect(transport);
    }
    /**
     * Closes the connection.
     */
    async close() {
        await this.server.close();
    }
    setToolRequestHandlers() {
        if (this._toolHandlersInitialized) {
            return;
        }
        this.server.assertCanSetRequestHandler(getMethodValue(ListToolsRequestSchema));
        this.server.assertCanSetRequestHandler(getMethodValue(CallToolRequestSchema));
        this.server.registerCapabilities({
            tools: {
                listChanged: true
            }
        });
        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: Object.entries(this._registeredTools)
                .filter(([, tool]) => tool.enabled)
                .map(([name, tool]) => {
                const toolDefinition = {
                    name,
                    title: tool.title,
                    description: tool.description,
                    inputSchema: (() => {
                        const obj = normalizeObjectSchema(tool.inputSchema);
                        return obj
                            ? toJsonSchemaCompat(obj, {
                                strictUnions: true,
                                pipeStrategy: 'input'
                            })
                            : EMPTY_OBJECT_JSON_SCHEMA;
                    })(),
                    annotations: tool.annotations,
                    execution: tool.execution,
                    _meta: tool._meta
                };
                if (tool.outputSchema) {
                    const obj = normalizeObjectSchema(tool.outputSchema);
                    if (obj) {
                        toolDefinition.outputSchema = toJsonSchemaCompat(obj, {
                            strictUnions: true,
                            pipeStrategy: 'output'
                        });
                    }
                }
                return toolDefinition;
            })
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
            try {
                const tool = this._registeredTools[request.params.name];
                if (!tool) {
                    throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} not found`);
                }
                if (!tool.enabled) {
                    throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} disabled`);
                }
                const isTaskRequest = !!request.params.task;
                const taskSupport = tool.executio
```