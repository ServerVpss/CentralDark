# COMANDO - entity-registry.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\data\entity-registry.yaml
**SHA:** 531369cee96a2d2d
**Timestamp:** 2026-08-28T02:02:02.573445
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- create-deep-research-prompt:
- db-dry-run:
- generate-ai-frontend-prompt:

### Padroes
- extend-pattern:
- execution-pattern:

### Contratos
- github-devops-pre-push-quality-gate:
- qa-gate:
- verification-gate:
- agent-quality-gate:

### Gaps
- - 'todo:'
- - 'todo:'
- - 'todo:'
- - 'todo:'
- - 'todo:'
- - 'todo:'
- purpose: 'Resolve {TODO: Agent Name} placeholders in all 114 task files'
- - '{TODO: dependency file or N/A}'
- purpose: 'Resolve {TODO: task identifier} placeholders in all 114 task files'

### Ouro Bruto (primeiros 5000 chars)
```
metadata:
  version: 1.0.0
  lastUpdated: '2026-02-22T00:00:00.000Z'
  entityCount: 510
  checksumAlgorithm: sha256
entities:
  squads:
    zona-genialidade:
      path: squads/zona-genialidade/config.yaml
      type: squad
      purpose: Squad para diagnosticar zona de genialidade e gerar blueprint
      keywords:
        - zona-genialidade
        - genius
        - assessment
        - blueprint
      usedBy: []
      dependencies: []
      adaptability:
        score: 0.7
        constraints: []
        extensionPoints: []
      checksum: sha256:2a4fcebfd214daca7e32bffc08e94ada4f429296211794e6ff92443764d0a6a2
      lastVerified: '2026-02-22T00:00:00.000Z'
    dopamine-learning:
      path: squads/dopamine-learning/config.yaml
      type: squad
      purpose: Squad para design de experiências de aprendizagem com dopamina
      keywords:
        - dopamine
        - learning
        - gamification
        - behavior
      usedBy: []
      dependencies: []
      adaptability:
        score: 0.7
        constraints: []
        extensionPoints: []
      checksum: sha256:7b9b9b734a2e0daee1fca2a0b214ce7c59c82bb78b4a1de46af58dce2037f8a3
      lastVerified: '2026-02-22T00:00:00.000Z'
    repertoire-mapper:
      path: squads/repertoire-mapper/config.yaml
      type: squad
      purpose: Squad para mapeamento e sistematização de repertórios pessoais
      keywords:
        - repertoire
        - knowledge
        - mapping
        - tacit
      usedBy: []
      dependencies: []
      adaptability:
        score: 0.7
        constraints: []
        extensionPoints: []
      checksum: sha256:e840fabe2f1a8b015f5b20a83f8e972860a3601563901a465ef579268701fb1d
      lastVerified: '2026-02-22T00:00:00.000Z'
    design-studio:
      path: squads/design-studio/config.yaml
      type: squad
      purpose: Squad de design visual e criativo com elite minds
      keywords:
        - design
        - studio
        - branding
        - visual
      usedBy: []
      dependencies: []
      adaptability:
        score: 0.7
        constraints: []
        extensionPoints: []
      checksum: sha256:b8fef33c050d8313fd199ad954ded7d6dc79886000f33fe1ec6dc277b3a034bd
      lastVerified: '2026-02-22T00:00:00.000Z'
  tasks:
    add-mcp:
      path: .aios-core/development/tasks/add-mcp.md
      type: task
      purpose: Add MCP Server Task
      keywords:
        - add
        - mcp
        - server
        - task
      usedBy: []
      dependencies:
        - Docker MCP Toolkit
        - docker mcp gateway running
      adaptability:
        score: 0.8
        constraints: []
        extensionPoints: []
      checksum: sha256:8a19ae5f343b68d7aace6a8400a18349fb7b4ebc92cecdab33e2a7f4f0d88512
      lastVerified: '2026-02-08T13:33:24.171Z'
    advanced-elicitation:
      path: .aios-core/development/tasks/advanced-elicitation.md
      type: task
      purpose: '- Provide optional reflective and brainstorming actions to enhance content quality'
      keywords:
        - advanced
        - elicitation
        - advanced-elicitation
      usedBy: []
      dependencies:
        - N/A
      adaptability:
        score: 0.8
        constraints: []
        extensionPoints: []
      checksum: sha256:fbd55c3cbafb1336eafb8968c0f34035c2f352b22c45c150c7a327c7697438f9
      lastVerified: '2026-02-08T13:33:24.173Z'
    analyst-facilitate-brainstorming:
      path: .aios-core/development/tasks/analyst-facilitate-brainstorming.md
      type: task
      purpose: '** Validate prerequisites BEFORE task execution (blocking)'
      keywords:
        - analyst
        - facilitate
        - brainstorming
        - checklists
        - needed
        - task
        - facilitates
      usedBy: []
      dependencies:
        - N/A
      adaptability:
        score: 0.8
        constraints: []
        extensionPoints: []
      checksum: sha256:bcbbd3aaf18a82bfedb64e6a31c68fd946d2b83b4e72549d509a78827c0fc5d7
      lastVerified: '2026-02-08T13:33:24.173Z'
    analyze-brownfield:
      path: .aios-core/development/tasks/analyze-brownfield.md
      type: task
      purpose: >-
        Analyze an existing project to understand its structure, tech stack, coding standards, and CI/CD workflows
        before AIOS integration. This task provides recommendations for safe integration and identifi
      keywords:
        - analyze
        - brownfield
        - project
      usedBy: []
      dependencies:
        - brownfield-analyzer
        - documentation-integrity module
      adaptability:
        score: 0.8
        constraints: []
        extensionPoints: []
      checksum: sha256:56da9046b12a44e5fb6b6c0f98ea64f64bf9ab5449ffc35efe4fa2f0a4b6af1f
      lastVerified: '2026-02-08T13:33:24.173Z'
    analyze-cross-artifact:
      path: .aios-core/development/tasks/analyze-cross-artifact.md
      type: task
      purpose: >-
        Executar análise de consistência cross-artifact para identificar gaps, inconsistências, e ambiguidades entre
        PRD, Architecture, Stories, e Spec
```