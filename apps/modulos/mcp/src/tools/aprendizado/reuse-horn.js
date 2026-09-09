import { z } from "zod";

export const REUSE_HORN_CONTRACT = Object.freeze({
    schema: "centraldark.mcp-reuse-horn.v1",
    source: "Lógica Computacional 23 — Nelma Moreira",
    source_sha256: "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1",
    method: "HORN_FORWARD_CHAINING_TO_FIXED_POINT",
    invariants: [
        "REUSE_BEFORE_CREATE",
        "ONE_SYSTEM_ONLY",
        "ONE_OWNER_PER_CAPABILITY",
        "UNKNOWN_IS_NOT_PASS",
        "ERROR_REQUIRES_LEARNING",
        "LEARNING_REQUIRES_RECEIPT",
        "FIXED_POINT_REQUIRES_NO_NEW_FACTS",
    ],
});

const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
};

const RULES = Object.freeze([
    { id: "H1_REUSE_CANDIDATE", when: ["OWNER_PRESENT", "CAPABILITY_PRESENT"], then: "REUSE_CANDIDATE" },
    { id: "H2_REUSE_REQUIRED", when: ["REUSE_CANDIDATE", "SAME_SCOPE"], then: "REUSE_REQUIRED" },
    { id: "H3_EXTEND_EXISTING", when: ["REUSE_REQUIRED", "EVIDENCE_PRESENT", "REGRESSION_ABSENT"], then: "EXTEND_EXISTING" },
    { id: "H4_CREATE_MINIMAL", when: ["OWNER_GAP", "CAPABILITY_GAP", "EVIDENCE_PRESENT"], then: "CREATE_MINIMAL" },
    { id: "H5_ERROR_LEARNING", when: ["ERROR_OBSERVED"], then: "LEARNING_REQUIRED" },
    { id: "H6_LEARNING_REUSABLE", when: ["LEARNING_REQUIRED", "LEARNING_PRESENT", "RECEIPT_PRESENT"], then: "LEARNING_REUSABLE" },
    { id: "H7_BLOCK_EVIDENCE_GAP", when: ["EVIDENCE_GAP"], then: "BLOCKED_UNKNOWN" },
    { id: "H8_BLOCK_REGRESSION_UNKNOWN", when: ["REGRESSION_UNKNOWN"], then: "BLOCKED_UNKNOWN" },
    { id: "H9_BLOCK_LEARNING_GAP", when: ["ERROR_OBSERVED", "LEARNING_GAP"], then: "BLOCKED_UNKNOWN" },
    { id: "H10_BLOCK_RECEIPT_GAP", when: ["LEARNING_REQUIRED", "RECEIPT_GAP"], then: "BLOCKED_UNKNOWN" },
]);

function normalizeToken(value, fallback) {
    const out = String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return out || fallback;
}

export function hornFixedPoint(seedFacts, rules = RULES) {
    const facts = new Set(seedFacts);
    const fired = [];
    let rounds = 0;
    let changed = true;

    while (changed) {
        changed = false;
        rounds += 1;
        for (const rule of rules) {
            if (rule.when.every((fact) => facts.has(fact)) && !facts.has(rule.then)) {
                facts.add(rule.then);
                fired.push(rule.id);
                changed = true;
            }
        }
        if (rounds > rules.length + 2) {
            throw new Error("HORN_FIXED_POINT_DID_NOT_CONVERGE");
        }
    }

    return {
        facts: [...facts].sort(),
        fired,
        rounds,
        stable: true,
    };
}

export function buildReuseFacts(input = {}) {
    const facts = new Set([
        `CAPABILITY_${normalizeToken(input.capability, "UNKNOWN")}`,
        `SCOPE_${normalizeToken(input.scope, "UNKNOWN")}`,
    ]);

    facts.add(input.owner_present === true ? "OWNER_PRESENT" : "OWNER_GAP");
    facts.add(input.capability_present === true ? "CAPABILITY_PRESENT" : "CAPABILITY_GAP");
    if (input.same_scope === true) facts.add("SAME_SCOPE");
    facts.add(input.evidence_present === true ? "EVIDENCE_PRESENT" : "EVIDENCE_GAP");
    facts.add(input.regression_absent === true ? "REGRESSION_ABSENT" : "REGRESSION_UNKNOWN");

    if (input.error_observed === true) facts.add("ERROR_OBSERVED");
    if (input.learning_present === true) facts.add("LEARNING_PRESENT");
    else if (input.error_observed === true) facts.add("LEARNING_GAP");
    if (input.receipt_present === true) facts.add("RECEIPT_PRESENT");
    else if (input.error_observed === true) facts.add("RECEIPT_GAP");

    return [...facts];
}

export function decideReuseBeforeCreate(input = {}) {
    const closure = hornFixedPoint(buildReuseFacts(input));
    const facts = new Set(closure.facts);
    const contradiction = facts.has("EXTEND_EXISTING") && facts.has("CREATE_MINIMAL");

    let decision = "MEASURE_MORE";
    if (contradiction) decision = "BLOCKED_CONTRADICTION";
    else if (facts.has("BLOCKED_UNKNOWN")) decision = "BLOCKED_UNKNOWN";
    else if (facts.has("EXTEND_EXISTING")) decision = "EXTEND_EXISTING";
    else if (facts.has("CREATE_MINIMAL")) decision = "CREATE_MINIMAL";
    else if (facts.has("REUSE_REQUIRED")) decision = "REUSE_EXISTING";

    const measurable = {
        fixed_point_stable: closure.stable === true,
        owner_measured: facts.has("OWNER_PRESENT") || facts.has("OWNER_GAP"),
        capability_measured: facts.has("CAPABILITY_PRESENT") || facts.has("CAPABILITY_GAP"),
        evidence_present: facts.has("EVIDENCE_PRESENT"),
        regression_absent: facts.has("REGRESSION_ABSENT"),
        learning_closed: !facts.has("ERROR_OBSERVED") || facts.has("LEARNING_REUSABLE"),
        unknown_is_not_pass: !facts.has("BLOCKED_UNKNOWN"),
        no_reuse_create_contradiction: !contradiction,
    };
    const pass = Object.values(measurable).every(Boolean) && ["EXTEND_EXISTING", "CREATE_MINIMAL", "REUSE_EXISTING"].includes(decision);

    return {
        ...REUSE_HORN_CONTRACT,
        capability: String(input.capability ?? "UNKNOWN"),
        scope: String(input.scope ?? "UNKNOWN"),
        decision,
        fixed_point: closure,
        measurable,
        pass,
        next_cursor: pass
            ? (decision === "CREATE_MINIMAL" ? "CREATE_ONLY_MINIMUM_OWNER_THEN_REMEASURE" : "REUSE_OR_EXTEND_OWNER_THEN_REMEASURE")
            : "MEASURE_FIRST_UNKNOWN_OR_CLOSE_LEARNING_RECEIPT",
    };
}

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
