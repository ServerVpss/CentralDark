# ARQUITETURA DE CAPACIDADES — Como apps/ se Organiza

**Status:** [ATUALIZADO 2026-10-14]  
**Autoridade:** SEGREDO/CHEFE  
**Owner:** `docs/ARQUITETURA/ARQUITETURA-CAPACIDADES.md`  
**Consumidores:** SOL, HERMES, Grafo, MCP, CI/CD, scripts de observação

---

## Intenção

A estrutura de `apps/` implementa a **Vertical Slice Architecture** + **Domain-Oriented API Design** com **Modular Monolith** como disciplina. Cada capacidade tem owner semântico, contrato claro, espaço físico mapeado e consumidores rastreáveis.

```text
CAPACIDADE = FEATURE + DOMAIN + OWNER + CONTRATO_MEDIDO
```

---

## Regra Estrutural

```text
apps/
├── 00-INDICE-CAPACIDADES.md    [índice navegável]
│
├── instinto-superior/          [CORPO — Instinto Superior = Runtime local de IA]
│   ├── src/
│   │   ├── components/         [UI + estado vivo]
│   │   ├── services/           [lógica de capacidade]
│   │   ├── mcp/                [MCP integrados localmente]
│   │   └── memory/             [One Heart + estado]
│   ├── tests/
│   └── package.json
│
├── modulos/                    [FUNCIONALIDADES ESPECIALIZADAS]
│   ├── 00-INDICE-MODULOS.md
│   ├── elite-gateway/          [roteador de capacidades + MCP externo]
│   ├── obsidian-plugin-grafo-vivo/  [integração com Obsidian + Grafo]
│   ├── fixed-point-fabric/     [fixed-point loop + testes]
│   └── ...
│
├── bot-server/                 [SERVIDOR BOT MULTIPROTOCOLO]
│   ├── src/
│   │   ├── gateways/           [WhatsApp, Telegram, MultiZap]
│   │   ├── api/                [rotas públicas]
│   │   └── core/               [lógica compartilhada]
│   └── tests/
│
└── README.md                   [overview técnico]
```

---

## Instinto Superior = Corpo

### Localização

```
apps/instinto-superior/
```

### Responsabilidades

- **Runtime de IA local** em TypeScript + Tailwind + shadcn/ui
- **One Heart** — estado único, imutável fora de WRITER
- **Observador local** — monitor, filesystem, configuração, build
- **Publicador de capacidades** — API com assinatura clara
- **Integrador MCP** — conecta MCPs locais + remotos
- **Memória viva** — acumula aprendizados, decisões, contexto

### Estrutura

```text
instinto-superior/
├── src/
│   ├── components/
│   │   ├── central/
│   │   │   ├── ObservabilidadeCentralDark.tsx
│   │   │   ├── PainelAdminCentralDark.tsx
│   │   │   └── SistemaCentralDark.tsx
│   │   └── ...
│   ├── services/
│   │   ├── capability-contract-router.ts
│   │   ├── one-heart-manager.ts
│   │   └── memory-vault.ts
│   ├── mcp/
│   │   ├── local-mcp-loader.ts
│   │   ├── capability-publisher.ts
│   │   └── signal-surface.ts
│   ├── memory/
│   │   ├── observation-stream.ts
│   │   ├── state-reconciliation.ts
│   │   └── effect-logger.ts
│   └── types/
│       └── capability-contract.ts
├── tests/
│   ├── integration/
│   │   └── capability-router.test.ts
│   └── unit/
│       └── one-heart.test.ts
└── package.json
```

### Capacidades Publicadas por Instinto Superior

| Capacidade | Contrato | Owner | Status |
|-----------|----------|-------|--------|
| `OBSERVE_LOCAL_STATE` | `capability-contract-router` | `services/one-heart-manager.ts` | 🟢 LIVE |
| `PUBLISH_CAPABILITY` | `api.centralldark.com/v1/capabilities` | `mcp/capability-publisher.ts` | 🟡 CANDIDATE |
| `ROUTE_TO_EXECUTOR` | `CAPABILITY_CONTRACT_ROUTER` | `services/capability-contract-router.ts` | 🟢 LIVE |
| `ACCUMULATE_MEMORY` | `memory-vault` | `services/memory-vault.ts` | 🟡 CANDIDATE |
| `SIGNAL_EFFECT` | `signal-surface` | `mcp/signal-surface.ts` | 🟡 CANDIDATE |

---

## Módulos Especializados

### elite-gateway

**O quê:** Roteador de capacidades + gateway externo de MCP  
**Localização:** `apps/modulos/elite-gateway/`  
**Owner:** SOL (coordenação), HERMES (execução)  
**Consumidores:** Instinto Superior, bot-server, scripts de orchestração

```text
elite-gateway/
├── scripts/
│   └── centraldark_omni_router.py
│       └── lógica: MISSION → CAPABILITY_CONTRACT_ROUTER → ENGINE → JUDGE
├── src/
│   ├── gateway/
│   │   └── mcp-loader.ts
│   └── router/
│       └── capability-match.ts
└── tests/
```

### obsidian-plugin-grafo-vivo

**O quê:** Integração Obsidian + Grafo semântico em tempo real  
**Localização:** `apps/modulos/obsidian-plugin-grafo-vivo/`  
**Owner:** Cérebro Vivo (docs/CONSCIENCIA/)  
**Consumidores:** Memória, raciocínio SOL, Grafo

### fixed-point-fabric

**O quê:** Loop determinístico + testes de prova  
**Localização:** `apps/modulos/fixed-point-fabric/`  
**Owner:** HERMES, SOL (verificação)  
**Consumidores:** Validação, reconciliação, CI/CD

---

## Bot-Server — Servidor Multiprotocolo

### Localização

```
apps/bot-server/
```

### Responsabilidades

- **Gateway WhatsApp** (`v1/whatsapp/...`)
- **Gateway Telegram** (`v1/telegram/...`)
- **Integração MultiZap** (futura)
- **Webhook de entrada** (sanitizado)
- **Health check** e observação

### Estrutura

```text
bot-server/
├── src/
│   ├── gateways/
│   │   ├── whatsapp/
│   │   │   ├── routes.ts
│   │   │   ├── handlers.ts
│   │   │   └── webhook.ts
│   │   └── telegram/
│   │       ├── routes.ts
│   │       └── handlers.ts
│   ├── api/
│   │   ├── health.ts
│   │   ├── sessions.ts
│   │   └── contacts.ts
│   ├── core/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   └── logger.ts
│   └── types/
│       └── bot-contract.ts
├── tests/
│   └── e2e/
│       └── webhook-flow.test.ts
└── package.json
```

### Rotas Públicas do Bot-Server

| Rota | Método | Contrato | Owner |
|------|--------|----------|-------|
| `/health` | GET | vazio | HERMES |
| `/v1/whatsapp/sessions/status` | GET | statusCode + sessionStatus | bot-server |
| `/v1/whatsapp/webhooks/wuzapi` | POST | webhook assinado, payload sanitizado | bot-server |
| `/v1/whatsapp/contacts/:phone/profile` | GET | profileData | bot-server |

**Invariantes:**

```text
WEBHOOK_RECEIVED != AUTOMATIC_ACTION
AUTHORIZATION_FIRST
RATE_LIMIT_SECOND
SIGNATURE_VERIFY_THIRD
MUTATION_ONLY_AFTER_ALL_CHECKS
```

---

## Organização por Domínio — Domain-Oriented API Design

```text
PÚBLICO (URLs):                SEMÂNTICO (OWNER):          FÍSICO (DIRETÓRIO):
─────────────────────────────────────────────────────────────────────────
/api/capabilities              Instinto Superior            apps/instinto-superior/
/api/memory/manifest           Cérebro Vivo                 docs/CONSCIENCIA/
/api/telemetry                 Observador (HERMES)          apps/bot-server/core/
/v1/whatsapp/...               Bot-Server                   apps/bot-server/gateways/whatsapp/
/v1/telegram/...               Bot-Server (futura)          apps/bot-server/gateways/telegram/
```

**Distinção inviolável:**

```text
URL_PUBLICA = contrato de interface
DIRETORIO_FISICO = implementação
OWNER_SEMANTICO = autoridade e responsabilidade

Alterar URL não é autorização para mover arquivo.
Mover arquivo não autoriza renomear URL.
Adicionar capacidade não autoriza criar novo backend.
```

---

## Ciclo de Vida de Uma Capacidade

### 1. Proposta

```text
CHEFE propõe: "Quero capacidade X"
│
▼
SOL arquiteta: "Requer Y, Z, owner é W"
│
▼
HERMES mapeia: "Já temos Y aqui, Z aqui, W é aqui"
```

### 2. Implementação

```text
OWNER_SEMANTICO + HERMES implementam
│
├─ Adicionar serviço/função em owner existente
├─ Adicionar testes (unit + integration)
└─ Publicar contrato via CAPABILITY_CONTRACT_ROUTER
```

### 3. Validação

```text
REALIDADE observa:
│
├─ Prova de build ✓
├─ Prova de teste ✓
├─ Prova de contrato ✓
└─ Prova de efeito observável ✓
```

### 4. Promoção

```text
PASSED → Git commit + PR
       → Merge em main
       → Deploy em VPS
       → Grafo T1 atualizado
       → Próximo #ACORDAR
```

---

## Integração MCP — Ferramentas Plugáveis

### Contrato de MCP

```typescript
interface MCPCapability {
  name: string;
  tools: Tool[];
  read_scope: string[];
  write_scope: string[];
  runtime: "local" | "remote" | "hybrid";
  latency_class: "low" | "medium" | "high";
  cost_class: "free" | "metered" | "unknown";
  health: "proven" | "failed" | "unknown";
  observed_at: timestamp;
}
```

### Exemplo: MCP do CentralDark

```text
MCP_CENTRALDARK = {
  tools: [
    "check_active",
    "set_terminal_title",
    "update_terminal_activity",
    "find_related_active_tasks",
    ...
  ],
  read_scope: [".claude/", "docs/CONSCIENCIA/"],
  write_scope: [".claude/", "skills/"],
  runtime: "remote",
  latency_class: "medium",
  cost_class: "free",
  health: "proven"
}
```

---

## Testes e Reconciliação

### Teste Positivo

```text
✅ Capacidade anunciada existe?
✅ Contrato é honrado?
✅ Efeito observado = efeito esperado?
✅ Sem side-effects indesejados?
```

### Teste Negativo

```text
✅ Recusa quando não autorizada?
✅ Falha com dignidade quando recurso falta?
✅ Não executa ação parcial?
✅ Retorna erro determinístico?
```

### Contraprova

```text
SOL valida: arquitetura, contrato, owner, consumidores
HERMES valida: código, testes, efeito, receipt
REALIDADE valida: tudo que foi prometido ocorreu no mundo real
```

---

## Próximos Passos

1. ✅ Inventariar capacidades atuais de Instinto Superior
2. ✅ Documentar contrato de cada capacidade publicada
3. ⏳ Mapear consumidores de cada capacidade
4. ⏳ Validar ortogonalidade entre módulos
5. ⏳ Testar falha e recuperação de cada camada
6. ⏳ Atualizar CI/CD para validar contratos

---

## Referências Arquiteturais

- **Vertical Slice Architecture:** Microsoft Learn — Feature Slices
- **Domain-Oriented API Design:** Google Cloud — Resource-Oriented Design
- **Modular Monolith:** Microsoft Learn — Vertical Slices and Modular Monoliths
- **Capability Contract Router:** `docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md`
- **Hierarquia:** `docs/ARQUITETURA/HIERARQUIA.md`

**[ATUALIZADO 2026-10-14]**
