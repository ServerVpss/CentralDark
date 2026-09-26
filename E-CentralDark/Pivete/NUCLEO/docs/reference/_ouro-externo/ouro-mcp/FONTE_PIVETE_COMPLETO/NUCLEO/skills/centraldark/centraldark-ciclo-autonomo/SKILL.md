---
name: centraldark-ciclo-autonomo
description: Use when operating CentralDark PRs. Automate the loop.
---

# Ciclo Autônomo CentralDark (perfil pivete)

## Quando usar
Operando PRs do repo ServerVpss/CentralDark (709/724/727 ou filhos da branch-mãe #724). O CHEFE provou o fluxo manualmente — agora é automático. Não perguntar "posso?" sobre o que B (permissão total) já cobre.

## TRAVA OBRIGATÓRIA ANTES DE QUALQUER WRITE (PRE_WRITE_REMOTE_RECONCILIATION)
Antes de criar/editar QUALQUER arquivo no repo:
1. FETCH / reler o remoto ATUAL (branch alvo, não fotografia local antiga).
2. Buscar se a INTENÇÃO/CAPACIDADE já existe (mesmo nome diferente, mesmo conceito).
3. SE JÁ EXISTE → reusar / atualizar / referenciar. NÃO criar segunda fonte.
4. SE NÃO EXISTE → criar.
Regras: STALE_CONTEXT_CANNOT_CREATE=true. EXISTING_GOLD_WINS_OVER_DUPLICATE=true.
Falha real (08/08): Hermes criou docs/SELO-OURO-CONVERGENCIA.md duplicando o ouro do CHEFE em docs/CONSCIENCIA/LEMBRANCAS/2026-08-08-SELO-DE-OURO-CONVERGENCIA-E-GRATIDAO.md. Corrigido: duplicado apagado, fonte única preservada. MetaLupa pegou a regressão antes de nascer o duplicado.

## O ciclo (uma esteira, não conversa)
1. **Writer** faz → código/PR-filho na branch-mãe #724, base correta, 1 writer por escopo.
2. **Tester** mede → roda teste no MESMO SHA, captura evidência (pass/fail, métrica).
3. **Judge** tenta quebrar → procura falha, regra violada, falso verde, drift de fronteira canônica.
4. **SOL** sintetiza → 1 voz com veredito (não 5 mensagens).
5. **Hermes** mantém vivo → até ter SAME_SHA + JUDGE + PROMOTION + DEPLOY + HEALTH, repete o ciclo sem parar no meio.

## Regras de parada (só isso volta pro CHEFE)
- credencial/secret exposto ou necessário
- DNS / infra fora do componente
- mudança destrutiva extraordinária
- decisão nova de produto
- evidência nova que contradiz veredito anterior

## Regras de não-retrabalho
- Mesma objeção SEM evidência nova NÃO reabre o ciclo.
- Quem perde pela evidência cede (não rebate com opinião).
- O que funciona vira determinístico: trava com teste/gate (porta-de-entrada.yml, lupa, MetaLupa).
- Menos é mais: PR pequeno, diff enxuto, 1 writer, 1 voz.

## Prova obrigatória antes de declarar pronto
SAME_SHA (teste no commit exato) + JUDGE (avaliador independente passou) + PROMOTION (promovido pra main/branch-mãe) + DEPLOY (se B cobre) + HEALTH (endpoint/vivo). Faltando 1 = NÃO_PRONTO.

## Pitfalls
- Não fingir SOL (Hermes executa, SOL=intenção). Síntese do veredito é do Hermes repassando prova, não invenção.
- Não disparar deploy sem B (labels permito-* + comments). B já aplicado nos PRs 709/724/727.
- Não criar V2 do HUB (ver skill centraldark-hub-control-plane).
- Não parar no meio pra perguntar "posso?" — B já deu.

## APRENDIZADO COMPROVADO (regra do CHEFE 08/08)
UMA ocorrência corrigida NÃO prova aprendizado operacional. A prova forte é:
- surgir OUTRO caso NOVO (não o mesmo)
- sem o CHEFE lembrar nada
- o Hermes fazer sozinho: reconciliar remoto → achar ouro existente → não duplicar → corrigir no ponto → provar
Só então: aprendizado operacional comprovado. Até lá, manter como PENDÊNCIA_DE_PROVA no próprio ciclo. O método deve testar a si mesmo — não espere o CHEFE reapontar.

## Verificação
Ao fechar um ciclo: entregar 1 voz com (a) SHA testado, (b) veredito do Judge, (c) promoção/deploy/health, (d) próximo passo ou blockers reais.
Caso real de trava em `references/caso-selo-duplicado.md`.
