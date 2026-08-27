# ÁRVORE DO PROJETO — CentralDark

> ⚠️ **SUPERSEDIDO PELA REGRA `ONE_DOCUMENTATION_OWNER_PER_SCOPE`**
>
> Um arquivo único cobrindo 3.975 arquivos vira bíblia que ninguém mantém —
> e bíblia desatualizada é pior que documento ausente. Este arquivo permanece
> como **mapa de navegação entre escopos**, não como documentação de nada.
>
> A documentação de verdade mora em `<escopo>/docs/DOCUMENTACAO.md`, um por
> escopo. Ver `DOCUMENTACAO-OBRIGATORIA.md`.

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
REPO        ServerVpss/CentralDark
HEAD        e3572c390404abf0023f20c27565c754b10386e9
MEDIDO EM   2026-08-25
ARQUIVOS    3.975 (contados, não estimados)
GATE        .agents/skills/visual-design-method/scripts/check-documentacao.mjs
```

Arquivo **único**, ponta a ponta. Não é lista de 3.975 nomes — lista de nome é
índice, e índice não é verdade. É o **mapa por área, com dono e contagem
medida**, mais os arquivos canônicos nominalmente.

---

## Como ler

| Coluna | Significa |
|---|---|
| **Área** | pasta de primeiro nível |
| **N** | quantos arquivos, contados no HEAD acima |
| **Dono** | quem manda naquele assunto |
| **É verdade?** | se aquilo governa, ou se é projeção reconstruível |

```text
CANÔNICO     governa · muda por decisão
DERIVADO     reconstruível · nunca vira autoridade
OPERACIONAL  roda · precisa de medição
```

---

## 1. Mapa por área

| Área | N | O que é | Dono | Classe |
|---|---:|---|---|---|
| `docs` | 1.533 | consciência, arquitetura, relatórios | `LEIA-ME-IA.md` | CANÔNICO |
| `apps` | 1.221 | módulos — Bolt, hub, telepainel, MCP | cada `apps/modulos/*` | OPERACIONAL |
| `scripts` | 327 | automação, gates, verificadores | `scripts/trigger-fabric/` | OPERACIONAL |
| `src` | 248 | app principal, tema, componentes | `src/index.css` | OPERACIONAL |
| `supabase` | 158 | banco, edge functions, migrations | Supabase | OPERACIONAL |
| `.agents` | 132 | skills dos agentes | `.agents/skills/*/SKILL.md` | CANÔNICO |
| `public` | 100 | estático servido | — | DERIVADO |
| `(raiz)` | 54 | portas de entrada dos motores | `LEIA-ME-IA.md` | CANÔNICO |
| `infra` | 54 | VPS, deploy, containers | — | OPERACIONAL |
| `.github` | 47 | workflows de CI, promoção | `autonomia-promocao.yml` | OPERACIONAL |
| `.lovable` | 23 | memória do editor assistido | Lovable | DERIVADO |
| `.artifacts` | 15 | artefatos gerados | — | DERIVADO |
| `.claude` | 12 | adaptador de autoload | `LEIA-ME-IA.md` | DERIVADO |
| `evidence` | 11 | provas de rodada | — | CANÔNICO |
| `mem` | 10 | memória persistida | — | DERIVADO |
| `backups` | 9 | cópias | — | DERIVADO |
| `desafios` | 7 | exercícios | — | DERIVADO |
| `tools` · `tests` · `SEGURANCA` · `missoes` · `prompts` · `.cursor` · `.grok` · `tmp-hub-refactor` | 12 | apoio e adaptadores | — | vários |

---

## 2. Composição por linguagem

```text
1.641  .md      documentação — 41% do repositório inteiro
  478  .tsx     componentes React
  404  .ts      TypeScript
  227  .mjs     scripts e gates Node
  226  .sh      shell
  171  .json    contratos e manifestos
  169  .js      JavaScript
  150  .py      Python
  109  .sql     migrations
   60  .yml     workflows
   47  .svg     vetores
   40  .html    páginas e forjas
```

**41% do repositório é documentação.** Isso não é excesso — é a lei da Casa
funcionando antes mesmo de virar gate.

---

## 3. Portas de entrada — a raiz

Todo motor entra pela mesma porta. Nome de modelo não muda o contrato.

| Arquivo | Papel |
|---|---|
| `LEIA-ME-IA.md` | **porta única** — qualquer IA lê primeiro |
| `AGENTS.md` | contrato geral dos agentes |
| `CLAUDE.md` · `CHATGPT.md` · `CODEX.md` · `GEMINI.md` | adaptadores de autoload — apontam para a porta, não duplicam governança |
| `README.md` | entrada humana |
| `INSTALACAO.md` | como subir |
| `CONTINGENCY.md` | o que fazer quando quebra |

---

## 4. Owners canônicos — quem manda em quê

| Assunto | Owner |
|---|---|
| Boot de qualquer IA | `LEIA-ME-IA.md` |
| Identidade e alma | `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` |
| Todos os modelos têm lugar | `docs/CONSCIENCIA/01-IDENTIDADE.md` |
| Design e temas | `docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md` |
| Método visual | `.agents/skills/visual-design-method/SKILL.md` |
| Trigger Fabric | `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/` |
| Contrato operacional | `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml` |
| Falsificação crítica | `.agents/skills/meta-lupa/SKILL.md` |
| Handoff entre IAs | `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md` |
| Promoção para main | `.github/workflows/autonomia-promocao.yml` |
| Verificação de contrato | `scripts/trigger-fabric/verify_repo_contract.py` |
| Cartazes canônicos | `docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/manifest.json` |

---

## 5. Camada de tema e relevo — documentada em detalhe

Esta é a parte trabalhada na rodada de 2026-08-25. Cada arquivo, cada função.

### `src/index.css` — cores do site
Tokens do tema `emerald`, em HSL, blocos claro e escuro. Fonte única de cor
do app principal. `operational` e `forge` **ainda não estão aqui** — moram só
no `variables.scss` do Bolt. Cobertura parcial declarada.

### `.agents/skills/visual-design-method/`

| Arquivo | O que faz |
|---|---|
| `SKILL.md` | o método visual — owner do assunto |
| `TOKENS-FORGE.json` | 22 tokens + receita completa do relevo, extraídos do asset |
| `RELEVO-3D-TATIL.md` | as três invariantes, com a calibragem medida |
| `assets/forja-de-cartas.html` | a forja de cartas, com relevo e painel de ajuste |
| `assets/relevo-3-temas.css` | camada de relevo global, três peles |
| `scripts/check-relevo-3d.mjs` | gate do relevo — 3 invariantes, 3 testes |
| `scripts/check-documentacao.mjs` | gate da documentação — 4 exigências, 3 testes |
| `scripts/validate-canonical-posters.mjs` | valida os cartazes canônicos |

### Funções públicas com contrato

**`check-relevo-3d.mjs`**

| Função | Entrada → Saída |
|---|---|
| `invarianteProfundidade` | css → veredito + camadas elevadas |
| `invarianteSombraViva` | css → veredito + nº de box-shadows |
| `invarianteMovimentoReduzido` | css → veredito |
| `auditar` | nome + css → veredito consolidado |
| `auditarProveniencia` | caminho → sha256 + divergências |
| `selftest` | — → positivo, negativo, vacuidade |

**`check-documentacao.mjs`**

| Função | Entrada → Saída |
|---|---|
| `exigenciaCabecalho` | texto + linguagem → veredito |
| `exigenciaContrato` | texto + linguagem → veredito + nº exportadas |
| `exigenciaPendencia` | texto → veredito + nº de marcas |
| `exigenciaAncoragem` | caminho + árvore → veredito |
| `auditarArquivo` | caminho + texto + árvore → veredito consolidado |
| `varrer` | caminho → lista de arquivos |
| `selftest` | — → positivo, negativo, vacuidade |

### Documentos para pessoas

| Arquivo | Para quem |
|---|---|
| `MANUAL-DO-DONO.md` | **o dono** — trocar cor, ajustar relevo, sem termo técnico |
| `DOCUMENTACAO-OBRIGATORIA.md` | quem programa — a lei e como cumprir |
| `LEIA-PRIMEIRO.md` | quem for absorver o pacote |
| `PATCH-RELEVO.md` | o que mudou no asset e por quê |
| `ARVORE-DO-PROJETO.md` | este arquivo |

---

## 6. O que este mapa NÃO prova

```text
MAPA_DA_ARVORE      != CÓDIGO_CORRETO
ARQUIVO_DOCUMENTADO != ARQUIVO_QUE_FUNCIONA
41%_DE_MARKDOWN     != 41%_DE_VERDADE
```

Este documento prova **onde as coisas estão** e **quem manda em cada uma**.
Não prova que rodam. Isso é medição própria, arquivo por arquivo.

⚫ **Áreas ainda não auditadas pelo gate de documentação:** `apps` (1.221),
`scripts` (327), `src` (248), `supabase` (158). O gate hoje cobre apenas
`.agents/skills/visual-design-method`. Estender é decisão do CHEFE — mais
escopo significa mais build reprovando até o passivo ser pago.

---

## 7. Manutenção deste arquivo

```text
ARQUIVO NOVO    → entra na seção da área dele
ARQUIVO MOVIDO  → o caminho antigo sai
ÓRFÃO           → o gate reprova com ANCORAGEM: FAIL
HEAD MUDOU      → as contagens viram histórico até nova medição
```

Recontar do zero:

```bash
gh api "repos/ServerVpss/CentralDark/git/trees/main?recursive=1" --jq '[.tree[]|select(.type=="blob")]|length'
```

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
