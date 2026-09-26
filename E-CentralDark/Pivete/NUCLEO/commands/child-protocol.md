# COMANDO - child-protocol.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\child-protocol.ts
**SHA:** 08cc0df0358e5eb5
**Timestamp:** 2026-08-28T02:24:57.541224
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = 0;
- start = index + 1;
- let start = buffer.length - maxBytes;

### Ouro Bruto (primeiros 5000 chars)
```
import { Buffer } from "node:buffer";
import type { ProtocolOutputLimit } from "../../shared/types.ts";

export type { ProtocolOutputLimit } from "../../shared/types.ts";

export const MAX_CHILD_PENDING_LINE_BYTES = 16 * 1024 * 1024;
export const MAX_CHILD_STDERR_BYTES = 128 * 1024;
const MAX_PROTOCOL_DIAGNOSTIC_BYTES = 4096;
const MAX_PROJECTED_JSON_DEPTH = 256;

export interface OversizedLineProjection {
	push(chunk: Buffer): boolean;
	finish(): string | undefined;
}

export interface OversizedLineProjector {
	accepts(prefix: string): boolean;
	create(): OversizedLineProjection;
}

type JsonContainer =
	| { type: "array"; state: "value-or-end" | "value" | "comma-or-end" }
	| { type: "object"; state: "key-or-end" | "key" | "colon" | "value" | "comma-or-end"; key?: string };

type JsonToken =
	| { type: "string"; role: "key" | "value"; value: string; capture: boolean; escape: boolean; unicodeDigits: number; unicodeValue: string }
	| { type: "literal"; expected: string; index: number; value: boolean | null }
	| { type: "number"; phase: "minus" | "zero" | "int" | "dot" | "frac" | "exp" | "exp-sign" | "exp-digits" };

function createPiAggregateProjection(): OversizedLineProjection {
	const decoder = new TextDecoder("utf-8", { fatal: true });
	const stack: JsonContainer[] = [];
	let rootState: "value" | "end" = "value";
	let token: JsonToken | undefined;
	let valid = true;
	let eventType: string | undefined;
	let willRetry: boolean | undefined;

	const parent = (): JsonContainer | undefined => stack.at(-1);
	const isTopLevelField = (key: string | undefined): boolean => stack.length === 1 && parent()?.type === "object" && (key === "type" || key === "willRetry");

	const completeValue = (value?: string | boolean | null): void => {
		const container = parent();
		if (!container) {
			rootState = "end";
			return;
		}
		if (container.type === "object") {
			if (stack.length === 1 && container.key === "type" && typeof value === "string") eventType = value;
			if (stack.length === 1 && container.key === "willRetry" && typeof value === "boolean") willRetry = value;
			container.key = undefined;
			container.state = "comma-or-end";
		} else container.state = "comma-or-end";
	};

	const startValue = (char: string): boolean => {
		const container = parent();
		const key = container?.type === "object" ? container.key : undefined;
		if (isTopLevelField(key)) {
			if (key === "type") eventType = undefined;
			else willRetry = undefined;
		}
		if (char === "{" || char === "[") {
			if (stack.length >= MAX_PROJECTED_JSON_DEPTH) return false;
			stack.push(char === "{" ? { type: "object", state: "key-or-end" } : { type: "array", state: "value-or-end" });
			return true;
		}
		if (char === '"') {
			token = { type: "string", role: "value", value: "", capture: key === "type" && stack.length === 1, escape: false, unicodeDigits: 0, unicodeValue: "" };
			return true;
		}
		if (char === "t") token = { type: "literal", expected: "true", index: 1, value: true };
		else if (char === "f") token = { type: "literal", expected: "false", index: 1, value: false };
		else if (char === "n") token = { type: "literal", expected: "null", index: 1, value: null };
		else if (char === "-") token = { type: "number", phase: "minus" };
		else if (char === "0") token = { type: "number", phase: "zero" };
		else if (char >= "1" && char <= "9") token = { type: "number", phase: "int" };
		else return false;
		return true;
	};

	const closeContainer = (): true => {
		stack.pop();
		completeValue();
		return true;
	};

	const processChar = (char: string): boolean => {
		if (token?.type === "string") {
			if (token.unicodeDigits > 0) {
				if (!/[0-9a-fA-F]/.test(char)) return false;
				token.unicodeValue += char;
				token.unicodeDigits--;
				if (token.unicodeDigits === 0 && token.capture) {
					if (token.value.length >= 64) return false;
					token.value += String.fromCharCode(Number.parseInt(token.unicodeValue, 16));
				}
				return true;
			}
			if (token.escape) {
				token.escape = false;
				if (char === "u") { token.unicodeDigits = 4; token.unicodeValue = ""; return true; }
				if (!'"\\/bfnrt'.includes(char)) return false;
				if (token.capture) {
					if (token.value.length >= 64) return false;
					token.value += ({ b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" } as Record<string, string>)[char] ?? char;
				}
				return true;
			}
			if (char === "\\") { token.escape = true; return true; }
			if (char === '"') {
				const finished = token;
				token = undefined;
				if (finished.role === "key") {
					const container = parent();
					if (!container || container.type !== "object") return false;
					container.key = finished.value;
					container.state = "colon";
				} else completeValue(finished.capture ? finished.value : undefined);
				return true;
			}
			if (char.charCodeAt(0) < 0x20) return false;
			if (token.capture) {
				if (token.value.length >= 64) return false;
				token.value += char;
			}
			return true;
		}
		if (token?.type === "l
```