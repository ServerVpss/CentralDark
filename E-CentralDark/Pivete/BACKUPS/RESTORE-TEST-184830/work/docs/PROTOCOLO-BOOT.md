# 🔑 PROTOCOLO DE BOOT — CentralDark

> Fonte única do ritual de entrada e saída de QUALQUER IA no sistema.
> Criado: 2026-07-07 · Dono: Pivete · Status: OFICIAL
> Atualizado: 2026-07-18

---

## 1. O Prompt Âncora (colar no início de TODA conversa)

```
🔑 BOOT CENTRALDARK — execute ANTES de responder:
1. kit_boas_vindas (MCP CentralDark)
2. Ler docs/PENDENCIAS.md
3. Ler docs/CONSCIENCIA/APRENDIZADOS.md
4. Ler docs/CONSCIENCIA/09-ESTADO-ATUAL.md
5. Verificar MISSION_ID, fase, última evidência,
   próximo passo único e travas

REGRAS: ciclo Ler→Perguntar→Agir→Provar→Registrar.
Zero enrolação. Modelo mais barato que resolve.
NO FIM da sessão: executar !CALIBRAR antes de encerrar.
```

## 1.1 Ponte de Continuidade

- `!CALIBRAR`: interromper novas ações, colocar processos em estado seguro, validar o estado real e depositar missão, evidência, próximo passo e travas somente nos documentos canônicos.
- `!RELOAD`: entrar em read-only, reler as fontes oficiais, buscar semanticamente pela `MISSION_ID`, validar evidências e retomar apenas o próximo passo comprovado e autorizado.
- Se a ferramenta atual não for suficiente, gerar handoff com a mesma `MISSION_ID` para outro agente autorizado. O receptor relê a Fonte da Verdade e não cria missão ou documentação paralela.

Fonte do método:
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md`
- `docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md`

## 2. Ritual de saída (sem isso a próxima IA herda NADA)

- `!CALIBRAR` — missão, evidência, próximo passo, travas e divergências
- `registrar_aprendizado` — erro+correção, atalho, regra ou armadilha da sessão
- `consolidar_pensamento` — se aprendeu algo sobre como o Pivete pensa
- `fechar_pendencia` — se resolveu item do PENDENCIAS.md
- `atualizar_painel` — se concluiu tarefa (status.centralldark.com)

**Boot sem depósito = amnésia com cerimônia.**

## 3. Mapa do tesouro (onde cada coisa mora)

| O quê | Onde | Tool MCP |
|---|---|---|
| Regras de conduta | (injetadas) | `injetar_consciencia_centraldark` |
| Consciência mestra | docs/CONSCIENCIA/CONSCIENCIA.md | `ler_consciencia` |
| Pendências / missão ativa | docs/PENDENCIAS.md | `ler_pendencias` |
| Aprendizados | docs/CONSCIENCIA/APRENDIZADOS.md | `puxar_aprendizados` |
| Lembranças | docs/CONSCIENCIA/LEMBRANCAS/ | `consultar_memoria_reserva` |
| Estado comprovado | docs/CONSCIENCIA/09-ESTADO-ATUAL.md | `github_read` |
| Decisões | docs/CONSCIENCIA/08-HISTORICO-DECISOES.md | `github_read` |
| Grafo vivo | grafo.centralldark.com | pendência #34 |
| Comando Mobile | apps/modulos/comando-mobile/ | `vps_tree_safe` |

## 4. Ponteiro único

Cada ferramenta guarda somente este ponteiro:

```
Fonte da verdade: ServerVpss/CentralDark.
Início: executar docs/PROTOCOLO-BOOT.md.
!RELOAD: reler a missão em read-only.
Fim: !CALIBRAR e registrar o ouro.
```

## 5. Regra de ouro da sincronização

Nenhuma ferramenta é dona da história. **O repo é a história.**

Aplicativos guardam apenas ponteiro, `MISSION_ID` e contexto operacional mínimo. A Ponte encaminha subtarefas entre agentes sem duplicar documentação nem perder o fio.

Chat é volátil; repo é eterno. Se não está no repo, não aconteceu.
