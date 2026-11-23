# CentralDark · Hermes — checkpoint comprovado e continuidade de missão

Status: **executado na VPS CENTRALDARK-OS em 2026-10-18**.
Owner existente: \`scripts/hermes/\`. Binário instalado: \`/root/.hermes/centraldark/bin/verified-checkpoint.py\`.
Script canônico: [verified-checkpoint.py](./verified-checkpoint.py).
Testes: [test_verified_checkpoint.py](./test_verified_checkpoint.py).

## 1. Fato, evidência e continuidade

A CLI adiciona **checkpoint de execução validada por missão** ao Hermes, sem substituir o mecanismo nativo de conversas, compactação, memória ou rollback de arquivos.

\`\`\`text
EXECUTAR COMANDO → exit=0 → CONTRAPROVA (expect OU verify_command)
→ SE PASSAR: journal append-only + SHA-256 encadeado + current.json atômico
→ NEXT_CURSOR → próxima etapa da mesma missão.
SE FALHAR: journal de erro; current.json não muda; NEXT_CURSOR conserva o último PASS.
REEXECUTAR PLANO IDÊNTICO: começa depois do último PASS; verde não é reexecutado.
\`\`\`

**Escopo:** checkpoints são automáticos **para comandos executados por este wrapper/plan**. Comandos Hermes disparados fora dele não estão interceptados globalmente. \`VERIFIED_100\` significa 100% dos **critérios de prova especificados para aquela etapa**, não certificação universal de todo o sistema.

Os dados operacionais ficam em \`/root/.hermes/centraldark/verified-execution/<missao>/\`, preservados entre terminais e processos do modelo, enquanto o disco da VPS persistir. Cada missão contém: \`events.jsonl\` (histórico imutável/hash chain), \`current.json\` (último êxito), \`logs/\` (saída e contraprovas). Permissões privadas; um escritor por missão com \`flock\`.

O comando \`hermes checkpoints\` da ferramenta oficial gerencia snapshots de rollback de arquivos, **não é o checkpoint da missão aqui descrito**. \`hermes --resume ID\` / \`hermes --continue\` retomam sessões nativas, independentemente deste registro operacional.

## 2. Comando-base na VPS

\`\`\`bash
H=/root/.hermes/centraldark/bin/verified-checkpoint.py
python3 "$H" --help
\`\`\`

Alternativa canônica, quando o checkout na máquina estiver sincronizado com a \`main\`: \`python3 scripts/hermes/verified-checkpoint.py ...\`. O código publicado no GitHub e o executável instalado foram comparados byte a byte na origem da publicação. **A sincronização do checkout antigo \`/root/CentralDark\` não foi promovida; não usar \`git reset --hard\` nele.**

## 3. Executar uma etapa, comprovar e gerar checkpoint

Exemplo inofensivo, executável com Python:

\`\`\`bash
python3 "$H" run --mission forja-viva --step etapa-01 \
  --intent "Executar e preservar o último fio comprovado" \
  --next etapa-02 \
  --expect "OI_OK" \
  -- python3 -c "print('OI_OK')"
\`\`\`

Exige saída do processo igual ao critério e exit 0. Mais forte: **contraprova independente do efeito no disco**:

\`\`\`bash
python3 "$H" run --mission forja-arquivo --step criar-marca \
  --next ler-marca \
  --verify-command "test -f /tmp/centraldark-marca-de-teste" \
  -- python3 -c "from pathlib import Path; Path('/tmp/centraldark-marca-de-teste').write_text('ok')"
\`\`\`

Em tarefas reais, o verificador precisa testar o efeito desejado (conteúdo, resultado do serviço, teste funcional), não apenas a saída textual. O exemplo cria \`/tmp/centraldark-marca-de-teste\` sob escopo da própria experiência.

## 3.1. Quem autorizou, quem executou, commit e PR

O próprio owner `scripts/hermes/verified-checkpoint.py` registra atribuição por etapa (autoridade declarada, responsável da missão, executor, owner técnico, commit de origem e PR de referência). Valores não demonstrados ficam `UNKNOWN`; declarações de identidade não são autenticação. A cadeia SHA-256 e a contraprova de cada etapa continuam independentes desses rótulos.

Exemplo de um novo checkpoint (a autorização e os nomes devem corresponder à missão real):

```bash
python3 "$H" run --mission exemplo --step validar --next PR_REVIEW \
  --authorized-by "CHEFE (declarado)" --responsible "SOL" \
  --executor "SOL via ferramentas" \
  --technical-owner "scripts/hermes/verified-checkpoint.py" \
  --source-commit "65bac5b53161bd2e2cf2a1813da7152fa6752e4e" \
  --pr-ref "#1994" --expect "OI_OK" -- python3 -c "print('OI_OK')"
```

Para gerar um resumo de um receipt já verificado, sem criar commit nem editar PR:

```bash
python3 "$H" render --mission exemplo --format commit
python3 "$H" render --mission exemplo --format pr
```

O primeiro entrega **Git trailers** para a mensagem do próximo commit, e o segundo uma seção Markdown para o corpo do **PR existente**. A template oficial de PR contém o mesmo contrato de atribuição. O writer autorizado aplica a mensagem e o body e depois confere o SHA/readback. **RENDER != PUBLISHED**: o renderizador nunca abre PR nem escreve no GitHub. Não colocar segredos, sessões ou logs privados nesses textos.

O campo `source_commit` identifica o commit **anterior observado**, pois o SHA do novo commit só existe depois da gravação. Checkpoints antigos não são reescritos: aparecem com atribuição `UNKNOWN` quando faltar informação. Um passo que informe novos responsáveis passa por nova execução/contraprova antes de ser promovido como verde.

<!-- CENTRALDARK_CHECKPOINT_ATTRIBUTION_PROOF_20261121 -->
### 🧾 Prova da integração — PR #1994, 21/11/2026

A correção deste mesmo owner adicionou identidade declarada, sem substituir as provas técnicas. Testados no computador SEGREDO, em diretório temporário e sem modificar a instalação operacional: **6/6 testes PASS**. O receipt foi produzido pela mesma CLI com os campos preenchidos para a missão e mostrou `VERIFIED_100`. A cadeia `events.jsonl` retornou `HASH_CHAIN_PASS` (2 eventos: 1 falha da chamada inicial no PowerShell, seguida de 1 execução verificada). **A falha inicial permaneceu no histórico.**

- Missão: `centraldark-checkpoint-attribution-20261121`.
- Autoridade declarada: CHEFE; responsável da missão: SOL; executor: SOL via GitHub e Casa.
- Owner técnico: `scripts/hermes/verified-checkpoint.py`; PR: `#1994`.
- Commit da versão testada: `057f6c2f255e0dc1bc2c85760dd7f85ccb6346cf`.
- Receipt SHA-256: `04fbe64a64393fc491d239c97c287b2d6a4ed695c906675eeef719b5ad8a63b9`.
- Próximo passo: `RECONCILIAR_PR_1994_COM_MAIN_PRESERVANDO_OWNER`.

Esta prova cobre a suíte isolada e o checkout do PR, **não** demonstra merge em `main`, carregamento da nova versão no runtime nem CI no mesmo HEAD. O corpo do PR contém o resumo com readback. A identidade declarada não equivale a autenticação da pessoa nem autoriza promoção automática.

<!-- /CENTRALDARK_CHECKPOINT_ATTRIBUTION_PROOF_20261121 -->

## 4. Recuperar o último fio de QUALQUER terminal ou sessão

\`\`\`bash
python3 "$H" status --mission forja-viva
python3 "$H" verify --mission forja-viva
python3 "$H" resume --mission forja-viva
python3 "$H" resume --mission forja-viva --format json
\`\`\`

\`resume\` devolve \`INTENCAO\`, \`MISSAO\`, \`ULTIMO_PASS\`, \`NEXT_CURSOR\`, \`PROVA_SHA256\`. Não depende do ID da sessão anterior nem de porta de inferência.

Para entregar esse fio a uma **nova conversa** do Hermes, com o provedor configurado e ativo:

\`\`\`bash
FIO="$(python3 "$H" resume --mission forja-viva)"
/root/.local/bin/hermes -z "$FIO"
\`\`\`

Esse comando de injeção é uma receita da CLI, **não foi testado como E2E do Hermes**, pois o endpoint \`127.0.0.1:18434\` não estava ativo na medição. Alternativamente, cole o conteúdo de \`resume\` no chat de qualquer agente e continue pelo \`NEXT_CURSOR\`.

Para **retomar a sessão nativa anterior**, caso queira manter a mesma sessão e seu histórico:

\`\`\`bash
/root/.local/bin/hermes sessions list --limit 10
/root/.local/bin/hermes --resume latest
/root/.local/bin/hermes --resume ID_DA_SESSAO
/root/.local/bin/hermes sessions pin ID_DA_SESSAO
\`\`\`

Nota: \`hermes resume\` sem \`--\` remove a pausa de emergência (ESTOP). **Não é comando de recuperar conversa.**

## 5. Plano automático: checkpoint após CADA etapa verde

Crie um arquivo JSON (o arquivo é a receita, não um segundo cérebro):

\`\`\`bash
mkdir -p /root/.hermes/centraldark/plans
cat > /root/.hermes/centraldark/plans/exemplo.json <<'JSON'
{
  "schema": "centraldark.hermes.execution-plan.v1",
  "mission": "forja-plano",
  "intent": "Manter o último fio e continuar após cada prova",
  "steps": [
    {"id":"passo-1","argv":["python3","-c","print('PRIMEIRO_PASS')"],"expect":"PRIMEIRO_PASS"},
    {"id":"passo-2","argv":["python3","-c","print('SEGUNDO_PASS')"],"expect":"SEGUNDO_PASS","next_cursor":"PROXIMA_MISSAO"}
  ]
}
JSON
python3 "$H" plan --mission forja-plano \
  --file /root/.hermes/centraldark/plans/exemplo.json
\`\`\`

\`plan\` executa as etapas em ordem, realiza a prova individual e grava checkpoint **após cada PASS**. Em falha: para, registra erro e mantém o último sucesso. Corrija a causa e execute **exatamente o mesmo comando**; ele volta à etapa que falhou sem repetir as verdes. Reexecutar o plano finalizado retorna \`PLAN_COMPLETE\` sem refazer comandos. Mudanças no plano alteram o fingerprint; não são tratadas como o mesmo fluxo automaticamente — use uma nova missão ou reconcilie a receita.

Para usar um terminal novo ou após reinício da VPS, volte ao mesmo caminho e rode o mesmo \`plan\`; a continuidade está em disco, não em RAM, sessão ou cache do modelo.

## 6. Prova viva da VPS

Missão: \`hermes-fio-vivo-smoke-20261018\`.
Plano de prova: \`/root/.hermes/centraldark/plans/checkpoint-smoke-20261018.json\`.

\`\`\`text
PASS conversa-fato-1 → checkpoint e NEXT_CURSOR contraprova-e-retomada.
FAIL contraprova-e-retomada exit 17 → último checkpoint NÃO avançou.
Nova execução do mesmo plano após correção da prova:
PASS contraprova-e-retomada → checkpoint.
PASS checkpoint-final → checkpoint.
Novo processo: resume → NEXT_CURSOR PRONTO_PARA_PROXIMA_EXECUCAO.
Reexecução: PLAN_COMPLETE; etapas verdes NÃO repetidas.
Verify: HASH_CHAIN_PASS, 4 eventos, 3 VERIFIED, 1 FAILED.
Receipt SHA-256 do último PASS:
e420b1831708bfcb6178a8195005ecdacc421bab00f1f388977492c98b6c436a
\`\`\`

Reproduzir a leitura da prova (não reinicia nem modifica a missão):

\`\`\`bash
python3 "$H" status --mission hermes-fio-vivo-smoke-20261018
python3 "$H" verify --mission hermes-fio-vivo-smoke-20261018
python3 "$H" resume --mission hermes-fio-vivo-smoke-20261018
\`\`\`

Testes automatizados executados na VPS:

\`\`\`bash
python3 -m unittest discover \
  -s /root/.hermes/centraldark/bin \
  -p test_verified_checkpoint.py -v
# 3 tests, OK (2026-10-18)
\`\`\`

## 7. Persistência e custódia

- Sessão mudou, cache limpou, processo morreu ou servidor de inferência reiniciou: checkpoints de missão permanecem no filesystem e são recuperados por \`--mission\`.
- O modelo não adivinha o passado; recebe o registro com \`resume\`. Para automação ponta a ponta de novos chats do Hermes, a injeção do fio ainda precisa de gatilho específico no canal.
- Reinstalar/formatar o disco remove o registro local se não houver backup da pasta \`~/.hermes/centraldark/verified-execution/\`. O GitHub contém **código, testes e manual**, **não** os logs privados nem o estado atual da missão.
- Histórico e logs podem conter argumentos, mensagens ou conteúdo dos comandos; ficam privados na VPS. Não publicar nem enviar como telemetria bruta.
- Nenhum serviço da VPS foi reiniciado; o checkout com mudanças locais foi preservado.

## 8. Receita de continuidade

\`\`\`text
INTENÇÃO_VIVA → ÚLTIMO_VERIFIED → NEXT_CURSOR
→ EXECUTAR_MENOR_PASSO → PROVA_DISCRIMINANTE
→ PASS: CHECKPOINT_ATÔMICO + HASH + PRÓXIMO PASSO
→ FAIL: LOG DO ERRO + MANTER ÚLTIMO_VERIFIED + CORRIGIR
→ RETOMAR_PELA_MESMA_MISSÃO.
\`\`\`

**Status comprovado:** runtime local + teste de falha/recovery + 3 testes automatizados + código e testes publicados na main. **Não foi afirmado que todas as chamadas arbitrárias do Hermes geram checkpoint automaticamente**; hoje o contrato atua no executor \`run/plan\`.
