# ESTADO DA RETOMADA

> Gerado por `scripts/estado/gerar-estado-retomada.mjs`. **Nao edite a mao** —
> a proxima execucao sobrescreve. Para mudar o que e medido, mude o script.

Ultima geracao: `2026-08-05T09:13:17.218Z`

Fonte da intencao: `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`
Fonte da verdade estrutural: `apps/modulos/mapeamento/config/mapa-canonico.json`

## Resumo

- 🟢 fases com evidencia no repo: **6**
- 🔴 fases sem o artefato exigido: **0**
- 🟡 fases que o Git nao consegue provar: **5**

Fase com evidencia no repo nao significa fase concluida: significa que o
artefato minimo existe e esta versionado. Conclusao exige teste operacional.

## Fases

| # | Fase | Estado | Criterio medido |
|---|------|--------|-----------------|
| 0 | Congelar a verdade atual | 🟢 evidencia no repo | mapa canonico versionado + validador deterministico + guard de drift |
| 1 | Consolidar Jarvis da Casa | 🟡 SEM_EVIDENCIA_NO_REPO — vive no profile do Hermes na Casa, fora do Git | SOUL instalado no profile da Casa e carregamento provado |
| 2 | Inventariar o Bolt na VPS | 🟢 evidencia no repo | modulo Bolt versionado e alcancavel |
| 3 | Ligar preview real | 🟡 SEM_EVIDENCIA_NO_REPO — estado de runtime; exige inventario na VPS, nao ha artefato no Git que prove | URL por workspace + HMR + captura visual |
| 4 | Loop de agentes | 🟢 evidencia no repo | contrato de tarefa + correcao automatica com evidencia |
| 5 | Publicar e voltar | 🟢 evidencia no repo | deploy com health check e rollback provado |
| 6 | Ponte Casa <-> VPS | 🟡 SEM_EVIDENCIA_NO_REPO — exige teste ponta a ponta com a Casa ligada | contrato assinado, stream de eventos, cancelamento e auditoria |
| 7 | Painel administrativo total | 🟢 evidencia no repo | inventario vivo com nome humano, dependencia, custo e ultima prova |
| 8 | HUB e canais | 🟢 evidencia no repo | portal + Telegram + voz + notificacoes |
| 9 | Migracao dos negocios | 🟡 SEM_EVIDENCIA_NO_REPO — depende das fases 3 a 6 | cada modulo inventariado, rodando em workspace e publicado |
| 10 | Operacao continua | 🟡 SEM_EVIDENCIA_NO_REPO — so mensuravel depois da fase 5 fechada | manutencao, custo, capacidade e incidente automatizados |

## Modulos declarados no mapa e ausentes no checkout

| Caminho | Declarado como | Acao |
|---|---|---|
| `apps/modulos/clone-deck/` | area consolidada — Clone-deck consolidado | abrir PR: criar o modulo ou remover a declaracao |

### Ausencia esperada (nao e lacuna)

- `secrets/` — material sensivel proibido no Git — ausente por design, nao e lacuna

Estes caminhos geram aviso em todo PR. Aviso permanente treina o time a
ignorar aviso: ou o mapa passa a marcar `expected_absent: true`, ou a
declaracao sai. Enquanto isso, o ruido continua.

Totais no mapa: 20 caminhos de setor, 38 areas consolidadas.

## O que este arquivo nao mede

- estado de runtime da VPS (processo vivo, porta aberta, container saudavel)
- estado da Casa (SOUL carregado, voz, telas, memoria pessoal)
- se um modulo que existe realmente funciona

Existir no Git e condicao necessaria, nunca suficiente. Um caminho presente
aqui ainda pode estar quebrado em execucao.
