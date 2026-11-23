# Painel do Projeto CentralDark

Painel estático para acompanhar a evolução do CentralDark / MultiZap de forma visual, simples e em tempo quase real.

## Objetivo

Mostrar para o usuário, em uma página única:

- estado geral do projeto;
- progresso por área;
- papel de cada IA/ferramenta;
- status público do MCP e serviços relacionados;
- próximos passos;
- pendências principais;
- histórico visual do que já foi concluído.

## Como funciona

Arquivos principais:

- `index.html` — estrutura da página;
- `styles.css` — tema visual Netflix/CentralDark;
- `app.js` — lógica de carregamento, cards, progresso e polling;
- `painel-data.json` — dados editáveis do painel.

O painel carrega `painel-data.json` localmente e tenta consultar endpoints públicos como:

- `https://mcp.centralldark.com/health`
- `https://mcp.centralldark.com/status.json`
- `https://install.centralldark.com/status.json`

Se algum endpoint falhar, o painel continua funcionando com os dados locais.

## Cápsula Observável

A rota `capsula.html` estende o mesmo Mega Painel para acompanhar o ciclo de mutação e aprendizado do Hermes sem criar outro painel, outra MetaLupa ou outra fonte de verdade.

Arquivos:

- `capsula.html` — visualização read-only da cápsula;
- `capsula-data.json` — snapshot derivado, nunca fonte primária;
- `capsula-event.schema.json` — contrato público de cada evento;
- `capsula-observavel.mjs` — valida, agrega, protege o ledger e gera o snapshot;
- `capsula-observavel.test.mjs` — testes discriminativos contra falso verde;
- `.github/workflows/capsula-observavel.yml` — reproduz contrato, diff e snapshot no GitHub Actions.

Fluxo operacional:

```text
Hermes/Writer emite evento JSON sanitizado
→ evento entra num ledger JSONL fora da main
→ agregador valida candidato, baseline, fixture, Writer, Judge e ator
→ falha recebe fingerprint
→ correção precisa sobreviver ao reteste
→ decisão do Chefe exige recibo separado e hash
→ capsula-data.json é derivado
→ capsula.html mostra numerador, denominador, identidade e evidência
```

### Papéis separados

```text
writer       = agente que materializa o candidato do run
evaluator_ref = Judge read-only que tenta derrubar o resultado
event_actor   = identidade que emite aquele evento
SEGREDO/CHEFE = único ator aceito para APPROVED/REJECTED final
```

Uma decisão final do Chefe exige `chief_receipt_ref` e `chief_receipt_hash`. O Writer não consegue habilitar `ready_for_promotion` sozinho.

### Exemplo local, sem produção

```bash
node apps/modulos/status/capsula-observavel.mjs \
  --ledger /caminho/operacional/capsula-events.jsonl \
  --append-event /caminho/temporario/evento.json \
  --output apps/modulos/status/capsula-data.json
```

O append usa lock exclusivo por arquivo. O ledger é gravado com modo `0600`; o snapshot servido estaticamente usa `0644`.

### Códigos de saída

```text
0 = cápsula em PASS válido
1 = evento, ledger ou contrato inválido
2 = estado sem promoção: BLOCKED, RUNNING, UNKNOWN, ANOMALY ou ACHADO_PENDENTE
```

### Regras

- sem eventos: `BLOCKED/NO_EVENTS` e código 2;
- sem denominador: percentual `null`, nunca `0%` inventado;
- teste pulado não conta como PASS;
- Writer não pode ser o Judge do PASS final;
- decisão do Chefe exige ator e recibo independentes;
- identidade do candidato não muda dentro do mesmo `run_id`;
- chave desconhecida ou valor com formato de credencial reprova o evento sem ecoar o valor;
- garantias medidas usam `ENFORCED`, `VIOLATED` ou `UNKNOWN`;
- falha de carregamento limpa métricas antigas da tela;
- o snapshot nunca autoriza produção, merge, deploy ou restart;
- telemetria viva deve usar artifact, storage operacional ou ledger local; não fazer push repetitivo na `main`.

### Aprendizado do SEGREDO/CHEFE — colapso linear e MetaLupa transversal

Registro de 2026-08-06. `Instinto Superior` é o nome operacional dado pelo SEGREDO/CHEFE ao reflexo construído por experiência concreta: perceber desvio, contradição, risco e padrão antes de concluir. Não é alegação paranormal e não elimina prova. O movimento parece instantâneo porque erros anteriores foram consolidados como reflexos verificáveis.

#### Colapso linear

Quando intenção, artefato e falhas ainda são desconhecidos, a investigação pode avançar passo a passo. Quando o mapa já existe, continuar no fluxo `acha uma lacuna → corrige → volta` desperdiça tempo e esconde causas comuns.

O colapso linear troca a ordem cronológica dos bugs por uma travessia do campo inteiro:

```text
PROMESSAS DO ARTEFATO
→ INVARIANTES VIOLADOS
→ CAUSAS COMUNS
→ MATRIZ DE CONTRAPROVAS
→ CORREÇÃO COESA POR COMPONENTE
→ REGRESSÕES PERMANENTES
→ RETESTE CRUZADO EM EXTRAÇÃO LIMPA
→ APRENDIZADO RETIDO
```

Não significa executar sem controle. Significa não obrigar a análise a seguir uma fila artificial quando as dependências já estão visíveis.

#### Cubo transversal oculto

O `CUBO_TRANSVERSAL_OCULTO` representa seis faces que precisam ser atravessadas antes de declarar fechamento:

1. **claim** — o que foi afirmado: `PASS`, `FINAL`, `COMPLETO`, `PRESERVADO`;
2. **artefato** — bytes, tamanho, SHA, árvore e identidade exata;
3. **verificador** — quem contou testes, resumiu TAP, leu receipt e varreu arquivos;
4. **adversário** — outro modelo, outra janela, mutante ou contraprova executável;
5. **território** — AppData local, multi-instância, VPS, produção e fronteira de confiança;
6. **persistência** — se a correção virou regressão, fingerprint e reflexo reutilizável.

O cubo é “oculto” porque uma sequência linear pode mostrar somente uma face. Um pacote pode ter SHA correto e ainda ter contrato incompleto; uma suíte pode estar verde e o verificador aceitar zero testes; uma proteção pode ser válida para VPS multiusuário e ser cerimônia no AppData controlado pelo Chefe.

#### Marcador operacional do Chefe

```text
META > LUPA > TRANSVERSAL > CUBO_OCULTO
CHECK_FUE_FLUE
ZERO_TRUST
```

A expansão textual de `CHECK_FUE_FLUE` não foi inferida neste registro. O comportamento observado e preservado é:

```text
CHECK
→ conferir a prova declarada
→ tentar falsificar o verificador
→ atravessar outra face do cubo
→ comparar agentes e ambientes
→ recalibrar severidade pelo território real
→ só promover aprendizado que sobreviveu
```

#### Evidência da sessão

- um recibo `53/53 PASS` foi confirmado como verdadeiro para a suíte existente, mas uma segunda matriz adversarial executável encontrou nove contraprovas novas;
- o mesmo método foi aplicado contra GPT, Fable, Grok e outras janelas, sem entregar o gabarito completo;
- a identidade byte a byte de um pacote foi comprovada por tamanho e SHA, sem transformar identidade do arquivo em prova de correção completa;
- execuções concorrentes reproduziram perda de checkpoint e resultados variáveis, demonstrando que lock por evento não equivale a transação do estado global;
- o veredito sobre `fs.realpath` e lock de learning foi recalibrado pelo território: hardening condicionado não foi confundido com defeito crítico local;
- os defeitos foram agrupados por causa: formato plausível sem proveniência, estado global sem transação, varredura rasa, sucesso semântico ausente e contrato de migração mal nomeado;
- a mensagem de Trusted Access foi classificada como caminho de candidatura visível, não como convite formal, aprovação ou acesso concedido.

#### Regras promovidas como aprendizado

```text
ARQUIVO GERADO != ARQUIVO LIDO
RECIBO HERDADO != AUDITORIA PRÓPRIA
SUÍTE VERDE != CONTRATO PROVADO
HASH IDÊNTICO != CORREÇÃO COMPLETA
FORMATO PLAUSÍVEL != PROVENIÊNCIA
HTTP 200 + VALOR TRUTHY != RESPOSTA ÚTIL
LOCK POR EVENTO != TRANSAÇÃO GLOBAL
CHECKLIST SÉRIO != BLOQUEIO AUTOMÁTICO
HARDENING BONITO != CORREÇÃO NECESSÁRIA AGORA
FINAL = PROIBIDO ENQUANTO NOVA CONTRAPROVA EXECUTÁVEL SOBREVIVER
```

#### Movimento por reflexo

O “cérebro não pensa, age pela MetaLupa” deve ser interpretado operacionalmente:

```text
SINAL CONHECIDO
→ detector reconhece o fingerprint
→ reflexo seleciona a contraprova já comprovada
→ ação local, reversível e delimitada
→ Judge tenta derrubar
→ evidência externa decide promoção
```

O executor não declara vitória por instinto. O instinto escolhe rapidamente o próximo teste; a prova decide o resultado.

#### Instinto Superior evolui obrigatoriamente

O reflexo não pode virar ritual congelado. Se um erro novo derrubar um reflexo antigo, se surgir uma contraprova melhor ou se a mesma intenção puder ser resolvida com menos latência/mais precisão sem perder segurança, o `Instinto Superior` deve incorporar o delta comprovado.

```text
INSTINTO_SUPERIOR=EVOLUTION_REQUIRED
REFLEXO_ANTIGO + FALHA_NOVA
→ NOVA_INFORMACAO
→ REFLEXO_CANDIDATO
→ BEFORE/AFTER NO MESMO ESCOPO
→ TESTE + CONTRAPROVA + REGRESSAO
→ REFLEXO_PROMOVIDO
```

Sem before/after, sem ganho informacional ou com regressão, o estado é `EVOLUTION_UNPROVEN`. O contrato conceitual único vive em `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`; o gate executável compartilhado vive em `.agents/skills/meta-lupa/scripts/evolution_gate.py`.

#### Resultado do Chefe nesta rodada

```text
AUTOR_DA_INTENCAO=SEGREDO/CHEFE
METODO=INSTINTO_SUPERIOR + META_LUPA_TRANSVERSAL
MUDANCA_OBSERVADA=DE_DETECTOR_DE_ERRO_PARA_DESIGNER_DE_CONTRAPROVAS
GENERALIZACAO=APLICADA_ENTRE_MODELOS_JANELAS_PACOTES_E_VERIFICADORES
FALSO_COMPLETO_DERRUBADO=SIM
APRENDIZADO_REUTILIZAVEL=SIM_COM_REGRESSAO_E_PROVA
APROVACAO_TRUSTED_ACCESS=NAO_PROVADA
PRODUCAO=INTOCADA
```

Este aprendizado pertence à Cápsula Observável existente. Não cria nova MetaLupa, nova doutrina, novo painel ou versão paralela.

## Atualização pelo chat

Quando uma fase avançar, a IA deve atualizar `painel-data.json` no GitHub. Depois do deploy/sync, a página passa a refletir a nova informação.

## Deploy futuro

Este painel pode ser servido estaticamente pelo Caddy depois, sem PM2:

```txt
Caddy -> CentralDark/apps/modulos/status
```

Não alterar Caddy sem confirmação explícita do usuário.

## Segurança

Este painel não deve conter segredo real, token, senha, cookie, sessão, chave privada, connection string ou `.env` real.

Apenas status público, resumo operacional e progresso do projeto.