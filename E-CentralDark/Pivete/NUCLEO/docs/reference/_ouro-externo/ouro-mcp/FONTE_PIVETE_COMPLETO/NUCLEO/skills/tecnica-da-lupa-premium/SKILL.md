---
name: tecnica-da-lupa-premium
description: Revisar e decidir com evidência, correção mínima e sem estrutura paralela. Use antes de planejar, editar, integrar ou aprovar qualquer mudança de risco R2+ (fluxo interno, gateway, autenticação, dados, produção, orquestração de agentes). Aplica Zoom Out, Zoom In e Feynman, exige prova proporcional ao risco, bloqueia falso verde.
---

# Skill: Técnica da Lupa

**Nome:** Técnica da Lupa Premium (carregador operacional)
**Finalidade:** revisar e decidir com evidência, correção mínima e sem estrutura paralela.
**Definição canônica (única):**

`../../motor/10-observabilidade/TECNICA-DA-LUPA-PREMIUM.md`

(caminho absoluto: `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\TECNICA-DA-LUPA-PREMIUM.md`)

## Obrigação

Antes de planejar, editar, integrar ou aprovar qualquer mudança no NÚCLEO:

1. leia o arquivo canônico completo;
2. classifique o risco (R0–R4);
3. aplique Zoom Out, Zoom In e Feynman;
4. execute cenários reais quando aplicável;
5. registre evidências (não só narrativa);
6. emita veredito: APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR.

## Quando aplicar

- antes da integração;
- durante a integração;
- após mudança estrutural;
- sobre módulos, testes e resultado final;
- sobre a própria análise (Autolupa).

## Saída obrigatória

Veredito + evidências + limitações + pendências (sem falso verde).

## Bloqueios principais

- não criar LUPA-V2 / método paralelo;
- não destruir o PC;
- não VPS nesta fase;
- não secrets em log;
- não aprovar sem prova.

Este arquivo **não redefine** nem duplica a Técnica da Lupa.
A fonte da verdade do método é **somente** o Premium em `motor/10-observabilidade`.

---

**Nota estrutural (19/07/2026):** este arquivo foi movido de `NUCLEO/SKILL.md` (raiz)
para `NUCLEO/skills/tecnica-da-lupa-premium/SKILL.md` (pasta própria), seguindo o
mesmo padrão já usado pelas demais skills do ecossistema (`.agents/skills/<nome>/SKILL.md`,
`apps/bot-telegram/skills/<nome>/SKILL.md`) — evita colisão se outra skill for
adicionada em `NUCLEO/` no futuro. Front-matter YAML adicionado para ser
reconhecido pelo parser real de skills do Hermes (`tools/skills_tool.py::_parse_frontmatter`).
Ver `REVISAO-TECNICA-DA-LUPA.md` §31 para evidência completa desta mudança.
