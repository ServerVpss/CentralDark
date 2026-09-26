# COMANDO - external-job-provider.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\api\external-job-provider.ts
**SHA:** 249874fdf318ae39
**Timestamp:** 2026-08-28T02:24:51.526289
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: string;

### Ouro Bruto (primeiros 5000 chars)
```
export const EXTERNAL_JOB_PROVIDER_PROTOCOL_VERSION = 1;
export const EXTERNAL_JOB_PROVIDER_REGISTRY_KEY = "pi-subagents.external-job-providers.v1";

const MAX_PROVIDER_NAME_LENGTH = 128;
const MAX_PROVIDERS = 100;
const MAX_JOB_ID_LENGTH = 256;
const MAX_FAILURE_CODE_LENGTH = 128;
const MAX_FAILURE_MESSAGE_LENGTH = 4_096;
const MAX_URL_LENGTH = 4_096;

export type ExternalJobState = "queued" | "running" | "completed" | "failed" | "stopped" | "blocked";
export type ExternalJobOperation = "start" | "follow-up" | "status" | "result" | "reattach";

export type ExternalJobOptions = Record<string, unknown>;

export interface ExternalJobStartInput {
	prompt: string;
	promptDigest: string;
	cwd: string;
	runId: string;
	stepIndex: number;
	agent: string;
	options: ExternalJobOptions;
	sessionId?: string;
}

export interface ExternalJobFollowUpInput extends ExternalJobStartInput {
	sourceRunId: string;
	sourceStepIndex: number;
	parentProviderJobId: string;
	requestId: string;
	requestDigest: string;
}

export interface ExternalJobHandle {
	providerJobId: string;
	state: ExternalJobState;
	handleUrl?: string;
	conversationUrl?: string;
	failureCode?: string;
	failureMessage?: string;
	blockingJobId?: string;
}

export interface ExternalJobResult extends ExternalJobHandle {
	output?: string;
	artifactPath?: string;
}

export interface ExternalJobProvider {
	name: string;
	start(input: ExternalJobStartInput): Promise<ExternalJobHandle> | ExternalJobHandle;
	followUp?(input: ExternalJobFollowUpInput): Promise<ExternalJobHandle> | ExternalJobHandle;
	status(providerJobId: string): Promise<ExternalJobHandle> | ExternalJobHandle;
	result(providerJobId: string): Promise<ExternalJobResult> | ExternalJobResult;
	reattach(providerJobId: string): Promise<ExternalJobHandle> | ExternalJobHandle;
}

export class ExternalJobProviderError extends Error {
	readonly code: string;
	readonly blockingJobId?: string;

	constructor(message: string, options: { code: string; blockingJobId?: string; cause?: unknown }) {
		super(message, options.cause === undefined ? undefined : { cause: options.cause });
		this.name = "ExternalJobProviderError";
		this.code = options.code;
		this.blockingJobId = options.blockingJobId;
	}
}

interface ExternalJobProviderRegistry {
	version: typeof EXTERNAL_JOB_PROVIDER_PROTOCOL_VERSION;
	providers: Map<string, ExternalJobProvider>;
}

function registry(): ExternalJobProviderRegistry {
	const key = Symbol.for(EXTERNAL_JOB_PROVIDER_REGISTRY_KEY);
	const globalObject = globalThis as Record<PropertyKey, unknown>;
	const existing = globalObject[key];
	if (existing === undefined) {
		const created: ExternalJobProviderRegistry = {
			version: EXTERNAL_JOB_PROVIDER_PROTOCOL_VERSION,
			providers: new Map(),
		};
		globalObject[key] = created;
		return created;
	}
	if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
		throw new Error(`Malformed external-job provider registry at Symbol.for("${EXTERNAL_JOB_PROVIDER_REGISTRY_KEY}").`);
	}
	const candidate = existing as Partial<ExternalJobProviderRegistry>;
	if (candidate.version !== EXTERNAL_JOB_PROVIDER_PROTOCOL_VERSION || !(candidate.providers instanceof Map)) {
		throw new Error(`Unsupported external-job provider registry at Symbol.for("${EXTERNAL_JOB_PROVIDER_REGISTRY_KEY}").`);
	}
	return candidate as ExternalJobProviderRegistry;
}

function validateString(value: unknown, field: string, maxLength: number): string {
	if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
		throw new Error(`${field} must be a non-empty string without leading or trailing whitespace.`);
	}
	if (value.length > maxLength) throw new Error(`${field} must be at most ${maxLength} characters.`);
	if (value.includes("\0")) throw new Error(`${field} must not contain NUL characters.`);
	return value;
}

function validateOptionalString(value: unknown, field: string, maxLength: number): string | undefined {
	if (value === undefined) return undefined;
	return validateString(value, field, maxLength);
}

function validateState(value: unknown, field: string): ExternalJobState {
	if (value === "queued" || value === "running" || value === "completed" || value === "failed" || value === "stopped" || value === "blocked") return value;
	throw new Error(`${field} must be queued, running, completed, failed, stopped, or blocked.`);
}

function validateHandle(provider: string, value: unknown, field: string, extraFields: readonly string[] = []): ExternalJobHandle {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} from external-job provider '${provider}' must be an object.`);
	const handle = value as Record<string, unknown>;
	const supported = new Set(["providerJobId", "state", "handleUrl", "conversationUrl", "failureCode", "failureMessage", "blockingJobId", ...extraFields]);
	const unknown = Object.keys(handle).filter((key) => !supported.has(key));
	if (unknown.length > 0) throw new Error(`${field} from external-job prov
```