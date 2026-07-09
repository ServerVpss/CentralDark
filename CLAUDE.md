# CLAUDE.md

> Dump de Estado do Projeto — leitura obrigatória para qualquer IA/Hub que abrir este repositório.
> Última atualização: 09/07/2026
>
> **Fluxo oficial atual:** GitHub = Fonte da Verdade · VPS = Executor · Supabase = Estado Vivo · Gateway = `https://api.centralldark.com/`
>
> **Documento de arquitetura:** [`docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md`](docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md)

---

## 🧠 CÉREBRO COMPARTILHADO DAS IAs — `docs/CONSCIENCIA/DARKAI/`

**Qualquer IA que abrir este repo deve ler PRIMEIRO:** [`docs/CONSCIENCIA/DARKAI/README.md`](docs/CONSCIENCIA/DARKAI/README.md)

Essa pasta concentra TUDO sobre o comando `darkai` (CLI que dá acesso a provedores/rotas autorizadas via infraestrutura CentralDark, com chave protegida e sem expor segredo ao usuário final):
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
- **Gateway oficial CentralDark:** https://api.centralldark.com/
- **Repositório GitHub:** `ServerVpss/CentralDark` é a Fonte da Verdade para código, documentação, scripts oficiais, governança e arquitetura.
- **VPS:** `/root/CentralDark/` é runtime/executor. Não é oficina principal de edição manual.

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

## 2. Fluxo de Ouro 5-Point (regra operacional vigente)

Estamos operando sob o modelo **Fluxo de Ouro 5-Point**.

```txt
PIVETE COMANDA.
IA ORGANIZA.
GITHUB REGISTRA.
VPS EXECUTA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY CENTRALDARK ROTEIA.
AÇÕES PROVAM.
NADA NO ESCURO.
```

Os pontos oficiais são:

1. **GitHub (`ServerVpss/CentralDark`)** — Fonte da Verdade para código, docs, scripts oficiais, governança, runbooks e histórico.
2. **VPS (`/root/CentralDark/`)** — executor/runtime: PM2, Node, Nginx, webhooks, logs e validação real.
3. **Supabase** — estado vivo: painel, status dinâmico, eventos, filas, logs estruturados leves e dados que mudam rápido.
4. **Gateway CentralDark (`https://api.centralldark.com/`)** — roteamento autorizado, padronizado, seguro e documentado.
5. **Cérebro Vivo (`docs/CONSCIENCIA/` + `.claude/`)** — contexto persistente, regras e memória de projeto consumida por qualquer IA/Hub.

> Regra: alteração estrutural só é considerada concluída quando o GitHub registra, a VPS executa/valida quando necessário, e a evidência volta para GitHub/Supabase. Estado vivo não vira commit repetido na `main`.

---

## 3. Diretórios do Cérebro Vivo

- **`.claude/`** — instruções, regras de execução defensiva, comandos slash, settings e prompts persistentes para IAs/Hub externas.
- **`docs/CONSCIENCIA/`** — base de conhecimento viva (decisões, aprendizados, regras, runbooks). É o estado de longo prazo que sobrevive entre sessões. GitHub é a Fonte da Verdade; Notion é espelho humano quando houver sync.

> Nota: a pasta `docs/` será futuramente renomeada para `.consciencia` — aguardar comando explícito do Pivete antes de qualquer renomeação.

Qualquer IA nova deve ler estes dois diretórios **antes** de propor mudanças.

---

## 4. Infra (resumo)

- **VPS:** hospeda runtime do `CentralDark` em `/root/CentralDark/`. Deve executar o que foi aprovado/versionado no GitHub.
- **Scripts oficiais:** comandos repetíveis devem morar no repositório, preferencialmente em `scripts/` ou `scripts/vps/`. Comando solto na VPS é temporário; script no GitHub é padrão oficial.
- **PM2:** usado para processos vivos. Qualquer mudança de estado relevante precisa autorização, validação e registro.
- **whatsapp-server (PM2 id 1):** estado desejado é `stopped` (salvo em `dump.pm2`). Não subir automaticamente, não reportar como erro.
- **Páginas de status** (ex.: `status.centralldark.com`) consomem `/health`, `/status.json` ou estado vivo apropriado.
- **Backend Lovable Cloud / Supabase:** RLS obrigatório, Edge Functions padrão `Deno.serve`, CORS controlado e secrets fora do Git.
- **Estado vivo do painel:** não deve commitar timestamp na `main`; deve migrar para Supabase/Edge Function, como `painel-write`.

---

## 5. Regras de Execução Defensiva

> 🛡️ **SELO DOUTRINA:** esta seção é reforçada por [`docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md`](docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md). Toda IA subordinada ao CentralDark deve obedecer a Doutrina de Proteção Estratégica além destas regras. Ação sem "PERMITO PIVETE" explícito = violação.

1. Antes de gravar/alterar qualquer arquivo crítico (como este `CLAUDE.md`), verificar se já existe e **preservar conteúdo prévio** — atualizar seções sem sobrescrever cegamente.
2. Não adivinhar caminhos de arquivos na VPS — usar catálogo, busca ou inspeção de leitura antes.
3. Não editar código de aplicação diretamente na VPS como Fonte da Verdade. Código/script/doc nasce ou é atualizado no GitHub.
4. Não trocar endpoint oficial sem autorização do Pivete. Gateway oficial atual: `https://api.centralldark.com/`.
5. Não usar Git como banco de estado vivo. `updatedAt`, logs, fila, status temporário e painel vivo vão para Supabase/storage/log, não para commit automático na `main`.
6. Pré-deploy: rodar auditoria adequada antes de publish/migration/edge function. Bloquear publish em achado crítico.
7. Nunca expor service role key, senha de banco, token, `.env`, chave SSH ou segredo ao usuário final.
8. Não executar `git pull`, `git push`, `reset --hard`, restart PM2, deploy ou remoção sem mapear risco e confirmar escopo.

---

## 6. Estado Atual / Meta

- **Meta atual:** Fluxo de Ouro estável. Qualquer IA em qualquer Hub deve conseguir retomar o contexto apenas lendo `CLAUDE.md`, `.claude/`, `docs/CONSCIENCIA/` e os documentos de `docs/GOVERNANCA/`.
- **Gateway oficial:** `https://api.centralldark.com/`.
- **Grandes planos pendentes (aguardar comando do Pivete):**
  - Reconstrução total do MCP + hub (novo plano a ser apresentado pelo Pivete).
  - Renomeação `docs/` → `.consciencia` (aguardar comando explícito).
  - Migração do painel vivo para Supabase/Edge Function `painel-write`.
- **Próximos passos ativos:**
  - Auditar rotas antigas, `.claude/`, `.github/workflows/`, `.agents/`, `.lovable/` e scripts duplicados.
  - Validar periodicamente que o PM2 da VPS bate com o estado desejado.
  - Manter este arquivo como ponto único de entrada de contexto.

---

## 7. Para a próxima IA que ler este arquivo

Se você é uma IA abrindo este repositório pela primeira vez:

1. Leia **este arquivo inteiro**.
2. Leia `.claude/` (regras operacionais) e `docs/CONSCIENCIA/` (contexto vivo e aprendizados).
3. Leia [`docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md`](docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md).
4. Assuma que o **Fluxo de Ouro 5-Point** está ativo.
5. Não execute mudanças destrutivas sem confirmar com o usuário.
6. Responda sempre em **PT-BR**, tom direto e conversacional.
7. Verifique a **Seção 9** abaixo antes de tocar em qualquer arquivo — há áreas protegidas que exigem autorização explícita.

Se o Pivete pedir uma ação que quebra o fluxo, avise:

```txt
🛑 Epa, Pivete, pera lá! Fazendo isso vamos sair do Fluxo de Ouro e criar divergência entre VPS e GitHub. Se editarmos direto na produção, outras IAs não vão enxergar a mudança, alterações podem se perder e o deploy pode quebrar. O caminho seguro é criar ou alterar isso no GitHub, registrar o commit/PR, e depois refletir na VPS com validação. Manda a braba por aqui no Seguro?
```

---

## 8. Política de Migração: CentralDark (transição gradual e segura)

**Regra operacional vigente a partir de agora.**

1. **Hierarquia:** O repositório `ServerVpss/CentralDark` é a única **Fonte da Verdade** para novos desenvolvimentos, scripts oficiais, docs e estrutura do Cérebro Vivo.
2. **Respeito ao Legado:** O repositório `ServerVpss/CentralDark1VPS` é mantido como **Servidor de Operação Ativa**. Não alterar, não sobrescrever e não remover nada de lá sem instrução explícita de **"Migração de Automação"**.
3. **Fluxo de Trabalho:** Todo novo desenvolvimento ocorre no `CentralDark`. Quando uma funcionalidade for concluída e testada, faremos a migração/deploy para substituir a versão antiga no `CentralDark1VPS` de forma controlada.
4. **Zero-Downtime:** Nenhuma automação atual pode ser interrompida. A migração deve ser gradual e segura.

> Esta política é a regra de operação daqui para frente. Qualquer IA que abrir este repositório deve respeitá-la.

---

## 9. Áreas Protegidas — Trava Obrigatória 🔒

> 🛡️ **SELO DOUTRINA:** áreas 🔒 são intocáveis sem autorização EXPLÍCITA ("PERMITO PIVETE"). Ver [`docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md`](docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md) e [`.github/CODEOWNERS`](.github/CODEOWNERS). Lógica estratégica do Pivete (arquitetura, gateway, secrets, fluxo, governança) NÃO pode ser alterada por nenhuma IA sem autorização nominal.

**Estas áreas foram consolidadas e testadas. Nenhuma IA pode modificá-las sem:**
1. Informar EXATAMENTE o que pretende mudar e POR QUÊ (motivo técnico ou de negócio).
2. Aguardar autorização explícita do Pivete.
3. Registrar a decisão em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`.

### 9.1. Padrão Visual Obrigatório 🔒

**Toda vez que uma IA exibir a estrutura de pastas/árvore do projeto pro Pivete, DEVE marcar áreas protegidas com o emoji cadeado `🔒`.** Aviso visual imediato de que aquele caminho não pode ser alterado sem autorização. Exemplo:

```txt
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
| `apps/modulos/status/` | Página oficial (`status.centralldark.com`) — consolidada com o painel vivo (index.html + app.js + painel-data.json + atualizar-painel-vivo.mjs). Atenção: estado vivo deve migrar para Supabase/`painel-write`, não commit automático. | 02/07/2026 |
| `apps/modulos/Bolt/` | Construtor de site próprio do Pivete — não mexer sem ordem | 02/07/2026 |
| `apps/modulos/WebUI/` | Web UI próprio do Pivete — não mexer sem ordem | 02/07/2026 |
| `apps/modulos/graph-panel/` | Graph panel (indexação por grafo) — economiza tokens e latência | 02/07/2026 |
| `apps/modulos/elite-anthropic-proxy/` | Proxy/Gateway de IA legado. Revisar e alinhar ao Gateway oficial `https://api.centralldark.com/` antes de qualquer mudança. | 02/07/2026 |
| `scripts/webhook/` | Deploy webhook + notificação Telegram VPS | 28/06/2026 |
| `scripts/contas-admin/` | OAuth admin panel — restaurado com `load_dotenv` fix | 28/06/2026 |
| `.github/workflows/pr-agent.yml` | Workflow protegido. Qualquer endpoint antigo deve ser mapeado antes de trocar; Gateway oficial atual é `https://api.centralldark.com/`. | 28/06/2026 |
| `.github/workflows/` em geral | Qualquer mudança pode derrubar CI/CD inteiro | — |
| `.claude/` | Comandos, settings e instruções persistentes do Claude/Hub. Não mexer sem alinhar com Fluxo de Ouro. | — |
| `.agents/` | Skills/agentes. Revisar antes de alterar; pode conter instruções operacionais. | — |
| `.lovable/` | Configurações/ponte com Lovable. Revisar antes de alterar. | — |
| `infra/caddy/` | Mudança quebra todos os subdomínios | — |
| `secrets/` | Nunca commitar, nunca sobrescrever sem backup | — |
| `docs/CONSCIENCIA/` | Fonte de verdade do Cérebro Vivo — git é autoritativo | — |
| `docs/CONSCIENCIA/LEMBRANCAS/` | Memória de curto prazo (tools cognitivas do MCP) | 30/06/2026 |
| 🔒 `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` | **Padrão OFICIAL de notificação Telegram (Card Hermes v1.3)** — travado. Toda ação relevante notifica seguindo esse formato. Só o Pivete altera. Envio SEMPRE via connector Telegram `sendMessage` (bot `@srver1bot`, `connection_id std_01kvw4jkcbekyr1t33vs4p5e9w`, admin `1901426549`). PROIBIDO usar `notify-telegram`. PROIBIDO texto fora do `<pre>`. | 04/07/2026 |
| 🔒 `apps/modulos/HERMES-CORE/` | Núcleo Hermes (core, agents, missions, logs). Loop autônomo + rede especialista (Executor, Critic, Knowledge-Collector, Auto-Diagnostico, Deploy-Watcher). Não mexer sem ordem. | 05/07/2026 |
| 🔒 `apps/modulos/HERMES-CORE/agents/Log-Verificador/` | Hermes-Verificador 24h (PM2 id 77) — vigia todos processos PM2, auto-restart travado 3/24h, análise IA. | 05/07/2026 |
| 🔒 `apps/modulos/Monitoramento24h/` | Monitoramento 24h consolidado — não mexer sem ordem. | 05/07/2026 |
| 🔒 `apps/modulos/mapeamento/` | Módulo de mapeamento do ecossistema — fonte oficial do mapa vivo. | 05/07/2026 |
| 🔒 `apps/modulos/memoria-api/` | API de memória (PM2 `CentralDark-Memoria`) — consumida pelo Hermes e Arsenal. | 05/07/2026 |
| 🔒 `apps/modulos/oauth-broker/` | OAuth Broker (PM2 `CentralDark-OAuthBroker`) — consolidado. | 05/07/2026 |
| 🔒 `apps/modulos/arsenal-openai-adapter/` | Arsenal Adapter (PM2 `CentralDark-ArsenalAdapter`) — plugue OpenAI-compat pro Conselho. | 05/07/2026 |
| 🔒 `apps/modulos/elite-gateway/` | Elite Gateway HTTP (PM2 `CentralDark-EliteHTTP`/`EliteWS`) — Zendriver + orquestração. | 05/07/2026 |
| 🔒 `apps/modulos/artifacts-builder/` | Artifacts Builder + Crafter (PM2 ids 75/76) — consolidado. | 05/07/2026 |
| 🔒 `apps/modulos/proxy/` + `apps/modulos/lovable-proxy/` | Proxies de roteamento IA — travados. Devem seguir Gateway oficial e documentação antes de qualquer troca. | 05/07/2026 |
| 🔒 `apps/modulos/telepainel/` | Módulo TelePainel (bot @SEGREDOPUXADASBOT + edge `telepainel-webhook`). | 05/07/2026 |
| 🔒 `apps/modulos/hub/` | HUB Supabase local (`lyoigsqluyktoclwdaft`) — fonte de verdade do Central. | 05/07/2026 |
| 🔒 `apps/modulos/clone-deck/` | Clone-deck (baralho de clonagem) — consolidado. | 05/07/2026 |
| 🔒 `apps/modulos/pivete-sync/` | Sincronizador do Pivete — não mexer sem ordem. | 05/07/2026 |
| 🔒 `apps/modulos/obsidian-plugin-grafo-vivo/` | Plugin Obsidian do Grafo Vivo. | 05/07/2026 |

> **Palavras-chave de autorização:** "PERMITO PIVETE" ou instrução explícita descrevendo o escopo exato da mudança.

> **Planos pendentes que ainda NÃO foram autorizados a executar:**
> - Reconstrução do `src/` TypeScript do MCP (etapa futura — `dist/` já está protegido).
> - Reconstrução do **hub** (aguardar confirmação do subdomínio `webhook.centralldark.com`).
> - Mover `apps/bot-telegram/` → `apps/modulos/bot-telegram/` (requer coordenação com PM2 na VPS — NÃO fazer só no repo, derruba o @srver1bot).
> - ✅ ~~Limpar/mover `apps/projeto-dashboard/`~~ — **RESOLVIDO 02/07/2026**: painel vivo consolidado dentro de `apps/modulos/status/`, duplicata removida.
> - Renomeação `docs/` → `.consciencia` (aguardar comando).

---

## 10. Documentos Oficiais do Fluxo de Ouro

As IAs devem consultar e obedecer:

```txt
docs/GOVERNANCA/PADRAO-DE-TRABALHO-PIVETE.md
docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md
docs/AUDITORIAS/AUDITORIA-FLUXO-DE-OURO.md   # quando existir
Issue #144 — AUDITORIA FLUXO DE OURO
```

Regra final:

```txt
GitHub = Fonte da Verdade.
VPS = executor.
Supabase = estado vivo.
Gateway oficial = https://api.centralldark.com/.
Nada de edição manual em produção como fonte oficial.
Nada de commit automático inútil na main.
Nada de trocar endpoint sem mapear dependência.
```
