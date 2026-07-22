# Mapeamento — Cartógrafo do sistema

Módulo 100% VPS. **Não existe painel no Lovable.**

## Papel

Um único Cartógrafo escaneia o sistema a cada 30 minutos, detecta drift e compara a árvore com o mapa canônico.

A estrutura não se organiza livremente. Toda evolução segue:

```text
mapa canônico → procurar encaixe existente → mudança mínima → teste/revisão
→ autorização aplicável → GitHub/SHA → consolidação/trava
```

## Fonte única executável

`config/mapa-canonico.json` é a fonte executável para setores, caminhos canônicos e áreas consolidadas.

- `CLAUDE.md` continua sendo a visão humana das travas.
- `.github/CODEOWNERS` continua sinalizando propriedade.
- `core/validar-mapa.mjs` é o gate determinístico.
- O workflow `codex-validate.yml` executa o gate em runner GitHub hospedado.
- O Cartógrafo executa o mesmo gate na VPS e transforma violação em drift.

Nenhuma dessas visões pode inventar outro mapa.

## O que o gate impede

- módulo novo fora do mapa;
- nomes de versão paralela como `v2`, `copy`, `backup` ou `novo`;
- duplicidade de módulos que difiram apenas por maiúsculas/minúsculas;
- alteração em área consolidada sem o label exato `permito-pivete`;
- caminho absoluto, travessia `../` ou entrada duplicada no mapa.

O label registra uma autorização do Pivete já existente para o alvo. Ele não pode ser aplicado por inferência.

## Promoção para CONSOLIDADO

Uma área só entra em `consolidated_areas` depois de:

```text
teste → revisão/falsificação → autorização do Pivete
→ commit/merge SHA → mapa reconhece o caminho → gate bloqueia
```

Depois disso, edição automática falha fechado até nova autorização explícita para o caminho exato.

## O que escaneia

- estrutura de `/root/CentralDark/apps/modulos/`;
- processos PM2 vivos/mortos;
- commit atual do Git;
- integridade do mapa e das travas.

## Fluxo

```text
cron */30 → cartografo.mjs
      ↓
scanner.mjs coleta snapshot + validar-mapa.mjs confere a árvore
      ↓
compara com logs/mapa-atual.json
      ↓
se drift/violação → salva histórico + dispara Grupo Evolução
      ↓
notifica Card Hermes no Telegram
```

## Prova local

```bash
node --test apps/modulos/mapeamento/tests/validar-mapa.test.mjs
node apps/modulos/mapeamento/core/validar-mapa.mjs --repo-root /root/CentralDark
```

## Cron

`*/30 * * * * node /root/CentralDark/apps/modulos/mapeamento/agents/cartografo.mjs`
