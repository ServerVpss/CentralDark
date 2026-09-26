#!/usr/bin/env node
/**
 * HTTP Server for Screenpipe MCP
 *
 * This allows web apps to call MCP tools over HTTP instead of stdio.
 *
 * Run on localhost (default):
 *   npx ts-node src/http-server.ts --port 3031
 *
 * Expose to your LAN (requires --api-key):
 *   npx ts-node src/http-server.ts --listen-on-lan --api-key <secret>
 *
 * Loopback callers are always allowed without auth. Non-loopback callers
 * must send `Authorization: Bearer <secret>` whenever --api-key is set.
 */
import { type IncomingMessage, type ServerResponse } from "http";
export interface CliConfig {
    mcpPort: number;
    screenpipePort: number;
    /** Bind address: "127.0.0.1" (default) or "0.0.0.0" when --listen-on-lan. */
    host: string;
    /** Required bearer token for non-loopback requests. Loopback skips auth. */
    apiKey?: string;
}
export declare class CliError extends Error {
}
/**
 * Parse CLI args. Pure for testability.
 *
 * Mirrors the screenpipe-engine CLI: --listen-on-lan flips bind to 0.0.0.0
 * and *requires* --api-key so we never accidentally expose an unauthenticated
 * MCP endpoint on the user's network.
 */
export declare function parseArgs(argv: string[]): CliConfig;
/**
 * True if `req` came from the local machine. Covers IPv4 loopback,
 * IPv6 loopback, and IPv4-mapped-IPv6 loopback (`::ffff:127.x`).
 */
export declare function isLoopbackRequest(req: {
    socket: {
        remoteAddress?: string;
    };
}): boolean;
/**
 * Authorization decision. Loopback is always allowed; non-loopback requires
 * a matching bearer token when one is configured. If no api key is set
 * (loopback-only deployment), non-loopback shouldn't even be reachable —
 * but we still 401 it as belt-and-suspenders.
 */
export declare function isAuthorized(req: {
    socket: {
        remoteAddress?: string;
    };
    headers: {
        authorization?: string;
    };
}, apiKey: string | undefined): boolean;
export declare function buildHttpServer(config: CliConfig): import("node:http").Server<typeof IncomingMessage, typeof ServerResponse>;
/**
 * Parse argv and start listening. Exported so `cli.ts` can dispatch here
 * when invoked as `screenpipe-mcp --http …`, in addition to the direct
 * `screenpipe-mcp-http` bin path which auto-starts via the `isMain` check
 * below.
 */
export declare function runFromArgv(argv: string[]): void;
