# COMANDO - 24-monitoring-usage.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\24-monitoring-usage.md
**SHA:** b5554e14481b025d
**Timestamp:** 2026-08-28T02:52:41.722144
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- | `OTEL_LOG_USER_PROMPTS` | `0` | Content gate: prompt text on `grok_code.user_prompt` (60 KB cap, secret-scrubbed). |
- | `OTEL_LOG_TOOL_DETAILS` | `0` | Content gate: tool parameters (4 KB cap), full file paths, verbatim MCP/skill/plugin names. Bash command text is **never** exported in v1, even with this gate. |

### Ouro Bruto (primeiros 5000 chars)
```
# Monitoring Usage (External OpenTelemetry)

> **Status: alpha.** The schema below is versioned (`grok_code.schema.version = v1`);
> additive changes may occur without notice, renames/removals will bump the
> version and be called out in the changelog.

Grok CLI can export usage **metrics** and **events** to your organization's
own OpenTelemetry collector, so platform teams can monitor adoption, token
consumption, tool-permission decisions, and errors across the fleet — without
any data flowing through SpaceXAI.

## Related settings

These knobs are independent of each other (and of this guide's external OTEL stream):

| Setting | How to set it |
|---------|---------------|
| Telemetry master switch | `[features] telemetry` / `GROK_TELEMETRY_ENABLED` |
| Coding data, retention, and training | Settings — `/privacy` opens the row |
| Trace upload | `[telemetry] trace_upload` / `GROK_TELEMETRY_TRACE_UPLOAD` |
| External OpenTelemetry | `GROK_EXTERNAL_OTEL` / `[telemetry] otel_*` (this guide) |

See also [Authentication](02-authentication.md#related-settings) and
[Configuration](05-configuration.md#telemetry).

## External OTEL stream

The external stream is:

- **Off by default**, and requires a *double opt-in* (a master switch **and**
  an explicit exporter selection).
- **Content-free by default**: no prompts, no code, no file paths (extension
  only), no tool arguments, no bash commands, and MCP/skill/plugin names
  collapsed to categories. Optional content gates re-enable some of these.
- **Structurally separate** from SpaceXAI-internal telemetry: its exporters carry
  only the headers you configure, never SpaceXAI credentials.
- **Independent of SpaceXAI data-retention opt-outs**: it works even when
  `telemetry` is disabled and for ZDR (zero-data-retention) teams. Those
  settings govern SpaceXAI-side retention; the external stream is governed solely
  by your own OTEL configuration.

## Quick start

```bash
export GROK_EXTERNAL_OTEL=1                  # master switch
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf  # or grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.corp.example:4318
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <collector-token>"
grok
```

`GROK_EXTERNAL_OTEL=1` alone enables **nothing** — you must also select at
least one exporter. Conversely, the `OTEL_*` vars alone enable nothing
without the master switch.

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `GROK_EXTERNAL_OTEL` | `0` | Master switch. Distinct from `GROK_TELEMETRY_ENABLED`, which controls SpaceXAI-internal product analytics — the two govern opposite-pointing data flows. |
| `OTEL_METRICS_EXPORTER` | `none` | `otlp` \| `console` \| `none`. |
| `OTEL_LOGS_EXPORTER` | `none` | `otlp` \| `console` \| `none`. Gates the event stream. |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` | `http/protobuf` \| `grpc`. Base protocol for both signals. |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL` / `..._METRICS_PROTOCOL` | — | Per-signal protocol overrides (same values as the base protocol). Unrecognized values disable the stream. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` for HTTP, `http://localhost:4317` for gRPC | Base endpoint. For `http/protobuf`, `/v1/logs` and `/v1/metrics` are appended per the OTLP spec; for `grpc`, the collector endpoint is used as-is. Path appending uses **that signal’s** protocol. |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` / `..._METRICS_ENDPOINT` | — | Signal-specific overrides, used verbatim. For gRPC these should normally be collector endpoints without `/v1/...` paths. |
| `OTEL_EXPORTER_OTLP_HEADERS` (+ signal-specific variants) | — | Collector auth (`k=v,k2=v2`). The **only** headers the external exporters send, and the only supported collector-auth mechanism (no config-file headers key — tokens never live on disk). |
| `OTEL_EXPORTER_OTLP_CERTIFICATE` (+ signal-specific variants) | — | Path to a PEM bundle with additional trusted CA certificate(s) for verifying the collector — for collectors behind a private/corporate CA. Additive to the default trust roots (system store and embedded Mozilla roots). Also settable via `[telemetry] otel_certificate`. |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CLIENT_KEY` (+ signal-specific `…_LOGS_…` / `…_METRICS_…` variants) | — | PEM **paths** for mTLS client identity. Both cert and key must be set (base or same signal); half-config is ignored with a warning. Unencrypted PEM keys only. Also settable via `[telemetry] otel_client_certificate` / `otel_client_key`. |
| `OTEL_EXPORTER_OTLP_TIMEOUT` | `10000` (ms) | Export timeout. |
| `OTEL_METRIC_EXPORT_INTERVAL` | `60000` (ms) | Metric export interval. |
| `OTEL_BLRP_SCHEDULE_DELAY` (or alias `OTEL_LOGS_EXPORT_INTERVAL`) | `5000` (ms) | Log batch interval. |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | `delta` | `delta` \| `cumulative`. |
| `OTEL_METRICS_INCLUDE_SESSI
```