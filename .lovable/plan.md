
# Plano — Evolução do Painel AVANÇO no /admin/cockpit

Aplicando a Lupa Bayesiana (evidência primeiro, correção mínima, fonte única no Git, sem v2/v3): tudo abaixo estende o painel AVANÇO que já existe, sem duplicar arquivos e sem inventar backend novo pra parte que não precisa.

## O que muda pra você (leigo)

1. Uma barrinha de busca no topo do AVANÇO — digita "hub", "pix", "hermes" e filtra na hora.
2. Filtros novos ao lado do status: **área** (cockpit, hub, hermes, segurança, infra) e **severidade** (p0/p1/p2/p3).
3. Cada item passa a mostrar **do que ele depende** e **quem está travando ele**. Se algo trava outro, aparece um selo vermelho "🔒 bloqueando X itens" com o motivo.
4. Um botão **"Editar item"** abre um formulário dentro do cockpit pra você mudar status, %, motivo e colar evidência — sem abrir o JSON na mão.
5. Toda entrega passa a registrar **SHA256 antes/depois, arquivos modificados e data** automaticamente, virando prova no próprio card.

## Escopo técnico

### 1. Estender o schema de `docs/CONSCIENCIA/COCKPIT-AVANCO.json`
Campos novos por item (opcionais, retrocompatível):
- `area`: `cockpit | hub | hermes | seguranca | infra | ia`
- `severidade`: `p0 | p1 | p2 | p3`
- `palavras_chave`: `string[]`
- `depende_de`: `string[]` (ids de outros itens)
- `bloqueia`: derivado em runtime a partir de `depende_de` (não gravado).

### 2. `PainelAvanco.tsx` — busca + filtros + grafo de dependências
- Input de busca (título + palavras_chave + card.onde/por_que).
- Dropdowns de **área** e **severidade** ao lado do filtro de status.
- Cálculo do mapa reverso `bloqueia`: para cada item, listar quem depende dele.
- No item expandido: seção **Dependências** (lista clicável que rola até o item alvo) e **Bloqueando** (selo vermelho quando `bloqueia.length > 0`).
- Selo "🔒 bloqueando N" no cabeçalho quando aplicável.

### 3. Editor inline `EditorItem.tsx` (novo, dentro de `painéis/`)
- Botão "Editar" em cada item abre um modal/drawer.
- Form: status, %, motivo_bloqueio, prova, depende_de (multi-select), área, severidade, palavras_chave.
- Persistência: como o JSON vive no Git e não temos backend dedicado pro cockpit, o editor tem 2 modos:
  - **Modo leitura+cópia (default)**: monta o novo bloco JSON pronto e oferece botão "Copiar patch" — você cola no arquivo/PR. Zero backend, funciona já.
  - **Modo salvar direto (opcional, se você autorizar)**: chama uma Edge Function `cockpit-avanco-write` no HUB Supabase que valida admin (super_admin lock existente) e commita via GitHub API na branch `pivete/dev`. Só implemento se você mandar — respeita a trava "não mexer no Supabase Lovable atual".
- Entrego já com **Modo leitura+cópia** ativo. Modo salvar direto fica como pendência no próprio AVANÇO.

### 4. Trilha automática de prova (SHA256 + arquivos + data)
- Script Node em `scripts/cockpit-avanco/registrar-entrega.mjs`:
  - Recebe `--id <item>` e lista de arquivos.
  - Lê SHA256 do `git show HEAD~1:<arquivo>` (antes) e do working tree (depois).
  - Atualiza o item no JSON com `arquivos_modificados`, `antes_sha256`, `depois_sha256`, `atualizado_em`.
- Hook opcional em `.husky/pre-commit` (só cria se você autorizar) que lê `.cockpit-avanco.pending` e roda o script.
- Sem hook: rodo o script manualmente ao fechar cada entrega — a prova entra no mesmo commit.

### 5. CSS
- Ajustes mínimos em `sala-controle.css`: input de busca, chips de área/severidade, selo "bloqueando", estilos do drawer editor. Mantém tokens Esmeralda e o padrão tátil `active:translate-y-[1px]`.

## Arquivos tocados

```text
docs/CONSCIENCIA/COCKPIT-AVANCO.json           (schema estendido, retrocompatível)
docs/CONSCIENCIA/COCKPIT-AVANCO.README.md      (documenta novos campos)
src/paginas/admin-cockpit/painéis/PainelAvanco.tsx     (busca, filtros, deps)
src/paginas/admin-cockpit/painéis/EditorItem.tsx       (novo — drawer editor)
src/paginas/admin-cockpit/painéis/CardPivete.tsx       (mostra deps + bloqueia)
src/paginas/admin-cockpit/sala-controle.css            (estilos novos)
scripts/cockpit-avanco/registrar-entrega.mjs           (novo — SHA256 auto)
```

## O que NÃO faço sem sua ordem

- Não mexo em `.github/workflows/`.
- Não crio Edge Function nova no Supabase Lovable atual (trava ativa).
- Não instalo husky nem hook de commit sem "PERMITO PIVETE".
- Não toco em áreas 🔒 (HERMES-CORE, mapeamento, hub, etc).

## Prova de entrega (Card Pivete por item)

Cada item novo/atualizado no AVANÇO vem com: ANTES_SHA256, DEPOIS_SHA256, arquivos, restart, onde/por_que/pra_que, como/quando usar, prova (commit), tutorial passo a passo.

## Próximo passo se você aprovar

Implemento em 1 commit único na `pivete/dev` (schema + PainelAvanco + Editor modo cópia + CardPivete + CSS + script SHA256), registro no próprio AVANÇO como meta-prova, e te entrego o Card Pivete completo.
