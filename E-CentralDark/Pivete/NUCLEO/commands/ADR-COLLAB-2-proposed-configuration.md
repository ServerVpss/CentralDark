# COMANDO - ADR-COLLAB-2-proposed-configuration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\adr\ADR-COLLAB-2-proposed-configuration.md
**SHA:** 1c807b4f5c27108b
**Timestamp:** 2026-08-28T02:02:39.083196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- **Risco:** Baixo - são proteções aditivas
- **Risco:** Baixo - CodeRabbit não é bloqueante por padrão
- **Risco:** Muito baixo - apenas documentação
- **Risco:** Médio - poderia bloquear PRs legítimos se testes forem flaky

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/adr/ADR-COLLAB-2-proposed-configuration.md | Sincronização: 2026-01-26 -->

# ADR-COLLAB-2: Configuração Proposta - Workflow de Contribuição Externa

**Story:** COLLAB-1
**Data:** 2025-12-30
**Status:** Proposto
**Autor:** @devops (Gage) + @architect (Aria)

---

## Contexto

Seguindo a [Auditoria do Estado Atual](./ADR-COLLAB-1-current-state-audit.md), este documento propõe alterações de configuração específicas para habilitar contribuições externas seguras ao AIOS.

---

## Decisão

Implementar uma atualização de configuração em múltiplas fases para estabelecer workflows seguros de contribuidores externos.

---

## Configurações Propostas

### 1. Regras de Proteção de Branch

**Alvo:** branch `main`

```yaml
# Configuração proposta de proteção de branch
branch_protection:
  main:
    # Status checks (CI deve passar)
    required_status_checks:
      strict: true # Branch deve estar atualizada
      contexts:
        - lint # EXISTENTE
        - typecheck # EXISTENTE
        - build # EXISTENTE
        - test # ADICIONAR - garantir que testes passem
        - validation-summary # ADICIONAR - padrão alls-green

    # Revisões de pull request
    required_pull_request_reviews:
      dismiss_stale_reviews: true # EXISTENTE
      require_code_owner_reviews: true # ALTERAR de false
      require_last_push_approval: false # Manter false para OSS
      required_approving_review_count: 1 # ALTERAR de 0

    # Aplicação para admins
    enforce_admins: false # Permitir bypass de maintainer para emergências

    # Restrições de push
    allow_force_pushes: false # EXISTENTE
    allow_deletions: false # EXISTENTE
    block_creations: false # Manter false

    # Resolução de conversas
    required_conversation_resolution: true # ADICIONAR - todo feedback deve ser endereçado

    # Histórico linear (opcional)
    required_linear_history: false # Manter false - permitir merge commits

    # Assinaturas (opcional)
    required_signatures: false # Manter false por enquanto
```

**Comando de Implementação:**

```bash
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test","validation-summary"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null \
  -F required_conversation_resolution=true
```

---

### 2. Configuração CodeRabbit

**Arquivo:** `.coderabbit.yaml` (diretório raiz)

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
# Configuração CodeRabbit do AIOS
# Story: COLLAB-1

language: 'en-US'
tone: professional
early_access: false

reviews:
  # Configurações de revisão automática
  auto_review:
    enabled: true
    base_branches:
      - main
    drafts: false

  # Comportamento de revisão
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false

  # Instruções de revisão específicas por caminho
  path_instructions:
    # Definições de agentes - validação rigorosa
    '.aios-core/development/agents/**':
      - 'Verificar se agente segue estrutura YAML de agente AIOS (persona_profile, commands, dependencies)'
      - 'Verificar se persona_profile inclui archetype, communication style e greeting_levels'
      - 'Validar se todos os comandos listados têm dependências de tarefa correspondentes'
      - 'Garantir que agente tem metadados de visibilidade apropriados para comandos'
      - 'Verificar segurança: sem credenciais hardcoded ou dados sensíveis'

    # Definições de tarefas
    '.aios-core/development/tasks/**':
      - 'Verificar se tarefa segue formato de tarefa AIOS com pontos de elicitação claros'
      - 'Verificar se deliverables estão bem definidos'
      - 'Validar se quaisquer dependências referenciadas existem no codebase'
      - 'Garantir que tarefa tem orientação apropriada de tratamento de erros'

    # Definições de workflows
    '.aios-core/development/workflows/**':
      - 'Verificar se estrutura YAML do workflow é válida'
      - 'Verificar se ordenação e dependências de passos fazem sentido lógico'
      - 'Validar se agentes e tarefas referenciados existem'

    # Arquivos de template
    '.aios-core/product/templates/**':
      - 'Garantir que template segue convenções de template AIOS'
      - 'Verificar se sintaxe de placeholder é consistente'
      - 'Validar se template produz saída válida'

    # Configurações CI/CD
    '.github/**':
      - 'Revisar implicações de segurança'
      - 'Verificar tratamento adequado de secrets'
      - 'Validar sintaxe de workflow'
      - 'Garantir consistência com padrões de CI existentes'

    # Código JavaScript/TypeScript
    '**/*.js':
      - 'Verificar boas práticas de async/await'
      - 'Verificar se tratamento de erros é abrangente'
      - 'Pr
```