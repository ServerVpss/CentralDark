# SINCRONIZAR_CASA_COM_MAIN — Protocolo Canônico de Reconciliação Bidirecional

**Status:** CANONICAL (integrado em CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json)

**Reutiliza (não cria sistema paralelo):**
- !CENTRALDARK
- !MULTIBÚSSOLA_META
- !META_LUPA
- !RECONCILIAR
- !CONTRAPROVA
- REALITY_JUDGE

## Intenção
Comparar o que existe na CASA (estado local) com o que existe na main (fonte canônica) e reconciliar os dois lados sem perder nada útil e sem duplicação.

## Regras Obrigatórias
- MAIN = fonte canônica do repositório
- CASA = estado local atual
- NO_BLIND_COPY=true
- NO_BLIND_OVERWRITE=true
- NO_DUPLICATION=true
- REUSE_BEFORE_CREATE=true
- UNKNOWN != PASS

## Fluxo
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBÚSSOLA_META

→ SINCRONIZAR_CASA_COM_MAIN

→ MEDIR MAIN ATUAL
→ MEDIR CASA ATUAL

→ COMPARAR:
   - CASA_ONLY
   - MAIN_ONLY
   - SAME
   - DUPLICATE
   - STALE
   - CONFLICTING
   - UNIQUE_USEFUL

→ TRAZER MAIN → CASA
   somente o que falta ou está mais novo (estado canônico ausente/mais novo)

→ TRAZER CASA → MAIN
   somente DELTA_ÚTIL ainda ausente do canônico

→ SE CONFLITO:
   !META_LUPA
   → TESTE_DISCRIMINANTE
   → !RECONCILIAR
   → nunca sobrescrever no chute

→ !CONTRAPROVA
→ !REMEDIÇÃO_T1
→ REALITY_JUDGE
→ !REGISTRA CADA EVENTO MATERIAL
→ !BOOT

## Invariantes
- NO_BLIND_COPY=true
- NO_BLIND_OVERWRITE=true
- NO_DUPLICATION=true
- REUSE_BEFORE_CREATE=true
- ONE_SYSTEM_ONLY=true
- NO_V1_V2_V3=true
- UNKNOWN != PASS
- HISTORY != CURRENT_STATE
- REALITY_IS_JUDGE=true

## Em Baianês
"olha o que tem lá e cá, junta só o ouro, não joga nada bom fora e não faz cópia besta."

## Notas de Implementação
- Classificação antes de qualquer mutação.
- Conflito sempre vai para !META_LUPA + contraprova.
- Só registra quando há delta material ou prova de ausência de delta.
- Sempre medir os dois lados primeiro.