# Exemplo operacional: Status semáforo em CentralDark

## Cenário 1: Vermelho resolvido

**Observação:** Screenshot mostra ❌ no painel de CI do `porta-de-entrada`.

**Genealogia:**
```
source: CI panel
scope: porta-de-entrada
artifact: verify_repo_contract.py
timestamp: 2026-08-27 14:30
HEAD/SHA: abc123
cause_signature: python: command not found
```

**Verificação posterior:**
- Commit `def456` corrigiu a causa
- Execução posterior provou PASS

**Classificação:** `historical_resolved`
**STATUS_RECONCILIATION_REQUIRED:** false

## Cenário 2: Verde sem denominador

**Observação:** Dashboard mostra ✅ com texto "Sistema estável, 128 checks, 52 receipts".

**Genealogia:**
```
source: Dashboard visual
scope: sistema
artifact: painel desenhado
timestamp: desconhecido
HEAD/SHA: não informado
cause_signature: não aplicável
```

**Problema:** Painel é arquitetura visual desejada, não prova de estado real.
- 128 checks: sem evidência de quais checks, quais SHAs
- 52 receipts: sem evidência de quais receipts, onde estão

**Classificação:** `NOT_PROVEN`
**STATUS_RECONCILIATION_REQUIRED:** true

**Ação correta:** Checar repo, runners ativos, receipts reais — não confiar no painel.

## Cenário 3: Screenshot sem metadados

**Observação:** Imagem enviada mostra ⏳ mas sem timestamp, sem SHA, sem contexto.

**Genealogia incompleta:**
```
source: Screenshot desconhecido
scope: desconhecido
artifact: desconhecido
timestamp: não tem
HEAD/SHA: não tem
cause_signature: não tem
```

**Classificação:** `UNKNOWN`
**STATUS_RECONCILIATION_REQUIRED:** true

**Ação correta:** Pedir metadados ou checar estado atual independente.

## Regra geral

```
SE screenshot/show/indicator sem metadado → UNKNOWN
SE vermelho + commit posterior resolveu + execução provou → historical_resolved
SE verde + sem denominador (SHA, execução, timestamp) → NOT_PROVEN
SE verde + HEAD mudou + sem revalidação → NOT_PROVEN
SE mesmo indicador reaparece → dedupe pela causa_signature
```
