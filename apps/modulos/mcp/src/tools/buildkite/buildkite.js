import { z } from "zod";
import { getBuildkiteStatus } from "../../buildkite-integration.js";

const READ_ONLY = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

function ok(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

export const buildkiteTools = [
  {
    name: "buildkite_status",
    description: "Estado observado do setor Buildkite no funil CentralDark: eventos, falhas medidas, intervalo de confiança, latência e conselho de roteamento. Não executa remediação.",
    annotations: { ...READ_ONLY, title: "Buildkite — status observado" },
    inputSchema: z.object({
      since_minutes: z.number().int().min(1).max(10080).optional().default(1440),
      limit: z.number().int().min(1).max(2000).optional().default(1200),
    }).strict(),
    handler: async (input) => ok(getBuildkiteStatus(input)),
  },
  {
    name: "buildkite_capabilities",
    description: "Inventário de capacidades Buildkite realmente observadas pelo funil e fronteiras ainda UNKNOWN. Não confunde recurso listado com recurso ativo.",
    annotations: { ...READ_ONLY, title: "Buildkite — capacidades observadas" },
    inputSchema: z.object({
      since_minutes: z.number().int().min(1).max(10080).optional().default(1440),
    }).strict(),
    handler: async (input) => {
      const status = getBuildkiteStatus(input);
      return ok({
        status: "OK",
        receiver_ready: status.receiver_ready,
        credential_state: {
          webhook_secret_configured: status.webhook_secret_configured,
          api_token_configured: status.api_token_configured,
        },
        observed: status.observed,
        evidence_events: status.events,
        capabilities: [
          { id: "WEBHOOK_SENSOR", state: status.events ? "OBSERVED" : "READY_NOT_OBSERVED" },
          { id: "FAILURE_RATE", state: status.finished_sample ? "MEASURED" : "UNKNOWN_NO_SAMPLE" },
          { id: "HERMES_ROUTING_ADVICE", state: status.hermes.sample ? "MEASURED" : "UNKNOWN_NO_HERMES_SAMPLE" },
          { id: "HOSTED_AGENT_INVENTORY", state: status.observed.agents.length ? "OBSERVED" : "UNKNOWN_UNTIL_EVENT" },
          { id: "REST_API_ENRICHMENT", state: status.api_token_configured ? "CONFIGURED" : "NOT_CONFIGURED" },
        ],
        proof_boundary: status.proof_boundary,
      });
    },
  },
];
