module.exports = [
"[project]/src/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Next.js Instrumentation Hook
 *
 * Called once when the server starts (both dev and production).
 * All Node.js-specific logic lives in ./instrumentation-node.ts to prevent
 * Turbopack's Edge bundler from tracing into native modules (fs, path, os, etc.)
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        // Literal path so Webpack emits the chunk (computed string breaks dev:
        // MODULE_NOT_FOUND for ./instrumentation-node at runtime).
        // Turbopack may still avoid tracing this into Edge when guarded by NEXT_RUNTIME.
        const { registerNodejs } = await __turbopack_context__.A("[project]/src/instrumentation-node.ts [instrumentation] (ecmascript, async loader)");
        await registerNodejs();
    }
}
}),
];

//# sourceMappingURL=src_instrumentation_ts_07j_8w1._.js.map