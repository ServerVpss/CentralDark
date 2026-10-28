# Profile ↔ SOUL Canônica

```text
PROFILE_SOUL=@CENTRALDARK_SOUL(docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md) | REMEASURE_LIVE_FIRST | LOCAL_CLONE_ALLOWED | GITHUB_MAIN_FALLBACK | SHA_REQUIRED | ZERO_TRUST | META_LUPA | UNKNOWN!=PASS | NO_COPY | NO_SECOND_SOL | MAIN_ONLY_AFTER_GREEN
```

O profile não replica SOUL, governança, memória, Writer, MetaLupa, Fixed Point ou aprendizados. Ele apenas aponta para a SOUL canônica e pode acrescentar preferências locais de UI/voz/modelo.

O `casa_boot.py` existente é verificador/adaptador dessa referência; não é segunda SOUL nem segunda governança.

Fluxo único:

```text
#ACORDAR → !CENTRALDARK → REMEASURE → SOUL CANÔNICA → ZERO TRUST → META LUPA → TESTE → CI DO MESMO HEAD → MAIN SÓ VERDE → CADEADO
```

Se local e remoto divergirem: `DRIFT/CANDIDATE`, nunca PASS automático. Só o que sobreviver aos gates existentes pode ser promovido. Na próxima execução, o profile resolve novamente a SOUL canônica atual.


## VPS / runtime — ciclo direcional bidirecional

A VPS é plano de execução, não segunda fonte estrutural. Quando o checkout operacional contém estado vivo/dirty ainda não reconciliado, o boot não deve ficar preso nele: use um **cache canônico limpo e descartável** de `origin/main` para SOUL, skills e contratos.

```text
FORWARD:  GitHub main → cache canônico limpo → SOUL/profile/skills → runtime
REVERSE:  runtime observado → delta útil provado → owner existente → writer-safe-push-main → GitHub main
ROUND_TRIP: main nova → cache canônico → remedição do runtime
```

Invariantes:

```text
DIRTY_OPERATIONAL_WORKTREE != BOOT_BLOCKER_FOR_CANONICAL_READ
DIRTY_OPERATIONAL_WORKTREE != SOURCE_OF_STRUCTURAL_TRUTH
CANONICAL_CACHE_IS_DISPOSABLE=true
RUNTIME_TO_GITHUB_REQUIRES_CRYSTAL_FILTER=true
NO_BLIND_BIDIRECTIONAL_RSYNC=true
NO_RUNTIME_STATE_PROMOTION=true
NO_SECRET_PROMOTION=true
ONE_WRITER_PER_SCOPE=true
```

O cache pode ser resetado para `origin/main` porque não recebe trabalho humano nem estado vivo. O checkout operacional nunca é limpo/resetado por esse mecanismo. Cristal útil no sentido reverso usa o writer canônico e, depois da promoção, a volta `main → cache → runtime` fecha o ciclo.


## Molde mínimo do SOUL local / VPS

O arquivo local não é uma segunda SOUL. Ele é somente ponte de executor e pode permanecer pequeno:

```text
# HERMES / VPS — THIN EXECUTOR BRIDGE

EXECUTOR_ROLE=HERMES
PROFILE_CLASS=THIN_EXECUTOR_BRIDGE
NO_SECOND_SOUL=true
LOCAL_RULES_ONLY=true

CANONICAL_REPO=ServerVpss/CentralDark
CANONICAL_REF=origin/main
CANONICAL_SOUL_PATH=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
CANONICAL_CACHE_DIR=/var/lib/centraldark/canonical-main
CANONICAL_CACHE_OWNER=scripts/vps/centraldark-deploy.sh --apply --canonical-cache

BOOT:
  refresh origin/main
  → bind MAIN_SHA
  → read SOUL-SOL.md from clean canonical cache
  → load canonical gates/contracts
  → apply only local runtime bindings
  → measure VPS
  → execute

LOCAL_MAY_DEFINE:
  paths
  tools
  runtime bindings
  device facts
  env/secret references
  service endpoints

LOCAL_MUST_NOT_COPY:
  identity
  canonical memory
  governance
  Meta Lupa
  Writer law
  Fixed Point
  learned rules
```

Se `origin/main` não puder ser atualizado, o último cache pode servir apenas como baseline de continuidade; não pode ser chamado de estado canônico atual. `CURRENT_CANONICAL_CLAIM=UNKNOWN` até nova medição.

## 2026-10-26 ? Hermes local SOUL: limite sem truncamento (Casa)

- Diagn?stico: aviso REAL Context file SOUL.md TRUNCATED: 76009 chars exceeds limit of 61440, do Hermes na Casa.
- Identidade: Hermes ? executor; seu C:/Users/Administrador/AppData/Local/hermes/SOUL.md cont?m o papel SOL/JARVIS. N?O ? outra SOL nem novo agente.
- Owner can?nico: K:/docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md, versionado em ServerVpss/CentralDark/main. O snapshot Hermes de 04/10/2026 n?o ? id?ntico ao can?nico da main; LOADED != CANONICAL_SYNC_PASS.
- A??o de menor delta: somente context_file_max_chars: 86016 no C:/Users/Administrador/AppData/Local/hermes/config.yaml. Config permaneceu local e FORA do Git; nenhuma chave, token ou segredo exposto. SOUL local e SOUL can?nico n?o foram alterados.
- Leitura antes/depois: SOUL local 76009 caracteres de texto, margem 10007. SHA256 do arquivo SOUL local: 2c031ce905f2ae12f49b0016ae69f8935ac8adebbd845f9491b057094b6e3bb3.
- Prova execut?vel: Python do .venv original do Hermes importou agent.prompt_builder e agent.context_file_sources; cap(98304) = 86016, cap(None) = 86016, list_context_file_sources(cwd=K:/,context_length=98304,home_override=HOME_HERMES) reportou SOUL.md | 76009 | loaded; processo saiu com c?digo 0.
- Limite honesto: READBACK=PASS em NOVO carregamento do builder; o terminal j? aberto pode manter prompt em cache at? a pr?xima constru??o de contexto. Isso n?o prova que a c?pia local de outubro est? semanticamente 100% alinhada com a SOUL vigente do GitHub.
- Teste de regress?o m?nimo: repetir context_file_sources no mesmo Hermes home ap?s mudan?as, confirmar status=loaded, arquivo correto, capacidade e SHA. N?o resolver aviso elevando limite cegamente em modelo com janela pequena; priorizar a SOUL can?nica e o perfil/ponte pequena j? descrito nesta receita existente quando a leitura efetiva estiver validada.
- Classifica??o: Grupo 02 Loop Mestre/execu??o; Grupo 03 Evid?ncia e contraprova; Grupo 04 Drift local/can?nico pendente. Testado em 2026-10-26T19:57:31-03:00.
## 2026-10-26 ? Readback final: SOUL Hermes id?ntica ? main

- Fato corrigido: a c?pia local ativa em C:/Users/Administrador/AppData/Local/hermes/SOUL.md estava desatualizada. O owner can?nico ? K:/docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md.
- A??o: substituir conte?do da SOUL ativa pelos mesmos bytes da can?nica; hash de origem e destino SHA256 b3fab5c0454341f99411821bf42c7991e2bb01025cbb45afeacc924529a99ac1. Nenhuma SOUL/agent novo criado.
- Config Hermes existente: context_file_max_chars = 131072, margem de 8245 para os 122827 caracteres da c?pia can?nica; demais chaves YAML id?nticas.
- Contraprova do builder Hermes original, Python .venv: context_file_sources (cwd K:/) com contexto 98304 e None -> cap 131072; SOUL.md 120172 caracteres renderizados, status loaded nos dois casos; processo exit=0.
- Estado: PASS (identidade da c?pia e aus?ncia de truncamento em novas leituras). Uma sess?o j? aberta pode requerer reconstru??o do prompt para usar a nova SOUL.
- Confer?ncia: 2026-10-26T20:35:39-03:00; Grupo 02 execu??o, Grupo 03 evid?ncia. Arquivo config.yaml local n?o enviado ao Git.
