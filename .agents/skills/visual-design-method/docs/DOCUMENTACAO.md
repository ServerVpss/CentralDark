# DOCUMENTAÇÃO DO PROJETO — visual-design-method

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
ESCOPO           .agents/skills/visual-design-method
OWNER DOCUMENTAL este arquivo — único no escopo
LAST_SYNC_HEAD   e3572c390404abf0023f20c27565c754b10386e9
SINCRONIZADO EM  2026-08-25
GATE             scripts/check-documentacao.mjs
```

```text
ONE_DOCUMENTATION_OWNER_PER_SCOPE = true
```

---

## 1. O que é

A camada visual da CentralDark: as três peles oficiais (`emerald`, `operational`,
`forge`), o relevo tátil que dá profundidade às superfícies, e os dois gates
que impedem que qualquer dos dois se degrade sem alarme.

## 2. Por que existe

Porque o relevo da forja **sumiu sem nada falhar**. O CSS continuava declarando
`preserve-3d`, o cartão continuava inclinando, e mesmo assim ele tinha virado
uma folha de papel. Ninguém notou por semanas.

Documento não pega isso. Gate pega.

## 3. Para quem existe

| Público | O que usa |
|---|---|
| SEGREDO/CHEFE | `MANUAL-DO-DONO.md` — trocar cor e ajustar relevo sem termo técnico |
| Quem programa | `RELEVO-3D-TATIL.md` + este arquivo |
| Máquina (CI) | `check-relevo-3d.mjs` e `check-documentacao.mjs` |

---

## 4. Visão leiga

O site tem três aparências: verde, azul e dourada. Um botão troca entre elas —
o conteúdo e os botões continuam no mesmo lugar, só as cores mudam.

Além disso, quando o mouse passa por cima de um painel, ele parece **levantar
da tela**: inclina de leve, a sombra corre pro lado contrário e um brilho
acompanha o cursor. É o mesmo efeito de figurinha holográfica.

Isso não é enfeite gratuito: superfície que reage ao toque comunica que é
clicável antes de a pessoa clicar.

---

## 5. Arquitetura

```text
TOKENS (cor, fonte, medida)
   ↓
CAMADA DE RELEVO (geometria — igual nas 3 peles)
   ↓
TOKENS DE LUZ (brilho e sombra — mudam por pele)
   ↓
DRIVER (lê o ponteiro, publica --px --py --brilho)
   ↓
CSS compõe: inclinação + sombra + brilho + holo
   ↓
GATES conferem estrutura e documentação
```

Princípio que segura tudo:

```text
THEME_SWITCH != REDESIGN
```

Layout, componentes e navegação **não mudam** entre as peles. Só o valor dos
tokens.

## 6. Árvore real do escopo

```text
.agents/skills/visual-design-method/
├── SKILL.md                          método visual (owner do assunto)
├── TOKENS-FORGE.json                 22 tokens + receita do relevo
├── RELEVO-3D-TATIL.md                as três invariantes, explicadas
├── docs/
│   └── DOCUMENTACAO.md               este arquivo
├── assets/
│   ├── forja-de-cartas.html          a forja, com relevo e painel
│   └── relevo-3-temas.css            camada de relevo, 3 peles
└── scripts/
    ├── check-relevo-3d.mjs           gate do relevo
    ├── check-documentacao.mjs        gate da documentação
    └── validate-canonical-posters.mjs  valida os cartazes
```

## 7. Pontos de entrada

| Entrada | Quando é chamada |
|---|---|
| `forja-de-cartas.html` | abrir no navegador — gera cartas |
| `relevo-3-temas.css` | importado por qualquer página que queira relevo |
| `check-relevo-3d.mjs` | CI, ou na mão antes de commitar |
| `check-documentacao.mjs` | CI, ou na mão antes de commitar |

## 8. Fluxo ponta a ponta

```text
mouse move sobre o painel
  → driver calcula posição relativa   (-0.5 a +0.5)
  → publica --px --py --brilho
  → CSS recalcula inclinação, sombra, brilho e ângulo do holo
  → camadas com translateZ deslizam em velocidades diferentes  (paralaxe)
  → mouse sai → tudo volta ao repouso em 0.4s
```

## 9. Componentes

| Componente | Responsabilidade |
|---|---|
| Tokens de cor | única fonte de cor. Nenhuma cor escrita solta no código |
| Escada de Z | altura de cada camada — é o que cria o efeito de fundo |
| Sombra viva | contra-desloca com o ponteiro; é o que diz "está levantado" |
| Brilho especular | acompanha o cursor; faz parecer material, não imagem |
| Holo | ângulo vem do ponteiro, nunca de temporizador |
| Painel de ajuste | três barras para calibrar ao vivo; some no export |

## 10. Interfaces

`check-relevo-3d.mjs` — sem exports; roda por linha de comando.

`check-documentacao.mjs` — exporta três portas públicas:

| Função | Entrada → Saída |
|---|---|
| `auditarArquivo` | caminho, texto, árvore, doc → veredito consolidado |
| `varrer` | caminho → lista de arquivos, pulando `node_modules` e afins |
| `selftest` | — → sete testes com veredito |

Comandos:

```bash
node scripts/check-relevo-3d.mjs --selftest
node scripts/check-documentacao.mjs --selftest
```

## 11. Dados

Nenhum banco. Nenhuma persistência. Tudo é arquivo lido do disco.
O único estado durável é o `sha256` do asset, declarado em três documentos e
conferido pelo gate.

## 12. Configuração

Sem variáveis de ambiente. Sem segredos. Nada a configurar.

## 13. Dependências

```text
internas   Node 18+ (fs, crypto, path, url) — biblioteca padrão apenas
externas   vanilla-tilt.js 1.8.1, EMBUTIDA no HTML (não vem de CDN)
fontes     Google Fonts — Cinzel, EB Garamond, IM Fell English, JetBrains Mono
```

A forja abre **sem internet**. Só as fontes degradam para as de sistema.

## 14. Execução local

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs
```

Abrir a forja: duplo clique no `forja-de-cartas.html`. Não precisa servidor.

Parar: fechar a aba. Nada roda em segundo plano.

## 15. Testes

| Teste | O que realmente prova |
|---|---|
| `POSITIVE_TEST` | o gate reconhece o caso correto |
| `NEGATIVE_TEST` | reprova o caso quebrado **pelo motivo certo** |
| `VACUITY_TEST` | arquivo fora de escopo não vira PASS |
| `LITERAL_TEST` | texto entre crases não é lido como código |
| `STALE_TEST` | documentação velha reprova |
| `SYNC_TEST` | documentação reconciliada passa |
| `CARIMBO_TEST` | doc sem `LAST_SYNC_HEAD` reprova |

⚫ **O que nenhum teste prova:** se ficou bonito. Isso é olho humano.

## 16. Observabilidade

Saída em JSON. Códigos de saída:

```text
0  PASS
1  FAIL
2  NAO_APLICAVEL
```

Sem log em arquivo, sem métrica, sem health. Ferramenta de linha de comando.

## 17. Segurança

Não lê segredo, não escreve fora do repositório, não faz rede. `varrer` recusa
sair da raiz. Nenhum token, chave ou credencial aparece em nenhum arquivo.

## 18. Deploy

Não tem. É código no repositório, executado pelo CI ou na mão.

## 19. Rollback

Cada arquivo tem `sha256` registrado. Voltar = restaurar o arquivo e o sha nos
três documentos que o declaram. O gate confirma que voltou.

## 20. Estado conhecido

```text
PROVEN      relevo estruturalmente correto (3 invariantes)
PROVEN      documentação presente e sincronizada neste escopo
PROVEN      7 testes do gate de documentação
PROVEN      3 testes do gate de relevo
FAILED      —
UNKNOWN     se o relevo ficou visualmente bom (só olho humano julga)
UNKNOWN     velocidade real com internet ruim
UNKNOWN     comportamento com leitor de tela
UNKNOWN     escopos fora deste — apps, scripts, src, supabase não auditados
```

## 21. Como alterar sem quebrar

Ver `MANUAL-DO-DONO.md` — escrito em português de gente.

Resumo do resumo:

```text
trocar cor        src/index.css — os dois blocos, claro E escuro
relevo mais forte --relevo-angulo, entre 6deg e 24deg
desligar relevo   --relevo-angulo: 0deg
nunca mexer       sha256 · translateZ · prefers-reduced-motion
conferir          node scripts/check-relevo-3d.mjs
```

## 22. Histórico material

| Quando | O que mudou de verdade |
|---|---|
| 2026-08-25 | Relevo restaurado — a escada de `translateZ` nunca existiu |
| 2026-08-25 | Holo deixou de girar por temporizador; passou a seguir o ponteiro |
| 2026-08-25 | `vanilla-tilt.js` embutida — inclinação por biblioteca, offline |
| 2026-08-25 | Três peles ganharam claro **e** escuro (eram 4 combinações, viraram 6) |
| 2026-08-25 | `check-relevo-3d.mjs` criado, e corrigido de um falso-verde por vacuidade |
| 2026-08-25 | `check-documentacao.mjs` criado; ganhou D5 SINCRONIA no mesmo dia |
| 2026-08-25 | Lema `LUPA NA MÃO · INTENÇÃO NA FRENTE` virou assinatura da Casa |

---

## Como este arquivo se mantém honesto

```text
NO_DOCUMENTATION      = NO_PROMOTION
STALE_DOCUMENTATION   = NO_PROMOTION
DOCUMENTED           != IMPLEMENTED
NO_FAKE_DOC_CHANGE    = true
```

O gate regenera a superfície pública — nome de arquivo e cada função exportada —
e compara com este texto. Se o código ganhar uma porta que este documento não
cita, reprova.

Mas se só mudou implementação interna e nada de semântico se moveu, ele devolve
`AUTO_REFRESH_METADATA` e passa. Obrigar edição textual falsa só para o CI ficar
verde produziria documentação mentirosa — exatamente o contrário do objetivo.

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
