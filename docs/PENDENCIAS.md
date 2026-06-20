# Pendências — CentralDark / MultiZap

Fonte ÚNICA de pendências do projeto. Qualquer item novo entra aqui.
Status: 🔴 alta · 🟡 média · 🟢 baixa · ✅ concluído

---

## 🟡 #1 — Migração centralldark.com + telepainel.centralldark.com
**Status:** em andamento (código pronto, falta executar na VPS)
**Sintoma:** site só responde pelo preview do Lovable; domínios próprios ainda não apontam.
**Como fechar:**
1. Apontar DNS dos 3 hostnames pro IP da VPS (`89.117.78.124`):
   - `centralldark.com` → A `89.117.78.124`
   - `www.centralldark.com` → A `89.117.78.124`
   - `telepainel.centralldark.com` → A `89.117.78.124`
2. Na VPS rodar `bash install.sh setup_centraldark_portal` (cria pastas, clona, builda).
3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
4. `curl -I https://centralldark.com` e `curl -I https://telepainel.centralldark.com/dashboard` devem retornar `200`.
5. Atualizar este item pra ✅ com a data.

Detalhes técnicos: `docs/INSTALADOR/13-centraldark-portal.md`.

---

## ✅ #2 — Reestruturação do repo no padrão VPS (concluído 2026-06-20)
**O que foi feito:** `src/` reorganizado pra espelhar `/root/CentralDark/apps/`.
Páginas e componentes do TelePainel movidos pra `src/apps/modulos/telepainel/`,
landings dos outros módulos pra `src/apps/modulos/{bot-whatsapp,crm,financeiro}/`,
portal público pra `src/apps/web/`, código compartilhado pra `src/shared/`.
READMEs criados em cada módulo + `INSTALACAO.md` na raiz com mapa de migração.
**Exceção mantida:** `src/integrations/` ficou no lugar (regra Lovable: auto-gerado).

---

## 🟡 #3 — bot-whatsapp, crm, financeiro são só landing
**Sintoma:** os três módulos têm página pública bonita, mas zero produto por trás.
**Como fechar:** definir escopo de cada um, modelar tabelas, implementar.
Cada módulo tem seu README com a lista do que falta.
