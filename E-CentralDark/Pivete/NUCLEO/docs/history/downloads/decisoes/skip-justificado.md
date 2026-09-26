---
title: Skip Justificado — Kimetsu Legacy
---

# Skip Justificado

## Regra

Cada Respiração material deve ser **considerada**.
Mas não precisa ser executada quando **não adiciona informação**.

---

## Formato Obrigatório

```text
BREATH=<NOME_DA_RESPIRAÇÃO>
STATUS=SKIP_JUSTIFICADO
REASON="<razão explícita e objetiva>"
```

---

## Exemplo

```text
BREATH=FLOR
STATUS=SKIP_JUSTIFICADO
REASON="Nenhuma análise de detalhe altera a decisão atual."
```

---

## Proibido

```text
STATUS=PASS
```
para técnica não executada.

---

## Regra de Ouro

> **Skip não é "pular". Skip é "considerou e decidiu que não agrega".**
> A razão deve ser auditável e falsificável.