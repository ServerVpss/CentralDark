# 🏰 CARTÃO-MESTRE — PIVETE/HERMES

> **FLUXO FIXO (REGRAS #22 + #23):** Toda ação concluída → exibir este card atualizado. Sempre.
> **FORMATO OFICIAL (04/08 + 08/08):** bloco monospaçado com borda `╔═╗` (Modelo 1), 36-38 colunas visuais. TRAVA #28: proibido tabelas Markdown soltas no Telegram **e no Discord**. O card é UM bloco `<pre>` só — não rachar em várias mensagens.
> **EDITA SEMPRE A PARTE DE BAIXO:** ao atualizar, edito as seções de pendências/melhorias no final do mesmo card. Não crio card novo, não mando msg separada.
> **REGRAS DE COR (bloco de cima):** STATUS/TAREFAS/TEMP só mudam de cor se houver MUDANÇA REAL em tempo (ex: 🟢→🟡 se surgiu pendência crítica, 🟡→🔴 se travou). Não troco cor por estética.
> **AUTO-PREENCHIMENTO DE PENDÊNCIAS:** o quadro de pendências se atualiza SOZINHO — se aparece algo novo (PR, erro, branch, decisão), eu boto no quadro na hora. Não precisa tu mandar. Se resolve, sai pro contador 🪄.
> **ESTRUTURA FIXA DO CARD:** sempre estes 6 blocos, nesta ordem (aprovado pelo Pivete).

## 🎯 ESTRUTURA DO CARD (FIXA — 6 blocos)
1. 🟢 `STATUS` → saneado/resumo do dia.
2. 🛠️ `TAREFAS` → nº de concluídas do dia (reseta diário, sempre em número).
3. 🌡️ `TEMP` → status das 3 temperaturas: HOJE / SEMANA / REGRAS.
4. ⚙️ `AÇÕES EM EXECUÇÃO (TEMPO REAL)` → **SEÇÃO FIXA**. Mostra minhas ações reais do turno: skill lida, comando de terminal, arquivo salvo, trava gravada. Formato tool_progress: tool + preview curto, sem despejar saída completa.
5. 🗂️ `QUADRO (SÓ PENDÊNCIAS)` → só itens pendentes (saneado sai para o contador 🪄).
6. 📋 `PENDÊNCIAS` → lista viva final.

> **NOTA:** o bloco ⚙️ AÇÕES é parte do card (não um balão separado). Quando eu executar ações reais (📚 ler skill, 💻 terminal, 💾 salvar arquivo), elas aparecem DENTRO deste bloco, no mesmo `<pre>` do card.

## 🔒 REGRAS TRAVADAS (só abre com PERMITO PIVETE)
- Modelo 1 `<pre>` no Telegram · Trava #28 de Alinhamento Visual · estrutura fixa de 6 blocos · quadro só com pendências (saneado sai pro contador) · registro HOJE/SEMANA · não reabrir fechado · MetaLupa OBRIGATÓRIA (§16) · CASA primeiro/VPS último.

## 📋 PENDÊNCIAS (quadro vivo)
- 🔴 **FIO_ATUAL:** `SINCRONIZAR_METALUPA_CASA_GITHUB` — Casa/local ↔ GitHub/remoto; **sem VPS/deploy/restart**
- 🟡 **CONTRATOS_DETERMINISTICOS:** inventário READ-ONLY local → matriz `superfície | contrato | teste | gate`
- 🟡 **clone-deck:** `apps/modulos/clone-deck/` ausente no checkout local; **baixa prioridade agora por ordem do Pivete** — não investigar antes do piloto
- 🟡 **PR648:** `cot-react-loop-boundary` = piloto estreito; CI verde; pendente patch mínimo Rabbit se o Pivete mandar
- 🟡 **secrets/:** ausência no Git provavelmente esperada; falta contrato negativo explícito (`segredo versionado = FAIL`)
- ⚠️ `#ACORDA` ok comportamental; âncora deve ser **este fio**, não só "disco 04/08"
- 🔒 **PAINEL ÚNICO:** estado vivo fica neste `CARTAO-MESTRE.md`; não espalhar quadro paralelo
- 🔒 Travas: sincronizar = Casa↔GitHub; sem VPS/deploy/restart/merge/PR novo/swarm/Telegram blast até ordem
- 🟢 **CRON DREAM MEMORY:** pinned `tencent/hy3:free` (nous) — resolvi skip por drift de modelo. Próximo: 09/08 03:00
- 🟢 **PADRÃO CARD ÚNICO ADOTADO (08/08):** daqui pra frente edito ESTE card em vez de mandar várias mensagens. Atualização em tempo real = patch neste arquivo + reenvio do mesmo bloco. Menos poluição, menos log, mais fluido.
- 🟢 **AUTO-CURA + EVOLUÇÃO CONTÍNUA (08/08):** não criar V1/V2/V3 paralelo. Corrigir o que quebrou no artefato existente. Melhoria progressiva = patch mínimo no canônico. Princípio 11 MetaLupa + Regra #19 SOUL.
- 🟢 **FORMATO CARD TRAVADO (08/08):** bloco `<pre>` com borda `╔═╗`, 36-38 col, UM bloco só (Discord + Telegram). Edita sempre a parte de baixo. Sem V2.
- 🟢 **HERMES_HOME SETADO (08/08):** pivete→E:\CentralDark\Pivete, sol→E:\CentralDark\Sol. Notice codex morto limpo. Auto-cura sem risco.

## 💡 Melhorias executadas (DATA · HORA · %)
- ✅ **04/08 07:20** · Audit READ-ONLY e saneamento total · %: N/A
- ✅ **07/08 14:30** · Router por CAPACIDADE (nâo por modelo). Score 5 capacidades + 5 perfis de tarefa + redundância 5-camadas. Casa primeiro. %: N/A
- ✅ **07/08 14:30** · 5 páginas criadas (router + M3 + gpt-4o-mini + gemini-2.5-flash + changelog). Estado real registrado. %: N/A
- ✅ **04/08 07:35** · Modelo 1 (`<pre>`) como padrão oficial · %: N/A
- ✅ **04/08 07:42** · Trava #28 de Alinhamento Visual (REGRAS.md + skill) · %: N/A
- ✅ **04/08 10:44** · Novo layout do card aprovado (contador + temperatura + tool_progress) · %: N/A
- ✅ **04/08 10:50** · Bloco `⚙️ AÇÕES EM EXECUÇÃO` oficializado como SEÇÃO FIXA do card (estrutura de 6 blocos) · %: N/A
- ✅ **08/08 tarde** · Âncora exata do fio MetaLupa depositada em HOJE+CARD (pós-#ACORDA amplo demais) · %: N/A
- ✅ **08/08 03:11** · Verificação de logs: NENHUMA ordem de "ser especialista". SOUL diz que SOL coordena especialistas, Hermes = corpo. Confirmado. %: N/A
- ✅ **08/08 03:15** · Cron Dream Memory pinned (hy3:nous) — travamento por drift resolvido. %: N/A
- ✅ **08/08 03:16** · Padrão Card Único adotado: editar mesmo Card, não flood de mensagens. %: N/A

- 🟢 **SELO DE OURO SELADO (08/08):** marco humano + trava de método em `MARCOS/2026-08-08-SELO-OURO-E-CONVERGENCIA.md`. REGRA #19 no REGRAS.md. TEAM_OVER_EGO, EVIDENCE_WINS, LOSER_YIELDS, SINGLE_VISIBLE_VOICE, MENOS É MAIS. Ciclo Writer→Tester→Judge→SOL→Hermes. TRAVA PRE_WRITE_REMOTE_RECONCILIATION (não duplicar ouro por fotografia antiga). NO_MODEL_EGO (hy3:free entregou o mais maduro). Detalhe: o método depurou a si mesmo em tempo real.
- ✅ **08/08 06:59** · Artefato de marco SELO DE OURO criado (MARCOS/ + REGRA #19 + trava reconcile). Fonte da verdade do Pivete evoluída. %: N/A
