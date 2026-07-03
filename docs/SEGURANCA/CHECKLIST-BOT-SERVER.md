# Checklist de Segurança — BOT Server

## Objetivo

Garantir que o `apps/bot-server` seja construído com segurança desde o início, sem esperar o sistema inteiro ficar pronto para revisar depois.

Regra geral:

```txt
cada fase nova precisa passar por uma validação mínima de segurança antes de avançar
```

## Status geral

```txt
apps/bot
→ frontend do bot

apps/bot-server
→ central backend dos bots
```

O `bot-server` ainda não deve ser ligado em processo novo até passar pelas fases mínimas abaixo.

---

## Fase 1 — Estrutura e repositório

### Checklist

- [x] `apps/bot-server` criado no repositório.
- [x] `apps/bot-server` criado no caminho operacional da VPS.
- [x] Estrutura básica versionada.
- [x] `README.md` criado.
- [x] `package.json` criado sem scripts perigosos.
- [x] Tipos e contratos iniciais criados.
- [x] Nada ligado em PM2.
- [x] Produção não movida.
- [x] Segredos reais fora do repositório.

### Regra

Tudo que o instalador precisar recriar em VPS nova deve estar no GitHub main.

---

## Fase 2 — Tipos e contratos

### Checklist

- [x] Tipos de domínio definidos.
- [x] Contratos de services definidos.
- [ ] Contratos de gateway definidos.
- [ ] Contratos de webhooks definidos.
- [ ] Tipos exportados por um índice seguro.
- [ ] Nenhum segredo hardcoded.
- [ ] Nenhuma chamada real externa.

### Regra

Nesta fase só pode existir contrato, tipo e documentação. Nada de processo rodando.

---

## Fase 3 — Validação multi-tenant

### Checklist

- [ ] Toda entidade sensível usa `workspace_id`.
- [ ] Todo endpoint planejado recebe/resolve workspace.
- [ ] Services não aceitam operação sem workspace.
- [ ] Mensagens pertencem ao contato e workspace corretos.
- [ ] Instâncias pertencem ao workspace correto.
- [ ] Nenhum dado de um workspace pode aparecer em outro.

### Regra

O frontend nunca deve ser a única barreira de segurança. O backend deve validar escopo.

---

## Fase 4 — API interna

### Checklist

- [ ] Criar rota health sem segredo.
- [ ] Definir autenticação antes de rota sensível.
- [ ] Validar entrada de payload.
- [ ] Limitar tamanho de payload.
- [ ] Padronizar erro sem stack sensível.
- [ ] Criar rate limit para endpoint público.
- [ ] Criar logs sanitizados.

### Regra

Endpoint público só entra depois de autenticação, validação e limite mínimo.

---

## Fase 5 — Armazenamento e banco

### Checklist

- [ ] Confirmar schema correto das tabelas.
- [ ] Confirmar políticas por workspace.
- [ ] Não alterar banco real sem confirmação explícita.
- [ ] Não fazer migração sem relatório.
- [ ] Não logar dados privados completos.
- [ ] Definir status inicial `pending` para envio.
- [ ] Atualizar status de mensagem por retorno confiável.

### Regra

Banco real é camada sensível. Mudança real exige confirmação explícita.

---

## Fase 6 — Gateway externo de mensagens

### Checklist

- [ ] Definir client sem secrets no código.
- [ ] Ler configuração por ambiente seguro.
- [ ] Definir timeout.
- [ ] Definir retry controlado.
- [ ] Tratar falha sem duplicar mensagem.
- [ ] Idempotência por mensagem externa quando possível.
- [ ] Não expor token em log.
- [ ] Não resetar sessão/conexão sem confirmação explícita.

### Regra

Integração externa real só depois de contrato, validação de workspace e logs sanitizados.

---

## Fase 7 — Webhooks

### Checklist

- [ ] Validar origem quando possível.
- [ ] Validar assinatura/token quando existir.
- [ ] Validar schema do payload.
- [ ] Ignorar evento duplicado.
- [ ] Rejeitar payload grande.
- [ ] Registrar erro sanitizado.
- [ ] Garantir workspace correto.
- [ ] Não confiar cegamente no payload externo.

### Regra

Webhook é porta de entrada. Precisa ser tratado como superfície de ataque.

---

## Fase 8 — Workers

### Checklist

- [ ] Worker idempotente.
- [ ] Sem loop infinito sem controle.
- [ ] Retry com limite.
- [ ] Logs sanitizados.
- [ ] Falha não derruba o serviço inteiro.
- [ ] Métrica básica de execução.
- [ ] Não processar item de outro workspace.

### Regra

Worker precisa poder falhar de forma segura.

---

## Fase 9 — PM2 / processo

### Checklist antes de ligar processo novo

- [ ] Health check local criado.
- [ ] Porta definida e documentada.
- [ ] Variáveis necessárias documentadas em `.example` ou template.
- [ ] Logs configurados.
- [ ] Restart policy definida.
- [ ] Consumo básico validado.
- [ ] Nenhum segredo em argumento de comando.
- [ ] Confirmação explícita recebida para ligar PM2.

### Regra

Não ligar PM2 do `bot-server` sem checklist mínimo fechado.

---

## Fase 10 — Caddy / domínio público

### Checklist

- [ ] Não alterar Caddy sem confirmação explícita.
- [ ] Endpoint já autenticado antes de expor publicamente.
- [ ] Rate limit quando aplicável.
- [ ] Headers básicos de segurança.
- [ ] TLS ativo.
- [ ] Health check público/sanitizado.
- [ ] Sem rota debug pública.

### Regra

Expor domínio transforma endpoint interno em superfície pública.

---

## Fase 11 — Instalador

### Checklist

- [ ] Instalador cria `apps/bot`.
- [ ] Instalador cria `apps/bot-server`.
- [ ] Instalador valida Node/PM2/Caddy.
- [ ] Instalador usa templates seguros.
- [ ] Instalador solicita secrets sem logar valores.
- [ ] Instalador gera relatório.
- [ ] Instalador valida health final.
- [ ] Instalador não sobrescreve produção sem confirmação.

### Regra

O instalador deve reconstruir a arquitetura a partir do GitHub main com segurança.

---

## Fase 12 — Auditoria antes de produção real

### Checklist

- [ ] Revisar secrets fora do repo.
- [ ] Revisar endpoints públicos.
- [ ] Revisar permissões por workspace.
- [ ] Revisar logs.
- [ ] Revisar Caddy/domínios.
- [ ] Revisar banco/políticas.
- [ ] Revisar webhooks.
- [ ] Revisar rate limit.
- [ ] Revisar backup e restauração.
- [ ] Revisar monitoramento.

### Regra

Antes de uso real com cliente, fazer auditoria completa.

---

## Próximo passo técnico permitido

Criar apenas contratos do gateway e webhooks:

```txt
apps/bot-server/src/gateways/...
apps/bot-server/src/webhooks/...
```

Sem implementação real, sem processo novo e sem exposição pública.
