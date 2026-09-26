import { logApp, subscribeAuditEvents } from "./audit-logger.js";
function emit(level, msg, meta) {
    logApp(level, msg, meta);
}
export const log = {
    debug: (msg, meta) => emit("debug", msg, meta),
    info: (msg, meta) => emit("info", msg, meta),
    warn: (msg, meta) => emit("warn", msg, meta),
    error: (msg, meta) => emit("error", msg, meta),
};
// Uma chamada MCP auditada tambem entra no canal de observabilidade ja existente.
// bootstrapAdminLogCapture() embrulha log.info no boot e, por isso, o mesmo evento
// chega ao buffer/SSE de /admin/logs/stream sem criar segundo barramento.
subscribeAuditEvents((envelope) => {
    log.info("mcp_tool_execution_live", envelope);
});
//# sourceMappingURL=log.js.map
//# sourceMappingURL=log.js.map