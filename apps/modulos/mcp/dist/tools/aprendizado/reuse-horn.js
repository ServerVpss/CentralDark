import { z } from "zod";
import { REUSE_HORN_CONTRACT, REUSE_HORN_RULES, hornFixedPoint, buildReuseFacts, decideReuseBeforeCreate, } from "./reuse-horn-core.js";
export { REUSE_HORN_CONTRACT, REUSE_HORN_RULES, hornFixedPoint, buildReuseFacts, decideReuseBeforeCreate, } from "./reuse-horn-core.js";
const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
};
function textBlock(value) {
    return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}
export const reuseHornTools = [
    {
        name: "resolver_reuse_before_create",
        description: "Horn determinístico para decidir REUSE/EXTEND/CREATE sem opinião. Mede fatos explícitos, propaga até ponto fixo e bloqueia UNKNOWN. Use antes de criar owner, arquitetura, tool, bridge ou capability nova.",
        annotations: { ...READ_ANNOT, title: "Resolver REUSE_BEFORE_CREATE por ponto fixo de Horn" },
        inputSchema: z.object({
            capability: z.string().min(1),
            scope: z.string().min(1),
            owner_present: z.boolean(),
            capability_present: z.boolean(),
            same_scope: z.boolean(),
            evidence_present: z.boolean(),
            regression_absent: z.boolean(),
            error_observed: z.boolean().optional().default(false),
            learning_present: z.boolean().optional().default(false),
            receipt_present: z.boolean().optional().default(false),
        }),
        handler: async (input) => textBlock(decideReuseBeforeCreate(input)),
    },
];
//# sourceMappingURL=reuse-horn.js.map