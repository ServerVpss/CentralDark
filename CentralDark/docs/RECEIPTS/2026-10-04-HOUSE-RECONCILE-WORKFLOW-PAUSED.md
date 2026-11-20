# PAUSA TEMPORÁRIA — WORKFLOW CASA / RECONCILIAÇÃO

Data: 04/10/2026
Owner: ServerVpss/CentralDark
Workflow: `.github/workflows/dependabot-auto-merge.yml`
Nome: 🤖 Dependabot — radar, compatibilidade e squash seguro

## Estado aplicado

- WORKFLOW_STATE=disabled_manually
- PAUSE_REASON=CASA_SEGREDO_EM_FORMATACAO_RECONSTRUCAO
- CASA_CURRENT_RECONCILIATION_REQUIRED=false
- VPS_PROTECTED_NO_MUTATION=true
- PR_MOTHER_1562_PROTECTED=true
- DIRECT_MAIN_WRITE=0
- MERGE=0
- UNKNOWN_IS_PASS=0

## Jobs de Casa identificados dentro do workflow

- 🪡 Casa — reconciliar PR humano → promotor canônico
- 🧭 Casa — varrer e reconciliar todos os PRs abertos
- 🟢 Casa/Dependabot — aprovar workflows pendentes com gate

## Motivo

A Casa atual não possui delta material que precise ser reconciliado neste momento. O workflow estava gerando jobs `queued` aguardando runner self-hosted da Casa e interferindo visualmente na esteira enquanto a máquina será formatada/reconstruída.

A pausa é operacional e temporária. Não remove o workflow, não altera PRs existentes e não muda a arquitetura híbrida.

## Checklist para reativar

- [ ] Casa formatada
- [ ] CENTRALDARK-OS reconstruído
- [ ] capacidades canônicas da VPS reaplicadas na Casa sem duplicar owner
- [ ] runners da Casa registrados e online
- [ ] labels dos runners comprovados
- [ ] teste read-only da Casa concluído
- [ ] uma execução controlada do workflow concluída
- [ ] workflow reativado
- [ ] contraprova: nenhum job órfão/queued por ausência da Casa
- [ ] receipt final no PR-mãe #1562

## Comando lógico de retorno

CASA_READY=true
→ REENABLE_EXISTING_WORKFLOW
→ ONE_CONTROLLED_RUN
→ SAME_HEAD_PROOF
→ CONTRAPROVA
→ FIXED_POINT
→ #1562

REALITY=JUDGE
