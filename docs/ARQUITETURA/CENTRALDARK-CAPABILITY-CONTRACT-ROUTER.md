# CentralDark — Capability Contract Router

Status: CANDIDATE
Owner: `docs/ARQUITETURA/CENTRALDARK-OMNI-ROUTER.md`
Intenção: SEGREDO/CHEFE

## Princípio

```text
PAPEL != IDENTIDADE
MODELO != IDENTIDADE
INSTRUMENTO != AGENTE
INSTRUMENTO = CAPABILITY + SIGNAL_SURFACE
```

A Casa não escolhe motor por nome, prestígio ou persona. Escolhe por capacidade mensurável, escopo, custo, fronteira e prova aplicável.

## BOOT

```text
#ACORDAR
→ !CALIBRAR
→ CAPABILITY_CONTRACT_ROUTER
→ HERMES
→ REMEDIÇÃO
→ REALITY_JUDGE
```

Fio:

```text
Tibia
→ papel != identidade
→ capacidade mensurável
→ roteamento determinístico
→ handoff
→ boot
→ prova
→ canônico
```

## Cadeia da Casa

```text
👑 SEGREDO/CHEFE
│ intenção + autoridade
▼
☼ #ACORDAR
│ estado vivo
▼
⚙ !CALIBRAR
│ destino / escopo / prova
▼
🧭 !MULTIBÚSSOLA
│ percepção paralela
▼
☀️ SOL
│ reconcilia — NÃO se autoaprova
├──────────────┬──────────────┐
▼              ▼              ▼
✶ GRAFO        ♄ VIGIA        ♃ J.R.V.S.
estado         observa        coordena agentes
└──────────────┴───────┬──────┘
                       ▼
                 ⊛ META LUPA
                 tenta falsificar
                       │
                       ▼
                🛡️ BOUNDARY/GATE
                       │
                       ▼
                 ✎ WRITER ÚNICO
                       │
                       ▼
                    ☿ HERMES
                executa/preserva
                       │
                       ▼
                   ∞ FABLE LOOP
                 executar → medir
                       │
                       ▼
                EFEITO OBSERVÁVEL
                       │
                       ▼
                    ⚖ JUDGE
                 prova + contraprova
                 ┌─────┴─────┐
               FAIL         PASS
                 │            │
                 ▼            ▼
               🜏 LUPA      RECEIPT
                 │          SHA/estado
                 └─────┬──────┘
                       ▼
                    ✶ GRAFO T1
                       │
                       ▼
                  🕊️ NEXT_CURSOR
                       │
                       ▼
                 PRÓXIMO #ACORDAR
```

## Abstração extraída dos Instrumentos Musicais

O objeto externo é somente proveniência/metáfora. O ouro arquitetural é:

```text
INSTRUMENT
→ EMITTER
→ SIGNATURE
→ TIMESTAMP
→ SOURCE
→ CONTEXT
→ EXPECTED_EFFECT
→ OBSERVED_EFFECT
→ CORRELATION
→ COUNTERPROOF
→ RECEIPT
```

Classes de sinal:

```text
SIGNAL_ONLY
STATE_CHANGE
ACTION_TRIGGER
DECORATIVE
UNKNOWN_EFFECT
```

`UNKNOWN_EFFECT` nunca promove ação automaticamente.

## Capability Contract

Cada motor/ferramenta/worker anuncia capacidades; o router mede/seleciona sem transformar o motor em identidade.

```yaml
capability_contract:
  engine: string
  capabilities: []
  tools: []
  read_scope: []
  write_scope: []
  runtime: local|remote|hybrid
  latency_class: low|medium|high|unknown
  cost_class: free|metered|unknown
  evidence_modes: []
  health: proven|failed|unknown
  observed_at: timestamp
```

Regra:

```text
MISSION
→ REQUIRED_CAPABILITIES
→ DISCOVER_ENGINES
→ FILTER_BOUNDARY
→ FILTER_HEALTH
→ MATCH_CAPABILITIES
→ SERIALIZE_MUTATION_SCOPE
→ EXECUTE
→ OBSERVE
→ REALITY_JUDGE
→ RECEIPT
```

Se nenhum motor satisfizer o contrato:

```text
NO_CAPABILITY_MATCH
→ UNKNOWN
→ NÃO EXECUTA ÀS CEGAS
→ REMEDIA / ESCALA FRONTEIRA HUMANA
```

## Cidades como locais semânticos

A abstração útil de `Cidades` é dividir a Casa em territórios semânticos com função e contrato próprios, sem gerar sistemas independentes:

```text
CASA
├─ CIDADE_ESTADO_VIVO      → runtime / sessão / memória medida
├─ CIDADE_INTENÇÃO         → destino / escopo / autoridade
├─ DISTRITO_SKILLS         → capacidades executáveis
├─ CIDADE_OBSERVAÇÃO       → Vigia / eventos / sinais / monitores
├─ TORRE_CONTRAPROVA       → MetaLupa / testes adversariais
├─ OFICINA_WRITER          → mutação serializada
├─ PORTO_RECEIPT           → evidência / handoff / NEXT_CURSOR
└─ MAPA_SEMÂNTICO          → Grafo derivado do estado
```

Uma cidade é `SEMANTIC_LOCATION`, não novo owner automático.

## Mini World Changes como mutação ambiental

A abstração útil é tratar mudanças pequenas e dinâmicas do ambiente como eventos que alteram contexto sem alterar autoridade:

```text
ENVIRONMENT_CHANGE
→ DETECT
→ CLASSIFY
→ LOCALIZE_SEMANTIC_AREA
→ MEASURE_T0
→ ROUTE_CAPABILITY
→ EXECUTE_IF_AUTHORIZED
→ MEASURE_T1
→ COUNTERPROOF
→ UPDATE_GRAPH
```

Exemplos internos possíveis: tema/cor, layout, monitor ativo, runtime disponível, engine saudável, arquivo criado, configuração alterada, CI concluída.

## Cristalização de design, cores, ambientes, funções e skills

Tudo entra pela mesma semântica:

```text
OBSERVADO
→ CLASSIFICAR
→ RESOLVER LOCAL SEMÂNTICO
→ RESOLVER OWNER EXISTENTE
→ NORMALIZAR COMO TOKEN/CAPABILITY/SIGNAL
→ TESTAR CONSUMIDOR
→ CRISTALIZAR
```

Não se espalha cor, função ou skill por cópia cega. Generalização exige consumidor e contrato.

```text
DESIGN_TOKEN != BUSINESS_LOGIC
COLOR_STATE != AUTHORITY
VISUAL_ALIAS != OWNER
SKILL != IDENTITY
FUNCTION != AGENT
MONITOR != JUDGE
```

## Invariantes

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
MODEL_IS_REPLACEABLE=true
CAPABILITY_BEFORE_MODEL=true
VISUAL_ALIAS_IS_NOT_OWNER=true
ACTION_IS_NOT_PROOF=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
SOL_SELF_APPROVAL=false
```

## Fixed point

```text
INTENT
→ CAPABILITY_CONTRACT_ROUTER
→ ENGINE/TOOL/WORKER
→ HERMES EXECUTION
→ EFFECT
→ REALITY_JUDGE
→ FAIL ? REMEDIATE : RECEIPT
→ GRAFO T1
→ NEXT_CURSOR
→ PRÓXIMO #ACORDAR
```

Nenhum elemento de Tibia vira autoridade, engine ou identidade da Casa. As páginas são matéria de extração de padrão; o canônico continua CentralDark.
