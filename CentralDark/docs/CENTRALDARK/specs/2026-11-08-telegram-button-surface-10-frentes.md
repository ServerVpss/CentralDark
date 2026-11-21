# Telegram CentralDark — Superfície de botões em 10 frentes

**Status:** EXECUÇÃO CONTROLADA — PLANO MATERIAL
**Regra:** MENOS É MAIS
**Front door:** Hermes Telegram atual
**Owner de coordenação:** Orquestrador Central
**Executor:** Hermes
**Fonte:** `ServerVpss/CentralDark@main`
**Checkpoint:** `telegram-meta-rsi-integration`

## Objetivo

Manter o usuário nesta conversa e expor, no mesmo Telegram, os menus do CentralDark com botões organizados. Cada botão solicita uma rota existente. O menu não executa lógica própria, não cria autoridade e não duplica polling.

## Princípios

- Um único consumidor por token Telegram.
- Um único Hermes executor.
- Um writer por escopo.
- META-RSI continua no owner canônico.
- Botões substituem comandos repetitivos, mas não removem comandos legados antes de provar a paridade.
- Toda ação material usa confirmação `SIM` / `NÃO` quando houver efeito externo.
- Leitura simples pode usar botão direto.
- O callback não é prova de efeito.
- O receipt e o readback são a prova.

## As 10 frentes

### F1 — Painel principal

Preservar os menus atuais e adicionar apenas a entrada CentralDark. Não reconstruir o painel.

**Aceite:** `/start` continua funcionando; todos os callbacks existentes continuam presentes.

### F2 — Orquestração

Botões para Guardião, Orquestrador e Analista. A seleção define a rota sem criar agentes novos.

**Aceite:** seleção altera somente o owner da sessão e o painel informa o estado.

### F3 — META-RSI 40/40

Botões para abrir status, iniciar leitura autorizada e consultar o último receipt. A matriz fica no owner `meta-rsi`.

**Aceite:** nenhuma matriz duplicada dentro do bot; 40 linhas no receipt quando a execução for comprovada.

### F4 — Segurança e confirmação

Toda mutação externa recebe:

```text
✅ SIM, executar
❌ NÃO, cancelar
```

Leituras não destrutivas podem usar ação direta. Cancelamento deve ser idempotente.

**Aceite:** `NÃO` não chama executor nem altera estado.

### F5 — Kimetsu e Michelin

O usuário escolhe método somente quando houver decisão material. O botão apresenta opções curtas e o owner registra a técnica escolhida.

**Aceite:** método declarado não é tratado como método executado sem receipt.

### F6 — Papagaio e continuidade

Botões para Fiel, ON e OFF. A seleção ajusta apresentação/continuidade da sessão; não cria loop paralelo.

**Aceite:** o `NEXT_CURSOR` permanece preservado após cada callback.

### F7 — HUD e estado

Botões para estado atual, pendências e próximo passo. O HUD somente projeta o estado real.

**Aceite:** `UNKNOWN`, `BLOCKED`, `PASS` e `FIXED_POINT` aparecem sem promoção falsa.

### F8 — Receipts e checkpoints

Botões para último receipt, verificar cadeia e retomar checkpoint. As leituras usam processos separados do writer.

**Aceite:** `HASH_CHAIN_PASS` antes de qualquer restart ou retomada.

### F9 — Conexões

Botões para leitura de Telegram, A2A, webhook, providers e runtime. Não expor secrets. Não alterar conexão por botão de leitura.

**Aceite:** saúde, autenticação, binding e entrega ficam separados.

### F10 — Restart controlado e readback

Somente depois de F1–F9. O botão de restart fica oculto ou bloqueado até o gate de prontidão.

Fluxo:

```text
pré-check
→ SIM / NÃO
→ checkpoint
→ restart do owner nomeado
→ readback do processo
→ readback do Telegram
→ readback do menu
→ receipt
```

**Aceite:** o mesmo chat recebe a resposta após o restart. Sem readback, status `UNKNOWN`.

## Layout inicial proposto

```text
🏛️ CentralDark
├── 🧭 Orquestração
├── 🧬 META-RSI 40/40
├── 🛡️ Segurança
├── 🫁 Kimetsu
├── ⭐ Michelin
├── 🦜 Papagaio
├── 📊 HUD
├── 🧾 Receipts
├── 🔗 Conexões
└── 🔄 Restart controlado
```

## Contrato de confirmação

```text
CONFIRMATION_ID
INTENT_ID
ACTION
OWNER
SCOPE
SIM_EFFECT
NAO_EFFECT
EXPIRY
STATUS
NEXT_CURSOR
```

O botão `NÃO` deve responder de forma clara e manter o painel. O botão `SIM` só aparece quando a rota estiver medida e autorizada.

## Ordem de execução

```text
F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 → F10
```

Não executar as dez frentes em paralelo no mesmo writer. As frentes são áreas de escopo; o trabalho material segue uma fila única e checkpoints por etapa.

## Estado inicial

```text
F1 menus existentes: PASS
F2 agentes existentes: PASS
F3 owner META-RSI: PASS
F4 confirmação uniforme: PENDENTE
F5 métodos no menu: PENDENTE
F6 continuidade no callback: PENDENTE
F7 HUD no Telegram: PENDENTE
F8 receipts no Telegram: CHECKPOINT PASS / UI PENDENTE
F9 conexões: preservadas / readback de superfície PENDENTE
F10 restart controlado: BLOCKED até F1–F9
```

## Critério Menos É Mais

Se uma frente exigir novo bot, novo gateway, novo scheduler, novo agente ou novo writer, reduzir o escopo e reutilizar o owner existente. Se não houver ganho observável, registrar `NOOP_JUSTIFIED`.

## Próximo cursor

```text
F1_MENU_PRESERVADO → F3_META_RSI_STATUS → F4_CONFIRMACAO_SIM_NAO
```
