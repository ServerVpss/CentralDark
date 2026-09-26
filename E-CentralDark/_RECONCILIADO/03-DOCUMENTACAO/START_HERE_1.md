<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# 🛡️ START HERE — Segurança MultiZap

> **Ponto de entrada obrigatório para auditoria de segurança.**
> Leia este arquivo **antes** de qualquer alteração em:
> - RLS / policies do Supabase
> - Autenticação / login / reset de senha
> - Secrets / vault / tokens
> - Caddy / PM2 / WuzAPI / Infraestrutura
>

---

## 📋 Ordem de leitura dentro desta pasta

1. **`security/START_HERE.md`** ← você está aqui (resumo + pendências)
2. `security/README.md` — documento completo com detalhes técnicos

---

## ✅ O que já foi aplicado (resumo)

| # | Medida | Status |
|---|--------|--------|
| 1 | **RLS** — 28 policies em 17 tabelas | ✅ Completo |
| 2 | **Redirect landing page** — Whitelist + hash validation | ✅ Aplicado |
| 3 | **Reset password** — Session validation + OTP 2h | ✅ Aplicado |
| 4 | **Secrets Vault** — pgcrypto no Supabase | ✅ Aplicado |
| 5 | **Email templates** — Português, sem imagem externa | ✅ Aplicado |
| 6 | **Caddy** — Backup + validate obrigatório | ✅ Regra permanente |
| 7 | **PM2** — Sem restart all | ✅ Regra permanente |
| 8 | **WuzAPI** — Sessão preservada | ✅ Regra permanente |
| 9 | **Supabase Auth** — URL, OTP, redirect configurados | ✅ Configurado |
| 10 | **Webhook run-once** — Controle VPS | ✅ Regra permanente |

---

## 🚨 Pendências

| Item | Prioridade | Onde |
|------|------------|------|
| 🔴 **CRM sem "Esqueceu a senha"** | **ALTA** | `apps/crm/src/routes/auth.tsx` |
| 🔴 Validar redirect recovery no CRM | MÉDIA | `apps/crm/src/routes/auth.tsx` |
| 🔴 Testar fluxo recovery completo | MÉDIA | Após merge PR #98 |
| 🔴 Rate limiting email | BAIXA | Supabase config |
| 🔴 MFA para admins | BAIXA | Supabase config |
| 🔴 Rotacionar chaves temporárias | QUANDO FINALIZAR | `ghp_*`, `sbp_*`, `sb_secret_*` |

---

## 🔁 Segurança Contínua — Regra Permanente

A segurança **nunca está "pronta"** — sempre há espaço para melhorar.

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Melhorar sempre** | Toda alteração no sistema é uma oportunidade de rever e fortalecer a segurança |
| **Padrão único** | Bot, CRM, Landing, Gateway, VPS — todos devem seguir o **mesmo padrão** de segurança |
| **Consistência** | Se uma proteção existe no Bot, ela deve existir no CRM e vice-versa |
| **Documentar** | Toda melhoria de segurança deve ser registrada em `security/README.md` |
| **Revisão** | Antes de mergear qualquer PR, verificar o checklist de segurança |

### Checklist de segurança contínua

- [ ] **Essa alteração afeta a segurança?** (autenticação, dados, infra, secrets)
- [ ] **O padrão é consistente?** (Bot e CRM têm a mesma proteção?)
- [ ] **RLS está correto?** (toda tabela nova precisa de policy)
- [ ] **Secrets estão seguros?** (nunca no repo, sempre criptografados no vault)
- [ ] **Redirect está seguro?** (whitelist + hash validation)
- [ ] **Documentação foi atualizada?** (`security/README.md`, `security/START_HERE.md`)

---

## 🔗 Links rápidos

- 📄 **Documento completo:** `security/README.md`
- 📋 **Checklist operacional:** `conexao-ia/CHECKLIST.md`
- 🔐 **Regras de acesso GitHub:** `docs/GITHUB_ACCESS.md`
- 🗺️ **Estado do projeto:** `docs/STATE.md`
- 🔌 **Conexão VPS:** `conexao-ia/VPS_CONNECTION.md`

---

> **Regra:** Atualize este arquivo ao final de CADA alteração de segurança.
> **Lembrete:** Sempre melhore a segurança. Sempre mantenha o padrão.