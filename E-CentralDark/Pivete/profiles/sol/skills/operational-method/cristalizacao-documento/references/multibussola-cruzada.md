# Multibussola — Leitura cruzada + comparação com estado atual

Referência: FRENTE 3 (MULTIBUSSOLA) — leitura de `cristalize.html` + comparação com SOUL HERMES-CASA + PR #1381 diverged 48/58 + regra anti-V2.

## Técnica
1. Ler arquivo físico de consolidação (ex: `cristalize.html`).
2. Extrair 5 pontos críticos (tabela com status: 🟢/🟡/🔴).
3. Comparar com memória atual:
   - SOUL (identidade operacional, regra anti-duplicação, anti-V2).
   - Regra anti-V2 (docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS): sem arquivo paralelo `-V2/-V3`; melhorar existente; git versiona.
   - PR pendente (ex: PR #1381 não mergeado) — confirmar se divergência existe e se afeta status do ZIP.
4. Verificar se arquivo respeita regra anti-V2 (atualiza existente vs cria paralelo).

## Regra anti-V2 (resumo da referência canônica)
- Nada de arquivo paralelo `-V2/-V3`.
- Melhorar o que existe — quem versiona é o git.
- Se arquivo físico não existir no workspace, evidência NÃO provada.

## Sinais de divergência a registrar
- PR não mergeado → status PARCIAL reforçado.
- Divergência parcial (ex: 48/58) → declarar explicitamente no arquivo; não declarar ciclo completo.
- Regra anti-V2 respeitada = não há duplicação; apenas atualização do existente.

## Próximo passo recomendado (do arquivo)
Revisar PR com AutoLupa → aplicar correções mínimas → testar → atualizar arquivo → finalizar ZIP → validar com hash antes/depois.
