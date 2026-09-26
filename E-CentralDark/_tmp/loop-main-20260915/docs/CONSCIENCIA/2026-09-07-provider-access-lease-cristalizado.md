# Provider Access Lease — cristalização 2026-09-07

## Intenção

Dar ao painel privado da CentralDark capacidade ampla sobre providers sem entregar segredo bruto aos agentes, mantendo um único owner por provider e um único plano de controle.

## Owner e registro canônico

```text
POLICY_OWNER=docs/CONSCIENCIA/02-PERMISSOES.md
DETAIL_ARTIFACT=docs/CONSCIENCIA/2026-09-07-provider-access-lease-cristalizado.md
BOOT_REGISTRY=docs/CONSCIENCIA/README.md
PROVIDER_ADAPTER=apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js
```

Este arquivo detalha o lease. Ele não cria um segundo owner de permissões, vault, painel ou plano de controle.

## Princípios cristalizados

- `CAPABILITY_ACCESS != RAW_SECRET_ACCESS`
- `REUSE_BEFORE_CREATE=true`
- `ONE_COCKPIT=true`
- `ONE_SECRET_OWNER_TARGET=true`
- `ONE_PROVIDER_CONTROL_PLANE=true`
- `NO_NEW_PANEL=true`
- `NO_NEW_VAULT=true`
- `NO_RAW_SECRET_TO_AGENT=true`
- `SECRETS=SERVER_ONLY`
- `UNKNOWN != PASS`

## Modos de acesso

```text
OFF
READ_ONLY
FULL_TEMPORARY
FULL
```

### OFF
Nenhuma ação de provider.

### READ_ONLY
Permite somente:

- `provider_capabilities`
- `provider_credentials_status`
- `provider_read`

Bloqueia `provider_mutate`.

### FULL_TEMPORARY
Mesmas capacidades de `FULL`, com TTL obrigatório.

O lease temporário precisa capturar o modo imediatamente anterior antes de elevar acesso:

```text
PREVIOUS_MODE=<OFF|READ_ONLY|FULL>
FULL_TEMPORARY
→ TTL
→ RESTORE_EXACT(PREVIOUS_MODE)
```

Regras de segurança:

```text
EXPIRY != FORCE_READ_ONLY
PREVIOUS_MODE=UNKNOWN → FAIL_CLOSED
TTL_EXPIRED → RESTORE_EXACT(PREVIOUS_MODE)
```

Exemplo: se o baseline era `OFF`, a expiração volta para `OFF`; nunca pode ampliar acesso para `READ_ONLY` apenas porque o TTL terminou.

### FULL
Permite mutações somente pelos gates já existentes e provados no owner canônico:

- sessão Hub válida;
- role `admin`;
- capability allowlist;
- `guardDestructive`;
- `confirmAdmin`;
- idempotency key;
- runtime/compensação provados;
- receipt/auditoria.

## Classes independentes

O painel deve poder ligar/desligar por classe:

```text
READ
WRITE
DESTRUCTIVE
FINANCIAL
```

Ter acesso amplo não implica manter todas as classes ativas ao mesmo tempo.

## Cloudflare / Contabo — estado real dos consumidores de credencial

### Owners e consumidores observados

```text
Provider control: apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js
Admin bridge:     apps/modulos/mcp/src/provider-admin-bridge.js
Painel:           src/apps/modulos/telepainel/components/cofre/ProviderControlPlane.tsx
Hub/Vault alvo:   OAuthBroker / oauth_connections
DNS sync:         scripts/cloudflare/cf-sync.sh
Cofre VPS legado: /root/CentralDark/secrets/cloudflare.env
```

### Contraprova fechada: owner desejado != injeção runtime já provada

O provider adapter atual lê credenciais pelo ambiente do processo (`process.env`). Para Cloudflare, aceita os aliases históricos:

```text
CLOUDFLARE_API_TOKEN
CF_API_TOKEN
```

Para Contabo, o adapter também consulta variáveis de ambiente específicas do provider.

Separadamente, o `cf-sync.sh` consome o arquivo VPS legado `/root/CentralDark/secrets/cloudflare.env`.

Portanto, até existir prova de ligação runtime, é incorreto afirmar que `OAuthBroker / oauth_connections` já injeta as credenciais no provider adapter.

```text
TARGET_SECRET_OWNER=[REDIGIDO-PRESERVACAO]
CURRENT_PROVIDER_ADAPTER_INPUT=process.env
CURRENT_CF_SYNC_INPUT=/root/CentralDark/secrets/cloudflare.env
OAUTH_TO_PROVIDER_RUNTIME_BRIDGE=NOT_PROVEN
ONE_SECRET_OWNER_RUNTIME=NOT_PROVEN
```

O alvo arquitetural continua sendo um owner lógico único de segredo, mas a migração/ponte precisa ser medida e provada antes de promover esse alvo como estado atual.

O valor secreto nunca deve aparecer no chat, UI, logs, Git ou memória de agente. Consumidores recebem capability ou injeção server-side, não posse do segredo.

## Regra para agentes

```text
AGENT_GETS=CAPABILITY
AGENT_GETS_RAW_SECRET=false
```

Grok, ChatGPT, Hermes ou outro cliente podem usar a mesma capability autorizada pelo plano de controle, sem duplicar owner, painel ou vault.

## Estado de maturidade

Capacidades podem existir antes de estarem 100% integradas, desde que o estado seja explícito:

```text
IDEA
SCAFFOLDED
PARTIAL
TESTABLE
READY
BLOCKED
DEPRECATED
```

`PARTIAL != READY` e `UNKNOWN != PASS`.

Cada capability incompleta deve preservar ao menos:

```text
CAPABILITY=
OWNER=
STATUS=
WHAT_WORKS=
WHAT_IS_MISSING=
NEXT_CURSOR=
```

## READY_FOR_USE

Para uso interno da Casa, `READY_FOR_USE` não significa perfeição matemática. O critério é funcionalidade observável, recuperação e ausência de falha crítica conhecida no denominador aplicável. Percentuais de 85–90% são heurísticos, nunca prova absoluta.

Auth, segredos, cobrança, perda de dados e ações irreversíveis mantêm barra de prova mais alta.

## Capacidade ampla, ativação seletiva

A CentralDark pode preservar muitas capacidades preparadas sem ativá-las simultaneamente.

```text
MANY_CAPABILITIES=true
ONE_OWNER_PER_SCOPE=true
ONE_ACTIVE_WRITER_PER_SCOPE=true
```

## Fixed point deste documento

Este documento cristaliza somente política, owners e distinções já observadas no repositório. Não declara deploy, runtime, ponte OAuth→provider, owner físico único de secrets ou mutações de provider como provados.

```text
POLICY_COUNTERPROOF=CLOSED
RUNTIME_SECRET_BRIDGE=NOT_PROVEN
PROVIDER_RUNTIME_MUTATION=NOT_PROVEN
GLOBAL_FIXED_POINT=FALSE
```
