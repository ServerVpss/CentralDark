# CLAUDE.md

> Dump de Estado do Projeto — leitura obrigatória para qualquer IA/Hub que abrir este repositório.
> Última atualização: 02/07/2026

---

## 🧠 CÉREBRO COMPARTILHADO DAS IAs — `docs/CONSCIENCIA/DARKAI/`

**Qualquer IA que abrir este repo deve ler PRIMEIRO:** [`docs/CONSCIENCIA/DARKAI/README.md`](docs/CONSCIENCIA/DARKAI/README.md)

Essa pasta concentra TUDO sobre o comando `darkai` (CLI que dá acesso a Gemini/GPT-5/etc via edge function `ai-proxy` com uma única chave protegida na Lovable Cloud):
- `README.md` — índice geral (comece aqui)
- `QUICKSTART.md` — instalar e usar em 5 minutos
- `PROMPT-UNIVERSAL.md` — prompt pronto pra colar em qualquer IA (Claude, GPT, Gemini, Cursor) e ensinar ela a usar `darkai`
- `00-COMECE-AQUI.md` até `10-TROUBLESHOOTING.md` — curso completo
- `darkai.sh` + `instalar-local.sh` + `instalar-windows.ps1` — scripts
- `exemplos/` — receitas prontas

**Regra:** tudo relacionado a orquestração de IAs, delegação, ensino de outras IAs, e o comando `darkai` mora AQUI. Não espalhar em outras pastas.

### 🔫 Arsenal Council — `docs/CONSCIENCIA/ARSENAL/`

Sistema de Conselho de IAs (`/router`, `/refinar`, `/debate` + Hermes autônomo). Tudo mora numa pasta só: relatórios por fase, debates, evolução, `regras.json` e scripts. Índice: [`docs/CONSCIENCIA/ARSENAL/README.md`](docs/CONSCIENCIA/ARSENAL/README.md).

---

## 1. Identidade do Projeto

- **Nome:** TelePanel (frontend) + CentralDark (infra/microsserviços)
- **Stack:** React 18 + Vite 5 + Tailwind v3 + TypeScript 5
- **Backend:** Supabase gerenciado — projeto ref `kagejpghnwdfymddwxuf`
- **Domínio oficial:** https://centralldark.com
- **Painel de status:** https://status.centralldark.com
- **Repositório GitHub:** sincronizado bidirecionalmente com a VPS (`/root/CentralDark/`) via webhook próprio

---

## 1.1. Arquitetura de Bots do Telegram (mapa oficial)

Dois bots, dois mundos completamente separados. **Nunca misturar.**

| Bot | Papel | Onde vive | Edge function | Banco |
|---|---|---|---|---|
| `@srver1bot` | **Central** — controle geral CentralDark | HUB Supabase (`lyoigsqluyktoclwdaft`) + VPS PM2 id 27 (`CentralDark-HubBot`) | `telegram-webhook` (Lovable Cloud atual, consulta o HUB) | HUB |
| `@SEGREDOPUXADASBOT` (🩸FISCAL🩸) | **Módulo TelePainel** — puxadas/consultas | Lovable Cloud atual (`kagejpghnwdfymddwxuf`) | `telepainel-webhook` (dedicada, consulta o projeto local) | projeto atual |

Regras:
- Cada bot novo do TelePainel entra em `telegram_bots` deste projeto e usa `telepainel-webhook?botId=<uuid>`.
- Bots do ecossistema Central (Hub) usam `telegram-webhook` e vivem no HUB.
- Não colocar fallback cruzado entre as duas funções — separação limpa.

---


## 2. Sincronia 4-Point (regra operacional vigente)

Estamos operando sob o modelo **Sincronia 4-Point**. Os quatro pontos que devem permanecer espelhados/consistentes a cada alteração:

1. **Lovable (editor / preview)** — fonte de mudanças assistidas por IA.
2. **GitHub (repositório)** — sync bidirecional automática com Lovable.
3. **VPS (`/root/CentralDark/`)** — microsserviços, scripts utilitários e PM2 (rodar `pm2 save` após qualquer mudança de estado).
4. **Cérebro Vivo (`docs/CONSCIENCIA/` + `.claude/`)** — contexto persistente, regras e memória de projeto consumida por qualquer IA/Hub.

> Regra: nenhuma alteração estrutural é considerada concluída enquanto os 4 pontos não refletirem o mesmo estado.

---

## 3. Diretórios do Cérebro Vivo

- **`.claude/`** — instruções, regras de execução defensiva, agentes especializados e prompts persistentes para IAs/Hub externas.
- **`docs/CONSCIENCIA/`** — base de conhecimento viva (decisões, aprendizados, regras, runbooks). É o "estado de longo prazo" que sobrevive entre sessões. Git é a fonte da verdade; Notion é espelho humano (sync automático via workflow).

> Nota: a pasta `docs/` será futuramente renomeada para `.consciencia` — aguardar comando explícito do Pivete antes de qualquer renomeação.

Qualquer IA nova deve ler estes dois diretórios **antes** de propor mudanças.

---

## 4. Infra (resumo)

- **VPS:** hospeda `CentralDark` em `/root/CentralDark/`. Scripts utilitários e webhooks ficam em `/root/CentralDark/scripts/`, gerenciados por **PM2** com `pm2 save` obrigatório após qualquer mudança de estado.
- **whatsapp-server (PM2 id 1):** estado desejado é `stopped` (salvo em `dump.pm2`). Não subir automaticamente, não reportar como erro.
- **Páginas de status** (ex.: `status.centralldark.com`) consomem `/health` e `/status.json` das portas internas da VPS.
- **Backend Lovable Cloud:** Supabase com RLS obrigatório, Edge Functions padrão `Deno.serve` + CORS expandido.

---

## 5. Regras de Execução Defensiva

1. Antes de gravar/alterar qualquer arquivo crítico (como este `CLAUDE.md`), verificar se já existe e **preservar conteúdo prévio** — atualizar a seção "Estado Atual" em vez de sobrescrever cegamente.
2. Não adivinhar caminhos de arquivos na VPS — usar o catálogo do MCP para inspeção absoluta.
3. Scripts e automações ficam **isolados** em `/root/CentralDark/scripts/` e versionados explicitamente no PM2.
4. Pré-deploy: rodar a skill `audit-rls` antes de qualquer publish ou após nova migration / edge function. Bloquear publish em achado crítico.
5. Nunca expor service role key, senha de banco ou IDs/URLs internas do Supabase ao usuário final.

---

## 6. Estado Atual / Meta

- **Meta atual:** Sincronia 4-Point estável. Qualquer IA em qualquer Hub deve conseguir retomar o contexto apenas lendo `CLAUDE.md` + `.claude/` + `docs/CONSCIENCIA/`.
- **Grandes planos pendentes (aguardar comando do Pivete):**
  - Reconstrução total do MCP + hub (novo plano a ser apresentado pelo Pivete).
  - Renomeação `docs/` → `.consciencia` (aguardar comando explícito).
- **Próximos passos ativos:**
  - Validar periodicamente que o PM2 da VPS bate com o `dump.pm2` salvo.
  - Manter este arquivo como ponto único de entrada de contexto.

---

## 7. Para a próxima IA que ler este arquivo

Se você é uma IA abrindo este repositório pela primeira vez:

1. Leia **este arquivo inteiro**.
2. Leia `.claude/` (regras operacionais) e `docs/CONSCIENCIA/` (contexto vivo e aprendizados).
3. Assuma que a **Sincronia 4-Point** está ativa.
4. Não execute mudanças destrutivas sem confirmar com o usuário.
5. Responda sempre em **PT-BR**, tom direto e conversacional.
6. Verifique a **Seção 9** abaixo antes de tocar em qualquer arquivo — há áreas protegidas que exigem autorização explícita.

---

## 8. Política de Migração: CentralDark (transição gradual e segura)

**Regra operacional vigente a partir de agora.**

1. **Hierarquia:** O repositório `ServerVpss/CentralDark` é a única **Fonte da Verdade** para novos desenvolvimentos e para a estrutura do Cérebro Vivo.
2. **Respeito ao Legado:** O repositório `ServerVpss/CentralDark1VPS` é mantido como **Servidor de Operação Ativa**. Não alterar, não sobrescrever e não remover nada de lá sem instrução explícita de **"Migração de Automação"**.
3. **Fluxo de Trabalho:** Todo novo desenvolvimento ocorre no `CentralDark`. Quando uma funcionalidade for concluída e testada, faremos a migração (deploy) dela para substituir a versão antiga no `CentralDark1VPS` de forma controlada.
4. **Zero-Downtime:** Nenhuma automação atual pode ser interrompida. A migração deve ser gradual e segura.

> Esta política é a regra de operação daqui para frente. Qualquer IA que abrir este repositório deve respeitá-la.

---

## 9. Áreas Protegidas — Trava Obrigatória 🔒

**Estas áreas foram consolidadas e testadas. Nenhuma IA pode modificá-las sem:**
1. Informar EXATAMENTE o que pretende mudar e POR QUÊ (motivo técnico ou de negócio).
2. Aguardar autorização explícita do Pivete.
3. Registrar a decisão em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`.

### 9.1. Padrão Visual Obrigatório 🔒

**Toda vez que uma IA exibir a estrutura de pastas/árvore do projeto pro Pivete, DEVE marcar áreas protegidas com o emoji cadeado `🔒`.** Aviso visual imediato de que aquele caminho não pode ser alterado sem autorização. Exemplo:

```
apps/
├─ 🔒 bot-telegram/        (protegido — bot @srver1bot)
├─ modulos/
│   ├─ Bolt/               ← construtor de site
│   ├─ mcp/                 ← MCP (desbloqueado)
│   └─ 🔒 status/           (protegido — página oficial de status)
```

### 9.2. Tabela de Áreas Protegidas

| Área | Motivo da Proteção | Consolidada em |
|------|--------------------|----------------|
| `apps/bot-telegram/` | Bot @srver1bot — restaurado e testado | 28/06/2026 |

| `apps/modulos/status/` | Página oficial (`status.centralldark.com`) — consolidada com o painel vivo (index.html + app.js + painel-data.json + atualizar-painel-vivo.mjs) — consumida por monitoramento | 02/07/2026 |
| `apps/modulos/Bolt/` | Construtor de site próprio do Pivete — não mexer sem ordem | 02/07/2026 |
| `apps/modulos/WebUI/` | Web UI próprio do Pivete — não mexer sem ordem | 02/07/2026 |
| `apps/modulos/graph-panel/` | Graph panel (indexação por grafo) — economiza tokens e latência | 02/07/2026 |
| `apps/modulos/elite-anthropic-proxy/` | Proxy Anthropic ap7 — 4 modelos HTTP 200 | 02/07/2026 |
| `scripts/webhook/` | Deploy webhook + notificação Telegram VPS | 28/06/2026 |
| `scripts/contas-admin/` | OAuth admin panel — restaurado com `load_dotenv` fix | 28/06/2026 |
| `.github/workflows/pr-agent.yml` | Proxy Anthropic ap7 configurado | 28/06/2026 |
| `.github/workflows/` em geral | Qualquer mudança pode derrubar CI/CD inteiro | — |
| `infra/caddy/` | Mudança quebra todos os subdomínios | — |
| `secrets/` | Nunca commitar, nunca sobrescrever sem backup | — |
| `docs/CONSCIENCIA/` | Fonte de verdade do Cérebro Vivo — git é autoritativo | — |
| `docs/CONSCIENCIA/LEMBRANCAS/` | Memória de curto prazo (tools cognitivas do MCP) | 30/06/2026 |

> **Palavras-chave de autorização:** "PERMITO PIVETE" ou instrução explícita descrevendo o escopo exato da mudança.

> **Planos pendentes que ainda NÃO foram autorizados a executar:**
> - Reconstrução do `src/` TypeScript do MCP (etapa futura — `dist/` já está protegido).
> - Reconstrução do **hub** (aguardar confirmação do subdomínio `webhook.centralldark.com`).
> - Mover `apps/bot-telegram/` → `apps/modulos/bot-telegram/` (requer coordenação com PM2 na VPS — NÃO fazer só no repo, derruba o @srver1bot).
> - ✅ ~~Limpar/mover `apps/projeto-dashboard/`~~ — **RESOLVIDO 02/07/2026**: painel vivo consolidado dentro de `apps/modulos/status/`, duplicata removida.
> - Renomeação `docs/` → `.consciencia` (aguardar comando).
