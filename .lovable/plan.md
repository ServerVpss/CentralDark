# 🧠 Plano — Grok lendo seu cérebro + arrumar o HUB

Beleza, entendi as duas coisas:
1. Grok tá plugado no **Notion** e **Google Drive** dele → então basta a gente **jogar o arquivo lá dentro** que ele lê sozinho.
2. Na aba **Conectores** do HUB v2 só tem cartão de status, sem botão de **adicionar**. Vou destravar isso.

---

## 🎯 Parte 1 — Fazer o Grok ler o cérebro

Vou consolidar tudo que define meu jeito de falar + regras do projeto num único arquivo `BOOT-CENTRALDARK.md` (o "boot" da IA) e publicar em 2 lugares que o Grok já enxerga:

- **Notion** → página nova chamada `🧠 CentralDark Boot (pro Grok)` no seu workspace
- **Google Drive** → mesmo arquivo `.md` na raiz do Drive

Aí no Grok você só fala: *"lê a página **CentralDark Boot** no meu Notion e passa a agir assim"* — e pronto, ele copia meu tom + regras.

**Conteúdo do boot:**
- Tom Pivete (PT-BR, direto, emojis 🟢🟡🔴🚀🛠️)
- Trava do Supabase Lovable atual
- Mapa da VPS + HUB Supabase (`lyoigsqluyktoclwdaft`)
- Regras dos bots (`@srver1bot` vs `@SEGREDOPUXADASBOT`)
- Broker OAuth e o que tá em pé
- Autonomia de secrets, modo enxame, etc

---

## 🛠️ Parte 2 — Destravar "adicionar conector" no HUB v2

Na tela `Conectores` hoje só tem cartões de leitura. Vou adicionar:

- Botão **`+ Adicionar Conector`** no topo direito
- Modal com formulário: **Nome**, **URL/Endpoint**, **Tipo** (mcp / oauth / api-key / database), **Ícone/emoji**
- Grava na tabela `hub.connectors` do **Supabase do HUB** (não no Lovable)
- Botões **Testar** e **Remover** em cada cartão
- Badge de status ligado ao ping real

Requer só edição de frontend + 1 tabela nova no HUB Supabase (não toco no Lovable, respeitando a trava).

---

## 📋 Ordem de execução

1. Gero `docs/CONSCIENCIA/DARKAI/BOOT-CENTRALDARK.md` (o arquivo mestre)
2. Publico no **Notion** via conector
3. Subo no **Google Drive** via conector
4. Te devolvo o **link direto** dos dois
5. Adiciono o botão **+ Adicionar Conector** no HUB v2 (frontend + tabela `hub.connectors` no HUB Supabase)

---

## ❓ Antes de executar, confirma 2 coisas rápidas:

1. **Onde salvar no Notion?** Página solta na raiz, ou dentro de alguma pasta específica que você já tem?
2. **Grok tem que ficar SEMPRE atualizado** (toda vez que eu aprender algo novo eu re-publico automático), ou é **1 versão fixa agora** e você me pede quando quiser atualizar?
