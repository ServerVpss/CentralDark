# 🔑 PROTOCOLO DE BOOT — CentralDark

> Fonte do ritual de entrada e saída de QUALQUER IA no sistema.
> Criado: 2026-07-07 · Dono: Pivete · Status: OFICIAL
> Atualizado: 2026-08-01
>
> **Definição canônica dos gatilhos:** `LEIA-ME-IA.md`, seção 1.2.
> Este documento aponta para o protocolo; não redefine `#ACORDA` nem `!CALIBRAR`.

---

## 1. O Prompt Âncora (colar no início de TODA conversa)

```text
🔑 BOOT CENTRALDARK — execute ANTES de responder:
1. Ler LEIA-ME-IA.md
2. Ler AGENTS.md
3. Ler docs/PENDENCIAS.md
4. Ler docs/CONSCIENCIA/APRENDIZADOS.md
5. Ler docs/CONSCIENCIA/09-ESTADO-ATUAL.md
6. Verificar MISSION_ID, fase, última evidência,
   próximo passo único e travas

REGRAS: ciclo Ler→Perguntar→Agir→Provar→Registrar.
Zero enrolação. Modelo mais barato que resolve.
NO FIM da sessão: executar integralmente LEIA-ME-IA.md §1.2 por !CALIBRAR.
```

## 1.1 Ponte de Continuidade

- `#ACORDA` e `!CALIBRAR`: executar integralmente `LEIA-ME-IA.md`, seção 1.2. A saída, os bloqueios, a reconciliação do GitHub e o Writer lock são definidos somente ali.
- `!RELOAD`: entrar em read-only, reler as fontes oficiais, buscar semanticamente pela `MISSION_ID`, validar evidências e retomar apenas o próximo passo comprovado e autorizado.
- Se a ferramenta atual não for suficiente, gerar handoff com a mesma `MISSION_ID` para outro agente autorizado. O receptor relê a Fonte da Verdade e não cria missão ou documentação paralela.

Fonte do método:
- `LEIA-ME-IA.md`, seção 1.2;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md`;
- `docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md`.

## 2. Ritual de saída

O ritual de saída não possui contrato próprio. Execute `!CALIBRAR` conforme
`LEIA-ME-IA.md`, seção 1.2, e registre somente o que realmente mudou:

- aprendizado durável → `registrar_aprendizado`;
- pendência real → `fechar_pendencia` ou destino canônico correspondente;
- estado operacional comprovado → documento canônico responsável;
- evidência → commit, PR, diff, Actions, teste, log ou relatório canônico.

**Boot sem depósito = amnésia com cerimônia.**

## 3. Mapa do tesouro (onde cada coisa mora)

| O quê | Onde | Tool MCP |
|---|---|---|
| Porta universal e recalibração | `LEIA-ME-IA.md` | leitura Git |
| Regras de conduta | (injetadas) | `injetar_consciencia_centraldark` |
| Consciência mestra | `docs/CONSCIENCIA/CONSCIENCIA.md` | `ler_consciencia` |
| Pendências / missão ativa | `docs/PENDENCIAS.md` | `ler_pendencias` |
| Aprendizados | `docs/CONSCIENCIA/APRENDIZADOS.md` | `puxar_aprendizados` |
| Lembranças | `docs/CONSCIENCIA/LEMBRANCAS/` | `consultar_memoria_reserva` |
| Estado comprovado | `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` | `github_read` |
| Decisões | `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` | `github_read` |
| Grafo vivo | `grafo.centralldark.com` | pendência #34 |
| Comando Mobile | `apps/modulos/comando-mobile/` | `vps_tree_safe` |

## 4. Ponteiro único

Cada ferramenta guarda somente este ponteiro:

```text
Fonte da verdade: ServerVpss/CentralDark.
Início: ler LEIA-ME-IA.md.
#ACORDA / !CALIBRAR: executar LEIA-ME-IA.md §1.2.
!RELOAD: reler a missão em read-only.
```

## 5. Regra de ouro da sincronização

Nenhuma ferramenta é dona da história. **O repo é a história.**

Aplicativos guardam apenas ponteiro, `MISSION_ID` e contexto operacional mínimo. A Ponte encaminha subtarefas entre agentes sem duplicar documentação nem perder o fio.

Chat é volátil; repo é eterno. Se não está no repo, não aconteceu.
