## O que eu achei

**No repositório (GitHub Actions):**
- `.github/workflows/wuzapi-sessions-monitor.yml` — roda a cada 15min, é esse que tá gritando erro. **Vou desativar.**
- Outros workflows mencionam WhatsApp mas só de leitura/validação opcional (`bot-server-validate.yml`, `pr-auto-review.yml`) — **não mexo**, não estão quebrando nada sozinhos.

**Na VPS (PM2):**
- Não consigo listar PM2 ao vivo agora (MCP de execução tá bloqueado nesta sessão).
- Pelo que está documentado no `CLAUDE.md`, o único processo PM2 com nome de WhatsApp é:
  - `whatsapp-server` (pm_id 1) — **já está `stopped`** por padrão, salvo no `dump.pm2`. Ou seja, não tem nada rodando hoje com nome de WhatsApp.
- Pode existir algum `wuzapi`/container Docker rodando, mas isso é serviço separado (não PM2) e você não pediu pra mexer em Docker — então **não toco**.

## Plano

1. **Desativar o workflow `wuzapi-sessions-monitor.yml`**
   - Comentar/remover os gatilhos `schedule` e `workflow_dispatch` (deixo só `workflow_dispatch` desabilitado via `if: false`), assim ele para de rodar sozinho mas o arquivo fica preservado pra reativar depois.
   - Adicionar comentário no topo: `# DESATIVADO — reativar quando voltar a mexer com WhatsApp`.

2. **Registrar pendência** em `docs/PENDENCIAS.md` via MCP:
   - "Reativar workflow `wuzapi-sessions-monitor.yml` e subir processos PM2 de WhatsApp quando começar a mexer com WhatsApp de novo."

3. **PM2 na VPS** — antes de qualquer `pm2 stop`, eu te aponto exatamente o que aparece. Como o MCP de execução está bloqueado nesta sessão, na hora de executar vou rodar `pm2 jlist` e te listar **todos os processos com nome contendo `whats|wuz|wpp|zap`** com status atual. Você confirma quais parar.
   - Pelo que já sei: provavelmente só `whatsapp-server` aparece, e já está parado — então nada a fazer. Mas confirmo na hora.

## Detalhes técnicos

- Arquivo único alterado: `.github/workflows/wuzapi-sessions-monitor.yml`.
- Sem mudança em código de app, sem migration, sem deploy.
- Pendência fica em `docs/PENDENCIAS.md` (prioridade média).

Aprova que eu sigo?
