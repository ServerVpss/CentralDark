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
