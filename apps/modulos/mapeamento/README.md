# Mapeamento — Cartógrafo do sistema

Módulo 100% VPS. **Não existe painel no Lovable.**

## Papel

Um único Cartógrafo escaneia o sistema a cada 30 minutos, detecta drift e compara a árvore com o mapa canônico.

A estrutura não se organiza livremente. Toda evolução segue:

```text
mapa canônico → procurar encaixe existente → mudança mínima → teste/revisão
→ autorização aplicável → GitHub/SHA → consolidação/trava
```

## Fonte única executável

`config/mapa-canonico.json` é a fonte executável para setores, caminhos canônicos e áreas protegidas. O campo histórico `consolidated_areas` preserva as travas existentes, mas **não prova consolidação sozinho**.

- `CLAUDE.md` continua sendo a visão humana das travas.
- `.github/CODEOWNERS` continua sinalizando propriedade.
- `core/validar-mapa.mjs` é o gate determinístico.
- O workflow `centraldark-validate.yml` executa o gate em runner GitHub hospedado.
- O Cartógrafo executa o mesmo gate na VPS e transforma violação em drift.

Nenhuma dessas visões pode inventar outro mapa.

## O que o gate impede

- módulo novo fora do mapa;
- nomes de versão paralela como `v2`, `copy`, `backup` ou `novo`;
- duplicidade de módulos que difiram apenas por maiúsculas/minúsculas;
- alteração em área protegida sem a autorização canônica `👑 PERMITO-SEGREDO`;
- caminho absoluto, travessia `../` ou entrada duplicada no mapa;
- selo `PROVEN` com prova incompleta, Judge igual ao Writer, teste `SKIPPED` ou alegação de eficácia 100% sem denominador reproduzível;
- selo `PROVEN` cujo fingerprint Git material não corresponde ao alvo no HEAD da prova ou no HEAD atual;
- selo `PROVEN` cujo gate/MetaLupa que produziram a prova mudaram sem revalidação daquela fronteira.

A label registra autorização de `SEGREDO/CHEFE` para a mudança protegida. Autorização permite a cirurgia; **não transforma automaticamente o alvo em consolidado**.

## Promoção para CONSOLIDADO

Existem dois estados diferentes:

```text
PROTECTED_UNPROVEN
→ caminho continua travado por segurança
→ histórico/criticidade justificam proteção
→ NÃO é prova de eficácia nem consolidação

PROVEN
→ caminho protegido + prova fechada no mesmo contrato
→ pode ser chamado de consolidação evidencial
```

O selo `PROVEN` só nasce quando a entrada possui `proof` válido com:

```text
head_sha completo
+ material_git_oid do path no head_sha (blob/tree Git)
+ dependency_git_oids das dependências probatórias obrigatórias
  - apps/modulos/mapeamento/core/validar-mapa.mjs
  - .agents/skills/meta-lupa/SKILL.md
+ evidence_ref
+ writer_ref != judge_ref
+ tests: PASS total, skipped=0
+ efficacy: numerator == denominator > 0, percent=100
+ counterproof_ref
+ rollback_ref
+ lock_mechanism=MAP_PROTECTED_PATH
```

`100%` aqui significa somente **100% do denominador declarado e reproduzível**, nunca certeza global do sistema.

A prova é preservada por dependência causal. Um novo HEAD fora do caminho protegido **e fora das dependências probatórias** não força revalidação se os OIDs continuarem idênticos. Se o material protegido mudar, só aquela fronteira fica stale. Se o gate ou a MetaLupa que sustentam a prova mudarem, a prova dependente também fica stale mesmo que o alvo permaneça byte-idêntico. Dependência ausente ou não reproduzível nunca vira PASS.

Portanto:

```text
HEAD mudou
≠ apagar todas as provas

alvo/dependência da prova mudou
→ invalidar só a prova dependente
→ re-provar a fronteira afetada

alvo/dependências intactos
→ preservar a prova
```

Depois disso, edição continua fail-closed até nova autorização explícita para o caminho exato. Se a prova for inválida, o mapa falha fechado; se a prova histórica estiver ausente, o caminho permanece `PROTECTED_UNPROVEN` em vez de receber falso verde.

## O que escaneia

- estrutura de `/root/CentralDark/apps/modulos/`;
- processos PM2 vivos/mortos;
- commit atual do Git;
- integridade do mapa e das travas.

## Fluxo

```text
cron */30 → cartografo.mjs
      ↓
scanner.mjs coleta snapshot + validar-mapa.mjs confere a árvore
      ↓
compara com logs/mapa-atual.json
      ↓
se drift/violação → salva histórico + dispara Grupo Evolução
      ↓
notifica Card Hermes no Telegram
```

## Prova local

```bash
node --test apps/modulos/mapeamento/tests/validar-mapa.test.mjs
node apps/modulos/mapeamento/core/validar-mapa.mjs --repo-root /root/CentralDark
```

## Cron

`*/30 * * * * node /root/CentralDark/apps/modulos/mapeamento/agents/cartografo.mjs`