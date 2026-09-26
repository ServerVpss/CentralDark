---
name: investigating-hermes-internals
description: "Investigate internal flows in Hermes Agent (model selection, request/response flow, tool usage)"
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hermes, investigation, debugging, internal-flows, model-routing]
    related_skills: [systematic-debugging, hermes-agent, plan]
---

# Investigating Hermes Agent Internals

When you need to understand or debug internal flows in Hermes Agent (such as how model selection works, how requests flow from input to response, or how tools are invoked), follow this systematic approach.

## 1. Verify You're in the Correct Repository

Before diving into code, confirm you're examining the actual Hermes Agent source code:

- **Correct repository**: https://github.com/NousResearch/hermes-agent
- **Common mistakes**: Searching in forked projects, demo applications, or unrelated repos that contain chat UIs
- **Key indicators of the correct repo**:
  - Presence of `run_agent.py` (main agent loop)
  - Directories: `agent/`, `hermes_cli/`, `tools/`, `gateway/`, `cron/`
  - File: `hermes_cli/commands.py` (slash command registry)

## 2. Key Locations for Investigation

Focus your search on these areas when investigating specific flows:

### Request Entry Points
- `hermes_cli/main.py` → `process_command()` or `chat` command handlers
- Platform adapters in `gateway/platforms/` (for messages from Telegram, Discord, etc.)

### Core Agent Loop
- `run_agent.py` → `run_conversation()` method in `AIAgent` class
- This is where the main interaction loop happens: get input → process → call LLM → handle tool calls → output response

### Model Routing and LLM Interaction
- `agent/llm_router.py` or similar (look for LLM calling logic)
- `agent/model_tools.py` (if exists)
- `agent/prompt_builder.py` (how system prompt is constructed, including model/provider hints)
- Check how the agent selects which model/provider to use based on configuration

### Tool Handling
- `tools/registry.py` - central tool registry
- Individual tool implementations in `tools/` directory
- Note: Core LLM calling is typically NOT implemented as a tool - it's part of the agent loop

### Provider and Credential Logic
- Look in `agent/` directory for provider-specific modules
- Check how credentials are retrieved from the credential pool (`hermes auth`)
- `config.py` - default configuration and environment variable definitions

### Streaming Response Handling
- Search for `stream_text` or similar utilities in `tools/`
- Look for response processing in the tool call handling logic

## 3. Understanding the Typical Request Flow

Here's the standard flow for a user request in Hermes Agent:

1. **Input Reception**: User input received via CLI (`hermes chat`) or gateway platform adapter
2. **Processing**: Input processed through `run_agent.py`'s `run_conversation()` method
3. **LLM Invocation**: 
   - Agent constructs appropriate prompt with system message, tools, and conversation history
   - LLM is called with relevant tools/schemas based on configuration
4. **Tool Call Handling** (if needed):
   - If LLM returns `tool_calls`, they are dispatched via `handle_function_call()` (typically in `agent/` or `model_tools.py`)
   - Tool results are collected and fed back to the LLM
   - This may iterate multiple times for complex tool chains
5. **Response Generation**:
   - Final text response from LLM is processed
   - For streaming responses: intermediate chunks are handled and displayed incrementally
6. **Output Delivery**: Response sent back to user via CLI or gateway platform

## 4. Recommended Search Strategy

Follow this sequence when investigating:

1. **Start with Commands**: Examine `hermes_cli/commands.py` to understand how `/chat` or `hermes chat` commands work and where they delegate
2. **Follow to Main Agent**: Trace from command handlers to `run_agent.py` and the main conversation loop
3. **Find Model Selection Logic**: Look for where the agent determines which model/provider to use (check prompt builder and config)
4. **Examine Tool Registry**: Review `tools/registry.py` to understand how tools are registered and dispatched
5. **Trace Credential Flow**: Follow how API keys/OAuth tokens are retrieved from the credential pool
6. **Check Streaming Implementation**: If investigating streaming, look for response handlers that process incremental chunks

## 5. Key Files to Examine

| File | Purpose |
|------|---------|
| `hermes_cli/main.py` | CLI entry point and command routing |
| `run_agent.py` | Main agent AIAgent class and conversation loop |
| `agent/prompt_builder.py` | How system prompt is constructed (includes model/provider hints) |
| `agent/llm_router.py` or similar | Actual LLM calling and response handling |
| `tools/code_execution_tool.py` | Example of how tools are structured (contrast with core LLM) |
| `hermes_cli/commands.py` | Slash commands like `/model`, `/reasoning`, etc. |
| `config.py` | Default configuration and environment variable definitions |
| `tools/registry.py` | Central tool registry and dispatch mechanism |

## 6. Workflow Tips

- **Verify Changes Need Restart**: Remember that tool/skill/config changes often require a session reset (`/reset`) or full restart to take effect
- **Check Platform Specifics**: Gateway platforms (Telegram, Discord, etc.) may have their own preprocessing before reaching the core agent
- **Streaming vs Non-Streaming**: Be aware that response handling differs between streaming and non-streaming modes
- **Credential Pools**: Understand that API keys are managed in pools and rotated automatically - issues may relate to exhaustion or configuration
- **Model Aliases**: Remember that users can refer to models by friendly aliases that get mapped to actual provider/model IDs

## 7. Common Investigation Patterns

### For Model Selection Issues:
1. Check `hermes model` command implementation in `hermes_cli/commands.py`
2. Examine how `currentModel` is stored and retrieved (often in session state or config)
3. Look at provider fallback logic in the LLM router
4. Verify credential availability for the selected provider

### For Tool Call Failures:
1. Verify the tool is enabled for the current platform via `hermes tools`
2. Check the tool's `check_requirements()` function in its implementation file
3. Ensure required environment variables are set
4. Examine the tool's schema and handler function

### For Response/Streaming Problems:
1. Trace where the LLM response is processed in the agent loop
2. For streaming, check how chunks are accumulated and delivered
3. Look at how reasoning content is extracted and displayed separately
4. Verify tool call results are properly re-injected into the conversation

## 8. Validation Approach

When making changes or testing hypotheses:

1. **Isolate Variables**: Change one thing at a time and test
2. **Use Controlled Inputs**: Use simple, repeatable test cases
3. **Check Logs**: Examine both agent logs and platform-specific logs
4. **Verify Restart Requirements**: Confirm whether changes need a full restart or just `/reset`
5. **Test Across Platforms**: If relevant, test behavior differences between CLI, Telegram, Discord, etc.

This approach will help you systematically understand and debug any aspect of Hermes Agent's internal behavior.