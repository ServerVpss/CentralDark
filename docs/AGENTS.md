# AGENTS — ponte de compatibilidade

Este caminho existe apenas para consumidores históricos que ainda procuram `docs/AGENTS.md`.

## Fonte canônica

Antes de qualquer ação, carregar nesta ordem:

1. `/LEIA-ME-IA.md`
2. `/AGENTS.md`
3. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
4. `docs/CONSCIENCIA/REGRA-COMITE-DELTA-CONTINUO.md`

Este arquivo **não** define uma segunda identidade, segundo fluxo de deploy ou segundo contrato de agentes.

## Doutrina obrigatória

```text
CENTRALDARK = organismo canônico
REUSE_BEFORE_CREATE = obrigatório
EXTEND_EXISTING = preferido
V2_V3_NOVO_FINAL_COPY_BACKUP = proibido quando a capacidade já existe
MESMA_FUNÇÃO = evoluir owner canônico
UNKNOWN/SKIPPED/PENDING = não são PASS
SEGREDO/CHEFE = autoridade humana final
MODELO/AGENTE = capacidade substituível
ZERO_REGRESSAO = obrigatório
CURRENT > HISTORY
REALIDADE = JUDGE
```

## Revisar antes de criticar, recomendar, mutar ou registrar

Todo consumidor legado que entra por `docs/AGENTS.md` herda a mesma lei global do owner canônico de Comitê:

```text
OWNER_BEFORE_OPINION=true
REVIEW_BEFORE_CRITIQUE=true
REVIEW_BEFORE_RECOMMENDATION=true
REVIEW_BEFORE_MUTATION=true
REVIEW_BEFORE_REGISTRATION=true
PAPAGAIO=OFF
```

Fluxo mínimo:

```text
RECUPERAR_INTENCAO
→ MEDIR_CURRENT
→ MAPEAR_TERRITORIO_RELEVANTE
→ LOCALIZAR_OWNER
→ LER_REGRAS_DO_OWNER
→ CRUZAR_PR_ISSUE_COMMIT_WORKFLOW_RUNTIME_QUANDO_APLICAVEL
→ SEPARAR_HISTORY_DE_CURRENT
→ CLASSIFICAR_PROVADO_REFUTADO_UNKNOWN
→ CONTRAPROVAR
→ SO_ENTAO_RESPONDER_OU_AGIR
```

Antes de propor reconstrução total, sistema paralelo ou novo entrypoint:

```text
localizar owner atual
→ abrir implementação
→ mapear consumidores/testes
→ provar gap material
→ aplicar menor extensão segura
```

Sem gap comprovado, a resposta correta é reutilizar, corrigir ou não mudar.

## Lacunas materiais e receipt

Lacuna material provada não pode desaparecer nem virar narrativa ornamental.

```text
MATERIAL_GAP_PROVEN
→ REPORT_TO_ACTIVE_COMPATIBLE_PR
→ IDENTIFY_CANONICAL_OWNER
→ IDENTIFY_SINGLE_WRITER
→ APPLY_MINIMAL_REVERSIBLE_FIX quando autorizado e suportado
→ REMEASURE
→ COUNTERPROOF
→ RECEIPT
```

Toda mutação material registra SHA/HEAD/link/teste quando aplicável. Campo não medido permanece `UNKNOWN`.

```text
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
OLD_HEAD != NEW_HEAD_PROOF
GREEN_CHECK + MATERIAL_UNKNOWN_HIDDEN = NOT_PASS
```

## Segurança

- nunca expor secrets, `.env`, tokens ou chaves;
- sem force-push;
- sem push direto de `main` local suja;
- sem deploy/restart/reset destrutivo fora da autorização aplicável;
- runtime só é exigido como prova quando o claim pertence ao runtime;
- correção em tempo real não significa escrita cega: exige current, owner, writer, menor delta, remedição e contraprova.

Histórico MultiZap permanece no Git e em documentação histórica; ele não dirige a identidade operacional atual da CentralDark.
