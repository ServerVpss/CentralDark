# Investigation Log: Hermes Agent Internal Flows

## Session Overview
Attempted to locate and analyze Hermes Agent internal flow components:
- api.chat.ts
- stream-text.ts  
- LLMManager
- extractPropertiesFromMessage
- Related model selection and calling flow mechanisms

## Repository Analysis
The repository at `/e/CentralDark/Pivete/CentralDark` was found to be **not** the Hermes Agent codebase. Evidence:
- Contains chat UI application (`script.js`) connecting to external API: `https://unlimited-ai-proxy.sportsmoments97.workers.dev/api/chat`
- Project structure includes apps/modulos/, src/apps/modulos/, etc.
- Contains WhatsApp, CRM, financeiro, hermes-panel modules but not Hermes Agent core
- No `run_agent.py`, `agent/`, `hermes_cli/`, `tools/`, `gateway/`, `cron/` directories
- No Hermes Agent specific files or structure found

## Search Results
Extensive searches yielded no matches for:
- LLMManager, streamText, extractPropertiesFromMessage
- api.chat.ts, stream-text.ts files
- PROVIDER_COMPLETION_LIMITS, MAX_TOKENS, isReasoningModel patterns
- SwitchableStream or stream recovery mechanisms

## Key Findings
1. The repository contains a different application (Unlimited AI chat interface)
2. This application uses an external proxy API (`/api/chat`, `/api/search`, `/api/merge`, `/api/memory`)
3. No internal Hermes Agent LLM routing or model selection logic present
4. The actual Hermes Agent codebase would need to be located separately

## Recommendations for Future Investigation
To investigate Hermes Agent internal flows:
1. Locate the actual Hermes Agent repository (github.com/NousResearch/hermes-agent)
2. Examine these key files:
   - `hermes_cli/main.py` (CLI entry)
   - `run_agent.py` (main agent loop)
   - `agent/prompt_builder.py` (system prompt construction)
   - `agent/llm_router.py` or similar (LLM calling)
   - `tools/registry.py` (tool dispatch)
   - `hermes_cli/commands.py` (slash commands)
3. Follow the request flow: Input → CLI/Gateway → Agent Loop → LLM Call → Tool Handling → Response