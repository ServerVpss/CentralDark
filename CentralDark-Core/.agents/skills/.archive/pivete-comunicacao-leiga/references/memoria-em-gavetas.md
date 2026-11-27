# Memória em gavetas (explicar ao Pivete)

Fonte alinhada a `pivete-execution-standards/references/hermes-memory-good-stack.md`.

## Uma linha
Memória boa não é uma caixa só — é abrir a gaveta certa na hora certa.

## Gavetas
| Gaveta | Onde | Função |
|---|---|---|
| Bolso | MEMORY.md + USER.md | Sempre perto; snapshot no boot |
| Arquivo | state.db + session_search | Conversa antiga sob demanda |
| Receita | skills | Saber refazer do jeito certo |
| Extra | no máx. 1 provider | Bibliotecário opcional |
| Mesas 3T | HOJE / SEMANA / REGRAS | Método Pivete por cima do Hermes |

## Snapshot do bolso
Gravou no disco agora → conversa atual ainda lê a folha velha → folha nova na próxima sessão.

## Não é “sem memória” se
```text
PROVIDER=nenhum + MEMORY/USER + session DB + skills + 3T
```

## Antes de culpar falta de memória
1. gaveta errada  
2. não chamou session_search  
3. não promoveu skill  
4. bolso cheio/confuso  
5. ordem de recovery errada (plano → HOJE → SEMANA → logs → estado)

## Upgrade seguro
higiene B → holographic se doer → hindsight se precisar grafo → honcho se multi-perfil.  
Nunca provider só porque leu texto da SOL.
