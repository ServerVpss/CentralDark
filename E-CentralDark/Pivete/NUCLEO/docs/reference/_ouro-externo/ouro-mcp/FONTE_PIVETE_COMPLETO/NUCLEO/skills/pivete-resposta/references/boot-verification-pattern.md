# Boot Verification Pattern — Pivete "oi" + state check (04/08/2026)

## Padrão observado
Pivete abre a sessão com cumprimento mínimo (`oi`, `N`, `C`, `Ddd`, `O`) e **exige verificação de estado real antes de dar qualquer direção**. Não entrega missão até confirmar:
1. Profile ativo (`pivete`)
2. Modelo real na sessão
3. Painel/gateway online
4. Sessão atual = `is_active: true`
5. Estrutura do NÚCLEO no disco

## O que NÃO fazer
- Assumir que o boot está ok porque a sessão abriu
- Entregar "bot completo" sem provar cada camada
- Carregar skills/memória sem mostrar evidência de disco

## O que FAZER (checklist de resposta)
```text
1. Confirmar PROFILE=pivete ativo
2. Mostrar modelo + provider real da sessão
3. Verificar gateway (health + sessions API)
4. Confirmar sessão Telegram = is_active: true
5. Ler NÚCLEO do disco (SOUL, REGRAS, HOJE, SEMANA)
6. Declarar estado: "pronto chefe, aguardo rumo" — NÃO "bot completo"
```

## Frase-chave do Pivete
> "Bot completo mas antes cuidado pra não carregar qualquer coisa"

Tradução: **verificação read-only completa ANTES de qualquer execução**. É o R0 estendido para identidade + runtime + disco.

## Evidência desta sessão (04/08)
- `oi` → boot declarado verbalmente
- `N C Ddd O` → verificação silenciosa do Pivete
- `qual sessão mais que painel está mais qual painel está on-line verifica aí` → ordem de verificação real (R0)
- `bot no seu soul deixe me ver como está` → exigência de prova de estrutura canônica
- `review the conversation above and update the skill library` → só depois do estado confirmado, mandou a missão real

## Lição para próximas sessões
Quando o Pivete abrir com cumprimento curto + sinais de "teste de vida", **não declarar prontidão**. Executar o checklist acima e devolver **evidência bruta** (JSON do painel, paths do disco, modelo real). Só depois aguardar a direção.

## Cross-ref
- `hermes-pivete-local-ops` §22 `references/boot-diagnostic-checklist.md`
- SOUL §14 (boot de sessão e continuidade por profile)
- REGRAS #21 NÚCLEO (autorização permanente R0)