# 👑🪬 CentralDark — recibo forense da sessão, PR equivalente #1852

**Data:** 2026-10-18 (provas e snapshots do mesmo dia; última medição direta 2026-10-18T11:03:19Z).  
**Natureza:** registro documental A–Z + 01–32 na família **existente** `docs/CONSCIENCIA/RECEIPTS/`. Nenhuma segunda engine, outro limpador, catálogo, agente, HUD ou scheduler.  
**CHEFE / autoridade:** intenção da sessão: preservar o rastro, as capacidades Hermes, a forense Casa/VPS, as melhorias de limpeza e o método PAPAGAIO ON.  
**PR-mãe de código:** [#1852](https://github.com/ServerVpss/CentralDark/pull/1852), **MERGED** em 18/10, `a4f204a3092bc99180de1955e8d04e1903656373`.  
**PR desta extensão:** receipt equivalente, **documentação apenas** sobre a `main` posterior à #1852; não duplica seus três arquivos.  
**Proveniência:** ferramentas Remote Desktop Commander, MCP CentralDark, GitHub; fala do CHEFE separada de readback instrumental. As linhas referem-se a medições **na sessão**, não a estado futuro garantido.  
**Invariantes:** `HISTORY != CURRENT`, `SOURCE != LOAD`, `CONFIGURED != VISIBLE != EXECUTED`, `ACTION != PROOF`, `UNKNOWN != PASS`, `MERGED != DEPLOYED`, `REUSE_BEFORE_CREATE`, `ONE_WRITER_PER_SCOPE`.

## 1. Índice alfabético verificável (A–Z por título; rastro numérico estável)

A ordenação alfabética abaixo aponta para cada passagem numerada na seção 2. O rastro numérico preserva a sequência causal em que as evidências foram adquiridas/consumidas.

| Letra | Entrada (em ordem alfabética) | Rastro | Estado da alegação |
|---|---|---:|---|
| C | Caches Linux inventariados | [02](#rastro-02) | `PASS_HISTORICO` |
| C | Casa: agente Desktop Commander | [09](#rastro-09) | `BLOCKED_SENSOR` |
| C | Casa: primeira resposta remota | [08](#rastro-08) | `PASS_HISTORICO` |
| C | Casa: Screenpipe e driver de vídeo | [32](#rastro-32) | `UNKNOWN` |
| C | Catálogo Hermes: readback 995 | [23](#rastro-23) | `PASS_NATIVO` |
| C | Catálogo Hermes: vínculo persistente | [22](#rastro-22) | `PASS_CONFIG` |
| C | Catálogo nativo: baseline 89 | [20](#rastro-20) | `PASS_REPRO` |
| C | Catálogo nativo: ensaio 995 | [21](#rastro-21) | `PASS_CONTRAPROVA` |
| C | Causa raiz da descoberta Hermes | [19](#rastro-19) | `PASS_CODIGO_E_RUNTIME` |
| C | Cron de limpeza atualizado | [05](#rastro-05) | `PASS_READBACK` |
| D | Disco VPS lotado | [01](#rastro-01) | `PASS_HISTORICO` |
| D | Divergências de SHA entre skills | [18](#rastro-18) | `PASS_DIFF` |
| D | Docker/plugins e dependências | [30](#rastro-30) | `UNKNOWN_ISOLADO` |
| D | Drift que exige Oracle | [26](#rastro-26) | `PARTIAL` |
| E | Escopos Linux protegidos | [06](#rastro-06) | `PASS_DECISAO` |
| F | Fable Loop, Grill-me e MetaLupa | [17](#rastro-17) | `PASS_CONTRATO` |
| H | Hermes: pastas canônicas | [14](#rastro-14) | `PASS_ARQUIVO` |
| H | Hermes: processos vivos | [13](#rastro-13) | `PASS_RUNTIME` |
| J | Jan e monitores | [12](#rastro-12) | `UNKNOWN` |
| L | Limpeza: owner canônico | [04](#rastro-04) | `PASS_FONTE` |
| M | MCP skill_listar: escopo menor | [16](#rastro-16) | `PASS_FRONTEIRA` |
| M | Medição DISK_RELIEF_BYTES | [07](#rastro-07) | `UNKNOWN` |
| M | Método PAPAGAIO ON consolidado | [27](#rastro-27) | `PASS_FONTE` |
| P | Pip: descarte efetivo | [03](#rastro-03) | `PASS_HISTORICO` |
| P | PR #1852: código e estado | [28](#rastro-28) | `PASS_GITHUB_MERGED` |
| S | Script da PR: teste e autocorreção | [29](#rastro-29) | `PASS_BASH_SYNTAX` |
| S | Sincronização seletiva: 29/58 | [25](#rastro-25) | `PARTIAL` |
| S | Skills: contagem recursiva | [15](#rastro-15) | `PASS_INVENTARIO` |
| S | Skills: leitura por nome (skill_view) | [24](#rastro-24) | `PASS_CONSUMO_ISOLADO` |
| T | Tailscale Casa↔VPS | [10](#rastro-10) | `PASS_REDE` |
| V | VPS: espaço recuperado observado | [31](#rastro-31) | `PASS_SNAPSHOT` |
| W | Windows: portas TCP | [11](#rastro-11) | `PASS_TCP` |

## 2. Registro numérico de provas, contraprovas, decisões e limites
### <a id="rastro-01"></a>01 · Disco VPS lotado

- **Estado:** `PASS_HISTORICO`.
- **Evidência/efeito:** Leitura inicial de /dev/sda3: 196G totais, 196G usados, disponibilidade zero, 100%.
- **Fronteira e contraprova:** Este foi o estado inicial, não a leitura atual.
- **Instrumento/fonte:** RDC/VPS; df.

### <a id="rastro-02"></a>02 · Caches Linux inventariados

- **Estado:** `PASS_HISTORICO`.
- **Evidência/efeito:** /root/.cache ~4,0G; centraldark-work ~2,2G; Puppeteer ~1,3G; cache pip ~159M antes da limpeza; /var/log ~360M; journal ~243,4M.
- **Fronteira e contraprova:** As medições têm escopos e momentos diferentes; não somar subpastas ao total da pasta mãe.
- **Instrumento/fonte:** RDC/VPS; du, journalctl.

### <a id="rastro-03"></a>03 · Pip: descarte efetivo

- **Estado:** `PASS_HISTORICO`.
- **Evidência/efeito:** python3 -m pip cache purge retornou 'Files removed: 924 (158.0 MB)'; sem desinstalação de pacotes.
- **Fronteira e contraprova:** Não resolve sozinho a ocupação global; o df permaneceu 100% na contraprova imediata.
- **Instrumento/fonte:** RDC/VPS; comando e readback.

### <a id="rastro-04"></a>04 · Limpeza: owner canônico

- **Estado:** `PASS_FONTE`.
- **Evidência/efeito:** Owner preservado: scripts/limpeza-autonoma.sh. PRs de limpeza existentes (incluindo #1807) usados como proveniência e sem novo limpador/cron.
- **Fronteira e contraprova:** Código ou PR de limpeza não equivale a ciclo de produção bem-sucedido.
- **Instrumento/fonte:** GitHub+RDC/VPS; script e cron.

### <a id="rastro-05"></a>05 · Cron de limpeza atualizado

- **Estado:** `PASS_READBACK`.
- **Evidência/efeito:** A entrada única */15 com flock foi modificada e relida: --clean-selected journal,gz,pip-cache,npm-cache.
- **Fronteira e contraprova:** Agendado ≠ executado; npm/pip têm limitadores internos, e a recuperação de espaço posterior não foi causalmente atribuída ao cron.
- **Instrumento/fonte:** RDC/VPS; crontab -l; readback 18/10 11:03Z.

### <a id="rastro-06"></a>06 · Escopos Linux protegidos

- **Estado:** `PASS_DECISAO`.
- **Evidência/efeito:** Preservados centraldark-work, cache de navegadores em uso potencial, volumes Docker, worktrees, bases, sessões, backups e checkouts de runners; runner-work não foi habilitado indiscriminadamente.
- **Fronteira e contraprova:** Nenhuma limpeza adicional desses diretórios foi demonstrada; requer elegibilidade e processo ocioso.
- **Instrumento/fonte:** Inventário e decisão operacional na sessão.

### <a id="rastro-07"></a>07 · Medição DISK_RELIEF_BYTES

- **Estado:** `UNKNOWN`.
- **Evidência/efeito:** Log anterior tinha DISK_RELIEF_BYTES= vazio; este sinal foi classificado como bug/candidato.
- **Fronteira e contraprova:** Não há prova nesta sessão de correção do emissor nem readback de ciclo posterior.
- **Instrumento/fonte:** RDC/VPS; log de cron lido anteriormente.

### <a id="rastro-08"></a>08 · Casa: primeira resposta remota

- **Estado:** `PASS_HISTORICO`.
- **Evidência/efeito:** Desktop Commander obteve pong inicial de SEGREDO; a Casa chegou a responder antes de novas consultas falharem.
- **Fronteira e contraprova:** Um pong não prova interface gráfica nem monitores com vídeo; a rota perdeu disponibilidade depois.
- **Instrumento/fonte:** Desktop Commander; pings.

### <a id="rastro-09"></a>09 · Casa: agente Desktop Commander

- **Estado:** `BLOCKED_SENSOR`.
- **Evidência/efeito:** Leitura posterior list_devices mostrou SEGREDO offline (last seen ~42–43min); tentativa de PowerShell remota recusada.
- **Fronteira e contraprova:** Offline neste agente não significa PC desligado, como mostrou Tailscale.
- **Instrumento/fonte:** Desktop Commander; list_devices/start_process.

### <a id="rastro-10"></a>10 · Tailscale Casa↔VPS

- **Estado:** `PASS_REDE`.
- **Evidência/efeito:** windows-casa aparecia active/direct; tailscale ping devolveu pong com latência ~102ms; a leitura mais recente 11:03Z ainda listava Windows ativo.
- **Fronteira e contraprova:** A VPN não prova Jan, sessão Windows, monitoração física ou plugin Desktop Commander.
- **Instrumento/fonte:** RDC/VPS; tailscale status/ping.

### <a id="rastro-11"></a>11 · Windows: portas TCP

- **Estado:** `PASS_TCP`.
- **Evidência/efeito:** Do ponto de vista da VPS, TCP 3389 (RDP) e 5985 (WinRM) aceitaram conexão; 22 não respondeu.
- **Fronteira e contraprova:** Porta aberta não prova autenticação, leitura de processos, sessão remota funcional ou saúde dos monitores.
- **Instrumento/fonte:** RDC/VPS; TCP probes.

### <a id="rastro-12"></a>12 · Jan e monitores

- **Estado:** `UNKNOWN`.
- **Evidência/efeito:** O CHEFE relatou ter ligado Jan e monitores apagados; comandos diretos de Windows não retornaram leitura de vídeo, GPU ou processos.
- **Fronteira e contraprova:** Não declarar processamento, travamento, configuração aplicada nem GPU verificada.
- **Instrumento/fonte:** Relato do CHEFE + falha de sensor Casa.

### <a id="rastro-13"></a>13 · Hermes: processos vivos

- **Estado:** `PASS_RUNTIME`.
- **Evidência/efeito:** No host CENTRALDARK-OS foram encontrados Hermes serve (porta 9119) e gateway run; PIDs 1469334 e 2051307 no recorte lido.
- **Fronteira e contraprova:** Processo vivo ≠ leitura de skill numa sessão já aberta; PID é histórico pontual.
- **Instrumento/fonte:** RDC/VPS; ps e /proc.

### <a id="rastro-14"></a>14 · Hermes: pastas canônicas

- **Estado:** `PASS_ARQUIVO`.
- **Evidência/efeito:** Pasta /root/.hermes existente; Hermes nativo /root/.hermes/hermes-agent; projeto /root/CentralDark/.agents/skills; perfil /root/.hermes/skills.
- **Fronteira e contraprova:** Diretório encontrado não comprova que consumidor utilizou cada arquivo.
- **Instrumento/fonte:** RDC/VPS; find e ls.

### <a id="rastro-15"></a>15 · Skills: contagem recursiva

- **Estado:** `PASS_INVENTARIO`.
- **Evidência/efeito:** 996 SKILL.md em .agents/skills (992 não arquivadas), 96 no perfil ~/.hermes/skills, 58 na árvore de skills do código-fonte Hermes, 3 na raiz CentralDark/skills e 1 em ~/.claude/skills.
- **Fronteira e contraprova:** Contagens sobrepostas, não somáveis; contagem rasa anterior (896) foi corrigida por busca recursiva.
- **Instrumento/fonte:** RDC/VPS; find/wc.

### <a id="rastro-16"></a>16 · MCP skill_listar: escopo menor

- **Estado:** `PASS_FRONTEIRA`.
- **Evidência/efeito:** A ferramenta MCP skill_listar expôs 3 skills na pasta skills/ do repositório.
- **Fronteira e contraprova:** Não é medição da biblioteca .agents/skills nem do catálogo nativo Hermes; 3 ≠ total de capacidades.
- **Instrumento/fonte:** MCP CentralDark; skill_listar.

### <a id="rastro-17"></a>17 · Fable Loop, Grill-me e MetaLupa

- **Estado:** `PASS_CONTRATO`.
- **Evidência/efeito:** Localizadas fable-loop, meta-lupa, grill-me, META-GRILL/GANCHO.md e skills forenses; grill-me informa disable-model-invocation: true; fable-loop declarado método read-only.
- **Fronteira e contraprova:** Documento de método existente não prova invocação automática por Hermes.
- **Instrumento/fonte:** RDC/VPS; SKILL.md e caminhos.

### <a id="rastro-18"></a>18 · Divergências de SHA entre skills

- **Estado:** `PASS_DIFF`.
- **Evidência/efeito:** Em sete pares comparados, cinco hashes idênticos; hermes-agent e systematic-debugging divergentes. O debug runtime tinha regras adicionais de rastreabilidade de erros.
- **Fronteira e contraprova:** Não substituir a cópia do runtime apenas porque difere; analisar delta semântico.
- **Instrumento/fonte:** RDC/VPS; sha256sum e diff.

### <a id="rastro-19"></a>19 · Causa raiz da descoberta Hermes

- **Estado:** `PASS_CODIGO_E_RUNTIME`.
- **Evidência/efeito:** Hermes serve iniciou em /root/.hermes/hermes-agent e gateway em /root/.hermes; nativo obtinha só raiz ~/.hermes/skills porque cwd estava fora do checkout confiável.
- **Fronteira e contraprova:** Causa medida naquele runtime; outras sessões/perfis podem usar cwd diferente.
- **Instrumento/fonte:** RDC/VPS; /proc, agent.skill_utils.get_skill_search_roots.

### <a id="rastro-20"></a>20 · Catálogo nativo: baseline 89

- **Estado:** `PASS_REPRO`.
- **Evidência/efeito:** Processo isolado Hermes com configuração original retornou 89 skills visíveis pelo _find_all_skills().
- **Fronteira e contraprova:** Visíveis nesse contexto != carregadas ou executadas.
- **Instrumento/fonte:** RDC/VPS; Python Hermes em processo isolado.

### <a id="rastro-21"></a>21 · Catálogo nativo: ensaio 995

- **Estado:** `PASS_CONTRAPROVA`.
- **Evidência/efeito:** Teste com patch efêmero do buscador adicionou /root/CentralDark/.agents/skills e retornou 995 visíveis, incluindo grill-me e ferramentas forenses.
- **Fronteira e contraprova:** Ensaio não alterou configuração naquele momento.
- **Instrumento/fonte:** RDC/VPS; Python Hermes com mock temporário.

### <a id="rastro-22"></a>22 · Catálogo Hermes: vínculo persistente

- **Estado:** `PASS_CONFIG`.
- **Evidência/efeito:** Em ~/.hermes/config.yaml foi adicionado skills.external_dirs: [/root/CentralDark/.agents/skills], de forma atômica; backup privado salvo; modo 0600 mantido.
- **Fronteira e contraprova:** Configuração local da VPS não deve ser exportada integralmente ao GitHub; sessão Hermes existente pode manter cache.
- **Instrumento/fonte:** RDC/VPS; YAML readback e permissões.

### <a id="rastro-23"></a>23 · Catálogo Hermes: readback 995

- **Estado:** `PASS_NATIVO`.
- **Evidência/efeito:** Processo nativo novo após configuração: [(1, ~/.hermes/skills), (3, /root/CentralDark/.agents/skills)] e LIVE_NATIVE_CATALOG_VISIBLE=995.
- **Fronteira e contraprova:** 995 pesquisáveis ≠ 995 instaladas no perfil ≠ 995 executadas.
- **Instrumento/fonte:** RDC/VPS; tools.skills_tool._find_all_skills.

### <a id="rastro-24"></a>24 · Skills: leitura por nome (skill_view)

- **Estado:** `PASS_CONSUMO_ISOLADO`.
- **Evidência/efeito:** skill_view('grill-me') ~775 bytes; skill_view('skill-workshop') ~9572; skill_view('performing-linux-log-forensics-investigation') ~12871; sem erro.
- **Fronteira e contraprova:** Comprova leitura via API nativa em processo isolado, não sessão de chat Hermes.
- **Instrumento/fonte:** RDC/VPS; tools.skills_tool.skill_view.

### <a id="rastro-25"></a>25 · Sincronização seletiva: 29/58

- **Estado:** `PARTIAL`.
- **Evidência/efeito:** Na main SHA 320b029c802db597a8ab6a3992bc90a03cf55fc0: 29 skills opt-in, 58 destinos, 49 sincronizados, 7 ORACLE_REQUIRED, 2 UNKNOWN, MAIN_RUNTIME_LOCK=PARTIAL.
- **Fronteira e contraprova:** --check read-only; zero --apply, zero --seal; contagens e SHA são snapshot daquele instante.
- **Instrumento/fonte:** RDC/VPS; /dev/shm cópia de scripts/skill-sync-check.sh --check.

### <a id="rastro-26"></a>26 · Drift que exige Oracle

- **Estado:** `PARTIAL`.
- **Evidência/efeito:** Sete caminhos: autonomous-ai-agents/hermes-agent; centraldark-reuse-runtime; kimetsu-brainstorm; software-development/centraldark-evidence-reconciliation; software-development/centraldark-ops; software-development/centraldark-oracle-surface; software-development/hermes-agent-skill-authoring.
- **Fronteira e contraprova:** São revisões pendentes, não falhas resolvidas; dois fast-forwards seguros foram classificados, não aplicados.
- **Instrumento/fonte:** RDC/VPS; --check e hashes.

### <a id="rastro-27"></a>27 · Método PAPAGAIO ON consolidado

- **Estado:** `PASS_FONTE`.
- **Evidência/efeito:** Contrato #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → MetaLupa → !FABLELOOP → !META-GRILL → !GRILME, rastro com gancho por passada, estado/evidência/NEXT_CURSOR, baianês com mineirês e metáfora bíblica sem caricatura.
- **Fronteira e contraprova:** Cabeçalho descreve gramática, não afirma execução de todos os ganchos nem Hermes falando.
- **Instrumento/fonte:** CHEFE estabeleceu regra; .agents/skills/centraldark-operational-method/SKILL.md alterada na PR #1852.

### <a id="rastro-28"></a>28 · PR #1852: código e estado

- **Estado:** `PASS_GITHUB_MERGED`.
- **Evidência/efeito:** PR #1852, 3 arquivos (skill-sync-check.sh; skill-synchronization/SKILL.md; centraldark-operational-method/SKILL.md), commit da PR f2c6f5d3ff76381ea08df5a4b78f9c53cff0a20d; merged_at 2026-10-18T10:52:59Z; merge SHA a4f204a3092bc99180de1955e8d04e1903656373.
- **Fronteira e contraprova:** MERGED != DEPLOYED: VPS checkout observado em fb7a00a605d7490947cd19220dda5dae0d296e7f, diferente do SHA merge.
- **Instrumento/fonte:** GitHub get_pr_info/get patch e RDC git rev-parse.

### <a id="rastro-29"></a>29 · Script da PR: teste e autocorreção

- **Estado:** `PASS_BASH_SYNTAX`.
- **Evidência/efeito:** Primeira edição do script teve erro sintático detectado pelo bash -n; corrigida no mesmo arquivo. Novo bash -n executado em /dev/shm retornou SCRIPT_BASH_SYNTAX=PASS; temporário removido com confirmação.
- **Fronteira e contraprova:** bash -n != suíte de integração/CI; a PR foi mesclada por outra ação sem prova aqui de todos os gates.
- **Instrumento/fonte:** GitHub commits + RDC/VPS bash -n/readback.

### <a id="rastro-30"></a>30 · Docker/plugins e dependências

- **Estado:** `UNKNOWN_ISOLADO`.
- **Evidência/efeito:** Inspeção preservou Docker/volumes e browsers; importações em Python isolado geraram avisos de requests/httpx faltantes, além de toolsets opcionais desconhecidos.
- **Fronteira e contraprova:** Não prova que os plugins do Hermes gateway em serviço estejam quebrados; não instalar/desinstalar à força.
- **Instrumento/fonte:** RDC/VPS; avisos de teste isolado.

### <a id="rastro-31"></a>31 · VPS: espaço recuperado observado

- **Estado:** `PASS_SNAPSHOT`.
- **Evidência/efeito:** Em 2026-10-18T11:03:19Z, /dev/sda3 = 196G totais, 182G usados, 12G disponíveis, 94%; cron e catálogo nativo continuam cadastrados.
- **Fronteira e contraprova:** Melhoria frente a 100% inicial é real na métrica, mas causa exata da liberação ainda não foi atribuída.
- **Instrumento/fonte:** RDC/VPS; df, crontab -l e config readback.

### <a id="rastro-32"></a>32 · Casa: Screenpipe e driver de vídeo

- **Estado:** `UNKNOWN`.
- **Evidência/efeito:** Sem readback de Screenpipe, GPU/driver, Jan ou sessão gráfica Windows nesta passada; comando remoto ao SEGREDO falhou com agente offline.
- **Fronteira e contraprova:** Não converter ausência de acesso em falha confirmada do hardware/software.
- **Instrumento/fonte:** Desktop Commander; STATUS indisponível.

## 3. Método operacional utilizado — gramática do PAPAGAIO ON, gancho por passada

**Contrato já versionado na PR #1852:** `.agents/skills/centraldark-operational-method/SKILL.md`. Não criar outro owner. O título fixo recupera a gramática, mas **somente o gancho específico declarado na linha RASTRO foi efetivamente aplicado naquela passada**.

```text
👑🪬 CENTRALDARK · #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → MetaLupa → !FABLELOOP → !META-GRILL → !GRILME
🧬 RASTRO <N> · Gancho: <ferramenta/método REAL> → <alvo> → <prova/contraprova>
```

| Ordem lógica | Gancho | Owner/capacidade já existente | O que produz / o que não prova |
|---:|---|---|---|
| 01 | `#ACORDAR` | `centraldark-boot`, `centraldark-capability-hud` | Recuperar intenção/rotas/capacidades; menção textual não inicia job. |
| 02 | `!CALIBRAR` | `centraldark-operational-method` | Reconciliar GOAL, owner, writer, HEAD, runtime; não declarar PASS sem efeito. |
| 03 | `!MULTIBÚSSOLA` | Contrato de multibússola da consciência | Cruzar fontes independentes e discriminar hipóteses; duas views correlacionadas não são duas provas. |
| 04 | MetaLupa | `meta-lupa` | Distinguir fonte, falsa ausência e falso verde; `BLOQUEAR` se faltar efeito. |
| 05 | `!FABLELOOP` | `fable-loop` | MAPEAR→LER→ENTENDER→CONTRADIZER→TESTAR→CORRIGIR→ACEITAR; skill de leitura não é job de reparo. |
| 06 | `!META-GRILL` | `meta-lupa/KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md` | Questionar hipóteses e evidência; gancho documental não é invocação automática. |
| 07 | `!GRILME` | `grill-me` (`disable-model-invocation: true`) | Entrevista crítica quando invocável; disponibilidade no catálogo não prova entrevista executada. |
| 08 | `!RASTRO` | `docs/CONSCIENCIA/RECEIPTS/` e owner atual | Guardar fonte, SHA, observação, erro, contraprova, efeito, NEXT_CURSOR; não criar ledger concorrente. |

**Ciclo atômico testável:** intenção viva do CHEFE → `OWNER` canônico → `CURRENT` (data, SHA, runtime) → menor delta seguro → readback no consumidor → contraprova discriminante → `RECEIPT` no owner → `NEXT_CURSOR` (até FIXED_POINT). Cada novo ganho reduz ao menos um `UNKNOWN`, sem loops artificiais.

**Aparência/narração:** baianês com leve mineirês e metáforas bíblicas, por exemplo: “Ôxente, CHEFE, esse trem tá arretado, uai! Mas se o papagaio cantar vitória sem contraprova, o rastro denuncia.” 🦜🍒🔬 A metáfora serve à interpretação, **não validação técnica**. O CHEFE decide; JARVIS/SOL coordena; Hermes existente executa quando realmente conectado; a realidade e o readback julgam. A mensagem não pode atribuir fala ou execução a Hermes sem registro real.

### Proveniência das rotas (sem rotas paralelas)

```text
Remote Desktop Commander (VPS) ───┬── Linux: df / du / cron / processos / sha256 / git / skill_view
                                 └── Tailscale: status / ping / TCP para windows-casa
Remote Desktop Commander (Casa) ───── teste inicial pong; agente offline depois
MCP CentralDark ───────────────────── skill_listar limitado à raiz skills/ (3)
Hermes nativo ─────────────────────── skills_tool: 89 → 995 / skill_view confirmado
GitHub #1852 ─────────────────────── implementação mesclada / patch e commit reais
Recibo atual ─────────────────────── docs/CONSCIENCIA/RECEIPTS (documentação, sem deploy)
```

## 4. Pendências materiais, sem falso verde

1. **`HERMES_SESSION_LOADED=UNKNOWN`:** precisa de leitura da sessão real ou API servida, confirmando skill procurada, sessão e origem, sem reiniciar gateway por ritual.
2. **`MAIN_RUNTIME_LOCK=PARTIAL`:** reconciliar sete arquivos `ORACLE_REQUIRED_RUNTIME_DRIFT` e dois fast-forwards elegíveis, com writer único e delta útil preservado; depois executar `--seal` por rota autorizada e comprovar hash.
3. **`CASA_INTERNAL_WINDOWS=UNKNOWN`:** VPN e portas TCP estão online, mas Desktop Commander da Casa não estava; recuperar leitura segura de monitores, Jan, sessão gráfica e processos sem reboot.
4. **`DISK_RELIEF_BYTES=UNKNOWN`:** log de limpeza mostrou valor vazio; corrigir medição no mesmo `scripts/limpeza-autonoma.sh`, executar ciclo elegível e demonstrar ganho. Sem apagar dados permanentes.
5. **`SPACE_CAUSALITY=UNKNOWN`:** disco caiu de 100% para 94%, mas não atribuir a um serviço sem correlação temporal/processual.
6. **`CI/ACTIVE_DEPLOY=UNKNOWN`:** #1852 foi mesclada, mas implantação de novo script na VPS/cockpit e execução de CI E2E não ficaram comprovadas neste receipt.
7. **`PLUGIN_HEALTH=UNKNOWN`:** avisos de dependências em Python isolado exigem teste de runtime, não reinstalação cega.
8. **`FIXED_POINT=FALSE`:** missão não está fechada enquanto qualquer UNKNOWN material permanecer.

**NEXT_CURSOR:** `PR_EQUIVALENTE_READBACK → RECONCILE_7_DRIFTS_AND_2_UNKNOWN → HERMES_SESSION_SKILL_VIEW → CASA_WINDOWS_PROCESS_AND_VIDEO_PROBE → CLEANUP_DISK_RELIEF_COUNTERPROOF → MAIN_RUNTIME_READBACK → FIXED_POINT`.

## 5. Recibo sintético e separação de estados

```text
OWNER=docs/CONSCIENCIA/RECEIPTS/ + centraldark-operational-method/skill-synchronization existentes
SOURCE_IMPLEMENTATION_PR=1852
SOURCE_MERGED=YES (2026-10-18T10:52:59Z)
SOURCE_MERGE_SHA=a4f204a3092bc99180de1955e8d04e1903656373
RECEIPT_SCOPE=DOCS_ONLY
ALPHABETICAL_INDEX_ENTRIES=32
NUMERICAL_TRACE_ENTRIES=32
HERMES_NATIVE_VISIBLE_TEST_BEFORE=89
HERMES_NATIVE_VISIBLE_TEST_AFTER=995
HERMES_NATIVE_SKILL_VIEW=3/3 tested names (isolated process)
HERMES_SESSION_ACTUAL_CONSUMPTION=UNKNOWN
MAIN_RUNTIME_LOCK=PARTIAL (main snapshot 320b029c802db597a8ab6a3992bc90a03cf55fc0)
ORACLE_REQUIRED=7
UNKNOWN_IN_SKILL_SYNC=2
VPS_DISK_READBACK=196G total; 182G used; 12G available; 94% at 11:03:19Z
WINDOWS_AGENT_READBACK=OFFLINE (session snapshot)
WINDOWS_TAILSCALE_REACHABILITY=ACTIVE_DIRECT (session snapshot)
FIXED_POINT=FALSE
```

**#OBSERVACOES#** O índice A–Z é navegação, não novas missões; a numeração é rastro, não percentual fabricado. Conteúdo histórico é datado. Toda melhoria deve continuar no **mesmo owner**, e a auditoria não altera por conta própria o HUD canônico de dez missões ou qualquer selo existente.
