# Segurança, permissões e limites

## Postura do MVP

O Hermes atual **não possui executor de sistema operacional**. Ele conversa, lembra, planeja e bloqueia. Isso reduz o risco enquanto identidade e memória são validadas.

## Níveis de ação

| Nível | Exemplo | Comportamento atual |
|---|---|---|
| leitura local | listar memórias | permitido pelo próprio runtime |
| sugestão | montar plano | permitido |
| ação reversível | abrir aplicativo | não implementado; apenas propõe |
| ação sensível | mover/apagar arquivo | bloqueado |
| ação física | abrir portão | bloqueado |
| ação destrutiva | formatar, resetar, apagar banco | bloqueado |

## Palavras de parada

O projeto reserva:

```text
PARA
TRAVA
CANCELA
```

Em futuras integrações, esses comandos precisam interromper a fila de ações. No MVP não há fila externa nem ação a interromper.

## Lista branca futura

Toda capacidade de ação deverá declarar:

- nome da ação;
- parâmetros aceitos;
- risco;
- confirmação necessária;
- comando de reversão;
- limite de frequência;
- dispositivo ou pasta permitida;
- evidência gerada.

## Secrets

- não colocar chave em `config.json`;
- usar apenas o nome da variável de ambiente;
- nunca registrar valor no log;
- nunca pedir para colar chave em conversa;
- exemplos usam valores vazios ou marcadores.

## Memória e exclusão

Exclusão definitiva de memória não está implementada. Uma fase futura deve usar desativação reversível e confirmação dupla antes de remoção física.
