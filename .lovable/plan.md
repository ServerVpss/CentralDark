# Atualizar `cerebro/ferramentas-cognitivas-e-comandos.md` com a realidade

Editar a página existente pra refletir o que **realmente** existe no Lovable hoje, sem abstração.

## O que muda

### 1. Nova seção: "Tabela de Equivalência (Realidade Atual)"

Inserida logo após "As 3 Ferramentas Ativas". Formato:

| Nome Conceitual | Nome Real no Lovable | Status | Uso prático no dia a dia |
|---|---|---|---|
| `browse_page` | `fetch_website` (web pública) + `mcp_notion_ODQJf--notion-fetch` (Notion privado) | ✅ Ativa | Ler link público, página de GitHub, doc do Notion conectado |
| `code_execution` | `code--exec` (Python/bash no sandbox) | ✅ Ativa | Rodar script, contar/comparar arquivos em massa, processar CSV, gerar relatório |
| `conversation_search` | `chat_search--search_chat_history` + `chat_search--recall_chat_history` + `chat_search--read_chat_messages` | ⚠️ Parcial | Busca só no histórico **deste projeto** no Lovable. Não vê chats de outros Hubs (Claude Desktop, ChatGPT) |

Logo abaixo da tabela, nota curta explicando:
- Mega Painel privado (área logada) → ❌ não acessível por enquanto, precisaria conector dedicado
- Em outros Hubs (Claude Desktop/Code, ChatGPT) os nomes reais mudam — a coluna "Nome Real" vale só pro Lovable

### 2. Nova seção: "Como usar no dia a dia"

Lista de frases em PT-BR natural que disparam cada ferramenta, sem precisar do nome técnico:

**Pra ler conteúdo externo (browse):**
- "Lê essa página aqui: <link>"
- "Dá uma olhada nesse repositório do GitHub"
- "Abre a página X do Notion e me resume"

**Pra rodar análise/script (code exec):**
- "Roda um script pra contar quantos arquivos têm X"
- "Compara esses dois arquivos pra mim"
- "Processa esse CSV e me dá um resumo"
- "Faz uma auditoria em massa nos arquivos da pasta Y"

**Pra buscar no histórico (conversation search):**
- "O que a gente tinha decidido sobre Z?"
- "Procura no nosso histórico quando falamos de W"
- "Lembra daquela conversa sobre…"

### 3. Atualizar a seção "Regra de Ouro"

Trocar os nomes conceituais pelos reais entre parênteses, mantendo a regra:
- Antes de pedir cópia de texto → `fetch_website` / Notion fetch
- Antes de dizer "não lembro" → `chat_search`
- Antes de abrir 20+ arquivos → `code--exec` com script

## O que NÃO muda

- Estrutura geral da página (seções existentes preservadas)
- Seção "Comandos Principais" (gatilhos RELOAD V3 etc. — já atualizada)
- Seção "Melhoria Contínua" (fica aberta pra futuras adições)
- Nenhum outro arquivo é tocado (sem mexer em `.claude/`, `mem://`, código, edge functions)

## Resultado

Página vira referência honesta: o usuário e qualquer IA externa abrindo o repo veem na hora **o nome real**, **o status real** e **como acionar em português** — sem precisar adivinhar.
