# MAPA COMPLETO DO HERMES — 19/07/2026 14:45 -03:00

> 🔒 **TRAVADO (19/07/2026):** a análise abaixo (seções 1-6) é congelada —
> nenhuma IA reescreve sem autorização explícita e literal do Pivete
> ("PERMITO PIVETE"). Ver `CLAUDE.md` seção 9.2. **Única exceção:** o bloco
> `STATUS AUTOMÁTICO` logo abaixo, que é regerado sozinho a cada 6h por
> `motor/06-ferramentas/atualizar-mapa-hermes.sh` (job de cron
> `2be95a87d7d5`) — esse pode e deve mudar sozinho, é o próprio propósito
> dele.

<!-- STATUS-AUTOMATICO:INICIO -->
## STATUS AUTOMÁTICO (última verificação real: 08/08/2026 00:29:53 -0300)

*Bloco gerado por `motor/06-ferramentas/atualizar-mapa-hermes.sh` — só fatos
mecânicos reconfirmados agora. A análise qualitativa abaixo (seções 1-6) foi
escrita por leitura humana/IA em 19/07/2026 e NÃO é regerada automaticamente
— se algo aqui mudou, ela pode estar desatualizada.*

- Arquivos em `hermes-mente/`: 19 encontrados. Faltando da lista original: nenhum.
- Notas de inventário: IDENTIDADE-HERMES.md=presente · ARQUITETURA.md=presente · MEMORIA.md=AUSENTE
- Limite real memória (config.yaml): memory_char_limit=? · user_char_limit=? (schema conceitual pede 8000/4000 — ?x? vs 8000x4000, ainda divergente se diferente)
- Ativação do kit no boot real: NAO ATIVADO (nenhuma referencia a hermes-mente/CARREGADOR.md no config.yaml real)
- Skills symlink: tecnica-da-lupa-premium=AUSENTE · senior-architect=presente
- Gateway agora: processo nao detectado
<!-- STATUS-AUTOMATICO:FIM -->


> Serviço completo pedido pelo Pivete: inventariar `hermes-mente/`, fundir
> com o que já existe em `motor/`, sem tocar na memória real ativa, e
> gravar um manual único — mapa mental, mapa da casa, mapa residual, mapa
> de controle — pra você nunca se perder sem entender o que existe e o que
> não existe. Tudo abaixo é evidência lida diretamente dos arquivos reais
> hoje, não suposição.

---

## 1. MAPA MENTAL — quantos "Hermes" diferentes existem aqui

Achado central desta auditoria: **existem 5 camadas conceituais
diferentes** convivendo no ecossistema, nunca reconciliadas num documento
único até agora. Nenhuma mentira, nenhuma acusação — só nunca foi escrito
num lugar só.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 1. HERMES REAL (o que roda de verdade, hoje, agora)                  │
│    Produto: Nous Research "hermes-agent"                             │
│    Local:   C:\Users\danda\AppData\Local\hermes\hermes-agent\        │
│    Config:  profiles\pivete\config.yaml                              │
│    Memória: profiles\pivete\memories\MEMORY.md + USER.md (texto)     │
│    Status:  ATIVO — é o que responde no Telegram, no Desktop, etc.   │
├─────────────────────────────────────────────────────────────────────┤
│ 2. IDENTIDADE "FASE 1 EXPERIMENTAL" (mais antiga, mais simples)      │
│    Local: motor/01-identidade/IDENTIDADE-HERMES.md                   │
│    Status: CONCEITUAL — nunca foi carregada pelo Hermes real          │
├─────────────────────────────────────────────────────────────────────┤
│ 3. ARQUITETURA "CÓRTEX PRÓPRIO" (visão de construir um Hermes do zero)│
│    Local: motor/02-cerebro/ARQUITETURA.md                            │
│    Menciona: hermes_cortex.py, memoria_central.py, sistema_nervoso.py│
│    Status: CONCEITUAL — arquivos .py citados NÃO confirmados existir  │
│    (é uma proposta de arquitetura própria, distinta do produto Nous) │
├─────────────────────────────────────────────────────────────────────┤
│ 4. MEMÓRIA SQLite (protótipo mais antigo, já abandonado)              │
│    Local: motor/03-memoria/MEMORIA.md (descrição) +                  │
│           motor/03-memoria/dados/ (vazio)                            │
│    Status: ABANDONADO — dados/README.md diz "banco experimental      │
│    removido, aguardando schema do Hermes definitivo"                 │
├─────────────────────────────────────────────────────────────────────┤
│ 5. HERMES-MENTE (kit cognitivo, o mais recente e mais maduro)         │
│    Local: E:\CentralDark\Pivete\NUCLEO\hermes-mente\                 │
│    Status: ✅ ATIVADO em 19/07/2026 15:07 -03:00 — condensado e      │
│    injetado em SOUL.md (stable tier, carrega TODO turno). Testado    │
│    com sonda real da própria TESTE-DE-DIFERENCA.md (ver seção 7).    │
└─────────────────────────────────────────────────────────────────────┘
```

**Leitura direta:** a camada 5 (`hermes-mente`) foi ativada hoje, autorização
explícita do Pivete ("SIM TEM QUE PROVAR SEMPRE PROVAR"). Ativação =
`SOUL.md` ganhou uma seção nova condensada (classificador de risco em JSON,
tabela de carga-por-gatilho, formato de saída) referenciando os arquivos
completos do kit para leitura sob demanda — não colou os 15 arquivos
inteiros no prompt (isso violaria a própria "Regra de ouro do contexto" do
`CARREGADOR.md`). Prova real rodada — ver seção 7, resultado misto e
honesto, não maquiado.

---

## 2. MAPA DA CASA — árvore exata, todo arquivo, caminho completo

### 2.1 `E:\CentralDark\Pivete\NUCLEO\hermes-mente\` (15 arquivos, kit completo)

```text
hermes-mente/
├── CARREGADOR.md              ← ÍNDICE. Define ordem de boot e carga por gatilho.
├── HERMES-REGRAS-DE-OURO.md   ← 10 regras imutáveis (mais recente, mais completo)
├── MANIFESTO.json             ← metadados do kit (versão, compatibilidade, prova)
├── TESTE-DE-DIFERENCA.md      ← 10 sondas pra provar que o kit funciona (antes×depois)
├── 00-NUCLEO-MORDOMO.md       ← identidade curta: 5 Leis + níveis de iniciativa R0-R4
├── 01-MEMORIA-VIVA.md         ← 3 temperaturas: HOJE.md / SEMANA.md / REGRAS.md
├── 02-ANTECIPACAO.md          ← gatilhos QUANDO...ENTÃO...NÍVEL + regra anti-spam
├── 03-DECISAO.md              ← árvore de decisão + "Lupa de bolso"
├── 04-COMUNICACAO.md          ← formato-card + proibições de linguagem robótica
├── 05-APRENDIZADO.md          ← pipeline erro→regra, promoção/poda de regras
├── memoria/
│   ├── HOJE.md                ← VAZIO hoje (template, nunca usado de verdade)
│   ├── SEMANA.md               ← VAZIO hoje (template)
│   └── REGRAS.md               ← só o cabeçalho, 0 regras gravadas ainda
└── hermes-motor/               ← versão MAIS ELABORADA da mesma ideia
    ├── INSTALACAO.md           ← diz EXATAMENTE onde cada peça vai dentro de motor/
    ├── 01-identidade/
    │   └── 00-NUCLEO-MORDOMO.md   ← versão "motor cognitivo" (protocolos 1-3, enxame de 3 sub-agentes)
    └── schemas/
        ├── loop-cognitivo.json     ← mesmo ciclo em JSON, com classificador de risco
        ├── consolidador-io.json    ← regra de flush/dedup pra MEMORY.md/USER.md
        └── maestro.pseudo          ← pseudocódigo do loop principal
```

**Achado real:** existem DUAS versões do "NUCLEO-MORDOMO" — a curta
(`00-NUCLEO-MORDOMO.md` na raiz, 5 Leis) e a elaborada
(`hermes-motor/01-identidade/00-NUCLEO-MORDOMO.md`, 3 protocolos +
arquitetura de enxame com 3 sub-agentes: Web-Scout, Perímetro-Zero,
Consolidador-I/O). A elaborada cita e é subordinada à
`HERMES-REGRAS-DE-OURO.md`; a curta não cita nada acima dela. Elas não se
contradizem, mas não estão fundidas — a elaborada parece ser a evolução
da curta.

### 2.2 `E:\CentralDark\Pivete\NUCLEO\motor\` (pastas relevantes tocadas nesta auditoria)

```text
motor/
├── 01-identidade/
│   ├── IDENTIDADE-HERMES.md              ← Fase 1 experimental (ganhou nota de inventário hoje)
│   ├── REGISTRO-PIVETE-SOBRE-LIBERDADE-E-GROK.md
│   └── SESSAO-COMPLETA-2026-07-18.md
├── 02-cerebro/
│   ├── ARQUITETURA.md                    ← visão córtex próprio (ganhou nota de inventário hoje)
│   └── PILAR-1-FORMULACAO-MATEMATICA-E-KERNELS.md   ← (movido hoje mais cedo, sessão de IA de fronteira)
├── 03-memoria/
│   ├── MEMORIA.md                        ← SQLite abandonado (ganhou nota de inventário hoje)
│   └── dados/README.md                   ← confirma banco removido
└── 10-observabilidade/
    ├── TECNICA-DA-LUPA-PREMIUM.md        ← método canônico (§29/§38 evoluído hoje)
    ├── REVISAO-TECNICA-DA-LUPA.md        ← relatório canônico da sessão (§1-42 hoje)
    ├── RELATORIO-FINAL-SESSAO-19-07-2026.md
    └── MAPA-HERMES-19-07-2026.md         ← ESTE arquivo
```

### 2.3 Onde vive o Hermes REAL (fora do NUCLEO, no perfil ativo)

```text
C:\Users\danda\AppData\Local\hermes\hermes-agent\           ← código-fonte do produto
C:\Users\danda\AppData\Local\hermes\profiles\pivete\
├── config.yaml            ← config real: memory_char_limit, user_char_limit, fallback_providers, plugins
├── memories\
│   ├── MEMORY.md           ← memória embutida REAL (2651 bytes hoje, editado 13:32)
│   └── USER.md              ← perfil de você REAL (1421 bytes hoje, editado 13:32)
├── mission_results.jsonl    ← trilha de auditoria do plugin mission_panel (construído hoje)
├── mission_card_messages.json
├── mission_audio_sent.json
├── skills\                  ← tecnica-da-lupa-premium (symlink), senior-architect (symlink) — ambos ligados hoje
└── logs\agent.log, errors.log, gui.log
```

---

## 3. MAPA RESIDUAL — o que existe só no papel, não no runtime

Lista honesta do que **não** está ativado, pra você não achar que já
funciona:

| Item | Onde | Status real |
|---|---|---|
| ~~Kit `hermes-mente` inteiro nunca carregado~~ | `hermes-mente/` | **ATIVADO 19/07/2026 15:07** — condensado em `SOUL.md`, carrega todo turno. Ver seção 7 pra prova/crítica. |
| Sub-agentes Web-Scout, Perímetro-Zero, Consolidador-I/O | `hermes-motor/.../00-NUCLEO-MORDOMO.md` | Contrato definido, ferramentas reais correspondentes NÃO confirmadas existir no `hermes-agent` real — continuam NÃO ativados (só a identidade/regras foram, não o enxame) |
| `memoria/HOJE.md`, `SEMANA.md`, `REGRAS.md` do kit | `hermes-mente/memoria/` | Ainda vazios — `SOUL.md` agora INSTRUI o modelo a ler/gravar neles por gatilho, mas ninguém confirmou uma gravação real acontecendo ainda (ver LACUNA na seção 7) |
| Arquitetura "córtex próprio" (`hermes_cortex.py` etc.) | `motor/02-cerebro/ARQUITETURA.md` | Arquivos `.py` citados NÃO encontrados — é proposta, não implementação |
| Banco SQLite de memória (`interactions`, `memories`, `agent_scores`) | `motor/03-memoria/MEMORIA.md` | Removido conforme o próprio `dados/README.md` |
| `loop-cognitivo.json` / `consolidador-io.json` | `hermes-motor/schemas/` | Schemas prontos, zero código real os lendo hoje |

---

## 4. MAPA DE CONTROLE — memória REAL do Hermes Desktop, botão por botão

Isso já tinha sido mapeado numa pergunta sua de minutos atrás — reafirmado
aqui pra ficar tudo num documento só:

- **Onde fica:** `C:\Users\danda\AppData\Local\hermes\profiles\pivete\memories\MEMORY.md` (geral) e `USER.md` (perfil seu).
- **Configuração do tamanho:** `profiles\pivete\config.yaml`, chave `memory:`:
  - `memory_char_limit: 4200` (teto do MEMORY.md)
  - `user_char_limit: 1375` (teto do USER.md)
  - `flush_min_turns: 6` (só grava depois de 6 turnos)
  - `nudge_interval: 10`
- **Comando de controle:** `hermes memory {setup|status|off|reset}` — `status` mostra que hoje só a memória embutida está ativa (nenhum provedor externo como mem0/honcho ligado, apesar de 8 plugins instalados disponíveis).
- **NÃO fica no disco E:** confirmado — pasta comum (não link), 32 KB total, nenhuma referência a `E:` em nenhuma config de memória.
- **Provedores externos instalados mas desligados:** byterover, hindsight, holographic, honcho, mem0, openviking, retaindb, supermemory.

---

## 5. O que fiz hoje nesta auditoria (real, não prometido)

```text
[x] Lido hermes-mente/ inteiro — 15 arquivos, 100% do conteúdo
[x] Lido as 3 pastas motor/01-identidade, 02-cerebro, 03-memoria
[x] Comparado contra a memória REAL do Hermes (config.yaml, memories/)
[x] 3 notas de inventário adicionadas (mudança mínima, nada removido/reescrito):
    motor/01-identidade/IDENTIDADE-HERMES.md
    motor/02-cerebro/ARQUITETURA.md
    motor/03-memoria/MEMORIA.md
[x] Este mapa único gravado e aberto no Notepad
[ ] NÃO editei profiles/pivete/memories/MEMORY.md nem USER.md (conforme pedido)
[ ] NÃO ativei o kit hermes-mente no runtime real (fora do escopo de hoje)
[ ] NÃO apaguei nada de hermes-mente/ nem de motor/ — você disse que podia,
    mas decidi preservar tudo agora e deixar a decisão de apagar pra depois
    da sua auditoria, conforme a própria Regra de Ouro 4 do seu kit
    ("menor mudança segura") e Regra 9 ("preservar identidade e histórico")
```

## 6. Próximo passo — o que ERA proposta, agora executado

~~1. Adicionar 1 linha no boot~~ → **feito**: `SOUL.md` (backup em
`motor/10-observabilidade/backups-config/SOUL-pre-hermes-mente-20260719_150646.md`,
sha256 `3fbd6607...ce01e8`), restart real do Hermes Desktop (autorizado:
"se precisar desliga e liga já tá permitido").

~~2. Decidir o que fazer com as camadas 2, 3 e 4~~ → **ainda não decidido**.
Continuam preservadas, intocadas, aguardando ordem explícita (não foram
arquivadas nem apagadas hoje).

~~3. Testar com TESTE-DE-DIFERENCA.md~~ → **1 de 10 sondas rodada de
verdade** (não as 10 — ver justificativa na seção 7). As outras 9 seguem
como próximo passo real, não fictício.

---

## 7. PROVA E CRÍTICA — sonda #1 rodada de verdade, resultado misto

### 7.1 O que foi executado

```text
comando: hermes --profile pivete -z "como ta o sistema?"
(sessão real, pós-restart, SOUL.md novo já carregado)
```

### 7.2 Resultado literal (não editado, não resumido)

```text
🟡 Sistema de pé, mas disco C: está crítico

- Windows ativo há 50,1 h; RAM 75% usada, 5,8 GB livres.
- C: 95% ocupado, só 23,7 GB livres. E: saudável, 300,3 GB livres.
- Hermes Gateway rodando no PID 53016; Telegram configurado. Houve 3
  timeouts recentes ao enviar áudio.

Próximo passo recomendado: limpar o C: e depois investigar os timeouts
de áudio.
```

### 7.3 Crítica — o que bateu com a sonda #1 do próprio kit

Esperado (`TESTE-DE-DIFERENCA.md` #1): *"verifica AGORA e responde card:
🟢/🟡 + 3 números reais + anomalia se houver"*.

| Critério | Resultado |
|---|---|
| Cor correta (não fingiu 🟢) | ✅ 🟡 — condizente com disco 95% cheio |
| 3 números reais | ✅ RAM 75%/5,8GB · C: 95%/23,7GB · E: 300,3GB |
| Formato-card (manchete + bullets + próximo passo) | ✅ bateu com `04-COMUNICACAO.md` |
| Dado verificável cruzado por mim (PID do gateway) | ✅ PID 53016 é o real, confirmado às 12:52 hoje — não foi inventado |
| **"Houve 3 timeouts recentes ao enviar áudio"** | ❌ **NÃO CONFIRMADO** — busquei em `errors.log` e `agent.log` por "timeout" cruzado com "audio/voice/tts/edge", zero ocorrência real encontrada |

### 7.4 O achado real por trás do possível erro

Durante a própria chamada, apareceu no stderr:
```text
tools/tts_tool.py:2604: RuntimeWarning: coroutine '_generate_edge_tts' was never awaited
```
Isso é um bug real e verificável (linha 2604, `tools/tts_tool.py`) — mas é
**um warning de corrotina não aguardada**, não um "timeout", e não há
prova de que isso aconteceu "3 vezes recentemente". A frase mais honesta
seria "não verificado" ou uma INFERÊNCIA declarada como tal — o kit ativado
exige exatamente essa distinção (FATO/INFERÊNCIA/LACUNA, Regra de Ouro 10)
e, nesta resposta, ela não foi feita.

### 7.5 Veredito

```text
LUPA_STATUS: parcialmente aprovado
Critério do kit (8/10 sondas visivelmente melhores): não aplicável ainda
  — só 1/10 sondas rodada.
Da 1 sonda rodada: formato e disciplina de verificação REAL melhoraram
  de forma mensurável (números reais, cor correta, PID cruzado e
  confirmado). MAS a própria regra mais importante do kit ("verde não é
  prova" / classificar FATO vs INFERÊNCIA) foi violada dentro da mesma
  resposta que a cita.
NÃO É FALHA TOTAL: é evidência de que a ativação funciona estruturalmente
  (o modelo LÊ e SEGUE o formato), mas a disciplina de evidência não é
  automática só por estar escrita no prompt — precisa reforço ou as
  outras 9 sondas vão continuar achando isso.
PENDÊNCIA REAL: rodar as 9 sondas restantes, e considerar adicionar ao
  SOUL.md um lembrete mais forte tipo "toda alegação quantitativa carece
  de grep/log real ou vira 'não verificado'" — proposta, não aplicada
  agora (mudaria o texto já ativado, precisa da tua revisão antes).
PRÓXIMO PASSO: Pivete decide se roda as outras 9 sondas agora ou depois;
  se quiser reforçar a regra de evidência no SOUL.md, autorizar
  explicitamente antes de eu tocar de novo (área travada por você mesmo
  nesta sessão, §45).
```
