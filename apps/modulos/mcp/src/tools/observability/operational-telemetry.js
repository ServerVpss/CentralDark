import { z } from "zod";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { appendCentralEvent } from "../../log-funnel.js";
import { getOperationalSnapshot } from "../../operational-telemetry.js";

function json(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export const operationalTelemetryTools = [
  // PULSE_CANONICAL_OWNER — MCP OAuth admin recebe evento, Trigger Fabric decide.
  {
    name: "centraldark_casa_pulse",
    description: "Pulso privado Casa→Tailscale→MCP→Trigger Fabric→Hermes; apenas eventos tipados preautorizados, dedupe persistente e recibo.",
    annotations: {
      readOnlyHint: false, destructiveHint: true, idempotentHint: true,
      openWorldHint: false, title: "Pulso Casa / Trigger Fabric",
    },
    inputSchema: z.object({
      event_type: z.enum(["CASA_VSCODE_FAILURE", "CASA_SCHEDULED_JOB_FAILURE", "CASA_GIT_DRIFT"]),
      event_id: z.string().regex(/^[A-Za-z0-9_-]{12,96}$/),
      occurred_at: z.string().datetime({ offset: true }),
    }).strict(),
    handler: async (input, ctx) => {
      const scopes = new Set(String(ctx?.oauthScope || "").split(/\s+/).filter(Boolean));
      if (ctx?.admin !== true || !scopes.has("admin") || !ctx?.correlationId)
        return json({ ok: false, status: "ADMIN_OAUTH_REQUIRED", dispatched: false });
      try {
        const root = process.env.CENTRALDARK_ROOT || "/root/CentralDark";
        const url = pathToFileURL(join(root, "scripts/trigger-fabric/workflow-family-dispatcher.mjs")).href;
        const { dispatchCasaPulse } = await import(url);
        if (typeof dispatchCasaPulse !== "function")
          return json({ ok: false, status: "ROUTER_VERSION_NOT_INSTALLED", dispatched: false });
        const receipt = await dispatchCasaPulse({ ...input, source: "CASA" });
        appendCentralEvent({
          sector: "casa", service: "trigger-fabric", actor: "hermes",
          source: "mcp:authenticated-casa-pulse", kind: "casa_pulse",
          level: receipt.state === "BLOCKED" ? "warn" : "info",
          key: receipt.event_id_hash, message: receipt.state,
          data: { event_type: receipt.event_type, family: receipt.family,
            capability: receipt.capability, route_state: receipt.route_state || "UNKNOWN" },
        });
        return json({ ok: true, ...receipt, execution_proven: false });
      } catch (error) {
        return json({ ok: false, status: "PULSE_REJECTED_OR_UNAVAILABLE",
          reason: String(error?.message || error).slice(0, 120), dispatched: false });
      }
    },
  },

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
