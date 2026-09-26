---
name: openai-web-search
description: Search the web using GPT-5.2 and OpenAI's Responses API with web_search tool. Use when the user wants to fetch real-time information from the internet via terminal/CLI using OpenAI's API.
allowed-tools: Bash, Read, Write
---

# GPT-5.2 Web Search via Terminal

This skill enables web search using OpenAI's GPT-5.2 model through the Responses API.

## Prerequisites

The user must have `OPENAI_API_KEY` set as an environment variable.

### Setting the API Key

**Windows (PowerShell)**
```powershell
setx OPENAI_API_KEY "your-key-here"
```

**macOS / Linux**
```bash
export OPENAI_API_KEY="your-key-here"
```

## Basic Web Search (curl)

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.2",
    "tools": [{"type": "web_search"}],
    "input": "YOUR_QUERY_HERE"
  }'
```

## Search with Domain Filtering + Sources

Limit to specific domains (up to 100) and get full source list:

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.2",
    "reasoning": { "effort": "low" },
    "tools": [{
      "type": "web_search",
      "filters": {
        "allowed_domains": ["wikipedia.org", "reuters.com", "apnews.com"]
      }
    }],
    "include": ["web_search_call.action.sources"],
    "input": "YOUR_QUERY_HERE"
  }'
```

## Streaming Output

See results as they arrive:

```bash
curl -N "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.2",
    "tools": [{"type": "web_search"}],
    "input": "YOUR_QUERY_HERE",
    "stream": true
  }'
```

## Extracting Data with jq

**Get only the text output:**
```bash
curl ... | jq -r '.output_text'
```

**Get sources/URLs:**
```bash
curl ... | jq '.output[] | select(.type == "web_search_call") | .action.sources'
```

## Instructions for Claude

When the user asks to search the web using GPT/OpenAI:

**ALWAYS use this exact script - no modifications:**

```bash
bash ~/.claude/skills/openai-web-search/gpt-search.sh "YOUR_QUERY_HERE"
```

Replace YOUR_QUERY_HERE with the user's actual query.

**NEVER:**
- Use Python
- Write inline curl commands
- Modify the script syntax

The script handles all JSON parsing and error handling automatically.

## References

- [Web search guide](https://platform.openai.com/docs/guides/tools-web-search)
- [API Reference](https://platform.openai.com/docs/api-reference/introduction)
- [Streaming events](https://platform.openai.com/docs/api-reference/responses-streaming)
