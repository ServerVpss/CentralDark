# CLAUDE.md

> Dump de Estado do Projeto — leitura obrigatória para qualquer IA/Hub que abrir este repositório.
> Última atualização: 24/06/2026

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
4. **Cérebro Vivo (`cerebro/` + `.claude/`)** — contexto persistente, regras e memória de projeto consumida por qualquer IA/Hub.

> Regra: nenhuma alteração estrutural é considerada concluída enquanto os 4 pontos não refletirem o mesmo estado.

---

## 3. Diretórios do Cérebro Vivo

- **`.claude/`** — instruções, regras de execução defensiva e prompts persistentes para agentes Claude/IA externas que abrirem o repositório.
- **`cerebro/`** — base de conhecimento viva do projeto (decisões, contexto técnico, runbooks). É o "estado de longo prazo" que sobrevive entre chats.

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

- **Meta atual:** consolidar a **Sincronia 4-Point** — garantir que Lovable, GitHub, VPS e Cérebro Vivo permaneçam espelhados, e que qualquer IA aberta em outro Hub consiga retomar o contexto apenas lendo `CLAUDE.md` + `.claude/` + `cerebro/`.
- **Próximos passos previstos:**
  - Manter `cerebro/` atualizado a cada decisão técnica relevante.
  - Validar periodicamente que o PM2 da VPS bate com o `dump.pm2` salvo.
  - Manter este arquivo como ponto único de entrada de contexto.

---

## 7. Para a próxima IA que ler este arquivo

Se você é uma IA abrindo este repositório pela primeira vez:

1. Leia **este arquivo inteiro**.
2. Leia `.claude/` (regras operacionais) e `cerebro/` (contexto vivo).
3. Assuma que a **Sincronia 4-Point** está ativa.
4. Não execute mudanças destrutivas sem confirmar com o usuário.
5. Responda sempre em **PT-BR**, tom direto e conversacional.

---

## 8. Política de Migração: CentralDark (transição gradual e segura)

**Regra operacional vigente a partir de agora.**

1. **Hierarquia:** O repositório `ServerVpss/CentralDark` é a única **Fonte da Verdade** para novos desenvolvimentos e para a estrutura do Cérebro Vivo.
2. **Respeito ao Legado:** O repositório `ServerVpss/CentralDark1VPS` é mantido como **Servidor de Operação Ativa**. Não alterar, não sobrescrever e não remover nada de lá sem instrução explícita de **"Migração de Automação"**.
3. **Fluxo de Trabalho:** Todo novo desenvolvimento ocorre no `CentralDark`. Quando uma funcionalidade for concluída e testada, faremos a migração (deploy) dela para substituir a versão antiga no `CentralDark1VPS` de forma controlada.
4. **Zero-Downtime:** Nenhuma automação atual pode ser interrompida. A migração deve ser gradual e segura.

> Esta política é a regra de operação daqui para frente. Qualquer IA que abrir este repositório deve respeitá-la.
