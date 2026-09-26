# Auditoria adversarial R3 — PACOTAO-CENTRALDARK-RIGOR-MAXIMO

## Alvo congelado

```text
ARQUIVO=PACOTAO-CENTRALDARK-RIGOR-MAXIMO(1).zip
SIZE_BYTES=1442278
SHA256=0295a20f3b955678ef9505e3a9f8a0d48272ff22d98db9f6fd56e0af7f4cb03a
ZIP_FILES=79
ZIP_ENTRIES=93
BASELINE_VERIFY=PASS
BASELINE_TESTS=59/59
```

## Veredito calibrado

```text
STATUS=BLOCKED_R3_COUNTERPROOFS
CONTRAPROVAS_REPRODUZIDAS=5
TODAS_FECHADAS=NAO
PRONTO_PARA_INSTALACAO_AUTONOMA=NAO
```

O hash, tamanho, contagem do ZIP e a suíte 59/59 foram reproduzidos. O erro está na conclusão **“todas fechadas”**: a suíte prova apenas os casos cobertos por ela.

## R3-001 — Enxame aceita respostas vazias

Uma resposta HTTP 200 com `message.content=[]` passa pelo teste de presença antes da sanitização. Depois vira texto vazio, mas ainda conta como agente bem-sucedido.

```text
CALL_PROVIDER_TEXT_LENGTH=0
AGENTS_USED=5
FAIL_COUNT=0
ENXAME_STATUS=OK
```

Correção: validar o texto **depois** da normalização e exigir `typeof text === "string" && text.trim().length > 0`.

## R3-002 — Recibo autogerado não é raiz de confiança

A função oficial `createEvidenceReceipt()` aceitou evidência inventada e criou um receipt content-addressed. O mesmo módulo aceitou esse receipt e promoveu o aprendizado:

```text
PROMOTED=true
REASON=PROVA_COMPLETA
```

Hash prova integridade do conteúdo, não veracidade da execução. Correção: receipt precisa nascer de executor/gate separado e conter comando, saída, exit code, HEAD verificado e assinatura/attestation fora do controle do autor do aprendizado.

## R3-003 — Manifesto interno pode ser reescrito junto com o código

Foi adicionado um `runtime/nested/secret-reader.mjs` com leitura de `.env` e JavaScript inválido. Depois o manifesto interno foi recalculado. O verificador respondeu:

```text
VERIFY_EXIT=0
VERIFY_STATUS=PASS
SECRET_READ_SCAN=PASS
NODE_CHECK_TOTAL=16
```

Causa comum:

- `runtime/` e `tests/` são percorridos apenas no primeiro nível para syntax check e secret scan;
- `FILE-HASHES.sha256` fica dentro da mesma árvore mutável e não possui âncora externa independente.

Correção: descoberta recursiva + assinatura/âncora externa do manifesto ou comparação obrigatória com SHA esperado fornecido fora da árvore instalada.

## R3-004 — TAP ainda pode ser falsificado

Um teste rastreado pelo manifesto imprimiu um resumo falso antes de criar um teste realmente pulado. O verificador leu a primeira ocorrência textual:

```text
PARSED_TESTS=60
PARSED_PASS=60
PARSED_SKIPPED=0
REAL_SKIPPED_PRESENT=SIM
VERIFY_STATUS=PASS
```

Correção: não analisar stdout não confiável com regex. Usar reporter estruturado próprio, arquivo JSON criado pelo runner, ou parser TAP que consuma o plano/final summary autoritativo.

## R3-005 — O mesmo delta afirma e nega regressão

Sem evidência de regressão, o delta declara:

```text
REGRESSAO_PRESERVADA=SIM
```

Mas o Policy Gate registra simultaneamente:

```text
REGRESSAO_PASSOU=NAO
```

Correção: `REGRESSAO_PRESERVADA` deve ser `DESCONHECIDO` ou `NAO_COMPROVADA` até existir receipt de regressão válido.

## Causa consolidada

```text
HASH INTERNO ≠ RAIZ DE CONFIANÇA
RECEIPT AUTOGERADO ≠ PROVA INDEPENDENTE
HTTP 200 + VALOR TRUTHY ≠ RESPOSTA VÁLIDA
REGEX NO STDOUT DO TESTE ≠ RECIBO AUTORITATIVO
DECLARAÇÃO ESTÁTICA ≠ REGRESSÃO COMPROVADA
59/59 ≠ COBERTURA DE TODAS AS PROMESSAS
```

## Próximo ciclo coeso

```text
1. Tipar e validar resposta do provedor depois da sanitização.
2. Separar emissor do receipt do consumidor de learning.
3. Tornar syntax check e secret scan recursivos.
4. Ancorar FILE-HASHES fora da árvore ou assiná-lo.
5. Substituir regex TAP por resultado estruturado confiável.
6. Tornar REGRESSAO_PRESERVADA dependente de prova real.
7. Adicionar R3-001..R3-005 como regressões permanentes.
8. Reexecutar pacote antigo, pacote corrigido e extração limpa.
```
