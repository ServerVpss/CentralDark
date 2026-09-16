# 👑🪬 CentralDark.exe · inventário do Hub/HUD unificado

Data: 2026-09-16  
Base medida: `ServerVpss/CentralDark@c0a33271228bbb77168dca4ae64d4aa8e1201898`  
Owner desktop: `apps/modulos/Bolt/source`  
Regra: `REUSE_BEFORE_CREATE` + `ONE_SYSTEM_ONLY` + `UNKNOWN != PASS`

## Objetivo

Trazer para o próprio `CentralDark.exe` a experiência de cockpit mostrada nas referências visuais: contas, limites quando observáveis, harnesses, plugins, GitHub, MCP, runtime, browser, voz, memória, receipts e estatísticas em um único lugar.

O HUD deste PR não cria segundo cérebro, segundo auth ou segundo router. Ele projeta owners já existentes e mantém source separado de runtime.

## ✅ Já existe materialmente na main

| Capacidade | Estado de source | Owner / prova |
|---|---|---|
| `CentralDark.exe` Electron | PROVADO | `apps/modulos/Bolt/source`, `electron-builder.yml` |
| Cockpit unificado | PROVADO | `CentralDarkCockpitShell.client.tsx` |
| SOL widget flutuante | PROVADO | `sol-widget.tsx` + `electron/main/ui/window.ts` |
| mover/redimensionar widget | PROVADO | BrowserWindow `resizable: true` + bounds persistidos |
| editor + terminal + workbench | PROVADO | `app/components/workbench/` |
| GitHub stats | PROVADO | `app/routes/api.github-stats.ts` |
| múltiplos providers LLM | PROVADO | OpenAI, Anthropic, Google, Bedrock, Mistral, DeepSeek, Cohere, Cerebras, OpenRouter e outros no `package.json` |
| MCP SDK | PROVADO | `@modelcontextprotocol/sdk` + `apps/modulos/mcp/` |
| Desktop Commander multi-conta | PROVADO EM SOURCE | runtime manifest com `principal` + `conta2` |
| Screenpipe | PROVADO EM SOURCE | runtime manifest + health bridge |
| Omni Router health | PROVADO EM SOURCE | bridge Electron `centraldark:omni:health` |
| Dependabot | PROVADO | `.github/dependabot.yml` + workflow de auto-merge |
| CodeRabbit | PROVADO | `.coderabbit.yaml` + `scripts/coderabbit-bridge.mjs` |
| gráficos | PROVADO | `chart.js` + `react-chartjs-2` |
| drag/drop | PROVADO | `react-dnd` + HTML5 backend |
| painéis redimensionáveis | PROVADO | `react-resizable-panels` |
| persistência local | PROVADO | `electron-store` + localStorage no renderer |
| auto-update Windows | PROVADO | Electron updater + owner canônico do desktop |

## 🟢 Delta implementado neste PR

Novo `CentralDarkUnifiedHud` montado dentro da mesma rota/cockpit existente.

Ele entrega:

- HUD `position: fixed` arrastável pelo topo;
- resize nativo `both`, com tamanho e posição persistidos;
- polling periódico dos probes que já existem;
- contador de mudanças observadas;
- histórico local curto de snapshots, limitado e sem segredo;
- estatísticas GitHub quando o token já está autorizado na app;
- abas `RESUMO`, `CONTAS`, `CAPACIDADES`, `LACUNAS`;
- catálogo explícito de source provado, parcial, gaps e plugins opcionais;
- nenhuma quota inventada;
- nenhuma tela raspada para descobrir plano/limite de conta;
- `SOURCE != RUNTIME` permanece visível no próprio HUD.

## 🟡 Existe, mas ainda é parcial para a visão do CHEFE

| Área | O que existe | O que falta para fechar |
|---|---|---|
| ChatGPT/OpenAI | provider + conectores | adapter autorizado de conta/plano/uso/reset/rate limit |
| Claude/Anthropic | provider Anthropic | harness Claude Code + sessão/conta/limite no Hub |
| Gemini | provider Google | conta e quota no Hub |
| Codex/VS Code | editor, terminal, workbench e Git | adapter de harness/workspace/conta/telemetria |
| Browser | renderer/Electron e navegação web | painel unificado de sessões/permissões/cookies no CentralDark.exe |
| MCP | servidor e SDK | snapshot vivo `version/toolCount/health` projetado por IPC estreito no desktop |
| Desktop Commander | 2 perfis declarados | telemetria viva por perfil dentro do CentralDark.exe |
| Dependabot | configuração e workflows | feed de eventos/PRs/deltas diretamente no HUD |
| CodeRabbit | config e bridge | feed de findings/reviews diretamente no HUD |
| receipts | vários owners/documentos | stream compacto por mudança no HUD |

## 🔴 Ainda não temos fechado

1. **Unified Account Registry** — ligar identidades/sessões/capabilities sem criar auth paralelo; deve estender `oauth-broker`.
2. **Provider Usage Adapters** — quota, plano, tempo de reset e rate limits por provedor somente por fonte autorizada.
3. **Claude Code Harness Adapter** — integração explícita, não confundida com o provider Anthropic de inferência.
4. **Codex/VS Code Harness Adapter** — workspace/sessão/telemetria de execução.
5. **MCP Live Snapshot no desktop** — health + versão + toolCount via IPC tipado.
6. **Dependabot Event Feed** — dependência alterada vira evento do HUD, não “analytics mágico”.
7. **CodeRabbit Event Feed** — review vira sinal/recomendação, não autoridade.
8. **HUD Receipt Stream** — cada mudança relevante com timestamp, source_ref, causa e cursor.
9. **Conta/limite multi-provider real** — continua `ADAPTER_REQUIRED` até haver API/conector autorizado.

## 📊 Dependabot e analytics

Dependabot já está presente, mas seu papel correto é **detectar e propor deltas de dependências**. Ele não substitui analytics de produto/runtime.

O HUD pode consumir eventos Dependabot e CodeRabbit como sinais. Para analytics mais profundo foram encontrados como plugins opcionais disponíveis:

- **PostHog** — product analytics, feature flags, errors e LLM analytics;
- **Datadog (Preview)** — observabilidade de produção.

Esses plugins são opcionais e não viram dependência do core. Conectar/instalar continua exigindo ação explícita da conta do usuário.

## 🧿 Contas e limites

O Hub deve mostrar cada conta/harness separadamente:

```text
ChatGPT
Claude Code
Gemini
Codex / VS Code
Desktop Commander · principal
Desktop Commander · conta2
GitHub
MCP / outros futuros hubs
```

Cada cartão deve poder expor, quando a fonte permitir:

```text
ACCOUNT
SESSION
PLAN
CAPABILITIES
USAGE
LIMIT
RESET_AT
RATE_LIMIT
HEALTH
LAST_MEASURED_AT
SOURCE_REF
```

Campos não medidos permanecem `UNKNOWN`/`ADAPTER_REQUIRED`.

## ⚖️ Critério do HUD adaptativo

O HUD cresce por dados observados, não por enfeite:

```text
mudança observada
→ novo snapshot
→ assinatura muda
→ contador sobe
→ evento entra no histórico
→ estatísticas recalculam
→ HUD projeta o novo estado
```

Layout do usuário também é preservado:

```text
posição + tamanho
→ localStorage
→ restauração na próxima sessão
```

## 🔒 Contraprova

```text
NEW_APP=false
NEW_ROUTER=false
NEW_AUTH=false
NEW_BRAIN=false
SCREEN_SCRAPING_FOR_QUOTA=false
UNKNOWN_TO_PASS=false
DEPENDABOT_AS_RUNTIME_AUTHORITY=false
CODERABBIT_AS_RUNTIME_AUTHORITY=false
OPTIONAL_ANALYTICS_REQUIRED_FOR_CORE=false
```

## Próximo cursor

Depois deste PR ficar verde:

1. ligar `MCP Live Snapshot` ao bridge Electron;
2. criar adapters de uso/limites um provedor por vez;
3. alimentar HUD com Dependabot/CodeRabbit/receipts;
4. integrar contas ao `oauth-broker` existente;
5. somente depois promover claims de runtime com prova viva.
