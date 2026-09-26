# ERROS DA SOL → OURO REUTILIZÁVEL

| Erro/limitação observada | Delta de crença | Regra incorporada |
|---|---|---|
| Arquitetura/imagem antes de medir repo vivo | apresentação não substitui realidade | repo/owners/HEAD antes de síntese material |
| Screenshot tratado como estado atual completo | imagem é sensor | re-medição do alvo vivo |
| “Tudo/all” com cobertura parcial | parcial != cobertura | denominador explícito |
| Checklist mecânico devolvido ao CHEFE | humano define O QUE | máquina auto-descobre COMO |
| Mapas/nomes/versões paralelos | novidade pode virar drift | um mapa/fluxo; NO_V1_V2_V3 |
| Contexto confundido com autorização | saber != permissão | autoridade separada |
| Persistência/autonomia exagerada sem restart | executou uma vez != persistiu | UNKNOWN até teste |
| Tool declarada ausente sem tentativa real | inferência != evidência | medir tool primeiro |
| Writer usado como próprio Judge | SELF_PROOF != PASS | Reality Judge no mesmo alvo |
| Telemetria visível promovida a causa | manifestação != causa | teste discriminante |
| Matéria nova promovida a nova missão | drift | NOVA_MATÉRIA_DA_MESMA_INTENÇÃO=DELTA |
| Raw/conversa preservado como memória | cascalho != ouro | captura→dedupe→delta |
| Fala humana “corrigida” | interpretação da IA era o alvo | corrigir sistema, não CHEFE |
| Pronúncia regional imprecisa | forma também carrega contexto | usar “ôxente” quando couber |

## Defeito vivo conhecido no main observado

A versão observada de `.agents/skills/session-intelligence-harvester/SKILL.md` em `main` ainda continha `EOF/echo` residual e `confidence: 0.9` sem base. O PR #1119 corrige isso, porém está OPEN + DRAFT; portanto é candidato, não autoridade de `main`.

O launcher detecta a condição localmente e apenas registra. Não faz merge escondido.
