# CentralDark — TelePanel

> ⚠️ **TEMA OFICIAL DO SISTEMA: "Esmeralda" (Sistema 3D Tátil)**
>
> Este é o padrão visual **definitivo** de todo o ecossistema CentralDark.
> Qualquer agente (IA ou humano) que editar este projeto **DEVE manter** este tema em toda nova tela, componente ou módulo. Não trocar paleta, não trocar fontes, não trocar estilo de sombras.

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

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS v3 + shadcn-ui
- Lovable Cloud (Supabase) — Auth, DB, Edge Functions, Storage, Realtime
- PWA habilitado

## Como editar
- **Lovable** (recomendado): https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
- **Local**: `git clone` → `npm i` → `npm run dev`
- **GitHub**: edição direta + sync bidirecional com Lovable

## Deploy
Lovable → Share → Publish.
