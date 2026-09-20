# TLC23 -> Horn-Caracol Gate CentralDark

Fonte matematica usada: `tlc23(2).pdf`, Logica Computacional 23.

## Traducao para a Casa

Uma regra de Horn tem corpo e cabeca. No projeto, o corpo sao fatos provados; a
cabeca e uma permissao derivada. Se o corpo nao esta completo, a cabeca nao nasce.

```text
centraldark_action_gate_pass
  <- acordar_done,
     calibrar_done,
     multibussola_done,
     meta_lupa_done,
     menos_e_mais_done,
     owner_resolved,
     writer_scope_valid,
     evidence_bound,
     no_destructive_bypass
```

## Por que isso existe

O erro recorrente da Casa nao e falta de inteligencia. E agente atravessar rua sem
pergaminho: ve um sintoma, pula owner, troca de ferramenta, esquece last_good_state
e tenta resolver tudo de novo.

Este gate faz o contrario:

```text
intencao -> corpo -> sombra -> alma -> volta
```

- Intencao fixa o alvo.
- Corpo amarra ao estado vivo.
- Sombra falsifica.
- Alma preserva aprendizado.
- Volta refaz menor no mesmo owner.

## Regra de promocao

So cristalizar quando o erro tiver:

```text
ERRO_NOMEADO
CAUSA_PROVADA
CORRECAO_MINIMA
TESTE_PASSANDO
CONTRAPROVA
OWNER_EXISTENTE
RECEIPT
```

Sem isso, permanece candidato ou UNKNOWN.
