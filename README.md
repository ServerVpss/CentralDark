# CentralDark — TelePanel

> ⚠️ **TEMA OFICIAL DO SISTEMA: "Esmeralda" (Sistema 3D Tátil)**
>
> Este é o padrão visual **definitivo** de todo o ecossistema CentralDark.
> Qualquer agente (IA ou humano) que editar este projeto **DEVE manter** este tema em toda nova tela, componente ou módulo. Não trocar paleta, não trocar fontes, não trocar estilo de sombras.

> 🎴 **PADRÃO OFICIAL DE NOTIFICAÇÃO TELEGRAM: Card Hermes v1.2**
>
> Toda ação relevante do sistema (deploy, migration, bug corrigido, nova feature, alerta) **DEVE** notificar no Telegram usando o Card Hermes v1.2 — bloco único `<pre>` monoespaçado, fundo preto, enviado pelo connector Telegram (`@srver1bot` → admin `1901426549`).
> 📖 Especificação completa: [`docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`](docs/CONSCIENCIA/PADRAO-CARD-HERMES.md)
> ❌ Nunca usar `notify-telegram`. ❌ Nunca mandar texto fora do `<pre>`.

---

## 🎨 Tema Oficial: **Esmeralda** (Sistema 3D Tátil)

Apelido curto: **Esmeralda**. Nome técnico: **Sistema 3D Tátil**.
Inspiração: estilo app nativo (iOS/Android), com pegada Linear · Vercel · CLI tools.

### Identidade visual
- **Paleta**: tema *emerald* (verde esmeralda) como cor primária/accent.
- **Modo padrão**: **light** (claro). Dark theme totalmente suportado.
- **Fontes**: `Geist` (sans) + `Geist Mono` (mono). Nunca usar serif, nunca Inter/Poppins puro.
- **Bordas**: `rounded-xl` / `rounded-lg` em cards e botões.
- **Sensação tátil**: tudo que é clicável afunda 1px ao pressionar (`active:translate-y-[1px]`).

### Utilitários 3D globais (definidos em `src/index.css`)
Usar SEMPRE estes utilitários — nunca recriar sombras manualmente:

| Classe | Uso |
|---|---|
| `shadow-3d` | Sombra 3D padrão (botões/cards destacados) |
| `shadow-3d-soft` | Sombra 3D suave (cards normais, nav items ativos) |
| `shadow-3d-primary` | Sombra 3D na cor primária (CTAs verdes) |
| `shadow-3d-destructive` | Sombra 3D vermelha (ações perigosas) |
| `shadow-3d-pressed` | Estado "afundado" ao pressionar |
| `shadow-side-right` | Sombra lateral (Sidebar e painéis laterais) |

### Tokens semânticos (NUNCA hardcodar cores)
Sempre usar `hsl(var(--primary))`, `bg-card`, `text-foreground`, etc.
Proibido: `text-white`, `bg-black`, `bg-[#...]`, gradientes roxo/índigo genéricos.

### Regra de ouro
> **Todo agente que editar daqui pra frente DEVE seguir o tema Esmeralda.**
> Se for criar tela nova: reutilizar `.card-premium`, `.nav-item`, `.btn-money`, utilitários `shadow-3d-*`. Manter consistência absoluta.

---

## Projeto

- **Domínio oficial**: https://centralldark.com
- **Painel de status**: https://status.centralldark.com
- **Repositório**: `ServerVpss/CentralDark` (sincroniza automaticamente com a VPS em `/root/CentralDark/`)

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v3 + shadcn-ui (frontend TelePanel)
- Node.js + PM2 na VPS (microsserviços CentralDark)
- Supabase gerenciado — Auth, DB, Edge Functions, Storage, Realtime
- PWA habilitado

## Como editar

- **Editor assistido por IA**: qualquer alteração feita pelo agente é comitada no repo e sincronizada pra VPS automaticamente
- **Local**: `git clone` → `npm i` → `npm run dev`
- **GitHub**: edição direta + sync bidirecional

## Deploy

Push na `main` → webhook na VPS (`/root/CentralDark/scripts/webhook/`) faz `git pull` + `pm2 reload` do serviço afetado.

---

## 🎖️ Taxonomia Arsenal 2026 (nomenclatura oficial dos setores)

Pra evitar cada IA nova inventar nome próprio pros módulos, adotamos a doutrina do zip `CentralDark_Arsenal_2026` — 7 setores militares. **O zip é só nomenclatura**; o código real já roda em PM2 na VPS. Use esta tabela como dicionário oficial:

| Setor Arsenal | Função | Módulos reais que cobrem o setor |
|---|---|---|
| **COMANDO** | Decisão, orquestração, roteamento neural | `apps/modulos/HERMES-CORE/` (loop autônomo + rede especialista) |
| **ARSENAL** | Conselho de IAs (Router / Parallel / Debate) | `apps/modulos/arsenal-openai-adapter/` + `docs/CONSCIENCIA/ARSENAL/` |
| **ESCUDO** | Auto-healing, vigia, fallback, resiliência | `HERMES-CORE/agents/Log-Verificador/` (PM2 id 77) + `apps/modulos/Monitoramento24h/` |
| **INTELIGÊNCIA** | Grafo, análise de código, mapa vivo | `apps/modulos/graph-panel/` + `apps/modulos/mapeamento/` + `apps/modulos/obsidian-plugin-grafo-vivo/` |
| **MEMÓRIA** | Consciência, lembranças, aprendizados | `apps/modulos/memoria-api/` + `docs/CONSCIENCIA/` + `docs/CONSCIENCIA/LEMBRANCAS/` |
| **EXECUÇÃO** | Braços do sistema — MCP, gateways, proxies | `apps/modulos/elite-gateway/` + `elite-anthropic-proxy/` + `proxy/` + `lovable-proxy/` + `artifacts-builder/` + MCP |
| **LOGÍSTICA** | Deploy, backup, webhook, sync, status | `scripts/webhook/` + `apps/modulos/pivete-sync/` + `oauth-broker/` + `apps/modulos/status/` |

### Regra de nomenclatura

- Ao **falar de estratégia / arquitetura**: usar o nome do setor (ex.: "reforçar o Escudo", "melhorar a Memória").
- Ao **falar de código / deploy**: usar o nome do módulo real (ex.: "mexer no `HERMES-CORE/agents/Log-Verificador/`").
- **Nunca** criar um novo nome pra um setor que já tem módulo real cobrindo — evita divergência.
- Referência viva: pendência **#51** em `docs/PENDENCIAS.md` + (opcional) `docs/CONSCIENCIA/ARSENAL/MAPA-SETORES.md`.
