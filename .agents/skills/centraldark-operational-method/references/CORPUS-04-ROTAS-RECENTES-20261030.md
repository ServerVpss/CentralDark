## Missão, plano e ramo operacional

MISSION_NE_OPERATIONAL_SYMPTOM=true
RECOVER_CANONICAL_PLAN_BEFORE_IMPLEMENTATION=true

Recuperar o rumo humano vigente, o owner do plano e o próximo cursor antes de escolher ferramentas. Reparos de desktop/rede são ramos; não substituir a construção de inteligência persistente pelo último sintoma. Plano do cockpit: `docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md`, seção Plano vigente recuperável — 2026-10-01. Comparar cada etapa com prova atual; plano registrado, fonte existente e conta autenticada não significam integração executada. Selecionar skills sob demanda pelo setor e reutilizar o owner antes de criar.

## Modo padrão — autoconsulta canônica em cada decisão material

Antes de perguntar ao CHEFE, contradizer sua intuição ou substituir sua leitura por uma inferência do executor:

```text
RECUPERAR_INTENCAO_VIGENTE
→ CONSULTAR_CANONICO
→ CURRENT/RECEIPTS APLICAVEIS
→ SELF_GRILL
→ TENTAR_DERRUBAR_A_INTUICAO_COM_EVIDENCIA_INTERNA_E_VIVA
→ SOBREVIVEU: CONTINUAR
→ CAIU: MOSTRAR CONTRADICAO CONCRETA
```

Durante código, repetir o mesmo ciclo por decisão: setor → owner → receita/fingerprint → menor delta → efeito → prova/contraprova → VOLTA_UMA_CASA se divergir → costura do cone afetado → fixed point → receipt → next cursor.

```text
DEFAULT_OPERATION_MODE=CANONICAL_SELF_GRILL
CANONICAL_DOCS_BEFORE_QUESTION_OR_CONTRADICTION=true
TRY_TO_FALSIFY_CHEFE_INTUITION_AGAINST_CANON_AND_CURRENT=true
GENERIC_MODEL_PRIOR_MUST_NOT_OVERRIDE_CANONICAL_METHOD=true
EVERY_MATERIAL_DECISION_REENTERS_SAME_LOOP=true
DOCS_ARE_EXTERNALIZED_METHOD_NOT_MIND_READING=true
```

LEGACY_PR_MOTHER_1562_PROTECTED=true
SHELL_IS_MUTABLE=true
LEGACY_IS_PRESERVED=true


### 26. WORKTREE TEARDOWN — bancada temporária, rastro permanente

Regra operacional para agentes/subagentes que usam worktree isolado:

```text
MISSION_DONE
→ CLASSIFY_WORKTREE
→ UNIQUE_DELTA? PRESERVE/PROMOTE_FIRST
→ RECEIPT
→ REMOVE_WORKTREE
→ PRUNE_IF_APPLICABLE
```

Invariantes:

`WORKTREE_IS_DISPOSABLE=true`
`UNIQUE_DELTA_MUST_SURVIVE_BEFORE_TEARDOWN=true`
`CLEAN_OR_PROMOTED_BEFORE_REMOVE=true`
`TEARDOWN_REQUIRES_RECEIPT=true`
`GIT_WORKTREE_PRUNE_AFTER_SAFE_REMOVE=true`
`TEMPORARY_BENCH_IS_NOT_MEMORY=true`
`GIT_RECEIPT_CRYSTAL_IS_MEMORY=true`

Não remover worktree quando existir commit apenas local, arquivo modificado/untracked com delta único, receipt pendente, prova ainda não promovida ou classificação UNKNOWN. Worktree pode ser deletado após o delta útil estar promovido/preservado e a trilha de proveniência estar registrada. A limpeza deve deixar rastro suficiente para responder: qual missão criou a bancada, qual HEAD/base usou, qual delta sobreviveu, onde foi promovido e quando a bancada foi removida.

Isso preserva `ONE_SYSTEM_ONLY` sem impor `ONE_WORKTREE_ONLY`: percepção pode compartilhar leitura; mutação paralela usa isolamento quando necessário; cada escopo mantém um único writer.


### 27. Delegação econômica com prova — continuidade canônica

Para coordenar subagentes sem multiplicar custo, reutilizar a receita existente em [`references/delegacao-economica-com-prova.md`](references/delegacao-economica-com-prova.md). Primeiro procurar trabalho/prova existentes; para tarefas mecânicas usar scripts e sondas baratos; delegar apenas subtarefas independentes e com um writer por escopo; exigir resumos curtos com evidência; SOL julga resultado, testa e confere `main`/runtime antes de registrar receipt. Delegação não é conclusão. Não criar agentes, skills, HUDs ou watchers duplicados para aplicar esta regra.

## 🧠 Recuperação e aplicação de experiência — CENTRALDARK_METACOGNICAO_OPERACIONAL_PAPAGAIO_20261013 (sem skill paralela)

Antes de criar solução ou repetir erro já enfrentado:
1. **MEDIR** `origin/main` e a bancada atual; escolher owner/writer/escopo e reconhecer locks existentes.
2. **RECUPERAR** aprendizado/receita pertinente de `docs/CONSCIENCIA/APRENDIZADOS.md` e lembrança correspondente em `docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md` (seção `CENTRALDARK_METACOGNICAO_OPERACIONAL_PAPAGAIO_20261013`, aprendizado #172, antecedente #171); usar `puxar_aprendizados`/`consultar_memoria_reserva` quando acessíveis. Não repuxar 400k de documentação se bastam passagens delimitadas.
3. **DISCRIMINAR** `DOCUMENTED`, `COMMITTED`, `DEPLOYED`, `RUNTIME_HEALTH`, `SCAN_PARTIAL` e `UNKNOWN`. Estado histórico não é estado atual; route listada não prova rota operacional.
4. **EXECUTAR** somente por rotas autorizadas no escopo atual, mínimo delta, backup, sintaxe e teste funcional; verificar fonte/arquivo, consumidor, recibo e mesmo HEAD. Não suprimir proteção de cliente ou policy MCP. Fallback de rota somente autorizado.
5. **CONTRAPROVAR** em pelo menos um resultado discriminante; `hash_equal` prova igualdade de bytes, não funcionamento; `test exit 0` prova aquele teste, não deploy; HAKAI depois de testes de consumidor/rollback.
6. **DESTILAR** `problema → tentativa → erro → correção → código/fingerprint → teste → recibo → limitações → receita`, preservando a ordem dos eventos e referenciando o owner correto. Gravar aprendizado/lembrança pelos mecanismos existentes, não novo motor/skill/HUD.
7. **REUTILIZAR** com Kaizen contínuo só depois de revalidar pré-condições; registrar sinal de ganho verificável. `REGISTRADO!=CONSUMIDO`.

**PAPAGAIO_ON** sob ordem explícita de replay/treinamento/arquivo: reproduzir integralmente a fonte (A–Z se solicitado) e continuar a linha do tempo com detalhes, provas e pendências. **PAPAGAIO_OFF** durante mutação: comunicação curta por delta sem omitir a contraprova. Observar AGENTS.md + padrão de resposta para os mesmos gatilhos. “Human-Guided Compounding Reflexion” é termo descritivo, não permissão nem upgrade do modelo.

**Aceite:** em missão posterior, uma recuperação da experiência #172 seguida de uso concreto de um passo com resultado verificável prova **reuso**. A simples edição deste documento prova apenas **registro**.

<!-- LEARNING_175_SKILL_CONSUMER_20261013 -->
## 🧠 Contrato de consumo do Aprendizado #175 — ganho visível no próximo uso

Herdar `AGENTS.md#Aprendizado-175` e `docs/CONSCIENCIA/APRENDIZADOS.md#175`; recuperar apenas a passagem pertinente. Na primeira interação ou execução comparável: (1) recuperar intenção, última prova compatível e `NEXT_CURSOR`; (2) buscar o commit/arquivo ausente na `main` também no histórico/PR/branch/cópia **se necessário e autorizado**, antes de dizer perdido; (3) comparar fingerprint e fronteira; (4) reusar prova ou testar somente o delta; (5) continuar partes independentes apesar de falha local; (6) não ecoar qualquer segredo recebido pela ferramenta/arquivo; (7) marcar no mesmo receipt `learning_ref=L175`, `proof_reused|changed_claim`, `owner`, `sanitized_counterproof` e `NEXT_CURSOR`.

Se for pedido `PAPAGAIO ON`/A–Z: recuperar fielmente a história permitida, **nunca** expor credenciais, dados privados ou instruções de invasão; X/Y/Z não recebem significados inventados. Se for programação normal: `PAPAGAIO OFF`, entregar só delta e contraprova, não relatório repetitivo. **Não criar script, skill, HUD ou serviço para isso.** Provar consumo apenas quando missão futura mostrar recuperação + aplicação, não somente esta edição.

<!-- CENTRALDARK_OPERATIONAL_MODE_SKILL_20261013 -->
## Modo operacional CentralDark — executar por critérios próprios carregando o desejo

Ao atuar na CentralDark, use o Aprendizado #178 como modo padrão: transformar o desejo do CHEFE em critérios técnicos mínimos, executáveis e verificáveis. Não devolver a decomposição como pergunta; execute se a intenção e o escopo já autorizam.

```text
DESIRE_CAPTURED=true
SELF_SELECTED_CRITERIA_ALLOWED=true
CRITERIA_MUST_CARRY_CHIEF_INTENT=true
MICROAPPROVAL_FOR_AUTHORIZED_WORK=false
BATCH_SAFE_INDEPENDENT_STEPS=true
PROVE_ONLY_RELEVANT_DELTA=true
HUMAN_SUFFICIENT_POINT_CAN_CLOSE_SCOPE=true
REDUNDANT_CAUTION_IS_DEFECT=true
REAL_SAFETY_BOUNDARIES_REMAIN=true
LEARNING_REF=L178
```

Aplicação: escolher checks pequenos, corrigir cone afetado, continuar partes independentes e registrar `NEXT_CURSOR`. Não criar motor paralelo.

<!-- CENTRALDARK_SKILL_CHEFE_COMM_20261013 -->
## 💚 Entrega em todos os eixos — CHEFE não precisa decifrar estado interno

Carregar RULES.md e docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md. Em GitHub, CI, VPS, bot, Telegram, MTProto, CLI, HUD, MCP e outros consumidores, dar primeiro o que funcionou no escopo exato: 🟢 resultado observado. O que falta deve ter verbo concreto, alvo e local: 🟡 falta instalar /hton no Hermes da VPS e testar no Telegram. 🔴 só para falha realmente medida e localizada com menor reparo. ⚪ para escopo independente. FAIL/UNKNOWN/PENDING originais permanecem no recibo técnico.

Fala direta do CHEFE, baianês/resenha naturais; versículo ou rima opcionais e não evidência. Não impor formulário de sete campos, não pedir microconfirmação nem prolongar missão já satisfatória. Isto é herança de comunicação, não novo agente, skill, protocolo ou prova de runtime.

    SKILL_CHEFE_HUMAN_STATUS_OWNER=RULES+PADRAO_RESPOSTA
    SKILL_YELLOW_HAS_CONCRETE_ACTION=true
    SKILL_RED_REQUIRES_ACTUAL_LOCAL_FAILURE=true
    SKILL_NO_GENERIC_NON_PROVEN_ALARM=true
    SKILL_TECHNICAL_EVIDENCE_UNMODIFIED=true


### VS Code Windows Casa — descoberta Desktop Commander (2026-10-15)

Reutilizar [
eferences/remote-desktop-commander-vscode-casa.md](references/remote-desktop-commander-vscode-casa.md): descobrir contas/dispositivos remotos; confirmar Windows e processos VS Code/PowerShell; PID não prova controle de STDIN. /status requer resposta fresca do Hermes original.


<!-- CENTRALDARK_RECOVERY_COMMANDS_HUD_TO_INSTINTO_20261015 -->
## 🪬 #acordar · !calibrar · !centraldark — recuperação de contexto com baixa latência

**INTENT_ID:** CENTRALDARK-HUD-INSTINTO-RECOVERY-20261015. **CHEFE_INTENT:** interromper raciocínio ocioso; recuperar rapidamente a máquina de estados e continuar a migração integral de `docs/HUD/HUD.html` para o **zone já existente** do Instinto Superior. Esses gatilhos são **aliases da receita operacional existente**, não comandos shell, um segundo motor, scheduler, outro Hermes ou autorização para ações irreversíveis.

| Gatilho recebido | Operação fiel e curta | Saída obrigatória |
|---|---|---|
| `#acordar` | Restaurar a intenção ativa, branch/PR/owner e último receipt; consultar fontes atuais apenas no escopo afetado. | `CURRENT + PROOF + NEXT_CURSOR`; retomar a etapa independente que já estava autorizada. |
| `!calibrar` | Contrastar estado declarado com GitHub, Casa, VPS, extensão, funil e testes relevantes; marcar `SOURCE/BUILD/INSTALLED/ACTIVE/UI` separadamente. | `PASS` só com readback; `UNKNOWN` e impedimentos exatos sem presumir falha global. |
| `!centraldark` ou `!CENTRALDARK` | Invocar método canônico: intenção → owner existente → recuperar recibo → execução no escritor autorizado → contraprova → registro. | Recibo operacional e próxima ação, sem pedir microaprovações desnecessárias. |

**Receita de retomada para a missão atual:** `docs/HUD/HUD.html` (fonte histórica com selos, cadeados, Gênesis, API e Hermes) → `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json` (UIDs canônicos) → `apps/instinto-superior/src/components/central/CockpitShell.tsx` (zone existente) → `apps/instinto-superior/src/components/central/HudDeterministico.tsx` na branch `feat/instinto-hud-genesis-selos-zone-20261015` → teste `apps/instinto-superior/scripts/verify-hud-zone.mjs` → receipts → gates → consumidor do cockpit. O contador do manifesto atual tem 198 nós mais `L000`, diferente do replay HTML histórico com 169 elos; preserve UIDs e não declare migração integral por um único componente. `docs/HUD/HUD.html` permanece preservado até paridade e readback completos.

**Padrão de comunicação solicitado:** sempre que descobrir ganho novo, anunciar exatamente **🍒🎰🎲 Outra melhoria antecipada**, explicar **o que faz / por que melhorou / prova / próximo cursor**, e continuar o bloco autorizado. Atualização no chat é relatório, não log de execução fabricado. Nunca reproduzir credenciais ou logs brutos privados.

**Cura para ocioso:** não repetir investigações inteiras quando `receipt+SHA+owner` ainda servem; revalidar apenas estado volátil. Se teste/rota falhar, preservar writer e trabalhar outra parte independente no mesmo escopo; só parar diante de bloqueio real. Usar caminhos no disco `K:` vinculado ao VS Code para staging quando disponível, sem sobrescrever projetos ocupados nem recriar pacotes/skills.

**FIXED_POINT:** aceitação de satisfação do CHEFE é distinta de conformidade operacional mensurada; selos exigem efeito e contraprova. `NEXT_CURSOR` sempre recuperável. Executar apenas ferramentas autorizadas e não transformar `#acordar` em autostart destrutivo.


<!-- FORJA_VIVA_EMOJI_ALIAS_DELTA_FIXED_POINT_20261015 -->
## 🔧 🛠️ 👨🏻‍🔧 👀 👁️ 🪡 🎄 🌞 🌟 ✨ ☄️ 🔥 🪛 ⚒️ 🧹 — Forja Viva, aliases sob demanda

**FIXED_POINT do CHEFE:** estágio corrente e satisfação aceitos; só abrir cadeado para DELTA útil provado. O estado antigo permanece histórico, não deve ser reconstruído a cada retomada. `#acordar → !calibrar → !CENTRALDARK` continua a forma curta de recuperar owner + SHA + última prova + NEXT_CURSOR.

**Fonte visual canônica:** `docs/CONSCIENCIA/PADRAO-EMOJIS.md`. **Owner da casca:** `apps/instinto-superior/src/components/central/HudDeterministico.tsx` na PR #1832. **Build/empacotamento:** `apps/instinto-superior/package.json` invoca `npm run verify:hud && npm run build && node scripts/build-plugplay.mjs`. **Contrato de identidade:** `docs/ARQUITETURA/CENTRALDARK-CRYSTALLIZED-PLUG-PLAY.yml`. **Forja visual:** `docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml`. Nenhum novo motor, skill, coleta ou roteador.

**Como utilizar:**
- 🔧🪛 → inspecionar + diagnosticar via extensão VS Code Restore e funil único, sem captar prompts/segredos.
- 🛠️👨🏻‍🔧 → manter o mesmo owner e a mesma receita, após evidência de causa e autorização.
- 👀👁️ → observar/contraprovar no painel existente, com `UNKNOWN` quando faltarem dados.
- 🪡🎄 → preservar UIDs e aprendizagem; não renumerar Gênesis nem duplicar selos.
- 🌞🌟✨ → retomar contexto e anunciar **🍒🎰🎲 Outra melhoria antecipada**, explicando ganho, uso, fonte/prova e cursor.
- ☄️🔥⚒️ → compilar e preparar ZIP POMBO64 com manifesto/hash por comando **explícito** `npm run build:plugplay`, em ambiente de build autorizado e preferivelmente no volume K: vinculado à Forja; **nenhum emoji executa esse comando automaticamente**.
- 🧹 → consultar o owner **já existente** `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`, inventariar alterações e confirmar receipt, efeito/main quando aplicável; limpar somente o **scratch descartável comprovado** com lock e realpath. Visual na Casa quando o CHEFE pedir. No checkout em trabalho: `KEEP_ACTIVE`.

**Loop de código vivo, mas governado:** `DISCOVER_EXISTING_OWNER → READ_COMPATIBLE_RECIPE → DELTA_WITHIN_CAUSAL_CONE → TEST → COUNTERPROOF → RECEIPT → FIXED_POINT`. Quando houver outra melhoria independente, continuar só se não violar writer único, escopo/autorização e gates. `SOURCE_COMMITTED ≠ BUILD_PASS ≠ ZIP_PROVEN ≠ RUNTIME_DEPLOYED`. Comando visível em chat ≠ texto enviado ao terminal; `SEND_OK ≠ EXIT_0`. Nunca limpar worktree em uso.

**Pacote plug-and-play:** `build:plugplay` usa dependência JSZip já declarada pelo app; arquivo `apps/instinto-superior/scripts/build-plugplay.mjs` é **implementação de build**, não outra receita/skill. ZIP contém somente output compilado filtrado, contratos obrigatórios, manifest com SHA por arquivo e SHA do ZIP; recusa fontes locais modificadas, links simbólicos e arquivos sensíveis. Não automatiza instalar, deploy, restart ou apagar históricos. Se dependências, destino, build ou CI estiverem ausentes, `BLOCKED/UNKNOWN` localizado, sem reconfigurar infraestrutura à força.

**Critérios de selo:** aceitação humana 100% do método e prova operacional são categorias diferentes. Código e teste em branch #1832 não equivalem a UI publicada; todos os indicadores de conformidade devem apresentar denominador e evidência. Se o runtime de alguma capacidade ainda for `UNKNOWN`, preservar o FIXED_POINT do estágio anterior e o NEXT_CURSOR, sem falso selo.


## 🔧 DEPENDENCY_FIX_FAST_PATH — correção direta com promoção comprovada (2026-10-15)

**INTENÇÃO DO CHEFE:** quando houver erro de dependência com causa e versão corrigida comprovadas, o agente principal **já owner do escopo** corrige imediatamente e promove à produção pela esteira existente **sem solicitar confirmação redundante**, se todas as condições técnicas e de governança forem satisfeitas. Não criar agente, PR, worktree ou executor paralelos por ritual; reutilizar a branch, os locks e os gates vigentes.

```text
DETECT_DEPENDENCY_VIOLATION
→ VERIFY_ROOT_CAUSE_AND_FIXED_VERSION (upstream changelog/advisory + compatibility)
→ IDENTIFY_MAIN_AGENT_AND_ONE_WRITER_PER_SCOPE
→ LOCK + SNAPSHOT_CURRENT_SHA_AND_LOCKFILE
→ PATCH_MINIMUM_DEPENDENCY_AND_LOCKFILE_IN_SAME_OWNER
→ INSTALL_REPRODUCIBLY + TEST_AFFECTED_CONE + BUILD + REGRESSION
→ COUNTERPROOF (no API/ABI break, security regression, unexpected diff)
→ RECEIPT (old/new version, SHA, tests, rollback, owner)
→ PROMOTE_VIA_EXISTING_MAIN_GATES (no bypass, no force-push)
→ DEPLOY_VIA_EXISTING_AUTHORIZED_PIPELINE_IF_GREEN
→ HEALTH_READBACK + FUNCTIONAL_RUNTIME_READBACK
→ FIXED_POINT; IF_FAILED ROLLBACK_OR_KEEP_PREVIOUS_HEALTHY_VERSION + NEXT_CURSOR
```

**AUTO_PROMOTE_IF_ALL_GREEN:** somente se a versão for verificada, impacto limitado, testes aplicáveis PASS, branch protection/approvals atendidos, CI e política de deploy satisfeitos, rollout/rollback conhecidos e não houver trabalho alheio em risco. **Nunca** tratar `npm install`, versão semver ou commit como prova de produção. Mudança major incompatível, lockfile divergente, API removida, build quebrado, gate pendente, autorização insuficiente ou ausência de contraprova => `BLOCKED/UNKNOWN`, preservar runtime e reportar a menor causa; não publicar quebrado. Se a produção exigir aprovação humana ou uma etapa que não possa ser executada pela rota disponível, parar nesse gate e relatar precisamente o bloqueio. `PROD_PASS` exige SHA implantado, health e efeito funcional lidos do runtime. 

**Precedência:** owner e receita de dependências já existentes continuam autoridade; esta seção apenas define a **decisão rápida e a sequência de evidência**. Aplicar o mínimo delta e o mesmo checklist CURRENT; 🧹 só depois de preservação e readback.

## PAPAGAIO ON — rastro incremental no mesmo método (18/10/2026)

**OWNER=centraldark-operational-method**. Adotar o padrão a seguir apenas quando CHEFE estabeleceu PAPAGAIO ON para a missão. É um formato narrativo, **não** engine, outro agente, nova SOUL, nova memória nem prova sintética.

### Cabeçalho de percurso e prova

```text
👑🪬 CENTRALDARK · #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → MetaLupa → !FABLELOOP → !META-GRILL → !GRILME
🧬 RASTRO <n crescente> · Gancho: <método realmente aplicado> → <alvo> → <evidência/efeito>
```

Regras:
1. Repetir o cabeçalho nas passadas materiais. **Rastro incrementa por observação, teste, decisão, write, contraprova ou handoff**, não por frases de progresso inventadas.
2. Nomear o gancho realmente usado naquela passada e preservar `NEXT_CURSOR` até FIXED_POINT. A lista fixa de métodos no título é gramática de invocação, **não atestado de execução simultânea**.
3. Manter estados específicos: `🟢` efeito verificado; `🟡` em andamento/sem readback; `🔴` bloqueio real. Distinguir `DISCOVERED`, `CONFIGURED`, `LOADED`, `EXECUTED`, `MERGED`, `DEPLOYED`, `FIXED_POINT`.
4. Baianês autêntico com pitadas mineiras e metáforas bíblicas, sem caricatura: “Ôxente, CHEFE, esse trem tá arretado, mas a vitória só vem com contraprova, uai!”. Metáforas e versículos são contexto semântico; `VERSE != TECHNICAL_PROOF`.
5. Manter o mesmo método em chat, Hermes e cockpit quando cada superfície consumir o contrato; **SOURCE_PRESENT != SESSION_LOADED**. Nunca atribuir ação ao Hermes sem mensagem/receipt real.

### Gancho → owner existente → capacidade pesquisável

- `#ACORDAR` → `centraldark-boot` e `centraldark-capability-hud`.
- `!CALIBRAR` → `centraldark-operational-method`.
- `!MULTIBÚSSOLA` → `docs/CONSCIENCIA/MULTIBUSSOLA.md`; não é novo executor.
- `MetaLupa` → `meta-lupa`.
- `!FABLELOOP` → `fable-loop`.
- `!META-GRILL` → `meta-lupa/KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md` dentro do owner.
- `!GRILME` → `grill-me`; possui `disable-model-invocation: true`, portanto apenas referenciá-lo não comprova invocação/execução.
- `!RASTRO` → owner de receipts/auditoria existente.

**Descoberta no Hermes:** `skill-synchronization` documenta `skills.external_dirs` nativo para expor o catálogo canônico `.agents/skills` mesmo quando o gateway opera fora do checkout. Instalação/ativação/uso continuam etapas separadas, protegidas por writer e readback, sem importação automática das centenas de skills.

<!-- AUTOCATALOGO:INICIO -->
## Melhorias comprovadas e incorporadas sem regressao

Registros aditivos comprovados no Windows Casa pelo script verificador. Nao substituem receitas anteriores. Cada registro preserva sua origem, razoes e contraprova.

### t_26e02a16 — excluir
- Criado em: 2026-10-24T19:46:48-03:00; destino: C:\root\HERMES-KANBAN-TESTE.txt
- Por que fazer: Eliminar somente o TXT temporario criado no teste anterior autorizado.
- Por que nao fazer outra coisa: Nao apagar a pasta nem recorrer a exclusao direta; somente o Hermes Kanban deveria executar a intencao.
- Por que usar: Reutilizar o Hermes da Casa, perfil default e mesmo comando kanban create ja comprovados.
- Por que modificar: Trocar a intencao de criar para excluir sem modificar o metodo de delegacao.
- O que mudou: O arquivo do teste deixou de existir apos a segunda missao Hermes; o metodo de delegacao permaneceu intacto.
- Contraprova: Kanban DONE isolado nao prova exclusao; Test-Path do alvo retornou falso no Windows Casa.
- Resultado: PROVADO na operacao/alvo avaliados. Recibo: catalogo/comprovacoes/t_26e02a16.json
<!-- AUTOCATALOGO:FIM -->

## Hipótese física explícita para quedas de conexão e tela apagada — replay com fingerprint (2026-10-26)

**REGRA DO CHEFE — NÃO DESCARTAR NEM CONFIRMAR A CAUSA PREMATURAMENTE.** Quando a tela do computador apagar, a GPU deixar de responder, houver suspeita de mau contato/encaixe, alimentação, cabo, monitor ou falha física interna, e em seguida aparecerem quedas de conexão Casa↔VPS, HTTP 523, timeout, peer offline ou testes interrompidos, registrar a hipótese física como **CANDIDATA NÃO CONFIRMADA** junto dos sintomas correlacionados. Não atribuir automaticamente tudo à rede, software, GPU ou hardware; correlação temporal é sinal, não prova causal.

**Receita obrigatória de repetição e peneira:**
1. Preservar a observação original, horário/fuso, host, tela/GPU, conectividade, serviços e resultados, sem substituir o registro anterior.
2. Reexecutar a MESMA receita diagnóstica existente, com os mesmos alvos, comandos, ordem e critérios, sempre que for seguro; registrar versão/fingerprint da receita e condições de execução. Não criar outra receita por conveniência.
3. Comparar o fingerprint e o resultado novo com o registro anterior: SAME_FINGERPRINT + SAME_SIGNATURE fortalece a identificação recorrente, mas não prova causa física; DIFFERENT_FINGERPRINT ou condições diferentes exigem marcar a comparação como não equivalente.
4. Peneirar evidências discriminantes: horário da perda de vídeo, estado do host, Tailscale, SSH autenticado nos dois sentidos, health/readback local e público, logs/eventos de sistema e telemetria disponível. Distinguir causa observada, hipótese, sintoma correlacionado, ruído e dado ausente.
5. Registrar no owner/receipt existente: hipótese, evidência favorável, contraprova, evidência ausente, fingerprint, número da repetição, resultado e próximo cursor. Não apagar nem sobrescrever histórico.
6. Atualizar a conclusão apenas conforme a contraprova: CANDIDATE, SUPPORTED, REFUTED ou UNKNOWN. SCREEN_BLANK != GPU_CAUSE_PROVED; NETWORK_TIMEOUT != NETWORK_ROOT_CAUSE; TEMPORAL_CORRELATION != CAUSAL_PROOF; SAME_RECIPE != SAME_CAUSE sem evidência discriminante.

**Aplicação ao incidente atual:** a hipótese de que uma carga anormal/instabilidade da GPU, tela apagada ou possível encaixe/conexão física tenha provocado a interrupção do computador e, por consequência, as falhas observadas de conectividade deve permanecer registrada como **CANDIDATA NÃO CONFIRMADA** até a repetição da receita e a comparação de fingerprints. Não tratar falhas observadas durante a possível queda como prova automática de defeito de software ou da rede.

**Owner:** esta skill canônica centraldark-operational-method, com reaproveitamento do owner de MetaLupa/contraprova e dos receipts já existentes. Não criar skill, HUD, watcher, agente ou sistema paralelo para guardar esta regra. Registro nesta skill prova apenas que a regra foi documentada; consumo, correlação e diagnóstico continuam exigindo execução e readback reais.

## Receita canônica — overlay de mapeamento em duas superfícies no Hermes original

Quando o CHEFE pedir mapeamento/overlay em duas conversas, tratar como uma única rodada de observabilidade do mesmo Goal. Reutilizar as abas já abertas e os owners `desktop_preview`/`drive_preview`; não usar sessão isolada, não criar chat e não alegar paralelismo físico sem capability medida.

```text
MEASURE_CURRENT_MAIN_AND_LOOP
→ IDENTIFY_SURFACE_A/B (URL, título, tab/document, origem)
→ desktop_preview/read(A) + drive_preview/elements(A)
→ STORE FRESH_REFS_A + OVERLAY_A + FOCUS_A
→ desktop_preview/read(B) + drive_preview/elements(B)
→ STORE FRESH_REFS_B + OVERLAY_B + FOCUS_B
→ IF_FOCUS_OR_IDENTITY_CONFLICT: STOP_INTERACTION, REMAP
→ ACTION_A, READBACK_A
→ REMAP_B, ACTION_B, READBACK_B
→ CORRELATE_RECEIPT_AND_ORIGIN
```

O overlay colorido/rosa do `drive_preview` significa apenas que elementos foram mapeados. `OVERLAY_OBSERVED != ACTION_EXECUTED != EFFECT_PROVEN`. “Paralelo” nesta receita significa `SAME_ROUND_ID`; se não houver execução concorrente segura, registrar `PARALLEL_EXECUTION=UNAVAILABLE` e `EXECUTION_ORDER=A→B`.

Envelope mínimo de cada superfície:

```text
ACTOR=HERMES
ORIGIN_DECLARED=PASS|UNKNOWN
ORIGIN_SOURCE=HERMES_DESKTOP|CHAT_GLOBAL|COCKPIT|HUMAN|UNKNOWN
ORIGIN_AUTHENTICATED=PASS|UNKNOWN
SURFACE_ID=
URL_OR_DOCUMENT=
SNAPSHOT_REF=
OVERLAY_MAPPING=PASS|UNKNOWN
FOCUS_CONSISTENCY=PASS|UNKNOWN
ACTION=PASS|UNKNOWN|BLOCKED
READBACK=PASS|UNKNOWN|BLOCKED
RECEIPT_ID=ID|UNKNOWN
NEXT_CURSOR=
```

`ACTOR=HERMES` escrito no ChatGPT nunca autentica a origem. Só promover `ORIGIN_AUTHENTICATED=PASS` com receipt do executor original/UIA ou evento terminal correlacionado ao mesmo `LOOP_ID`, `TURN_ID`, `INTENT_ID`, `SURFACE_ID` e alvo. Se `active_tab_id` discordar de URL/título/documento, classificar `FOCUS_CONSISTENCY=UNKNOWN`, remapear refs e não clicar. O relatório deve preservar literalmente os estados não provados:

```text
COCKPIT_SYNC_ACIONADO=UNKNOWN
READBACK=UNKNOWN
RESULTADO_DO_SYNC=UNKNOWN
CICLO_BILATERAL_COMPLETO=UNKNOWN
```

Esta receita está documentada, não executada por este patch. Sua homologação exige replay A→B, readback independente em ambas as superfícies, receipt correlacionado, contraprova e comparação com a baseline; sem isso o veredito é `UNKNOWN`.

## RECEITA VIVA — mapa completo de navegação do Cockpit (2026-10-30)

<!-- CENTRALDARK_COCKPIT_CONTROL_MAP_20261030 -->

**Objetivo:** ensinar qualquer executor que carregue esta Skill-Mãe a operar o Cockpit existente com o mesmo método. A receita separa navegação segura, leitura, expansão e mutação. Ela não transforma um botão visível em prova de backend.

**Owner:** `K:\apps\instinto-superior\src\components\central\CockpitShell.tsx`.
**Owners auxiliares:** `AutoSyncButton.tsx`, `StatusPanel.tsx`, `MapaOwners.tsx`, `SyncCenter.tsx` e `CockpitActionButton.tsx`.
**Superfície medida:** `http://127.0.0.1:8080/sala-controle`, título `Cockpit CentralDark — Sala de Controle`.
**Rota de controle:** Browser/UI Automation autorizado → DOM/ARIA → ação sem coordenada fixa → readback do mesmo documento.

### Inventário atual comprovado

- `CONTROL_ELEMENTS=127`: união de `button`, `summary`, `a`, `role=tab`, `role=checkbox` e `role=combobox` no DOM renderizado.
- `TOP_LEVEL_TABS=27`: todas as 27 abas foram selecionadas uma vez e cada seleção mostrou um `tabpanel` ativo com título ou conteúdo próprio.
- `HARNESS_STATUS_CONTROLS=37` antes do catálogo de abas; `CONTENT_CONTROLS=63` depois do catálogo. Esses números são o snapshot da sessão, não um contrato fixo.
- `PORT_INVENTORY_READBACK=204` no momento da medição. O número é dinâmico. Não copiar um valor histórico para outra sessão.
- `MEASURE_READBACK=PASS` no escopo do sensor: antes `Última atualização: 30/10/2026, 16:05:36`; depois `16:05:58`, após `Medir agora` retornar ao estado utilizável. Isso prova a leitura do sensor, não todas as rotas do backend.
- `OBSERVED_AT=2026-10-30T19:06:30.212Z`; `URL_READBACK=PASS`; `TITLE_READBACK=PASS`.

### Fluxo obrigatório para qualquer botão

```text
IDENTIFICAR_INTENÇÃO
→ RESOLVER_OWNER_E_SESSÃO
→ SNAPSHOT_BEFORE(URL,TÍTULO,ROLE,NOME,ARIA,FLOW,ESTADO)
→ CLASSIFICAR(SAFE_NAV|READ_ONLY_EXPAND|READ_ONLY_MEASURE|MUTATING|UNKNOWN)
→ SEGURO? CLICAR UMA VEZ PELO SELETOR SEMÂNTICO
→ SNAPSHOT_AFTER(DOM,ARIA,TAB/DIÁLOGO,STATUS,DATA)
→ CONTRAPROVA_E_COMPARAÇÃO
→ REGISTRAR(AÇÃO,READBACK,EFEITO,STATUS,RECEIPT,NEXT_CURSOR)
```

Use `data-cd-flow` quando existir. Caso contrário, use `role` + nome acessível. Reidentifique o controle depois de qualquer navegação. Não reutilize índice AX antigo. `CLICK_ACCEPTED != EFFECT_PROVED`.

### Mapa de controles e comportamento

| Local | Controle | Classificação | Ação real / owner | Regra de prova |
|---|---|---|---|---|
| Harness superior flutuante | `CentralDark` | `SAFE_NAV` | `abrirDestino("visao")` | aba Visão ativa e `#centraldark-harness-abas` visível |
| Harness superior flutuante | lupa | `SAFE_NAV` | `definirGaveta("top")` | gaveta Harness aberta e campo `busca-harness` presente |
| Harness superior flutuante | mapa | `SAFE_NAV` | `definirGaveta("right")` | gaveta direita aberta |
| Harness superior flutuante | notificações | `SAFE_NAV` | `definirAbaAdminInicial("notificacoes")` + Admin | aba Admin e painel correto; não inventar evento |
| Cabeçalho | `CentralDark Estúdio` | `READ_ONLY_MEASURE` | `abrirEstudio()`; usa o AionUI existente ou verifica a API | `estadoEstudio` e URL devem ser lidos depois |
| Cabeçalho | `Aproximar ao ChatGPT` | `READ_ONLY_NAV` | `abrirPlayerLocal()`; abre o player local | diálogo do player presente; não confundir com conexão MCP |
| Cabeçalho | `Hermes ONE` | `SAFE_NAV` | `abrirHermesOne()` → aba Hermes | aba Hermes ativa; não alegar execução Hermes |
| Cabeçalho | `Minha conta` | `READ_ONLY_EXPAND` | abre popover de conta; `sair()` só com ordem própria | readback do menu; logout é mutação de sessão |
| Rail esquerdo | ferramentas | `SAFE_NAV` | `definirGaveta("left")` | Sheet Harness aberto; a sessão mediu este efeito |
| Rail esquerdo | Gram | `SAFE_NAV` | Gram se autenticado; Visão sem autenticação | confirmar aba resultante e estado de autenticação |
| Rail esquerdo | Goals | `SAFE_NAV` | `abrirDestino("goals")` | aba Goals ativa |
| Rail esquerdo | buscar módulos | `SAFE_NAV` | `definirGaveta("top")` | gaveta top e filtro presentes |
| Rail direito | Sistemas | `SAFE_NAV` | `definirGaveta("right")` | gaveta direita aberta |
| Rail direito | Hermes | `SAFE_NAV` | `abrirDestino("hermes")` | aba Hermes ativa |
| Rail direito | Configurar Harness | `READ_ONLY_EXPAND` | `definirGaveta("bottom")` | gaveta inferior aberta |
| Rail inferior | Sync | `SAFE_NAV` | `abrirDestino("sync")` | Oficina ativa |
| Rail inferior | Pacotes | `SAFE_NAV` | `abrirDestino("downloads")` | Downloads ativa |
| Rail inferior | moldura | `READ_ONLY_EXPAND` | `definirGaveta("bottom")` | gaveta inferior aberta |
| Auto Sync | `Windows` | `MUTATING` | `handleSync("windows")`; commit/push via `executarSync` | nunca clicar em varredura; exige autorização e readback GitHub |
| Auto Sync | `Main` | `READ_ONLY_OPERATIONAL` | `handleSync("main")`; consulta e compara SHAs | provar SHA local e `origin/main`; consulta não é merge |
| Auto Sync | `VPS` | `MUTATING` | `handleSync("vps")`; SSH/fast-forward | exige autorização; conflito bloqueia; readback remoto obrigatório |
| Auto Sync | `Sincronizar Tudo` | `MUTATING` | alvo atual `local`; Casa/Main, sem VPS | texto/escopo do seletor é parte do contrato; não chamar “deploy” |
| Auto Sync | `Main Only` / `Full` | `READ_ONLY_SELECT` | altera somente `microDeployMode` | seleção não executa nada; a prova começa no botão seguinte |
| Automação | `Executar Automação` | `MUTATING` | `handleMicroDeploy` → pré-sync → promoção existente | não clicar automaticamente; gates, workflow e receipt devem existir |
| Estado | `Medir agora` | `READ_ONLY_MEASURE` | `q.refetch()` → `lerEstadoCentralDark` | timestamp/estado mudam e botão retorna a utilizável; não prova deploy |
| Estado | Rotas e alertas | `READ_ONLY_EXPAND` | abre `<details>` | conteúdo expandido visível; não reclassificar status sozinho |
| Commander | inventário de portas | `READ_ONLY_EXPAND` | alterna `inventarioAberto` | título troca para ocultar e lista TCP/UDP aparece |
| Cards | detalhes técnicos | `READ_ONLY_EXPAND` | abre `<details>` do sensor | conteúdo do mesmo card aparece |
| Jornada | iniciante/engenharia | `READ_ONLY_SELECT` | altera `simples` | texto da etapa muda; não executa comando |
| Jornada | etapas / anterior / próxima | `READ_ONLY_SELECT` | altera `passoAtivo` | etapa e `aria-pressed` mudam |
| Mapa Owners | caminhos simples | `SAFE_NAV` ou `READ_ONLY_EXPAND` | `abrirCaminhoSimples`; Conexões abre diálogo Admin | destino/diálogo deve aparecer; privado desabilitado sem auth |
| Mapa Owners | `Abrir área →` / `Abrir Admin →` / `Abrir Sistema →` / `Abrir Hermes →` | `SAFE_NAV` | `onNavigate` para o owner indicado | aba correta ativa; não inferir runtime |
| Sync Center | Personalizar / Modelos | `READ_ONLY_EXPAND` | abre gaveta local | gaveta e conteúdo visíveis; não altera executor |
| Sync Center | percurso / visão / duas vias | `READ_ONLY_SELECT` | altera estado visual do Sync Center | estado selecionado muda; não é sincronização |
| Forja / Sistema | atualizar/medir | `READ_ONLY_MEASURE` | refetch do sensor existente | timestamp e resposta do sensor |
| Externo/desktop | Obsidian / Unigram | `MUTATING_LOCAL_APP` | bridge nativa `openObsidianDesktop`/`openUnigramDesktop` | só executar com pedido explícito; status `REQUESTED` não prova janela pronta |
| Harness | Ocultar moldura / Mostrar Harness | `READ_ONLY_LOCAL_UI` | altera somente `harnessVisivel` | barras desaparecem/aparecem; não altera backend |

### As 27 áreas navegadas nesta rodada

`Visão geral`, `Jornada`, `Portal`, `Builder Bolt`, `Mapa PR #1873`, `CentralDark Gram`, `Minha Oficina`, `Design Center`, `Goals`, `Gênesis · Michelin`, `Dream`, `Estrutura`, `Raio-X`, `Recibos`, `Forja`, `Permissões Forja`, `Admin CentralDark`, `Sistema CentralDark`, `Obsidian`, `Estúdio`, `Hermes`, `Unigram`, `Regras Forja`, `Inventário`, `Agent Mode`, `HTML Consolidation` e `Downloads`.

O readback de cada área deve guardar `id`, título/heading, `tabpanel` ativo e uma amostra curta. Nesta rodada, as leituras principais foram: Visão (`K:\`, `F:\`, `C:\`, heartbeat, grafo), Jornada (8 etapas), Portal/Builder (estrutura visual), PR (mapa), Gram (mensagens/bots), Oficina (sync), Design (tokens), Goals, Gênesis, Dream, Estrutura, Raio-X, Recibos, Forja, Permissões, Admin, Sistema (Mega Painel), Obsidian, Estúdio, Hermes, Unigram, Regras, Inventário, Agent Mode, HTML e Downloads.

### Limites e estados honestos

- `TOP_LEVEL_NAV=PASS` nesta sessão: `27/27` seleções tiveram `tabpanel` ativo.
- `DOM_CONTROL_INVENTORY=PASS`: `127` elementos catalogados nesta sessão.
- `MEASURE_BUTTON=PASS` no sensor: readback de horário atualizado.
- `PORT_INVENTORY_EXPANSION=PASS`: o controle mudou de `Exibir inventário total de portas · 204` para `Ocultar inventário total`; lista medida apareceu.
- `HARNESS_DRAWER_OPEN=PASS` para `Abrir ferramentas`; os demais rails estão mapeados pelo owner, mas exigem readback individual quando a gaveta/viewport não permanecer único.
- `MUTATING_BUTTON_E2E=NOT_EXECUTED`: Windows, VPS, Sincronizar Tudo, Executar Automação, Obsidian e Unigram não foram acionados nesta rodada.
- `BACKEND_EFFECT_FOR_NAVIGATION=NOT_APPLICABLE`: navegação de aba é efeito de UI. Qualquer efeito remoto exige outra prova.
- `MCP_ORIGIN_FROM_COCKPIT=UNKNOWN`: esta leitura do Cockpit não prova chamada MCP nem origem de qualquer log externo.

### Receipt desta rodada

```text
INTENT=MAPEAR_COCKPIT_E_ATUALIZAR_SKILL_MAE
OWNER=K:\.agents\skills\centraldark-operational-method\SKILL.md
SURFACE=http://127.0.0.1:8080/sala-controle
CONTROL_ELEMENTS=127
TOP_LEVEL_TABS=27/27
READ_ONLY_MEASURE=PASS
PORT_INVENTORY_EXPANSION=PASS
SAFE_NAV_MUTATING_CONTROLS=NOT_EXECUTED
SOURCE_HANDLERS=READ
RUNTIME_MUTATION=NOT_REQUESTED
STATUS=PASS_BOUNDED_WITH_MUTATIONS_PROTECTED
NEXT_CURSOR=COCKPIT_CONTROL_MAP_REPLAY_SAFE_RAILS_AND_DETAIL_EXPANSIONS
```

Este receipt prova o inventário, a navegação segura executada e o readback limitado. Não prova commit, push, deploy, conexão MCP, execução de automação ou funcionamento de todos os owners.

<!-- /CENTRALDARK_COCKPIT_CONTROL_MAP_20261030 -->

<!-- CENTRALDARK_PAGE_ERROR_SENTINEL_RECIPE_20261030 -->
## 🧿 Receita operacional — ler e correlacionar erro real do Sentinel do Cockpit

**Owner único:** `apps/instinto-superior/public/centraldark-erros-visiveis.js`, injetado uma vez por `apps/instinto-superior/src/routes/__root.tsx`. Não criar outro Sentinel, watcher, endpoint, skill ou backend.

### Objetivo

Capturar o que a página realmente observou e devolver uma mensagem reproduzível para o owner correto. A mensagem do usuário, screenshot ou texto de memória é contexto. A fonte primária é a entrada existente no Sentinel, seu detalhe técnico e o evento `centraldark:sentinela` quando ele foi observado na mesma página.

### Leitura da mensagem real

1. Confirmar a página e o horário atuais.
2. Abrir o botão `🧿` do mesmo Sentinel.
3. Selecionar a entrada observada, sem fabricar uma nova ocorrência.
4. Ler o resumo humano e abrir `detalhe técnico`.
5. Copiar a receita somente pelo controle existente `Copiar pro Instinto` ou `Copiar todos`.
6. Preservar exatamente, após sanitização:
   - `Página`: URL sem query ou fragmento;
   - `Quando`: horário local e, quando disponível, `hora` ISO;
   - `O que aconteceu`: classificação simples do Sentinel;
   - `Mensagem técnica`: mensagem original observada;
   - `Onde`: arquivo, rota ou origem medida;
   - `Botão relacionado`: último `data-cd-flow`/controle observado em até 15 segundos;
   - `Pilha`: stack disponível, sem tokens, cookies, headers ou corpos;
   - `Intenção`: correção limitada, preservação, teste e regra `UNKNOWN não é PASS`.

### Correlação mínima

Correlacionar `pagina + hora + tipo + mensagem + onde + controle + pilha + intent_id/receipt`, quando existirem. Usar `evento_id` e `centraldark:sentinela` somente como evidência da mesma execução. A proximidade temporal do botão é correlação, não causalidade. `CLICK_SEEN` prova apenas clique observado; não prova execução, efeito remoto, deploy ou origem MCP.

Se a mensagem tiver `Mensagem técnica: %o`, `undefined`, vazio ou stack ausente, marcar `MESSAGE_INCOMPLETE=UNKNOWN`. Não substituir pelo erro provável. Reproduzir somente o conjunto autorizado e registrar a primeira mensagem real recebida.

### Receita reutilizável para qualquer erro de página

```text
1. IDENTIFICAR: URL, aba/perfil, título e horário.
2. ABRIR: Sentinel único da própria página.
3. LER: entrada, resumo, detalhe técnico, origem e stack.
4. CORRELACIONAR: controle próximo, evento_id, componente/arquivo e intenção.
5. SANITIZAR: remover Bearer, token, secret, api_key, query, fragmento, cookie, header e corpo.
6. CLASSIFICAR: PASS somente com efeito reproduzido; FAIL com erro real reproduzido; UNKNOWN sem fonte primária, mensagem incompleta ou efeito não provado.
7. DELIMITAR: escolher o owner e o menor delta; preservar arquivos e rotas não afetados.
8. TESTAR: reproduzir o componente/rota afetada.
9. CONTRAPROVAR: ler a tela, console/log primário e resultado pós-teste de forma independente.
10. REGISTRAR: CURRENT, DELTA, PROVA, ROLLBACK, RECEIPT_ID e NEXT_CURSOR.
```

### Critérios de veredito

- **PASS:** a entrada real do Sentinel contém mensagem técnica completa; página, horário e origem estão correlacionados; o delta foi testado; o efeito foi lido de volta; nenhum segredo foi exposto.
- **FAIL:** a entrada real reproduz o erro e o teste confirma falha do owner ou do efeito esperado.
- **UNKNOWN:** Sentinel inacessível, página/aba incerta, mensagem truncada, stack ausente quando necessária, transporte remoto sem ACK, ou efeito ainda não lido. Não converter silêncio em PASS.

### Limites de transporte

`window.__cdErros.lista` e o DOM do Sentinel são leitura local. `centraldark:sentinela` é evento de observação local. `cfg.coracao` só pode ser usado se for endpoint same-origin autenticado e explicitamente configurado. `HTTP_ACK` não prova efeito. Sem rota autenticada comprovada, manter `TRANSPORT=UNKNOWN` e usar `Copiar pro Instinto` como saída manual, sem enviar dados.

### Receipt obrigatório

O receipt deve registrar `OWNER`, `SURFACE`, `SOURCE`, `PAGE`, `MEASURED_AT`, `ERROR_TYPE`, `MESSAGE_FINGERPRINT`, `COMPONENT_OR_WHERE`, `STACK_AVAILABLE`, `RELATED_CONTROL`, `INTENT`, `DELTA`, `TEST`, `COUNTERPROOF`, `STATUS`, `ROLLBACK` e `NEXT_CURSOR`. Nunca registrar o texto de credenciais ou o valor integral de tokens. A presença desta receita na Skill-Mãe documenta o método; só uma execução com readback promove `PASS`.

<!-- /CENTRALDARK_PAGE_ERROR_SENTINEL_RECIPE_20261030 -->

<!-- CENTRALDARK_GENESIS_OPERATIONAL_REPLAY_20261030 -->
## Genesis existente — replay operacional de regressão

Este bloco integra o Genesis já existente ao ciclo de regressão. Ele não cria
um segundo executor, agente, MCP ou watcher. Toda técnica observável entra
primeiro como `OBSERVED`; somente teste e readback independente podem elevar o
registro para `TESTED` ou `PROVEN`.

Cada replay deve preservar estes campos: `INTENT_ID`, `RUN_ID`, `area`,
`selector_aria_data_cd_flow`, `antes`, `clique_ou_acao`, `depois`, `efeito`,
`fingerprint`, `receipt`, `correlation_id`, `tool_call_id` e `NEXT_CURSOR`.

Regra desta execução: o status do MCP oficial foi lido em modo somente
leitura. A tentativa de leitura nativa Kylin retornou “MCP server is not
initialized”; portanto, não é prova de falha do túnel nem de binding do
Cockpit. A sessão do navegador não pôde ser reacessada nesta janela; o replay
de abas e botões fica `UNKNOWN` e não pode ser promovido.

<!-- /CENTRALDARK_GENESIS_OPERATIONAL_REPLAY_20261030 -->
