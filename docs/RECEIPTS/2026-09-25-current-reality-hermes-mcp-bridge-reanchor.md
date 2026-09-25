# Receipt — Reancoragem CURRENT Hermes / MCP / Bridge + Matriz de Agentes

Data local: 2026-09-25 00:37 BRT
Atualização de cristalização: 2026-09-25 00:45 BRT
Repo: ServerVpss/CentralDark
Destino: main
Commit base antes desta melhoria: `b10f9bf0a61090f299a147a11ec580f9974a0ac7`

## Intenção do CHEFE

Registrar em `main` que o diagnóstico operacional antigo venceu: a topologia mudou, a VPS voltou a responder, a main avançou e o estado precisa ser tratado como CURRENT novo, não como repetição do receipt anterior.

O CHEFE pediu melhoria explícita: cristalizar melhor os agentes envolvidos nesta reancoragem para que SOL, GEOFF, IAN, GREG, DEX, HERMES e REALIDADE não fiquem como nomes soltos, mas como papéis com entrada, saída, limite, prova e bloqueio.

## Fatos medidos nesta rodada

- `main` medida antes do primeiro receipt: `4876711ee0d05e5d7f01362f2c00d34dd0628286`.
- Commit medido antes do primeiro receipt: `docs(central-notificacoes): novidades do dia ancoradas em 2f3ef85b + conflito #1662 marcado`.
- `main` medida antes desta melhoria: `b10f9bf0a61090f299a147a11ec580f9974a0ac7`.
- Remote Desktop Commander, nesta sessão, listou `vmi3256920` como `online`.
- A leitura anterior `RDC offline / ponte caída / Hermes sem provider` está expirada para decisões CURRENT.

## Material trazido pelo CHEFE — tratado como evidência de revisão externa

O CHEFE trouxe uma revisão operacional indicando que:

- `hermes-acp` aparece ONLINE no PM2.
- Existem múltiplos `docker mcp gateway run` ativos subordinados ao Hermes.
- Existe `hermes serve --isolated` ativo.
- Existem duas sessões Desktop Commander remotas (`conta1` e `conta2`) vivas.
- Existe `tunnel-client --profile centraldark-mcp`.
- MCP CentralDark está online.
- Hermes Core em `:8899` está saudável.

Esses pontos precisam de reconfirmação por sonda direta quando o executor de processo estiver disponível, mas já são suficientes para invalidar o uso automático do diagnóstico antigo.

## Separação obrigatória de camadas

```text
PONTE_VIVA != PROVIDER_DE_IA_PRONTO
HERMES_CORE_SAUDAVEL != TODOS_AGENTES_EXECUTANDO_CORRETAMENTE
MCP_ONLINE != TODAS_FERRAMENTAS_ATIVAS
REMOTE_VISUAL_CONECTADO != DEVICE_VISIVEL_EM_TODO_CONECTOR
MERGE_IS_NOT_DEPLOY
CI_PENDING_IS_NOT_PASS
UNKNOWN != PASS
REALIDADE_IS_JUDGE
```

## Matriz canônica de agentes — CURRENT

Esta matriz não cria agentes novos. Ela consolida papéis já cristalizados no Trigger Fabric / Master Cycle / Boot Enxame Omega e aplica esses papéis ao estado CURRENT Hermes/MCP/Bridge.

```text
SOL       -> COORDINATION_ROLE
GEOFF     -> AUTOMATION_FACTORY
IAN       -> STRUCTURAL_SKEPTIC
GREG      -> OBSERVABILITY_PROOF
DEX       -> HUMAN_AGENT_COORDINATION
HERMES    -> EXECUTION_ROLE
REALIDADE -> REALITY_JUDGE
```

### SOL — Coordenação / visão inteira

```text
ROLE=COORDINATION_ROLE
ENTRADA=intenção do CHEFE + estado medido + receipts recentes
SAÍDA=plano reconciliado + dedupe de deltas + NEXT_CURSOR
NÃO_FAZ=executar mutação direta, substituir CHEFE, substituir REALIDADE
PROVA_MINIMA=lista de camadas separadas + conflitos/UNKNOWN explícitos
BLOQUEIA_SE=misturar ponte/provider/MCP/runner como se fossem uma coisa só
```

Aplicação neste receipt: SOL deve impedir que `vmi3256920 online` vire conclusão global sobre Hermes, provider, ACP, MCP e Desktop Commander sem sonda por camada.

### GEOFF — Loop / implementação mínima

```text
ROLE=AUTOMATION_FACTORY
FÓRMULA=IMPLEMENTAÇÃO + SIMPLIFICAÇÃO
ENTRADA=goal do CHEFE + lacuna material + owner existente
SAÍDA=menor loop executável reutilizando owner já provado
NÃO_FAZ=criar arquitetura paralela, criar router novo, fanout sem ganho
PROVA_MINIMA=/goal + executor escolhido + observação + revisão + contraprova
BLOQUEIA_SE=o loop repetir sem informação nova
```

Aplicação neste receipt: GEOFF deve transformar a reancoragem em um loop curto: medir processos Hermes/MCP/Bridge, mapear owner/session/profile, contraprovar e parar em fixed point ou NEXT_CURSOR.

### IAN — Guardrails / falso-verde não passa

```text
ROLE=STRUCTURAL_SKEPTIC
ENTRADA=claim operacional + regra/invariante aplicável
SAÍDA=risco, contradição, limite ou prova mínima exigida
NÃO_FAZ=aceitar narrativa como prova, ampliar permissão por entusiasmo
PROVA_MINIMA=fato + regra + teste discriminante quando houver conflito
BLOQUEIA_SE=UNKNOWN sendo tratado como PASS
```

Aplicação neste receipt: IAN mantém separados `SEGREDO_BROWSER_TRAY=PASS visual` e `SEGREDO_CONNECTOR_NESTA_SESSAO=UNKNOWN`.

### GREG — Auditor determinístico

```text
ROLE=OBSERVABILITY_PROOF
ENTRADA=diff, logs, checks, health, runtime, receipts
SAÍDA=veredito determinístico: PASS / FAIL / UNKNOWN / BLOCKED
NÃO_FAZ=narrar confiança, deduzir green, aceitar CI pendente como sucesso
PROVA_MINIMA=HEAD/fingerprint + comando/sonda + resultado verificável
BLOQUEIA_SE=CI_PENDING_IS_NOT_PASS ou ACTION != PROOF
```

Aplicação neste receipt: GREG deve exigir sonda direta para `hermes-acp`, `docker mcp gateway`, `hermes serve --isolated`, MCP, tunnel e Desktop Commander antes de qualquer green operacional.

### DEX — Coordenação humana / deploy boundary

```text
ROLE=HUMAN_AGENT_COORDINATION
ENTRADA=delta crítico + plano de execução + rollback/handoff
SAÍDA=permitido, bloqueado ou exige aprovação humana
NÃO_FAZ=deploy automático, restart global, bypass de auth, rotação de segredo
PROVA_MINIMA=escopo, writer único, rollback, owner e impacto material
BLOQUEIA_SE=mutação irreversível, segredo, deploy, auth ou sessão humana exigida
```

Aplicação neste receipt: DEX bloqueia qualquer `restart`, `deploy`, `upgrade`, `force-push`, `credential rotation` ou alteração de ponte Desktop sem aprovação explícita e prova de owner.

### HERMES — Executor

```text
ROLE=EXECUTION_ROLE
ENTRADA=plano autorizado + owner + comando limitado
SAÍDA=execução observável + logs + receipt técnico
NÃO_FAZ=decidir verdade, expandir escopo, virar autoridade final
PROVA_MINIMA=processo/PID/status/exit code/log + T1 após ação
BLOQUEIA_SE=owner ausente, autorização ausente, rota ambígua ou sensor degradado
```

Aplicação neste receipt: Hermes só deve executar depois que SOL/GEOFF/IAN/GREG/DEX definirem o alvo e o limite. HERMES_IS_EXECUTOR; REALIDADE_IS_JUDGE.

### REALIDADE — Juiz

```text
ROLE=REALITY_JUDGE
ENTRADA=estado vivo medido por sensores independentes quando possível
SAÍDA=PASS, FAIL, UNKNOWN ou BLOCKED
NÃO_FAZ=agradar intenção, herdar prova vencida, preencher lacuna
PROVA_MINIMA=medição atual do alvo correto
BLOQUEIA_SE=prova antiga, sensor conflitante sem teste discriminante, ou ausência de medição
```

Aplicação neste receipt: a realidade invalida o diagnóstico antigo, mas ainda não promove green global. A topologia está viva; o estado precisa ser reconciliado por camada.

## Ordem operacional canônica para este estado

```text
CHEFE_INTENÇÃO
→ SOL_RECONCILIA
→ GEOFF_DEFINE_LOOP_MINIMO
→ IAN_QUEBRA_PRESSUPOSTOS
→ GREG_MEDE_E_VERIFICA
→ DEX_CONTROLA_DELTA_CRITICO
→ HERMES_EXECUTA_SE_AUTORIZADO
→ REALIDADE_JULGA
→ RECEIPT
→ NEXT_CURSOR
```

## Agentes × sensores nesta missão

```text
SOL     observa: intenção, receipts, conflitos, escopo
GEOFF   observa: loop mínimo, owners reutilizáveis, menor próxima ação
IAN     observa: invariantes, bypass, falso-verde, hipóteses perigosas
GREG    observa: GitHub SHA, CI, logs, PM2, health, PID, status
DEX     observa: deploy boundary, auth boundary, rollback, writer único
HERMES  observa: comando autorizado, execução, saída, log, T1
REALIDADE observa: tudo que foi medido agora; sem medição = UNKNOWN
```

## Estado correto agora

```text
CURRENT_MAIN_BEFORE_FIRST_RECEIPT=4876711ee0d05e5d7f01362f2c00d34dd0628286
MAIN_BEFORE_AGENT_CRYSTAL_UPDATE=b10f9bf0a61090f299a147a11ec580f9974a0ac7
VPS_VMI3256920=ONLINE_NO_CONECTOR
DIAGNOSTICO_ANTIGO=EXPIRADO
HERMES_MCP_BRIDGE=REMEASURE_REQUIRED_BY_LAYER
SEGREDO_BROWSER_TRAY=PASS_VISUAL_PELO_CHEFE
SEGREDO_CONNECTOR_NESTA_SESSAO=UNKNOWN
AGENT_MATRIX=CRYSTALLIZED_FOR_THIS_RECEIPT
```

## O que não foi feito

- Nenhum deploy.
- Nenhum restart global.
- Nenhuma rotação de credencial.
- Nenhum merge/rebase.
- Nenhuma execução automática de arquivo.
- Nenhuma promoção de verde global.
- Nenhuma criação de agente, cérebro, router ou arquitetura paralela.

## Checklist de contraprova para a próxima rodada

```text
[ ] medir HEAD da VPS e comparar com main
[ ] medir MCP :9100 /health e /health/deep
[ ] medir Hermes Core :8899
[ ] medir PM2 hermes-acp
[ ] listar docker mcp gateway run e mapear parent/owner
[ ] medir hermes serve --isolated
[ ] medir tunnel-client --profile centraldark-mcp
[ ] validar Desktop Commander conta1/conta2
[ ] validar ONE_REMOTE_PROCESS_PER_PROFILE
[ ] separar SEGREDO visual/tray de SEGREDO connector-visible
[ ] registrar receipt operacional com PASS/FAIL/UNKNOWN/BLOCKED
```

## NEXT_CURSOR

```text
SOL: reconciliar objetivo e camadas
→ GEOFF: montar loop mínimo de medição
→ IAN: definir riscos/falsificadores
→ GREG: medir processos Hermes/MCP/Bridge na VPS
→ DEX: bloquear mutações críticas sem autorização
→ HERMES: executar apenas sondas autorizadas
→ REALIDADE: julgar por camada
→ RECEIPT OPERACIONAL
→ RETOMAR ARTIFACT / OBSIDIAN / BRIDGE SEM FALSO-VERDE
```

## Veredito

A CentralDark deve abandonar a premissa antiga de ponte caída como base de decisão. O estado CURRENT é vivo, mas precisa ser reconciliado por camada antes de qualquer conclusão verde.

A matriz de agentes acima cristaliza o comportamento esperado: cada agente tem função, limite e prova mínima. Nenhum nome de agente substitui medição, autorização ou realidade.
