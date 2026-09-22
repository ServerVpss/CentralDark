# 📨 Central de Notificações — CentralDark

> Fundação de projeção do ecossistema. Qualquer parte do sistema — VPS, bots, IAs, crons, site, Desktop, SOL, Hermes, Obsidian, webhooks e scripts — notifica pelo **mesmo contrato**, fica registrada no mesmo ledger de notificações e pode aparecer no Mega Painel e no Telegram.
>
> **Notificação é projeção, não autoridade.** `NOTIFIED != PROVED`, `DELIVERED != RUNTIME_PROVEN`, `UNKNOWN != PASS`.

---

## Owner e integração com o núcleo

```text
OWNER_CLIENT=src/lib/notifications-events.ts
OWNER_EDGE_HELPER=supabase/functions/_shared/notifications-events.ts
LOG=notifications_log
HUMAN_SURFACE=/mega-painel
KNOWLEDGE_HUB=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml
CONTINUITY=docs/CONSCIENCIA/RANDOLF-CONTINUIDADE.md
```

A Central de Notificações **não é um segundo Hub** e não cria um segundo fluxo. Ela projeta eventos materiais que já possuem contexto do mesmo organismo:

```text
INTENÇÃO / GOAL
→ !CENTRALDARK
→ RANDOLF
→ HUB ÚNICO DE CONHECIMENTO
→ OWNER / EXECUÇÃO / REALITY JUDGE
→ EVENTO MATERIAL
→ CENTRAL DE NOTIFICAÇÕES
→ notifications_log
→ Mega Painel / Telegram / consumidor autorizado
```

## Linguagem humana canônica

Toda superfície de notificação deve preservar os gatilhos e termos canônicos, mas falar primeiro para uma pessoa comum. A ordem é obrigatória no owner central e recomendada para emissores legados até convergirem nele:

```text
GATILHO CANÔNICO
→ O QUE ACONTECEU, EM PORTUGUÊS SIMPLES
→ ESTADO HUMANO (🟢 / 🟡 / 🔴 / ❓)
→ TERMO TÉCNICO E ESCOPO
→ O QUE FOI FEITO
→ O QUE AINDA FALTA PROVAR
→ RASTRO TÉCNICO (owner / HEAD / SHA / runtime / sessão / cursor)
→ !CONTRAPROVA
→ ⚖️ REALIDADE É O JUIZ
```

Regras de escrita:

- não remover `!CENTRALDARK`, `!AURÉOLA CANÔNICA`, `!CONTRAPROVA`, `UNKNOWN`, `PASS`, `HEAD`, `SHA`, `runtime` ou outros termos necessários ao rastro;
- termo técnico nunca deve ser a única explicação quando houver equivalente humano simples;
- falar com o CHEFE em PT-BR natural, direto, com baianês leve e sem caricatura;
- `🟢` significa prova no escopo declarado, nunca verdade eterna;
- `🟡` significa que ainda há algo a conferir;
- `🔴` significa falha material localizada, não condenação global;
- `❓ UNKNOWN` permanece desconhecido e nunca vira PASS por narrativa;
- Bíblia/metáfora pode orientar a leitura, mas nunca substitui evidência;
- detalhes técnicos ficam abaixo da conclusão humana, preservando rastreabilidade.

Exemplo de leitura:

```text
⭕ !AURÉOLA CANÔNICA
📖 “Examinai tudo. Retende o bem.” — 1 Tessalonicenses 5:21

🔴 CHEFE, deu problema e o rastro abaixo mostra onde olhar.
👉 O que aconteceu: os 3 deploys anteriores falharam pela mesma causa.
⚖️ Estado: CAUSA RAIZ CONFIRMADA; CORREÇÃO AINDA NÃO PROVADA.

🔎 !CONTRAPROVA
❓ A correção só recebe verde depois do teste real. UNKNOWN != PASS.

⚖️ REALIDADE É O JUIZ.
```

## Contexto CentralDark preservado

Quando disponível, o envelope de notificação transporta os mesmos identificadores usados para reencontrar a passagem sem transformar nenhum deles em autoridade:

| Campo | Papel |
| --- | --- |
| `event_key` | identidade estável do tipo de evento |
| `severity` | `info` \| `sucesso` \| `aviso` \| `erro` \| `critico` |
| `source_surface` | CHAT, VOICE, WEB, DESKTOP, SOL, HERMES, VPS, GITHUB etc. |
| `session_id` | proveniência da sessão observada; não é owner nem current state |
| `profile_id` | perfil humano projetado |
| `profile_display` | apresentação humana, padrão `😎 Orquestração SOL 🌞` quando aplicável |
| `intent_goal` | intenção/GOAL vigente ligada ao evento |
| `owner` | owner material resolvido |
| `head_sha` | SHA quando o evento é ligado a código/versionamento |
| `knowledge_event_id` | ligação com o evento candidato do Hub de conhecimento |
| `next_cursor` | próximo ponto de retomada do RANDOLF/CARACOL |
| `runtime` | runtime observado quando aplicável |

Regras:

```text
SESSION_ID != AUTHORITY
PROFILE != AUTHORITY
NOTIFICATION != EVIDENCE_BY_ITSELF
EVENT_KEY != VERDICT
SECRET_VALUE_IN_NOTIFICATION=FORBIDDEN
SAME_MATERIAL_EVENT_SHOULD_KEEP_SAME_CONTEXT=true
DEDUPE_BEFORE_FANOUT=true
```

---

## Visão geral

```text
VPS / Cron / Bot / Script / Site / Desktop / SOL / Hermes / Obsidian
                              │
                              │ evento material + contexto RANDOLF
                              ▼
                      notifications-events
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
          notifications_log       notify-telegram
             (Supabase)               │
                   │                   ▼
                   │              Telegram API
                   ▼
             Realtime
                   │
                   ▼
             Mega Painel
```

A implementação não depende da Lovable como autoridade arquitetural. Integrações externas são consumidores/providers substituíveis; o contrato CentralDark permanece o mesmo.

## Componentes

| Componente | Onde vive | Função |
| --- | --- | --- |
| `notifications-events.ts` | `src/lib/` | cliente browser do envelope central |
| `notifications-events.ts` | `supabase/functions/_shared/` | helper server-side, catálogo, debounce, log e fanout |
| `notify-telegram` | Supabase Edge Function | autentica, grava log e envia Telegram |
| `notifications_log` | Tabela Postgres | histórico permanente + fonte do painel realtime |
| `/usr/local/bin/notify` | VPS (bash) | wrapper para scripts quando instalado no runtime |
| `notify.py` | VPS (Python) | wrapper Python quando instalado no runtime |
| `/mega-painel` | TelePainel | projeção visual da Central de Notificações |

`DOCUMENTED != INSTALLED`: wrappers de VPS ou superfícies web só recebem verde CURRENT após medição no runtime correspondente.

---

## Tabela `notifications_log`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | PK |
| `created_at` | timestamptz | quando entrou |
| `origem` | text | quem mandou (`central`, `vps`, `bot`, `gateway`, `elite-mapper`...) |
| `tipo` | text | `info` \| `sucesso` \| `aviso` \| `erro` \| `critico` |
| `titulo` | text | título curto |
| `mensagem` | text | corpo humano |
| `metadata` | jsonb | contexto estruturado sem segredos |
| `telegram_message_id` | bigint | id da mensagem enviada, quando aplicável |
| `telegram_chat_id` | bigint | destino usado, quando aplicável |
| `sent_ok` | bool | entrega Telegram medida por essa integração |
| `send_error` | text | erro de transporte, quando houver |
| `dedupe_hash` | text | identidade anti-spam quando usada pelo owner |

RLS/admin e credenciais continuam sob os owners de Supabase/runtime. Service role nunca pertence ao frontend.

---

## Endpoint de transporte Telegram

```text
POST https://<supabase>/functions/v1/notify-telegram
Headers:
  X-Notify-Key: <NOTIFY_API_KEY>
  Content-Type: application/json
```

Credenciais reais pertencem ao secret store/runtime e **nunca** devem ser colocadas em commits, receipts, sessão, Hub ou notificação.

### Códigos de erro esperados

| HTTP | Classe | Causa típica |
| --- | --- | --- |
| 400 | entrada inválida | JSON/campos inválidos |
| 401 | não autorizado | chave ausente ou inválida |
| 405 | método inválido | rota chamada com método incorreto |
| 5xx | falha de serviço | persistência/transporte indisponível |

Falha do Telegram não prova falha da CentralDark inteira. O evento continua localizado na aresta de transporte; o CARACOL volta apenas pelo cone causal afetado.

---

## Tipos e selos

| Tipo | Selo | Quando usar |
| --- | --- | --- |
| `info` | ℹ️ | estado informativo |
| `sucesso` | ✅ | ação/prova realmente concluída no escopo declarado |
| `aviso` | ⚠️ | atenção ou evidência incompleta não bloqueante |
| `erro` | ❌ | falha material localizada |
| `critico` | 🚨 | falha crítica que exige reação |

O selo facilita leitura; não fabrica o veredito.

---

## Dedupe e fanout

Eventos repetidos devem ser deduplicados/agrupados antes do fanout quando o owner possuir chave de agrupamento. Isso evita inundação do painel/Telegram e mantém um único rastro causal.

```text
MESMO EVENTO MATERIAL
→ MESMO group_key/contexto
→ INCREMENTA/AGRUPA
→ NÃO CRIA SEGUNDA MISSÃO
```

---

## Como chamar

### Browser / app CentralDark

Use `notify()` de `src/lib/notifications-events.ts` e inclua o contexto disponível. Não chame Telegram diretamente do renderer/browser.

### Edge function

Use o helper compartilhado `supabase/functions/_shared/notifications-events.ts`; ele registra em `notifications_log` e usa o transporte configurado.

### VPS / scripts

Wrappers podem chamar o transporte configurado depois que sua instalação/runtime estiver provada. O fato de o script existir no repositório não prova instalação na VPS.

---

## Mega Painel

O Mega Painel é **HUD/projeção**:

- feed ao vivo por realtime quando a infraestrutura estiver ativa;
- filtros por tempo, tipo e origem;
- resumo de saúde e últimos eventos;
- contexto de superfície, perfil, sessão, GOAL, owner, SHA e próximo cursor quando fornecido.

```text
HUD != AUTHORITY
RED_ON_EDGE != GLOBAL_RED
GREEN_CARD != GLOBAL_FIXED_POINT
```

---

## Segurança

- credenciais somente em secrets/runtime;
- nenhuma chave/token em payload persistido;
- service role somente server-side;
- sanitização/limites de strings;
- contexto da sessão não deve carregar cookies, Authorization headers ou conteúdo secreto;
- `session_id` é proveniência, nunca permissão;
- fallback de transporte não pode ampliar autoridade;
- erro de sensor/transporte deve permanecer localizado.

---

## Prova de runtime

Para declarar a Central de Notificações viva no presente, o receipt mínimo é:

```text
SOURCE_EVENT
→ EVENT_KEY + CONTEXTO
→ notifications_log INSERT/UPDATE
→ realtime/painel OU transporte configurado
→ DELIVERY/RENDER RECEIPT
```

Se a claim for Telegram, é necessário provar a entrega Telegram. Se a claim for painel, é necessário provar o realtime/painel. Um não empresta verde ao outro.

---

## Estado de implementação e próximos passos

- [x] contrato de notificação único no repositório;
- [x] cliente browser e helper server-side;
- [x] contexto RANDOLF/Hub com sessão, perfil, GOAL, owner, SHA e next cursor;
- [x] integração conceitual com Mega Painel e Telegram pelos owners existentes;
- [ ] remedir runtime CURRENT do `notifications_log`/realtime;
- [ ] remedir transporte Telegram CURRENT;
- [ ] remedir instalação dos wrappers na VPS;
- [ ] provar end-to-end `VOICE/CHAT → !CENTRALDARK → RANDOLF/HUB → evento → Central de Notificações` no mesmo ciclo;
- [ ] promover somente claims cujo runtime/HEAD aplicável tenha receipt.

## Lei final

```text
UMA INTENÇÃO
→ UM HUB DE CONHECIMENTO
→ UM CONTEXTO RANDOLF
→ UMA CENTRAL DE NOTIFICAÇÕES
→ MUITAS SUPERFÍCIES
→ UM RASTRO CAUSAL
→ REALIDADE JULGA
```
