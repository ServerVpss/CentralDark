# COMANDO - types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@modelcontextprotocol\sdk\dist\esm\types.d.ts
**SHA:** 992f47b4534fed1f
**Timestamp:** 2026-08-26T19:32:03.013860
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: z.ZodOptional<z.ZodString>;
- systemPrompt: z.ZodOptional<z.ZodString>;
- systemPrompt: z.ZodOptional<z.ZodString>;
- export type Prompt = Infer<typeof PromptSchema>;
- export type CompleteRequestPrompt = ExpandRecursively<CompleteRequest & {

### Ouro Bruto (primeiros 5000 chars)
```
import * as z from 'zod/v4';
import { AuthInfo } from './server/auth/types.js';
export declare const LATEST_PROTOCOL_VERSION = "2025-11-25";
export declare const DEFAULT_NEGOTIATED_PROTOCOL_VERSION = "2025-03-26";
export declare const SUPPORTED_PROTOCOL_VERSIONS: string[];
export declare const RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
export declare const JSONRPC_VERSION = "2.0";
/**
 * Utility types
 */
type ExpandRecursively<T> = T extends object ? (T extends infer O ? {
    [K in keyof O]: ExpandRecursively<O[K]>;
} : never) : T;
/**
 * A progress token, used to associate progress notifications with the original request.
 */
export declare const ProgressTokenSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
/**
 * An opaque token used to represent a cursor for pagination.
 */
export declare const CursorSchema: z.ZodString;
/**
 * Task creation parameters, used to ask that the server create a task to represent a request.
 */
export declare const TaskCreationParamsSchema: z.ZodObject<{
    /**
     * Requested duration in milliseconds to retain task from creation.
     */
    ttl: z.ZodOptional<z.ZodNumber>;
    /**
     * Time in milliseconds to wait between task status requests.
     */
    pollInterval: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const TaskMetadataSchema: z.ZodObject<{
    ttl: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Metadata for associating messages with a task.
 * Include this in the `_meta` field under the key `io.modelcontextprotocol/related-task`.
 */
export declare const RelatedTaskMetadataSchema: z.ZodObject<{
    taskId: z.ZodString;
}, z.core.$strip>;
declare const RequestMetaSchema: z.ZodObject<{
    /**
     * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
     */
    progressToken: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    /**
     * If specified, this request is related to the provided task.
     */
    "io.modelcontextprotocol/related-task": z.ZodOptional<z.ZodObject<{
        taskId: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$loose>;
/**
 * Common params for any request.
 */
declare const BaseRequestParamsSchema: z.ZodObject<{
    _meta: z.ZodOptional<z.ZodObject<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
         */
        progressToken: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        /**
         * If specified, this request is related to the provided task.
         */
        "io.modelcontextprotocol/related-task": z.ZodOptional<z.ZodObject<{
            taskId: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$loose>>;
}, z.core.$strip>;
/**
 * Common params for any task-augmented request.
 */
export declare const TaskAugmentedRequestParamsSchema: z.ZodObject<{
    _meta: z.ZodOptional<z.ZodObject<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
         */
        progressToken: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        /**
         * If specified, this request is related to the provided task.
         */
        "io.modelcontextprotocol/related-task": z.ZodOptional<z.ZodObject<{
            taskId: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$loose>>;
    task: z.ZodOptional<z.ZodObject<{
        ttl: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Checks if a value is a valid TaskAugmentedRequestParams.
 * @param value - The value to check.
 *
 * @returns True if the value is a valid TaskAugmentedRequestParams, false otherwise.
 */
export declare const isTaskAugmentedRequestParams: (value: unknown) => value is TaskAugmentedRequestParams;
export declare const RequestSchema: z.ZodObject<{
    method: z.ZodString;
    params: z.ZodOptional<z.ZodObject<{
        _meta: z.ZodOptional<z.ZodObject<{
            /**
             * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
             */
            progressToken: z.ZodOptional<z.ZodUnion
```

---

# COMANDO - types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\types\tracing\workers-ai\types.d.ts
**SHA:** 8b25fce357f870c8
**Timestamp:** 2026-08-28T02:22:20.589611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: (model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;

### Ouro Bruto (primeiros 5000 chars)
```
import type { AIRecordingOptions } from '../ai/utils';
export interface WorkersAiOptions extends AIRecordingOptions {
    /**
     * Enable or disable truncation of recorded input messages.
     * Defaults to `true`.
     */
    enableTruncation?: boolean;
}
/**
 * Minimal shape of the Cloudflare Workers AI binding (`env.AI`).
 * We only rely on the `run` method, everything else is passed through untouched.
 * @see https://developers.cloudflare.com/workers-ai/configuration/bindings/
 */
export interface WorkersAiClient {
    run: (model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
    [key: string]: unknown;
}
/**
 * The token usage reported by Workers AI text generation models.
 */
export interface WorkersAiUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
}
/**
 * The (subset of) inputs accepted by Workers AI `run` calls that we read from.
 * @see https://developers.cloudflare.com/workers-ai/models/
 */
export interface WorkersAiInput {
    prompt?: string;
    messages?: Array<{
        role?: string;
        content?: unknown;
    }>;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    tools?: unknown;
    functions?: unknown;
    text?: string | string[];
}
/**
 * The (subset of) outputs returned by Workers AI text generation models that we read from.
 */
export interface WorkersAiOutput {
    response?: unknown;
    tool_calls?: unknown[];
    usage?: WorkersAiUsage;
}
//# sourceMappingURL=types.d.ts.map
```

---

# COMANDO - types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\types-ts3.8\tracing\workers-ai\types.d.ts
**SHA:** 03592ec89970b816
**Timestamp:** 2026-08-28T02:22:34.051630
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: (model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;

### Ouro Bruto (primeiros 5000 chars)
```
import { AIRecordingOptions } from '../ai/utils';
export interface WorkersAiOptions extends AIRecordingOptions {
    /**
     * Enable or disable truncation of recorded input messages.
     * Defaults to `true`.
     */
    enableTruncation?: boolean;
}
/**
 * Minimal shape of the Cloudflare Workers AI binding (`env.AI`).
 * We only rely on the `run` method, everything else is passed through untouched.
 * @see https://developers.cloudflare.com/workers-ai/configuration/bindings/
 */
export interface WorkersAiClient {
    run: (model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
    [key: string]: unknown;
}
/**
 * The token usage reported by Workers AI text generation models.
 */
export interface WorkersAiUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
}
/**
 * The (subset of) inputs accepted by Workers AI `run` calls that we read from.
 * @see https://developers.cloudflare.com/workers-ai/models/
 */
export interface WorkersAiInput {
    prompt?: string;
    messages?: Array<{
        role?: string;
        content?: unknown;
    }>;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    tools?: unknown;
    functions?: unknown;
    text?: string | string[];
}
/**
 * The (subset of) outputs returned by Workers AI text generation models that we read from.
 */
export interface WorkersAiOutput {
    response?: unknown;
    tool_calls?: unknown[];
    usage?: WorkersAiUsage;
}
//# sourceMappingURL=types.d.ts.map

```