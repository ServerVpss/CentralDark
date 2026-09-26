# VEREDITO — ORIGEM DA MULHER NA FORJA DE CARTAS

Investigação: FORENSE/SILENCIOSA (sem execução, sem invasão).
Data: 2026-08-25. Hermes-CASA perfil pivete.
Sub-agente: deleg_2aadf4e4 (leaf, read-only, 639s).

## PROVAS MATERIAIS

1. **ARTES.hermes embutido**
   - Arquivo: E:\CentralDark\workspace\sol\forja-de-cartas.html (linha 511-514)
   - `const ARTES = { hermes, sol };` → 2 chaves, ambas JPEG base64
   - Decodificado: E:\CentralDark\Pivete\cache\artes_hermes.png
   - Tipo: JPEG (JFIF 1.01, progressivo, 8-bit, 3 componentes)
   - Dimensões: **726 × 432**
   - Bytes: 54255
   - SHA256: `81e2efdd4482448ca8ec9f33460a862a345bcf606d488015ff5101ed545f5bb5`

2. **Lógica de arte (linhas 695-697)**
   - `if(c.arteUrl) return c.arteUrl;` → upload override
   - `if(c.arte && ARTES[c.arte]) return ARTES[c.arte];` → asset embutido
   - `return gerarSigilo(...)` → fallback
   - Card HERMES usa `arte:'hermes'` → cai no asset embutido (linha 591)

3. **Disco (145 imagens hasheadas, maxdepth 4, 4 roots)**
   - SHA `81e2efdd...` → **ZERO MATCH** no disco do usuário
   - Conclusão: não é arquivo solto/encontrado do usuário

4. **Vision na arte**
   - "ilustração digital, provavelmente IA-generated, fantasy/steampunk/cyberpunk"
   - Rosto "plástico", texto ASCII gibberish na lateral → estilo Midjourney/SD
   - Não é fotografia de pessoa real

5. **Git — autoria e byte-idêntico**
   - Arquivo rastreado vive em `ServerVpss/CentralDark`:
     `.agents/skills/visual-design-method/assets/forja-de-cartas.html`
   - Autores do commit que tocou o asset:
     - `2f20f34ea` — SegredoiDev `<133285946+segredounlock@users.noreply.github.com>`
       (24/08/2026, PR #1121 "CRISTALIZAR OS 3 TEMAS GLOBAIS")
     - `8de6be779` — Claude Code `<noreply@anthropic.com>`
   - `origin = https://github.com/ServerVpss/CentralDark.git` (alcançável)
   - `origin/main` (commit `21ccc236`) CONTÉM o arquivo (mesmo commit `2f20f34ea`)
   - **Prova de byte-idêntico:** versão commitada em main tem `hermes` sha
     `81e2efdd…` e `sol` sha `2e06159…` — exatamente iguais aos do workspace.
     → O asset da mulher é o MESMO desde o commit no repo remoto.

6. **Atribuição / crédito — NENHUMA**
   - Grep em HTML + Pivete: só "crédito" no sentido financeiro (linha 643),
     não atribuição de arte.
   - JPEG `hermes`: sem EXIF, sem marker Adobe, sem string http/url.
   - Sem marca d'água, assinatura ou crédito em lugar nenhum.

## VEREDITO

```
A_MULHER_E = ASSET_EMBUTIDO (IA-generated, sem atribuição)
IDENTIDADE_REAL = INDEFINIDO (por construção — imagem é IA)
```

- Ela "apareceu" porque veio de `ARTES.hermes` (base64 no código), não de upload.
- Não é pessoa real identificada (sem metadata de proveniência).
- Não tem autoria/crédito conhecido no repo.
- É elemento visual do jogo CentralDark (carta "HERMES, O NEUROFILÓLOGO ANCIÃO").
- Asset é byte-idêntico ao commit `2f20f34ea` (SegredoiDev + Claude Code, PR #1121)
  no `ServerVpss/CentralDark@main`.

## GAPS (não verificável)
- Não dá pra nomear modelo/pessoa real — IA gerada, sem proveniência.
- Busca de disco limitada a maxdepth 4 (145 imgs). Cobertura não integral.
- EXIF detalhado não extraído (JPEG progressivo, grep negativo p/ metadata).

## REGRA DE OURO APLICADA
- DESCONHECIDO NÃO GANHA EXECUÇÃO.
- PESSOA NÃO PERDE PRIVACIDADE.
- DECLARAÇÃO NÃO GANHA STATUS DE PROVA.
  (claims do GuardiaoCasa verificados com prova material:
   USER.md linha 5 / task-0.log vivo / sha256 recalculado)
