
# Plano — Auditoria READ-ONLY de labels duplicadas (ChatGPT / Grok)

Sem edições, sem commits, sem execução de workflows, sem impressão de tokens.

## Escopo
Repositório: `ServerVpss/CentralDark`
Labels alvo:
- `assign:chatgpt`
- `🧠 AGENTE-CHATGPT`
- `assign:grok`
- `🧠 AGENTE-GROK`

## Passos

### 0) Prova de imutabilidade
- Capturar HEAD antes: `git rev-parse HEAD` (via exec read-only) e registrar.
- Ao final, capturar HEAD depois com o mesmo comando e comparar (devem ser idênticos).

### 1) Metadados de cada label
Via connector GitHub (gateway `/repos/ServerVpss/CentralDark/labels/{name}`) para as 4 labels:
- nome exato, `color`, `description`, `default`, `node_id`.

URL-encode dos nomes (espaço, `:`, emoji 🧠).

### 2) Contagens por label — abertas e fechadas
Para cada label, usar Search API (read-only) para separar issues e PRs, abertos e fechados:
- Issues abertas: `GET /search/issues?q=repo:ServerVpss/CentralDark+is:issue+is:open+label:"<label>"`
- Issues fechadas: `is:issue+is:closed`
- PRs abertos: `is:pr+is:open`
- PRs fechados: `is:pr+is:closed`

Registrar `total_count` de cada consulta = 16 contagens (4 labels × 4 dimensões).

### 3) Listagem dos itens
Para cada label:
- Se `total_count ≤ 20`: listar todos (`#N` + título + estado + tipo).
- Se maior: mostrar só contagens e os primeiros 10 mais recentes (ordenar por `sort=updated&order=desc`).

### 4) Referências no repositório
Rodar `rg` (sem `.git`, sem `node_modules`, sem `secrets/`) para as strings:
- `AGENTE-CHATGPT`
- `AGENTE-GROK`
- `assign:chatgpt`
- `assign:grok`

Escopos: `.github/`, `scripts/`, `docs/`, `.claude/`, `.agents/`, `.lovable/`, raiz. Retornar path:linha com trecho curto (sem despejar arquivos inteiros; sem exibir qualquer valor que se pareça com token/secret).

### 5) Conclusão baseada em evidência
Com base em:
- descrições oficiais das 4 labels (passo 1),
- consumidores reais (workflows/scripts/docs — passo 4),
- padrões de uso nos issues/PRs (passo 3),

responder de forma objetiva:
- `assign:*` e `🧠 AGENTE-*` são **camadas distintas** (roteamento automático vs. marcação humana/visual) ou **duplicatas semânticas** que devem ser fundidas?
- Citar a descrição e ao menos um consumidor de cada.

### 6) Formato de retorno
```
HEAD antes: <sha>

## assign:chatgpt
  cor: #xxxxxx  |  desc: "..."
  issues abertos: N | fechados: N
  PRs abertos: N | fechados: N
  itens: [...]

## 🧠 AGENTE-CHATGPT
  ...

## assign:grok
  ...

## 🧠 AGENTE-GROK
  ...

## Referências no repo
  <path>:<linha>  <trecho>
  ...

## Conclusão
  <camada humana vs roteamento, com citações>

HEAD depois: <sha>   (== HEAD antes ✅ zero edição)
```

## Garantias
- Só chamadas GET à API do GitHub via connector + `rg`/`git rev-parse` locais.
- Nada de `gh label edit/create/delete`, nada de `git commit/push`, nada de `workflow run`.
- Tokens jamais ecoados; uso do connector gateway com headers seguros.
