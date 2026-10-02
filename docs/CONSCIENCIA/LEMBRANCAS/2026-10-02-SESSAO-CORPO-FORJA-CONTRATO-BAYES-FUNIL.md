# 2026-10-02 — Sessão: corpo único, forja local, contrato portátil, Bayes, funil e explicação causal

## Papel

Memória expandida da sessão. Não substitui CURRENT nem os owners atômicos. Resume o fio que conectou os aprendizados #128–#141 e preserva fatos, decisões, contraprovas e NEXT_CURSOR.

## 1. Corpo e topologia

- Direção consolidada pelo CHEFE: ONE_SYSTEM_ONLY. O alvo é um corpo canônico CentralDark-OS, não corpos concorrentes.
- Casa/VMware = forja/laboratório local para construir, integrar e provar o mesmo sistema.
- VPS = twin headless 24/7 da mesma linhagem, usado como corpo remoto persistente.
- GitHub = memória/owner canônico + funil auditável, não necessariamente bancada mecânica de descoberta.
- Quando o mesmo artefato/fingerprint já foi provado na forja, não criar “prova da prova” sem ganho de informação. Entrega/identidade do artefato é claim distinto de retestar funcionalmente tudo.
- Próxima direção arquitetural recuperada: AionUi/Hermes da Casa consumir a IA/runtime do twin CentralDark-OS; depois replay do mesmo artefato/receita na VPS.

## 2. Organização física observada na Casa

Snapshot desta sessão:
- E:\CentralDark funcionava como raiz de organização/orquestração, não como checkout monolítico.
- E:\CentralDark\w-skills foi observado como worktree Git real de ServerVpss/CentralDark, com 11.333 tracked files na medição.
- E:\CentralDark\CentralDark agrupava workspaces por data.
- _IMPORTS segregava donors/imports.
- _MAPA_CASA carregava receipts.
- E:\CentralDark\Pivete foi medido ausente naquele momento, embora referências históricas ainda existissem.

Regra: snapshot local não é invariante. Revalidar paths/HEADs antes de chamar de CURRENT.

## 3. Método cognitivo padrão

DEFAULT_OPERATION_MODE=CANONICAL_SELF_GRILL.

Fluxo:
CHEFE traz delta/intuição
→ recuperar intenção vigente
→ consultar DOCS/owners/receitas/CURRENT
→ SELF_GRILL/META_GRILL
→ tentar falsificar a intuição com o próprio cânone + realidade
→ sobreviveu: continuar sem ritual
→ caiu: mostrar contradição concreta
→ setor → owner → receita/fingerprint → menor delta → efeito → prova/contraprova → fixed point → receipt → next cursor.

DOCS_ARE_EXTERNALIZED_METHOD_NOT_MIND_READING=true.

## 4. Contrato portátil

Owner: CENTRALDARK_AI_BOOT.yaml#portable_operation_contract.

- identidade/invariantes fixas;
- HEAD, writer, rotas e evidência = RESOLVE_AT_BOOT;
- cópia colada = HANDOFF_POINTER_NOT_SOURCE_OF_TRUTH;
- NEW_CHAT_IS_NEW_SURFACE_NOT_NEW_BRAIN=true;
- reancorar = voltar ao método e então resolver CURRENT, não voltar a snapshot velho.

## 5. Bayes da reancoragem

Reinjeção é intervenção T=1, não prova.

H = executor alinhado ao fio canônico.
A=1 = todos os indicadores materiais aplicáveis passam.

Fórmulas canônicas no contrato:
- odds/prior;
- likelihood ratio;
- posterior;
- entropia;
- information gain;
- uplift;
- risk ratio;
- posterior Beta;
- Brier Score;
- limiar;
- VOI.

INVENTED_PROBABILITY=FORBIDDEN.
INVENTED_LR=FORBIDDEN.
Sem base numérica = NOT_CALCULABLE.
Claim causal de uplift exige controle/baseline pareado.

## 6. Funil de reconciliação

Se mini contrato M está contido no oficial O:

M ⊆ O
Δ = M \ O = ∅
IG_create = 0

Resultado: DROP_DUPLICATE → REUSE_OFFICIAL_OWNER.

Se houver delta compatível:
ABSORB_ONLY_DELTA → EVOLVE_SAME_OFFICIAL_OWNER → UPDATE_FINGERPRINT → REVALIDATE_AFFECTED_CONE_ONLY.

Se houver conflito:
META_LUPA → META_MULTIBUSSOLA → teste discriminante → contraprova → só o sobrevivente entra.

## 7. Meta-Lupa

Na medição da sessão:
- identity/hash guard PASS;
- suite direta 53/53 PASS;
- 3 temperaturas PASS;
- CLI Bayes PASS.

O pytest da Casa falhou antes da suite por ModuleNotFoundError: pygments.lexers._mapping.
Classificação: instrumento Python quebrado naquele caminho; não Meta-Lupa core quebrada.

## 8. Meta-Multibússola

Na medição da sessão:
- owner canônico existente;
- META_MULTIBUSSOLA é perfil, não segundo motor;
- 4 aliases;
- 4 rotas;
- 6 proof gates;
- evaluator completo → FIXED_POINT_PASS;
- unknown_material=1 → LOCAL_FIXED_POINT_NOT_YET;
- teste isolado PASS;
- registry de !MULTIBUSSOLA PASS.

Vermelhos adjacentes preservados fora do core:
- !EXECUTOR_CENTRALDARK declarado sem item correspondente no ADMINISTRAVEIS.json;
- teste de webhook esperava retired enquanto CURRENT observado estava active;
- teste esperava normative_hierarchy: no Trigger Fabric CONTRACT e não encontrou.

## 9. Explicação causal dos vermelhos

Formato cristalizado:

RED_NAME | SECTOR | DETECTOR | DIRECTORY_OR_OWNER

Regras:
DETECTOR_FAIL != TARGET_FAIL
LOCAL_RED != GLOBAL_RED
ONE_TEST_FAIL != CORE_BROKEN
CORE_PASS + ADJACENT_RED = SHOW_SEPARATELY
COMPARISON_FIRST
EXPLANATION_SECOND

## 10. Cristal agregado

ONE_SYSTEM_ONLY=true
CASA_VMWARE_ROLE=FORGE_AND_LOCAL_PROOF_LAB
VPS_ROLE=HEADLESS_24X7_TWIN_EXECUTION_BODY
GITHUB_ROLE=CANONICAL_MEMORY_AND_FUNNEL
SAME_FINGERPRINT_SAME_PROOF=REUSE_CRYSTAL
PROOF_OF_PROOF_WITHOUT_INFORMATION_GAIN=FORBIDDEN

DEFAULT_OPERATION_MODE=CANONICAL_SELF_GRILL
PORTABLE_OPERATION_CONTRACT=CANONICAL_REQUIRED
BAYESIAN_REANCHOR_MEASUREMENT=CANONICAL_REQUIRED

MINI_CONTRACT_SUBSET_OFFICIAL=DROP_DUPLICATE_REUSE
COMPATIBLE_DELTA=ABSORB_ONLY_DELTA
CONFLICT=FALSIFY_WITH_META_LUPA_AND_META_MULTIBUSSOLA

FAILURE_MATRIX_COLUMNS=RED_NAME|SECTOR|DETECTOR|DIRECTORY_OR_OWNER

## Contraprova

- arquitetura desejada não vira runtime provado só por estar cristalizada;
- snapshot local de path/HEAD envelhece;
- VM/VPS “iguais” precisam compartilhar artefato/fingerprint para herdar a mesma prova;
- contrato colado não garante comportamento matematicamente 100% determinístico de LLM;
- vermelho de detector não contamina core sem teste discriminante.

## NEXT_CURSOR

Reancorar qualquer nova superfície pelo contrato portátil, resolver CURRENT e continuar pelo próximo cone arquitetural: AionUi/Hermes ↔ runtime/IA do twin local; depois reutilizar receita/fingerprint no VPS quando o mesmo artefato for promovido.
