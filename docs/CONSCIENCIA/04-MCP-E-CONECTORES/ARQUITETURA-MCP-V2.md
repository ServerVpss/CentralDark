# Arquitetura Definitiva — CentralDark MCP v2

> Separação total entre **Modo Normal** e **Modo Admin**, carregamento dinâmico de tools, Vault blindado e base pronta pra GraphRAG + aprendizado contínuo.

---

## 1. Diagrama da arquitetura

```
                        ┌───────────────────────────────────────────┐
                        │              CLIENTES MCP                 │
                        │  ChatGPT · Claude · Lovable · Grok · CLI  │
                        └───────────────┬───────────────────────────┘
                                        │ HTTPS + Bearer
                                        ▼
                              ┌──────────────────┐
                              │  Caddy (edge TLS)│
                              │ mcp.centralldark │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │        MCP Router (Ingress)         │
                    │  - Autentica Bearer                 │
                    │  - Resolve escopo (user/admin)      │
                    │  - Rate-limit + audit hook          │
                    └────────┬──────────────────┬─────────┘
                             │                  │
                 escopo=user │                  │ escopo=admin (+CONFIRMO)
                             ▼                  ▼
              ┌────────────────────┐   ┌────────────────────────┐
              │  MODO NORMAL       │   │  MODO ADMIN            │
              │  (processo user)   │   │  (processo isolado)    │
              │                    │   │                        │
              │ ToolRegistry.user  │   │ ToolRegistry.admin     │
              │ - github_read      │   │ - vault_* (Vault API)  │
              │ - vps_read_safe    │   │ - vps_write / run_once │
              │ - pendencias_*     │   │ - deploy / pm2 / dns   │
              │ - notion / linear  │   │ - github_write / merge │
              │ - cognitivo/lemb.  │   │ - graph_ingest_admin   │
              └──────┬─────────────┘   └──────┬─────────────────┘
                     │                        │
                     ▼                        ▼
              ┌───────────────────────────────────────┐
              │           Núcleo Compartilhado        │
              │  Sanitizer · AuditLog · Policy · Zod  │
              └──────────────┬────────────────────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        ▼                    ▼                        ▼
 ┌─────────────┐     ┌───────────────┐        ┌──────────────────┐
 │   VAULT     │     │  GraphRAG     │        │  Observability   │
 │ (sealed)    │     │  (ingest bus) │        │  logs+metrics    │
 │ age/sops    │     │  Neo4j/PG-vec │        │  Loki/Prom       │
 └─────────────┘     └───────────────┘        └──────────────────┘
```

---

## 2. Estrutura de pastas

```
apps/modulos/mcp/
├─ src/
│  ├─ index.ts                     # bootstrap único, decide modo por env MCP_MODE
│  ├─ ingress/
│  │  ├─ router.ts                 # Express + rotas MCP + /health + /tools.json
│  │  ├─ auth.ts                   # resolve Bearer → { userId, scope }
│  │  ├─ ratelimit.ts
│  │  └─ audit-hook.ts
│  ├─ core/
│  │  ├─ tool-registry.ts          # registro + filtro por escopo/tags
│  │  ├─ tool-loader.ts            # carregamento dinâmico por modo
│  │  ├─ policy.ts                 # confirmações, allowlists, paths bloqueados
│  │  ├─ sanitizer.ts              # remove segredos da saída
│  │  ├─ audit-logger.ts           # JSONL append-only 0600
│  │  └─ types.ts                  # Tool, Ctx, Scope, Mode
│  ├─ modes/
│  │  ├─ normal/
│  │  │  ├─ index.ts               # exporta lista de tools NORMAIS
│  │  │  └─ manifest.json          # nomes + hashes p/ diff
│  │  └─ admin/
│  │     ├─ index.ts               # exporta lista de tools ADMIN
│  │     ├─ manifest.json
│  │     └─ guards.ts              # exige CONFIRMO ADMIN + 2ª chave
│  ├─ tools/
│  │  ├─ github/     (read.ts, write.ts, actions.ts)
│  │  ├─ vps/        (read.ts, write.ts, run-once.ts)
│  │  ├─ vault/      (list.ts, read.ts, read-all.ts, rotate.ts) ← admin-only
│  │  ├─ graph/      (query.ts, ingest.ts, ingest-admin.ts)
│  │  ├─ cognitivo/  (memoria, aprendizado, consciencia)
│  │  ├─ pendencias/ , notion/, linear/, sentry/, deploy/, pm2/
│  │  └─ _shared/    (helpers, http, zod-schemas)
│  ├─ vault/
│  │  ├─ provider.ts               # interface (sops|age|env|hashicorp)
│  │  ├─ sops-provider.ts          # default: sops + age key
│  │  ├─ cache.ts                  # in-memory TTL + wipe on SIGTERM
│  │  └─ audit.ts                  # trilha exclusiva de leitura
│  ├─ graphrag/
│  │  ├─ bus.ts                    # fila de eventos p/ ingestão
│  │  ├─ ingestor.ts               # normaliza → chunk → embed → grava
│  │  ├─ store.ts                  # Neo4j + pgvector
│  │  └─ learners/                 # coletores: mcp-calls, decisoes, docs
│  └─ observability/
│     ├─ logger.ts (winston JSON)
│     ├─ metrics.ts (prom-client)
│     └─ tracing.ts (otel opcional)
├─ config/
│  ├─ normal.env.example
│  ├─ admin.env.example
│  └─ policy.yaml                  # regras declarativas
├─ ecosystem.config.cjs            # 2 apps PM2: mcp-normal + mcp-admin
├─ dist/                           # build (versionado hoje)
└─ tests/
```

---

## 3. Componentes e responsabilidades

| Componente | Responsabilidade |
|---|---|
| **Ingress/Router** | TLS-terminated pelo Caddy, valida Bearer, injeta `ctx.scope`, roteia p/ processo Normal ou Admin. |
| **Auth** | Mapeia token → `{ userId, scope: 'user'\|'admin', keyId }`. Admin exige token dedicado + IP allowlist + confirmação literal. |
| **ToolRegistry** | Fonte única de verdade das tools. Cada tool declara `mode`, `scope`, `destructive`, `readsSecrets`. |
| **ToolLoader** | No boot lê `MCP_MODE` e importa somente `modes/<mode>/index.ts`. Modo Normal **nunca** carrega tools admin/vault na memória. |
| **Policy** | YAML declarativo: paths bloqueados, comandos proibidos, confirmações obrigatórias, quotas por tool. |
| **Sanitizer** | Middleware de saída: remove tokens, chaves, IPs internos, paths sensíveis. |
| **AuditLogger** | JSONL append-only por request: user, tool, input hash, resultado, latência. Rotação diária. |
| **Vault Provider** | Interface plugável. Default `sops+age`. API: `list()`, `read(name)`, `rotate(name)`. Cache TTL curto, zerado em SIGTERM. |
| **Vault Audit** | Log separado (0600) SÓ das leituras de segredo, com hash do valor (nunca o valor). |
| **GraphRAG Bus** | Publica eventos (`tool_call`, `decision`, `doc_change`, `learning`) numa fila. |
| **GraphRAG Ingestor** | Consome bus → chunk → embed → grava em Neo4j (grafo) + pgvector (semântico). |
| **Learners** | Módulos que geram eventos automaticamente (ex.: toda chamada de tool vira nó no grafo). |
| **Observability** | Logs JSON, métricas Prometheus (`mcp_tool_calls_total`, `mcp_tool_latency_ms`), tracing OTel opcional. |

---

## 4. Carregamento dinâmico de tools por modo

**Boot decide tudo por variável de ambiente:**

```ts
// src/index.ts
const mode = process.env.MCP_MODE as 'normal' | 'admin';
const { tools } = await import(`./modes/${mode}/index.js`);
const registry = new ToolRegistry(tools, { mode });
router.use(buildMcpHandler(registry));
```

**Regras:**

1. **Dois processos PM2 separados** (`mcp-normal` porta 9100, `mcp-admin` porta 9101), binários idênticos, `MCP_MODE` diferente.
2. Caddy roteia:
   - `mcp.centralldark.com` → 9100 (normal)
   - `mcp-admin.centralldark.com` → 9101 (admin, com mTLS + IP allowlist)
3. `ToolRegistry` filtra em runtime também: se um cliente com scope `user` bater no admin, retorna `403`.
4. Cada tool exporta metadata:
   ```ts
   export const vaultRead: Tool = {
     name: 'vault_read',
     mode: 'admin',
     scope: 'admin',
     destructive: false,
     readsSecrets: true,
     requiresConfirmation: false,
     handler, inputSchema,
   };
   ```
5. `tool-loader` valida no boot que **nenhuma tool `admin` foi importada em processo `normal`** (assertion → aborta start).
6. Hot-add: novas tools entram por drop-in em `tools/<area>/` e são descobertas via glob no boot (sem reconectar cliente, graças ao `mcp_admin_call` dispatcher já existente).

---

## 5. Segurança — Modo Admin + Vault

**Autenticação e autorização**
- Token admin **separado** do token user, rotacionável, TTL curto (30 dias).
- IP allowlist no Caddy p/ `mcp-admin.centralldark.com`.
- mTLS opcional (cert cliente) para o subdomínio admin.
- Confirmação literal `"CONFIRMO ADMIN"` obrigatória em qualquer tool `destructive`.
- Segunda chave (2FA TOTP) exigida para: `vault_read_all`, `vault_rotate`, `pm2_delete`, `github_delete_*`.

**Vault**
- Segredos em disco **cifrados** (`sops` + chave `age` local, chave nunca no repo).
- Provider expõe só `list/read/rotate`; **nunca** `write` sem duplo fator.
- Cache in-memory com TTL ≤ 60s, wipe em SIGTERM/SIGINT.
- Trilha de auditoria dedicada (`logs/vault-audit.jsonl`, 0600), com hash SHA-256 do valor lido (não o valor).
- Redação obrigatória: sanitizer conhece o conjunto de segredos carregados e mascara em toda saída (log, resposta, erro).
- Isolamento de processo: só `mcp-admin` tem permissão de leitura em `/root/CentralDark/secrets/` (unix perms 0700 + user dedicado).

**Superfície de ataque**
- Path traversal bloqueado em todas as tools de FS (allowlist de raízes).
- Comandos shell: allowlist estrita + timeout 60s + stdout truncado.
- Rate-limit por tool + por token.
- CORS restrito, sem `*`.
- Sanitizer aplicado **antes** do audit log e **antes** da resposta.
- Kill-switch: env `MCP_ADMIN_DISABLE=1` derruba tools admin sem redeploy.

---

## 6. Próximos passos práticos

1. **Criar `src/` TypeScript** espelhando `dist/` atual (destravar refactor sem quebrar runtime).
2. **Extrair `ToolRegistry` + metadata** — anotar cada tool existente com `{mode, scope, destructive, readsSecrets}`.
3. **Split de processos PM2** — duplicar entrada, subir `mcp-admin` na porta 9101 com `MCP_MODE=admin`.
4. **Migrar `admin-vault.js` → `tools/vault/*` + Vault Provider `sops`** — cifrar `/root/CentralDark/secrets/` com age.
5. **Configurar Caddy** — novo vhost `mcp-admin.centralldark.com` com IP allowlist + (fase 2) mTLS.
6. **Policy YAML** — mover regras hardcoded (paths bloqueados, confirmações) para `config/policy.yaml`.
7. **Sanitizer com registro de segredos** — carregar nomes+hashes do Vault no boot e mascarar automaticamente.
8. **Audit JSONL unificado** + rotação diária + envio p/ Loki.
9. **GraphRAG bus (fase 1)** — só publicar eventos `tool_call` numa fila local (JSONL); ingestor real vem depois.
10. **Learners iniciais** — coletar: chamadas de tool, decisões (`docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`), aprendizados (`APRENDIZADOS.md`), pendências fechadas.
11. **GraphRAG store (fase 2)** — subir Neo4j + pgvector em PM2, ligar ingestor.
12. **Testes** — smoke por modo (`curl /health` + `tools.json` diff vs manifest), teste de isolamento (garantir que `mcp-normal` retorna 404 em `vault_*`).
13. **Rotação de tokens** — cron mensal + notificação Hermes.
14. **Kill-switch + runbook** — documentar em `docs/CONSCIENCIA/04-MCP-E-CONECTORES/RUNBOOK-INCIDENTE.md`.
