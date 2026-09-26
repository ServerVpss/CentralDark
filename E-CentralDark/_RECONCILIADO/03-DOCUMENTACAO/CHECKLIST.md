<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Checklist IA/Arena — MultiZap / clone-deck

Use este checklist antes de qualquer ação.

## 1. Estado local

```bash
git status --short --branch
git log --oneline -5
```

## 2. Health do webhook

```bash
curl -fsS https://hook.multizap.dev/health
```

Esperado:

```txt
ok: true
service: CloneDeck-GitHub-Webhook
port: 9003
```

## 3. Documentos obrigatórios

- [ ] `conexao-ia/START_HERE.md` — ponto de entrada geral
- [ ] `conexao-ia/VPS_CONNECTION.md` — conexão GitHub/VPS
- [ ] `conexao-ia/CHECKLIST.md` — este checklist
- [ ] **`security/START_HERE.md`** — 🛡️ **Start Here da Segurança** (obrigatório antes de alterar RLS, auth, secrets, Caddy, PM2, WuzAPI)
- [ ] `security/README.md` — documento completo de auditoria de segurança
- [ ] `docs/AGENTS.md` — regras do agente
- [ ] `docs/STATE.md` — estado atual
- [ ] `docs/GITHUB_ACCESS.md` — aliases SSH e regras de acesso GitHub
- [ ] `docs/WEBHOOKS.md` — mapa de webhooks
- [ ] `docs/deploy.md` — fluxo de deploy
- [ ] `docs/SUPABASE_WORKFLOW.md` se envolver banco/migration

## 4. Segurança — Regras Permanentes

- [ ] **Sempre consultar `security/START_HERE.md`** antes de qualquer alteração de segurança.
- [ ] Não expor secrets.
- [ ] Não commitar `.env`.
- [ ] Não pedir SSH, `service_role` ou senha de banco.
- [ ] Não copiar chave privada da VPS.
- [ ] Não usar token no frontend.
- [ ] Não usar `pm2 restart all`.
- [ ] **Melhorar segurança sempre que possível** — toda alteração deve considerar o impacto na segurança do sistema.
- [ ] **Manter padrão de segurança em todo o sistema** — consistência entre módulos Bot, CRM e infraestrutura.

## 5. Áreas protegidas

- [ ] Não mexer em `/root/whatsapp-server`.
- [ ] Não mexer no PM2 `whatsapp-server`.
- [ ] Não mexer na porta `3000`.
- [ ] Não mexer no webhook `9001`.
- [ ] Não mexer no webhook `9002` sem autorização.
- [ ] Não mexer em WuzAPI `8081` sem autorização.
- [ ] Não mexer em Gateway `3100` sem autorização.
- [ ] Não mexer em Supabase/banco sem PR/migration.

## 6. Fluxo correto de alteração

```txt
branch separada -> commit -> push -> PR -> revisão -> merge na main -> webhook VPS
```

Nunca fazer merge sem autorização.

## 7. Após merge

Na VPS, validar:

```bash
cd /root/Multizap/apps/clone-deck
git log --oneline -5
git status --short --branch
curl -fsS https://hook.multizap.dev/health
```

## 8. Segurança Contínua

- [ ] **Sempre perguntar:** "Essa alteração afeta a segurança de alguma forma?"
- [ ] **RLS check:** Se alterar tabela, verificar se policy RLS está correta.
- [ ] **Vault check:** Se adicionar secret, salvar criptografado no `vault_secrets.secrets`.
- [ ] **Redirect check:** Se alterar rota de auth, verificar whitelist + hash validation.
- [ ] **Consistência:** O que vale para Bot, vale para CRM — manter mesmo padrão de segurança.
- [ ] **Documentar:** Toda melhoria de segurança deve ser registrada em `security/README.md`.