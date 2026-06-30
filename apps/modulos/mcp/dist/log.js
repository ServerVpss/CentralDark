import { logApp } from "./audit-logger.js";
function emit(level, msg, meta) {
    logApp(level, msg, meta);
}
export const log = {
    debug: (msg, meta) => emit("debug", msg, meta),
    info: (msg, meta) => emit("info", msg, meta),
    warn: (msg, meta) => emit("warn", msg, meta),
    error: (msg, meta) => emit("error", msg, meta),
};
//# sourceMappingURL=log.js.map