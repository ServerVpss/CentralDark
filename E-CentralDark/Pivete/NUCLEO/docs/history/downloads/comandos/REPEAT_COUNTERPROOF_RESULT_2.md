
# Repetição da contraprova — o que aconteceu

Hipótese:
`QUANDO EU PERCO, EU GANHO`.

## Tentativa de quebrar
1. Perder e esconder o erro → NÃO gera ganho.
2. Perder e diagnosticar causa errada → pode gerar CRISTAL ENVENENADO.
3. Corrigir uma vez sem regressão/reuso → ganho local, ainda não cristal.
4. Preservar falha + contraprova + correção + regressão + gate + reuso → ganho operacional.

## Nova rodada contra a própria arquitetura
A repetição anterior encontrou:
- fonte IPP `-00` estava stale diante de `draft-haberkamp-ipp-01`;
- receipt produzido pelo mesmo sistema pode ter common-mode failure;
- Reality Judge observa apenas o denominador/sensor disponível;
- intenção textual pode precisar de narrowing/binding mais forte;
- zero regressão universal é falso; zero regressão em denominador fechado é válido.

## Resultado
A repetição NÃO provou invencibilidade.
Ela mostrou a propriedade útil:
`derrota preservada pode aumentar a defesa se o aprendizado for validado e promovido`.

Isso é precisamente o loop:
`MINÉRIO → OURO → CRISTAL`.
