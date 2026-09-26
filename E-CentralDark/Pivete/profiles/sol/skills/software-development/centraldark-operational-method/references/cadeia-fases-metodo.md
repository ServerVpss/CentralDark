# Cadeia de Fases do Método CentralDark (walkthrough de símbolos ↓)

Material condensado de sessão real (2026-08-27, Pivete conduzindo a cadeia
`#ACORDAR → !CALIBRAR → ...` e depois pedindo `↓` para descer nível a nível).
Serve para qualquer engine (Hermes, Claude, Codex, Grok) operando a Casa.

## A cadeia completa (cada ↓ desce um nó)

```
#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR
→ !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → !BOOT
        │
        ▼ HIPÓTESE
        │  (não é fato, não é PASS — separar de achado)
        ▼ TESTE
        │  mede de verdade, separa ouro de lixo
        ▼ CONTRAPROVA
        │  o teste aguentou o contra-ataque? furo na própria conclusão?
        ▼ CAUSA ESPECÍFICA
        │  por que o furo existe? não sintoma — causa raiz mensurável
        ▼ REMEDIAÇÃO MÍNIMA
        │  só o delta que o teste provou; zero V2 solto
        ▼ PRESERVAÇÃO / REVERSÃO
        │  snapshot/backup ANTES; rollback documentado; só depois ação
        ▼ REALITY_JUDGE
        │  evidência medida decide, não palpite nem autoridade do modelo
        ▼ RECEIPT
        │  prova do que aconteceu (hash/SHA/timestamp/alvo)
        ▼ CONTINUIDADE
        │  retoma o fio onde parou, não reinicia
        ▼ ÂNCORA / DELTA
        │  o que mudou vira receipt; o que ficou igual vira baseline
        ▼ HUMAN FRONTIER REAL
        │  limite onde só SEGREDO/CHEFE decide (chattr -i, rebase --abort,
        │  deploy, force-push, reset, rm em prod)
        ▼ SOL
        │  coordenação + reconciliação (COMO, não O QUÊ)
        ▼ HERMES
        │  braço executor (Casa); não é CHEFE, não é SOL
        ▼ reconciliação
        │  medir os dois lados, absorver delta no OWNER, zero paralelo
        ▼ continuidade / execução
        │  retoma fio, mínima mutação, Writer único
```

## Regra de fechamento (trava, não formato)

Nunca declarar `100%` / `PASS` / `FIXED_POINT` com UNKNOWN material.
Exemplo real desta sessão: H1 (Dependabot) e H3 (formulaa) ficaram UNKNOWN
porque furo restante era mensurável mas não medido; só H2 (tecnicadalupa =
duplicata do meta-lupa, provado por grep) fechou em FIXED_POINT parcial.

## Protocolo de limpeza (antes de mutar)

```
MEASURE → DIAGNOSE → CAUSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF
```

## Padrão multi-agente sob o mesmo teto

Quando vários engines operam a CentralDark ao mesmo tempo:
- Todos obedecem ao MESMO contrato (SOUL + gatilhos + CONTRATO-RECONCILIACAO).
- CHEFE = telhado (autoridade final). Hermes e Claude = braços, em máquinas
  diferentes, sem segundo jarvis.
- Não há "sessão que manda na outra" — só continuidade de fio.
- Metáfora que o Pivete usou e validou: "Hermes está aprendendo a lei da Casa
  (lê os pergaminhos); Claude já está no porão com a lanterna batendo na parede
  pra descobrir qual tijolo é oco." Um decora o mapa, outro escava — mesmo teto.
- Fronteira humana é idêntica pros dois: param e pedem grito do CHEFE.

## Lição de execução (não reinventar)

- `tecnicadalupa` (Grok) parecia gap → grep no `.agents/skills/meta-lupa/SKILL.md`
  + `references/` provou que os 7 filtros já estão lá. Veredito: DUPLICATA,
  não criar. REUSE_BEFORE_CREATE vale para skill também.
- `formulaa-consolidada` (1.276 arqs) parecia ouro perdido → `ls` do topo mostrou
  nomes idênticos ao `CentralDark/docs/`. Era espelho + material de outra sessão.
  Confirma com `diff -r` antes de declarar duplicata fechada.
- MCP remoto `mcp.centralldark.com` = 502 → VPS fica UNKNOWN da Casa. Não chutar
  estado da VPS; quem mede lá (Claude) reporta, Casa não confirma.
