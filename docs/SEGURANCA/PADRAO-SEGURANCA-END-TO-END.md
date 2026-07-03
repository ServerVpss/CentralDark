# Padrão de Segurança End-to-End — CentralDark / MultiZap

## Regra principal

Segurança deve ser aplicada desde o início, em todas as camadas, e não apenas no final do projeto.

A regra é:

```txt
construir com segurança
validar por fase
auditar antes de ativar produção
```

## Princípios

1. Segredo real nunca entra no repositório.
2. Logs no chat devem ser sanitizados.
3. Ações sensíveis exigem confirmação explícita.
4. Toda camada nova deve ter validação mínima de segurança.
5. Produção não deve ser movida ou reiniciada sem controle.
6. O instalador deve nascer seguro, porque será usado em VPS nova.
7. Auditoria completa deve acontecer por fase, não apenas no final.

## Camadas de segurança

### Repositório

- Bloquear `.env` real.
- Bloquear tokens, chaves, sessões e credenciais.
- Versionar apenas `.example`, `.template`, documentação, código e placeholders seguros.
- Manter GitHub main como fonte de verdade para migração/instalação.

### MCP / ferramentas

- Safe automático para documentação e código seguro.
- Sensível confirmado para ações com risco operacional.
- Segredo real bloqueado sempre.
- Logs completos em `revisoes/`, chat só com resumo.

### VPS

- Evitar comandos manuais quando existir fluxo via GitHub/workflow/run-once.
- Toda ação relevante deve gerar relatório em `revisoes/`.
- Não apagar/mover diretórios sem auditoria e confirmação.
- Validar PM2/Caddy/serviços antes e depois de mudanças.

### Bot Server

- Não ligar PM2 antes de contratos e validação.
- Separar frontend `apps/bot` de backend `apps/bot-server`.
- Validar workspace/tenant em todas as chamadas.
- Não confiar apenas no frontend.
- Webhooks devem validar origem, formato e escopo.
- Mensagens devem iniciar como `pending` antes de confirmar envio externo.

### Banco e dados

- Não mexer em banco real sem confirmação explícita.
- Toda tabela multi-tenant deve respeitar `workspace_id`.
- Validar RLS/políticas antes de ativar fluxo real.
- Nunca logar dados privados sensíveis completos.

### API / endpoints

- Validar entrada.
- Validar autenticação/autorização.
- Aplicar rate limit onde houver endpoint público.
- Rejeitar payload grande ou inválido.
- Responder erro sem vazar stack/secret.

### Integrações externas

- Tokens sempre fora do repo.
- Webhook com validação de origem quando possível.
- Reprocessamento idempotente para evitar duplicidade.
- Timeouts e retries controlados.

### Infra / disponibilidade

- Caddy e domínios são sensíveis.
- Proteção DDoS deve considerar Cloudflare/CDN/rate limit quando aplicável.
- Health checks por serviço.
- Monitoramento e alertas.
- Backups e restauração testável antes de depender deles.

### Instalador

- Deve criar estrutura correta a partir do repositório.
- Deve usar templates seguros.
- Deve solicitar secrets no momento certo, sem gravar em logs públicos.
- Deve validar Node, PM2, Caddy, portas e permissões.
- Deve gerar relatório de instalação.

## Gatilhos de auditoria obrigatória

Antes de qualquer etapa abaixo, fazer checklist de segurança:

- ligar PM2 novo;
- expor endpoint público;
- alterar Caddy/domínio;
- conectar banco real;
- ativar webhook externo;
- integrar envio real de mensagens;
- mexer em sessão/QR;
- atualizar instalador;
- apagar/mover diretório antigo;
- preparar venda/migração para outra VPS.

## Estratégia prática

Não parar o desenvolvimento inteiro para uma auditoria gigante agora.

O padrão será:

```txt
implementar pequeno
validar segurança mínima
registrar relatório
seguir para próxima fase
auditoria completa antes de ativar produção real
```

## Próximo passo recomendado

Criar uma checklist de segurança por fase do `bot-server`, começando por:

- contratos/tipos;
- endpoints internos;
- autenticação/autorização;
- validação de workspace;
- webhooks;
- gateway externo;
- PM2;
- instalador.
