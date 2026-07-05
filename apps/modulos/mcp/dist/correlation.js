// Middleware de Correlation-ID + logger estruturado por request.
// Cada requisição ganha um UUID (req.cid) propagado no header X-Correlation-Id
// e em todos os logs, permitindo rastrear OAuth → /token → tools/list → SSE
// numa timeline única. Isola bugs tipo body_iterator/streaming rapidamente.
import { randomUUID } from "node:crypto";
import { log } from "./log.js";

export function correlationMiddleware(req, res, next) {
    const incoming = req.headers["x-correlation-id"];
    const cid = (typeof incoming === "string" && incoming.length >= 8 && incoming.length <= 64)
        ? incoming
        : randomUUID();
    req.cid = cid;
    res.setHeader("X-Correlation-Id", cid);
    const started = Date.now();

    log.info("http_request_start", {
        cid,
        method: req.method,
        path: req.path,
        ua: (req.headers["user-agent"] || "").slice(0, 120),
        ip: req.ip || req.socket?.remoteAddress || "?",
    });

    // Instrumenta encerramento (cobre respostas normais e SSE fechadas)
    res.on("finish", () => {
        log.info("http_request_end", {
            cid,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            ms: Date.now() - started,
            bytes: Number(res.getHeader("content-length")) || undefined,
        });
    });
    res.on("close", () => {
        if (!res.writableEnded) {
            log.warn("http_request_aborted", {
                cid,
                method: req.method,
                path: req.path,
                status: res.statusCode,
                ms: Date.now() - started,
            });
        }
    });
    next();
}

// Helper para logs específicos do MCP com CID embutido
export function withCid(cid) {
    return {
        debug: (msg, meta = {}) => log.debug(msg, { cid, ...meta }),
        info: (msg, meta = {}) => log.info(msg, { cid, ...meta }),
        warn: (msg, meta = {}) => log.warn(msg, { cid, ...meta }),
        error: (msg, meta = {}) => log.error(msg, { cid, ...meta }),
    };
}
