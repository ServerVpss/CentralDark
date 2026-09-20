---
name: Notion - Hub CentralDark • Consolidação
description: IDs da hub Notion e dos 7 databases que servem de memória persistente entre agentes (Import Queue, Decisões, Regras, Agent Logs, Pendências, Histórico, Estrutura).
type: architecture
---

# Notion — CentralDark • Consolidação

Hub raiz no workspace do usuário. Cérebro organizacional do projeto.
Token: `NOTION_API_TOKEN` (secret). MCP do Notion também conectado (namespace `mcp_notion_ODQJf`).

## Hub
- Página: `CentralDark • Consolidação` — `389d08b5-e959-81a1-a446-c2691519a78a`
  https://app.notion.com/p/389d08b5e95981a1a446c2691519a78a

## Databases (data_source_id usado em create-pages/query)
| DB | data_source_id |
|---|---|
| 📥 Import Queue | `cd51c89f-7717-4e0b-824f-3aee3e2da825` |
| ✅ Decisões Tomadas | `66731d2b-4f3d-4a6d-82e3-323d81259b95` |
| 📜 Regras do Projeto | `867966ce-c6bb-4767-af25-e6da4b8eb9f9` |
| 🤖 Agent Logs | `7f3adf39-1af9-4646-bfad-52b87c0923c3` |
| 🔥 Pendências Ativas | `52dcbdf3-f1f2-49dc-8ee7-f26c34bece3e` |
| 📚 Histórico de Consolidação | `33b5f619-ce10-4d0e-a33d-86a5af0cf770` |
| 📂 Estrutura de Pastas & Agentes | `dc233802-1636-4717-a6ed-060b5c5d4505` |

## Regras de uso (obrigatórias)
1. **Antes de toda tarefa grande**, ler `📜 Regras do Projeto` (consulta SQL na data source).
2. **Toda ação relevante** vira linha em `🤖 Agent Logs` (Agente, Ação, Tarefa, Resultado).
3. **Toda decisão oficial** vira linha em `✅ Decisões Tomadas` (com Motivo + Reversível).
4. **Toda fase concluída** vira card em `📚 Histórico de Consolidação` com link do relatório.
5. **Toda pendência** vai pra `🔥 Pendências Ativas` (não deixar em chat só).
6. Sub-agentes spawned via `acp_subagent--spawn_agent` devem ler/escrever no Notion via MCP (não duplicar memória em arquivos soltos).

## API REST (fallback se MCP falhar)
- Endpoint: `https://api.notion.com/v1/...`
- Headers: `Authorization: Bearer $NOTION_API_TOKEN` + `Notion-Version: 2022-06-28`
- Limitação conhecida: API REST não consegue arquivar páginas workspace-level (`{archived: true}` retorna 400). Mover pra subpágina antes ou pedir pro usuário apagar manual.
