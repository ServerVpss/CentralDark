# Plano — Validar a MetaLupa canônica antes de renomear a skill

Pivete, você tá certo em desconfiar. Antes de mexer em qualquer arquivo, eu preciso ir no repositório de verdade, olhar PRs, issues e comparar com o `METALUPA-BAYESIANA-CANONICA.md` que você me mandou. Sem chute, sem "acho que". Só depois disso decido se renomeio a skill ou não.

## O que vou fazer (tudo em modo leitura)

**1. Repositório `ServerVpss/CentralDark` — evidência primeiro**
- Listar PRs recentes (abertos e fechados) com foco nos que citam Lupa, MetaLupa, skill, admin-guard, PR #285, #286, #293, #296, #297.
- Ler os commits mais novos da `main` e `pivete/dev` pra achar o rastro real da última evolução da Lupa.
- Buscar no repo por arquivos com nome ou conteúdo mencionando `lupa-bayesiana`, `metalupa`, `tecnica-da-lupa` — descobrir qual é o nome canônico *que o repositório já usa*, não o que eu presumi.

**2. Comparar com o arquivo que você mandou agora**
- Reler o `METALUPA-BAYESIANA-CANONICA.md` (upload de agora + o que tá em `/mnt/user-uploads/`).
- Comparar linha a linha com a versão que está viva em `.agents/skills/tecnica-da-lupa/SKILL.md` no workspace Lovable.
- Registrar diferenças reais (se houver): 14 princípios, gates, AutoLupa, ponto fixo, camada de tradução, saída obrigatória.

**3. Aplicar a MetaLupa sobre a própria decisão**
Seguindo os gates do arquivo canônico:
- **Mapa Único:** já existe skill com esse papel? Onde? Qual o nome canônico registrado no repo?
- **Encaixe:** `ENCAIXE_EXISTENTE` (só renomear), `EXTENSAO_CANONICA` (atualizar conteúdo) ou `NOVO_CAMINHO_JUSTIFICADO` (nada disso, é caminho novo)?
- **Falsificador:** o que provaria que renomear pra `lupa-bayesiana` está errado? Ex.: se o repositório oficial já grava a skill com outro nome, ou se PR aberto está movendo pra caminho diferente.
- **AutoLupa:** rodar sobre o próprio veredito até ponto fixo antes de propor ação.

**4. Devolver evidência crua, não opinião**
Vou te entregar:
- Lista de PRs relevantes com número, título, status e SHA.
- Diff real (ou "idêntico") entre o arquivo canônico e a skill do workspace.
- Nome canônico que o repositório reconhece hoje.
- Veredito da MetaLupa: `APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR` sobre renomear a skill.
- Próximo passo único, autorizado por você.

## O que NÃO vou fazer nessa fase

- Não renomeio pasta.
- Não sobrescrevo `SKILL.md`.
- Não aplico skill nenhuma.
- Não mexo em cockpit, rota, componente.
- Não abro PR, não faço commit, não faço push.

Tudo read-only até você olhar a evidência e mandar seguir.

## Ferramentas que vou usar (só leitura)

- `github_list_pull_requests`, `github_list_commits`, `github_read`, `github_search_code` no repo `ServerVpss/CentralDark`.
- `code--view` no arquivo local `.agents/skills/tecnica-da-lupa/SKILL.md` e no upload `user-uploads://METALUPA-BAYESIANA-CANONICA.md`.
- `vps_git_status` e `vps_read_file_safe` se precisar cruzar com a VPS.

## Critério de sucesso

Você bate o olho no relatório e consegue dizer sozinho: "renomeia" ou "não renomeia" — sem depender da minha palavra. A decisão vem da evidência do repo + do arquivo que você mandou, não do meu palpite.

Aprova essa auditoria read-only?
