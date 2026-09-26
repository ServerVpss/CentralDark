# Hermes WebUI - Documentação Operacional

**Fonte:** `E:\CentralDark\Pivete\hermes_guide.html`  
**Data:** 2026-08-24 20:32:00 -0300  
**Status:** ✅ OURO EXTRAÍDO  
**Owner:** SEGREDO/CHEFE  
**Classificação:** CANÔNICO (UI/UX Reference)  

---

## 🎯 ESTRUTURA DA WEBUI

### Arquitetura de Mensagens

A Hermes WebUI é estruturada em torno de um sistema de mensagens flexível com os seguintes componentes:

#### 1. Empty State (Estado Vazio)
- Renderizado dentro de `#messages` quando `S.messages` está vazio
- Logo + título + subtítulo + 3 botões de sugestão
- Altura mínima: 340px

#### 2. Mensagens do Usuário
- **Alinhamento:** Direita (right-aligned bubble)
- **Identificação:** Sem avatar/label - o alinhamento e a bolha colorida identificam o remetente
- **Timestamp + edit/copy:** No `.msg-foot` abaixo da bolha, revelado no hover
- **Anexos:** `.msg-files` acima do corpo da mensagem (alinhado à direita)

#### 3. Mensagens do Assistente
- **Estrutura:** `.msg-row.assistant-turn` contém:
  - Um header de papel (role)
  - `.assistant-turn-blocks` (coluna de um ou mais `.assistant-segment`)
- **Cada segmento** pode conter:
  - `.thinking-card` (cartão de raciocínio)
  - `.msg-body` (corpo da mensagem)
  - Seu próprio `.msg-foot` (copy / regen)

#### 4. Cartão de Razão (Thinking Card)
- Mostra o raciocínio do modelo
- Pode ser expandido/colapsado
- Contém o chain-of-thought

---

## 🎨 ELEMENTOS DE UI

### Componentes Principais

#### Mensagem Básica
```html
<div class="msg-row" data-role="user">
  <div class="msg-body">
    <p>Conteúdo da mensagem</p>
  </div>
  <div class="msg-foot">
    <span class="msg-time">10:42</span>
    <span class="msg-actions">
      <button class="msg-action-btn" title="Edit">...</button>
      <button class="msg-copy-btn msg-action-btn" title="Copy">...</button>
    </span>
  </div>
</div>
```

#### Mensagem com Anexos
```html
<div class="msg-row" data-role="user">
  <div class="msg-files">
    <span class="msg-file-badge">📎 architecture-notes.pdf</span>
    <span class="msg-file-badge">📎 Q1-forecast.xlsx</span>
    <span class="msg-file-badge">📎 meeting.docx</span>
    <span class="msg-file-badge">📎 screenshot.png</span>
  </div>
  <div class="msg-body">
    <p>Please review these docs and summarise the key decisions.</p>
  </div>
</div>
```

#### Modo de Edição
```html
<div class="msg-row" data-role="user" data-editing="1">
  <textarea class="msg-edit-area">Mensagem editada...</textarea>
  <div class="msg-edit-bar">
    <button class="msg-edit-send">Send edit</button>
    <button class="msg-edit-cancel">Cancel</button>
  </div>
</div>
```

---

## 📱 PLATAFORMAS DE MENSAGENS

A WebUI é projetada para funcionar com:
- Telegram
- Discord
- Slack
- WhatsApp
- Signal
- Email
- Google Chat
- LINE
- SimpleX Chat
- Microsoft Teams
- ... e mais

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 1. Commands Slash
- `/model` - Trocar modelo
- `/handoff` - Transferência de contexto
- `/search` - Busca
- `/skill` - Gerenciamento de skills
- `/memory` - Gerenciamento de memória

### 2. Integração com Ferramentas
- Execução de comandos
- Acesso ao sistema de arquivos
- Navegação na web
- Uso de ferramentas externas

### 3. Gerenciamento de Sessão
- Histórico persistente
- Multiple sessions
- Compartilhamento de contexto

### 4. Configuração
- Tema (light/dark/system)
- Skin (várias opções)
- Tamanho da fonte
- Painel de workspace

---

## 🏗️ ESTRUTURA DE ARQUIVOS

```
hermes-webui/
├── docs/
│   └── ui-ux/
│       ├── index.html          # Inventário de UI de mensagens
│       └── two-stage-proposal.html
├── static/
│   ├── index.html          # App principal
│   ├── share.html           # Compartilhamento
│   ├── style.css            # Estilos principais
│   ├── pwa-startup.js       # Startup PWA
│   └── vendor/              # Dependências vendored
└── tests/
    └── test_mobile_scroll_jank.html
```

---

## 🎯 CONEXÃO COM CENTRALDARK

Esta documentação é **Referência de UI/UX** para:
- Entender a interface do Hermes WebUI
- Configurar temas e skins
- Gerenciar sessões e mensagens
- Integrar com plataformas de mensagens

**Owner:** SEGREDO/CHEFE  
**Status:** ✅ CANÔNICO  
**Uso:** Referência de interface para Hermes na CentralDark
