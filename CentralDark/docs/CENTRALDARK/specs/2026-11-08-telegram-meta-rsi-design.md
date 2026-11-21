# Design — Boot Telegram + META-RSI 40/40

**Status:** DESIGN PARA REVISÃO DO CHEFE
**Classificação Kimetsu:** ARCHITECTURAL
**Respirações:** 1 Concentração, 2 Sol, 3 Lua, 8 Pedra, 9 Flor, 10 Inseto, 12 Amor, 13 Som, 16 Regeneração Monotônica, 17 Fixed Point
**Método:** Michelin 3 Estrelas
**Owner:** `.agents/skills/centraldark-operational-method/Skills/meta-rsi/SKILL.md`
**Interface existente:** `apps/bot-telegram/unified-bot.cjs`

## Intenção

Usar o boot e os menus existentes do Telegram como interface operacional do META-RSI 40/40, preservando as conexões atuais, o motor Hermes, o Telegram do gateway atual, A2A, memória, skills e owners.

## Não objetivo

- Não criar outro bot.
- Não criar 40 agentes.
- Não criar outro gateway.
- Não substituir o Telegram do Hermes.
- Não duplicar a Skill Mãe.
- Não mover secrets para o repositório.
- Não transformar o menu em autoridade de prova.

## Arquitetura atual medida

```text
Telegram API
  → `apps/bot-telegram/unified-bot.cjs`
  → `buildPanel()`
  → callbacks `hub:*`
  → agentes Guardião / Orquestrador / Analista
  → skills e serviços existentes
```

O painel já expõe:

```text
🛡️ Guardião
🧠 Orquestrador
🔍 Analista
🛠️ Ferramentas
🧬 Cognição
📊 Relatório
⚙️ Config
🔐 Contas & Auth
🖥️ Terminal
```

O boot `/start` e o painel do `unified-bot.cjs` são a rota existente de menu. `handlers/commands.js` e `handlers/callbacks.js` são uma rota modular mais simples e não devem virar um segundo owner.

## Distinção obrigatória de conexões

```text
Hermes Gateway Telegram atual != `apps/bot-telegram/unified-bot.cjs`
```

O primeiro atende a conversa atual e usa a plataforma Telegram do Hermes. O segundo é o bot/painel da CentralDark documentado no repositório. A integração deve compartilhar o owner META-RSI e o formato de receipt, mas não misturar sessões, tokens, históricos ou writers sem uma ponte explicitamente medida.

## Fluxo alvo

```text
/start
  → HUB CENTRAL
  → 🧬 META-RSI 40/40
  → `centraldark-meta-rsi`
  → carregar `META-RSI-40.md`
  → avaliar SELF_CHECKS[40]
  → APPLIED ou NOOP_JUSTIFIED com razão
  → aplicar somente delta autorizado no owner correto
  → testes
  → contraprova
  → receipt
  → editar mensagem do Telegram com o resumo
  → HUD projeta o estado
```

## Contrato do resumo

```text
👹 Revisão de Autoaperfeiçoamento

🧭 <capacidade em português> — ACIONADA|EVOLUÍDA|SEM_MUDANÇA|BLOQUEADA
🛠️ Owner: <owner real>
🧾 Evidência: <prova curta>

📊 Contagem
- Avaliadas: 40
- Aplicadas: N
- Sem mudança justificada: N
- Bloqueadas: N
- Desconhecidas: N

⚠️ Pendência: <se houver>
🎯 Próximo passo: <um cursor>
🟡 UNKNOWN ≠ PASS
```

## Contrato de conexão

A implementação não pode alterar silenciosamente:

- token do Telegram;
- chat IDs;
- A2A;
- webhook;
- sessões Hermes;
- memória;
- providers;
- portas;
- PM2;
- writers existentes.

Antes da integração, medir e registrar o estado de cada conexão. Depois, repetir o mesmo readback.

## Microetapas propostas

### M1 — Pré-voo somente leitura

- verificar branch, SHA e worktree;
- localizar entrypoint efetivo;
- confirmar o caminho de `/start`;
- confirmar `buildPanel()` e `handleCallback()`;
- identificar testes atuais;
- separar bot CentralDark do Telegram do Hermes.

**Aceite:** mapa de rotas e conexões sem UNKNOWN material não classificado.

### M2 — Contrato read-only do META-RSI

- ler `META-RSI-40.md`;
- validar 40 entradas;
- validar `SELF_CHECKS[40]`;
- preparar o formato do receipt;
- não executar mutação.

**Aceite:** matriz 40/40 resolvida no checkout.

### M3 — Design do menu

Adicionar ao painel existente, sem nova árvore:

```text
🧬 META-RSI 40/40
```

Callbacks planejados:

```text
hub:meta-rsi
hub:meta-rsi:status
hub:meta-rsi:run
hub:meta-rsi:receipt
hub:meta-rsi:back
```

**Aceite:** callbacks não colidem com `hub:*` existentes e possuem retorno ao painel.

### M4 — Adapter do owner

Criar somente um adapter no owner existente para:

- iniciar a avaliação;
- retornar status;
- ler último receipt;
- não duplicar META-RSI;
- não executar mutação sem autorização do escopo.

**Aceite:** o bot chama `centraldark-meta-rsi`; não contém a matriz 40 dentro de `unified-bot.cjs`.

### M5 — Execução 40/40

Para cada entrada:

```text
APPLIED
```

ou:

```text
NOOP_JUSTIFIED
```

com razão. Falha de medição fica `UNKNOWN` ou `BLOCKED`.

**Aceite:** 40 linhas no receipt, sem inventar PASS.

### M6 — Prova e contraprova

- testar o botão no mock/local;
- verificar que o callback correto foi chamado;
- confirmar que o menu continua respondendo;
- confirmar que Telegram, A2A e webhook não foram alterados;
- verificar o receipt e o próximo cursor.

**Aceite:** teste funcional + contraprova de não regressão.

### M7 — Runtime

Somente após M1–M6:

- promover o mesmo SHA ao runtime autorizado;
- testar `/start` real;
- abrir o menu META-RSI;
- executar a leitura 40/40;
- ler a mensagem e o receipt de volta.

**Aceite:** runtime real provado no alvo correto.

## Critérios de Fixed Point

```text
MENU_PRESENTE
CALLBACK_PRESENTE
OWNER_META_RSI_RESOLVIDO
SELF_CHECKS_40_DE_40
RECEIPT_VALIDO
CONTRAPROVA_PASSOU
CONEXOES_PRESERVADAS
RUNTIME_READBACK
NEXT_CURSOR_FECHADO
```

Sem esses itens, o estado é `PARTIAL`, `BLOCKED` ou `UNKNOWN`.

## Decisão de implementação

A implementação deve ocorrer no owner existente, preferencialmente com:

```text
unified-bot.cjs = interface e roteamento
centraldark-meta-rsi = contrato e avaliação
Hermes existente = execução autorizada
HUD/receipt = projeção e prova
```

O bot não deve virar o executor da lógica Self. O menu apenas chama e mostra o estado do owner.

## Risco principal

O repositório contém documentação e contratos fortes, mas registra que o runtime 40/40 ainda não foi comprovado. A primeira implementação deve provar a ponte antes de afirmar autonomia.

```text
DOCUMENTADO != RUNTIME_PROVED
MENU_CLICADO != MISSÃO_EXECUTADA
AÇÃO != PROVA
UNKNOWN != PASS
```

## Próximo cursor

```text
REVISAR DESIGN → M1 PREFLIGHT → M2 MATRIZ → M3 MENU → M4 ADAPTER →
M5 SELF_CHECKS[40] → M6 CONTRAPROVA → M7 RUNTIME READBACK → FIXED_POINT
```
