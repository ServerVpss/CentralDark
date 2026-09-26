# Validação do Executor Python do Ciclo

## Quando
- O executor Python do ciclo (`centraldark_master_cycle.py`) foi modificado.
- Você está verificando se o executor está funcional antes de confiar nele.

## O que validar

### 1. Sintaxe Python
```bash
python -c "import ast; ast.parse(open('scripts/trigger-fabric/centraldark_master_cycle.py').read())"
```
Se falha: há erro de sintaxe que impede execução.

### 2. self_test
```bash
python scripts/trigger-fabric/centraldark_master_cycle.py --self-test
```
O executor tem casos de teste embutidos. Se `--self-test` não passar, algo está quebrado.

### 3. Gap docs × executor
- `MASTER-CYCLE.yml` pode estar correto (documentação).
- `TRIGGERS.yml` pode estar correto (trigger fabric).
- `centraldark_master_cycle.py` pode estar com duplicação ou erro de sintaxe.

NUNCA assuma que documento correto = executor funcional. Meça o executor diretamente.

## Sinais de regressão no executor

| Sinal | Significado |
|-------|-------------|
| SyntaxError na importação | código quebrado |
| `self_test` falha | lógica quebrada |
| Duplicação de `def normalize` ou `def resolve` | código com duplicação/regrissão |
| `resolve()` com `return` mal formado (chave não fechada) | sintaxe quebrada dentro da função |

## Aplicação 2026-08-26
- `centraldark_master_cycle.py` tinha dois `def normalize` (duplicação) + `resolve()` com `return` mal formado.
- Correção: reescrever executor com única `normalize` e `resolve` consistente.
- Validação: sintaxe OK + `self_test` 22/22 passaram + npm test 4/4 passaram.
