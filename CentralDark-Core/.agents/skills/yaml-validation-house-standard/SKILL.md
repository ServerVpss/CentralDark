---
name: yaml-validation-house-standard
description: Validar YAML da CentralDark em camadas (sintaxe, estrutura, chaves duplicadas e schema/contrato do consumidor) antes de promoção, sem confundir YAML parseável com configuração operacionalmente válida. Usar ao criar/editar *.yml/*.yaml, workflows GitHub Actions, contratos Trigger Fabric, boot/configs ou quando houver falha possivelmente causada por YAML. Não cria segundo parser obrigatório: descobre e reutiliza validadores já disponíveis na Casa e falha fechado quando a camada aplicável não puder ser provada.
---

# YAML VALIDATION HOUSE STANDARD

> Fonte externa de inspiração: Teleport YAML Validator — https://goteleport.com/resources/tools/yaml-validator/
>
> A fonte externa é matéria-prima. A CentralDark absorve somente o mecanismo reutilizável; Teleport não vira dependência, owner, serviço obrigatório nem autoridade da Casa.

## Propósito

Evitar a classe de falso-verde:

```text
YAML_PARSE_PASS
!=
SCHEMA_PASS
!=
CONSUMER_PASS
!=
RUNTIME_PASS
```

A validação correta é estratificada:

```text
ARQUIVO YAML
→ TYPE/ENCODING
→ PARSE/SYNTAX
→ DUPLICATE_KEYS
→ STRUCTURE/SHAPE
→ DOMAIN_SCHEMA/CONTRACT
→ CONSUMER-SPECIFIC VALIDATION
→ TESTE DO CONSUMIDOR QUANDO APLICÁVEL
→ EVIDENCE
→ VERDICT
```

## Quando usar

Ative para qualquer delta material em:

```text
*.yaml
*.yml
.github/workflows/**
CENTRALDARK_AI_BOOT.yaml
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/*.yml
configs/contratos YAML
manifestos YAML
```

Também usar quando o erro observado contiver sinais como:

```text
mapping values are not allowed
could not find expected ':'
duplicate key
unexpected key
workflow invalid
schema validation
YAML parse error
```

## Regra central

```text
VALID_YAML_SYNTAX != VALID_CONFIGURATION
```

Exemplo já relevante para a Casa: um workflow GitHub Actions pode ser YAML sintaticamente válido e ainda ser inválido no schema do Actions, como `runs-on`/`steps` colocados no nível errado.

Portanto:

```text
PARSER_PASS_ONLY
→ SYNTAX_PASS
→ NÃO autoriza CONFIG_PASS
```

## Ordem operacional

### 0. Fixar o alvo

```text
TARGET_FILE=
CONSUMER=
DOMAIN=
BASE_SHA=
HEAD_SHA=
WRITER=
```

Não validar arquivo histórico como se fosse o arquivo consumido agora.

```text
FOUND != CURRENT
HISTORY != CURRENT_STATE
```

### 1. Descobrir validador existente

`REUSE_BEFORE_CREATE` obrigatório.

Procurar, nesta ordem, capacidade já disponível:

```text
repo scripts/tests específicos
→ parser/lib já declarada no projeto
→ CLI já instalada (ex.: yamllint/actionlint quando aplicável)
→ runtime padrão disponível
→ ferramenta externa somente como auxílio, nunca para conteúdo sensível
```

Não instalar dependência nova só para validar um arquivo sem provar GAP_REAL.

```text
DECLARED != INSTALLED
INSTALLED != WORKING
```

### 2. Parse / sintaxe

Validar que o documento é YAML parseável.

Checar pelo menos:

```text
indentação
mapeamentos/listas
aspas/escapes
separadores ':'
document markers quando usados
encoding legível
```

Resultado:

```text
SYNTAX=PASS|FAIL|UNKNOWN|ERROR
```

### 3. Chaves duplicadas

Não confiar em parser que silenciosamente sobrescreve chave repetida.

```text
DUPLICATE_KEYS=PASS
```

somente se a ferramenta aplicável detectar/rejeitar duplicatas ou houver contraprova equivalente.

Se a capacidade disponível não detectar duplicatas:

```text
DUPLICATE_KEYS=UNKNOWN
```

Nunca promover `UNKNOWN` para PASS por conveniência.

### 4. Estrutura / shape

Confirmar que o YAML possui a forma esperada para o consumidor:

```text
required roots
required fields
tipos esperados
listas vs mapas
camadas permitidas
campos proibidos quando conhecidos
```

Isso ainda não substitui schema oficial quando houver um.

### 5. Schema/contrato do domínio

Quando o consumidor possui schema ou regras formais, validá-los.

Exemplos:

```text
GitHub Actions workflow
→ YAML parse
→ workflow/schema semantics
→ expressions/context quando possível

Kubernetes
→ YAML parse
→ resource schema/API contract

Trigger Fabric / CentralDark contracts
→ YAML parse
→ verificador/contrato canônico existente
```

A Teleport descreve a mesma distinção geral: parse/syntax é uma camada e schema validation pode ser uma camada adicional. A Casa cristaliza isso como regra operacional, não como dependência web.

### 6. Validação específica do consumidor

A prova mais forte é o consumidor real ou seu verificador canônico.

```text
COMPONENT_TEST_PASS
!=
INTEGRATION_PASS
```

Para `.github/workflows/*`:

```text
YAML_SYNTAX_PASS
+ ACTIONS_SCHEMA/STATIC_VALIDATION_PASS
+ WORKFLOW_CONSUMER_OBSERVATION quando necessário
```

Se a API/runner ainda não processou o HEAD:

```text
RUNTIME/INTEGRATION=UNKNOWN
```

### 7. Segurança

Não enviar para validadores online YAML que contenha ou possa conter:

```text
secrets
tokens
cookies
senhas
.env material
private keys
credenciais
valores sensíveis de infraestrutura
```

Preferir validação local.

```text
ONLINE_VALIDATOR = OPTIONAL_REFERENCE_ONLY
LOCAL_FIRST = true
SECRET_BEARING_YAML_ONLINE = FORBIDDEN
```

### 8. Correção mínima

Falha detectada:

```text
SIGNATURE
→ localizar nível quebrado
→ identificar causa
→ corrigir menor delta
→ reexecutar MESMAS camadas aplicáveis
→ contraprovar
```

Não reformatar todo o arquivo para corrigir uma chave sem necessidade.

```text
SMALLEST_CAUSAL_DELTA=true
NO_BLIND_REFORMAT=true
NO_V2_V3=true
```

## Matriz de veredito

```text
SYNTAX PASS + SCHEMA PASS + CONSUMER PASS
→ YAML_GATE=PASS

SYNTAX FAIL
→ YAML_GATE=FAIL

SYNTAX PASS + SCHEMA FAIL
→ YAML_GATE=FAIL

SYNTAX PASS + SCHEMA UNKNOWN (schema aplicável)
→ YAML_GATE=UNKNOWN

SYNTAX PASS + CONSUMER UNKNOWN (consumer proof exigida)
→ YAML_GATE=UNKNOWN
```

Nunca:

```text
SYNTAX_PASS → "está tudo certo"
```

## Integração com a Casa

```text
#ACORDAR
→ localizar YAML + consumidor atual

!CALIBRAR
→ fixar intenção e domínio

!MULTIBUSSOLA
→ syntax | duplicate keys | schema | consumer

!META_LUPA
→ tentar achar YAML parseável porém semanticamente inválido

!RECONCILIAR
→ usar owner/verificador existente

!CONTRAPROVA
→ caso inválido conhecido precisa falhar

!REMEDIÇÃO
→ rerun no mesmo HEAD

!FIXED_POINT
→ somente se denominador aplicável fechar
```

## Teste discriminante obrigatório

Quando um validador novo/novo uso for promovido como gate, provar que ele detecta um caso inválido conhecido.

```text
KNOWN_BAD
→ MUST_FAIL

KNOWN_GOOD
→ MUST_PASS
```

Se ele só passa o arquivo atual sem pegar um negativo conhecido:

```text
VALIDATOR_PROOF=INSUFFICIENT
```

Isso evita o falso-verde clássico de um validador que não testa a classe de erro que pretende bloquear.

## Saída operacional

```text
TARGET_FILE=
CONSUMER=
DOMAIN=
HEAD_SHA=
VALIDATOR_REUSED=
SYNTAX=
DUPLICATE_KEYS=
STRUCTURE=
SCHEMA=
CONSUMER_VALIDATION=
KNOWN_BAD_COUNTERPROOF=
FIX_APPLIED=
RETEST=
UNKNOWN=
VERDICT=PASS|FAIL|UNKNOWN|ERROR
NEXT_CURSOR=
```

## Regra curta

```text
YAML
→ PARSE
→ DUPLICATE KEYS
→ SHAPE
→ SCHEMA
→ CONSUMER
→ NEGATIVE TEST
→ REALITY JUDGE
```

```text
YAML_VALIDO != CONFIG_VALIDO
VALIDADOR_PASSOU != CONSUMIDOR_PASSOU
UNKNOWN != PASS
ACTION != PROOF
REALITY = JUDGE
```
