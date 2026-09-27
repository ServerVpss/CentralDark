# MetaLupa — guardrail de inchaço de design

Status: EXTENSAO_DA_META_LUPA
Owner: `.agents/skills/meta-lupa/SKILL.md`
Origem reconciliada: `.agents/skills/tecnica-da-lupa/SKILL.md` (legado absorvido, sem segundo owner)

Este guardrail preserva o delta útil do checklist legado sem manter uma segunda "Lupa" canônica.

```text
META_LUPA = TECNICA_CANONICA
DESIGN_BLOAT_REVIEW = LENTE_DA_META_LUPA
DESIGN_BLOAT_REVIEW != NOVA_SKILL
DESIGN_BLOAT_REVIEW != NOVO_OWNER
```

Quando uma entrega grande de design, arquitetura, plano ou código puder esconder complexidade desnecessária, aplicar estes sete filtros dentro da MetaLupa:

1. **Realidade vs aparência** — resolve a ferida real ou só aumenta volume/ornamento?
2. **Impacto no que já funciona** — quais consumidores, contratos e caminhos estáveis são tocados?
3. **Complexidade vs valor** — o ganho material justifica as peças novas? `MENOS_E_MAIS` vence quando preserva capacidade.
4. **Regressão** — existe teste discriminante capaz de provar antes/depois no mesmo alvo?
5. **Rollback** — há caminho reversível proporcional ao risco antes da mutação material?
6. **Legado e dívida** — o delta absorve/reconcilia o passado útil ou apenas empilha outra camada?
7. **Manutenção** — quem/qual owner real continuará sustentando a peça e qual superfície de falha foi adicionada?

Fechamento:

```text
BELEZA_SEM_EFEITO != GANHO
COMPLEXIDADE_SEM_CAPACIDADE != EVOLUCAO
SEM_TESTE_DISCRIMINANTE -> UNPROVEN
SEM_ROLLBACK_QUANDO_MATERIAL -> BLOCK_AFFECTED_MUTATION
OWNER_PARALELO_SE_JA_EXISTE_OWNER -> RECONCILIAR
REALITY = JUDGE
```
