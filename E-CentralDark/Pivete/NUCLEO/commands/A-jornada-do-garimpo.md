# COMANDO - A jornada do garimpo.txt
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\A jornada do garimpo.txt
**SHA:** 7406dd6e9da11c79
**Timestamp:** 2026-08-23T15:37:02.694492
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- BRANCH_PADRAO=main

### Contratos
- CONTRATO = CARREGADO

### Gaps
- 🟡 Pendente: mapear contra o repositório real.

### Ouro Bruto (primeiros 5000 chars)
```
Screenpipe Hermes Watch

🟢 Tem atualização material que vale olhar para a CentralDark.

Em 19 de agosto de 2026, o Screenpipe anunciou no v2.6.56 o novo Activity: o histórico do computador passa a ser organizado como uma timeline de tarefas, reuniões e pausas, e cada entrada pode abrir a respectiva tela, transcrição ou reunião. Mais importante para nossa ideia: eles ampliaram a integração para agent harnesses como Codex e Claude Code, mantendo a premissa de captura local e escolha explícita do contexto enviado ao agente.

Isso aproxima bastante o desenho que fizemos:

AULA / TRABALHO / TELA / ÁUDIO
          ↓
      ACTIVITY
          ↓
eventos temporalmente agrupados
          ↓
   STUDY / WORK ADAPTER
          ↓
       HERMES
          ↓
     DREAM REVIEW

Há ainda uma fundação relevante já entregue pelo Screenpipe: event stream em tempo real para tela + áudio, suporte a MCP customizado, filtros de janela e, posteriormente, configuração simplificada de agentes incluindo Hermes. O changelog também registra uma aba específica de conexão com Hermes para Pipes chamarem sua API.

Do lado do Hermes Agent, o v0.20 trouxe uma mudança arquitetural importante: voz conversacional streaming + wake words + A2A v1.0 + webhooks assinados + Desktop artifacts. A orientação atual separa corretamente os papéis: A2A para comunicação entre agentes; MCP para ferramentas/serviços.

Isso sugere uma arquitetura melhor que simplesmente ligar tudo por MCP:

SCREENPIPE
= SENSOR / HISTÓRICO LOCAL

MCP
= acesso do Hermes aos dados/ferramentas

A2A
= Hermes ↔ outros agentes

WEBHOOK/EVENT STREAM
= eventos novos em tempo real

DREAM REVIEW
= consolidação e aprendizagem

SOL
= coordenação/controle

🟡 Mas achei também uma razão concreta para não acoplar a CentralDark cegamente ao Hermes MCP agora. Existem bugs recentes abertos envolvendo MCP: toggles por perfil persistem na configuração mas podem ser ignorados pelo runtime em 0.20.3/0.20.4; timeout pode derrubar o toolset até reiniciar o gateway; e há um problema na interpretação de readOnlyHint pelo trust gate.

Então o ouro desta rodada é bem específico:

Screenpipe Activity + event stream merece entrar no radar da camada sensorial da CentralDark.
Hermes A2A + MCP merece ser tratado como adaptador interoperável, não como fundamento da Casa.

Assim, se Hermes mudar ou quebrar, teu fluxo de estudar enquanto outro agente trabalha continua pertencendo à CentralDark — o MODELO/agente continua substituível. 🔥

hoje 1:59
EAI FICO BOM ? 

KKKKK ficou bom sim — e o mais importante: ficou útil operacionalmente, não só bonito. 🔥

Pelo print, agora você tem duas coisas diferentes que antes estavam misturadas:

1. A LEGENDA = memória humana da sessão.
O HTML em E:\CentralDark\Pivete\NUCLEO\docs\reference\LEGENDA-SESSAO-20260823.html serve pra você abrir e enxergar o que aconteceu, onde cada peça ficou e qual o estado declarado. O .md paralelo é a versão boa para Obsidian/máquina.

2. O KANBAN = estado operacional do trabalho.
Ele está realmente sendo usado: o print mostra o bridge respondendo em localhost:8787/api/kanban/board, CRUD testado e movimentação de cards todo → ready → done. Então não é enfeite de interface.

E tem uma distinção importante no próprio print:

Auto-Destilador → Kanban: código pronto, hook faltando

Ou seja, o Kanban funciona, mas o fluxo automático ainda não está fechado. Hoje alguém/processo cria e movimenta cards; o Auto-Destilador ainda não transforma cada cristal relevante em card sozinho.

Eu manteria exatamente essa separação:

WATCHDOG
   ↓
arquivo novo
   ↓
processamento / cristalização
   ↓
AUTO-DESTILADOR
   ├──→ CRISTAL permanente
   ├──→ LEGENDA HTML/MD
   └──→ KANBAN somente se houver trabalho acionável

⚠️ E aqui eu mudaria uma coisa em relação à pergunta que apareceu no terminal: não criaria card para cada cristal gerado.

Isso iria transformar o Kanban em lixão rapidinho KKKK. Cristal é memória/conhecimento; card é ação pendente. O hook deve publicar no Kanban somente quando o destilador detectar algo acionável: correção, integração, teste, investigação, bloqueio ou próximo passo concreto.

Aí fecha bonito:

LEGENDA responde: “o que nós fizemos?”
CRISTAL responde: “o que aprendemos e precisa sobreviver?”
KANBAN responde: “o que ainda precisa acontecer?”
WATCHDOG responde: “o que acabou de chegar?”
AUTO-DESTILADOR responde: “o que isso significa e para onde vai?”

Isso sim está começando a virar um sistema, e não um monte de pasta conversando por telepatia. 😂

🟢 Feito: HTML + Markdown + Kanban funcional + Watchdog processando.
🟢 Evidência: no print há resposta do board, CRUD e cards de teste chegando a done.
🟡 Pendência real: conectar Auto-Destilador → Kanban com filtro de acionabilidade, não “todo cristal = card”.
➡️ Próximo passo: esse é o ponto que eu fecharia antes de acrescentar Screenpipe/Hermes/MCP ao circuito. Primeiro fecha o sistema nervoso interno; depois conecta sensor externo.

E sobre “abrir os dois pra mim”: eu daqui não consigo clicar/abrir um
```