#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import textwrap
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
)

PACKAGE_NAME = "CENTRALDARK-ARQUITETURA-TOTAL"
BUILD_SCHEMA = "centraldark.architecture.package.v1"
MAIN_SHA = "f60ad71810fb9009bcc1a576d77305d61f9d1add"
PR_NUMBER = 1444
PR_HEAD = "fdc5515a1b865f0d81c665ecc66cd02d5eb0a71a"
PR_URL = "https://github.com/ServerVpss/CentralDark/pull/1444"
REPO = "ServerVpss/CentralDark"
CREATED_AT = datetime.now(timezone.utc).isoformat()

SOURCES = [
    {
        "id": "SRC-001",
        "topic": "MAIN VIVA",
        "kind": "GITHUB_COMMIT",
        "status": "PROVED",
        "hash": MAIN_SHA,
        "link": f"https://github.com/{REPO}/commit/{MAIN_SHA}",
        "claim": "A main medida para este pacote aponta para o commit f60ad718...",
    },
    {
        "id": "SRC-002",
        "topic": "SEGUNDO CEREBRO LOGICO",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "38d8c1bd4d138032b85171d512cab5830810b644",
        "link": f"https://github.com/{REPO}/blob/main/SECOND-BRAIN.yml",
        "claim": "docs/BRAIN, GraphRAG, MetaLupa, skills, Casa/VPS/GitHub e sensores pertencem a um unico cerebro logico; MEMORY != REALITY.",
    },
    {
        "id": "SRC-003",
        "topic": "CICLO MESTRE",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "5a372b682e191810a2d54d27bd9caacb1ad2e716",
        "link": f"https://github.com/{REPO}/blob/main/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml",
        "claim": "!CENTRALDARK expande o ciclo ACORDAR -> CALIBRAR -> MULTIBUSSOLA -> META_LUPA -> RECONCILIAR -> DELTA_UTIL -> CONTRAPROVA -> REMEDICAO -> FIXED_POINT -> REGISTRA -> BOOT.",
    },
    {
        "id": "SRC-004",
        "topic": "MAPA DO CEREBRO",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "ca885d74eebeefc31eda0525b563177963a7a88c",
        "link": f"https://github.com/{REPO}/blob/main/docs/CONSCIENCIA/MAPA-DO-CEREBRO.md",
        "claim": "Muitas superficies convergem em uma intencao, um writer por escopo e realidade como judge; grafo e derivado, nao autoridade.",
    },
    {
        "id": "SRC-005",
        "topic": "LINGUAGEM E ENSINO",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "c63ba677cc6543c1eddfe38803739ee50506a298",
        "link": f"https://github.com/{REPO}/blob/main/docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md",
        "claim": "Baianes facil + narrativa biblica/egipcia/resenha + escola + precisao tecnica, sem substituir evidencia.",
    },
    {
        "id": "SRC-006",
        "topic": "NUMERACAO DA BIBLIOTECA",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "18ce3e037919caa69eeb3dcb382ece2261db00a3",
        "link": f"https://github.com/{REPO}/blob/main/docs/BRAIN/04-DECISOES/2026-09-03-numeracao-01-10-vault.md",
        "claim": "Numero + nome; teto de 10 irmaos por nivel; raiz 00-09; subcategoria apenas quando real; sem arvore paralela.",
    },
    {
        "id": "SRC-007",
        "topic": "CASA VAULT E OBSIDIAN",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "ffd613290057ef82a318b04559cdb00a11d19818",
        "link": f"https://github.com/{REPO}/blob/main/docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md",
        "claim": "O repo continua fonte da verdade; Obsidian e superficie viva; Hermes organiza e sincroniza sem publicar memoria privada.",
    },
    {
        "id": "SRC-008",
        "topic": "METODO OPERACIONAL",
        "kind": "GITHUB_FILE",
        "status": "PROVED_IN_SOURCE",
        "hash": "06f19132c9a46b5c76ad43d0c1ae2118897fad27",
        "link": f"https://github.com/{REPO}/blob/main/.agents/skills/centraldark-operational-method/SKILL.md",
        "claim": "Evidencia -> diagnostico -> menor correcao -> teste -> contraprova -> registro do ouro; reuse before create e one writer per scope.",
    },
    {
        "id": "SRC-009",
        "topic": "PLUGIN OBSIDIAN",
        "kind": "GITHUB_RELEASE",
        "status": "PROVED_RELEASE",
        "hash": "target:5853512f55ccb505226f5c3bd1fe5629aba030cc",
        "link": f"https://github.com/{REPO}/releases/tag/obsidian-plugin-v0.5.0",
        "claim": "Release Obsidian Plugin v0.5.0 com main.js, manifest.json, styles.css e auto-updater declarado.",
        "assets": {
            "main.js": "sha256:2c67e144865bf4ae3ab21926f965f9259b08b9a8503b2189ec553d69272562da",
            "manifest.json": "sha256:0db30d1fcbe6bc931106c2187a36e7f415befa785ce68df28fcf915f057734bb",
            "styles.css": "sha256:d797d77552f5788846bbb3228b0b9145b21bb6d4a6832f1592b32f93aaa5f043",
        },
    },
    {
        "id": "SRC-010",
        "topic": "PR DE RECONCILIACAO ATUAL",
        "kind": "GITHUB_PR",
        "status": "CANDIDATE_NOT_MAIN",
        "hash": PR_HEAD,
        "link": PR_URL,
        "claim": "#1444 reconcilia GARIMPO, one-site, one-MCP, one-admin, Casa/VPS/Kanban e preserva no-v2/v3; enquanto aberto, seu conteudo e candidato e nao main.",
    },
    {
        "id": "INTENT-001",
        "topic": "HOME COMO CONTEXT ROUTER",
        "kind": "CURRENT_HUMAN_INTENT",
        "status": "INTENT_CANDIDATE",
        "hash": "N/A-INTENT",
        "link": None,
        "claim": "Home deve funcionar como porta local da Casa, selecionando projeto, memoria e capacidade conforme a intencao do CHEFE, sem criar segundo cerebro.",
    },
]

MERMAID_GENERAL = r'''flowchart TD
    C[SEGREDO/CHEFE\nIntencao e destino] --> H[HOME / CASA PATH\nContext Router]
    H --> CORE[CENTRALDARK CORE\nOne Core Many Arms]
    CORE --> FRONT[Human Front\nHub / Admin]
    CORE --> BRAIN[BRAIN\ndocs/BRAIN + Vault + GraphRAG]
    CORE --> KANBAN[Kanban\nLifecycle + Worker Lanes]
    FRONT --> MCP[API + MCP]
    BRAIN --> MEM[Memoria Canonica + Aprendizados]
    KANBAN --> TASK[Orquestracao de Tarefas]
    H --> P1[workspace]
    H --> P2[hermes]
    H --> P3[mercado-pago-API]
    H --> P4[telegram-zen-panel]
    H --> PN[Outros projetos]
    MCP --> CASA[CASA]
    MEM --> GARIMPO[GARIMPO]
    TASK --> GITHUB[GITHUB]
    TASK --> VPS[VPS]
    CASA --> R[Receipts / Evidencia / Contraprova]
    GARIMPO --> R
    GITHUB --> R
    VPS --> R
    R --> CORE
    BRAIN -. consulta relevante .-> H
'''

MERMAID_HOME = r'''flowchart LR
    CHEFE[SEGREDO/CHEFE] --> HOME[HOME]
    HOME --> I[Resolver intencao]
    I --> V[Consultar Vault/BRAIN]
    V --> R[Recuperar receipts e owners]
    R --> S[Selecionar projeto]
    S --> C[Selecionar capacidade]
    C --> E[Executar pelo owner correto]
    E --> T[Testar + Contraprovar]
    T --> G[Registrar ouro]
    G --> HOME
    S --> A[workspace]
    S --> B[hermes]
    S --> D[mercado-pago-API]
    S --> F[telegram-zen-panel]
    S --> N[outros]
'''

MERMAID_PROOF = r'''flowchart TD
    M[Material / Claim] --> C[Classificar\nFato | Hipotese | Intent | Unknown]
    C --> O[Encontrar owner]
    O --> T0[Medir T0]
    T0 --> D[Menor delta causal]
    D --> TEST[Teste]
    TEST --> CP[Contraprova]
    CP --> T1[Remedir T1]
    T1 --> J{Reality}
    J -->|PASS| R[Receipt + Hash + Link + ID]
    J -->|FAIL| F[Corrigir causa]
    J -->|UNKNOWN| U[Preservar UNKNOWN]
    F --> TEST
    R --> GOLD[Registro do Ouro]
    GOLD --> NEXT[Next Cursor]
'''

DOCS = {
"00-MAPA-SISTEMA/00-LEIA-PRIMEIRO.md": """# CENTRALDARK — Arquitetura Total, com rastro

## Intencao

Este pacote organiza a arquitetura atual e a arquitetura candidata que nasceu da ideia de **HOME como porta local da Casa**. Ele nao cria uma CentralDark nova. Ele ensina como as pecas existentes se relacionam, como aprender com elas, como provar cada claim e como corrigir o proprio entendimento.

## Regra de leitura

1. Leia primeiro o mapa.
2. Separe `PROVED_IN_SOURCE`, `CANDIDATE`, `INTENT` e `UNKNOWN`.
3. Use o ledger em `05-PROVAS` antes de transformar texto em verdade.
4. Consulte `07-TESTE-CONTRA-SI` para ver onde o proprio pacote tentou se refutar.
5. Use `06-RASTRO` para hashes, IDs e links.

## Norte

- SEGREDO/CHEFE define intencao, destino e aceitacao humana.
- CentralDark e um nucleo logico unico.
- HOME e candidato a context router local, nao segundo cerebro.
- Vault/BRAIN e memoria/biblioteca; GraphRAG e recuperacao derivada.
- GitHub main e fonte canonica estrutural.
- Casa e VPS sao superficies de execucao do mesmo organismo.
- Kanban e lifecycle de trabalho; nao substitui a main.
- Reality decide claims tecnicos por evidencia do alvo correto.

## Frase-guia

> A Casa fica mais inteligente quando carrega somente a memoria relevante, usa o owner certo, testa o efeito e devolve um receipt que o proximo ciclo consegue reutilizar.
""",
"00-MAPA-SISTEMA/01-ARQUITETURA-GERAL.mmd": MERMAID_GENERAL,
"00-MAPA-SISTEMA/02-HOME-CASA-PROJETOS.mmd": MERMAID_HOME,
"00-MAPA-SISTEMA/03-PROVA-RASTRO.mmd": MERMAID_PROOF,
"00-MAPA-SISTEMA/04-MAPA-COMPONENTES.md": """# Mapa de componentes

| Peca | Funcao | Fonte/Owner | Nao e |
|---|---|---|---|
| SEGREDO/CHEFE | intencao, prioridade, destino, aceitacao humana | humano | modelo ou runtime |
| HOME | porta local e seletor de contexto por projeto | INTENT-001, candidato | segundo brain |
| CentralDark Core | convergencia de governanca, owners, ciclo e capacidades | MASTER-CYCLE + MAPA-DO-CEREBRO | outro app paralelo |
| docs/BRAIN | memoria navegavel e aprendizados | SECOND-BRAIN.yml | estado runtime |
| Vault Casa | superficie humana/privada da memoria | HERMES-CASA-OBSIDIAN-SYNC | GitHub inteiro |
| GraphRAG | recuperacao/indice | SECOND-BRAIN.yml | autoridade |
| SOL | coordenacao e reconciliacao | metodo operacional | judge da intencao humana |
| Hermes | execucao, continuidade e organizacao do conhecimento | metodo operacional | autoridade final |
| MetaLupa | falsificacao e teste de crenca | MASTER-CYCLE | agente soberano |
| Kanban | lifecycle/audit trail de tarefas | arquitetura Casa/VPS | fonte canonica estrutural |
| Screenpipe | sensor/percepcao local | SECOND-BRAIN.yml :3030 | memoria canonica |
| GARIMPO | materia candidata | #1444 | verdade automatica |
| GitHub main | forma canonica estrutural | SRC-001 | prova automatica de deploy |
| PR | bancada candidata | SRC-010 | main antes do merge |
| VPS | continuidade persistente | surface_sync | substituta da Casa |
| Reality/Receipt | efeito medido + rastro | metodo | narrativa |
""",
"01-CONCEITOS/00-PRINCIPIOS.md": """# Principios fundamentais

- `ONE_SYSTEM_ONLY=true`: uma Casa, muitas superficies.
- `REUSE_BEFORE_CREATE=true`: procurar owner e capacidade antes de criar.
- `ONE_WRITER_PER_SCOPE=true`: muitos leitores, uma caneta por ferida.
- `CURRENT > HISTORICAL`: passado ensina, presente governa claim atual.
- `UNKNOWN != PASS`: silencio nao vira verde.
- `DOCUMENTED != EXECUTED`: documento nao prova runtime.
- `ACTION != PROOF`: executar nao significa concluir.
- `MEMORY != REALITY`: memoria ajuda a procurar a realidade; nao a substitui.
- `GRAPH_IS_DERIVED_NOT_AUTHORITY=true`: grafo organiza relacoes; nao fabrica causalidade.
- `NO_V2_V3_PARALLEL_ESCAPE=true`: evolucao por extensao segura do owner existente.

## Como usar

Toda nova ideia deve responder: qual intencao? qual owner? qual prova atual? qual capacidade ja existe? qual menor delta? qual contraprova? qual receipt fica depois?
""",
"01-CONCEITOS/01-PAPEIS-E-AUTORIDADE.md": """# Papeis e autoridade

## SEGREDO/CHEFE
Define intencao, prioridade, escopo, destino e aceitacao humana. Nao precisa operar cada ferramenta.

## SOL
Coordena, reconcilia leituras, preserva o fio, identifica owner/writer e evita arquiteturas paralelas.

## PIVETE/HERMES
Executa, preserva continuidade, consulta biblioteca, organiza Obsidian e transforma resultado comprovado em aprendizado reutilizavel.

## REALIDADE
Julga claims tecnicos por efeito observavel no alvo correto. Ela nao julga o CHEFE; julga a afirmacao tecnica.

## MODELOS/PROVIDERS
Motores substituiveis. Claude, Codex, Nous, Grok, Zendrive ou outro motor nao viram identidade da Casa.
""",
"01-CONCEITOS/02-VERDADE-MEMORIA-PROVA.md": """# Verdade, memoria e prova

A CentralDark separa quatro coisas que sistemas normalmente misturam:

1. **Intencao**: o que o CHEFE quer atingir.
2. **Memoria**: o que foi aprendido e onde procurar.
3. **Estado atual**: o que esta acontecendo agora no Git/PR/runtime.
4. **Prova**: evidencia ligada ao mesmo alvo, HEAD, processo ou efeito.

Uma nota pode estar correta e o runtime ter mudado. Um screenshot pode provar uma manifestacao visivel e ainda nao provar o estado remoto final. Um commit pode estar na main e nao estar deployed. Por isso o pacote usa classes explicitas de claim.
""",
"01-CONCEITOS/03-HOME-CONTEXT-ROUTER.md": """# HOME como Context Router

**Status:** INTENT_CANDIDATE, ainda nao tratado como owner canonico da main.

A ideia e transformar `Home` na porta local da Casa. Em vez de cada projeto iniciar uma ilha cognitiva, HOME resolve a intencao atual e carrega somente o contexto necessario.

Fluxo desejado:

CHEFE -> HOME -> intencao -> consulta Vault/BRAIN -> receipts/owners -> projeto -> capacidade -> execucao -> prova -> aprendizado -> HOME.

## O que muda

- Trocar de projeto nao zera memoria.
- O projeto vira escopo, nao governo.
- O Vault e compartilhado como biblioteca do organismo.
- HOME nao guarda uma segunda verdade; ele roteia para owners existentes.

## Condicao para promover

Provar em runtime: selecao de projeto, consulta de memoria relevante, ausencia de segundo brain, rastro do owner escolhido e retorno de receipt.
""",
"01-CONCEITOS/04-ONE-CORE-MANY-ARMS.md": """# One Core, Many Arms

O ganho de capacidade vem de absorver funcoes, nao multiplicar governos.

- GitHub guarda a forma canonica.
- Obsidian/Vault torna a memoria visivel e navegavel.
- GraphRAG recupera contexto.
- Screenpipe percebe.
- MCP/API expoem capacidades.
- Kanban organiza o trabalho.
- Hermes executa.
- VPS preserva continuidade.
- Casa preserva proximidade com o CHEFE.

Todos devolvem evidencia para o mesmo nucleo. Se uma peca tenta virar segundo owner da mesma verdade, o desenho falhou.
""",
"02-APRENDIZADO/00-MEU-JEITO-DE-APRENDER.md": """# Meu jeito de aprender — retrato operacional

Este documento descreve um **modo de trabalho observado/codificado**, nao uma definicao pessoal imutavel.

O aprendizado funciona melhor quando a ideia aparece em varias representacoes do mesmo fato:

- linguagem humana direta;
- historia/metafora que ajuda a memorizar;
- desenho/diagrama para visualizar relacoes;
- termo tecnico exato;
- exemplo concreto;
- prova e rastro para conferir depois.

O objetivo nao e decorar resposta. E conseguir reconstruir o raciocinio usando mapa, owner, prova e proximo cursor.

## Loop de aprendizado

VER -> PERGUNTAR -> COMPARAR -> CONTRARIAR -> TESTAR -> VER O EFEITO -> EXPLICAR COM AS PROPRIAS PALAVRAS -> CRISTALIZAR -> REUTILIZAR.

Quando uma explicacao nao permite visualizar onde a coisa acontece, ela ainda nao terminou.
""",
"02-APRENDIZADO/01-MEU-JEITO-DE-PENSAR.md": """# Como aprimorar o pensamento

## 1. Transformar opiniao em claim
Em vez de 'acho que quebrou', escrever: `CLAIM: gate X falha no HEAD Y por causa Z`.

## 2. Procurar a melhor contraprova
Perguntar: 'que observacao faria esta ideia estar errada?'.

## 3. Separar passado de presente
Usar historia para formar hipotese, mas medir o alvo vivo antes de agir.

## 4. Comprimir sem perder causalidade
A cada volta, reduzir para: intencao, last-good-state, gap, owner, evidence, next cursor.

## 5. Preservar dead-ends uteis
Uma tentativa descartada ensina quando registra por que nao serve.

## 6. Parar no fixed point local
Pensar mais nao e progresso se nenhuma informacao nova esta entrando.

Esse metodo melhora a qualidade do pensamento porque obriga cada crença importante a ter alvo, teste, contradicao possivel e rastro.
""",
"02-APRENDIZADO/02-APRENDIZADO-CONTINUO.md": """# Aprendizado continuo

Aprender continuamente nao significa gravar tudo. Significa filtrar.

Material novo passa por: captura -> proveniencia -> dedupe -> classificacao -> owner -> prova -> contraprova -> promocao ou descarte.

Promover para regra apenas quando houver ganho reutilizavel. Repeticao pura reutiliza receipt. Hipotese fica marcada. Conteudo privado fica fora do Git. Runtime temporal exige nova medicao quando expira.
""",
"02-APRENDIZADO/03-REGISTRO-DO-OURO.md": """# Registro do Ouro

Um aprendizado forte deve responder:

- O que aconteceu?
- Qual era a hipotese?
- Qual falha foi nomeada?
- O que foi tentado e descartado?
- Qual foi a menor correcao?
- Qual teste passou?
- Qual contraprova sobreviveu?
- Onde esse aprendizado reaparece?
- Qual receipt/hash/link/ID prova a origem?

A regra de ouro e: procedimento comprovado, nao resposta solta.
""",
"03-COMUNICACAO/00-MEU-JEITO-DE-EXPLICAR.md": """# Meu jeito de explicar e conversar

A comunicacao deve preservar duas coisas ao mesmo tempo: proximidade humana e exatidao tecnica.

## Registro humano
Baianes facil, natural, direto, com humor e metafora quando ajuda. Nao imitar erro de digitacao nem forcar caricatura.

## Registro tecnico
Nome real do arquivo, path, HEAD, SHA, runtime, owner, gate e status literal.

## Regra de ouro
Se o termo tecnico esconde onde a coisa acontece, traduzir junto: runtime VPS = 'la na VPS onde roda'; mudanca de repo = 'no GitHub/repo'; teste local = 'ai em casa'.

Narrativa ensina. Prova confirma.
""",
"03-COMUNICACAO/01-BAIANES-BIBLICO-EGIPCIO.md": """# Baianes + Biblico + Egipcio + Escola + Tecnico

As camadas podem coexistir sem competir:

- **Baianes**: aproxima e traduz.
- **Biblico**: transforma sequencia em historia memoravel.
- **Egipcio**: cria imagem simbolica/mapa mental.
- **Resenha**: mantem atencao e vinculo.
- **Escola**: explica o conceito.
- **Tecnico**: ancora tudo em prova literal.

Ordem segura: fato tecnico -> narrativa -> traducao humana -> imagem simbolica -> ensinamento -> prova/receipt.

Se um gate esta vermelho, nenhuma metafora pode pinta-lo de verde.
""",
"03-COMUNICACAO/02-DUAL-REGISTER.md": """# Dual Register

Todo conceito material pode ter dois registros apontando para o mesmo alvo:

**Tecnico:** `VAULT_TOPOLOGY=DISCRIMINATING_TEST_REQUIRED`.

**Humano:** 'primeiro descubra qual cofre o Obsidian esta realmente abrindo; depois alinhe documento e script sem criar outro'.

A traducao nao pode mudar o alvo para facilitar a frase.
""",
"03-COMUNICACAO/03-VOCABULARIO-CASA.md": """# Vocabulario da Casa

- OWNER = dono certo daquela parte.
- WRITER = quem esta com a caneta naquele escopo.
- RUNTIME = lugar onde esta rodando de verdade.
- HEAD = ponto exato atual do codigo.
- PR = bancada candidata.
- UNKNOWN = ainda nao sabemos.
- FIXED POINT = terminou dentro do escopo declarado sem ganho informacional material pendente.
- ROLLBACK = caminho seguro para voltar.
- RECEIPT = rastro recuperavel daquilo que foi provado.
- DELTA UTIL = informacao nova que muda a melhor leitura/acao sem duplicar owner.
""",
"04-OPERACAO/00-COMO-USAR-CADA-PECA.md": """# Como utilizar cada peca

| Peca | Quando usar | Entrada | Saida esperada |
|---|---|---|---|
| HOME | inicio local de uma intencao/projeto | desejo + projeto possivel | contexto/owner selecionado |
| Vault/Obsidian | consultar/visualizar memoria | tema, projeto, claim | notas relevantes |
| docs/BRAIN | contexto duravel e navegacao | aprendizado/decisao | memoria canonica navegavel |
| GraphRAG | recuperar top-k | query/contexto | referencias relevantes |
| GitHub main | verificar forma canonica | repo/ref | HEAD/arquivo/owner atual |
| PR | trabalhar candidato | delta autorizado | diff/gates/review |
| Kanban | acompanhar lifecycle | tarefa material | estado/worker/handoff |
| Screenpipe | procurar percepcao local | tempo/app/contexto | evidencia sensorial candidata |
| GARIMPO | minerar ouro historico | HTML/TXT/log/imagem | delta candidato deduplicado |
| MCP/API | invocar capacidades | tool/route | efeito + receipt |
| Hermes | executar e organizar | missao + owner | acao/teste/aprendizado |
| SOL | reconciliar | leituras divergentes | uma leitura + writer correto |
| VPS | continuidade persistente | tarefa autorizada | runtime/health/receipt |
| MetaLupa | desafiar certeza | claim/prova | falsificador/contraprova |
""",
"04-OPERACAO/01-CICLO-CENTRALDARK.md": """# Ciclo CentralDark

`!CENTRALDARK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> !META_LUPA -> !RECONCILIAR -> !DELTAUTIL -> !CONTRAPROVA -> !REMEDICAO -> !FIXED_POINT -> !REGISTRA -> !BOOT`

## Como pensar cada fase

- ACORDAR: o que esta vivo agora?
- CALIBRAR: qual intencao, escopo e prova?
- MULTIBUSSOLA: que eixos materiais podem explicar?
- META_LUPA: como minha leitura pode estar errada?
- RECONCILIAR: o que ja existe e deve ser reutilizado?
- DELTA UTIL: o que realmente mudou?
- CONTRAPROVA: que teste independente/discriminante falta?
- REMEDICAO: menor mudanca T0 -> T1.
- FIXED POINT: ainda existe ganho material possivel?
- REGISTRA: receipt + aprendizado + next cursor.
- BOOT: como o proximo ciclo recupera tudo sem repetir?
""",
"04-OPERACAO/02-CASA-VPS-KANBAN.md": """# Casa + VPS + Kanban

Casa e VPS sao hosts do mesmo organismo, nao dois brains.

- Casa: proximidade, Desktop, Vault, garimpo, sensores, dev local.
- VPS: continuidade persistente, servicos, health, runners, execucao remota.
- GitHub main: forma canonica compartilhada.
- Boards Kanban: locais por host; nao compartilhar SQLite/PIDs entre maquinas.
- Handoff: task envelope + idempotency key + receipt.

A VPS nao apaga a Casa. A Casa nao precisa ficar ligada para toda tarefa persistente quando a VPS estiver comprovadamente capaz.
""",
"04-OPERACAO/03-VAULT-BRAIN-OBSIDIAN.md": """# Vault + BRAIN + Obsidian

O repo e a fonte da verdade do projeto. O Vault e a superficie viva da Casa.

Modelo documentado: `CASA-VAULT/00-CANONICO` espelha `docs/BRAIN`; memoria privada, inbox, anexos e conflitos ficam separados.

Regra importante: o estado fisico atual do Vault deve ser medido antes de sincronizar. Se documento e script divergirem, nao criar terceiro Vault. Fazer teste discriminante e reconciliar um modelo CURRENT.

Hermes organiza. O CHEFE consulta, navega e corrige intencao quando quiser, sem virar curador obrigatorio.
""",
"04-OPERACAO/04-HOME-PROJECT-ROUTER.md": """# HOME Project Router

## Objetivo
Fazer HOME comandar os projetos abaixo conforme a necessidade sem carregar todos ao mesmo tempo.

## Envelope de contexto sugerido

- mission_id
- human_intent
- active_project
- owner
- repo/path
- current_head
- relevant_notes
- relevant_receipts
- available_capabilities
- writer_scope
- evidence_refs
- next_cursor

## Politica
Carregar top-k memoria relevante; abrir arquivo inteiro somente quando necessario. Projeto e escopo. CentralDark continua sendo o nucleo.
""",
"04-OPERACAO/05-FAILOVER-E-CONTINUIDADE.md": """# Failover e continuidade

Se um modelo, reviewer ou host cai, a missao nao deve perder identidade.

Preservar: `MISSION_ID`, intencao, owner, last_good_state, receipts, writer lease, next cursor.

Motor muda != memoria zera. Host muda != missao recomeca. Fallback so e declarado quando houver rastro de que a rota alternativa realmente recebeu e processou a tarefa.
""",
"05-PROVAS/00-LEDGER-DE-PROVAS.md": """# Ledger de Provas

Cada prova source-backed deste pacote possui os quatro campos pedidos:

**TOPICO · HASH · LINK · ID**

O arquivo JSON ao lado e a versao mecanica. Claims de intencao humana ficam marcados como `INTENT_CANDIDATE` e nao sao promovidos a `PROVED` por falta de link externo.

| ID | Topico | Status | Hash | Link |
|---|---|---|---|---|
""" + "\n".join(f"| {s['id']} | {s['topic']} | {s['status']} | {s['hash']} | {s['link'] or 'INTENCAO DA SESSAO / SEM LINK EXTERNO'} |" for s in SOURCES),
"05-PROVAS/01-LEDGER-DE-PROVAS.json": json.dumps({"schema": "centraldark.proof-ledger.v1", "generated_at": CREATED_AT, "sources": SOURCES}, ensure_ascii=False, indent=2),
"05-PROVAS/02-FONTES-GITHUB.json": json.dumps({"repo": REPO, "main_sha": MAIN_SHA, "pr": {"number": PR_NUMBER, "head": PR_HEAD, "url": PR_URL}, "sources": [s for s in SOURCES if s["kind"].startswith("GITHUB")]}, ensure_ascii=False, indent=2),
"05-PROVAS/03-CLAIMS-E-CLASSIFICACAO.md": """# Claims e classificacao

- `PROVED`: fato medido diretamente do estado atual citado.
- `PROVED_IN_SOURCE`: contrato/decisao explicitamente presente no owner citado; runtime continua separado.
- `PROVED_RELEASE`: existencia e metadados de release.
- `CANDIDATE_NOT_MAIN`: candidato de PR ainda nao promovido.
- `INTENT_CANDIDATE`: intencao atual do CHEFE, ainda aguardando implementacao/prova.
- `UNKNOWN`: evidencia insuficiente.

Essa taxonomia impede que desejo, documento e runtime caiam no mesmo balde.
""",
"06-RASTRO/01-RASTRO.jsonl": "\n".join(json.dumps({"trace_id": f"TRACE-{i:04d}", "source_id": s["id"], "topic": s["topic"], "hash": s["hash"], "link": s["link"], "status": s["status"], "recorded_at": CREATED_AT}, ensure_ascii=False) for i, s in enumerate(SOURCES, 1)) + "\n",
"06-RASTRO/02-FONTE-POR-TOPICO.md": """# Fonte por topico

Use esta tabela para voltar da explicacao para a origem.

""" + "\n".join(f"## {s['topic']}\n- ID: `{s['id']}`\n- Status: `{s['status']}`\n- Hash: `{s['hash']}`\n- Link: {s['link'] or 'sem link externo; intencao humana atual'}\n- Claim: {s['claim']}\n" for s in SOURCES),
"07-TESTE-CONTRA-SI/00-AUTOAUDITORIA.md": """# Autoauditoria — testar o pacote contra ele mesmo

Este pacote nao assume que sua primeira versao esta correta. Ele aplica as proprias leis sobre si.

## Perguntas de ataque

1. Criamos segundo brain?
2. HOME foi promovido a canonico sem prova?
3. Algum estado runtime foi declarado por documento?
4. O PR #1444 foi confundido com main?
5. A arvore viola o teto de 10 irmaos por nivel?
6. Alguma prova source-backed ficou sem ID, topico, hash ou link?
7. Algum arquivo gerado ficou sem hash no manifesto?
8. A narrativa mascara UNKNOWN?
9. Criamos V2/V3/copia paralela para fugir de owner?
10. O PDF e as imagens existem e entram no rastro?

O script executa testes mecanicos para os itens verificaveis e registra o resultado em `validation-report.json`.
""",
"07-TESTE-CONTRA-SI/01-TESTES-DE-CONTRAPROVA.md": """# Testes de contraprova

## CP-01 — Home nao e fato canonico
Esperado: fonte `INTENT-001` permanece `INTENT_CANDIDATE`.

## CP-02 — Runtime nao nasce de YAML
Esperado: documentos que declaram `runtime_status: UNKNOWN...` nao sao convertidos para PASS.

## CP-03 — PR nao e main
Esperado: #1444 aparece como `CANDIDATE_NOT_MAIN`.

## CP-04 — Sem segundo cerebro
Esperado: nenhuma pasta `BRAIN-V2`, `NEW-BRAIN`, `BRAIN-COPY` e nenhum principio criando outro owner.

## CP-05 — Arvore semantica
Esperado: exatamente 10 pastas raiz `00..09` e no maximo 10 filhos por nivel.

## CP-06 — Prova rastreavel
Esperado: toda fonte de status PROVED* possui ID, topico, hash e link.
""",
"07-TESTE-CONTRA-SI/02-ERROS-ENCONTRADOS.md": """# Erros encontrados na primeira leitura e como foram corrigidos

## Erro 1 — tratar HOME como arquitetura ja provada
**Conserto:** HOME foi classificado como `INTENT_CANDIDATE`. O pacote descreve desenho e criterios de promocao sem inventar implementacao.

## Erro 2 — misturar memoria com realidade
**Conserto:** Vault/BRAIN/GraphRAG foram separados de Git/PR/runtime e cada claim recebe classe epistemica.

## Erro 3 — chamar #1444 de main
**Conserto:** main e PR possuem hashes separados; #1444 e candidato enquanto aberto.

## Erro 4 — achar que mais documentacao significa mais inteligencia
**Conserto:** HOME consulta top-k e owners; o sistema nao deve despejar a biblioteca inteira no contexto.

## Erro 5 — criar pacote sem rastro do proprio pacote
**Conserto:** manifesto, hashes SHA-256, ledger, trace JSONL, validation report e receipt entram no build.
""",
"07-TESTE-CONTRA-SI/03-CONSERTO-E-CONCLUSAO.md": """# Conserto e conclusao

A arquitetura que sobreviveu a contraprova e:

**um CHEFE, uma intencao por missao, um Core, um BRAIN logico, uma main canonica, um writer por escopo e muitas superficies/capacidades substituiveis.**

HOME pode ser a porta local/context router porque melhora continuidade sem precisar virar segundo brain. Sua promocao depende de prova de selecao de projeto, consulta de memoria relevante, owner correto e receipt.

O metodo de aprendizado nao busca pensar infinitamente. Ele busca reduzir incerteza ate fixed point, registrar o ouro e permitir que o proximo ciclo continue sem repetir a mesma prova.
""",
"09-PACOTE/01-INSTRUCOES-DE-USO.md": """# Instrucoes de uso

1. Abra `00-MAPA-SISTEMA/00-LEIA-PRIMEIRO.md`.
2. Veja os PNGs em `08-ARTEFATOS` ou o PDF completo.
3. Quando uma afirmacao importar, procure o ID em `05-PROVAS/01-LEDGER-DE-PROVAS.json`.
4. Confira hash e link em `06-RASTRO`.
5. Para ensinar o metodo, use `02-APRENDIZADO` + `03-COMUNICACAO`.
6. Para operar, use `04-OPERACAO`.
7. Antes de promover qualquer arquitetura, leia `07-TESTE-CONTRA-SI`.

Este pacote e um artefato de ensino e arquitetura. Ele nao prova deployment ou runtime por existir.
""",
"09-PACOTE/02-BUILD-INFO.json": json.dumps({"schema": BUILD_SCHEMA, "generated_at": CREATED_AT, "repo": REPO, "main_sha": MAIN_SHA, "pr_number": PR_NUMBER, "pr_head": PR_HEAD, "package": PACKAGE_NAME}, ensure_ascii=False, indent=2),
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_text(root: Path, rel: str, content: str) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.rstrip() + "\n", encoding="utf-8")


def font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size=size)
    return ImageFont.load_default()


def rounded_box(draw, xy, title, subtitle="", fill="#111827", outline="#D6A11D", title_color="#F4C542", subtitle_color="#D1D5DB", width=3):
    draw.rounded_rectangle(xy, radius=22, fill=fill, outline=outline, width=width)
    x1, y1, x2, y2 = xy
    tf = font(28, True)
    sf = font(18, False)
    title_wrapped = textwrap.wrap(title, width=24)
    y = y1 + 22
    for line in title_wrapped:
        draw.text(((x1+x2)//2, y), line, font=tf, fill=title_color, anchor="ma")
        y += 34
    if subtitle:
        for line in textwrap.wrap(subtitle, width=32):
            draw.text(((x1+x2)//2, y+4), line, font=sf, fill=subtitle_color, anchor="ma")
            y += 24


def arrow(draw, start, end, color="#55D6BE", width=5):
    draw.line([start, end], fill=color, width=width)
    import math
    ang = math.atan2(end[1]-start[1], end[0]-start[0])
    size = 16
    for delta in (2.6, -2.6):
        p = (end[0] + size * math.cos(ang + delta), end[1] + size * math.sin(ang + delta))
        draw.line([end, p], fill=color, width=width)


def draw_general(path: Path):
    img = Image.new("RGB", (1920, 1080), "#05070B")
    d = ImageDraw.Draw(img)
    d.text((960, 45), "CENTRALDARK — UMA CASA, UM CORE, MUITOS BRACOS", font=font(42, True), fill="#F4C542", anchor="ma")
    rounded_box(d, (760, 110, 1160, 215), "SEGREDO/CHEFE", "intencao + destino")
    rounded_box(d, (720, 275, 1200, 400), "HOME / CASA PATH", "porta local + context router", fill="#0B1720", outline="#55D6BE")
    rounded_box(d, (720, 455, 1200, 590), "CENTRALDARK CORE", "one core • many arms", fill="#111111", outline="#F4C542")
    arrow(d, (960,215), (960,275)); arrow(d, (960,400), (960,455))
    boxes = [
        ((100,670,420,805), "HUMAN FRONT", "Hub / Admin + API/MCP"),
        ((470,670,790,805), "BRAIN", "Vault + docs/BRAIN + GraphRAG"),
        ((840,670,1160,805), "KANBAN", "lifecycle + worker lanes"),
        ((1210,670,1530,805), "CASA", "Desktop + garimpo + sensores"),
        ((1580,670,1880,805), "VPS", "continuidade persistente"),
    ]
    for xy,t,s in boxes: rounded_box(d, xy, t, s, fill="#0C1118", outline="#9A7B32")
    for x in (260,630,1000,1370,1730): arrow(d,(960,590),(x,670),color="#A6E3D4",width=4)
    d.text((960, 870), "Receipts • Evidencia • Contraprova • Aprendizado retornam ao mesmo nucleo", font=font(26, True), fill="#55D6BE", anchor="ma")
    d.rounded_rectangle((180,930,1740,1015), radius=18, fill="#0B0F14", outline="#374151", width=2)
    d.text((960,972), "ONE_SYSTEM_ONLY  •  REUSE_BEFORE_CREATE  •  UNKNOWN != PASS  •  ONE_WRITER_PER_SCOPE", font=font(23, True), fill="#D1D5DB", anchor="mm")
    img.save(path)


def draw_home(path: Path):
    img = Image.new("RGB", (1920, 1080), "#06080D")
    d = ImageDraw.Draw(img)
    d.text((960, 45), "HOME — CONTEXT ROUTER DA CASA", font=font(44, True), fill="#F4C542", anchor="ma")
    rounded_box(d,(120,130,520,280),"SEGREDO/CHEFE","intencao em linguagem humana")
    rounded_box(d,(760,120,1160,290),"HOME","resolve projeto + memoria + capacidade",fill="#0B1720",outline="#55D6BE")
    arrow(d,(520,205),(760,205))
    projects=["workspace","hermes","mercado-pago-API","telegram-zen-panel","outros projetos"]
    y=360
    for i,p in enumerate(projects):
        rounded_box(d,(120,y+i*120,500,y+85+i*120),p,"PROJECT_IS_SCOPE",fill="#0C1118",outline="#6B7280")
        arrow(d,(500,y+42+i*120),(760,205),color="#5B718A",width=3)
    steps=[("VAULT/BRAIN","consulta top-k"),("RECEIPTS","nao repetir prova"),("OWNER","dono certo"),("CAPABILITY","braco necessario"),("EXECUCAO","Hermes/host"),("PROVA","teste + contraprova")]
    x=690; y=390
    for i,(t,s) in enumerate(steps):
        rounded_box(d,(x,y+i*105,1220,y+75+i*105),t,s,fill="#0D141B",outline="#9A7B32")
        if i==0: arrow(d,(960,290),(960,y),color="#55D6BE",width=4)
        else: arrow(d,(960,y+(i-1)*105+75),(960,y+i*105),color="#55D6BE",width=4)
    rounded_box(d,(1380,360,1830,690),"RETORNO AO HOME","receipt\nnext cursor\naprendizado\nlast-good-state",fill="#111111",outline="#F4C542")
    arrow(d,(1220,625),(1380,525),color="#F4C542",width=4)
    arrow(d,(1600,360),(1160,210),color="#F4C542",width=4)
    d.text((960, 1030), "Projeto muda != memoria zera • Motor muda != missao recomeca", font=font(25, True), fill="#D1D5DB", anchor="mm")
    img.save(path)


def draw_proof(path: Path):
    img = Image.new("RGB", (1920, 1080), "#05070A")
    d = ImageDraw.Draw(img)
    d.text((960, 45), "PROVA + RASTRO — DO CLAIM AO OURO", font=font(42, True), fill="#F4C542", anchor="ma")
    labels=[("CLAIM","fato / hipotese / intent / unknown"),("OWNER","onde a verdade deve morar"),("T0","estado antes"),("DELTA","menor mudanca causal"),("TESTE","efeito esperado"),("CONTRAPROVA","como posso estar errado?"),("T1","estado depois"),("RECEIPT","ID + topico + hash + link"),("OURO","aprendizado reutilizavel")]
    x1,x2=140,1780
    y=125
    for i,(t,s) in enumerate(labels):
        yy=y+i*96
        rounded_box(d,(x1,yy,x2,yy+68),t,s,fill="#0D1117",outline="#55D6BE" if i<7 else "#F4C542")
        if i>0: arrow(d,(960,yy-28),(960,yy),color="#6EE7C8",width=3)
    d.text((960, 1020), "Sem prova: UNKNOWN. Sem ganho novo: reuse receipt. Sem owner: nao crie paralelo.", font=font(24, True), fill="#D1D5DB", anchor="mm")
    img.save(path)


def register_pdf_fonts():
    regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    if Path(regular).exists() and Path(bold).exists():
        pdfmetrics.registerFont(TTFont("CDSans", regular))
        pdfmetrics.registerFont(TTFont("CDSansBold", bold))
        return "CDSans", "CDSansBold"
    return "Helvetica", "Helvetica-Bold"


def add_markdown(story, text, styles, mono_font):
    in_code=False; code=[]
    for raw in text.splitlines():
        line=raw.rstrip()
        if line.startswith("```"):
            if in_code:
                story.append(Preformatted("\n".join(code), styles["code"]))
                story.append(Spacer(1, 3*mm)); code=[]; in_code=False
            else:
                in_code=True
            continue
        if in_code:
            code.append(line); continue
        if not line:
            story.append(Spacer(1, 2.2*mm)); continue
        if line.startswith("# "):
            story.append(Paragraph(line[2:], styles["h1"])); continue
        if line.startswith("## "):
            story.append(Paragraph(line[3:], styles["h2"])); continue
        if line.startswith("### "):
            story.append(Paragraph(line[4:], styles["h3"])); continue
        if line.startswith("- "):
            story.append(Paragraph(line[2:], styles["bullet"], bulletText="•")); continue
        if line.startswith("> "):
            story.append(Paragraph(line[2:], styles["quote"])); continue
        if line.startswith("|"):
            story.append(Paragraph(line.replace("|","  "), styles["small"])); continue
        safe=line.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
        story.append(Paragraph(safe, styles["body"]))


def build_pdf(root: Path, pdf_path: Path):
    regular,bold=register_pdf_fonts()
    doc=SimpleDocTemplate(str(pdf_path), pagesize=A4, rightMargin=16*mm,leftMargin=16*mm,topMargin=15*mm,bottomMargin=15*mm)
    ss=getSampleStyleSheet()
    styles={
        "title": ParagraphStyle("title", parent=ss["Title"], fontName=bold, fontSize=25, leading=30, textColor=colors.HexColor("#B8860B"), alignment=TA_CENTER, spaceAfter=12),
        "subtitle": ParagraphStyle("subtitle", parent=ss["Normal"], fontName=regular, fontSize=10.5, leading=15, alignment=TA_CENTER, textColor=colors.HexColor("#4B5563"), spaceAfter=12),
        "h1": ParagraphStyle("h1", parent=ss["Heading1"], fontName=bold, fontSize=18, leading=22, textColor=colors.HexColor("#8B6508"), spaceBefore=7, spaceAfter=6),
        "h2": ParagraphStyle("h2", parent=ss["Heading2"], fontName=bold, fontSize=14, leading=18, textColor=colors.HexColor("#0F766E"), spaceBefore=5, spaceAfter=4),
        "h3": ParagraphStyle("h3", parent=ss["Heading3"], fontName=bold, fontSize=11.5, leading=15, spaceBefore=4, spaceAfter=3),
        "body": ParagraphStyle("body", parent=ss["BodyText"], fontName=regular, fontSize=9.6, leading=14),
        "bullet": ParagraphStyle("bullet", parent=ss["BodyText"], fontName=regular, fontSize=9.4, leading=13.5, leftIndent=12, firstLineIndent=-6),
        "quote": ParagraphStyle("quote", parent=ss["BodyText"], fontName=regular, fontSize=9.4, leading=13.5, leftIndent=12, textColor=colors.HexColor("#374151")),
        "small": ParagraphStyle("small", parent=ss["BodyText"], fontName=regular, fontSize=7.5, leading=10),
        "code": ParagraphStyle("code", parent=ss["Code"], fontName="Courier", fontSize=7.4, leading=9.2, backColor=colors.HexColor("#F3F4F6"), borderPadding=5),
    }
    story=[Paragraph("CENTRALDARK — ARQUITETURA TOTAL", styles["title"]), Paragraph("Uma Casa • Um Core • Um BRAIN logico • Muitos bracos • Prova com rastro", styles["subtitle"])]
    for img in [root/"08-ARTEFATOS/00-ARQUITETURA-GERAL.png", root/"08-ARTEFATOS/01-HOME-CONTEXT-ROUTER.png", root/"08-ARTEFATOS/02-CICLO-PROVA-RASTRO.png"]:
        story.append(RLImage(str(img), width=175*mm, height=98.4*mm)); story.append(Spacer(1,4*mm))
    story.append(PageBreak())
    selected=[
        "00-MAPA-SISTEMA/00-LEIA-PRIMEIRO.md",
        "01-CONCEITOS/00-PRINCIPIOS.md",
        "01-CONCEITOS/01-PAPEIS-E-AUTORIDADE.md",
        "01-CONCEITOS/02-VERDADE-MEMORIA-PROVA.md",
        "01-CONCEITOS/03-HOME-CONTEXT-ROUTER.md",
        "02-APRENDIZADO/00-MEU-JEITO-DE-APRENDER.md",
        "02-APRENDIZADO/01-MEU-JEITO-DE-PENSAR.md",
        "02-APRENDIZADO/03-REGISTRO-DO-OURO.md",
        "03-COMUNICACAO/00-MEU-JEITO-DE-EXPLICAR.md",
        "03-COMUNICACAO/01-BAIANES-BIBLICO-EGIPCIO.md",
        "04-OPERACAO/00-COMO-USAR-CADA-PECA.md",
        "04-OPERACAO/01-CICLO-CENTRALDARK.md",
        "04-OPERACAO/02-CASA-VPS-KANBAN.md",
        "04-OPERACAO/03-VAULT-BRAIN-OBSIDIAN.md",
        "04-OPERACAO/04-HOME-PROJECT-ROUTER.md",
        "05-PROVAS/00-LEDGER-DE-PROVAS.md",
        "07-TESTE-CONTRA-SI/00-AUTOAUDITORIA.md",
        "07-TESTE-CONTRA-SI/02-ERROS-ENCONTRADOS.md",
        "07-TESTE-CONTRA-SI/03-CONSERTO-E-CONCLUSAO.md",
    ]
    for idx,rel in enumerate(selected):
        add_markdown(story,(root/rel).read_text(encoding="utf-8"),styles,regular)
        if idx not in (len(selected)-1,): story.append(PageBreak())
    doc.build(story)


def validate(root: Path):
    tests=[]
    root_children=[p for p in root.iterdir() if p.is_dir()]
    tests.append(("ROOT_HAS_EXACT_10_NUMBERED_DIRS", len(root_children)==10 and sorted(p.name[:2] for p in root_children)==[f"{i:02d}" for i in range(10)], str([p.name for p in root_children])))
    max_ok=True; offenders=[]
    for d in [root]+[p for p in root.rglob("*") if p.is_dir()]:
        children=list(d.iterdir())
        if len(children)>10:
            max_ok=False; offenders.append(f"{d.relative_to(root)}={len(children)}")
    tests.append(("MAX_10_SIBLINGS_PER_LEVEL", max_ok, ",".join(offenders) or "PASS"))
    proof_ok=True; proof_errors=[]
    for s in SOURCES:
        if s["status"].startswith("PROVED"):
            for k in ("id","topic","hash","link"):
                if not s.get(k): proof_ok=False; proof_errors.append(f"{s['id']} missing {k}")
    tests.append(("PROVED_SOURCES_HAVE_ID_TOPIC_HASH_LINK", proof_ok, "; ".join(proof_errors) or "PASS"))
    intent=next(s for s in SOURCES if s["id"]=="INTENT-001")
    tests.append(("HOME_REMAINS_INTENT_CANDIDATE", intent["status"]=="INTENT_CANDIDATE", intent["status"]))
    pr=next(s for s in SOURCES if s["id"]=="SRC-010")
    tests.append(("PR1444_NOT_PROMOTED_TO_MAIN", pr["status"]=="CANDIDATE_NOT_MAIN", pr["status"]))
    second=next(s for s in SOURCES if s["id"]=="SRC-002")
    tests.append(("MEMORY_REALITY_SEPARATION_PRESENT", "MEMORY != REALITY" in second["claim"], second["claim"]))
    forbidden=[]
    for p in root.rglob("*"):
        if re.search(r"(^|[-_/])(v2|v3|copy|backup)([-_/]|$)", p.as_posix(), re.I): forbidden.append(p.as_posix())
    tests.append(("NO_PARALLEL_V2_V3_COPY_BACKUP_PATHS", not forbidden, ",".join(forbidden) or "PASS"))
    required=[root/"08-ARTEFATOS/00-ARQUITETURA-GERAL.png",root/"08-ARTEFATOS/01-HOME-CONTEXT-ROUTER.png",root/"08-ARTEFATOS/02-CICLO-PROVA-RASTRO.png",root/"08-ARTEFATOS/03-CENTRALDARK-ARQUITETURA-TOTAL.pdf"]
    tests.append(("PDF_AND_IMAGES_EXIST", all(p.exists() and p.stat().st_size>1000 for p in required), str([(p.name,p.stat().st_size if p.exists() else 0) for p in required])))
    return [{"id":f"TEST-{i:02d}","name":n,"pass":ok,"evidence":ev} for i,(n,ok,ev) in enumerate(tests,1)]


def build(out_dir: Path):
    dist=out_dir.resolve(); dist.mkdir(parents=True,exist_ok=True)
    root=dist/PACKAGE_NAME
    if root.exists(): shutil.rmtree(root)
    for i,name in enumerate(["MAPA-SISTEMA","CONCEITOS","APRENDIZADO","COMUNICACAO","OPERACAO","PROVAS","RASTRO","TESTE-CONTRA-SI","ARTEFATOS","PACOTE"]):
        (root/f"{i:02d}-{name}").mkdir(parents=True,exist_ok=True)
    for rel,content in DOCS.items(): write_text(root,rel,content)
    draw_general(root/"08-ARTEFATOS/00-ARQUITETURA-GERAL.png")
    draw_home(root/"08-ARTEFATOS/01-HOME-CONTEXT-ROUTER.png")
    draw_proof(root/"08-ARTEFATOS/02-CICLO-PROVA-RASTRO.png")
    build_pdf(root,root/"08-ARTEFATOS/03-CENTRALDARK-ARQUITETURA-TOTAL.pdf")

    tests=validate(root)
    validation={"schema":"centraldark.package.validation.v1","generated_at":CREATED_AT,"tests":tests,"passed":all(t["pass"] for t in tests)}
    write_text(root,"07-TESTE-CONTRA-SI/04-validation-report.json",json.dumps(validation,ensure_ascii=False,indent=2))

    pre_manifest=[]
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.relative_to(root).as_posix() not in {"06-RASTRO/00-MANIFESTO-DO-PACOTE.json","06-RASTRO/03-HASHES.sha256","09-PACOTE/00-RECEIPT.json"}:
            pre_manifest.append({"path":p.relative_to(root).as_posix(),"bytes":p.stat().st_size,"sha256":sha256_file(p)})
    manifest={"schema":"centraldark.package.manifest.v1","package":PACKAGE_NAME,"generated_at":CREATED_AT,"repo":REPO,"main_sha":MAIN_SHA,"pr":{"number":PR_NUMBER,"head":PR_HEAD,"url":PR_URL},"source_count":len(SOURCES),"files":pre_manifest}
    write_text(root,"06-RASTRO/00-MANIFESTO-DO-PACOTE.json",json.dumps(manifest,ensure_ascii=False,indent=2))
    receipt={"schema":"centraldark.package.receipt.v1","package":PACKAGE_NAME,"generated_at":CREATED_AT,"main_sha":MAIN_SHA,"pr_head":PR_HEAD,"self_test_pass":validation["passed"],"manifest_sha256":sha256_file(root/"06-RASTRO/00-MANIFESTO-DO-PACOTE.json"),"note":"ZIP hash e externo para evitar recursao do proprio arquivo."}
    write_text(root,"09-PACOTE/00-RECEIPT.json",json.dumps(receipt,ensure_ascii=False,indent=2))

    hash_lines=[]
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.relative_to(root).as_posix()!="06-RASTRO/03-HASHES.sha256":
            hash_lines.append(f"{sha256_file(p)}  {p.relative_to(root).as_posix()}")
    write_text(root,"06-RASTRO/03-HASHES.sha256","\n".join(hash_lines))

    zip_path=dist/f"{PACKAGE_NAME}.zip"
    if zip_path.exists(): zip_path.unlink()
    with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(root.rglob("*")):
            if p.is_file(): z.write(p,Path(PACKAGE_NAME)/p.relative_to(root))
    zip_hash=sha256_file(zip_path)
    (dist/f"{PACKAGE_NAME}.zip.sha256").write_text(f"{zip_hash}  {zip_path.name}\n",encoding="utf-8")
    shutil.copy2(root/"08-ARTEFATOS/03-CENTRALDARK-ARQUITETURA-TOTAL.pdf",dist/f"{PACKAGE_NAME}.pdf")
    summary={"package":PACKAGE_NAME,"zip":zip_path.name,"zip_sha256":zip_hash,"pdf":f"{PACKAGE_NAME}.pdf","self_test_pass":validation["passed"],"file_count":sum(1 for p in root.rglob("*") if p.is_file()),"generated_at":CREATED_AT}
    (dist/f"{PACKAGE_NAME}.build.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    if not validation["passed"]: raise SystemExit("Self-test failed")


if __name__ == "__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="dist/centraldark-architecture")
    args=ap.parse_args()
    build(Path(args.out))
