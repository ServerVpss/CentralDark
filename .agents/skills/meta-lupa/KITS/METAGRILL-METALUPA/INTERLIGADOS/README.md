# 🔗 !># INTERLIGADOS · COSTURA CANÔNICA

**OWNER:** `.agents/skills/meta-lupa/SKILL.md`  
**KIT:** `.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/`  
**MODO:** espelho semântico + roteamento mental. Não cria engine, router, writer ou arquitetura paralela.

## 🪬 TRILHA VISUAL

```text
👑🪬 !CENTRALDARK          → INTENÇÃO / PORTA RAIZ
🔗 !># INTERLIGADOS       → COSTURA DO CORPO
⭕ !AURÉOLA CANÔNICA      → TRILHA VISUAL
🧿 #ACORDAR               → MEDIR O AGORA
🎛️ !CALIBRAR              → FIXAR ESCOPO E RÉGUA
🧭 !MULTIBÚSSOLA          → CRUZAR LENTES
🔎 !META_LUPA             → FALSIFICAR / JULGAR CLAIMS
🔄 !RECONCILIAR           → ABSORVER DELTA NO OWNER CERTO
⚖️ !CONTRAPROVA          → TENTAR QUEBRAR O VERDE
💠 !FIXED_POINT           → FECHAR A RODADA SEM MATAR APRENDIZADO
🧾 !REGISTRA              → PERSISTIR RECEIPT / PRÓXIMO CURSOR
🚀 !BOOT                  → RETOMAR O CORPO PELO CÂNONE
⚖️ REALIDADE              → JUIZ FINAL
```

## 🧠 FÓRMULA POR BAIXO DO PANO

```text
INTENÇÃO
→ MEDIÇÃO
→ OWNER EXISTENTE
→ CAPACIDADE NECESSÁRIA
→ ROTA DETERMINÍSTICA
→ AÇÃO MÍNIMA
→ OBSERVAÇÃO
→ CRÍTICA
→ CONTRAPROVA
→ DELTA ÚTIL
→ RECEIPT
→ NEXT_CURSOR
```

`🔗 !># INTERLIGADOS` não manda executar tudo por cerimônia. Ele liga o pedido ao menor subconjunto necessário e preserva o caminho de volta.

## 🧩 TRÊS CAMADAS DO MESMO ORGANISMO

```text
MENTAL      → emoji + âncora curta para lembrar a função
SEMÂNTICA   → gatilho resolve intenção para owner/capacidade
OPERACIONAL → skill/owner real executa, mede e registra
```

Nenhum gancho mental substitui o owner real. Nenhum texto de PR substitui código/teste/runtime. Nenhum sensor vira autoridade.

## 📚 ÍNDICES DESTE BLOCO

```text
PADROES-PR/REGISTRY.json             → base histórica deduplicada até a varredura anterior
PADROES-PR/DELTA-PR-1493-1550.md     → padrões sobreviventes recentes com gatilhos/emojis
PADROES-PR/REFRESH-2026-09-16.json   → delta machine-readable dos padrões recentes
SKILLS/REGISTRY.json                 → inventário mental determinístico das skills cristalizadas
SKILLS/INTERLIGACAO-OPERACIONAL.json → cadeia máquina: intenção → skill → handoff → prova
SKILLS/MAPA-MENTAL-OPERACIONAL.md    → mapa visual das skills, gatilhos e cadeia de decisão
RUNTIME/FRONTEIRAS-REAIS.md          → somente o que ainda precisa Casa/VPS/runtime atual
RUNTIME/API-TOOL-RESOURCE-BRIDGE.md  → ponte recurso temporário ↔ path estável
RECEIPTS/                            → rastros desta cristalização
```

## 🔗 REGRA UNIVERSAL DE SKILL

```text
👑 SINAL
→ 🔗 !># INTERLIGADOS
→ CLASSIFICAR TERRITÓRIO
→ SKILLS/REGISTRY.json
→ LER SKILL.md MATERIAL
→ SKILLS/INTERLIGACAO-OPERACIONAL.json
→ CAPABILITY-CONTRACT-ROUTER
→ MENOR CONJUNTO SUFICIENTE
→ ONE_WRITER_PER_SCOPE
→ EXECUÇÃO/MEDIÇÃO
→ CONTRAPROVA
→ REALIDADE
```

Os paths físicos continuam como já existem. **MAIÚSCULAS + EMOJIS são memória visual**, não renome de pasta. Isso evita quebrar imports, hashes e referências.

## ⏰🪡 COSTURA VIVA — TIK-TAK

A COSTURA não é uma etapa única. Em PRs alimentadas continuamente, ela opera como laço orientado a eventos: `main` avança, PRs atrasadas recebem a base atual, o novo HEAD dispara nova medição e qualquer avanço posterior da `main` reabre somente o cone necessário.

```text
⏰ TIK
MAIN_CURRENT muda
→ 🔄 sweep de Update branch
→ 🪡 branch do PR recebe CURRENT

⏰ TAK
PR_HEAD muda
→ synchronize
→ 🔍 remede HEAD + behind_by + checks/reviews
→ conflito? owner git-conflict-resolve-house-standard
→ resolvido? commit/push só na branch do PR
→ same-head prova
→ próxima mudança retorna ao TIK
```

```text
COSTURA_NAME_ONLY=true
NO_VERSIONED_COSTURA=true
EVENT_DRIVEN_NEAR_REAL_TIME=true
STRICT_ZERO_LATENCY_REAL_TIME=false
CURRENT_MAIN_REMEASURE_EACH_CYCLE=true
CURRENT_PR_HEAD_REMEASURE_EACH_CYCLE=true
OLD_UP_TO_DATE_SNAPSHOT_IS_HISTORY_AFTER_MAIN_ADVANCES=true
OLD_REVIEW_IS_STALE_AFTER_HEAD_ADVANCES=true
NO_STALE_GREEN=true
```

A regra de astúcia é: **não esperar acumular dívida para depois reconciliar tudo**. Cada evento alimenta a próxima costura; se dois eventos cruzarem no tempo, o estado mais novo vence por remedição, nunca por memória do run anterior.

Ações humanas e equivalentes de máquina convergem no mesmo owner:

```text
Update branch      → sincronizar base na branch do PR
Accept Both        → mecanismo de composição, quando semanticamente válido
Mark as resolved   → registrar arquivo resolvido no índice
Commit merge       → gravar a resolução na branch do PR
Merge PR / squash  → promoção separada
```

## 🔒 LEIS

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING_NOT_REPLACE=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION_SERIALIZE_MUTATION=true
SOURCE_PATTERN != RUNTIME_PROOF
PR_PATTERN != PR_IMPLEMENTATION_PROMOTED
CURRENT > HISTORY
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
EMOJI != PROOF
REALITY_IS_JUDGE=true
```
