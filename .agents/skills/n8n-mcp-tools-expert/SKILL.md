---
name: n8n-mcp-tools-expert
description: Expert knowledge of n8n MCP tools for workflow automation. Use when building, debugging, or optimizing n8n workflows with MCP integration.
---

# n8n MCP Tools Expert

Expert knowledge for n8n workflow automation with MCP (Model Context Protocol) integration.

## Core Concepts
- **n8n nodes**: Trigger, Action, Transform, Flow Control
- **MCP servers**: Expose tools/resources to LLMs via standardized protocol
- **Credentials**: Secure storage for API keys, tokens, OAuth
- **Workflows**: Directed graph of nodes with data flow

## Key MCP Tools for n8n
- **HTTP Request**: Generic API calls with auth
- **Function/Function Item**: Custom JavaScript/TypeScript logic
- **IF/Switch**: Conditional branching
- **Merge/Item Lists**: Data aggregation
- **Set/Edit Fields**: Data transformation

## MCP Integration Patterns

### 1. n8n as MCP Client
n8n calls external MCP servers via HTTP Request node:
```json
{
  "method": "POST",
  "url": "http://mcp-server:3000/tools/call",
  "headers": { "Content-Type": "application/json" },
  "body": { "tool": "search", "arguments": { "query": "..." } }
}
```

### 2. n8n as MCP Server (via community nodes)
Expose n8n workflows as MCP tools for external LLMs.

## Best Practices
- Store credentials in n8n credential store (encrypted)
- Use environment variables for config, not hardcoded values
- Test workflows with `n8n start --tunnel` for webhook testing
- Enable execution logging for debugging
- Version control workflows (export JSON, commit to git)

## Common Patterns
- **Webhook → Process → Respond**: HTTP webhook trigger
- **Scheduled → Fetch → Transform → Store**: Cron trigger
- **Webhook → AI Agent → Respond**: LLM integration
- **Event → Enrich → Notify**: Multi-step automation

## Debugging
- Use `console.log` in Function nodes (visible in execution log)
- Test individual nodes with "Execute Node"
- Check execution log for data flow
- Use "Pin Data" to freeze test data

## Security
- Never hardcode secrets in workflow JSON
- Use n8n credential types: API Key, OAuth2, Header Auth
- Rotate credentials regularly
- Limit workflow permissions (execute only needed nodes)
