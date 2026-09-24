import { z } from "zod";
import { getOperationalSnapshot } from "../../operational-telemetry.js";
function json(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
export const operationalTelemetryTools = [
    {
        name: "centraldark_operational_snapshot",
        description: "Lê o mesmo snapshot determinístico de heartbeat/logs/forensic usado pelo painel CentralDark. Nunca expõe conteúdo de secrets e nunca declara FIXED_POINT sozinho.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
            title: "Snapshot operacional CentralDark",
        },
        inputSchema: z.object({}),
        handler: async () => json(getOperationalSnapshot()),
    },
];
//# sourceMappingURL=operational-telemetry.js.map
