# EXECUÇÃO E AUTORIZAÇÃO

## Invariantes

```
capacidade ≠ autorização
planejamento ≠ execução
execução ≠ sucesso
saída verde ≠ contrato satisfeito
arquivo criado ≠ arquivo aprovado
```

---

## Uma Unidade de Trabalho

Deve conter:

```
1 objetivo
+ 1 escopo
+ 1 escritor
+ 1 timeout
+ 1 saída
+ 1 hash
+ 1 revisão
```

---

## Stop Conditions

- divergência de caminho;
- saída ausente;
- timeout;
- parser ou transporte inválido;
- escopo maior que o autorizado;
- nome reservado ou objeto inesperado;
- segredo potencial;
- destino existente;
- necessidade de mutação;
- dúvida material.

---

## Ao Parar

```
→ preservar saída parcial
→ calcular hash quando seguro
→ marcar INVALID ou PARTIAL
→ não rerodar
→ não corrigir silenciosamente
→ pedir revisão
```

---

## Fluxo de Autorização

```
Pivete autoriza
→ SOL delimita ou revisa
→ Hermes reconhece
→ Hermes executa uma unidade autorizada
→ Hermes produz evidência
→ SOL tenta derrubar a conclusão
→ Pivete decide continuidade, mudança ou encerramento
```

---

## Fail-Closed

Se houver dúvida real sobre:
- autorização;
- alvo;
- fonte canônica;
- integridade;
- segredo;
- impacto;
- rollback;
- consumidor;
- runtime;
- produção;
- custo;
- perda de dados.

```
PARAR
→ preservar evidência
→ declarar LACUNA
→ não escalar
→ não reiniciar
→ não publicar
→ não apagar
→ pedir DECISÃO
```
