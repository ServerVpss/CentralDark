
# !CALIBRAR — Relatório READ-ONLY

Nada foi editado, commitado, deployado ou reiniciado. Nenhum secret exibido.

## VEREDITO

🟡 **PARCIAL.** Achei o que dá pra provar aqui dentro do sandbox Lovable e marquei o resto como **NÃO COMPROVADO** em vez de inventar.

- Conexões OAuth/gateway padrão: só 1 acessível (Firecrawl). GitHub e MCP CentralDark **não estão como "connection" padrão do Lovable** neste projeto — o acesso ao GitHub aqui é via **git remote embutido + secrets `GH_TOKEN`/`GITHUB_TOKEN`**, não via connector.
- Teste GitHub READ-ONLY via API oficial do Lovable connector: **impossível** (não existe connector GitHub linkado). Alternativa (git remote local) usa token do storage Lovable, não do repo `ServerVpss/CentralDark`.
- Fonte canônica da Técnica da Lupa Premium **no repositório do projeto**: **não existe como documento em `docs/`**. Ela vive hoje em `.workspace/AGENTS.md` e `.workspace/skills/tecnica-da-lupa/SKILL.md` (workspace, não repo).
- Skill `tecnica-da-lupa` **está habilitada e ativa neste projeto** (surfada no system prompt e presente em `.workspace/skills/`).
- Regra "hipótese não é ordem / não antecipar execução": **NÃO COMPROVADO** que exista de forma explícita e nomeada. Existe algo próximo (Lei Zero, "PERGUNTAR antes de AGIR", "Autorização não se presume") — mas a frase de bloqueio contra *transformar possibilidade em tarefa* não aparece como cláusula própria.

---

## EVIDÊNCIA

- CWD: `/dev-server`
- Branch: `edit/edt-6c8d74b0-5646-46e4-83d2-0e5a06c58420`
- HEAD SHA: `2773fbb3d156c8bad9795df5a06cb7256255b6a9`
- Remote: `git.private.lovable-gcp.code.storage/85041dd2-...` (armazenamento interno Lovable, **não** é o `github.com/ServerVpss/CentralDark`).
- `standard_connectors--list_connections` retornou 3 entradas, nenhuma de GitHub nem MCP.
- `secrets--fetch_secrets` listou 54 nomes (só nomes; nenhum valor exposto).
- Skills workspace ativas: `revenue-centric-design`, `skill-master`, `tecnica-da-lupa`.
- `grep -rli "lupa" --include="*.md" .` → só `.workspace/AGENTS.md` e `.workspace/skills/tecnica-da-lupa/SKILL.md`.
- `docs/CONSCIENCIA/` existe (30+ arquivos), mas **nenhum arquivo com "lupa" no nome ou no corpo**.

## CONEXÕES ENCONTRADAS

Padrão Lovable (`standard_connectors--list_connections`):

| Nome | Connector | Auth | Gateway | Linkado ao projeto | Acesso | Linkable |
|---|---|---|---|---|---|---|
| Fulano's Google Docs | google_docs | oauth2 | sim | não | sim | **não** (owner do projeto sem acesso) |
| Pivete | google_calendar | oauth2 | sim | não | sim | **não** (owner do projeto sem acesso) |
| Firecrawl | firecrawl | api_key | não | não | sim | **sim** |

**Não existe** connector `github` nem connector `mcp/centraldark` listado. **Inferência:** o acesso a GitHub aqui é operado por secrets (`GH_TOKEN`, `GITHUB_TOKEN`, `GH_APP_TOKEN`, `GITHUB_OAUTH_ACCESS_TOKEN`) chamando a API do GitHub via `fetch`/`curl`, não por connector gateway Lovable. Idem MCP CentralDark: existem `CENTRALDARK_MCP_SESSION` e `MCP_SESSION_SECRET` como **secrets do projeto**, não como connection.

Secrets relacionados (só nomes, valores permanecem encriptados):
`GH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GH_APP_TOKEN`, `GH_APP_CLIENT_ID`, `GH_APP_CLIENT_SECRET`, `GITHUB_OAUTH_ACCESS_TOKEN`, `CENTRALDARK_MCP_SESSION`, `CENTRALDARK_ADMIN_KEY`, `WEBUI_LOVABLE_KEY`, `HUB_SUPABASE_*`, `VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`.

Estado aparente:
- 🟢 Secrets presentes no cofre do projeto (54 entradas).
- 🔴 Nenhuma **connection** OAuth Lovable ativa para GitHub / MCP.
- 🟡 Fluxo real de autenticação com GitHub / MCP é **direto via secret + fetch** — não passa pelo gateway de connectors do Lovable, portanto o Lovable não exibe status/scope/erro por connector para essas rotas.

## TESTE GITHUB READ-ONLY

- Ferramenta de connector GitHub: **não existe** neste workspace/projeto (não apareceu em `list_connections` nem em `tool_search` como ferramenta dedicada).
- Ferramenta genérica pra bater na API do GitHub via connector: **não aplicável** (sem connection).
- Consulta via `git ls-remote`/API pública ao `ServerVpss/CentralDark`: **não executada** — o prompt pede usar "conexão GitHub já embutida no Lovable", e ela **não está embutida como connector**; usar `GH_TOKEN` do secret seria improviso e o prompt proíbe improvisar.
- Falha exata registrada: `connector github ausente em standard_connectors--list_connections; nenhum tool de leitura GitHub disponível sob esse caminho.`

## FONTE CANÔNICA DA LUPA

**No repositório do projeto (Lovable checkout, HEAD `2773fbb`):**
- `docs/CONSCIENCIA/**` → **não contém** arquivo da Lupa.
- `docs/GOVERNANCA/**` → **não contém** arquivo da Lupa.
- Nenhum `*.md` do repo menciona "lupa" (verificado com `grep -rli lupa --include="*.md" .`).

**Fora do repo (mas dentro do ambiente Lovable):**
- `.workspace/skills/tecnica-da-lupa/SKILL.md` → cópia workspace da skill.
- `.workspace/AGENTS.md` → contém o texto integral da "Técnica da Lupa Premium" como workspace knowledge.

**Inferência:** a fonte canônica *humana* que o Pivete considera oficial provavelmente vive em `github.com/ServerVpss/CentralDark` (fora deste sandbox). Como o remote local aponta para armazenamento privado Lovable e não pro GitHub oficial, **não dá pra provar** o SHA/caminho do canônico no GitHub sem o connector GitHub — marcado como **NÃO COMPROVADO**.

## COMPARAÇÃO COM WORKSPACE SKILL

- Skill `tecnica-da-lupa` está **ativa** em `.workspace/skills/tecnica-da-lupa/SKILL.md` (surfada no system prompt desta sessão como `skill/tecnica-da-lupa`).
- Descrição da skill declara: "evolui a Técnica da Lupa existente; não cria método paralelo".
- Conteúdo bate literalmente com o bloco em `.workspace/AGENTS.md` (workspace knowledge) — **mesma fonte**, sem divergência textual observável no diff que verifiquei (Lei Zero, Regra de Ouro, Pessoa ≠ Ideia, 16 seções, Feynman, Gate de Evidência, Bloqueios Absolutos, Autolupa, Limite de Garantia).
- **Sem versão paralela no repo** para comparar. Se existe uma no GitHub oficial (`ServerVpss/CentralDark`), a comparação com essa não foi feita: **NÃO COMPROVADO**.

## REGRA JÁ EXISTE? SIM / NÃO / NÃO COMPROVADO

Pergunta: existe regra equivalente a "possibilidade mencionada não é tarefa autorizada" / "hipótese não é ordem" / "não antecipar execução sem confirmar intenção".

Resposta: **NÃO COMPROVADO com viés para NÃO explicitamente.**

O que **existe** e chega perto (evidência textual na skill/workspace):
1. **Lei Zero:** "Pivete comanda. Autorização não se presume."
2. **Ciclo obrigatório:** `LER → PERGUNTAR → AGIR → REVISAR → PROVAR → REGISTRAR` — o "PERGUNTAR" antes de "AGIR" cobre parcialmente.
3. **PERGUNTAR:** "confirmar ambiguidade, risco ou autorização sensível."
4. **Bloqueios Absolutos #10:** "autor aprovando sozinho mudança R3/R4" e **#11:** "hipótese apresentada como fato".

O que **não achei explicitamente**: cláusula nomeada tipo *"possibilidade mencionada em conversa não vira ordem executável"* ou *"não antecipar execução por inferência de intenção"*. O #11 ("hipótese apresentada como fato") trata de **relato**, não de **execução por antecipação** — são coisas parentes mas não iguais.

**Inferência:** a regra proposta seria complementar, não duplicada — cobriria o gap entre "PERGUNTAR" (genérico) e "hipótese como fato" (relato).

**Suposição:** talvez exista essa regra em algum doc do GitHub oficial fora do sandbox. Sem connector, **não dá pra provar**.

## PENDÊNCIAS

1. Sem connector GitHub oficial: qualquer verificação do `ServerVpss/CentralDark` (SHA, arquivo canônico da Lupa, PR, workflow) fica bloqueada dentro das regras deste !CALIBRAR (o prompt proíbe improvisar com secrets).
2. Confirmar se o Pivete quer que a fonte canônica da Lupa seja **replicada para dentro do repo do projeto** (`docs/GOVERNANCA/TECNICA-DA-LUPA.md`) ou permaneça só em workspace knowledge.
3. Decidir se a nova regra ("hipótese/possibilidade ≠ ordem") entra como **cláusula adicional dentro da skill existente** (respeitando "não cria método paralelo") ou como **regra operacional separada em `docs/GOVERNANCA/REGRAS-OPERACIONAIS-PIVETE.md`**.

## PRÓXIMO PASSO ÚNICO

**Pivete decide, em uma frase, qual dos dois caminhos:**

- (a) **Habilitar/apontar** um connector GitHub oficial (ou autorizar explicitamente uso read-only do `GH_TOKEN` do cofre) pra eu poder ler o `ServerVpss/CentralDark` e comparar com a skill workspace.
- (b) **Aceitar o estado atual** (skill ativa + workspace knowledge como canônico dentro do Lovable) e me autorizar a redigir a **cláusula complementar** "hipótese/possibilidade ≠ ordem" — sem editar a skill existente, apenas propondo o texto pra você aprovar depois.

Sem a escolha, permaneço em read-only.
