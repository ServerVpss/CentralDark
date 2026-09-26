# CENTRALDARK — ARQUITETURA CRISTALIZADA

## Interface externa

O CHEFE usa apenas:

```text
!CENTRALDARK <objetivo>
```

ou:

```text
#CENTRALDARK <objetivo>
```

Ambos normalizam para o mesmo evento `CENTRALDARK`.

`!VAMOS_MELHORAR_OQUE_JA_EXITE`, `#VAMOS_MELHORAR_OQUE_JA_EXITE`,
`!MELHORE_OQUE_JA_EXITE`, `#MELHORE_OQUE_JA_EXITE` e as grafias corrigidas
`...EXISTE` convergem para `IMPROVE_EXISTING`.

Na prática, `IMPROVE_EXISTING` já é política padrão de `CENTRALDARK`.

## Cadeia

```text
CENTRALDARK
→ ACORDAR
→ CALIBRAR
→ PEGATUDO
→ TRUE_NORTH_LOCK
   INTENT
   DESTINATION
   PROOF_TARGET
   MATERIAL_SCOPE
→ MULTIBUSSOLA [MODE=META]
→ RESOLVE_REQUIRED_BEARINGS
→ EXECUTE_MATERIAL_BEARINGS
→ FORWARD_ROUTE
→ REVERSE_ROUTE
→ INVERSE_ROUTE (quando discriminante)
→ CROSS_BEARING_RENDEZVOUS

SE DIVERGIR
  → META_LUPA
  → TESTE_DISCRIMINANTE
  → RECONCILIAR
  → RENDEZVOUS

SE ESTADO MATERIAL MUDAR
  → IDENTIFY_CAUSAL_CONE
  → INVALIDATE_ONLY_DEPENDENT_CLAIMS
  → PRESERVE_INDEPENDENT_PROOFS
  → REFIX_AFFECTED_AXES
  → RENDEZVOUS

LOCAL_ANALYSIS_STABLE?
  NÃO → RESIDUAL_MAP → NEXT_CURSOR → CONTINUE
  SIM → LOCAL_FIXED_POINT → NÃO ENCERRA A MISSÃO

→ META_LUPA quando aplicável
→ RECONCILIAR quando aplicável
→ CONTRAPROVA
   PROOF_TARGET_MATCH
   PROOF_OWNERSHIP
   INDEPENDENT_COUNTERPROOF
   EXTERNAL_ANCHOR quando aplicável
→ REMEDIÇÃO_T1
→ REALITY_JUDGE

SE:
  UNKNOWN_MATERIAL=0
  + REQUIRED_BEARINGS_COVERED
  + COUNTERPROOF_SURVIVES
  + T1_STABLE
  + NO_CONTRADICTION
  + HASH_CHAIN_VALID
→ FIXED_POINT_PASS

falha material estável
→ FIXED_POINT_FAIL

fronteira externa real estável
→ FIXED_POINT_BLOCKED

→ REGISTRA
→ BOOT_REFRESH
```

## Por que isso fecha mais saídas

A arquitetura distingue:
- entrada de autoridade vs. conteúdo não confiável;
- fato atual vs. história;
- sensor vs. mundo;
- ação vs. prova;
- prova local vs. conclusão global;
- hash de integridade vs. autenticação;
- imagem/metáfora vs. evidência técnica;
- provider vivo vs. integração local;
- erro histórico vs. conhecimento negativo reutilizável.

Uma IA pode errar numa hipótese; ela não pode promover a hipótese se os gates acima estiverem funcionando.
