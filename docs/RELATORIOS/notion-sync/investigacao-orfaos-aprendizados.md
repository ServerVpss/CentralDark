# 🔍 Investigação — 20 Órfãos de Aprendizados

**Data:** 2026-06-25
**Origem:** Saída do `cleanup-orphans.mjs` em modo dry-run.

## Conclusão

**Todos os 20 órfãos são duplicatas reais com formato antigo de título.** Eles podem ser arquivados com segurança.

### Causa raiz

- O setup inicial criou as páginas no Notion com título resumido (ex: `#237 GitHub CLI gh deve ser opcional...`).
- O parser novo do `sync.mjs` gera no formato canônico `#N — Título completo do Git` (com em-dash).
- Como o UPSERT busca por título exato, ele não encontrou a página antiga e criou uma nova → ficaram 2 páginas pro mesmo `#N`.
- A nova (canônica) é mantida; a antiga vira órfã.

## Tabela de comparação

| #ID | Título no Notion (órfão) | Título no Git (canônico, mantido) |
|---:|---|---|
| 235 | Workflows self-hosted: preferir actions oficiais ao gh CLI | Workflows self-hosted não devem depender do CLI gh instalado na VPS |
| 236 | Billing Guard: PR draft automático para migrar workflow ao self-hosted | Billing Guard pode abrir PR draft automático para migrar workflow ao self-hosted |
| 237 | GitHub CLI gh deve ser opcional no Vigia e nos bots | GitHub CLI gh deve ser opcional no Vigia e nos bots |
| 238 | Builder Bolt usa streamable-http temporário pro MCP | Builder Bolt usa streamable-http temporário para MCP CentralDark |
| 239 | Testes locais do MCP devem usar MCP_STATE_FILE temporário | Validação local do OAuth MCP deve usar MCP_STATE_FILE temporário |
| 240 | MCP: nunca calcular roots a partir de process.cwd() | MCP vps_list_dir_safe — mcpRepo root calculado errado quando cwd != apps/mcp |
| 241 | Scripts de validação VPS não devem fechar terminal com exit 127 | Scripts de validação VPS não devem derrubar terminal com exit 127 |
| 242 | Builder Bolt: TLS público OK, problema está dentro do container | Diagnóstico TLS do Builder Bolt aponta certificado público OK e container parado |
| 243 | Builder Bolt container real é CentralDark-Bolt em apps/Bolt/ | Builder Bolt container real chama CentralDark-Bolt e compose ativo fica em apps/ |
| 244 | Builder Bolt: Debian 12 sem ca-certificates quebra TLS no workerd | Builder Bolt Debian 12 sem ca-certificates quebra TLS no workerd |
| 245 | Comandos Gatilhos oficiais na Porta de Entrada | Comandos Gatilhos oficiais adicionados à Porta de Entrada |
| 246 | Comandos Gatilhos refinados no 00-LEIA-PRIMEIRO.md | Seção Comandos Gatilhos refinada no 00-LEIA-PRIMEIRO.md |
| 247 | Comandos Gatilhos organizados em 3 categorias | Comandos Gatilhos organizados por categoria no 00-LEIA-PRIMEIRO.md |
| 248 | Comandos Gatilhos: Verificação de Registro no Notion e GitHub | Comandos Gatilhos incluem Verificação de Registro no Notion e GitHub |
| 249 | Guardião — modo 'propor' obrigatório até 08/07/2026 | Guardião da Consciência — modo "propor" obrigatório por 10 dias (Regra Oficial) |
| 250 | Gestão de Secrets com Autorização Prévia | Regra Oficial — Gestão de Secrets com Autorização Prévia |
| 251 | Hierarquia de Memória — docs/CONSCIENCIA/ é fonte da verdade | Regra Oficial — Hierarquia de Memória (docs/CONSCIENCIA/ é a fonte da verdade) |
| 252 | notify-telegram exige header x-notify-key, não Bearer | notify-telegram exige header x-notify-key, não Authorization Bearer |
| 253 | MCP OAuth deve aceitar client_id CIMD com query string | MCP OAuth: aceitar client_id CIMD com query string (conector ChatGPT) |
| 254 | mcp.centralldark.com DNS-only exige cert Let's Encrypt explícito | mcp.centralldark.com em DNS-only usa cert Let's Encrypt explícito, não CF-Origin |

## Correção aplicada

O `cleanup-orphans.mjs` ganhou **dedup por ID** para a base `aprendizados`:

- Lista todas as páginas e extrai o `#N` do início do título.
- Agrupa por ID. Se um ID tem mais de uma página, mantém a que bate exato com o título canônico do Git e marca as outras como órfãs.
- Páginas sem `#N` no título ou com `#N` que não existe no Git também são órfãs.

Assim, mesmo que alguém renomeie um aprendizado no Git, o próximo `confirm-delete` arquiva automaticamente a página com título antigo sem precisar de regex manual.

## Próximo passo

Rodar o cleanup `confirm-delete` apenas para `regras,pendencias,decisoes` (36 itens) e numa segunda execução também `aprendizados` (mais 20).
