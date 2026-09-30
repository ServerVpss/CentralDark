# Playbook — EXPANSAO DE DOMINIO

## Verso de ativacao

😈🔨 **EXPANSAO DE DOMINIO — FORJA DO MEGAZORD CENTRALDARK**

> Que toda peca solta encontre seu encaixe;
> que toda voz vire sinal;
> que todo sinal passe pelo juizo;
> e que so o provado suba ao painel.

## Significado canonico

Quando o CHEFE disser `EXPANSAO DE DOMINIO`, o sistema deve continuar expandindo o dominio operacional da CentralDark por setores, sem criar cerebro paralelo.

Isso significa:

1. medir o estado atual;
2. procurar setores ainda nao conectados;
3. localizar owner existente antes de criar qualquer coisa;
4. criar micro-delta material;
5. commitar com escopo claro;
6. passar por CI/checks quando existirem;
7. validar runtime/health/payload quando aplicavel;
8. registrar receipt;
9. promover somente PASS comprovado;
10. manter UNKNOWN e bloqueios separados.

## Ordem de prioridade

```text
CURRENT > HISTORY
OWNER EXISTENTE > OWNER NOVO
MICRO_DELTA > PATCH GRANDE
CI/RECEIPT > NARRATIVA
RUNTIME PAYLOAD > HTTP 200 CEGO
UNKNOWN != PASS
```

## Setores candidatos

- GitHub Actions / workflow signal;
- Gmail/iPhone notification signal;
- Telegram Bot API;
- Telegram MTProto user bridge;
- MCP Gateway;
- VPS PM2 Runtime;
- Meta-Lupa XP/posterior;
- status.centraldark dashboard;
- Google Drive ingest;
- Hub connectors UI;
- Obsidian/BRAIN sync;
- CI receipts.

## Contrato de commits

Cada expansao deve preferir varios commits pequenos quando isso reduzir risco:

```text
config(...)  -> mapa/controle/trigger
feat(...)    -> exibicao ou rota nova
fix(...)     -> correcao material
receipt(...) -> prova, UNKNOWN e NEXT_CURSOR
```

Se o estado ficar amarelo por tempo demais, squash/reconcilia somente quando for seguro e sem esconder falha.

## Nunca fazer

```text
nao criar bot novo quando bot atual serve
nao criar hub paralelo quando apps/modulos/hub existe
nao transformar elogio em prova tecnica
nao promover email/notificacao para PASS
nao fazer git pull cego na VPS
nao reiniciar PM2 com dirty diff desconhecido
nao gravar segredo no Git
```

## Saida obrigatoria

Ao fim de cada expansao, responder no padrao:

```text
Feito:
Evidencia:
Pendencia:
Proximo passo:
Qual BOOT usar:
Fio da missao:
```

## NEXT_CURSOR

```text
EXPANSAO_DE_DOMINIO -> medir setor -> owner existente -> micro-commit -> CI/receipt -> status.centraldark -> proximo setor
```
