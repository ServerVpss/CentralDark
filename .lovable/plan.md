# Plano — Plugar Lovable AI Gateway no Open WebUI (ui.centralldark.com)

## Objetivo
Fazer os **19 modelos** da Lovable AI Gateway aparecerem no dropdown do Open WebUI, funcionando com **1 chave só** (`LOVABLE_API_KEY`), rápido e sem pedir configuração manual.

## Diagnóstico atual
- `ui.centralldark.com` roda **Open WebUI em Docker** (`apps/modulos/WebUI/`).
- Open WebUI fala **OpenAI-compat** (espera `Authorization: Bearer <chave>`).
- Lovable Gateway usa **`Lovable-API-Key`** no header → **não bate direto**, precisa tradutor.
- Já existe `CentralDark-ArsenalAdapter` (PM2 id 2) — vou auditar se ele já traduz pra Lovable ou se precisa de um mini-proxy novo dedicado.

## Etapas (modo enxame paralelo)

**Fase 1 — Auditoria relâmpago (3 sub-agentes em paralelo)**
1. **Agente WebUI:** ler `docker-compose.yml` + `.override.yml` do WebUI, ver env vars atuais (`OPENAI_API_BASE_URLS`, `OPENAI_API_KEYS`), porta interna, quem tá plugado hoje.
2. **Agente Adapter:** inspecionar `apps/modulos/arsenal-openai-adapter/` — descobrir se já roteia pra Lovable Gateway, quais modelos expõe no `/v1/models`, porta e health.
3. **Agente Caddy:** confirmar rota `ui.centralldark.com` → container WebUI, e se precisa expor endpoint interno pro adapter.

**Fase 2 — Debate curto (Conselho: Gemini + GPT-5)**
Decidir entre 2 caminhos:
- **A)** Reaproveitar `ArsenalAdapter` (se já traduz Lovable) — mais rápido, zero código novo.
- **B)** Criar mini-proxy dedicado `lovable-openai-bridge` (Node, ~50 linhas) na porta 8091, só pra traduzir header e listar os 19 modelos em `/v1/models`.
Voto majoritário decide. Se empatar, vai na **B** (isolamento total, não mexe em módulo protegido de outro serviço).

**Fase 3 — Execução**
1. Provisionar `LOVABLE_API_KEY` (se ainda não tiver) via `ai_gateway--create`.
2. Guardar a chave como secret na VPS (`/root/CentralDark/secrets/lovable-api-key.env`).
3. Subir/ajustar o bridge (opção escolhida) via PM2 + `pm2 save`.
4. Editar `docker-compose.override.yml` do WebUI adicionando:
   - `OPENAI_API_BASE_URLS=http://host.docker.internal:<porta>/v1`
   - `OPENAI_API_KEYS=<LOVABLE_API_KEY>`
   - `ENABLE_OPENAI_API=true`
5. `docker compose up -d` no WebUI (restart limpo).
6. Recarregar Caddy se preciso.

**Fase 4 — Validação end-to-end**
- `curl` no `/v1/models` do bridge → esperar 19 modelos listados.
- Abrir `ui.centralldark.com`, logar, ver dropdown com os 19.
- Testar chat com `google/gemini-3-flash-preview` (mais rápido) e `openai/gpt-5.5` (mais top).
- Screenshot da UI mostrando lista + resposta funcionando.
- Notificação Card Hermes no Telegram admin com placar ✅/❌.

## Correções previstas (caso ache erro na auditoria)
- Env vars velhas apontando pra OpenAI cru → atualizo pra Lovable.
- Modelos listados desatualizados → sincronizo com o catálogo oficial (19 atuais).
- Caddy com rota quebrada → conserto e recarrego.
- PM2 fora do `dump.pm2` → salvo.

## Áreas tocadas
- 🔒 `apps/modulos/WebUI/docker-compose.override.yml` (com PERMITO PIVETE ✅)
- 🔒 `apps/modulos/arsenal-openai-adapter/` (só se opção A vencer — com PERMITO PIVETE ✅)
- Novo: `apps/modulos/lovable-openai-bridge/` (se opção B vencer — pasta nova, sem proteção)
- `/etc/caddy/` (só se precisar de rota nova)

## Saída pro Pivete
Placar final único no chat:
```
✅ Bridge: online porta XXXX
✅ WebUI: 19 modelos listados
✅ Teste chat: resposta OK em Xs
✅ PM2 dump salvo
✅ Card Hermes disparado
```

Sem enrolação. Só confirmação de que tá funcionando.
