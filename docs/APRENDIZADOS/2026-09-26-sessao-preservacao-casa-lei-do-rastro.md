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
