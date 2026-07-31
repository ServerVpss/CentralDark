---
title: "Manifesto de fontes — SOL Voice-First Lab"
captured_at: "2026-07-31T03:32:00-03:00"
branch: "plan/sol-voice-first-pivete-hermes-lab-frozen-20260731"
status: "REFERENCE_ONLY"
---

# Manifesto de fontes — SOL Voice-First Lab

Este arquivo registra o material usado para consolidar a arquitetura. Referência inspira; CentralDark governa.

## 1. Pacote local MARKDOWN.zip

```yaml
uploaded_name: "MARKDOWN.zip"
sha256: "cb3605ff6f11e2632e06df121d145f59ee79dc2065ca01221aea47243d1f0ce2"
size_bytes: 1501381
zip_entries_total: 54
files_total: 50
directories_total: 4
markdown_files: 16
json_files: 1
html_files: 1
png_files: 32
original_local_root_declared_inside_package: "E:\\CentralDark\\grok-tela\\MARKDOWN\\"
```

### Conteúdo textual

```text
00-LEIA-PRIMEIRO.md
INDEX.md
index.html

01-humano/
├── 01-visao-geral-referencia.md
├── 02-arvore-produto-funcional.md
├── 03-modelo-de-negocio.md
├── 04-como-o-negocio-se-sustenta.md
├── 05-arquitetura-conceitual.md
├── 06-fluxos-usuario-e-valor.md
└── 09-glossario-e-checklist.md

02-ia/
├── 08-prompt-contexto-sonnet-vps.md
├── AI-CONTEXT-MASTER.md
├── AI-SCHEMA.json
└── AI-SWARM-PROMPT.md

03-central-dark/
├── 07-mapa-conversao-central-dark.md
├── 10-mapa-paginas-site.md
├── 11-ROADMAP-COMPLETO-PARA-SONNET.md
└── 12-MVP-MINIMO-VIABLE.md
```

### Leitura consolidada do pacote

O pacote documenta:

- cockpit multiagente;
- panes/sessões;
- conductor, scouts, builders, reviewers e executors;
- roteamento por papel e modelo;
- custo e budget hard-stop;
- missão, eventos e observabilidade;
- gateway OpenAI-compatible;
- BYOK e providers;
- Hub, Arsenal, Hermes, MCP e Supabase;
- instalação, onboarding, roadmap e modelo de negócio;
- enxame paralelo;
- screenshots de um app/laboratório de panes.

O arquivo `12-MVP-MINIMO-VIABLE.md` excluía voz e desktop naquele recorte anterior. A ordem atual do 👑 SEGREDO/CHEFE altera a prioridade para esta missão: **o primeiro MVP da SOL é voice-first**. O pacote continua válido como estudo de cockpit e execução, não como precedência sobre a intenção atual.

### Screenshots

As 32 imagens registram principalmente:

- cockpit escuro com panes;
- projetos e agentes;
- panes destacáveis;
- detalhes de terminal/modelo/token;
- modo código/chat;
- provider settings;
- interações e erros do laboratório.

Elas são referência de comportamento e fluxo, não autorização para copiar branding, layout ou código.

## 2. Imagens fornecidas na sessão

### Digital Worker / AI chatbot

Referência visual de:

- assistente em tela pequena;
- estados explícitos de busca, vector DB e análise;
- resposta conversacional;
- presença 24/7;
- superfície móvel/compacta.

### Overclock / arquivos locais

Referência de pesquisa anterior com:

- `01-humano`;
- `02-ia`;
- `03-central-dark`;
- markdowns, HTML e screenshots;
- estado local de estudo a preservar.

### n8n voice router

Referência conceitual:

```text
voz
→ transcrição
→ classificador de intenção
→ switch/router
→ tool
→ confirmação por voz
```

O CentralDark deve expandir isso para contratos, PIVETE/Hermes, gates, Mission Bus, agentes, swarms, evidência e retorno contínuo da SOL.

### Bridge / múltiplos terminais

Referência visual de:

- voz/listening;
- múltiplos agentes;
- sessões simultâneas;
- acompanhamento humano;
- necessidade de painel unificado.

## 3. Repositório CentralDark

### Branch congelada do CRM/sistema único

```text
plan/intencao-sistema-unico-deskcomm-20260730
```

Diferença medida contra `main` no momento da leitura:

- 1 commit à frente;
- 1 arquivo: `docs/ARQUITETURA/INTENCAO-CANONICA-SISTEMA-UNICO.md`;
- sem merge;
- intenção protegida.

### Branch sucessora desta arquitetura

```text
plan/sol-voice-first-pivete-hermes-lab-frozen-20260731
```

Criada a partir da branch acima para:

- preservar a fotografia anterior;
- corrigir nomes e papéis;
- registrar a SOL voice-first;
- manter CRM e app no mesmo corredor de estudo;
- não tocar na `main`;
- não tocar na branch local do Contrato Delta;
- não criar PR ou deploy.

### Evidências relevantes existentes

- `docs/GOVERNANCA/MODO-DE-PENSAR-PIVETE.md`
- `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
- `apps/modulos/centraldark-voice/content.js`
- `src/apps/modulos/telepainel/pages/ConscienciaViva.tsx`
- `docs/CONSCIENCIA/DESEJOS-FUTUROS-MEGA-PACOTAO.md`
- `docs/CONSCIENCIA/PIVETE-IA/`
- `apps/modulos/WebUI/personas/pivete-system.md`
- `apps/modulos/WebUI/custom-css/pivete-invocacao.js`
- `apps/modulos/elite-gateway/scripts/pivete_routes.py`

A auditoria futura deve alinhar essas superfícies ao cânone:

```text
SEGREDO/CHEFE = humano e autoridade
SOL = voz e orquestração direta
PIVETE = Hermes treinado
CASA/VPS = corpos do PIVETE
HUB = infraestrutura
```

## 4. Referências externas fornecidas

### Tauri

- documentação oficial Tauri v2;
- shell desktop leve;
- system WebView;
- janelas customizadas;
- tray, atalhos, posição, processos, sidecars e capabilities.

Classificação:

```yaml
role: "CANDIDATO_PRINCIPAL_PARA_SOL_DESKTOP"
copy_product: false
validate_on_windows: true
```

### Zellij

- terminal workspace;
- layouts e panes;
- plugins WASM;
- controle programático;
- permissões para ler panes, abrir terminais, executar e escrever em stdin.

Classificação:

```yaml
role: "CANDIDATO_PARA_LAB_E_BACKEND_DE_PANES"
replace_mission_bus: false
```

### HoloViz Panel

- panes e dashboards Python;
- JSON pane;
- protótipos rápidos.

Classificação:

```yaml
role: "PROTOTIPO_E_OBSERVABILIDADE"
primary_desktop_shell: false
```

### Cupertino Pane / PaneJS

- panes móveis e desktop;
- demo de chatbot;
- gravação/reconhecimento de voz;
- picture-in-picture;
- animações e temas.

Classificação:

```yaml
role: "REFERENCIA_DE_UX"
copy_brand_or_layout: false
```

### wygoralves/panes

- cockpit local-first;
- Tauri v2;
- React/TypeScript;
- Rust;
- xterm.js + portable-pty;
- SQLite;
- Git;
- Claude/Codex/OpenCode;
- terminais, diffs, approvals e trilha de auditoria;
- licença MIT.

Classificação:

```yaml
role: "UPSTREAM_CANDIDATO_DE_ESTUDO_PARA_AGENT_SPACE"
install_in_production_now: false
fork_now: false
preserve_license: true
```

### Anthropic Claude Code

- ferramenta agentic de terminal;
- entende codebase;
- executa tarefas, explica código e opera Git;
- possui hooks, plugins, skills e MCP;
- código/repositório sujeito aos termos comerciais da Anthropic.

Classificação:

```yaml
role: "ENGINE_EXECUTOR_SUBORDINADO"
copy_code: false
integration: "CLI/SDK/plugins/hooks conforme termos"
```

## 5. Referências conceituais

### Homem de Ferro / FRIDAY

Usado somente como metáfora funcional:

- conversa direta;
- voz em primeiro lugar;
- acompanha ambiente e sistemas;
- coordena ferramentas;
- antecipa necessidades dentro de limites;
- devolve estado e resultado.

Nome canônico permanece SOL. Não copiar personagem, marca, voz ou material protegido.

## 6. Regras de uso do material

- nada entra cru;
- não copiar produto, marca, preço ou UI;
- medir licença;
- localizar origem;
- adaptar ao CentralDark;
- código determinístico antes de IA;
- um escritor por escopo;
- nenhum executor se autoaprova;
- sem secrets;
- sem produção;
- sem merge;
- branch congelada serve para estudar, testar direção e preparar missão posterior.

## 7. Próxima prova recomendada

```yaml
mission_id: "SOL-VOICE-FIRST-PROTOTYPE-01"
mode: "ISOLATED_LOCAL_LAB"
first_scope:
  - "Tauri shell"
  - "push-to-talk"
  - "STT"
  - "TTS"
  - "transcript"
  - "uma tool read-only"
  - "receipt"
excluded:
  - "CRM production"
  - "mass swarm"
  - "deploy"
  - "main"
gate: "PIVETE/SOL/SEGREDO roles validated + 20 voice cycles + no secret leakage"
```

Este manifesto registra fontes e conclusões. Não executa código.
