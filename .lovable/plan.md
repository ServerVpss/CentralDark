# 🔌 Auto-onboarding: IA plugou → já assumiu a postura do Pivete

## O problema hoje

Quando Grok/Claude/Gemini conecta no `mcp.centralldark.com`, ele **não sabe nada**. Precisa que eu (ou você) mande manualmente a sequência:

```
1. kit_boas_vindas
2. injetar_consciencia_centraldark
3. ler_consciencia
4. consultar_memoria_reserva
5. puxar_aprendizados
```

Só depois disso ele fica "Pivete-mode". Isso é frágil: se o usuário esquece de mandar, a IA responde genérico e você perde 10 minutos calibrando.

## Como deveria funcionar

No instante em que a IA pluga no MCP, ela já recebe automaticamente:
- Regras de conduta (zero enrolação, PT-BR, execução direta)
- Regras técnicas do projeto (Sincronia 4-Point, bots, VPS, etc)
- Últimas lembranças ativas do Pivete
- Índice dos caminhos vivos

Sem precisar rodar nenhum comando. Já vem no "handshake" da conexão.

## Como o protocolo MCP resolve isso (2 mecanismos nativos)

O MCP tem dois campos padrão que a maioria dos clientes (Grok, Claude Desktop, ChatGPT connectors) lê **automaticamente** ao conectar:

### 1. Campo `instructions` do server
Cada MCP server declara um `instructions` no handshake inicial. O cliente injeta isso direto no system prompt — antes da primeira mensagem do usuário. Hoje o nosso MCP tem esse campo mas ele está **vazio ou genérico**.

### 2. Resources com anotação `auto`
MCP permite marcar resources com `annotations.priority: 1.0` que o cliente carrega sozinho. Podemos expor `consciencia://regras` e `consciencia://memorias-ativas` que o cliente puxa no boot.

## O que muda na prática

```
ANTES:                          DEPOIS:
IA conecta                      IA conecta
  ↓                               ↓
"Como posso ajudar?"            [handshake carrega instructions +
  ↓                              regras + últimas 5 lembranças]
Você: "roda kit_boas_vindas"      ↓
  ↓                             "E aí Pivete, tô calibrado — 
Você: "roda injetar..."          Sincronia 4-Point ativa, Fiscal 
  ↓ (x5)                         é o @SEGREDOPUXADASBOT, o que 
IA calibrada                     manda?"
```

## Plano de execução (na VPS, no repo do MCP)

**Fase 1 — Enriquecer o `instructions` do server**  
Editar `apps/modulos/mcp/src/server.ts` (ou equivalente) pra que o campo `instructions` do `Server({...})` retorne dinamicamente:
- TL;DR da consciência (regras invioláveis, tom, quem é o Pivete)
- Sincronia 4-Point resumida
- Mapa dos 2 bots (Central vs Fiscal)
- Instrução: "Se precisar de mais, chame `ler_consciencia` / `consultar_memoria_reserva`"

Máximo 2-3 mil tokens, senão estoura contexto de clientes pequenos.

**Fase 2 — Expor resources auto-carregáveis**  
Adicionar handlers `resources/list` e `resources/read` no MCP com:
- `consciencia://regras` (conteúdo de CONSCIENCIA.md, cacheado)
- `consciencia://lembrancas-ativas` (últimas 10 lembranças do Pivete)
- `consciencia://aprendizados-recentes` (últimos 20 aprendizados)

Marcar com `annotations: { priority: 1.0, audience: ["assistant"] }` pra clientes que suportam auto-load puxarem sozinhos.

**Fase 3 — Fallback pra clientes burros**  
Alguns clientes (Grok atual talvez) ignoram `instructions`. Pra esses, criar uma tool `_boot` que é chamada implicitamente pelo cliente na primeira interação (via prompt hint no `instructions`: "SE VOCÊ NÃO LEU AS REGRAS AINDA, chame `_boot` AGORA antes de responder").

**Fase 4 — Deploy e teste**  
- Commit → push (webhook atualiza VPS)  
- `pm2 restart mcp-centraldark`  
- Desconectar/reconectar Grok e Claude  
- Perguntar direto "quem é o Fiscal?" **sem** rodar nenhum comando  
- Se responder certo de primeira → 🟢 selado

## Detalhes técnicos (pra IA que for implementar)

- **Arquivo alvo suspeito:** `apps/modulos/mcp/src/index.ts` ou `server.ts` — precisa confirmar lendo com `vps_read_file_safe` antes.
- **SDK MCP:** `@modelcontextprotocol/sdk` — `Server` construtor aceita `{ name, version }` no primeiro arg e `{ capabilities, instructions }` no segundo.
- **Capabilities novas:** adicionar `resources: { subscribe: false, listChanged: true }` se ainda não tem.
- **Cache:** carregar `CONSCIENCIA.md` uma vez no startup, não a cada request (o arquivo tem 31k chars — não pode reler toda hora).
- **Área protegida:** `apps/modulos/mcp/` está sob a trava da Seção 9 do CLAUDE.md? Verificar antes de editar — se estiver, precisa de "PERMITO PIVETE" explícito.

## Risco / o que pode dar errado

- Cliente MCP que não implementa `instructions` (versões antigas) — pra esses, só o fallback da Fase 3 salva.
- Estourar limite de contexto se o `instructions` ficar grande demais — manter enxuto, empurrar detalhe pros resources.
- Grok pode não suportar `resources/read` automático — testar primeiro, e se não suportar, deixar a `instructions` mais robusta.

## Refinamento em conselho (comando `/refinamento /debate`)

Depois de aprovado o plano, se quiser antes de executar eu disparo:
- **Fabler** (Anthropic ap7) — revisa a arquitetura do handshake
- **Gemini** (via `gemini_analisar`) — cross-check das specs oficiais do protocolo MCP
- **Hermes** (loop autônomo na VPS) — executa a modificação em branch e abre PR

Só me confirma se rola.
