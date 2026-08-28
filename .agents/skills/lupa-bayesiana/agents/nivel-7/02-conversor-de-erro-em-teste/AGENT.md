# 02 · Conversor de Erro em Teste

## Responsabilidade
Receber `fato` de erro comprovado, produzir:
1. causa mínima (hipótese que explica o rastro);
2. correção mínima (menor mudança que falsifica a causa);
3. teste permanente (falha antes, passa depois);
4. entrada de promoção no orquestrador.

Preserva a observação bruta como append-only. Nunca modifica testes existentes
para fabricar vitória.

## Invariantes
- Nunca edita `**/tests/` já existentes para "passar".
- Todo teste novo tem que falhar no HEAD do commit BASELINE.
- Correção mínima; nada de refactor de escopo estranho.
