# Regras do Funil Mestre Universal (UNIVERSAL_MASTER_FUNNEL_GATE)

## Visão geral
Todos os gatilhos reconhecidos normalizam para uma única sessão master quando originados do CHEFE. Dentro da sessão master ativa, esses gatilhos são tratados como fases internas, sem criar novos engines ou permitir reentrada recursiva.

## Gatilhos reconhecidos (master_trigger e aliases)
- !CENTRALDARK, #CENTRALDARK
- #ACORDAR, !CALIBRAR
- !MULTIBUSSOLA, !MULTIBUSSOLA_META, !META_LUPA
- !RECONCILIAR, !DELTAUTIL, !CONTRAPROVA, !REMEDICAO, !FIXED_POINT, !REGISTRA, !BOOT
- PEGATUDO
- !REALITY_JUDGE
- #CRISTALIZAR, #CRISTALIZA, #CRYSTALIZAR, #CRYSTALAIZAR, #CRYSTALIZE
- variantes lowercase (ex: !cristalizar, #cristaliza) e hífen (ex: !central-dark, #central-dark)
- frases embutidas (ex: "aciona !CENTRALDARK.", "#cristaliza esta fase")

## Fases canônicas (canonical_phase_prefix)
- ACORDAR (measure)
- CRISTALIZAR_MEASURE
- CRISTALIZAR_FALLBACK

## Requisitos para ação material
Uma ação material (alteração de arquivos, commit, deploy, etc.) só é permitida quando **todas** as condições abaixo são verdadeiras:
1. master_context_active: true
2. acordar_done: true
3. cristalizar_measure_done: true
4. fallback_evaluated: true
5. required_canonical_phases_satisfied: true
6. material_unknown: false (nenhum UNKNOWN material no escopo)

Se qualquer uma falhar, a ação é bloqueada com:
- fail_action: RECEIPT_WITH_NEXT_CURSOR
- nenhum efeito colateral (modo READ_ONLY preservado)

## Fallback entre provedores
O fallback (ex: GitHub ↔ Google Drive) só ocorre com **prova material de falha comprovada** (timeout, indisponibilidade com evidência). Falhas não comprovadas ou sinal parcial não déclenchem troca.

## UNKNOWN e prova
- UNKNOWN nunca se torna PASS.
- Sinal parcial (ex: HTTP 200, processo ativo) não é prova de efeito end-to-end ou correção material.
- Prova deve medir o mesmo alvo/HEAD da afirmação; não trocar claim por outro ambiente.

## Estado e reconciliação
- Nenhuma suposição de estado quando ferramentas falham: se o conector GitHub cai antes de ler, preservar UNKNOWN e persistir NEXT_CURSOR no owner externo (não inferir HEAD ou estado remoto).
- Sempre reconcilie com o existente antes de criar; use menor movimento eficaz.
- Um único Writer por escopo mutável.

## Emojis com função semântica
Emojis devem ter função semântica clara vinculada ao escopo (ex: 🟢🟡🔴 para status de CI/consolidação, 📊 para métricas, 🔒 para segurança). Nunca substituam evidência técnica, logs, dados ou prova.