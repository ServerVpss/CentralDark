# CLAUDE.md

> Dump de Estado do Projeto — leitura obrigatória para qualquer IA/Hub que abrir este repositório.
> Última atualização: 28/06/2026

---

## 1. Identidade do Projeto

- **Nome:** TelePanel (frontend) + CentralDark (infra/microsserviços)
- **Stack:** React 18 + Vite 5 + Tailwind v3 + TypeScript 5
- **Backend:** Lovable Cloud (Supabase gerenciado) — projeto ref `kagejpghnwdfymddwxuf`
- **Preview:** https://id-preview--85041dd2-d1da-4a30-acbc-50799ddf8668.lovable.app
- **Publicado:** https://centraldark.lovable.app
- **Repositório GitHub:** sincronizado bidirecionalmente via Lovable GitHub App (ver Plus (+) → GitHub no editor para URL exata da conta conectada)

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

## 9. Áreas Protegidas — Trava Obrigatória

**Estas áreas foram consolidadas e testadas. Nenhuma IA pode modificá-las sem:**
1. Informar EXATAMENTE o que pretende mudar e POR QUÊ (motivo técnico ou de negócio).
2. Aguardar autorização explícita do Pivete.
3. Registrar a decisão em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`.

| Área | Motivo da Proteção | Consolidada em |
|------|--------------------|----------------|
| `apps/bot-telegram/` | Bot @srver1bot — restaurado e testado | 28/06/2026 |
| `scripts/webhook/` | Deploy webhook + notificação Telegram VPS ATUALIZADA | 28/06/2026 |
| `scripts/contas-admin/` | OAuth admin panel — restaurado com load_dotenv fix | 28/06/2026 |
| `.github/workflows/pr-agent.yml` | Proxy Anthropic ap7 configurado (4 modelos HTTP 200) | 28/06/2026 |
| `infra/caddy/` | Configuração Caddy — mudança quebra todos os subdomínios | — |
| `secrets/` | Nunca commitar, nunca sobrescrever sem backup explícito | — |
| `docs/CONSCIENCIA/` | Fonte de verdade do Cérebro Vivo — git é autoritativo | — |
| `.github/workflows/` em geral | Qualquer mudança em workflow pode derrubar CI/CD inteiro | — |

> **Palavras-chave de autorização:** O Pivete pode liberar com "PERMITO PIVETE" (padrão existente) ou com instrução explícita descrevendo o escopo exato da mudança.

> **Planos pendentes que ainda NÃO foram autorizados a executar:** reconstrução do MCP + hub (aguardar plano do Pivete); renomeação `docs/` → `.consciencia` (aguardar comando).
