# Falso verde e oráculos

## Falso verde de comportamento

Integridade do pacote, reconstrução byte a byte e testes passando são
necessários, mas não provam a regra de negócio.

```text
REGRA/SPEC
→ INVARIANTES SEM USAR O CÓDIGO COMO ORÁCULO
→ CONTROLE POSITIVO
→ CONTRAEXEMPLO MÍNIMO
→ ORÁCULO POR MECANISMO DISTINTO
→ RED NA IMPLEMENTAÇÃO DEFEITUOSA
→ MUTAÇÃO QUE DEVE SER REJEITADA
→ GREEN NA CORREÇÃO
→ PAPÉIS + BORDAS + TEMPO
→ INTEGRAÇÃO + CONSUMIDOR
→ ROLLBACK
```

Um “oráculo independente” que copia fórmula, branch, helper ou interpretação
suspeita não é independente.

## Falso verde de instrumento

```text
resultado vazio
404
exit 1
timeout
parser quebrado
texto cortado
```

Esses fatos primeiro descrevem o instrumento. Antes de atribuir ao alvo:

1. verificar canal, filtro, namespace, paginação, quoting e versão;
2. separar falha pré-execução de falha do alvo;
3. procurar canal de proveniência distinta;
4. preservar o resultado inválido sem preenchê-lo por inferência.

## Falso verde de conversa

```text
mensagem copiada ≠ autoria do balão
aba encontrada ≠ alvo confirmado
mensagem visível ≠ mensagem completa
ACK sem NONCE ≠ handshake
```

## Falso verde de projeto

Se teste, lint ou build nem iniciaram por dependência ausente ou lockfile
divergente, o projeto não está “verde”. O gate fica `BLOQUEADO`, com causa
ambiental separada do código alterado.

