# Installer / Onboarding Discovery — Session 2026-09-05

## Resultado da Busca Exaustiva

**Não existe installer/onboarding/setup wizard no repositório CentralDark.**

### O que foi procurado (5 frentes paralelas)
1. `search_files` pattern: `installer|setup.*wizard|first.*run|onboarding` → **0 results**
2. `git log --all --grep="installer\|onboarding\|setup\|first.run\|wizard"` → apenas referências a `setup-node`, `setup-telepainel-caddy`, `Auto-onboarding no MCP` (campo `instructions` do handshake)
3. `git branch -r` filtrando por `install|onboard|setup|designer|site|builder` → apenas `docs/acorda-rebuilder-20260801` e `fix/setup-node24-selfhosted-fast`
4. Busca em `apps/modulos/Bolt/source/` por rotas/admin/designer → **0 results**
5. Busca por `designer|site.*builder|web.*builder|admin.*panel` → **0 results**

### O que EXISTE como "instalador"

| Item | Local | Função |
|---|---|---|
| `setup-centraldark-portal.sh` | `/root/Multizap/apps/clone-deck/scripts/` (VPS) | Clona repo, builda portal + telepainel, gera Caddyfile |
| `install.sh` | VPS (legado `CentralDark1VPS`) | Script principal de instalação VPS (ver `docs/INSTALADOR/13-centraldark-portal.md`) |
| Bolt Settings UI | `/settings` → Providers tabs | **Admin UI real** para configurar keys/providers no browser |
| Cloudflare Workers env | VPS deployment | Secrets/env vars injetadas no runtime do site |

### O "Instalador" na Prática

O usuário pediu: *"tem o sistema de instalação quando abre o sistema não tem verifica ai se foi feito"*

**Resposta honesta:** Não há "primeira execução" que abre um wizard. O fluxo real:

1. **VPS:** `bash install.sh setup_centraldark_portal` → clona, builda, deploya (já feito - site no ar)
2. **Local dev:** `npm run dev` no Bolt → abre `http://localhost:5173` → `/settings` → configura providers
3. **Omni Router:** precisa de `.env` com credenciais → health mostra engines configured
4. **Site VPS:** já roda com 200+ models via Abacus/Arsenal Router (provado via `curl api.centralldark.com/v1/models`)

### Lição Operacional

> **NÃO EXISTE INSTALADOR NO REPO — NÃO CRIAR.**
> 
> O "sistema de instalação" que o usuário imagina é:
> - **VPS:** script `setup-centraldark-portal.sh` (já executado, site no ar)
> - **Local:** Bolt dev server + Settings UI (já existe, pronto para uso)
> - **Keys:** entram via env vars no server (VPS) ou cookies no client (local)
>
> Tentar criar um "installer" seria **V2/V3/V4 proibido** — reutilizar o que existe.

### O que o Usuário Realmente Quer (extraído da intenção)

1. **Omni router local com arsenal completo** → criar `.env` com credenciais reais + reiniciar
2. **Bolt local rodando** → `npm run dev` no Bolt source
3. **Admin UI para por keys** → já existe em `/settings` → Providers (Cloud/Local tabs)
4. **Site no ar** → **JÁ ESTÁ** (centralldark.com, telepainel.centralldark.com, api.centralldark.com)

### Ação Imediata (do plano anterior)

1. Criar `.env` do omni router com TODAS credenciais detectadas
2. Reiniciar router → `/health` mostra all engines configured
3. Subir Bolt dev (`npm run dev`) → testar Settings UI
4. Montar PM2/ecosystem para boot persistente

### Referência Cruzada
- `references/omni-router-arsenal-configuration.md` — estado real medido + plano
- `references/bolt-provider-settings-system.md` — sistema de settings já existente
- `centraldark-vps-operations` — VPS reality check (site já no ar)