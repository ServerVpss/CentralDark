# AutoClaw Squad - Quick Start

## Ativação do Squad

O squad **AutoClaw** está instalado e pronto para uso!

### Como Ativar o Agente steipete

Existem 3 formas de ativar:

#### 1. Usando o comando de skill (recomendado)
```
/autoclaw:steipete
```

#### 2. Usando menção direta
```
@steipete
```

#### 3. Conversacional
```
Ativar steipete do autoclaw
```

## Comandos Disponíveis

Uma vez ativado, use os comandos com prefixo `*`:

### Deployment e Configuração
- `*deploy` - Deploy completo whitelabel (6 fases do workflow Pedro Valerio)
- `*configure` - Configurar instância OpenClaw existente
- `*upgrade` - Upgrade de versão do OpenClaw

### Security e Validação
- `*secure` - Auditoria e hardening de segurança (3 camadas)
- `*validate` - Checklist de validação end-to-end
- `*status` - Verificar health da instância

### Troubleshooting
- `*troubleshoot` - Diagnosticar problemas comuns
- `*architecture` - Explicar decisões de design (POR QUE foi feito assim)

### Gestão de Componentes
- `*skills` - Gerenciar skills system (add, remove, configure, map to tiers)
- `*router` - Configurar LLM Router (tiers, fallbacks, cost)
- `*channels` - Gerenciar channels (WhatsApp, Slack, Telegram, etc)

### Utilidades
- `*chat-mode` - Modo conversacional sobre OpenClaw
- `*help` - Mostrar todos os comandos disponíveis
- `*exit` - Desativar persona e voltar ao modo base

## Workflow de Deployment (6 Fases)

Quando você usa `*deploy`, steipete orquestra todo o processo:

```
Fase 1-2: Infraestrutura
  steipete --> @devops (Gage)
  - Provisionar VPS (Hetzner)
  - Setup Tailscale + mesh VPN
  - Configurar Docker/systemd
  - Deploy OpenClaw base
  - Setup Portainer

Fase 3: Identidade Whitelabel
  steipete --> @aios-master (Orion)
  - Criar identidade whitelabel
  - Gerar estrutura de agentes
  - Registrar no AIOS

Fase 4: Arquitetura
  steipete --> @architect (Aria)
  - Definir tier architecture LLM
  - Estratégia de skills mapping
  - Design de fallback strategy
  - Review de arquitetura

Fase 5a: Customização
  steipete --> @dev (Dex)
  - Customizar config.js
  - Adaptar skills para o ambiente
  - Implementar custom skills
  - Integração bridge.js
  - Setup Claude Code hooks

Fase 5b: Security
  steipete --> @devops (Gage)
  - Security hardening (firewall, ACLs)
  - SSL/DNS configuration
  - Deploy N8N stack

Fase 6: Validação
  steipete --> @qa (Quinn)
  - Blocklist test cases (50+)
  - Docker sandbox isolation
  - Audit trail compliance
  - End-to-end validation
  - Performance benchmarks
```

## Exemplo de Uso

```bash
# 1. Ativar o agente
/autoclaw:steipete

# 2. Iniciar deployment completo
*deploy

# steipete vai perguntar detalhes e então orquestrar todos os agentes AIOS
# para executar as 6 fases automaticamente

# 3. Ou apenas configurar uma instância existente
*configure

# 4. Ou fazer auditoria de segurança
*secure

# 5. Ou tirar dúvidas sobre arquitetura
*architecture
```

## Core Principles do steipete

Peter Steinberger tem filosofia única de engenharia:

1. **SHIP CODE YOU DON'T READ** - Arquitetura sobre implementação
2. **CLOSE THE LOOP** - Agentes devem verificar seu próprio trabalho
3. **FUN OVER SERIOUS** - Competir contra alguém que está se divertindo é difícil
4. **NEVER REVERT** - Sempre fix forward, reverter custa mais tempo
5. **FAIL-CLOSED SECURITY** - Tudo trancado por default
6. **DESIGN FOR AGENTS** - Organizar codebase para agentes, não humanos
7. **BLAME THE ENVIRONMENT** - Quando agente falha, problema é o sistema
8. **POST-BUILD RETRO** - Sempre perguntar: o que faria diferente?
9. **PROMPTS CURTOS VENCEM** - Expert = prompts curtos
10. **HUMAN IN THE LOOP** - 100% automação = software sem alma

## Estrutura do Squad

```
squads/autoclaw/
├── agents/
│   └── steipete.md              # Persona completa de Peter Steinberger
├── tasks/                        # 8 tasks operacionais
│   ├── deploy-vps-infra.md
│   ├── create-whitelabel-identity.md
│   ├── configure-llm-router.md
│   ├── install-skills.md
│   ├── setup-security-layers.md
│   ├── deploy-n8n-stack.md
│   ├── connect-channels.md
│   └── validate-deployment.md
├── checklists/                   # 5 checklists de validação
│   ├── hetzner-server-checklist.md
│   ├── pre-deployment-checklist.md
│   ├── security-audit-checklist.md
│   ├── post-deployment-validation.md
│   └── smoke-tests.md
├── templates/                    # 3 templates de configuração
│   ├── whitelabel-config-tmpl.yaml
│   ├── systemd-service-tmpl.conf
│   └── docker-sandbox-tmpl.yaml
├── workflows/
│   └── wf-whitelabel-deploy.yaml # Workflow YAML completo
├── config/
│   ├── quality-gates.yaml        # 6 quality gates (2 zero-tolerance)
│   └── veto-conditions.yaml      # 23 veto conditions (8 critical)
├── data/
│   ├── OPENCLAW-WHITELABEL-INSTALL-GUIDE.md  # 980 linhas, 10 fases
│   └── minds/
│       └── steipete_dna.yaml     # DNA Mental de Peter Steinberger
├── docs/
│   └── architecture-decisions.md # Decisões arquiteturais documentadas
└── .synapse/                     # Integração SYNAPSE (ativa)
    ├── manifest
    ├── core
    └── gates
```

## Quality Assurance

### Quality Gates: 6 total
- **Zero Tolerance:** 2
  - QG-AC-5: Security (fail-closed auth, sandbox, audit)
  - QG-AC-6: Validation (end-to-end, 50+ test cases)

### Veto Conditions: 23 total
- **Critical:** 8
- **Zero Tolerance:** 8

### Heuristics: 15
- Source: steipete ST_001 through ST_015
- Baseado em: `data/minds/steipete_dna.yaml`

## SYNAPSE Integration

O squad possui integração SYNAPSE **ativa**:

```yaml
# Core domain: OpenClaw whitelabel deployment rules
CORE_STATE=active
CORE_ALWAYS_ON=true

# Quality gates domain
GATES_STATE=active
GATES_ALWAYS_ON=true
```

Isso significa que o contexto do squad é injetado automaticamente quando relevante.

## Troubleshooting

### Problema: Comando não reconhecido
**Solução:** Certifique-se de usar `/autoclaw:steipete` para ativar primeiro

### Problema: Agente não está respondendo como Peter
**Solução:** Verifique se o arquivo `squads/autoclaw/agents/steipete.md` foi carregado corretamente

### Problema: Tasks não estão disponíveis
**Solução:** Tasks são carregadas sob demanda quando você usa comandos `*`. Use `*help` para ver lista completa.

## Suporte

Para mais informações:
- README do squad: `squads/autoclaw/README.md`
- Install Guide: `squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md`
- Architecture: `squads/autoclaw/docs/architecture-decisions.md`

---

**Version:** 1.0.0
**Created:** 2026-02-14
**Squad Type:** Single Expert + AIOS Handoffs
