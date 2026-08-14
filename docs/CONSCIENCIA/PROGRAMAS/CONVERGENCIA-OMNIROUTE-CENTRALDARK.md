# CONVERGÊNCIA OMNIROUTE → CENTRALDARK — HISTÓRICO RECONCILIADO

```text
STATUS=HISTORICAL_SUPERSEDED
AUTHORITY_NOW=SEGREDO/CHEFE
COORDINATOR_NOW=SOL
EXECUTOR_NOW=PIVETE/HERMES
CURRENT_SOURCE_OF_TRUTH=main + canônicos vivos
CURRENT_PROMOTION_TARGET=main
CURRENT_MERGE_METHOD=squash
FULL_ADVERSARIAL_CONVERGENCE=OPT_IN_BY_SEGREDO/CHEFE
```

Este arquivo preserva a **proveniência** do antigo programa #722/#724, mas não governa mais o comportamento atual.

## O que foi preservado

- OmniRoute foi tratado historicamente como chassis/base para convergir em um único produto CentralDark.
- #724 funcionou como PR-mãe/control-plane durante uma fase da arquitetura.
- Lanes, Writer único por escopo, testes, contraprovas e receipts fizeram parte daquele programa.
- A API única CentralDark, reuse-before-create e proibição de produtos paralelos continuam ideias úteis quando confirmadas pelos canônicos atuais.

O histórico byte a byte anterior permanece no Git. Não reescrever ledger, commits ou lembranças apenas porque usavam semântica antiga.

## O que foi SUPERSEDED

As regras abaixo são **históricas** e não podem mais comandar agente, merge ou promoção:

```text
PR-mãe permanente #724
branch-mãe como destino obrigatório
MERGE NA BRANCH-MÃE
#724 obrigatoriamente OPEN/Draft para sempre
PASS_OR_EXPLICIT_BLOCK como aprovação
Judge/convergência total como gate rotineiro
```

A política viva agora vem de:

1. `LEIA-ME-IA.md`
2. `AGENTS.md`
3. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`
4. `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`
5. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
6. `.agents/skills/meta-lupa/SKILL.md`

## Regra atual

```text
INTENÇÃO AUTORIZADA DO SEGREDO/CHEFE
→ recuperar estado real
→ reutilizar antes de criar
→ menor mudança causal
→ validação aplicável
→ UNKNOWN/SKIPPED/QUEUED/PENDING != PASS
→ se pronto e sem bloqueio material: SQUASH MAIN
→ registrar receipt
```

Convergência adversarial total/Judge/swarm continuam disponíveis **quando SEGREDO/CHEFE solicitar** prova de autonomia, arquitetura, robustez ou generalização. Não são burocracia automática para toda mudança.

## Fechamento de findings antigos

`outdated` por posição não prova cura.

```text
BYTE_CRITICADO_SUMIU?
+
COMPORTAMENTO_CRITICADO_SUMIU?
+
PAPEL_DO_ARTEFATO_CLASSIFICADO?
```

Classificação:

```text
CURADO      = byte e comportamento problemáticos sumiram
MATERIAL    = byte mudou/sumiu, mas a semântica problemática ainda governa superfície ativa
SUPERSEDED  = comportamento antigo foi substituído conscientemente por canônico novo
HISTÓRICO   = proveniência preservada; não governa presente
```

Histórico verdadeiro para sua época não deve ser apagado; sua capacidade de governar o presente deve ser removida.

## #724 após reconciliação

A branch histórica foi reconciliada com a `main` canônica usando árvore da `main`, sem force-push e sem ressuscitar bytes antigos. O PR pode permanecer como proveniência/auditoria, mas **não é fonte paralela de verdade**.

`Accept both` nunca é regra automática: só é válido quando os dois lados são semanticamente compatíveis.

## Identidade

```text
SEGREDO/CHEFE = autoridade humana
SOL = coordenação
PIVETE/HERMES = execução e continuidade
```

`PIVETE` como executor, namespace, nome técnico ou registro histórico é válido. `PIVETE` herdando autoridade humana do SEGREDO/CHEFE em artefato ativo é regressão.
