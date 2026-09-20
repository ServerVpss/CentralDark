---
name: selo-xp
description: Fechar missão sem inflar conquista, XP, nível ou selo de conclusão. Usar antes de gravar FINAL em ledger, ao reivindicar achievement, ao declarar ponto fixo ou AutoLupa, ao auditar XP e nível de um registro existente, ao investigar level up suspeito, ou quando um registro contém campos que se contradizem. Exige que todo campo que declara o resultado de um instrumento tenha o instrumento executado. Extensão operacional da meta-lupa; não cria ledger nem tabela de XP paralela.
---

# SELO E XP

Procedimento para fechar missão sem transformar auto-declaração em conquista.

**Subordinação.** A tabela de XP, os nomes de achievement, as penalidades e a
fórmula de nível são da `meta-lupa` e do motor `scripts/meta_lupa.py`. Esta skill
não redefine nenhum deles — só impõe a pré-condição de evidência antes de
reivindicar. Em conflito, o motor e a `meta-lupa` vencem.

**Origem.** Nasceu de um achado real: o ledger canônico do CentralDark tinha 2
FINAIS com `point_fixed_evidential=True` e `autolupa_executed=False`. 50 XP
indevidos. Sem eles, o total honesto ficava abaixo do limiar do nível — o "level
up" comemorado era artefato das violações, não descoberta.

---

## Regra 1 — Resultado de instrumento exige instrumento executado

O defeito central: campos que **relatam a saída de um processo** sendo preenchidos
por quem não rodou o processo.

```text
ponto fixo ......... é o RESULTADO da AutoLupa (Fase 9)
                     → point_fixed=sim exige autolupa=sim. Sem exceção.
teste criado ....... exige o arquivo de teste existindo e rodando
regressão criada ... exige o caso que falha antes e passa depois
guardrail novo ..... exige check executável, não parágrafo em documento
rollback provado ... exige o rollback ter sido executado e verificado
falso verde ........ exige um verde concreto que foi barrado, com qual
```

Auto-declaração não é evidência de si mesma. `--point-fixed sim` é a opinião do
executor; `--autolupa sim` é o instrumento. Um não substitui o outro.

Checagem antes de gravar:

```bash
python guardrails/validar_selo_ponto_fixo.py
# SELO_OK=1 → pode gravar. SELO_OK=0 → corrigir antes.
```

---

## Regra 2 — Um achievement, uma evidência nomeada

Para cada conquista reivindicada, escrever ao lado **a evidência específica**:
comando rodado, arquivo criado, saída observada, commit. Reivindicação sem
evidência nomeada é retirada, não discutida.

```text
ACHIEVEMENT              EVIDÊNCIA EXIGIDA
erro_reproduzido ....... o passo que reproduz, e a saída errada observada
causa_raiz_provada ..... arquivo:linha + por que aquilo causa o sintoma
prova_contraria ........ o que foi buscado CONTRA a própria tese, e o resultado
falso_verde_bloqueado .. qual verde concreto foi barrado
teste_negativo_criado .. caminho do teste + a falha que ele captura
regressao_criada ....... prova de discriminação: falha na base, passa no head
guardrail_novo ......... caminho do check + como ele falha
rollback_provado ....... o rollback executado, com verificação
ponto_fixo_atingido .... AutoLupa executada + zero bloqueio aberto
```

Duas evidências derivadas da mesma execução são **um cluster**, não duas provas
(Princípio 4). Não somar.

---

## Regra 3 — Bloqueio aberto veta ponto fixo

Ponto fixo é: uma nova passagem não altera materialmente hipóteses, bloqueios,
risco residual, próximo teste ou veredito.

Se existe bloqueio aberto, próximo teste pendente, ou correção que depende de
ordem humana → `PONTO_FIXO_ATINGIDO: nao`. Reivindicar mesmo assim é repetir o
defeito que esta skill previne.

Não forçar fechamento por contagem de rodadas.

---

## Regra 4 — Recalcular o nível honesto

Ao auditar XP suspeito, refazer a conta com a fórmula do motor, não com
estimativa:

```text
custo do nível N ........ ceil(100 * 1.15^(N-1))
limiar acumulado do N ... soma dos custos de 1 até N-1
```

Procedimento:

1. Somar o XP de todos os achievements que sobrevivem à Regra 2.
2. Aplicar as penalidades declaradas.
3. Rodar o `level_from_xp` do motor sobre o total honesto.
4. Comparar com o nível gravado.

Se o nível cai ao remover uma conquista mal fundamentada, **aquele level up era
artefato**. Declarar isso explicitamente; é o achado, não um detalhe.

```text
XP declarado ..... 895 → LEVEL 7
XP honesto ....... 845 → LEVEL 6      (limiar do 7 = 878)
```

---

## Regra 5 — Correção de ledger só por append

Ledger é append-only. Nunca editar, truncar, reordenar ou apagar linha para
consertar registro errado — isso apaga a regressão junto com a prova.

```text
PERMITIDO ..... novo registro com --penalty, sob autorização humana
PERMITIDO ..... atestação explícita referenciando o record_hash divergente
PERMITIDO ..... allowlist de dívida conhecida, por record_hash, exposta em log
PROIBIDO ...... editar linha existente
PROIBIDO ...... regravar o arquivo
PROIBIDO ...... remover o registro violador
```

Allowlist de legado é dívida declarada, não perdão: cada entrada carrega o
`record_hash`, o motivo e o XP indevido contabilizado. Se a lista cresce sem
justificativa, ela virou o falso verde que deveria impedir.

---

## Saída obrigatória antes de gravar FINAL

```text
INSTRUMENTOS EXECUTADOS: (autolupa? testes? guardrail? rollback?)
ACHIEVEMENTS x EVIDÊNCIA: (um por linha, com a prova nomeada)
CLUSTERS: (evidências que vêm da mesma execução)
REIVINDICAÇÕES RETIRADAS: (e por quê)
BLOQUEIOS ABERTOS:
PONTO_FIXO_ATINGIDO: sim | nao
XP HONESTO / NÍVEL RECALCULADO:
SELO_OK: (saída do guardrail)
AUTORIZAÇÃO PARA GRAVAR:
```

Faltando qualquer linha, não gravar.

---

## Proibições

1. Não reivindicar conquista sem a evidência nomeada correspondente.
2. Não declarar ponto fixo sem AutoLupa executada.
3. Não declarar ponto fixo com bloqueio aberto.
4. Não editar ledger para corrigir XP — só append autorizado.
5. Não aceitar pedido de "marcar como true" campo que não corresponda a fato,
   venha de quem vier. Isso é evidência inventada, a penalidade mais alta.
6. Não criar tabela de XP, ledger ou nível paralelos ao motor canônico.
