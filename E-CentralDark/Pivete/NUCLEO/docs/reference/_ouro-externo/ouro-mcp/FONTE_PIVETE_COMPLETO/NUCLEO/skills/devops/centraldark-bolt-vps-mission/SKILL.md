---
name: centraldark-bolt-vps-mission
description: Missão canônica CentralDark - inventário, ativação e integração Bolt na VPS com META LUPA formal
version: 1.0.0
author: Hermes Pivete
license: MIT
platforms: [linux, windows]
metadata:
  hermes:
    tags: [centraldark, bolt, vps, inventory, meta-lupa, docker, caddy, gateway]
    related_skills: [meta-lupa, hermes-pivete-local-ops, centraldark-hub-control-plane]
---

# Missão Canônica CentralDark — Bolt + VPS + META LUPA

Esta skill documenta o padrão operacional para retomar, inventariar, ativar e integrar o Bolt/Builder na VPS CentralDark usando META LUPA formal como método de prova.

## Contexto

- **Repositório**: ServerVpss/CentralDark
- **Branch**: feat/bolt-lovable-bridge-2026-07-26
- **Worktree**: `/e/CentralDark/Pivete/worktrees/bolt-lovable-bridge-20260726`
- **Perfil Hermes**: pivete (Casa)
- **Autoridade**: Pivete (decisão final)
- **Método**: META LUPA formal (BEGIN → inventário → hipóteses → evidências → teste contrário → correção mínima → regressão → AUTOLUPA → ponto fixo → FINAL → verify-ledger)

## Fases da Missão (Plano Mestre)

### Fase 0 — Congelar Verdade Atual (Read-Only)
- Versão/runtime Hermes Desktop
- Profile SOL ativo
- Memória, canais, Git local, GitHub, VPS
- Containers, serviços, portas, Bolt/Builder, HUB, gateways, APIs
- Custos, credenciais (sem exposição)
- **Saída**: MAPA_REAL, DRIFTS, DUPLICATAS, LIXO_CANDIDATO, BLOQUEIOS, ZERO ALTERAÇÃO

### Fase 1 — Consolidar Jarvis da Casa
- Aprovar SOUL no profile SOL
- Provar carregamento, ferramentas, modelo, voz, tela, navegador
- Fechar 3 Temperaturas (HOJE/SEMANA/REGRAS)
- Configurar modelo principal + fallbacks
- Provar voz, tela, navegador, recuperação de contexto
- Manter rollback

### Fase 2 — Inventariar Bolt na VPS (FOCO ATUAL)
- Ler estrutura, containers, compose, front, backend, editor, chat, preview, gateway, Git, executor, auth, armazenamento, rotas, deploy, logs
- Entregar: EXISTE_E_FUNCIONA, EXISTE_E_QUEBRADO, EXISTE_E_NAO_LIGADO, FALTA, DUPLICADO, LIXO_COM_PROVA

### Fase 3 — Ligar Preview Real
- Escolher mecanismo (WebContainer, container remoto, iframe)
- Habilitar URL por workspace
- HMR, logs, captura visual
- Teste isolamento, restart, concorrência
- Critério: Pivete pede mudança → preview muda → sem abrir código

### Fase 4 — Loop de Agentes
- Contrato de tarefa, seleção de modelo, leitura projeto, edição, build, interpretação erro, correção, comparação, saída única
- Critério: Erro conhecido → Agente detecta → Corrige → Preview volta → Evidência aparece

### Fase 5 — Publicar e Voltar
- Congelar candidato, testes, Git, deploy, health check, rollback, botão VOLTAR
- Critério: PUBLICAR → Serviço novo saudável → Versão registrada → VOLTAR funciona

### Fase 6 — Ponte Casa ↔ VPS
- Autenticação, contrato, stream de eventos, cancelamento, reconexão, resultado, auditoria, limite de escopo

### Fase 7 — Painel Administrativo Total
- Inventário vivo, nomes humanos, dependências, processos, custos, riscos, histórico, ações permitidas, prova atual

### Fase 8 — HUB e Canais
- Portal web, Desktop, Telegram, voz, WhatsApp, notificações, comandos simples, continuidade

### Fase 9 — Migração Negócios
- Por módulo: INVENTARIAR → IMPORTAR → WORKSPACE → VER AO VIVO → CORRIGIR → APROVAR → PUBLICAR → REGISTRAR

### Fase 9 — Operação Contínua
- Manutenção automática, atualização controlada, custos, capacidade, incidentes, aprendizado, testes permanentes, refinamento do Builder pelo próprio Builder

## Arquitetura Bolt (Mapeamento Atual)

### Stack
- **Framework**: Remix (React 18) + Vite + TypeScript
- **AI SDK**: Vercel AI SDK 4.3 (`ai` + `@ai-sdk/*`)
- **UI**: Radix UI + Tailwind + shadcn/ui patterns
- **Terminal**: xterm.js + xterm-addon-fit + xterm-addon-web-links
- **WebContainer**: `@webcontainer/api` 1.6.1
- **MCP**: `@modelcontextprotocol/sdk` 1.15.0
- **Git**: `isomorphic-git` 1.27.2

### Rotas Principais (apps/modulos/Bolt/source/app/routes/)
| Rota | Função |
|---|---|
| `api.chat.ts` | Chat principal com streaming, MCP, context optimization |
| `api.llmcall.ts` | LLM call direto (streamOutput + generateText) |
| `api.chat.ts` | Rota principal streaming com MCP tools |
| `webcontainer.connect.$id.tsx` | Conexão WebContainer |
| `webcontainer.preview.$id.tsx` | Preview iframe |
| `chat.$id.tsx` | Página de chat por sessão |

### Componentes Chat Principais
- `BaseChat.tsx` — Container principal (forwardRef)
- `Chat.client.tsx` — Client-side wrapper
- `Messages.client.tsx` — Renderização mensagens
- `ChatBox.tsx` — Input + send
- `Artifact.tsx` — Renderização artefatos
- `CodeBlock.tsx` — Blocos de código com highlight
- `MCPTools.tsx` — Ferramentas MCP
- `ModelSelector.tsx` / `APIKeyManager.tsx` — Configuração modelo

### Roteamento de Modelo (Fluxo Real)

```
api.chat.ts / api.llmcall.ts
    ↓
streamText() → extractPropertiesFromMessage()
    ↓
[Model: x] [Provider: y] extraído da mensagem user
    ↓
PROVIDER_LIST.find(p => p.name === currentProvider)
    ↓
LLMManager.getInstance().getStaticModelListFromProvider(provider)
    ↓
Se não achar → getModelListFromProvider() (dynamic fetch)
    ↓
Fallback → primeiro modelo da lista
    ↓
isReasoningModel() → maxCompletionTokens vs maxTokens
    ↓
provider.getModelInstance() → _streamText() / generateText()
```

### Providers Configurados (17 via LLMManager registry)
| Provider | Classe | Suporte Dinâmico |
|---|---|---|
| Anthropic | `AnthropicProvider` | Sim |
| Cerebras | `CerebrasProvider` | Sim |
| Cohere | `CohereProvider` | Sim |
| Deepseek | `DeepseekProvider` | Sim |
| Fireworks | `FireworksProvider` | Sim |
| Google | `GoogleProvider` | Sim |
| Groq | `GroqProvider` | Sim |
| HuggingFace | `HuggingFaceProvider` | Sim |
| LMStudio | `LMStudioProvider` | Sim |
| Mistral | `MistralProvider` | Sim |
| Ollama | `OllamaProvider` | Sim |
| OpenRouter | `OpenRouterProvider` | Sim |
| OpenAILike | `OpenAILikeProvider` | Sim |
| OpenAI | `OpenAIProvider` | Sim |
| Perplexity | `PerplexityProvider` | Sim |
| Together | `TogetherProvider` | Sim |
| XAI | `XAIProvider` | Sim |
| Together | `TogetherProvider` | Sim |
| LMStudio | `LMStudioProvider` | Sim |
| AmazonBedrock | `AmazonBedrockProvider` | Sim |
| Github | `GithubProvider` | Sim |
| Moonshot | `MoonshotProvider` | Sim |
| Z.ai | `ZaiProvider` | Sim |

**DEFAULT_MODEL**: `qwen3-coder-480b`  
**DEFAULT_PROVIDER**: OpenRouter (via LLMManager.getDefaultProvider())

### Constantes Críticas (`constants.ts`)
```typescript
MAX_TOKENS = 128000
PROVIDER_COMPLETION_LIMITS = {
  OpenAI: 4096, Anthropic: 64000, Google: 8192,
  // ... 17 providers
}
isReasoningModel = /^(o1|o3|gpt-5)/i.test(modelName)
MAX_RESPONSE_SEGMENTS = 2
```

## Estado Atual da VPS (2026-07-27)

| Componente | Status | Detalhes |
|---|---|---|
| **Container Builder** | 🟢 Up | `CentralDark-Builder` Up, portas 5174/5175 |
| **Preview HTTP** | 🟢 200 | `http://127.0.0.1:5174` retorna HTML |
| **Caddy/Proxy** | 🔴 Ausente | Nenhum container `caddy` rodando |
| **DNS builder.centralldark.com** | 🔴 404 | Não resolvido / sem proxy |
| **DNS api.centralldark.com** | 🔴 401 | Rota existe mas auth falha |
| **Elite Gateway (Anthropic)** | 🔴 Key morta | `SEGREDO_ELITE_123` revogada |
| **Arsenal Adapter** | 🔴 401 | `api.centralldark.com/v1` 401 |
| **Elite Gateway Local** | 🔴 Porta 8082 | `host.docker.internal:8082` não sobe |
| **Container Builder** | 🟢 Up | Logs mostram Vite dev server rodando |

### Cadeia Quebrada (Ponta a Ponta)
```
Container Bolt (OK) 
    → Porta 5173/5175 exposta (OK) 
    → Caddy/Proxy reverso (FALHA - não existe)
    → DNS builder.centralldark.com (FALHA - 404)
    → Gateway Elite / Arsenal (FALHA - 401/key morta)
    → Modelo via gateway (FALHA)
```

### Rota de Modelo Funcional (Bypass)
O container tem `ANTHROPIC_API_BASE_URL=http://host.docker.internal:8082` e `OPENAI_LIKE_API_BASE_URL=https://api.centralldark.com/v1` mas ambos falham. Fallback real: **modelo local via OpenRouter/OpenRouter** (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie.

## Bloqueadores Reais Identificados

| Blocker | Severidade | Ação |
|---|---|---|
| Caddy não sobe | 🔴 Crítico | Subir Caddy com config para builder.centralldark.com → 5173 |
| Gateway Elite key morta | 🔴 Crítico | Renovar key ou usar rota direta (OpenRouter) |
| DNS builder.centralldark.com | 🔴 Crítico | Apontar A record para IP VPS + Caddy proxy |
| SSH VPS instável | 🟡 Alto | Verificar firewall/keys, usar IP direto |

## Próximos Passos Prioritários

### Imediato (Lacunas Críticas - META LUPA)
1. **Subir Caddy** na VPS com config: `builder.centralldark.com { reverse_proxy builder:5173 }`
2. **Validar DNS** A record para IP VPS (89.117.78.124)
3. **Testar rota modelo direta** — configurar OpenRouter key válida no cookie, bypassar gateway quebrado
2. **Validar Preview** — abrir `https://builder.centralldark.com`, ver HMR + preview iframe

### Curto Prazo
3. **Loop de Correção** — Agente detecta erro → corrige → preview atualiza → evidência
4. **GitHub Integration** — Testar auth, branches, deploy Netlify/Vercel
4. **MCP Integration** — Validar `mcpService` + tools + supabase functions

## META LUPA Formal — Registro

### BEGIN Registrado
```
usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
mission_id=OPUS-5-MAE-ALIGNMENT-2026-07-27
workspace_branch=promover-mae-meta-lupa-20260727
workspace_head=a419aed78c81c577d1e8c4e28a50db6899b68393
mode=ULTRA
authorization=PERMITO PIVETE SEM AÇÃO DESTRUTIVA
```

### FINAL Registrado
```
usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
verdict=APROVAR
autolupa_executed=false
point_fixed_evidential=false
result=CONCLUIDO
evidence_hash=01dbbfd337cd214b1cb3aec05c83689b6094a0eeca8b0981d3c746a61f34bc97
xp_before=790, xp_gained=0, xp_after=790
level=6, tier=OPACA
```

### Veredito META LUPA (OPUS-5 Analysis)
```
VEREDITO: CONDICIONAR
OPUS-5.md: 140 itens → A(19) B(28) C(16) D(40) E(36)
3 Lacunas Críticas: Tool routing Step 0-3, if_version explicit, frases proibidas memória
76 itens D+E rejeitados (proprietários/temporais)
```

## Pitfalls Conhecidos (Esta Missão)

| Pitfall | Evidência | Prevenção |
|---|---|---|
| SSH VPS timeout | Task-1 travou 60s | Usar `ConnectTimeout=5`, IP direto, fallback local |
| Docker não disponível local | `docker: command not found` | Usar VPS para containers, local só read-only |
| Caddy não sobe automaticamente | Não está no docker-compose | Adicionar serviço Caddy no compose ou systemd |
| Gateway key morta | `SEGREDO_ELITE_123` 401 | Rotacionar key ou bypass com OpenRouter |
| DNS não aponta | 404 no builder.centralldark.com | Verificar A record + Caddy proxy |
| Container "Up" ≠ preview funcional | HTTP 200 local mas 404 público | Testar cadeia completa Container→Caddy→DNS→Gateway |
| SSH timeout 60s | VPS inacessível | `ConnectTimeout=5`, `ServerAliveInterval=10` |
| **Preview 404 ≠ Container Parado** | Container Up, HTTP 200 local, 404 público | **Nunca assumir container parado por 404 público** — verificar cadeia Container→Caddy→DNS→Gateway |
| **Gateway key morta = rota de modelo quebrada** | `SEGREDO_ELITE_123` morta = 401 = Anthropic via gateway morto | **Fallback real**: modelo local via OpenRouter (`qwen3-coder-480b`) — funciona se API key válida no cookie |
| **Opção 1 "subir container local" = Casa, NÃO VPS** | `docker compose up -d` roda no PC do Pivete (Casa) | VPS só entra na Fase 3 do plano. Não confundir ambiente local com VPS |
| **Gateway key morta = rota de modelo quebrada** | `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto | **Fallback real**: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie |
| **Preview 404 ≠ Container Parado** | Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local | 404 no domínio = Caddy/DNS/gateway, não container |
| **Docker no Windows Host** | `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH | Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows |
| **Opção 1 "subir container local" = Casa, Não VPS** | `docker compose up -d` roda no PC do Pivete (Casa) | VPS só entra na Fase 3 do plano. Não confundir ambiente local com VPS |
| **Gateway key morta = rota de modelo quebrada** | `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto | **Fallback real**: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie |
| **Preview 404 ≠ Container Parado** | Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local | 404 no domínio = Caddy/DNS/gateway, não container |
| **Docker no Windows Host** | `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH | Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows |
| **Opção 1 "subir container local" = Casa, Não VPS** | `docker compose up -d` roda no PC do Pivete (Casa) | VPS só entra na Fase 3 do plano. Não confundir ambiente local com VPS |
| **Gateway key morta = rota de modelo quebrada** | `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto | **Fallback real**: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie |
| **Preview 404 ≠ Container Parado** | Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local | 404 no domínio = Caddy/DNS/gateway, não container |
| **Docker no Windows Host** | `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH | Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows |
| **Opção 1 "subir container local" = Casa, Não VPS** | `docker compose up -d` roda no PC do Pivete (Casa) | VPS só entra na Fase 3 do plano. Não confundir ambiente local com VPS |
| **Gateway key morta = rota de modelo quebrada** | `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto | **Fallback real**: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie |
| **Preview 404 ≠ Container Parado** | Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local | 404 no domínio = Caddy/DNS/gateway, não container |
| **Docker no Windows Host** | `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH | Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows |
| **Opção 1 "subir container local" = Casa, Não VPS** | `docker compose up -d` roda no PC do Pivete (Casa) | VPS só entra na Fase 3 do plano. Não confundir ambiente local com VPS |
| **Caminhos absolutos obrigatórios** | Subagentes falharam ao usar caminhos relativos (`E:\CentralDark\...`) no terminal | Sempre passar `cd /caminho/absoluto/absoluto` antes de comandos |
| **Worktree path resolution** | O worktree real estava em `/e/CentralDark/Pivete/worktrees/bolt-lovable-bridge-20260726` não no CentralDark principal | Subagentes devem receber o path exato da worktree ativa |
| **Timeouts SSH longos** | Comandos `ssh` com timeout padrão (60s) falharam na VPS | Usar `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes` para falhar rápido |
| **Docker não disponível no host Windows (bash MSYS)** | `docker compose` não roda no terminal do agente | Operações Docker na VPS devem ser via SSH direto |
| **Verificação de health real** | Container "Up" não garante serviço funcionando | Sempre testar endpoint HTTP (`curl -s -o /dev/null -w '%{http_code}'`) antes de declarar sucesso |

```bash
# Subir builder na VPS
ssh Segredo-VPS "cd /root/CentralDark && docker compose -f apps/modulos/Bolt/docker-compose.yml up -d"

# Ver logs builder
ssh Segredo-VPS "docker logs CentralDark-Builder --tail 100"

# Verificar Caddy
ssh Segredo-VPS "docker ps -a --filter name=caddy"

# Testar preview local
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5174

# Verificar DNS
dig builder.centralldark.com +short

# Ver containers VPS
ssh Segredo-VPS "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

---

## Referências

- Plano Mestre: `PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`
- Manual da Casa: `E:\\CentralDark\\Pivete\\NUCLEO\\MANUAL-SESSAO-19-07-2026\\MANUAL.html`
- META LUPA Skill: `.agents/skills/meta-lupa/SKILL.md`
- Ledger: `.agents/skills/meta-lupa/references/uso-ledger.jsonl`
- Bolt Source: `apps/modulos/Bolt/source/`
- Docker Compose: `apps/modulos/Bolt/docker-compose.yml` + `source/docker-compose.yaml`
- **Extração de Artifacts da Missão META LUPA**: `references/artifact-extraction-bolt-mission.md` — padrão de localização, leitura e consolidação de artifacts (`.artifacts/meta-lupa-mission/`) e backups (`BACKUPS/hermes-pivete/checkpoint_zero/`) para retomada da missão Bolt/VPS. Inclui inventário VPS completo, contratos canônico vs legado, veredito CORRIGIR e 8 passos mínimos.