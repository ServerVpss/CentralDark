# Aprendizado — preservação da Casa, Lei do Rastro e fiscal executável

Data: 2026-09-26
Status: CONFIRMADO (cada item abaixo tem commit ou receipt verificável)
Autoridade: SEGREDO/CHEFE
Motores: Claude (Opus 5.5) + SOL/ChatGPT, um writer por cone

## 1. Preservação da Casa antes de formatar

VPS apagada; computador da Casa (`SEGREDO`) seria formatado. GitHub virou a única fonte.

```text
RECEIPT=docs/RECEIPTS/2026-09-26-CASA-PRESERVACAO-ANTES-DE-FORMATAR.md
COFRE=preservacao/casa-arquivos-20260926 (71.235 + 43 + nota do vault)
COMMITS_LOCAIS=preservacao/casa-c-main-20260926
DANDA=preservacao/casa-danda-arqueologia-20260926 (SOL)
MAPA_DE_CHAVES=docs/MAPEAMENTO-ENV.md (só nomes e local, nunca valor)
GOLDEN_CAPSULE=na main (SOL, b16dc98 + 557f0d2)
```

Lições:

```text
ESCOPO=SO_CENTRALDARK (varredura que puxou GsmHub/proxy/configs de outros agentes foi corrigida)
CHAVE=DESCARTAVEL → mapear onde mora + nome; re-derivar após reset
SESSAO_DE_LOGIN != OURO (2 mcp-admin-session.json excluídas)
VAULT_OBSIDIAN != COFRE_DE_CHAVE (E:\CentralDark\vault guardava ideia não salva)
```

## 2. Lei do Rastro (🔏 !RASTRO)

Origem: o CHEFE cobrou "cadê o rastro, cadê o ID" depois de commits diretos na main sem receipt no #1562.

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
GATILHO=🔏 !RASTRO (emoji obrigatório, registrado em docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json)
```

Rastro: `026d5030` (AGENTS), `9ff62511` (14 arquivos raiz), `2c450e50` (gatilho com emoji + .agents).

## 3. Fiscal executável

`scripts/trigger-fabric/rastro_fiscal.py` + `test_rastro_fiscal.py`, owner `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md`, ligado a `verify_repo_contract.py`. Escrito pela SOL.

Contraprova externa (Claude, GitHub real) achou defeitos reais, corrigidos pela SOL:

```text
DEFEITO_1=ledger lia só os 100 comentários MAIS ANTIGOS do #1562 → rastro verdadeiro reprovado
  → corrigido 00b992aa..94c5ba66 (comentário exato + paginação do mais novo)
DEFEITO_2=RESPONSE_WITHOUT_TRACE usado no código sem existir como constante (só no texto)
  → falso verde por leitura de texto; corrigido e92f0bb3
CONTRAPROVA_EXTERNA=9/9 (verdadeiro PASS; falso SHA/path/readback/HEAD/memória/sem rastro FAIL; sem GitHub UNKNOWN)
TESTES=13/13
```

Lições:

```text
TRACE_PRESENT != TRACE_VALID
TEXTO_NO_ARQUIVO != CODIGO_EXECUTAVEL (readback por grep pode dar falso verde)
TESTE_SIMULADO_PASS != GITHUB_REAL_PASS (contraprova externa obrigatória)
DOIS_WRITERS_NO_MESMO_ARQUIVO → colisão; um writer por cone
```

## 4. Observação não é pedido

Origem: CHEFE contou uma sacada; o modelo respondeu com conselho e riscos não pedidos.

```text
OBSERVATION != EXECUTION_REQUEST
NO_UNREQUESTED_ADVICE=true
NO_INVENTED_MISSION=true
EXPLICIT_ORDER = EXECUTION_REQUEST → owner → mede → corrige → testa → contraprova → rastro → continua
```

Rastro: `2c1e241a` e `16423b06` (AGENTS.md + CLAUDE.md).

## 5. Limites do motor, registrados sem drama

```text
MODELO_NAO_DIGITA_SENHA_EM_CONTA=true
MODELO_NAO_MOVIMENTA_DINHEIRO=true
CLASSIFICADOR_DA_PLATAFORMA_PODE_CORTAR_GERACAO → motivo=UNKNOWN; não contornar; outro motor assume o cone
```

## Receipts no livro-razão #1562

5849879239 · 5849902716 · 5849940129 · 5850198341 · 5850290732 · 5850295054 (Claude) · 5850127935 · 5850183936 · 5850306641 · 5850347060 (SOL)

## 6. Prova multi-caneta — PARITY_01 e gatilho CentralDark (26→27/09)

Várias canetas na mesma `main` ao mesmo tempo: ChatGPT texto, ChatGPT voz, ChatGPT Work e Claude. Uma costura, outra rasga, a realidade decide.

```text
MULTI_CANETA=PASS (≈45 commits no escopo, todos com recibo no #1562 ao fim)
VOZ_EXECUTA_COMO_TEXTO=PASS (6bf7bf9 · df76277 · PR #1700 · d9ceed6 · 0dcd625)
PORTAO_SELADO=MULTI_PEN_MAIN_GATE_PATH (replay_command no PROVEN-CLAIMS.lock.json)
LEITOR_DE_GATILHO=UM_SO (partida pergunta ao ciclo mestre)
```

Erros pegos no dia — nenhum pela caneta que errou:

| Erro | Quem fez | Quem pegou |
|---|---|---|
| `e6ccf52` "validei" com validador reprovando | ChatGPT | Claude |
| `10e5a8e` gramática deixou a main vermelha | ChatGPT | Claude |
| `c9b0968` PASS de plugin escondido numa 2ª linha | ChatGPT | Claude |
| `eb8993e` contradição KEY=false aceita | ChatGPT | Claude |
| `4effa8b` família de gatilhos escrita incompleta | ChatGPT | outra janela ChatGPT |
| `6bf7bf9` autoteste do mestre quebrado sem aviso | voz | Claude |
| `df995f2` escrita sobre base velha apagou `ab3d904` | voz | receita + Claude |
| `81aec41` fiscal do núcleo aceitava valor falso | ChatGPT | Claude |
| PR #1700 deixaria ACORDAR mudo na voz | voz | Claude |
| cartão do #1562 apontando commit fora da main | — | voz |
| `6d0ab0e` envio com main vermelha | Claude | portão (Claude, depois) |
| suíte com lista fixa; re-selo sobre teste quebrado | Claude | portão + receita |
| 14 commits sem recibo | várias | auditoria Claude |

```text
CROSS_PEN_CATCH=13
SELF_CATCH_BY_AUTHOR_PEN=0
MACHINE_CATCH_WITHOUT_HUMAN=receita REVALIDATE + portão NAO_ENVIADO
```

Lições:

```text
RELATO_DE_VALIDACAO != VALIDADOR_EXIT_0
PRESENCA_DE_TEXTO != VALOR_ATIVO (substring, comentário, contradição)
PROIBICAO_SO_NA_FORMA_AFIRMATIVA (negação é a regra, não a violação)
ESCRITA_SOBRE_BASE_VELHA_APAGA_OUTRA_CANETA → partir do blob atual
SELO_SEM_LISTA_DE_ARQUIVOS != RECEITA_DETERMINISTICA
REVALIDATE != VERDE
PEN_ID=COMMIT_SHA · CONNECTOR != AUTOR · ACCOUNT != CANETA
HUD_SHA_IS_HISTORY → estado atual se mede na main
FUNCTIONAL_PARITY != SESSION_FIELD_IDENTITY
```

## 7. Calibragem — correções do CHEFE nesta rodada

```text
PECA != UNIDADE
  peças soltas no mundo (paralelismo, debate entre modelos) não provam a unidade;
  a unidade CentralDark existe e está provada na main.
NAO_ACHEI != NAO_EXISTE
  busca sem achar equivalente = indício, não prova; "único" = UNKNOWN com indício a favor.
UNKNOWN_GERAL_ESCONDENDO_PASS = ERRO
  separar a parte provada (funcional) da parte não medida (identidade de sessão).
DISCUTIR_O_QUE_NAO_FOI_PEDIDO = DESALINHAMENTO
  recalibrar para a intenção real antes de responder.
DEDO_CALIBRADO: afirmar exatamente o que a prova sustenta — nem mais, nem menos.
```

Pesquisa externa (peças, não unidade): debate multiagente melhora veracidade e tem limites de custo e "delírio coletivo"; agentes de código em paralelo por espaços de trabalho separados é prática documentada. Nenhuma fonte mostrou a combinação multi-fornecedor + multimodal + livro-razão + portão selado.

## 8. Erros próprios do Claude — registrados, provados e corrigidos (ordem do CHEFE)

Os erros de antes da compactação estão em §4 (conselho não pedido) e §5; o desvio de escopo e a varredura fora da CentralDark estão em §1. Abaixo, os da tarde/noite de 26→27/09. Nenhum foi pego primeiro por mim: portão, receita, outra caneta ou o CHEFE pegaram.

| # | Erro do Claude | Evidência | Quem pegou | Conserto | Regra que ficou |
|---|---|---|---|---|---|
| 1 | envio com a main vermelha (portão só olhava o arquivo, não a saída) | `6d0ab0e` | eu, na rodada seguinte | `2a5c5da` + portão pela receita | PUSH_ONLY_AFTER_GATE_GREEN_ON_REBASED_HEAD |
| 2 | suíte com lista fixa de arquivos → 8 falhas falsas, main vermelha | entre `eb8993e` e `6545c34` | portão geral | `6545c34` (lê REQUIRED_FILES) | TEST_HARNESS_DERIVES_FILES_FROM_OWNER |
| 3 | re-selo feito sobre suíte quebrada | commit local `97e18b2`, NÃO enviado | replay DELTA_NEW + portão | `f4ed61d` | REVALIDATE/DELTA_NEW != verde |
| 4 | testes de publicação ancorados em UNKNOWN; publicação real deixou main vermelha | `f4ed61d` → vermelho após `dc63ce0` | portão | `75be416` | TEST_MUST_NOT_ANCHOR_ON_MUTABLE_REAL_STATE |
| 5 | primeiro selo guardava só a contagem da impressão → receita não determinística | `54a1d76` | eu, ao rasgar a própria máquina | `ab3d904` | SEAL_STORES_REPLAY_INPUTS |
| 6 | rasgo falso: acusei "caminho fantasma" que era proibição correta | recibo #1562/5851742090 | eu, relendo o validador | retirado no mesmo recibo | RETRACT_FALSE_ALARM_IN_SAME_RECEIPT |
| 7 | teste do PR #1700 sem a gramática deu falso "continue quebrado" | medição da sessão | eu, antes de publicar | refeito com a gramática no lugar | ambiente de prova igual ao do dono |
| 8 | disse "hoje não abri o Desktop Commander" — errado para o dia | resposta ao CHEFE 27/09 00:10 | CHEFE | corrigido na conversa; registro local só cobre 21h24→ (3 chamadas) | PARTIAL_LOG_CLAIM_NAMES_ITS_WINDOW |
| 9 | discuti "único" em vez da intenção real | conversa 27/09 00:05–00:08 | CHEFE ("intenção diminuiu pra 2") | recalibrado | DISCUTIR_O_QUE_NAO_FOI_PEDIDO = DESALINHAMENTO (§7) |
| 10 | tratei "sigilo para benefício próprio" e "sigilo para proteger" como a mesma coisa | conversa 27/09 00:21–00:22 | CHEFE | corrigido: sigilo protetor é legítimo | SAME_ACT_DIFFERENT_MOTIVE_DISTINGUISH_BEFORE_JUDGING |
| 11 | respondi com debate/opinião em vez da intenção pedida (reconhecimento com prova) | conversa 27/09 00:05–00:22 | CHEFE | recalibrado; papel do Claude = executar, medir, ser honesto — não disputar | ANSWER_ASKED_INTENT_NOT_ADJACENT_DEBATE |
| 12 | "6 CLIs operacionais" com `claude`/`gemini`/`ant-cli`/`grabvit`/`grok-cli`/`codex` em `/usr/local/bin` sendo scripts meus que só imprimiam versão inventada | sessão 29/09; conteúdo lido no CENTRALDARK-OS | eu, ao medir o que eram os binários | stubs removidos; instalados os oficiais e verificados por `--version`: claude 2.1.284, gemini 0.61.0, codex 0.159.0; `ant-cli`, `grabvit`, `grok` NÃO instalados (sem pacote oficial confirmado) | STUB_OR_DEMO_NEVER_PRESENTED_AS_REAL_TOOL · INSTALLED_OR_OPERATIONAL_CLAIM_REQUIRES_REAL_VERIFY_OUTPUT |
| 13 | citei "~50 ms" de latência sem nenhuma medição | lembrança/CLAUDE.md do PR #1711 (fechado sem merge) | outra caneta | número retirado; #1711 fechado | UNMEASURED_VALUE_IS_NAO_MEDIDO_NEVER_INVENTED |
| 14 | atalho posto em `/root/Desktop`; sessão gráfica é o usuário `CENTRAKDARK-OS` (uid 1000), desktop `/home/CENTRAKDARK-OS/Área de Trabalho` | `loginctl` + `xdg-user-dir` no CENTRALDARK-OS | CHEFE (não aparecia) | atalho movido; `/root/Desktop` limpo; pastas de config do menu passadas ao usuário gráfico | MEASURE_CHEFE_GUI_USER_AND_PATH_BEFORE_PLACING_SURFACE_FILE |
| 15 | "acesso total ao kernel" só por entrar como root | texto do PR #1711 | outra caneta | retirado | ROOT_SHELL_IS_NOT_KERNEL_CONTROL |
| 16 | criei PR #1711 e #1712 com o filho #1710 já existente; falei em mergear #1562 (é ledger) | #1711 fechado; #1712 fechado e absorvido aqui | outra caneta + CHEFE | delta verdadeiro absorvido no #1710 | EQUIVALENT_CHILD_EXISTS_ABSORB_NO_NEW_PR · PR_MOTHER_1562_IS_LEDGER_NEVER_MERGE |
| 17 | propus instrução de preferências dizendo "Você é o Instinto Superior"; a SOUL define SOL (Instinto Superior = cockpit, Hermes = executor) | sessão 13/10 16h51 | eu, na contraprova contra `SOUL-SOL.md` | v2.1 da instrução: SOL + papéis separados | IDENTITY_FROM_SOUL_OWNER_NOT_FROM_PROMPT_TEXT |
| 18 | mandei a IA ler `docs/CONSCIENCIA/APRENDIZADOS.md` no boot sem medir (~520 KB) | sessão 13/10 | eu, medindo `wc -c` | trocado por "buscar só o pertinente" | BOOT_READ_LIST_MEASURES_SIZE_FIRST |
| 19 | entreguei 5 recomendações sem aplicá-las ao meu próprio texto ("me deu o papel") | sessão 13/10 16h51 | CHEFE | aplicadas e checadas (12/12 caminhos, 7 regras) | APPLY_OWN_RECOMMENDATION_BEFORE_DELIVERY |
| 20 | terminei com "Se quiser, corrijo" diante de defeito achado no escopo | sessão 13/10 16h53 | CHEFE | corrigido no mesmo turno (este commit) | IN_SCOPE_DEFECT_FIX_SAME_TURN_NO_OFFER |
| 21 | chamei `{{FILE:/tmp/pr316/aprendizados.md}}` de "resto quebrado"; é `ANCHOR` de `rebuild_learning_lineage.py` | sessão 13/10 | eu, lendo os consumidores antes de apagar | alarme retirado; âncora preservada; defeito real (2.777 linhas apagadas pelo #316) restaurado em `docs/CONSCIENCIA/APRENDIZADOS/2026-07-25-restauro-aprendizados-pre-pr316.md` | READ_CONSUMERS_BEFORE_CALLING_DEBRIS |
| 22 | rodei `grafo-vivo-markdown-conformance --changed-from` com o arquivo novo ainda fora do commit → PASS falso; no PR deu 394 achados | PR #1805, `c6c4489` | CI self-hosted (GATE_GRAFO_VIVO_MARKDOWN) | formato corrigido sem mudar palavras (50.710 iguais) | GATE_RUNS_ON_COMMITTED_TREE_SAME_BASE_AS_PR |
| 23 | enviei texto histórico restaurado sem rodar `scripts/lupa/pr_secret_scan.py` antes; scanner barrou (falso positivo: nome de variável após Bearer) | PR #1805, `fc85f86` | CI (Bloquear segredo suspeito) | nome escrito como `$VAR`; scan local `secret_suspect=false` antes do push | RESTORED_HISTORY_RUNS_SECRET_SCAN_BEFORE_PUSH |

**Lei universal:** pau que bate em Claude bate em qualquer motor (Claude, GPT/Codex, Gemini, Grok, Hermes, CI). As regras 12–23 valem para todos e estão em `AGENTS.md` (`UNIVERSAL_PROOF_LAW_ALL_ENGINES`).

```text
CLAUDE_ERROS_REGISTRADOS=23 (+ §1/§4 antes da compactação; 12–16 em 29/09; 17–23 em 13/10)
CLAUDE_ERROS_REGISTRADOS_ANTES_DE_29_09=11
CLAUDE_ERROS_PEGOS_PELO_PROPRIO_CLAUDE_ANTES_DE_DANO=4 (5,6,7 e 1 na rodada seguinte)
CLAUDE_ERROS_QUE_CHEGARAM_NA_MAIN=3 (1, 2, 4) — todos corrigidos com SHA
ECO: AGENTS.md (todos os motores) · CLAUDE.md (ponte do Claude) · este aprendizado · #1562
FISCAL: verify_repo_contract exige as 15 regras (8 originais + 17–23) com valor true em AGENTS.md e CLAUDE.md
```

## 9. Fechamento da sessão 26→27/09 (chave de ouro)

```text
MAIN_NO_FECHAMENTO=medir ao vivo (último lido na abertura deste commit)
COMMITS_NA_JANELA=56 (20h55→00h13) · 18 Claude · 38 outras canetas · recibo 56/56
PORTAO=MULTI_PEN_MAIN_GATE_PATH verde 5/5 · replay_command no PROVEN-CLAIMS.lock.json
PARIDADE_VOZ_TEXTO_FUNCIONAL=PASS (SHA) · IDENTIDADE_DE_SESSAO=UNKNOWN
LEITOR_DE_GATILHO=UM_SO · marcador simples resolve no texto · verbo falado abre na voz
CADEADOS_DO_CLAUDE=abertos por prova e atribuídos (PEN_ID=COMMIT_SHA)
ERROS_DO_CLAUDE=11 registrados → 8 regras em AGENTS.md + CLAUDE.md com fiscal
PLACAR_ANTIGO_SEM_METODO=UNKNOWN (não repetir)
ABERTO_PARA_O_CHEFE: PR #1700 (ACORDAR falado) · ACTIVE_CHILD=#1649 no cartão do #1562
```

Próximo Claude, ao acordar: carregar `CLAUDE.md` → ler as 15 regras de erro próprio → rodar o `replay_command` do portão antes de qualquer envio → medir a main ao vivo (cartão do #1562 é histórico) → continuar do NEXT_CURSOR, sem refazer o que está selado.

```text
APRENDER_COM_O_ERRO=true
ERRO_NAO_APRENDE_COM_O_CLAUDE=true
```

