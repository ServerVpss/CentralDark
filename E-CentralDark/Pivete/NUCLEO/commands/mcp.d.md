# COMANDO - mcp.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@modelcontextprotocol\sdk@1.30.0@@@1\dist\esm\server\mcp.d.ts
**SHA:** 45b14dbeb3e96def
**Timestamp:** 2026-08-28T02:20:26.912914
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export type RegisteredPrompt = {

### Ouro Bruto (primeiros 5000 chars)
```
import { Server, ServerOptions } from './index.js';
import { AnySchema, AnyObjectSchema, ZodRawShapeCompat, SchemaOutput, ShapeOutput } from './zod-compat.js';
import { Implementation, CallToolResult, Resource, ListResourcesResult, GetPromptResult, ReadResourceResult, ServerRequest, ServerNotification, ToolAnnotations, LoggingMessageNotification, Result, ToolExecution } from '../types.js';
import { UriTemplate, Variables } from '../shared/uriTemplate.js';
import { RequestHandlerExtra } from '../shared/protocol.js';
import { Transport } from '../shared/transport.js';
import { ExperimentalMcpServerTasks } from '../experimental/tasks/mcp-server.js';
import type { ToolTaskHandler } from '../experimental/tasks/interfaces.js';
/**
 * High-level MCP server that provides a simpler API for working with resources, tools, and prompts.
 * For advanced usage (like sending notifications or setting custom request handlers), use the underlying
 * Server instance available via the `server` property.
 */
export declare class McpServer {
    /**
     * The underlying Server instance, useful for advanced operations like sending notifications.
     */
    readonly server: Server;
    private _registeredResources;
    private _registeredResourceTemplates;
    private _registeredTools;
    private _registeredPrompts;
    private _experimental?;
    constructor(serverInfo: Implementation, options?: ServerOptions);
    /**
     * Access experimental features.
     *
     * WARNING: These APIs are experimental and may change without notice.
     *
     * @experimental
     */
    get experimental(): {
        tasks: ExperimentalMcpServerTasks;
    };
    /**
     * Attaches to the given transport, starts it, and starts listening for messages.
     *
     * The `server` object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
     */
    connect(transport: Transport): Promise<void>;
    /**
     * Closes the connection.
     */
    close(): Promise<void>;
    private _toolHandlersInitialized;
    private setToolRequestHandlers;
    /**
     * Creates a tool error result.
     *
     * @param errorMessage - The error message.
     * @returns The tool error result.
     */
    private createToolError;
    /**
     * Validates tool input arguments against the tool's input schema.
     */
    private validateToolInput;
    /**
     * Validates tool output against the tool's output schema.
     */
    private validateToolOutput;
    /**
     * Executes a tool handler (either regular or task-based).
     */
    private executeToolHandler;
    /**
     * Handles automatic task polling for tools with taskSupport 'optional'.
     */
    private handleAutomaticTaskPolling;
    private _completionHandlerInitialized;
    private setCompletionRequestHandler;
    private handlePromptCompletion;
    private handleResourceCompletion;
    private _resourceHandlersInitialized;
    private setResourceRequestHandlers;
    private _promptHandlersInitialized;
    private setPromptRequestHandlers;
    /**
     * Registers a resource `name` at a fixed URI, which will use the given callback to respond to read requests.
     * @deprecated Use `registerResource` instead.
     */
    resource(name: string, uri: string, readCallback: ReadResourceCallback): RegisteredResource;
    /**
     * Registers a resource `name` at a fixed URI with metadata, which will use the given callback to respond to read requests.
     * @deprecated Use `registerResource` instead.
     */
    resource(name: string, uri: string, metadata: ResourceMetadata, readCallback: ReadResourceCallback): RegisteredResource;
    /**
     * Registers a resource `name` with a template pattern, which will use the given callback to respond to read requests.
     * @deprecated Use `registerResource` instead.
     */
    resource(name: string, template: ResourceTemplate, readCallback: ReadResourceTemplateCallback): RegisteredResourceTemplate;
    /**
     * Registers a resource `name` with a template pattern and metadata, which will use the given callback to respond to read requests.
     * @deprecated Use `registerResource` instead.
     */
    resource(name: string, template: ResourceTemplate, metadata: ResourceMetadata, readCallback: ReadResourceTemplateCallback): RegisteredResourceTemplate;
    /**
     * Registers a resource with a config object and callback.
     * For static resources, use a URI string. For dynamic resources, use a ResourceTemplate.
     */
    registerResource(name: string, uriOrTemplate: string, config: ResourceMetadata, readCallback: ReadResourceCallback): RegisteredResource;
    registerResource(name: string, uriOrTemplate: ResourceTemplate, config: ResourceMetadata, readCallback: ReadResourceTemplateCallback): RegisteredResourceTemplate;
    private _createRegisteredResource;
    private _createRegisteredResourceTemplate;
    private _createRegisteredPrompt;
  
```