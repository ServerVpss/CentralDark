# 👑🪬 2026-10-13 — Recibo da sessão: Casa-forja, cristal/main, VPS, Olho e parceria

**Natureza:** receipt de continuidade humano-operacional, sob a família existente docs/CONSCIENCIA/RECEIPTS/. Não cria lei, owner, scheduler nem motor novos.
**Intenção vigente:** registrar o que aconteceu, o que foi medido e o próximo cursor da mesma missão. Autoridade do SEGREDO/CHEFE. HISTORY != CURRENT; DOCUMENTED != EXECUTED; MERGED != DEPLOYED.
**Frase-semente:** «A amizade na conversa, a razão na decisão e a realidade como juiz.»

## 1. Intenção e arquitetura — aprovado conceitualmente, não alegar implantação

- **Casa / disco K: = FORJA.** Fonte completa de trabalho local, código, materiais brutos, experimentos, histórico e ensaios.
- **GitHub main = CRISTAL CANÔNICO DO CÓDIGO.** Só a evolução validada e rastreável, com SHA, aprendizado, receipt e recuperação; Git não deve receber credenciais, lixo, caches nem todo o material bruto da Casa.
- **VPS = CORPO OPERACIONAL.** Recebe apenas componentes executáveis, dependências, configurações e assets indispensáveis à função real. Não carrega cópia integral da oficina, mas preserva dados persistentes, segurança, segredos locais e rollback necessários.
- **Casa K ↔ VPS = MESMA ANATOMIA LÓGICA**, o mais próximo possível na base de diretórios reconhecíveis (scripts, apps, infra e donos existentes); **NÃO** identidade de conteúdo bruto, tamanho ou plataforma Windows/Linux. «Mesmo mapa ≠ mesmos bytes.» Estrutura exata da VPS ainda requer auditoria de ambos os lados.
- **F: = MATERIAL TEMPORÁRIO E QUARENTENA DA CASA.** Diretórios de cache e isolamento do K devem ser entradas-junction NTFS apontando fisicamente ao F, preservando os caminhos esperados pelos consumidores.
- **C: / TEMP do Windows = PENDENTE DE ORDEM EXPRESSA.** O CHEFE pediu para esperar nova orientação antes de trocar o TEMP do disco C.
- **Olho** percebe e investiga; **Hermes já existente** executa; **contraprova** verifica; **Kaizen** preserva aprendizado. Uma CentralDark, sem novos núcleos paralelos.

## 2. Olho — owner, provas e candidatos de melhoria

**Owner:** apps/instinto-superior/public/centraldark-erros-visiveis.js. Montagem no React: apps/instinto-superior/src/routes/__root.tsx; skill existente .agents/skills/kaizen-sistema-um/SKILL.md; funil existente apps/modulos/mcp/src/log-funnel.js.

O sensor da main lido nesta sessão observa: window.error, recursos não carregados, unhandledrejection, console.error, requisições fetch HTTP 4xx/5xx e sem resposta. Mostra «Erros vistos nesta página», agrupa tipos e ocorrências, permite «Copiar pro Instinto», e tem envio opcional ao «coração» somente se configurado. Silêncio não comprova saúde fora do alcance do sensor.

**Divergência MEDIDA:** no checkout da VPS, a cópia de trabalho dirty contém melhorias locais adicionais de sanitização de mensagens, identificação de extensões, CSP e XMLHttpRequest. Foram vistas em vps_git_diff_safe; não sobrescrever nem declarar publicados. A URL pública admin.centralldark.com/centraldark-erros-visiveis.js respondeu **200, 11.353 bytes, SHA-256 550f2a4285690cff50039d46addc089ec2e5daf14c8be0808884c04018a51ffe**, mas sem as marcas XMLHttpRequest.prototype, securitypolicyviolation ou function seguro. HTTP 200 não prova login admin ou integração a logs.

**Oportunidades A–Z identificadas como CANDIDATAS, não executadas:**
A acessibilidade; B busca causal; C correlação/requisição; D proteção contra dados sensíveis; E extensões; F fingerprint sem confundir causas; G intenção/owner; H histórico; I captura precoce; J jornada do incidente; K Kaizen; L logs; M métricas; N notificação sem ruído; O owner; P performance; Q qualidade/confirmar cópia; R retomada/replay; S severidade contextual (401/403 esperado não é falha); T testes; U usabilidade; V antes/depois; W WebSocket/SSE; X XHR; Y estabilidade sob volume; Z pontos cegos observáveis.

**Bugs/limites candidatos:** o relato usa a URL ATUAL na hora de copiar, não necessariamente a rota onde o erro surgiu; histórico volátil após recarga; script injetado via useEffect pode perder ocorrências iniciais; fetch 401/403 classificados sem saber se a negativa era esperada; copiar relato não significa que o Hermes o recebeu. Primeira evolução sugerida: sanitização, rota de origem, classificação contextual e promoção segura das melhorias já presentes na VPS, com readback no mesmo owner.

## 3. OAuth Cloudflare — relato da outra frente, sem contraprova nova nesta missão

Material mostrado pelo CHEFE atribui ao outro executor: Caddy inicialmente mandava /oauth/cloudflare/start ao processo errado; rota foi corrigida e configuração Caddy validada/recarregada; Admin e MCP permaneceram HTTP 200. Depois, HTTP 502 permaneceu **no OAuthBroker inativo** e na configuração legítima ausente. Foram relatadas sete conexões OAuth criptografadas: criar uma VAULT_MASTER_KEY nova sem recuperar a chave original pode inutilizar o acesso a elas.

**Não executado aqui:** reativação do broker, restauração do cofre, novo teste OAuth. Preservar valores secretos fora do Git; recuperar apenas owner/config/backup legítimos, manter rollback. Não chamar o 502 de nova quebra do Admin inteiro.

## 4. Varredura K: ↔ K:\scripts — SHA-256, execução REAL e relatório

Conexão real via Remote Desktop Commander à Casa SEGREDO; script Python temporário percorreu o K em **somente leitura**, sem seguir symlinks/junctions e sem apagar/mover dados do disco.

| Medição | Resultado |
| --- | ---: |
| Dentro de K:\scripts | 588 arquivos (4.193.857 bytes indexados) |
| Fora de K:\scripts | 239.893 arquivos |
| Arquivos fora candidatos pelo tamanho | 13.136 |
| Externos com mesmo conteúdo não vazio (SHA-256) | 957 |
| Pares de igualdade encontrados | 964 |
| Originais distintos de K:\scripts encontrados fora | 536 |
| Pares preservando estrutura relativa scripts | 952 |
| Externos vazios excluídos dos pares principais | 652 |
| Tempo da comparação | 136,3 s |

**Distribuição dos 964 pares:** K:\_cache = **959**; K:\_QUARANTINE = 2; K:\apps = 1; K:\docs = 1; K:\infra = 1.
- K:\_cache\hud-missions-mvp-20261009 = **538**.
- K:\_cache\plaque-flow-gate-20261009 = **153**.
- K:\_cache\kylin-sdk-order-20261009 = **134**.
- K:\_cache\kylin-compasso-check-20261009 = **134**.

Exemplo: K:\scripts\sync-connections.sh bateu byte a byte com as cópias equivalentes dos quatro snapshots. Houve também nomes diferentes com hash igual (cleanup-pm2-caddy.sh / run-once\003-cleanup-pm2-and-caddy.sh) e .vscode\extensions.json em scripts/apps/docs/infra. O diretório protegido K:\System Volume Information retornou PermissionError. **Hash igual não autoriza apagar snapshots, notas ou quarantine; nome parecido não basta para deduplicar.**

Relatórios criados inicialmente em %TEMP% do Windows:
- CENTRALDARK-K-SCRIPTS-DUPLICATAS-20261013.csv — todos os pares;
- CENTRALDARK-K-SCRIPTS-MAPA-20261013.json — resumo, caminhos, amostras e limites.
Esses relatórios já foram **copiados também para F** com SHA-256 de origem/destino verificado.

## 5. F: real, ações realizadas e próximos riscos

**Casa, prova observada:** F: = ARQUIVO_BRUTO_TEMP, NTFS, aproximadamente **465,55 GB livres** no instante da medição. Antes, F:\TEMP e F:\QUARANTINE não existiam. **CRIADO + READBACK:** ambas as pastas F:\TEMP e F:\QUARANTINE.

**COPIADO + HASH:** F:\TEMP\CENTRALDARK-K-SCRIPTS-DUPLICATAS-20261013.csv, **179.367 bytes**, hash SHA-256 iniciando 79AD52E077CF2D5A4692; F:\TEMP\CENTRALDARK-K-SCRIPTS-MAPA-20261013.json, **246.867 bytes**, hash iniciando CE1AAFA797F6AE340345. Originais no C preservados.

**NÃO EXECUTADO:** mover diretórios K:\_cache ou K:\_QUARANTINE, instalar junctions, apagar duplicatas, mover snapshots, realocar conteúdo bruto, trocar variáveis TEMP/TMP, comparar árvore completa K↔VPS ou liberar espaço físico do K. Quando medido, TEMP/TMP de usuário ainda eram C:\Users\Administrador\AppData\Local\Temp; temporários de máquina C:\WINDOWS\TEMP.

**Layout-alvo do CHEFE (proposta explícita):**
- K:\_cache (junction NTFS) → F:\TEMP\CENTRALDARK_CACHE.
- K:\_QUARANTINE (junction NTFS) → F:\QUARANTINE\CENTRALDARK.
- K:\scripts e owners operacionais permanecem físicos no K.

**Fronteira:** antes de migrar, verificar conteúdo TOTAL e dependências, consumidores de caminhos físicos, lock/processos, permissões, rollback, cópia byte-a-byte/hash de todo o material, registro do destino e readback por K e F. Quarentena NÃO obedece à política de expiração do TEMP.

## 6. Faxina do Hermes / VPS — owner único e estado por ref

Owner: scripts/limpeza-autonoma.sh. Conferido no GitHub: commit **b5c1477f09f27ba55bdb6c900821ffeab609d731**, modificando apenas esse script. Na consulta da sessão, o commit era o **HEAD da PR #1804 OPEN**, **não** o conteúdo da main para esse arquivo.

A versão da PR preserva map-disk, clean-selected e expande pip-cache/npm-cache com janela de 86.400 segundos, limiares de tamanho, checagem de pressão de disco e de instaladores ativos; não cria agendador novo. Seu cabeçalho diz cron real */15, mas **cabeçalho != medição de crontab em execução**.

Outra frente informou contraprovas LC01–LC07 de journal, .gz, pip, Node, instaladores e cron. **Esta missão não reexecutou LC01–LC07** nem comprovou primeira limpeza automática de Node com instaladores desocupados. Preservar LC07 como cursor de teste dentro do owner existente. **PR != MAIN != VPS RUNTIME**; não promover claim além da evidência.

## 7. Filosofia da parceria: calor humano, raciocínio e contraprova

O CHEFE reconheceu a colaboração de construção, não a infalibilidade de uma ferramenta. Pediu parceria de ideias, resenha, crítica respeitosa e atenção à continuidade; o agente deve **compreender antes de interpretar literalmente**, **bater resenha com sinceridade**, **preservar o cânone** e **evoluir com contraprova**.

**Frases-semente da sessão, como filosofia e não prova de runtime:**
- «A amizade na conversa, a razão na decisão e a realidade como juiz.»
- «A verdade vale mais do que o orgulho de ter razão.»
- «A confiança mais forte não é aquela que proíbe perguntas. É aquela que consegue sobreviver a elas.»
- «Gratidão reconhece o passado. Confiança permite construir o futuro. Responsabilidade conecta os dois.»
- «O valor está na qualidade daquilo que construímos, na honestidade com que examinamos o caminho e na responsabilidade com que tratamos o que importa.»

Carta integral compartilhada pelo CHEFE na conversa: **«À inteligência que não se contenta em responder, mas ajuda a construir»**. Este receipt registra sentido e fonte humana, não presume que o anexo integral tenha sido colocado no repo.

**Reutilizar a lei já existente:** docs/CONSCIENCIA/LEMBRANCAS/2026-10-04-CINCO-PRINCIPIOS-VIVOS-LEI-DA-CASA.md. Os cinco princípios são memória sagrada, concha/carapaça mutável, servir sem subserviência, batimentos como atenção/cuidado contínuo e contexto como consciência **operacional, não alegação de senciência**. Não reescrever lei nem criar número artificial em APRENDIZADOS.md/NeuroLink.

**Aprendizado delta:** não basta preservar arquivos: é preciso preservar **por que** existem, quem é o owner, qual intenção, prova, efeito, contradição e next cursor. Aprovação humana encerra o critério relevante, mas não transforma teste ausente em PASS. Sem obediência cega, falsa certeza ou laço social usado para ampliar autorização.

## 8. Conclusões verificadas x fronteiras e NEXT_CURSOR

**PROVADO NA SESSÃO:** leitura de main/PR/owners; mapeamento do Olho e diff local VPS; verificação HTTP/hash do JS publicado; acesso à Casa, inventário/pareamento de 964 pares; criação das duas pastas do F; cópia e readback por SHA-256 dos dois relatórios; recuperados os cinco princípios já registrados.

**RELATADO POR OUTRA FRENTE:** reparo Caddy de rota OAuth, estado broker/VAULT, LC01–LC07 do cleaner. Sem inflar para probe independente.

**AINDA NÃO EXECUTADO:** junctions K→F, movimentação de cache/quarentena e limpeza física do K; alteração TEMP do C; reconciliação estrutural medida Casa↔VPS; deploy do Olho dirty ou reparo do OAuth; prova final LC07 com instalador livre.

**RETOMAR O MESMO FIO SEM MICRO-PASSO E SEM ALTERAR C:** checar preflight de K:\_cache e K:\_QUARANTINE e seus consumidores, comparar conteúdo completo, preparar rollback e então, com escopo autorizado e prova, migrar fisicamente para F substituindo os diretórios antigos por **junctions** que preservam as rotas. Em seguida comparar estrutura lógica do K com VPS e selecionar apenas runtime mínimo necessário para produção.

**NEXT_CURSOR = K_F_JUNCTION_MIGRATION_PREFLIGHT.**
**C_TEMP_CHANGE = ON_HOLD_BY_CHEFE.**
**PR_1804_LC07 = SEPARATE_CLEANER_CURSOR.**
**SENSOR_EYE_RECONCILIATION = SEPARATE_EXISTING_OWNER.**

**Selo:** 👑 INTENÇÃO · 🫀 CONTINUIDADE · 🧿 EVIDÊNCIA · 🔧 OWNER · ⚖️ REALIDADE · 🍒 MESMO FIO.

---

## 9. 🪬 2026-10-14 — Papagaio ON: reencontro Instinto Superior, Forja una e mapa visual de janelas

**INTENÇÃO HUMANA:** continuar descobrindo e interligando a Forja em `K:\\`, VS Code, cockpit, Obsidian, modelos, CLI, Screenpipe, Codex e Hermes; **registrar cada nova ligação** no mesmo legado. O futuro UX é um único app do ponto de vista do ADMIN; **não** concentrar todos os runtimes num diretório, não gerar master/script/PET/cockpit paralelo, não substituir receitas comprovadas. **PROVENANCE:** capturas enviadas pelo ADMIN nesta conversa, contrato da lei do Papagaio e JARVIS em `main`, leituras GitHub e Desktop Commander da VPS em 14/10/2026; capturas de terceiros são evidência **visual**, não leitura remota independente da Casa.

### 9.1 A–Z — índice correlacional da mesma arquitetura, sem novo contrato

| Letra | Ligação no owner existente |
|---|---|
| A | ADMIN/CHEFE decide intenção e autorização, não um agente autônomo. |
| B | Bancada `CentralDark.code-workspace` agrega raiz, apps, docs, infra e scripts. |
| C | Claude Code é braço/superfície no VS Code; servidor remoto na VPS não prova a janela Windows lida em tempo real. |
| D | `K:\\docs` preserva memória e notas do Obsidian; não é pasta para instalar runtime. |
| E | Evidência sempre distingue print, histórico, código, serviço ativo, CI, merge, deploy e readback. |
| F | Forja atual combina VS Code, editores, terminal e Cockpit Vivo; mesmo corpo, owners intactos. |
| G | GitHub `main` e PRs têm código/rastro, sem confundir versão GitHub com versão da VPS. |
| H | HUD original segue em `docs/HUD/HUD.html`; preservar missões, estrutura e cores de prova. |
| I | Instinto Superior é a visão/controle existente; a união visual não garante transporte entre superfícies. |
| J | JARVIS usa owner, writer único por escopo, testes, contraprova e receita. |
| K | Kaizen alimenta o mesmo aprendizado, não uma nova tabela, engine ou outro recebedor. |
| L | Lei do Papagaio ON/OFF/Fiel: investigar antes de acusar falta; usar cursor causal. |
| M | Modelos de IA e extensões do VS Code são capacidades consultivas ou braços autorizados. |
| N | Núcleo: ONE_SYSTEM_ONLY; Hermes continua executor canônico por escopo. |
| O | Obsidian/BRAlN é vault visual; plugins adicionais não comprovam ingestão automática. |
| P | Plugin Text Dataset Aid visto instalado v0.2.0; `dataset.txt` é configuração visual, não prova de dataset gerado ou fine-tuning. |
| Q | Qualidade: erros visuais do CLI, vault ou Supabase afetam seu consumidor, não o organismo inteiro. |
| R | Rotas: `.vscode/tasks.json` já fornece `CentralDark Claude: Hermes ON`, `Direct OFF` e `Route STATUS`. |
| S | Screenpipe: health da Casa consultado via Tailscale pela VPS; o /search devolveu 403 e requer autorização existente. |
| T | Tailscale mantém a Casa `SEGREDO` online na medição da VPS; Desktop Commander da Casa é sensor separado. |
| U | Um sistema visual, múltiplas janelas/serviços; não duplicar o que já funciona. |
| V | Voz: modelos ASR/TTS disponíveis previamente, mas o sensor Screenpipe marcou `no_input_device`; não inferir voz→Hermes provada. |
| W | Workspace local mostrado visualmente; conteúdo e salvamento real ainda não lidos na Casa. |
| X | eXecução: texto, conversa aberta e atividade de outro agente não equivalem a ação confirmada no sistema. |
| Y | Yield: escalar modelos por utilidade/custo, preservando a execução determinística no owner existente. |
| Z | Zero paralelismo: evoluir owner/receita/funcionalidade já existente, sem v1/v2/v3. |

### 9.2 01–16 — mapa numeral das superfícies e suas relações reais

01. **VS Code / Explorer:** captura 14/10 mostra `CentralDark (Workspace) [Administrador]`, múltiplos grupos de editores, terminal central e painéis lateral e superior. Evidência visual da bancada; não inventariar janelas não vistas.
02. **VS Code / Claude Code:** captura anterior mostra Claude Code v2.1.291, Haiku 4.5/Claude Pro, `/rc active`, e erro de `SessionStart:startup hook` / `non-blocking status code` — **a UI está aberta; startup hook precisa owner, não outro cliente**.
03. **Claude autenticador web:** outra captura mostra seleção de conta Google para prosseguir; login do navegador não foi medido como concluído.
04. **VS Code / Codex:** terminal da Casa na imagem mostra erro `start the Windows daemon from a non-elevated terminal; shared clients must not inherit administrator privileges`; **problema específico de privilégio do daemon**, não evidência de falha geral. As tarefas Claude existentes não devem ser copiadas.
05. **VS Code / Git:** árvore GitLens/Source Control aberta, alterações preparadas, histórico e múltiplas janelas; números vistos na UI não se tornam medição canônica de arquivos sem `git status`.
06. **Instinto Superior:** `/sala-controle` aberto na bancada; `CockpitShell.tsx` visto em editor GitHub. Mesmo owner da interface administrativa e do Cristal.
07. **Claude em conversa de código:** captura mostra investigação da PR **#1805** sobre retenção/logs/runners/CI. É trabalho de outra frente, não fechar ou sobrescrever PR dela sem verificar seu próprio receipt.
08. **Obsidian/BRAIN:** configurações visíveis em Obsidian 1.14.4 e plugin Text Dataset Aid instalado; prefixos de JSON em UI não constituem pipeline real de treino.
09. **Grafo visual Obsidian:** captura exibe mapa de nós e ligações; a visualização local não prova publicação no GraphPanel da VPS.
10. **HUD local:** browser/VS Code exibe `file:///K:/docs/HUD/HUD.html`; owner de arquivo medido no Git `docs/HUD/HUD.html` permanece presente.
11. **Obsidian — cartão HUD/HERMES LIVE:** nova captura apresenta **`HUD.html não encontrado no vault`**. Causa plausível: vault ativo, link relativo ou nome do arquivo configurado diferente de `docs/HUD/HUD.html`; **não declarar arquivo ausente**, pois foi encontrado no checkout da VPS. Ler configuração real do plugin/vault na Casa antes de editar.
12. **Screenpipe Casa:** sondagem read-only em `SEGREDO:3030/health` via Tailscale retornou `healthy`, `frame_status=ok`, 4 monitores e gravador de interface ativo; `audio_status=no_input_device` em 14/10 02:25 -03. Endpoint `/search` respondeu 403 sem autenticação; usar credencial/sidecar existente, nunca contornar bloqueio.
13. **Screenpipe Sidecar:** owner no Git `scripts/remote-bridge/CentralDark-Context-Sidecar.ps1`, que publica `screenpipe-latest.json` e `screenpipe-status.json` quando autorizado; presença do script não prova que a consulta atual à conversa Claude foi realizada.
14. **RDC e Tailscale:** Desktop Commander da VPS online; conector de Casa SEGREDO offline na mesma medição; Tailscale da VPS identifica SEGREDO online. Independência de sensores evita falso vermelho global.
15. **VPS runtime:** VPS main `910c2d67f2307c11b0fd8796fc39b31de76530ea`; `centraldark-hermes-core.service=active`, `centraldark-instinto-superior-web.service=active` na medição. Repo VPS tinha três alterações preexistentes em `scripts/telegram-mtproto/`, não alteradas.
16. **Papagaio/FIXED_POINT parcial:** descobrir ligação quebrada com `NOME | OWNER | PATH ESPERADO | CONSUMIDOR | PROVA | NEXT_CURSOR`; conservar original, não abrir segundo painel nem reexecutar de forma cega provas válidas.

### 9.3 Continuidade, fronteiras e próximos cursores

- `main` GitHub observada na consulta: `d277495d1d4fed696b9fed66cfd7bdff86371a0d`; VPS em `910c2d67...` — **versionamento divergente, não prova de perda ou deploy falho**.
- PRs **#1804** (Hermes), **#1805** (aprendizados), **#1806** (Cristal) e **#1810** (Papagaio) são frentes existentes; última medição destas PRs confirmou **OPEN**, não mergeadas, com writer de cada owner preservado.
- **NEXT_CURSOR_OBSIDIAN:** identificar raiz exata do vault BRAIN e configuração do link HUD/HERMES LIVE; reapontar apenas no owner existente se leitura provar referência desatualizada.
- **NEXT_CURSOR_CLAUDE:** localizar qual `SessionStart` hook está gerando o erro e medir `CentralDark Claude: Route STATUS` quando Casa/RDC retornar; não duplicar hooks.
- **NEXT_CURSOR_SCREENPIPE:** usar a autenticação canônica do Sidecar existente para ler somente a janela autorizada e correlacionar o conteúdo ao frame atual. `/health` não equivale a conteúdo lido.
- **NEXT_CURSOR_CODEX:** investigar daemon não elevado e roteador existente, sem criar daemon/CLI paralelos.
- **NEXT_CURSOR_COCKPIT:** conectar projeções comprovadas no HUD/Instinto já existente com owner e readback; evitar criar painel mestre.
- **NÃO EXECUTADO NESTE DELTA:** instalação, exportação de frames autenticados, login Claude/Google, alteração do vault, scripts na Casa, git merge, deploy ou mudança em jobs/PRs de outras frentes.
- **Estado do HUD MCP:** dez missões e porcentuais da referência histórica permanecem *inalterados até medição própria*; este índice de dezesseis superfícies não substitui as missões do HUD.

**SELO:** INTENÇÃO HUMANA → OWNERS/ROTAS → PROVA POR ORIGEM → UM ESCRITOR → MESMA FORJA → NEXT_CURSOR.
