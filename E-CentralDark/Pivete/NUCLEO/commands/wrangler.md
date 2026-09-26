# COMANDO - wrangler.toml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\packages\ai-gateway\wrangler.toml
**SHA:** a42de4db4a142be9
**Timestamp:** 2026-08-23T14:17:18.977585
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern = "api.screenpi.pe/*", zone_name = "screenpi.pe" },
- { pattern = "api.screenpipe.com", zone_name = "screenpipe.com", custom_domain = true }

### Ouro Bruto (primeiros 5000 chars)
```
#:schema node_modules/wrangler/config-schema.json
name = "ai-proxy"
main = "src/index.ts"
compatibility_date = "2024-10-11"
workers_dev = true
compatibility_flags = ["nodejs_compat"]
upload_source_maps = true
# Production-only policy bindings are managed outside this repository. Preserve
# them when Wrangler deploys the public configuration below.
keep_vars = true

# Custom domain
routes = [
  { pattern = "api.screenpi.pe/*", zone_name = "screenpi.pe" },
  { pattern = "api.screenpipe.com", zone_name = "screenpipe.com", custom_domain = true }
]

tail_consumers = [{service = "ai-gateway-tail"}]

# Workers Logs
# Docs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
# Configuration: https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs
[observability]
enabled = true

# Hourly bounded-state cleanup. The minute offset avoids top-of-hour load.
[triggers]
crons = ["17 * * * *"]

# Automatically place your workloads in an optimal location to minimize latency.
# If you are running back-end logic in a Worker, running it closer to your back-end infrastructure
# rather than the end user may result in better performance.
# Docs: https://developers.cloudflare.com/workers/configuration/smart-placement/#smart-placement
# [placement]
# mode = "smart"

# Variable bindings. These are arbitrary, plaintext strings (similar to environment variables)
# Docs:
# - https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables
# Note: Use secrets to store sensitive data.
# - https://developers.cloudflare.com/workers/configuration/secrets/
[vars]
# add any non-secret environment variables here
# Default Vertex AI region - us-east5 has Claude models
VERTEX_REGION = "us-east5"
# Transcription A/B/C test: temporarily route 100% to Deepgram while
# self-hosted transcription tunnels are unhealthy.
DEEPGRAM_TRAFFIC_PCT = "100"
WHISPER_TRAFFIC_PCT = "0"
PARAKEET_TRAFFIC_PCT = "0"
DUAL_SEND_PCT = "0"
PARAKEET_URL = "https://audio.screenpi.pe"
WHISPER_URL = ""
# Legacy compat
SELF_HOSTED_TRANSCRIPTION_URL = "https://audio.screenpi.pe"

# Interactive chat must stay low-latency, so interactive Gemini uses the STANDARD
# tier, not best-effort flex (flex on the interactive auto lane made chat slow).
# Background traffic still flexes (isFlexEligible returns true for background
# regardless of this flag). Set here (not just dashboard) so it persists as the
# deliberate default across redeploys; FLEX_TIER_ENABLED remains the master switch.
GEMINI_FLEX_INTERACTIVE = "false"

# Hosted AI model policy is public. Operational spend-control values are private
# production bindings and must never be committed to this file.
MODEL_GATING_ENABLED = "true"
PIPE_FRONTIER_POLICY = "reject"

# Hosted-chat AI Gateway rollout is managed in Worker dashboard variables so a
# deploy cannot flip production (keep_vars=true above):
# - HOSTED_CHAT_GATEWAY_MODE: "legacy" (default/rollback) or "cloudflare".
# - CLOUDFLARE_AI_GATEWAY_ID: same-account Gateway with default OpenAI and
#   Anthropic BYOK keys. See CLOUDFLARE_AI_GATEWAY_ROLLOUT.md.
# - CLOUDFLARE_ACCOUNT_ID: account that owns the Gateway and Analytics data.
# - CLOUDFLARE_API_TOKEN: read-only AI Gateway + Account Analytics token used
#   by /v1/usage to calculate per-user allowance percentages. Raw provider
#   amounts are never returned to the client.

# Cost / flex tuning knobs — read with a code default, so they live in the CF
# dashboard (Settings → Variables), not here, and take effect with no redeploy:
# - FLEX_TIER_ENABLED ("true"): master kill switch for the Vertex Gemini flex tier.
# - GEMINI_FLEX_INTERACTIVE ("true"): also flex interactive Gemini, not just
#   background. Set "false" to revert to background-only flex if best-effort
#   latency hurts user-facing chat.
# - ROUTER_MODE ("off"): interactive auto difficulty router. "off" = GPT-5.6 Luna
#   (today's behavior). "heuristic" = regex tiering (0 latency). "embedding" =
#   bge centroid via Workers AI (best accuracy, +1 embed call). See difficulty-router.ts.
# - GPT56_HISTORY_CACHE_MODE ("system"): "system" keeps only the stable
#   instruction/tool prefix cache; "history" also caches Pi chat/Pipe turn
#   boundaries. Switch back to "system" for an immediate cost kill switch.
# - PIPE_FRONTIER_POLICY ("downgrade"): background/pipe traffic on a frontier model
#   (opus/gpt-5.5/*-pro/fable, output>=$20/Mtok) → "downgrade" to PIPE_FRONTIER_FALLBACK
#   (default "auto"), or "reject" with a 403. Pipes shouldn't run frontier models.
# - ROUTER_SAMPLE_PCT ("100"): % of devices in the router arm for A/B (deterministic
#   by device hash). 50 = half ON / half control → measure ON vs control in cost_log
#   via the router_tier column ('control' = baseline arm). 0 = effectively off.

# Secrets (set via `wrangler secret put <NAME>`):
# - VERTEX_SERVICE_ACCOUNT_JSON: GCP service account JSON for Vertex AI
# - VERTEX_PROJECT_ID: Your GCP project ID

# Workers AI — used 
```

---

# COMANDO - wrangler.toml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\packages\ai-gateway\wrangler.toml
**SHA:** a42de4db4a142be90ae4dee5f3d02dbab9289f80f0ed76026f94538e343895c8
**Timestamp:** 2026-08-23T23:44:13.327273
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern = "api.screenpi.pe/*", zone_name = "screenpi.pe" },
- { pattern = "api.screenpipe.com", zone_name = "screenpipe.com", custom_domain = true }

### Ouro Bruto (primeiros 5000 chars)
```
#:schema node_modules/wrangler/config-schema.json
name = "ai-proxy"
main = "src/index.ts"
compatibility_date = "2024-10-11"
workers_dev = true
compatibility_flags = ["nodejs_compat"]
upload_source_maps = true
# Production-only policy bindings are managed outside this repository. Preserve
# them when Wrangler deploys the public configuration below.
keep_vars = true

# Custom domain
routes = [
  { pattern = "api.screenpi.pe/*", zone_name = "screenpi.pe" },
  { pattern = "api.screenpipe.com", zone_name = "screenpipe.com", custom_domain = true }
]

tail_consumers = [{service = "ai-gateway-tail"}]

# Workers Logs
# Docs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
# Configuration: https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs
[observability]
enabled = true

# Hourly bounded-state cleanup. The minute offset avoids top-of-hour load.
[triggers]
crons = ["17 * * * *"]

# Automatically place your workloads in an optimal location to minimize latency.
# If you are running back-end logic in a Worker, running it closer to your back-end infrastructure
# rather than the end user may result in better performance.
# Docs: https://developers.cloudflare.com/workers/configuration/smart-placement/#smart-placement
# [placement]
# mode = "smart"

# Variable bindings. These are arbitrary, plaintext strings (similar to environment variables)
# Docs:
# - https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables
# Note: Use secrets to store sensitive data.
# - https://developers.cloudflare.com/workers/configuration/secrets/
[vars]
# add any non-secret environment variables here
# Default Vertex AI region - us-east5 has Claude models
VERTEX_REGION = "us-east5"
# Transcription A/B/C test: temporarily route 100% to Deepgram while
# self-hosted transcription tunnels are unhealthy.
DEEPGRAM_TRAFFIC_PCT = "100"
WHISPER_TRAFFIC_PCT = "0"
PARAKEET_TRAFFIC_PCT = "0"
DUAL_SEND_PCT = "0"
PARAKEET_URL = "https://audio.screenpi.pe"
WHISPER_URL = ""
# Legacy compat
SELF_HOSTED_TRANSCRIPTION_URL = "https://audio.screenpi.pe"

# Interactive chat must stay low-latency, so interactive Gemini uses the STANDARD
# tier, not best-effort flex (flex on the interactive auto lane made chat slow).
# Background traffic still flexes (isFlexEligible returns true for background
# regardless of this flag). Set here (not just dashboard) so it persists as the
# deliberate default across redeploys; FLEX_TIER_ENABLED remains the master switch.
GEMINI_FLEX_INTERACTIVE = "false"

# Hosted AI model policy is public. Operational spend-control values are private
# production bindings and must never be committed to this file.
MODEL_GATING_ENABLED = "true"
PIPE_FRONTIER_POLICY = "reject"

# Hosted-chat AI Gateway rollout is managed in Worker dashboard variables so a
# deploy cannot flip production (keep_vars=true above):
# - HOSTED_CHAT_GATEWAY_MODE: "legacy" (default/rollback) or "cloudflare".
# - CLOUDFLARE_AI_GATEWAY_ID: same-account Gateway with default OpenAI and
#   Anthropic BYOK keys. See CLOUDFLARE_AI_GATEWAY_ROLLOUT.md.
# - CLOUDFLARE_ACCOUNT_ID: account that owns the Gateway and Analytics data.
# - CLOUDFLARE_API_TOKEN: read-only AI Gateway + Account Analytics token used
#   by /v1/usage to calculate per-user allowance percentages. Raw provider
#   amounts are never returned to the client.

# Cost / flex tuning knobs — read with a code default, so they live in the CF
# dashboard (Settings → Variables), not here, and take effect with no redeploy:
# - FLEX_TIER_ENABLED ("true"): master kill switch for the Vertex Gemini flex tier.
# - GEMINI_FLEX_INTERACTIVE ("true"): also flex interactive Gemini, not just
#   background. Set "false" to revert to background-only flex if best-effort
#   latency hurts user-facing chat.
# - ROUTER_MODE ("off"): interactive auto difficulty router. "off" = GPT-5.6 Luna
#   (today's behavior). "heuristic" = regex tiering (0 latency). "embedding" =
#   bge centroid via Workers AI (best accuracy, +1 embed call). See difficulty-router.ts.
# - GPT56_HISTORY_CACHE_MODE ("system"): "system" keeps only the stable
#   instruction/tool prefix cache; "history" also caches Pi chat/Pipe turn
#   boundaries. Switch back to "system" for an immediate cost kill switch.
# - PIPE_FRONTIER_POLICY ("downgrade"): background/pipe traffic on a frontier model
#   (opus/gpt-5.5/*-pro/fable, output>=$20/Mtok) → "downgrade" to PIPE_FRONTIER_FALLBACK
#   (default "auto"), or "reject" with a 403. Pipes shouldn't run frontier models.
# - ROUTER_SAMPLE_PCT ("100"): % of devices in the router arm for A/B (deterministic
#   by device hash). 50 = half ON / half control → measure ON vs control in cost_log
#   via the router_tier column ('control' = baseline arm). 0 = effectively off.

# Secrets (set via `wrangler secret put <NAME>`):
# - VERTEX_SERVICE_ACCOUNT_JSON: GCP service account JSON for Vertex AI
# - VERTEX_PROJECT_ID: Your GCP project ID

# Workers AI — used 
```