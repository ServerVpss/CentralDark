
## Objetivo
Fazer o resultado “TEXTO/Texto” (que vem como um bloco de string dentro do campo `texto`) ser **quebrado em campos** (Nome, CPF, RG, Data de Nascimento, etc.) e **categorizado** corretamente, em vez de aparecer como um único item dentro de **OUTROS DADOS**.

## Diagnóstico (o que está acontecendo agora)
1. Pelo histórico do backend, o payload típico da consulta de foto vem assim:
   - `cpf`, `estado`, `fotoBase64`
   - `texto`: `"Nome: ...\nData de Nascimento: ...\nNome da Mãe: ...\n..."`

2. No `MonospaceResultDisplay`, a função `extractData()` **só chama `parseTextData()`** quando:
   - `data.data` é string, ou
   - `data` é string diretamente.

3. Como o texto vem em `result.texto` (e não em `result.data`), o código atual **não parseia** esse conteúdo: ele apenas “achata” e guarda como:
   - `texto: "Nome: ...\nCPF: ..."`

4. Resultado: a UI vê apenas a chave `texto` e joga isso em **dados_outros**, mostrando “Texto:” com o conteúdo inteiro (parece “do mesmo jeito”).

## Estratégia de correção
Vamos melhorar a extração/parsing em 3 pontos:

### A) Parse automático quando existir `texto` (principal correção)
Atualizar `extractData()` para:
- Detectar chaves do tipo `texto` / `text` / `TeXtO` (case-insensitive)
- Se o valor for string e contiver “padrões de campos” (ex: `:` e múltiplas linhas), então:
  - rodar `parseTextData(texto)`
  - fazer merge dos campos parseados no resultado final
  - opcionalmente manter o texto bruto (ou descartar) para não duplicar informação

Isso fará com que `Nome`, `CPF`, `RG`, etc. apareçam como campos normais e entrem nas categorias certas.

### B) Normalização de chaves (acentos e variações)
Hoje podem surgir chaves como:
- `nome_da_mãe` (com acento) vs `nome_mae` (sem acento)
- `nome do pai` / `nome_do_pai` / `pai`

Vamos criar uma função única de normalização (exemplo de comportamento):
- lowercase
- remover acentos (NFD + remove diacríticos)
- trocar tudo que não for letra/número por `_`
- colapsar múltiplos `_`
- trim de `_`

E aplicar essa normalização em:
- `parseTextData()` (quando monta `key`)
- `parseInlineFields()` (quando monta `field`)
- `extractData()` (quando transforma keys de objetos)

Assim, `NOME DA MÃE` vira `nome_da_mae` consistentemente.

### C) Mapeamento de aliases (para cair nas categorias e labels existentes)
Mesmo com normalização, ainda queremos padronizar para os nomes que vocês já usam no UI:
- `nome_da_mae` -> `nome_mae`
- `nome_do_pai` -> `nome_pai`
- `data_de_nascimento` -> `data_nascimento` (se vocês preferirem um único padrão)

Adicionar um objeto `fieldAliases` e, após normalizar, substituir por um “canonical key”.
Isso melhora:
- labels (Nome da Mãe sai com label bonitinho)
- categorização (vai para “DADOS FAMILIARES”)
- emojis corretos

## Mudanças planejadas (arquivo)
### 1) `src/components/consultation/MonospaceResultDisplay.tsx`
**Editar:**
- `extractData()`:
  - se encontrar chave `texto` (variações), parsear e mesclar
- Criar helper(s):
  - `normalizeKey(raw: string): string`
  - `applyAlias(key: string): string` (ou `fieldAliases` direto)
- Ajustar `parseTextData()`:
  - ao produzir `key`, usar `normalizeKey` + alias
- Ajustar `parseInlineFields()`:
  - ao produzir `field`, usar `normalizeKey` + alias
  - (opcional) melhorar detecção de “inline fields” para aceitar `Nome:` (Title Case), não só ALL CAPS

**Por que isso resolve de vez:**
- O seu caso específico (campo `texto` contendo várias linhas `Label: Valor`) passa a ser decomposto em chaves reais (`nome`, `cpf`, `rg`, etc.), então deixa de existir “um único campo texto gigante”.

## Como vou validar (checklist)
1. Em **/consultas**, fazer uma consulta que retorna `texto + fotoBase64` (como a do exemplo Neymar).
2. Confirmar que aparecem cards como:
   - 👤 DADOS PESSOAIS: Nome, CPF, RG, Nascimento
   - 👨‍👩‍👧 DADOS DE FAMILIARES: Nome da Mãe / Nome do Pai
   - 📷 FOTO: imagem renderizando e botão “Baixar”
3. Confirmar que **não** fica “Texto:” em OUTROS DADOS (ou, se decidirmos manter, que fique como bloco secundário, não como principal).

## Riscos / cuidados
- Evitar duplicar campos: se parsearmos `texto`, não devemos também manter `texto` como campo principal (ou devemos colocar sob “OUTROS” de forma opcional/colapsável).
- Alguns provedores podem enviar “Texto” com formatos diferentes; por isso a normalização + aliases é importante.

## Resultado esperado (experiência do usuário)
Em vez de ver um bloco “Texto: ...”, o painel vai mostrar os campos organizados (igual sensação do Telegram), com emojis/labels e categorias corretas, e a foto exibida acima quando existir.
