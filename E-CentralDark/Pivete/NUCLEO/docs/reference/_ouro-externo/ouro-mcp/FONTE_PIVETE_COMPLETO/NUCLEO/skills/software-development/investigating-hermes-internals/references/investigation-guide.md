# Hermes Agent Internal Flow Investigation Guide

When investigating internal flows in Hermes Agent (model selection, request/response handling, tool usage), follow this systematic approach:

## 1. Repository Verification
First, confirm you're in the actual Hermes Agent codebase:
- Correct repo: https://github.com/NousResearch/hermes-agent
- Key indicators: `run_agent.py`, `agent/`, `hermes_cli/`, `tools/`, `gateway/`, `cron/` directories
- Common mistake: Mistaking chat UI applications (like the one found in /e/CentralDark/Pivete/CentralDark) for the actual Hermes Agent

## 2. Key Investigation Areas
Focus on these components when tracing flows:

### Request Entry Points
- `hermes_cli/main.py` - CLI entry and command routing
- Platform adapters in `gateway/platforms/` - messages from Telegram, Discord, etc.

### Core Agent Loop
- `run_agent.py` → `run_conversation()` in `AIAgent` class
- Main interaction loop: input → process → LLM call → tool handling → output response

### Model Routing & LLM Interaction
- `agent/llm_router.py` or similar (LLM calling logic)
- `agent/prompt_builder.py` (system prompt construction with model/provider hints)
- Check configuration for model/provider selection logic

### Tool Handling
- `tools/registry.py` - central tool registry
- Individual tool implementations in `tools/`
- Note: Core LLM calling is typically NOT a tool - it's part of the agent loop

### Provider & Credential Logic
- Look in `agent/` for provider-specific modules
- Check credential retrieval from `hermes auth` pools
- `config.py` - default configuration and environment variables

### Streaming Response Handling
- Search for `stream_text` or similar in `tools/`
- Examine response processing in tool call handling logic

## 3. Typical Request Flow
1. **Input Reception**: Via CLI (`hermes chat`) or gateway platform adapter
2. **Processing**: Through `run_agent.py`'s `run_conversation()` method
3. **LLM Invocation**: Agent constructs prompt with system message, tools, history; calls LLM with appropriate tools/schemas
4. **Tool Call Handling** (if needed): 
   - LLM returns `tool_calls` → dispatched via `handle_function_call()` (in `agent/` or `model_tools.py`)
   - Tool results fed back to LLM (may iterate for complex chains)
5. **Response Generation**: Final text response processed (streaming chunks handled incrementally if applicable)
6. **Output Delivery**: Response sent back to user via CLI or gateway platform

## 4. Investigation Strategy
1. Start with `hermes_cli/commands.py` - understand `/chat` or `hermes chat` commands
2. Trace to `run_agent.py` and main conversation loop
3. Find model selection logic (check prompt builder and config)
4. Examine `tools/registry.py` for tool dispatch mechanism
5. Trace credential flow from credential pool
6. For streaming: look for response handlers processing incremental chunks

## 5. Key Files to Examine
| File | Purpose |
|------|---------|
| `hermes_cli/main.py` | CLI entry point and command routing |
| `run_agent.py` | Main agent AIAgent class and conversation loop |
| `agent/prompt_builder.py` | System prompt construction (includes model/provider hints) |
| `agent/llm_router.py` or similar | Actual LLM calling and response handling |
| `tools/code_execution_tool.py` | Example tool structure (contrast with core LLM) |
| `hermes_cli/commands.py` | Slash commands (`/model`, `/reasoning`, etc.) |
| `config.py` | Default configuration and environment variable definitions |
| `tools/registry.py` | Central tool registry and dispatch mechanism |

## 6. Validation Approach
- Change one variable at a time and test
- Use simple, repeatable test cases
- Check both agent logs and platform-specific logs
- Verify restart requirements (some changes need full restart, others just `/reset`)
- Test across platforms if relevant (CLI vs Telegram vs Discord, etc.)

This approach provides a repeatable method for investigating any aspect of Hermes Agent's internal behavior.