# COMANDO - adr-hcs-health-check-system.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\adr\adr-hcs-health-check-system.md
**SHA:** 05c6fdefe5133cca
**Timestamp:** 2026-08-28T02:02:39.094316
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Decisão:** Execução principal é manual (comando `*health-check`), com integração secundária de CI agendado.
- **Decisão:** Usar checks baseados em código para funcionalidade core, checks baseados em YAML para extensibilidade.
- **Decisão:** Implementar três camadas de auto-correção com regras de segurança estritas.
- **Decisão:** Criar biblioteca de componentes compartilhados estendendo o Dashboard de Qualidade da Story 3.11.
- **Decisão:** Executar checks CRITICAL primeiro, parar em falha crítica no modo rápido.

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/adr/adr-hcs-health-check-system.md | Sincronização: 2026-01-26 -->

# ADR: Arquitetura do Sistema de Health Check

**ID do ADR:** ADR-HCS-001
**Status:** Proposto
**Criado:** 2025-12-30
**Autor:** @architect (Aria) via @dev (Dex)
**Story:** Investigação HCS-1
**Decisores:** @architect, @po, Tech Lead

---

## Contexto

AIOS precisa de um sistema abrangente de health check para:

1. **Diagnosticar problemas** em configuração do projeto, ambiente e integrações
2. **Habilitar auto-correção** para problemas comuns sem intervenção manual
3. **Rastrear dívida técnica** identificando estados degradados
4. **Fornecer visibilidade** da saúde geral do projeto através de dashboards
5. **Integrar com CI/CD** para monitoramento contínuo de saúde

### Declaração do Problema

Atualmente, desenvolvedores precisam diagnosticar manualmente problemas em múltiplos domínios:

- Drift de configuração do framework
- Má configuração de ambiente
- Integrações MCP quebradas
- Dependências desatualizadas com vulnerabilidades de segurança
- Inconsistências de configuração de IDE

Isso leva a:

- Tempo desperdiçado em debugging
- Ambientes de desenvolvimento inconsistentes entre a equipe
- Falhas silenciosas que se manifestam posteriormente como bugs
- Vulnerabilidades de segurança passando despercebidas

### Requisitos

1. **Modos de Execução:** Manual, CI agendado, pós-merge, opcional em background na IDE
2. **Domínios de Check:** Coerência de projeto, ambiente local, repositório, deploy, serviços
3. **Auto-correção:** Abordagem em camadas (silenciosa, solicitada, guia manual)
4. **Performance:** Modo rápido <10s, modo completo <60s
5. **Extensibilidade:** Suporte para checks customizados específicos do projeto
6. **Integração:** Reutilizar componentes do Dashboard de Qualidade da Story 3.11

---

## Decisão

Implementaremos um **Sistema Híbrido de Health Check** com a seguinte arquitetura:

### Decisões Core de Arquitetura

#### 1. Modelo de Execução: Manual-First com Integração CI

**Decisão:** Execução principal é manual (comando `*health-check`), com integração secundária de CI agendado.

**Justificativa:**

- Segue padrões da indústria (Flutter doctor, Homebrew doctor, WP-CLI doctor)
- Evita fricção de workflow de pre-commit hooks
- Padrão Terraform: Detecção separada de remediação
- Padrão Kubernetes: Monitoramento contínuo em background

**Alternativas Rejeitadas:**

- Pre-commit hooks: Muito lento (10-30s), desenvolvedores ignoram com `--no-verify`
- Always-on background: Complexo, preocupações de performance
- Apenas CI: Sem feedback imediato para desenvolvedores

#### 2. Arquitetura de Checks: Híbrida (Código + YAML)

**Decisão:** Usar checks baseados em código para funcionalidade core, checks baseados em YAML para extensibilidade.

**Justificativa:**

- Código fornece performance e capacidade de lógica complexa
- YAML fornece customização fácil específica do projeto
- Padrão WP-CLI: Checks core + `doctor.yml` checks customizados
- Padrão VS Code: Isolamento core + flexibilidade de extensão

**Estrutura:**

```
.aios-core/core/health-check/
├── checks/           # Checks JavaScript core (33 checks)
│   ├── project/
│   ├── local/
│   ├── repository/
│   ├── deployment/
│   └── services/
└── ...

.aios/
└── custom-checks.yaml  # Checks YAML específicos do projeto
```

**Alternativas Rejeitadas:**

- Apenas baseado em código: Não extensível para necessidades específicas do projeto
- Apenas baseado em YAML: Limitado para checks complexos (ex: npm audit)
- Sistema de plugins: Over-engineered para necessidades atuais

#### 3. Auto-correção: Modelo de Segurança em Três Camadas

**Decisão:** Implementar três camadas de auto-correção com regras de segurança estritas.

**Camadas:**

1. **Camada 1 (Silenciosa):** Operações seguras, reversíveis, apenas no framework
2. **Camada 2 (Solicitada):** Risco moderado, requer confirmação do usuário
3. **Camada 3 (Guia Manual):** Alto risco, fornece apenas instruções

**Justificativa:**

- Padrão Terraform: Separação explícita de plan vs apply
- Padrão npm: Checks de integridade com recuperação controlada pelo usuário
- Padrão VS Code: Auto-update de coisas seguras, bloqueio de coisas perigosas
- Padrão Git: Sempre preservar histórico (reflog)

**Regras de Segurança:**

- Nunca modificar código fonte do usuário
- Nunca tocar em credenciais/secrets
- Sempre criar backups antes de modificação
- Nunca fazer push para repositórios remotos

**Alternativas Rejeitadas:**

- Duas camadas (auto/manual): Falta meio-termo para riscos moderados
- Sem auto-fix: Perde oportunidade de correções sem fricção
- Auto-fix agressivo: Muito arriscado, poderia causar perda de dados

#### 4. Integração com Dashboard: Componentes Compartilhados

**Decisão:** Criar biblioteca de componentes compartilhados estendendo o Dashboard de Qualidade da Story 3.11.

**Justificativa:**

- Princípio DRY: Reutilizar setup existente de Chart.js, Tailwind
- UX Consistente: Mesma l
```