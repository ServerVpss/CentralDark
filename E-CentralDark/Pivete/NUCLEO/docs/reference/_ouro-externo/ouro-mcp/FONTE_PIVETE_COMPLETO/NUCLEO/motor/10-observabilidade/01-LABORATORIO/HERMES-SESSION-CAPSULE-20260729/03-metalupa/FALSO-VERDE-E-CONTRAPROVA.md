# FALSO VERDE E CONTRAPROVA

## O que é Falso Verde

**Falso verde** é quando:

- a saída parece positiva mas o contrato não foi satisfeito;
- o instrumento executou mas não produziu o resultado esperado;
- o arquivo foi criado mas está malformado;
- o código de saída é 0 mas há erro não capturado.

---

## Como Detectar

| Sintoma | Possível Falso Verde |
|---------|----------------------|
| Saída vazia após execução | Arquivo não criado |
| Código 0 mas sem hash | Relatório malformado |
| "SUCESSO" sem evidência | Instrumento não executou |
| Resultado partial sem marcar | Contrato não completo |

---

## Contraprova

Para cada resultado, buscar:

1. **Evidência direta**: hash, código de saída, timestamp.
2. **Evidência contrária**: arquivo não existe, saída vazia, erro no log.
3. **Mecanismo**: foi observado ou apenas inferido?

---

## Na Sessão

Exemplo de falso verde identificado:

- `stage-05b`: código de saída 1, mas relatório criado malformado.
- `stage-05c`: relatório criado, mas excedeu limite de linhas.

Ambos foram marcados como `VERDICT=INVALID`.

---

## Gate de Contraprova

Antes de aceitar qualquer resultado:

```
VERDICT=VALID requer:
✓ saída presente
✓ hash calculado
✓ contrato satisfeito
✓ nenhuma divergência de escopo

Se qualquer item missing → VERDICT=INVALID ou PARTIAL
```
