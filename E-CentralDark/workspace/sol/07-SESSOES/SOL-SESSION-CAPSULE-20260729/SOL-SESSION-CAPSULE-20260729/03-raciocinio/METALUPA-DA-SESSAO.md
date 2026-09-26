# MetaLupa da sessão

## Motor epistemológico

```text
MAPA
→ OBSERVAÇÃO
→ PROVENIÊNCIA
→ HIPÓTESES DISTINGUÍVEIS
→ PROVA CONTRÁRIA
→ TESTE
→ DECISÃO
→ AUTOLUPA
→ PONTO FIXO
```

## Quatro classes

Cada afirmação recebe uma classe:

| Classe | Significado |
|---|---|
| FATO | observado diretamente pelo canal declarado |
| INFERÊNCIA | conclusão derivada, ainda refutável |
| HIPÓTESE | explicação candidata |
| DESCONHECIDO | falta evidência ou canal |

## Temperaturas

```text
FRIA
→ provar fato local sem inventar mecanismo

MÉDIA
→ separar hipóteses mudando uma variável

QUENTE
→ alvo fixado, autorização, adversarial, regressão, rollback e registro
```

## Aplicação demonstrada

- `PROFILE_SHOW_EXIT=1` depois de erro de wrapper não provou defeito no perfil.
- `NUL` quebrando `Get-Item` provou colisão de namespace, não identidade da
  entrada.
- Script criado e não executado pôde ser rejeitado antes de tocar no perfil.
- `exit 0` do comando simples foi aceito junto com stdout, caminho, versão,
  ausência de stderr e limites do transporte.
- Uma baseline inválida não foi usada para calcular ganho de velocidade.

## Ponto fixo

Uma revisão termina quando outra passagem não muda materialmente:

- hipóteses;
- bloqueios;
- risco residual;
- próximo teste;
- veredito.

Contagem de rodadas não força aprovação.

