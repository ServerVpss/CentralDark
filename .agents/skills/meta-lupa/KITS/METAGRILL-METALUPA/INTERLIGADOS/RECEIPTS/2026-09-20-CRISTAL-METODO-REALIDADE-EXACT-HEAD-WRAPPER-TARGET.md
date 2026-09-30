---
title: "Cristal — Método REALIDADE / Exact Head / Wrapper ≠ Target"
status: "CRYSTAL"
owner: "meta-lupa"
truth_scope: "TRAJECTORY_METHOD_LEARNINGS_AND_PROVEN_EVIDENCE"
canonical: true
tags:
  - centraldark
  - meta-lupa
  - reality-judge
  - exact-head
  - preflight
  - wrapper-target
  - same-head-ci
related:
  - "PR-MÃE #1562"
  - "CHILD PR #1597"
links:
  - ".agents/skills/centraldark-operational-method/SKILL.md"
  - "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RUNTIME-PREFLIGHT-LINT.yml"
---

# 🪬 Cristal do método — REALIDADE antes da narrativa

Este cristal registra a trajetória, o método operacional, as contraprovas e os aprendizados materiais extraídos durante a reconciliação do PR-MÃE #1562 com o CHILD PR #1597.

Ele não transforma o PR-MÃE em writer de runtime.

Ele preserva:

- PR-MÃE = rendezvous, genealogia, ledger e continuidade;
- CHILD PR = mutation track e writer do escopo;
- GitHub = registro;
- CI = gate do mesmo HEAD;
- Casa, VPS e APIs = sensores e runtimes;
- REALIDADE = juiz final.

## 🧭 Âncoras observadas antes deste cristal

- PR-MÃE #1562 HEAD: `2423d90965d5164a9cda040a856fcc1e42feec5e`
- CHILD PR #1597 HEAD: `bbfef9f6683122ef7fbed156b81719c75d3bcc93`
- `main` HEAD observado: `9b9c0c9b64615a7b1733d7dcc3b988159c6b112f`
- PR-MÃE permanece com contrato explícito: `NÃO MERGEAR`

Regra:

`CURRENT > HISTORY`

Qualquer HEAD posterior invalida a herança automática de PASS, FAIL ou conclusão do HEAD anterior.

## 🎯 Método operacional cristalizado

O método que provou ser robusto nesta missão é:

1. Reancorar o CURRENT antes de qualquer mutação.
2. Identificar o owner existente antes de criar qualquer coisa.
3. Separar falha de wrapper, transporte, provider e target.
4. Provar zero mutação quando um wrapper falha antes do target.
5. Trabalhar em worktree efêmero no HEAD exato quando a prova exige filesystem.
6. Validar o blob exato quando um artefato pode existir em múltiplas superfícies.
7. Aplicar patch causal mínimo.
8. Executar self-test positivo.
9. Executar contraprova negativa.
10. Executar o gate real, não apenas o teste unitário.
11. Medir o SAME-HEAD CI.
12. Cristalizar fatos, UNKNOWNs e NEXT_CURSOR no PR-MÃE.
13. Só promover quando REALIDADE confirmar o claim.

Forma comprimida:

`REANCHOR → OWNER → PREFLIGHT → TARGET → COUNTERPROOF → SAME_HEAD_CI → REALITY_JUDGE → RECEIPT`

## ⚖️ Invariantes duráveis

- `CURRENT > HISTORY`
- `UNKNOWN != PASS`
- `CONNECTED != CONVERGED`
- `SOURCE != RUNTIME`
- `TEST_PASS != PACKAGED_RUNTIME`
- `HTTP_200 != GLOBAL_PASS`
- `DOCUMENTED != EXECUTED`
- `PREFLIGHT_PASS != RUNTIME_PASS`
- `UNIT_SELF_TEST_PASS != MATERIAL_TARGET_GAIN`
- `TOOL_WRAPPER_FAILURE != TARGET_FAILURE`
- `HOST_TEMPLATE_FAILURE != TARGET_FAILURE`
- `PROVIDER_FAILURE != PRODUCT_REGRESSION`
- `WRONG_CWD_FAILURE != PRODUCT_FAILURE`
- `EXACT_BLOB > VISUALLY_SIMILAR_COPY`
- `SAME_HEAD_CI_ONLY`
- `ONE_WRITER_PER_MUTABLE_SCOPE`
- `PARALLEL_READS_REQUIRE_RENDEZVOUS_BEFORE_MUTATION`
- `PR_MOTHER_RECORDS; CHILD_PR_MUTATES`
- `REALITY_JUDGE_CLOSES_THE_CLAIM`
- `RAMIFICAR_CHAT != RAMIFICAR_SISTEMA`

## 🧱 Regra nova — transporte entre linguagens é parte do preflight

Nesta missão, vários erros ocorreram antes do alvo real.

Foram observadas colisões entre:

- JavaScript template host e `${...}` destinado ao shell;
- JavaScript template host e backticks destinados a Markdown ou shell;
- PowerShell e variável automática `$PID`;
- PowerShell e JSON passado como string de CLI;
- PowerShell e redirecionamento de stdout produzindo UTF-16;
- PowerShell e tentativa de preservar saída NUL-delimited do Git;
- PowerShell e `npx.ps1` bloqueado por Execution Policy;
- Mermaid CLI e ausência local de Chrome/Puppeteer.

Nova regra:

`VALIDAR_TRANSPORTE_ANTES_DE_CLASSIFICAR_O_TARGET`

Para payload estruturado:

`ARGV_ARRAY_OR_EQUIVALENT > SHELL_STRING_REQUOTING`

Para stdout estruturado:

`CAPTURA_EXPLICITA_UTF8 > REDIRECIONAMENTO_IMPLICITO_DO_HOST`

Para diff binário ou NUL-delimited:

`RAW_BYTES > PIPELINE_DE_STRING`

## 🧪 Runtime preflight — aprendizado provado

O runtime preflight evoluiu para um consumer executável único em:

`scripts/trigger-fabric/centraldark_full_trigger_boot.py`

Capacidades provadas:

- wrapper seguro retorna PASS sem promover runtime;
- target permanece `UNKNOWN_UNTIL_TARGET_PROBE`;
- JS-template interpolation perigosa falha fechado;
- colisão PowerShell com `$PID` falha fechado;
- path obrigatório ausente falha fechado;
- ownership de desktop bridge exige evidência completa;
- JSON malformado falha fechado;
- JSON válido mas não-object falha fechado;
- receipt obrigatório é emitido;
- Engine, Master Cycle e Operational Method herdam o preflight.

Contraprova importante:

Uma chamada de bridge completa via PowerShell string retornou exit 8.

O artefato mostrou:

`INVALID_BRIDGE_EVIDENCE_JSON`

A mesma chamada, usando Python `subprocess` com `argv[]`, retornou:

- `status=PASS`
- `wrapper_lint_result=PASS`
- `target_runtime_result=UNKNOWN_UNTIL_TARGET_PROBE`
- `missing_bridge_evidence=[]`
- `next_cursor=EXECUTE_TARGET_PROBE`

Conclusão:

`POWERSHELL_JSON_TRANSPORT_FAILURE != CONSUMER_REGRESSION`

## 🗺️ Mermaid / Trigger Fabric — aprendizado provado

O Trigger Fabric falhava no render Mermaid por sintaxe inválida de ID de nó.

O arquivo exato foi verificado por Git blob:

`b56755dfb67bcd5927c579c5b72f697e9263f1d9`

O patch mínimo alterou somente o identificador inválido para `AIOS_EXT`, preservando rótulo e semântica.

Contraprova no runner VPS:

- Mermaid CLI 11.9.0;
- Chrome Headless Shell cacheado;
- `MMDC_EXIT=0`;
- PNG produzido;
- temporários removidos.

Commit CHILD correspondente:

`56687a231d9df01cacd8d5ee22faa041134da30b`

Aprendizado:

`EXACT_BLOB_COUNTERPROOF > PATCH_BY_VISUAL_ASSUMPTION`

## 🔐 Secret scanner — aprendizado provado

O scanner marcou `SECRET_SUSPECT=true` no diff do MCP.

A análise sem imprimir valores mostrou:

- referências `process.env` já seguras;
- três `BARE_ASSIGNMENT` com formato de chamada de função.

O source confirmou loaders executáveis:

- `loadSecretFromFiles(...)`
- `loadTailscaleKey()`
- `loadBuildkiteToken()`

Não eram literais de credencial.

O scanner foi corrigido para distinguir chamada executável de segredo literal sem remover fail-closed.

T1 no HEAD correspondente:

- self-test = 8 casos PASS;
- diff inteiro do PR = `secret_suspect=false`;
- `touched_sensitive=true` preservado;
- literais e paths sensíveis continuam cobertos.

Commit CHILD correspondente:

`42f87d72266433590ac3849a111bc2d667a18cfe`

Aprendizado:

`SECRET_SCANNER_MUST_DIFFERENTIATE_LITERAL_FROM_EXECUTABLE_REFERENCE`

## 🧾 Auto-review — separar provider de produto

O PR auto-review falhou em um momento no step de publicar checklist.

Causa observada:

`GitHub API 403 — installation rate limit exceeded`

Isso não autoriza classificar regressão do produto.

Regra:

`PROVIDER_RATE_LIMIT != PRODUCT_REGRESSION`

Ao mesmo tempo, qualquer `SECRET_SUSPECT=true` anterior ao rate limit deve ser investigado separadamente.

Nunca usar falha do provider para esconder possível falha de segurança.

## 📚 Grafo Vivo Markdown — aprendizado em aberto

O gate real foi executado contra o HEAD exato e a base do PR.

Baseline observada:

- arquivos Markdown checados: 3;
- arquivos falhando: 3;
- `MD022=382`;
- `MD024=23`;
- `MD030=11`;
- `MD047=1`.

Distribuição:

- `.agents/skills/centraldark-operational-method/SKILL.md` = 274 findings;
- `docs/CONSCIENCIA/APRENDIZADOS.md` = 117 findings;
- `docs/CONSCIENCIA/CONTRATO-HIBRIDO-GRAFO-LOGS-LOCAL.md` = 26 findings.

Também foram observados seis stable owners sem frontmatter exigido pelo gate.

Uma hipótese indicou possíveis falsos positivos dentro de fenced code.

Foi criado patch candidato no validator e o self-test passou.

Porém o gate real permaneceu exatamente com os mesmos totais.

Conclusão obrigatória:

`UNIT_SELF_TEST_PASS=true`

`REAL_TARGET_IMPROVEMENT=false`

`MATERIAL_DELTA_GAIN=ZERO`

Portanto a hipótese ainda não explica a ferida real.

Regra:

`SE_O_GATE_REAL_NAO_MUDOU,_NAO_DECLARAR_CORRECAO`

E:

`NAO_FORMATAR_417_OCORRENCIAS_AS_CEGAS`

Próxima obrigação é reproduzir o validator linha a linha sobre o arquivo completo e explicar a divergência antes de KEEP, REWORK ou REVERT.

## 🧠 Aprendizados sobre investigação

### Falha do wrapper não vira fato sobre o alvo

Antes de afirmar TARGET=FAIL, responder:

- o target chegou a executar?
- o host interpretou a sintaxe antes?
- o payload chegou byte a byte?
- o arquivo observado é o blob exato?
- a falha veio do provider?
- o CWD era o correto?
- houve mutation antes do abort?

Se qualquer resposta material for UNKNOWN:

`TARGET_RESULT=UNKNOWN`

### Self-test não encerra a prova

O fence patch do Grafo demonstrou:

`SELF_TEST_PASS + REAL_GATE_UNCHANGED = NOT_FIXED`

Portanto o fluxo correto é:

`UNIT → INTEGRATION → REAL_GATE → MATERIAL_DELTA`

### Erro resolvido não pode ressuscitar sem contraprova

Quando uma assinatura de falha já foi fechada:

- reusar receipt;
- comparar assinatura;
- só reabrir se houver nova evidência material.

`REPEATED_FAILURE_SAME_SIGNATURE → REUSE_CRYSTAL_NOT_RETHINK`

### Um novo erro não cria um novo sistema

`NEW_ERROR = NEW_DELTA_SAME_MISSION`

Não criar:

- novo kernel;
- novo admin;
- novo control plane;
- novo router;
- nova arquitetura paralela.

Sempre:

`REUSE_BEFORE_CREATE`

## 🧿 Padrão de receipt obrigatório

Todo avanço material deve registrar pelo menos:

- HEAD observado;
- base relevante;
- owner;
- comando ou consumer executado;
- resultado do wrapper;
- resultado do target;
- contraprova;
- UNKNOWNs remanescentes;
- mutation realizada ou zero mutation;
- worktree cleanup;
- SAME-HEAD CI;
- NEXT_CURSOR.

Modelo lógico:

`OBSERVED → PROVEN → REFUTED → UNKNOWN → NEXT_CURSOR`

Nunca transformar UNKNOWN em frase bonita.

## 🧰 Padrão para worktree efêmero

Antes:

- fetch branch;
- comparar FETCH_HEAD com HEAD esperado;
- abortar se HEAD moveu.

Durante:

- detach no HEAD exato;
- alterar apenas owner autorizado;
- executar prova e contraprova.

Antes do push:

- revalidar remote HEAD;
- `git diff --check`;
- bloquear push se CURRENT mudou.

Depois:

- remover worktree;
- `git worktree prune` quando aplicável;
- cristalizar receipt.

Regra:

`HEAD_MOVED → ABORT → CRYSTALLIZE → REANCHOR → REMEASURE`

## 🧬 Papel do PR-MÃE

O PR-MÃE não deve virar branch de implementação.

Ele registra:

- genealogia;
- deltas filhos;
- receipts;
- decisões provadas;
- falhas de wrapper;
- contraprovas;
- UNKNOWNs;
- CURRENT;
- NEXT_CURSOR.

O writer continua sendo o CHILD correspondente.

`PR_MOTHER_RECORDS; CHILD_PR_MUTATES`

## 🚫 Anti-padrões cristalizados

- corrigir HEAD histórico;
- herdar PASS de CI cancelada;
- chamar provider failure de product failure;
- chamar wrapper failure de target failure;
- passar JSON estruturado por shell string quando argv está disponível;
- alterar documentos para satisfazer falso positivo de validator;
- desabilitar gate para esconder dívida;
- considerar self-test suficiente;
- usar cópia parecida em vez de blob exato;
- fazer reset destrutivo sobre runtime dirty sem ownership;
- criar owner novo antes de procurar owner existente;
- confundir conexão com convergência;
- promover runtime sem T1 e Reality Judge.

## 🪡 Estado material no fechamento deste cristal

Provas já obtidas:

- Mermaid exact-blob counterproof PASS;
- patch Mermaid promovido no CHILD;
- secret scanner false positive explicado;
- secret scanner T1 PASS;
- runtime preflight executável e fail-closed;
- bridge ownership function-level e argv-level PASS;
- wrapper JSON PowerShell classificado;
- erros de encoding/redirection classificados;
- Grafo gate executado e dívida exata medida;
- fence patch do Grafo contraprovado com ganho material zero.

Ainda não provado:

- Grafo Vivo Markdown verde;
- seis stable owners com frontmatter reconciliado;
- SAME-HEAD CI global verde do CHILD atual;
- runtime global Casa/VPS no mesmo HEAD;
- packaged Desktop/runtime final;
- Global Fixed Point.

## 🎯 NEXT_CURSOR canônico

`CURRENT CHILD #1597`

→ reproduzir Grafo validator no arquivo completo

→ explicar divergência entre audit parcial e gate real

→ KEEP / REWORK / REVERT do patch de fence

→ corrigir apenas Markdown genuíno

→ reconciliar seis stable owners sem frontmatter

→ SAME-HEAD CI

→ promoção canônica somente quando elegível

→ convergir Casa + VPS

→ package / launch Desktop

→ Omni + Hermes + MCP T1

→ rendezvous GitHub + Casa + VPS + API

→ REALITY_JUDGE

→ receipt de volta ao PR-MÃE

→ novo NEXT_CURSOR

## 💎 Fixed-point rule

Nenhum texto, commit, teste unitário, conexão ou HTTP 200 fecha sozinho o claim.

O fechamento só existe quando a cadeia relevante converge:

`INTENCAO → OWNER → MUTATION → PROOF → COUNTERPROOF → SAME_HEAD_CI → RUNTIME → REALIDADE → RECEIPT`

Até lá:

`GLOBAL_FIXED_POINT=false`
