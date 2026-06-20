# Como instalar este projeto

Esse repositório é o **frontend completo do ecossistema CentralDark**. Tudo que você vê aqui — a homepage pública, o portal de login, as landings dos módulos e o painel administrativo do TelePainel — sai daqui.

A pasta `src/` foi organizada **espelhando a árvore final da VPS**, pra você (ou qualquer outra IA) conseguir migrar pasta-a-pasta sem ter que adivinhar o que é o quê.

---

## 1. Árvore do projeto

```text
src/
├── App.tsx              ← roteador único, ponto de entrada
├── main.tsx             ← bootstrap do React
├── index.css            ← variáveis de tema, tokens, Tailwind layers
├── integrations/        ← cliente Lovable Cloud (Supabase). NÃO EDITAR — auto-gerado.
├── apps/
│   ├── web/             ← portal público (vira  /root/CentralDark/apps/web)
│   └── modulos/         ← módulos do ecossistema (vira /root/CentralDark/apps/modulos)
│       ├── telepainel/      ← produto real (bot Telegram + admin + consultas + PIX)
│       ├── bot-whatsapp/    ← só landing por enquanto
│       ├── crm/             ← só landing por enquanto
│       └── financeiro/      ← só landing por enquanto
└── shared/              ← código usado por mais de um módulo
    ├── ui/                  ← componentes shadcn
    ├── auth/                ← AuthProvider, ProtectedRoute, AdminRoute
    ├── layout/              ← Header, Sidebar, BottomNav, DashboardLayout
    ├── theme/               ← ThemeProvider, ThemeToggle
    ├── transitions/         ← splash e transições de página
    ├── pwa/                 ← prompt de instalação
    ├── hooks/               ← React hooks (useAuth, useBackup, etc.)
    ├── lib/                 ← utilidades (cn, formatadores, validação)
    ├── assets/              ← imagens e mídias
    └── test/                ← utilitários de teste
```

> **Exceção importante:** `src/integrations/` **não** foi movido pra `src/shared/`. Esse arquivo é gerado automaticamente pelo Lovable Cloud e qualquer alteração ali é sobrescrita. Por isso fica fora do `shared/`.

---

## 2. Mapa de migração para a VPS

| Pasta no repo | Vira na VPS |
|---|---|
| `src/apps/web/` | `/root/CentralDark/apps/web/` |
| `src/apps/modulos/telepainel/` | `/root/CentralDark/apps/modulos/telepainel/` |
| `src/apps/modulos/bot-whatsapp/` | `/root/CentralDark/apps/modulos/bot-whatsapp/` |
| `src/apps/modulos/crm/` | `/root/CentralDark/apps/modulos/crm/` |
| `src/apps/modulos/financeiro/` | `/root/CentralDark/apps/modulos/financeiro/` |

Cada módulo tem um `README.md` próprio com instruções detalhadas (portas, PM2, Caddy, env, status do produto).

---

## 3. Como buildar localmente

```bash
bun install
bun run build
```

O build sai em `dist/`. É um SPA estático — pode servir com qualquer servidor HTTP (Caddy, Nginx, `npx serve`, etc.).

Variável `VITE_APP_MODE` controla o que entra no bundle:

- `full` (padrão) — tudo: landings + portal + telepainel.
- `web` — só landings públicas + tela de login.
- `portal` — só área logada (portal + telepainel).

---

## 4. Backend (Lovable Cloud)

O frontend conversa com o backend via `src/integrations/supabase/client.ts`. As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` ficam no `.env` (auto-geradas pelo Lovable, não editar).

Migrations, edge functions e policies vivem em `supabase/` e são aplicadas pelo próprio Lovable Cloud.

---

## 5. Documentação complementar

- `docs/INSTALADOR/` — guia detalhado em 12 passos para subir o ecossistema completo numa VPS nova.
- `docs/PENDENCIAS.md` — fonte única da verdade do que ainda falta.
- `central-horario/` — utilitário oficial pra qualquer formatação de data/hora (fuso `America/Sao_Paulo`).
