# CentralDark: circuito vivo, conexoes e documentacao enxuta (2026-10-26)

## Intencao do CHEFE
Unificar Cockpit, Casa, VPS, GitHub, Supabase, Edge Functions, Realtime, conectores SSH e Skill Mae como UM organismo. Cada nova capacidade herda owners existentes, registra dependencias, causa, timestamp e SHA. Nenhum status verde por inferencia.

## Hierarquia do organismo
- Intencao humana -> SOUL/RULES -> AGENTS e CLAUDE (adaptadores) -> Skill Mae -> owners especializados.
- README.md raiz e o indice humano unico. LEIA-ME-IA.md continua entrada tecnica existente, sem apagar suas referencias. CLAUDE.md e AGENTS.md apontam para o mesmo indice em vez de duplicar contratos; documentos internos continuam bibliotecas. Apagar sem identificar consumidores e regressao.
- Main GitHub e livro versionado. Casa e VPS executam por SSH owner existente. Git/SSH direto permitido por escopo autorizado; rodar CI pesada nao e pre-requisito para editar, mas testes/contraprovas pertinentes permanecem obrigatorios.
- Um writer por escopo. Por alteracao: arquivo com owner e doc_ref, codigo, razao da mudanca, alternativa rejeitada, timestamp UTC real, SHA, teste, readback, ultimo build e next_cursor. Atualizacao automatica registra apenas evento realmente observado.

## Rotas canonicas e Edge
- API produto: /api/<capacidade> no gateway CentralDark existente, com upstream nomeado, auth, owner, dependencia, data e prova. Rota PROPOSTA != rota ATIVA. Cada conector possui catalogo de sua rota e host, sem criar gateway paralelo.
- Supabase Edge Functions gerenciam entrada/validacao/comando curto (ex.: agent-log, mcp-call, vps-exec, notify-event); Hermes, SSH e Screenpipe sao runtimes nos hosts, nao Edge. Reusar funcoes existentes.
- Screenpipe API nativa: localhost:3030/health e /search. A rota de produto /api/screenpipe e alvo de integracao via ponte autenticada; nunca expor arquivos de captura, tokens ou API local abertamente. Na Casa, 3030/health NAO respondeu no teste de 26/10; 8080 era Vite Cockpit e respondeu 200. Na VPS a mesma porta pode pertencer a outro processo (Graph Panel); exigida assinatura real de Screenpipe.
- Localhost sempre significa o host que o consulta. Casa 127.0.0.1 e VPS 127.0.0.1 nao sao uma unica porta; verificar os dois lados pelos mesmos identificadores, versao, build e rota.

## Realtime so para eventos reais
- Owner dos eventos de agentes: public.agent_events; escrita oficial pode ocorrer via Edge agent-log. Eventos de missao: public.hub_mission_events. Evidencias finais: hub_evidence e receipt do owner.
- Owner UI: FeedVivoCentralDark.tsx dentro SyncCenter.tsx e Cockpit atual. Leitura HTTPS com sessao Supabase, publishable key e RLS; sem service_role no navegador. Dois canais postgres_changes de INSERT, fallback de consulta 60 segundos.
- Supabase migration 20261026100120 aplicada: acrescentou agent_events e hub_mission_events a publication supabase_realtime JA existente. notifications_log e radar_pulses ja participavam.
- Verde STREAM_ON significa que o websocket foi assinado; pisca apenas quando chegou INSERT. Estado do evento esta em sua linha. Nenhum evento nao comprova inatividade de todos executores. Nenhum evento concluido pode ser inventado.
- Feed requer login. Dados de agent_events possuem RLS admin-only; banco (notificacoes, evidencias, missoes) nao deve ter GRANT anon extra por essa interface.

## Conexoes e administracao
- Setor Cockpit: Minha Oficina -> Sync Center -> Dominio do Loop -> Duas vias; ConexoesCentralDark para inventario de provedores. Cada host/VM novo tem identidade SSH, dependencia/versao propria, fonte e receipt. O template plugavel e reusavel, nao replica segredo.
- SSH Casa->VPS e VPS->Casa ja foram testados para READ_ONLY; prova de leitura nao significa sincronizacao automatica de arquivos, controle remoto de GUI nem deploy. Duas direcoes exigem comprovacao independente.
- Windows monitores: usar exclusivamente a funcao nativa `Configurações` -> `Sistema` -> `Tela` -> `Identificar` na sessao fisica local. Ela exibe o numero grande correspondente em cada painel e prova a topologia visual sem alterar configuracao. Registrar o numero, posicao, modelo, conexao e serial; confrontar identidade com `WmiMonitorID` + `WmiMonitorConnectionParams`. Nao arrastar monitores, alterar resolucao, modo de projecao ou aplicar configuracao. Se execucao remota ve WinDisc/desktop virtual, retorna UNKNOWN e exit 2, nao inventa quatro monitores.
- Acao de identificar a tela fisica so pode vir do executor local autorizado, nao de JS em servidor remoto.

## Inventario de owners
| Escopo | Fonte e owner | Dados a manter |
|---|---|---|
| API | api.centralldark.com; gateway existente | endpoint, upstream, auth, version, deploy_sha |
| Edge | Supabase projeto CentralDark; supabase/functions | funcao, owner, status, verify_jwt e logs |
| Dados | Supabase public / api / hub | schema, RLS, grants, views, migrations, publication |
| Feed | SyncCenter; agent_events e hub_mission_events | event_id, origin, state, measured_at, TTL/receipt |
| Execucao | Hermes/SSH Casa e VPS | host, PID, porta, comando autorizado, prova readback |
| Telas | Windows AllScreens; UIAutomation | monitor_id, janela, geometria, sessao |
| Docs | README -> LEIA-ME-IA + RULES + AGENTS + CLAUDE + Skill Mae | source, reason, updated_at, SHA |

## Publicar sem complexidade paralela
O botao principal de Publicar no Cockpit deve chamar owner de build/deploy existente com revisao do delta, mantendo rollback e status separado. A versao exibida no README e SHA da ultima publicacao COMPROVADA, nao o ultimo commit isolado.
Ciclo: INTENCAO -> COCKPIT -> GITHUB MAIN -> CASA/VPS -> SUPABASE/EDGE/API -> READBACK COCKPIT -> RECEIPT -> NEXT_CURSOR.

## Prova e limites desta mordida
- Supabase migration de publication verificada na mesma data.
- Fonte Casa Screenpipe 3030 nao respondeu; Cockpit local na 8080 respondeu HTTP 200; API /health respondeu HTTP 200.
- **Recibo fisico 2026-10-28 — MONITORES_FISICOS=PASS:** `Configurações > Sistema > Tela > Identificar` exibiu os numerais fisicos e confirmou a topologia: `3 = esquerda`; `2 = centro superior`; `4 = centro inferior`; `1 = direita`. Windows confirmou a identidade: Display 1 = AOC 24G2W1G4 / DisplayPort / `ATNMBXA002919`; Display 2 = AOC 24G2W1G5 / DisplayPort / `ATOM8XA000468`; Display 3 = AOC 24G2W1G4 / HDMI / `ATNM4XA002193`; Display 4 = DELL S2421HN / HDMI / `4JD4DQ3`. Nenhuma configuracao grafica foi alterada.
- A GUI remota que reportar WinDisc ou desktop virtual continua tendo apenas evidencia remota e nao revoga nem substitui este recibo fisico.
- NEXT_CURSOR: antes de qualquer acao visual, executar Identificar nativo na sessao fisica e conferir o numero da janela-alvo; os demais cursores de Feed/API seguem independentes.
