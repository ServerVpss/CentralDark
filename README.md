# CentralDark — TelePanel

> ⚠️ **TEMA OFICIAL DO SISTEMA: "Esmeralda" (Sistema 3D Tátil)**
>
> Este é o padrão visual **definitivo** de todo o ecossistema CentralDark.
> Qualquer agente (IA ou humano) que editar este projeto **DEVE manter** este tema em toda nova tela, componente ou módulo. Não trocar paleta, não trocar fontes, não trocar estilo de sombras.

> 🎴 **PADRÃO OFICIAL DE NOTIFICAÇÃO TELEGRAM: Card Hermes v1.2**
>
> Toda ação relevante do sistema (deploy, migration, bug corrigido, nova feature, alerta) **DEVE** notificar no Telegram usando o Card Hermes v1.2 — bloco único `<pre>` monoespaçado, fundo preto, enviado pelo connector Telegram (`@srver1bot` → admin `1901426549`).

---

## 🔒 BOOT OBRIGATÓRIO — LUPA BAYESIANA

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_IDENTITY_FILE: .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
```

A identidade vigente da skill é resolvida pelo arquivo canônico acima e validada contra o blob Git real. É proibido copiar um SHA fixo para este adaptador.

A skill `meta-lupa` deve ser carregada e seu uso registrado (BEGIN+FINAL) antes de qualquer trabalho neste repo. Sem BEGIN → `BOOT_BLOQUEADO`.

## 🤖 BOOT UNIVERSAL — QUALQUER IA

Qualquer IA, agente, plugin ou hub que abrir este repositório deve começar por:

1. [`LEIA-ME-IA.md`](LEIA-ME-IA.md);
2. [`AGENTS.md`](AGENTS.md);
3. [`docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`](docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md).

O método ativo é: leitores paralelos, escritor único por escopo, mensagens em delta, histórico preservado, revisão independente e Pivete como autoridade final. Ao iniciar trabalho técnico ou retomar contexto, a IA emite uma vez o recibo `CENTRALDARK_AI_BOOT` definido na porta universal.

---
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
