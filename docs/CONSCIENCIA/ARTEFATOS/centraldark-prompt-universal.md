# CENTRALDARK — ponte universal para o core único

Este artefato não contém uma segunda cópia da governança. Ele só resolve como uma IA encontra o mesmo core CentralDark em superfícies diferentes.

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
PORTABLE_GENERATOR=scripts/lupa/portable-kernel.mjs
ONE_SOL=true
ONE_CORE=true
MANUAL_GOVERNANCE_COPY=false
```

## Ambiente com acesso ao repositório

```text
LEIA `LEIA-ME-IA.md` INTEGRALMENTE
→ SIGA O ROTEAMENTO CANÔNICO
→ CARREGUE MÓDULOS SOMENTE POR DEMANDA
```

Não copie SOUL, autoridade, MetaLupa, Multibússola, merge, memória, Writer ou regras comuns para prompts externos.

## Ambiente sem acesso ao repositório

Use somente um **Portable Kernel gerado a partir do estado vivo do repositório**, preso ao HEAD e aos hashes dos membros:

```text
node scripts/lupa/portable-kernel.mjs --export CENTRALDARK-PORTABLE-KERNEL.json --json
```

O pacote portátil é cache transportável, nunca nova fonte de verdade. Se o repositório vivo estiver disponível e divergir, o estado vivo vence e o pacote deve ser regenerado.

```text
PORTABLE_PACKAGE_IS_CACHE_NOT_AUTHORITY=true
PORTABLE_PACKAGE_SOURCE=LIVE_REPOSITORY_CANONICAL_FILES
STALE_PACKAGE_ACTION=REBUILD_FROM_LIVE_REPOSITORY
ENGINE_IS_REPLACEABLE=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```

## Regra de evolução

Nova engine, plugin, IDE, chat, CLI ou agente futuro recebe somente um adaptador de descoberta equivalente a:

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ENGINE=<nome-da-superficie>
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
```

Se uma diferença física da superfície for material, documente somente essa diferença. Qualquer regra compartilhada sobe para o core/owner canônico e passa a ser consumida por todos automaticamente.
