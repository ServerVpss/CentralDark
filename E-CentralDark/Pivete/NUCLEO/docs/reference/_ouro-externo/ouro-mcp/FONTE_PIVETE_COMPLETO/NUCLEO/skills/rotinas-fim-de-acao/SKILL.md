---
name: rotinas-fim-de-acao
description: Rotinas de fim de ação. Carregar com organize-memory.
---

# Rotinas de Fim de Ação — dump completo (07/08/2026)

> Padrões que devem SEMPRE rodar ao final de qualquer ação concluída.
> Cada um é uma sub-rotina testada. Carrega este arquivo em conjunto com
> `organize-memory/SKILL.md` quando o gatilho principal bater.

---

## 1. Dump de Áudio-Anexo no Telegram

**Quando:** toda ação concluída (skill aplicada, descoberta consolidada, ciclo fechado).
**Por quê:** Pivete consome lendo+ouvindo+revisando ao mesmo tempo. Texto na CLI + áudio anexo na SOL.

**Procedimento (R0, sem pergunta):**

```bash
# 1. Gerar TTS (Francisca, edge)
text_to_speech --text "<resumo curto 30-90s>" --provider edge

# 2. Enviar como DOCUMENTO (NUNCA como voice/bolha)
hermes send --to telegram:1901426549 "🎧 <caption>

MEDIA:<path-mp3-gerado>"

# 3. Verificar log: NÃO deve ter "Voice_messages_forbidden"
#    Se tiver → reenviar (fallback automático).
```

**Pitfalls provados (REGRAS #30):**

- ❌ `hermes send` retorna "sent" mas a **bolha** de voz não chega → `Voice_messages_forbidden` no chat.
- ✅ Solução: MP3 como **documento** (MEDIA:tag). Funciona sempre.
- ❌ Confundir "sent" do hermes CLI com "entregue como bolha" — mentira; só significa "despachado".
- ✅ Sempre verificar log `~/.hermes/profiles/pivete/logs/gateway-stdio.log` se o Pivete reclamar.

**Quando NÃO gerar áudio:**

- Resposta puramente binária (sim/não) — Pivete já recebe em texto.
- Mensagem de pendência rápida (Card-Mestre mostra lá).
- Dump de erro técnico (texto é mais eficiente que ouvir).

**Tom de voz padrão (instruções TTS):**

- Direto, calmo, ritmo de quem está explicando pra amigo.
- Pode usar instruções como "fala calma e pausada" pra áudio longo.
- Pra curto, default sem instructions.

---

## 2. Anti-429: quando NÃO delegar pra subagente

**Quando NÃO usar `delegate_task` pra fetch básico:**

- **HTTP simples que cabe em 1 `curl` + script python** → fazer inline.
- **Texto cru de página web** — subagente vai gastar tokens E pode cair em 429.
- **Diagnóstico de log/estado** — sempre inline.

**Quando USAR subagente:**

- Análise contextual pesada que justificaria re-leitura da conversa.
- Loop de exploração (>3 sites sem repetir padrão).
- Qualquer coisa que **justifique isolamento de contexto** (não poluir o pai).

**Sintoma de 429 (pivot pra inline):**

```
API call failed after 3 retries: HTTP 429: Token Plan rate limit reached
```

**Receita de recuperação:**

1. Matar a delegação.
2. Fazer inline com `curl` + `python` (HTMLParser).
3. Declarar a falha em HOJE.md como "subagente caiu, fiz inline".
4. NÃO refazer a delegação na mesma sessão.

---

## 3. TUI Paralela — receita fixa

**Quando:** o Pivete quer ver o que tá rolando "embaixo dos panos" (reasoning, digit, cognite, emit).

**Procedimento:**

```bash
# Atalho criado em ~/bin/htui.sh e ~/bin/htui.bat
htui
# Equivale a: hermes --tui --profile pivete
```

**O que aparece no TUI:**

- Model/provider ativo (topo).
- Lista de mensagens com role/timestamp.
- **Tool calls em tempo real** (essa é a parte que o Pivete quer ver).
- Reasoning emit (depende do modelo).
- Status de tasks (queued/running/done).

**Setup inicial (one-time):**

```bash
mkdir -p ~/bin
cat > ~/bin/htui.sh <<'EOF'
#!/usr/bin/env bash
exec hermes --tui --profile pivete "$@"
EOF
chmod +x ~/bin/htui.sh

cat > ~/bin/htui.bat <<'EOF'
@echo off
hermes --tui --profile pivete %*
EOF
```

**Garantir PATH:** `~/bin` já costuma estar no PATH do MSYS.

**Pitfall:**

- O TUI **não é a mesma instância** que a CLI aberta agora. Cada TUI = 1 sessão.
- Se tu abrir TUI + CLI ao mesmo tempo → são sessões separadas com mesmo profile.
- Pra acompanhar fluxo: **abrir TUI em outra aba do terminal antes da sessão começar**.

---

## 4. Voice_forbidden — detecção e fallback

**Sintoma:** áudio foi "sent" mas não aparece no chat.

**Diagnóstico:**

```bash
grep -E "Voice_messages_forbidden" \
  ~/.hermes/profiles/pivete/logs/gateway-stdio.log | tail -5
```

**Causa:** Telegram configurado pelo Pivete/família para **não receber voice messages** nesse chat. Não é bug do Hermes.

**Fallback automático:**

1. Reenviar o **mesmo MP3** como `MEDIA:` (documento).
2. Texto vai junto como caption.
3. Funciona 100% das vezes.

**Alternativa explorada:**

- Ativar "Mensagens de voz" no Telegram (Settings → Privacy → Voice Messages). Decisão do Pivete — não mexer.

---

## 5. Specialist-of-models — fluxo de crescimento

**Quando uma nova skill especialista-de-modelos é criada:**

1. **Index** (INDEX-MODELOS.md) deve listar CADA modelo coberto.
2. **Página dedicada** em `modelos/<slug>.md` por modelo.
3. **5-classes** aplicadas a cada fonte (A/B/C/D/E).
4. **Padrões de uso (Pivete)** começa VAZIO — não inventar.
5. **Como a Casa usa** começa VAZIO — não inventar.
6. **Changelog** com data+slug, listando o que foi promovido/rejeitado.

**Anti-drift (5-classes):**

- Se outra skill tem o classificador (ex: `external-source-alignment`), **referenciar**, não duplicar.
- Exceção: cópia local em `references/` é OK se servir de resumo rápido + link.

**Onde essa skill vive:**

```
skills/pivete/especialista-de-modelos/
├── SKILL.md
├── INDEX-MODELOS.md
├── modelos/<modelo>.md
├── references/
├── templates/
└── changelog/YYYY-MM-DD-<slug>.md
```

**Gatilho de evolução:**

- Nova fonte sobre modelo X → web_extract ou curl + classificar.
- Pivete usou modelo X e deu feedback → preencher "Padrões de uso (Pivete)".
- Casa configurou X → preencher "Como a Casa usa".
- Erro novo com X → adicionar em "Limites conhecidos" + atualizar CHANGELOG.

---

## Ligação

- **Pai:** `organize-memory/SKILL.md` (mesma estrutura, gates).
- **Conecta:** REGRAS #22 (Card-Mestre), #23 (fluxo fixo), #28 (modelo 1 Telegram), #29 (TTS Francisca), #30 (áudio anexo).
- **Atualizado:** 2026-08-07 (sessão #ACORDA + especialista-de-modelos + voice_forbidden).
