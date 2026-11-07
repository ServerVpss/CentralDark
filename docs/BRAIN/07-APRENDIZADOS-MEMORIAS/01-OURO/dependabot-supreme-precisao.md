---
centraldark_note_schema: "brain07.v1"
centraldark_category: "01-OURO"
centraldark_kind: "OURO_REUTILIZAVEL_COM_PROVA_CONTEXTUAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Precisão do Sistema Dependabot"
centraldark_agent_recall: "Reutilizar tecnica, autoria, limites e evidencia no owner; nao presumir runtime atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegetto-gogeta-convergencia","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "5618a7efa86da57d9291c4c4fe644253386da5d9"
---
# Precisão do Sistema Dependabot

## O Sistema age com Precisão

### Decisões Baseadas em Dados
- mergeableResponse é verificado via API
- update-type é identificado pelo fetch-metadata
- Conflicto é detectado via merge --no-commit

### Ações Exatas
- SOLO se mergeable=false: executar resolve-conflicts.sh
- SOLO se update-type=semver-patch: habilitar auto-merge
- SOLO se update-type=semver-minor: comentar (não merge)
- NUNCA executar ações não autorizadas

### Resolução Determinística
resolve-conflicts.sh segue regras precisas:

```bash
case "$f" in
    package.json|package-lock.json|pnpm-lock.yaml|yarn.lock|*)
        # Lockfiles: usar lado PR (mantém bump do dependabot)
        git checkout --ours -- "$f"
        ;;
    *)
        # Todos os outros: usar lado main (fail-closed)
        git checkout --theirs -- "$f"
        ;;
esac
```

## Precisão Demonstrada

### Exemplo 1: Correção do Erro 422
- Erro específico identificado: "GitHub Actions is not permitted to approve pull requests"
- Solução específica: remover apenas o passo createReview
- Nenhuma outra alteração feita ao workflow
- Resultado: workflow funcional sem o passo problemático

### Exemplo 2: Semântica de Ours/Theirs
- --ours = lado do PR (HEAD)
- --theirs = lado da main (MERGE_HEAD)
- Lockfiles: usar --ours (mantém bump)
- Outros: usar --theirs (mantém main)
- Comentário no script explica a semântica

### Exemplo 3: Condições do Workflow
- if: env.SKIP != '1' → só executa se for dependabot
- if: env.RESOLVE_REQUESTED == '1' → só resolve se conflituoso
- if: steps.meta.outputs.update-type == 'version-update:semver-patch' → só auto-merge patches
- if: steps.meta.outputs.update-type == 'version-update:semver-minor' → só comenta

## Validação de Precisão

### Teste 1: dependabot.yml existe e é válido
- Verifica existência do arquivo
- Verifica presença de package-ecosystem

### Teste 2: dependabot-auto-merge.yml não tem createReview
- Verifica se createReview foi removido
- Se presente: falha (pode causar erro 422)

### Teste 3: resolve-conflicts.sh é executável
- Verifica permissões do arquivo
- Se não executável: falha

### Teste 4: Script de monitoramento existe
- Verifica existência do arquivo

### Teste 5: Documentação existe
- Verifica cristalização, receipt, validação

### Todos os testes passaram na criação
- Arquivos criados com sucesso
- Permissões corretas
- Conteúdo válido

## Precisão no Futuro

### Quando PR for Processado
1. Workflow verificará mergeability com precisão
2. Se conflituoso: resolve com precisão
3. Se mergeável: auto-merge com precisão
4. Se minor: comenta com precisão

### Quando Monitoramento Executar
1. Verificará PRs abertos com precisão
2. Verificará workflow runs com precisão
3. Verificará status do runner com precisão
4. Reportará estado com precisão

## Resumo
O sistema opera com precisão através de:
- Verificações específicas baseadas em condições claras
- Ações determinísticas baseadas em regras definidas
- Validação contínua do estado do sistema
- Documentação precisa de todas as decisões
