# 22 — RECONCILIAÇÃO TOTAL: CASA + VPS + GITHUB + DRIVE + PACOTE

## Resultado arquitetural

A CentralDark passa a separar explicitamente cinco naturezas de estado:

1. **GitHub vivo** — estado desejado, versionado e auditável.
2. **Casa viva** — estado real local.
3. **VPS viva** — estado real remoto.
4. **Google Drive / CentralDark** — biblioteca durável, memória humana e espelhos; não substitui o GitHub canônico.
5. **Pacote CENTRALDARK-MASTER-PEGATUDO** — conjunto portátil de capabilities candidatas, nunca autoridade por si só.

A reconciliação não escolhe “um vencedor” pela disponibilidade do transporte. Ela mede papéis diferentes e converge no owner existente.

## Descoberta importante do espelho

O material `ESPELHOS-DO-GITHUB/docs/GITHUB_ACCESS.md` e `WEBHOOKS.md` declara explicitamente o repositório `segredounlock/clone-deck`. Portanto, suas portas, chaves, aliases e listeners são **escopo daquele owner**, não regras globais da CentralDark. Regras genéricas podem ser cristalizadas; detalhes de repo/porta permanecem scoped.

Isso cria o `SCOPE_COLLISION_GUARD`:

```text
DOCUMENTO
  ↓
DECLARED_REPO + OWNER + RUNTIME_TARGET + REVISION
  ↓
REGRA OWNER-SPECIFIC? ── sim ──> PRESERVA NO OWNER
  │
  não
  ↓
CONTRAPROVA DE GENERALIZAÇÃO
  ↓
OWNER GLOBAL EXISTENTE
```

## Cérebros

O espelho histórico aponta `docs/BRAIN` como Segundo Cérebro e `docs/CONSCIENCIA` como memória operacional de IA. Isso é **hipótese de path atual**, não estado vivo. O mega comando primeiro procura os owners atuais e apenas então liga os consumidores. Se `EXIGIA`/`EXG` existir, o owner é descoberto por nome exato; se não existir, fica `UNKNOWN` e nenhum novo cérebro é criado automaticamente.

## Aprovação técnica automática

Cada capability do pacote pode ser revisada automaticamente, mas `PASS` exige:

- owner resolvido;
- contrato válido;
- documentação;
- dry-run;
- teste negativo/falsificador;
- testes positivos;
- contraprova;
- HEAD testado igual ao HEAD candidato;
- CI verde no HEAD atual quando material;
- zero UNKNOWN material e zero contradição.

Executor não se autoaprova. Merge/deploy são autoridades separadas.

## Webhook

Webhook acelera a chegada de eventos, mas não é o mecanismo único de verdade. Cada evento apenas agenda `MEASURE -> RECONCILE`; boot/poll/reconcile periódico continua existindo para detectar drift que não chegou por evento.

## Handoff geracional

Todo ciclo material deixa `HANDOFF` com HEAD/revisão, owners, testes, contraprovas, CI, unknowns e `NEXT_CURSOR`. O próximo agente remede antes de continuar.
