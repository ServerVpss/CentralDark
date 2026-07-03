---
title: "MISSÃO — HUB: fluxo real Telegram MTProto"
missao_id: hub-mtproto
pendencia: 19
prioridade: alta
iniciada_em: 2026-07-03
tutor_principal: Fabler (mestre-sábio)
---

# 🎯 MISSÃO HERMES — HUB MTProto Completo

## 🚨 Regra zero
- **NUNCA** editar dentro do projeto Lovable TelePainel (`kagejpghnwdfymddwxuf`).
- Trabalho vive em `apps/modulos/hub/` (frontend) e novo `apps/modulos/mtproto-service/` (backend).
- HUB Supabase: `lyoigsqluyktoclwdaft`. **NUNCA** o Lovable atual.
- Toda decisão passa pelo Conselho (quórum mínimo 3 tutores) antes de virar commit.
- Registrar aprendizado a cada round em `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/APRENDIZADOS/`.

## 🎯 Objetivo final
`hub.centralldark.com` com **menu lateral esquerdo antigo restaurado** + **fluxo real de vincular Telegram** (telefone → recebe código → digita → conectado), sem mock, com sessão persistida.

## ✅ Checklist obrigatório (6/6 pra fechar)

### 1. 🎨 UI — Menu lateral + fluxo MTProto
- [ ] Restaurar menu lateral esquerdo antigo do HUB (Dashboard, Catálogo, Políticas, Conectores, Auditoria + agora **Telegram MTProto**)
- [ ] Aba Telegram: input telefone (com máscara +55…) → botão "Enviar código"
- [ ] Estado 2: input código (5 dígitos, `<input type="tel" pattern="\d{5}">`) → botão "Confirmar"
- [ ] Estado 3 (se conta 2FA): input senha 2FA
- [ ] Estado final: "✅ Conectado como <primeiro_nome>" + botão Desconectar
- [ ] Tratamento de erro: código expirado, código inválido, telefone banido, timeout
- [ ] Padrão visual Esmeralda 3D (usar `shadow-3d`, `rounded-xl`, `active:translate-y-[1px]`)

### 2. ⚙️ Backend — Novo módulo `apps/modulos/mtproto-service/`
- [ ] Criar `apps/modulos/mtproto-service/` na VPS
- [ ] `package.json` com `gramjs` (ou `mtcute` — Conselho decide)
- [ ] Endpoint `POST /mtproto/sendCode` → body `{phone}` → retorna `{phone_code_hash, next_type}`
- [ ] Endpoint `POST /mtproto/signIn` → body `{phone, phone_code_hash, code, password?}` → retorna `{session_string, user}`
- [ ] Endpoint `POST /mtproto/signOut` → invalida sessão
- [ ] Endpoint `GET /mtproto/status` → `{connected, phone, dc, lastPing}`
- [ ] Ler `TELEGRAM_API_ID` e `TELEGRAM_API_HASH` de env
- [ ] PM2: `pm2 start ... --name mtproto-service && pm2 save`
- [ ] Caddy: adicionar `mtproto.centralldark.com` ou path `/mtproto/*` em subdomínio existente

### 3. 💾 Persistência — HUB Supabase
- [ ] Tabela `telegram_sessions` no HUB Supabase (`lyoigsqluyktoclwdaft`):
  ```sql
  CREATE TABLE telegram_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    phone text NOT NULL,
    session_encrypted text NOT NULL,
    dc integer,
    last_ping timestamptz,
    created_at timestamptz DEFAULT now()
  );
  GRANT SELECT, INSERT, UPDATE, DELETE ON telegram_sessions TO authenticated;
  GRANT ALL ON telegram_sessions TO service_role;
  ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "own_sessions" ON telegram_sessions FOR ALL USING (auth.uid() = user_id);
  ```
- [ ] Session string sempre encriptada (AES-256-GCM com `MTPROTO_ENCRYPTION_KEY` das secrets)
- [ ] Backend só faz `INSERT/UPDATE` via service_role; frontend nunca vê a session raw

### 4. 🔗 Frontend plugado ao backend real
- [ ] Deletar array `mockConnectors` de `src/components/connectors/ConnectorsTab.tsx`
- [ ] Substituir por fetch real de `${VITE_MTPROTO_BASE}/mtproto/status` + Supabase HUB
- [ ] Card real de MTProto plugado (usar o `components/telegram/TelegramMTProtoCard.tsx`, deletar duplicata em `components/TelegramMTProtoCard.tsx`)

### 5. 🧹 Limpeza
- [ ] Deletar `src/HubPage.tsx.bkp-mtproto-*`
- [ ] Deletar duplicata `src/components/TelegramMTProtoCard.tsx` (manter só a de `components/telegram/`)
- [ ] Sem `console.log` esquecido

### 6. 🚀 Build + Deploy + Verificação
- [ ] `bun install && bun run build` em `apps/modulos/hub/`
- [ ] Deploy: copiar `dist/` para pasta servida pelo Caddy
- [ ] `curl -s https://hub.centralldark.com/assets/index-*.js | grep -c "sendCode"` → deve ser ≥ 1
- [ ] Testar no navegador: digitar telefone real → receber código no Telegram → confirmar → ver "Conectado"

## 🧙 Composição do Conselho (por passo)

| Passo | Tutor principal | Debate com |
|---|---|---|
| Arquitetura backend | 🧙 Fabler | 🧠 GPT-5.5, 🔍 Gemini Pro |
| Escolha gramjs vs mtcute | 🎯 GPT-5.4 | 🧙 Fabler, 🔍 Gemini Pro |
| UX fluxo telefone/código | 🎨 GPT-5 | 🧙 Fabler, ⚡ Gemini Flash |
| Criptografia sessão | 🔍 Gemini Pro | 🧙 Fabler, 🧠 GPT-5.5 |
| Schema Supabase + RLS | 🎯 GPT-5.4 | 🧙 Fabler |
| Config Caddy/PM2 | ⚡ Gemini Flash | 🧙 Fabler |
| Revisão final | 🧙 Fabler | (todos) |

## 🔄 Loop de execução por round

```
1. Hermes escolhe próximo item não-marcado do checklist
2. Consulta tutor principal do passo (via elite_gateway_chat)
3. Consulta 2 tutores adicionais pra debate (quórum 3)
4. Fabler faz síntese final (última palavra)
5. Hermes executa: vps_write_file_safe → github_commit
6. Valida no ar (curl / grep / navegador)
7. Se OK: marca item ✅ + registra aprendizado + notifica admin
8. Se falha: até 3 retries → kill-switch + notifica admin
9. Vai pro próximo item
```

## 📢 Notificações padrão

Ver `docs/CONSCIENCIA/PADRAO-EMOJIS.md` — usar layout **Card admin** (privado) + **Linha status** (canal).

## 🏁 Critério de fechamento
Todos os 6 itens ✅ + Hermes anexa print/curl do fluxo funcionando + Pivete confirma no chat. Só então fechar pendência #19.
