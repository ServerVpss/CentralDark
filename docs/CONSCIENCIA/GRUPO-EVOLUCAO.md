---
title: "Grupo da Evolução — CentralDark"
date: 2026-07-02
tags: ["consciencia", "ias", "automacao", "xp"]
updated: 2026-07-30
---

# 🧠 Grupo da Evolução — contrato vigente

O Grupo da Evolução comunica auditorias e contribuições sobre o **CentralDark real**.
Ele não sorteia aprendizado, não inventa autoria de IA e não transforma conversa em XP.

## Regra central

```text
ELOGIO = reconhecimento humano.
ANÁLISE = orientação, ainda sem XP.
CORREÇÃO + TESTE + SHA + PR = contribuição técnica pontuável.
```

Um elogio do Pivete deve ser reconhecido e agradecido. Porém só existe evolução
contábil quando a ação técnica deixa prova reproduzível no repositório.

## Arquitetura autossuficiente

```text
AUDITOR DETERMINÍSTICO
        ↓
FINDING ID + EVIDÊNCIA SHA-256
        ↓
IA DISPONÍVEL? ── sim ──> revisão limitada aos findings existentes
        │
        não / inválida
        ↓
MODO SCRIPT declarado
        ↓
AUTO-FIX ALLOWLISTED
        ↓
TESTES + AUDITORIA DEPOIS
        ↓
COMMIT DA CORREÇÃO
        ↓
XP EM SEGUNDO COMMIT, REFERENCIANDO O SHA
        ↓
BRANCH + PR; NUNCA PUSH DIRETO NA MAIN
```

A IA melhora a análise quando está disponível. Ela não é requisito para detectar,
aplicar correções determinísticas, testar, gerar recibos, abrir PR ou manter Issues.

## Componentes canônicos

| Componente | Responsabilidade |
|---|---|
| `scripts/evolucao/auditar-autonomia.py` | Detecta lacunas por regras determinísticas e produz finding IDs estáveis |
| `scripts/evolucao/revisar-com-ia.py` | Revisa findings; sem IA ou recibo válido, declara `MODO SCRIPT` |
| `scripts/evolucao/aplicar-autofix.py` | Aplica somente transformações exatas da allowlist |
| `scripts/evolucao/registrar-xp-ci.py` | Registra XP apenas após correção comprovada e testes aprovados |
| `scripts/evolucao/gerar-placar.py` | Gera XP, level e tier por agente a partir do ledger canônico |
| `scripts/evolucao/sincronizar-issues.py` | Abre, deduplica e fecha Issues conforme o finding reaparece ou some |
| `scripts/evolucao/publicar-pr-automatico.sh` | Publica em branch automática estável e abre ou atualiza um PR |
| `scripts/sentinela/run.mjs` | Coleta estado operacional sem escrever no repositório |
| `apps/bot-telegram/evolucao-ias.cjs` | Comunica a auditoria e a revisão validada no grupo |
| `.github/workflows/sentinela-divergencias.yml` | Orquestra o fluxo com um escritor por execução |

Não criar `v1`, `v2`, `v3` ou cópias paralelas desses componentes. A evolução ocorre
no arquivo canônico e é protegida por regressão.

## Como uma IA participa

Uma IA só aparece como contribuidora quando sua resposta:

1. repete o mesmo `evidence_sha256` fornecido pelo auditor;
2. cita somente `finding_ids` existentes;
3. contribui para um finding que foi removido pela correção;
4. passa pelos testes do mesmo run;
5. chega a um PR rastreável.

Se qualquer condição falhar, a execução continua em `MODO SCRIPT` e não atribui
contribuição à IA.

## XP, level e tier

A fonte única é:

```text
.agents/skills/meta-lupa/references/uso-ledger.jsonl
```

O placar é derivado, nunca inventado:

```text
docs/evolucao/placar.json
docs/evolucao/placar.md
```

Regras:

- mensagem, elogio ou postagem no Telegram: `0 XP`;
- finding sem correção: `0 XP`;
- correção sem teste: `0 XP`;
- teste verde sem prova antes/depois: `0 XP`;
- IA que inventa finding, arquivo ou resultado: contribuição rejeitada;
- correção comprovada: MetaLupa calcula XP conforme achievements válidos;
- `ponto_fixo_atingido` exige simultaneamente AutoLupa executada e ponto fixo evidencial;
- correção de contabilidade histórica desconta o valor devido e não gera prêmio positivo.

## Segurança e autonomia

- credenciais vêm de secrets ou ambiente; nunca há token literal no código;
- ausência de IA não paralisa a auditoria;
- ausência de prova fecha o gate, não produz verde;
- auto-fix só atua em transformações conhecidas e testadas;
- achado sem auto-fix vira Issue deduplicada;
- publicação usa branch e PR;
- a `main` só recebe mudanças após os gates e a decisão de merge.

## Fronteira de identidade do GitHub

O `GITHUB_TOKEN` interno consegue criar commits e atualizar a branch, mas o GitHub
coloca os novos workflows de um PR atualizado por esse token em estado de aprovação
obrigatória. Isso é uma barreira da plataforma contra recursão e abuso, não uma falha
que possa ser apagada por script.

Para autonomia sem intervenção nesse ponto, configure uma destas identidades externas:

```text
GITHUB_PAT_PERFIL com Contents + Pull requests + Workflows
ou
GitHub App instalada com permissões equivalentes
```

Sem essa identidade, o sistema continua seguro e fail-closed:

```text
detecta → corrige → testa → commita na branch
mas declara ACTION_REQUIRED para os novos checks
```

Nunca trocar essa barreira por `pull_request_target` executando código não confiável,
por push direto na `main` ou por ocultação do status. A pendência externa deve permanecer
visível até a credencial autorizada existir.

## Execução local ou VPS

```bash
# Auditoria determinística
python3 scripts/evolucao/auditar-autonomia.py --json-stdout

# Testes do motor
python3 scripts/evolucao/test_autonomia.py

# Comunicação de um ciclo, com fallback automático
node apps/bot-telegram/evolucao-ias.cjs --test

# Loop de comunicação via PM2
pm2 start apps/bot-telegram/evolucao-ias.cjs --name evolucao-ias -- --loop
pm2 save
```

## Estado honesto

A autonomia cobre apenas os gates implementados. Um relatório sem findings significa:

> Nenhuma lacuna foi encontrada dentro do escopo auditado.

Não significa que todo o repositório, VPS ou serviço externo foi provado. Expandir a
cobertura exige adicionar uma regra determinística, um teste negativo e a evidência
correspondente ao mesmo auditor canônico.

## Ver também

- `LEIA-ME-IA.md` — porta de entrada
- `.agents/skills/meta-lupa/SKILL.md` — motor de prova e XP
- `docs/CONSCIENCIA/DARKAI/README.md` — gateway opcional de modelos
- `docs/CONSCIENCIA/APRENDIZADOS.md` — aprendizados humanos e técnicos aprovados
