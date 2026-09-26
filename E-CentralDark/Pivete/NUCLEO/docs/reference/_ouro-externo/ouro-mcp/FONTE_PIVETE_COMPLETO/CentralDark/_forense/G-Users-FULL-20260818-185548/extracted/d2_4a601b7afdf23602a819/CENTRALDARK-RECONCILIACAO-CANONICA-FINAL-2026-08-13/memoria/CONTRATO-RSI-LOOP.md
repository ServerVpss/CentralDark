---
title: Contrato de Leitura e Escrita — RSI Loop
tags: [contrato, rsi, memoria, regras]
created: 2026-08-13
---

# Contrato: RSI Loop ↔ Memória de Longo Prazo

Este documento define **exatamente** como o RSI Loop pode ler e escrever na memória.

## 1. Princípios

1. Fonte da verdade = arquivos (Markdown + JSON/JSONL)
2. Toda escrita é **append-only**
3. Toda escrita gera `fingerprint = SHA256(MISSION_ID + causa_raiz + teste + evidência + HEAD_SHA)`
4. Se o fingerprint já existe → XP_GAINED = 0 e registra `NO_XP_REASON=EVENTO_JA_REGISTRADO`
5. O RSI Loop **pode** ler e escrever de forma autônoma, mas sob este contrato

## 2. O que o RSI Loop PODE ler

| Local | Permissão | Uso |
|-------|-----------|-----|
| `semantica/padroes/` | Leitura livre | Recuperar padrões similares |
| `semantica/causas-raiz/` | Leitura livre | Evitar repetir causas já resolvidas |
| `semantica/guardrails-aprendidos/` | Leitura livre | Aplicar guardrails existentes |
| `semantica/licoes/` | Leitura livre | Reutilizar lições |
| `episodica/ciclos/` | Leitura livre | Histórico de missões |
| `skills/<skill>/` | Leitura livre | Contexto da própria skill |
| `ledger/` | Leitura livre | Verificar XP e fingerprints |

## 3. O que o RSI Loop PODE escrever

| Local | Tipo de escrita | Regra |
|-------|-----------------|-------|
| `semantica/padroes/` | Novo arquivo `.md` | Só se padrão novo (fingerprint único) |
| `semantica/causas-raiz/` | Novo arquivo `.md` | Só com evidência comprovada |
| `semantica/guardrails-aprendidos/` | Novo arquivo `.md` | Quando criar guardrail automático |
| `semantica/licoes/` | Novo arquivo `.md` | Após consolidar aprendizado |
| `episodica/ciclos/` | Novo arquivo por ciclo | Obrigatório ao final do ciclo RSI |
| `skills/<skill>/xp-ledger.json` | Append no history | Sempre + sync global |
| `ledger/xp-ledger-global.json` | Append | Após cada grant de XP |

## 4. O que o RSI Loop NÃO PODE fazer

- Apagar ou editar arquivos existentes (só append / novo arquivo)
- Escrever sem fingerprint
- Conceder XP duplicado
- Alterar tier/level diretamente (só via cálculo de XP)
- Escrever fora das pastas listadas
- Usar vector store como fonte da verdade

## 5. Fluxo obrigatório de escrita

```
1. Gerar fingerprint
2. Verificar se fingerprint já existe no Ledger
3. Se existe → abortar grant de XP
4. Se não existe:
   a. Escrever arquivo semântico/episódico (se aplicável)
   b. Append no ledger local da skill
   c. Append no ledger global
   d. Emitir recibo
```

## 6. Circuit Breaker

Se 3+ ciclos RSI falharem em janela de 10:
- `RSI_CIRCUIT_BREAKER = ATIVADO`
- Para de escrever na memória semântica
- Exige autorização externa (Pivete) para continuar

## 7. Formato mínimo de uma nota semântica

```markdown
---
title: <nome-curto>
tipo: padrao | causa-raiz | guardrail | licao
fingerprint: sha256:...
skill_origem: cot-react-loop
mission_id: ...
created: YYYY-MM-DD
---

# Título

## Contexto
...

## Evidência
...

## Ação tomada
...
```

## 8. Sync com Obsidian

- Todas as notas usam frontmatter YAML
- Links internos no estilo `[[nota]]`
- O arquivo `00-index.md` é o dashboard oficial
