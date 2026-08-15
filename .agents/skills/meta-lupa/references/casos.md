# Casos Aplicados — MetaLupa Bayesiana

Padrões recorrentes em arquivos, agentes e mudanças críticas.

## Caso A — Área consolidada vs funcionando

`funcionando agora` ≠ `consolidado e protegido`.
Promover a CONSOLIDADA exige os 8 campos do Gate de Consolidação (SKILL §Gate).
Trava por padrão após promoção. Confiança alta não desfaz trava.

## Caso B — Falso verde por teste que só confirma

Teste verde que repete a narrativa (ex: status 200 + relatório que copia o status)
é evidência correlacionada, não independente. Contar 1× no ledger.

## Caso C — Duplicação de pasta/rota/serviço

Antes de criar `X2`, rodar Gate de Mapa Único:
localizar Fonte da Verdade → buscar equivalente → encaixe → extensão →
só então NOVO_CAMINHO_JUSTIFICADO. Sem encaixe impossível → BLOQUEADO_POR_DUPLICIDADE.

## Caso D — Posterior alto pedindo deploy

p_posterior=0,95 não autoriza deploy/restart/produção. Aplicar gates separados
(POSTERIOR SUFICIENTE? REPRODUZÍVEL? MESMO SHA? SEM BLOQUEIO? ROLLBACK? AUTORIZAÇÃO?).

## Caso E — Modelo do crítico

Grok/Gemini/DarkAI podem atuar como crítico independente, desde que NÃO sejam
o executor da mudança. Separação de papéis > modelo específico.

## Caso F — AutoLupa detecta regressão

Se nova passagem gera SHA divergente, rollback falho ou falso verde →
CORRIGIR mínimo e repetir. Nunca fechar por contagem de rodadas.

## Caso G — Prova forte não é perfeição do modelo

A evidência de competência não é "o modelo acertou de primeira". É a
arquitetura (lupa + AutoLupa + gates) obrigar: localizar erro → corrigir →
conferir o conjunto inteiro → só então encerrar. Mesmo modelo que erraria
sozinho fica forçado a consertar. Relato do Pivete (2026-07-22): "você
reclamou, ele ouviu, rastreou, corrigiu e provou".

## Caso H — Separar denominadores de contagem

Ao reportar contagens, não misturar subconjunto explícito com panorama
maior. Exemplo real: subconjunto higienizado = 6 BLOQUEADA + 16 PRECISA_PR;
panorama das 34 restantes = 14 BLOQUEADAS + 20 ARQUITETURA. São
denominadores diferentes. Citar os dois sem misturar; se somar, explicar
de onde vem cada fração.

## Caso I — Dissonância Operacional Controlada

Quando a Casa precisar testar a própria capacidade de se corrigir, pode
introduzir uma perturbação sintética **fora do estado canônico** e tentar
falsificar a tese atual. O objetivo é descobrir fragilidade antes que ela
apareça por acidente.

Contrato executável: `docs/CONSCIENCIA/CONTRATO-DISSONANCIA-OPERACIONAL-CONTROLADA.json`.
Regressão: `scripts/lupa/controlled-dissonance.test.mjs`.

```text
CANONICO
→ CLONE/AMBIENTE_ISOLADO
→ INJETAR_CONFLITO_SINTETICO
→ META_LUPA_FALSIFICA
→ CONTRAPROVA
→ DELTA_REAL?
   NAO → DESCARTAR_PERTURBACAO → EVIDENCIA_DE_RESISTENCIA
   SIM → CORRECAO_MINIMA → REGRESSAO → CANDIDATO_A_CRISTAL
→ RESTAURAR/CONFIRMAR_CANONICO_INTACTO
```

Invariantes:

```text
CONTROLLED_DISSONANCE=true
SYNTHETIC_CONFLICT=true
ISOLATED=true
REVERSIBLE=true
OBSERVABLE=true
FALSIFIABLE=true
NON_CANONICAL=true
ZERO_DEPLOY=true
FAKE_EVIDENCE=false
SYNTHETIC_CONFLICT_IS_NOT_EVIDENCE=true
SURVIVING_CONFLICT_IS_NOT_PASS=true
PROVEN_DELTA_IS_CANDIDATE_CRYSTAL=true
REGRESSION_PROTECTED_IS_CRYSTAL=true
CANONICAL_CONTAMINATION=BLOCK
NO_INFORMATION_GAIN=NO_CHANGE
```

A dissonância pode atingir código, arquitetura, owner, prova, provider,
ordenação, aliases ou crença operacional, mas nunca recebe autoridade para
mudar o canônico diretamente. Perturbação é matéria de teste; só o delta que
sobrevive a evidência, contraprova e regressão pode ser absorvido pelo dono
canônico já existente.
