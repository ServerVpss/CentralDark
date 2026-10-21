---
title: "DESIGN SISTEMA"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Design System — Sistema 3D Tátil "Esmeralda"

> **Regra fixa do projeto:** todo o ecossistema CentralDark usa o mesmo design.
> Não criar paleta nova, fonte nova ou sombra nova sem combinar antes.

---

## Identidade

- **Apelido oficial:** Esmeralda
- **Inspiração:** Linear · Vercel · CLI tools · iOS nativo
- **Modo padrão:** light (claro). Dark também polido.
- **Cor de assinatura:** emerald (verde escuro elegante, não neon)
- **Tipografia:** Geist (sans) + Geist Mono (mono) — Google Fonts

## Tokens (em `src/index.css`)

Todos os valores são HSL em variáveis CSS. Light + dark.

```
--background, --foreground          fundo/texto principais
--card, --card-foreground           superfícies
--primary, --primary-foreground     emerald, ações principais
--primary-glow                      emerald brilhante (hover, glow)
--secondary, --muted, --accent      neutros e secundárias
--destructive, --success, --warning estados
--border, --input, --ring           contornos
--radius                            raio padrão (0.5rem)
--gradient-gold                     "verde" emerald gradient
--gradient-card                     gradiente leve para cards
--glass-bg, --glass-border          glassmorphism leve
--chart-1..5                        séries de gráfico
```

## Utilitários globais (3D Tátil)

Já existentes em `src/index.css`:

| Classe | Uso |
| --- | --- |
| `shadow-3d` | sombra base — botões e cards principais |
| `shadow-3d-soft` | sombra suave — superfícies secundárias |
| `shadow-3d-primary` | sombra com tinta emerald — CTA |
| `shadow-3d-destructive` | sombra vermelha — ações destrutivas |
| `shadow-3d-pressed` | sombra "afundada" — estado pressionado |
| `shadow-side-right` | sombra lateral direita — submenus |
| `rounded-xl` / `rounded-lg` | raio padrão |
| `active:translate-y-[1px]` | clique tátil — sempre adicionar em botões |
| `icon-glow` | brilho atrás de ícones em logos |
| `glass-subtle` | header translúcido |
| `bg-grid` | grid de fundo (login/landings) |

## Padrão de Card

```tsx
<Card className="rounded-xl border-border/40 shadow-3d-soft">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm">Título</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

## Padrão de Botão

```tsx
<Button
  size="sm"
  className="h-8 rounded-lg shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
>
  Ação
</Button>
```

## NÃO fazer

- ❌ Hardcode de cor (`text-white`, `bg-black`, `bg-[#xxx]`) — quebra dark mode
- ❌ Misturar fontes diferentes de Geist/Geist Mono
- ❌ Trocar emerald por roxo/azul/etc sem aprovação
- ❌ Sombras inventadas — use `shadow-3d*` ou `shadow-sm` do Tailwind
- ❌ Border-radius diferente do `--radius` global

## Onde está aplicado

| Tela | Status |
| --- | --- |
| `LandingCentralDark` (home) | ✅ referência visual |
| TelePainel — todas as páginas | ✅ |
| Mega Painel (`/mega-painel`) | ✅ |
| Auth / Portal | ✅ |
| Landings de módulos (WhatsApp, CRM, Financeiro) | ✅ |

## Temas globais oficiais (decisão do SEGREDO/CHEFE, 2026-08-24)

```text
CENTRALDARK_VISUAL_MODEL =
  ONE_DESIGN_SYSTEM
  + THREE_GLOBAL_OFFICIAL_THEMES

THEMES=[emerald, operational, forge]
THEME_SCOPE=APPLICATION_GLOBAL
EVERY_CENTRALDARK_PAGE_INHERITS_ACTIVE_THEME=true
THEME_SWITCH != REDESIGN
```

Não são três estilos para escolher "qual serve melhor para este artefato" —
são três peles sempre disponíveis no seletor global. Estrutura, layout,
componentes, navegação e conteúdo não mudam entre elas; só os valores de
token trocam. `emerald` continua o tema padrão atual.

| Tema | Registro | Fonte real |
| --- | --- | --- |
| `emerald` (default) | Institucional — verde esmeralda escuro, Geist | Este doc + `src/index.css` |
| `operational` | HUD/controle — navy + ciano + vermelho de alerta | Cartão operacional (5 etapas) |
| `forge` | Premium/lendário — shell preto/marrom, bordas bronze-dourado, tipografia mono dourada, interior pergaminho/foil claro | `.agents/skills/visual-design-method/assets/forja-de-cartas.html` (`sha256:e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348`) |

### Owners/consumidores vivos por superfície

Reusar estes — não criar segundo sistema de design nem árvore de tokens paralela:

| Superfície | Owner | Estado medido em 2026-08-24 |
| --- | --- | --- |
| App principal / TelePainel / portal | `src/shared/theme/ThemeProvider.tsx`, `ThemeToggle.tsx`, `src/index.css` | Só `light/dark/system`; falta dimensão de paleta |
| Bolt / Hermes Desktop | `apps/modulos/Bolt/source/app/lib/stores/theme.ts`, `app/styles/variables.scss` | `emerald` é o default de perfil novo; `dark/light/operational/forge` continuam selecionáveis; build/render ainda precisam provar cobertura física |
| Hub | `apps/modulos/hub/src/App.tsx` | Força tema claro; ainda sem mecanismo de tema |
| Open WebUI | `apps/modulos/WebUI/custom-css/esmeralda.css` | Só Esmeralda, força light |

`GLOBAL_COVERAGE` só é verdadeiro quando as 4 superfícies acima consumirem o
mesmo `ThemeId` e o mesmo conjunto de tokens semânticos. Enquanto isso não
estiver provado (build + render real de cada superfície nos 3 temas), tratar
como `PARTIAL_COVERAGE`, nunca como concluído.

<!-- #OBSERVACOES# | CENTRALDARK.VISUAL.ESMERALDA
@owner: docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md
@code_ref: apps/instinto-superior/src/styles.css
@last_updated: 2026-10-18
@estado: STYLE_PATCH_PREPARED; RUNTIME_PROOF_PENDING
@next_cursor: CI + comparacao visual do cockpit vivo + recibo.
-->

### Esmeralda metálica no Cockpit — evolução visual, sem tema extra (2026-10-16)

A opção já existente `esmeralda` em `apps/instinto-superior/src/components/central/DesignCenter.tsx` continua com **o mesmo identificador e a mesma persistência** (`centraldark.cockpit.pele`). O owner `CockpitShell.tsx` continua aplicando `data-pele-cockpit={pele}` no **mesmo componente principal**: não reconstruir Hermes, Hub, Forge, Goals, Recibos ou handlers a partir do HTML demonstrativo.

O acabamento em `apps/instinto-superior/src/styles.css` evolui apenas a regra escopada `.cockpit-pele[data-pele-cockpit="esmeralda"]`: grafite metálico, vidro escuro, relevo sutil, iluminação esmeralda, acessibilidade de foco e o verde de assinatura `#00ff88`. `default`, `ouro` e `ops` não são alterados. O HTML Visual DNA é **referência de aparência**, não novo runtime ou fonte de dados.

**Rastro vivo obrigatório:** em qualquer mudança futura de acabamento, o agente que editar `styles.css` deve atualizar `@last_updated` do arquivo e da observação Esmeralda, ajustar este owner de design com o novo estado e data/hora, e preservar `@code_ref` para permitir comparação automática por diff. Não confundir imagem HTML independente com capacidade integrada.

**Gate de promoção:** build no mesmo SHA, seleção em tempo real, persistência após reload, preservação de aba/formulário/sessão, teste de navegação autenticada, capturas desktop/mobile e comparação de regressão das outras peles. `STATIC_CHECK_PASS != BUILD_PASS != LIVE_RUNTIME_PASS`. Aplicação global em Hub, Bolt e Open WebUI continua **não comprovada** até reconciliar os respectivos owners de tema.



### Microinterações Michelin · 18/10/2026

O léxico cognitivo A–Z e as oito legendas do Modo Michelin não constituem paleta, tema, componente autônomo ou engine. A fonte única fica em `apps/instinto-superior/config/harness-module-registry.json#cognitive_lexicon`; a projeção já existente `InfraestruturaSistema.tsx → Biblioteca()` lê essa fonte sem replicar strings em JSX. A proveniência integral é `apps/instinto-superior/docs/INSTINTO-MANIFESTO-INCREMENTAL.md#d005`.

**Acabamento permitido:** somente `styles.css` com CSS escopado por `.cockpit-pele[data-pele-cockpit="esmeralda"]`, deslocamento vertical de 1–2px, escala 1.045–1.06, transição 180ms no hover/foco e sombra esmeralda discreta. Sem animação infinita, sem estado operacional inferido da animação, sem modificar cores/handlers dos outros temas e sem interferir em SVGs `animate-spin` que sinalizam carregamento real. `prefers-reduced-motion: reduce` já desliga transições globais.

**Prova necessária antes de promoção:** JSON parse + unicidade 42/8; parse TypeScript do componente; CSS sintático; captura e testes de interação desktop/mobile, redução de movimento, teclado, quatro peles, contraste, auth e deploy no SHA exato. O hover de ícone não é prova de execução de modelo nem de telemetria. `UNKNOWN != PASS`.

## Cartazes canônicos e memória visual

Os quatro cartazes aprovados pelo SEGREDO/CHEFE são testemunhas visuais do
mesmo design system e estão catalogados em
[`docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/`](../../BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/README.md).
O `manifest.json` dessa pasta fixa hashes, proveniência e relações semânticas.
Eles não criam paleta, runtime ou autoridade paralela: este documento continua
o owner de design; a skill `visual-design-method` governa o método; índices e
grafos são projeções reconstruíveis.

## Quando criar visual novo

1. Confirmar com o usuário antes
2. Adicionar tokens novos em `src/index.css` (light + dark) — e, quando for
   token de paleta, também em `operational`/`forge`
3. Adicionar utilitário em `src/index.css` se for reutilizável
4. Atualizar este doc
5. Atualizar memory `mem://design/sistema-3d-tatil` se mudou regra

---


<!-- CENTRALDARK_HARNESS_COCKPIT_BUILDER_ALTHE_REFERENCIA_20261021 -->

## Cristal de interface — Builder dentro do Harness, sem duplicar Cockpit (2026-10-21)

**Intenção expressa pelo CHEFE (capturas da Casa):** “cristaliza esses cores e esses botões aí pra eu saber lá onde tem o cockpit; veja as abas”. A referência é a bancada Alethe/estilo workspace mostrada em capturas (modal “Olá, CENTRALDARK”; Conta, Recursos, Controle remoto, Aparência, Integrações, homepage Builder, agente selecionável e terminais). **Não** aprova substituir os owners da CentralDark, clonar serviços nem tornar Alethe o segundo Harness principal.

**Leitura da aba real:** Browser conectado `http://127.0.0.1:8080/sala-controle`, título “Cockpit CentralDark — Sala de Controle”, consulta nesta sessão em 21/10/2026. A aba expôs as entradas de navegação abaixo. Essa leitura prova **DOM/controles renderizados**, não clique funcional, integração física Win32, sessão privada, build Windows ou execução de agente.

### Mapa de encaixe no Cockpit existente

| Referência visual mostrada | Entrada/owner CentralDark a REUTILIZAR | Estado atual / menor delta |
| --- | --- | --- |
| Tela inicial “O que você quer construir?”, seletor agente, pasta K:, modo e envio | `CockpitShell.tsx` → `CentralDark Estúdio` (`aionui`) e Builder do Shell `apps/modulos/Bolt/source` | **A compor dentro do Harness**; escolha de Claude/Codex/Copilot/Cursor/Antigravity/OpenCode é UI até autenticação e PID/ACK medidos. Não sobrescrever `Builder Bolt` (fábrica de sites distinta). |
| Barra esquerda projetos/agentes e dock persistente | Harness lateral esquerdo já existente (`Abrir ferramentas`, Gram, Goals, Buscar módulos) | Preservar moldura lateral, foco, restauração, perfis e instâncias nativas; evolução incremental da casca, sem segunda sidebar. |
| Editor/Cockpit multiabas + painel direito Markdown | `centraldark-harness-abas`, `Sistema CentralDark`, `💎 Obsidian`, Grafo Vivo | Mesmas abas internas; Obsidian **original** com vault e plugins; janela Win32 incorporada requer teste separado. Links `obsidian://` não provam docking. |
| Terminais inferiores e “novo terminal/projeto” | `skills/vs-code-restore` PR #1880 + desktop Bolt / Harness + MCP oficial | Conectar aos mesmos PIDs/sessões, jamais criar pseudo-shell ou reexecutar CLIs sem consentimento. |
| Configurações Conta, Organização, Aparência, Controle remoto | `Configurar Harness`, `Admin CentralDark`, `Design Center`, auth existente | Um painel de configurações reutilizando perfis e políticas; controle remoto **desligado por padrão**. |
| Recursos: Navegador, Graphify, MCP & Skills, Playwright, Orquestração, GSD Sync, AI Memory | `Sistema CentralDark` / `Inventário`, `Raio-X`, `Goals`, `Hermes`, `Minha Oficina`, `Obsidian` | Mapear disponibilidade com proprietário e prova por capacidade. “Ativado” no protótipo de referência **não atesta** recurso instalado na CentralDark. |
| Integrações (9router, Spotify, Discord, CLI) / Plugins | `Admin CentralDark`, `Sistema CentralDark`, catálogo MCP e cofre existente | Não reinstalar providers nem duplicar vault. Nunca copiar segredos das imagens. |
| Home com atividade, progresso, recibos | `Visão geral`, `Recibos`, `Gênesis · Michelin`, `Dream` | Fontes atuais e idempotentes; números do protótipo de referência não são métricas da Casa. |

**Abas renderizadas e existentes na leitura:** Visão geral; Portal; Builder Bolt; Mapa PR #1873; CentralDark Gram; Minha Oficina; Design Center; Goals; Gênesis · Michelin; Claude; Dream; Estrutura; Raio-X; Recibos; Forja; Permissões Forja; Admin CentralDark; Sistema CentralDark; Hermes; Obsidian; Estúdio; Unigram; Regras Forja; Inventário; Agent Mode; HTML Consolidation; Downloads. A origem primária é `apps/instinto-superior/src/components/central/CockpitShell.tsx`, `TabsList` + `HARNESS_DESTINOS`, sem criar menu paralelo.

**Ações da moldura que já existem:** lateral esquerda `Abrir ferramentas`, Gram, Goals, `Buscar módulos`; lateral direita `Sistemas`, Hermes, `Configurar Harness`; rodapé `Sync`, `Pacotes`, `Configurar moldura`; topo `CentralDark Estúdio`. Preservar atalhos, teclado e ícones, não reproduzir botões decorativos sem handler.

### Cores — amostra das capturas, não um tema oficial novo

Amostras **aproximadas** do screenshot, não extraídas do CSS original do aplicativo de referência:

| Papel | Valor observado aproximado |
| --- | --- |
| Fundo profundo | `#080810` |
| Superfície/painel | `#14141F` |
| Seleção/camada índigo | `#23213F` |
| Acento ativo/CTA violeta | `#7D72FF` |
| Texto auxiliar lavanda | `#C3BFE6` |

**Regra:** referência de acabamento para o Builder dentro do Harness; **não** criar `ThemeId` nem trocar o Esmeralda/global sem prova de regressão e consentimento explícito. Aplicar, se aprovado, por CSS **escopado ao módulo** e pelos tokens semânticos existentes em `apps/instinto-superior/src/styles.css` (e no design owner deste documento). `prefers-reduced-motion`, contraste e foco acessível permanecem obrigatórios.

**Divergências concretas medidas no source da PR #1895 (HEAD no início desta leitura: `b3427c9da167cdc41aaf5814bcb1db12c61c4d50`):** `builder-bolt` usa `MenuVisualCentralDark` com “ESTRUTURA VISUAL” e “Integração pendente”; `aionui` hoje dá link para aplicativo externo/protótipo; `obsidian` despacha `obsidian://open?vault=BRAIN` ou ponte desktop e informa janela independente. **Não declarar completo.**

**OWNER/WRI​​TER:** este cristal é **apenas documentação** em `DESIGN-SISTEMA.md` na PR #1895. `CockpitShell.tsx` e Shell mantêm o integrador da Casa como **único escritor**. Sem alterar CSS, handlers, processos, autenticação, drives ou runtime nesta rodada.

**NEXT_CURSOR:** `MAPA_TAB_ID → ESCOPAR_ESTILO_BUILDER → CONECTAR_HANDLERS_ORIGINAIS → MANTER_BOLT_DISTINTO → OBSIDIAN_NATIVE_TEST → BUILD_SHELL_K_F → VISUAL_BEFORE_AFTER → RECEIPT`. `DOCUMENTED != IMPLEMENTED != LIVE_TESTED`.


## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
