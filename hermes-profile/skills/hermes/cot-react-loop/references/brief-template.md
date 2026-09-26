# Pseudo-Formal Brief Template

## DEFINITIONS
Termos-chave e casos degenerados do problema.

```text
TERMO_1: definição precisa + casos de borda
TERMO_2: definição precisa + casos de borda
...
```

## SUCCESS_PREDICATE
O que **DEVE** ser verdade ao final (quantificadores explícitos).

```text
CONDICAO_1: mensurável e verificável
CONDICAO_2: mensurável e verificável
...
```

Exemplo:
```
SHA256 do arquivo fixture calculado = valor_esperado
E gravado em output.json com campo "sha256"
E exit_code = 0
```

## NON_COUNTING_OUTCOMES
O que **NÃO** conta como sucesso (armadilhas comuns).

```text
- "rodei o comando"
- "deu exit 0"
- "parece ok"
- "não deu erro"
- "o output parece certo"
- "quase lá"
- "quase certo"
- answer-shaped near misses
- best-effort summaries
- partial progress
```

## FAILURE_MODES
Lista enumerada de jeitos sutis de errar (por domínio).

### Domínio: Terminal/Script
```
FM-T1: Comando executa mas stdout vazio
FM-T2: Exit code 0 mas stderr tem warning crítico
FM-T3: Hash calculado errado (arquivo errado, encoding)
FM-T4: Arquivo não existe / path errado
FM-T5: Timeout silencioso
FM-T6: Comando roda em diretório errado (cwd)
```

### Domínio: Arquivo/JSON
```
FM-F1: JSON malformado / parsing error
FM-F2: Campo esperado ausente no JSON
FM-F3: Valor correto mas tipo errado (string vs number)
FM-F4: Arquivo sobrescrito acidentalmente
FM-F5: Encoding errado (UTF-8 vs Latin-1)
```

### Domínio: Web/Search
```
FM-W1: Resultado de cache / stale
FM-W2: Fonte não confiável
FM-W3: Parsing de HTML quebrado
FM-W4: Rate limit / bloqueio
```

### Domínio: Código/Script
```
FM-C1: Syntax error não capturado
FM-C2: Logic error (off-by-one, edge case)
FM-C3: Dependência não instalada
FM-C4: Variável de ambiente ausente
FM-C5: Race condition / timing
```

### Domínio: Kanban/Git
```
FM-K1: Card errado atualizado
FM-K2: Commit message vazia
FM-K3: Branch errada
FM-K4: Push sem autorização
```

---

## Como Usar

1. **Preencha** cada seção antes de iniciar o loop
2. **Success Predicate** deve ser mensurável (hash, count, exit_code, field value)
3. **Non-Counting** lista o que NÃO engana o critic
4. **Failure Modes** guia o checklist do CRITIC a cada iteração
4. **Revise** o brief se o loop travar ou der PONTO_FIXO