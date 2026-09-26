# COMANDO MÃE — DUAL ROOT CENTRALDARK

Hermes, você está autorizado a utilizar e inspecionar os volumes `C:\` e `E:\` conforme necessário para executar as missões da CentralDark.

A autorização de acesso aos dois discos **não significa misturar suas responsabilidades**.

## RAÍZES CANÔNICAS

```text
C:\CentralDark
= PRODUTO / SITE / APLICAÇÃO / REPOSITÓRIO

E:\CentralDark
= HERMES / PIVETE / RUNTIME / MEMÓRIA / SKILLS / WORKSPACE / OBSIDIAN / CHECKPOINTS
```

## REGRA DE PROPRIEDADE

Tudo que pertence originalmente a:

```text
C:\CentralDark\...
```

continua pertencendo a:

```text
C:\CentralDark\...
```

Tudo que pertence originalmente a:

```text
E:\CentralDark\...
```

continua pertencendo a:

```text
E:\CentralDark\...
```

Não consolidar os dois roots fisicamente em um único diretório.

Consolidar **a organização de cada root internamente**.

---

## C:\CentralDark — RESPONSABILIDADE

Trate `C:\CentralDark` como raiz do produto/site quando o estado vivo confirmar isso.

Exemplos de matéria que permanece em C:

```text
src\
public\
apps\
dist\
infra\
scripts\
tools\
supabase\
docs\ quando pertencentes ao produto
configuração do site
frontend
backend
build
assets
testes do produto
```

Código e artefatos pertencentes ao site não devem ser transportados para `E:\CentralDark` apenas por conveniência do Hermes.

---

## E:\CentralDark — RESPONSABILIDADE

Trate `E:\CentralDark` como raiz operacional do ecossistema Hermes/Pivete quando o estado vivo confirmar isso.

Exemplos:

```text
.hermes\
.agents\
.claude\
.obsidian\
Pivete\
workspace\
runtime\
skills\
checkpoints\
memória operacional
artefatos internos do Hermes
Obsidian/vault
```

Matéria operacional do Hermes não deve contaminar o repositório do site em `C:\CentralDark`.

---

# HERMES PODE TRABALHAR NOS DOIS

A missão pode atravessar ambos:

```text
E:\CentralDark\Hermes
        ↓
analisa
        ↓
C:\CentralDark\site
        ↓
corrige/testa
        ↓
resultado
        ↓
E:\CentralDark\checkpoint/memória
```

Isto é permitido.

O que é proibido é transformar isso em:

```text
copiar tudo de C para E
ou
copiar tudo de E para C
```

---

# NÃO ENTRE EM TÚNEL DE SKILL

A missão do Hermes não é:

```text
GERAR_SKILL()
GERAR_SKILL()
GERAR_SKILL()
```

Skill é apenas uma possível saída da Forja.

Hermes pode trabalhar simultaneamente sobre:

```text
código
site
runtime
testes
arquitetura
documentação
memória
checkpoints
skills
Obsidian
infra
integrações
```

conforme a missão exigir.

Contrato:

```text
MISSÃO → EXECUÇÃO REAL → PROVA → APRENDIZADO

IF aprendizado_reutilizável:
    CRISTALIZAR_EM_SKILL_OU_REGRA
ELSE:
    NÃO_CRIAR_SKILL
```

---

# ORGANIZAÇÃO

Antes de reorganizar:

```text
1. INVENTARIAR C:\CentralDark
2. INVENTARIAR E:\CentralDark
3. IDENTIFICAR ownership de cada pasta
4. IDENTIFICAR duplicatas
5. IDENTIFICAR matéria órfã
6. IDENTIFICAR links/dependências entre C e E
7. IDENTIFICAR o que está ativo
8. IDENTIFICAR o que é histórico
```

Depois classificar:

```text
KEEP_C
KEEP_E
DUPLICATE
ORPHAN
UNKNOWN
DO_NOT_TOUCH
```

`UNKNOWN` nunca autoriza movimento.

---

# MOVIMENTAÇÃO

Não mover, apagar ou sobrescrever matéria apenas para deixar a árvore visualmente bonita.

Antes de qualquer movimento material:

```text
SOURCE=
DESTINATION=
OWNER=
REFERENCES=
DEPENDENCIES=
BLAST_RADIUS=
ROLLBACK=
```

Sem isso:

```text
NO_MOVE
```

Diretórios explicitamente marcados como:

```text
nao mexe
```

permanecem:

```text
DO_NOT_TOUCH
```

até autorização explícita do CHEFE.

---

# DUPLICATAS

Se o mesmo componente existir nos dois discos:

```text
NÃO ESCOLHER PELO NOME
```

Medir:

```text
conteúdo
Git HEAD
data
uso atual
dependências
runtime
referências
```

Depois determinar:

```text
AUTHORITATIVE_ROOT=
```

Uma cópia histórica não vira automaticamente fonte da verdade.

---

# POLÍTICA MULTI-ROOT

```text
READ_C=ALLOWED
READ_E=ALLOWED

WRITE_C=ONLY_IF_SCOPE_BELONGS_TO_C
WRITE_E=ONLY_IF_SCOPE_BELONGS_TO_E
```

Hermes pode correlacionar os dois roots.

Não deve fundi-los.

---

# CONCORRÊNCIA

Pode investigar vários pontos simultaneamente:

```text
PARALLELIZE_PERCEPTION
```

Mas:

```text
SERIALIZE_MUTATION
ONE_WRITER_PER_SCOPE
```

Nunca alterar ao mesmo tempo duas cópias do mesmo componente sem estabelecer autoridade.

---

# ESTADO VIVO

Os caminhos acima são hipótese arquitetural inicial baseada na organização observada.

Antes de qualquer mutação:

```text
MEASURE_CURRENT_STATE()
```

Se a realidade mostrar propriedade diferente:

```text
REALITY_WINS
```

---

# RESULTADO ESPERADO

Ao final de uma rodada de organização:

```text
C:\CentralDark
= produto/site organizado dentro de sua própria raiz

E:\CentralDark
= Hermes/CentralDark operacional organizado dentro de sua própria raiz
```

E:

```text
C ↔ E
```

podem cooperar sem virar um diretório misturado.

---

# REGRA FINAL

> Use os dois discos.
> Não misture as casas.
> Trabalhe onde a matéria pertence.
> Consolide cada raiz dentro dela mesma.
> Skill é consequência de aprendizado, não objetivo obrigatório.
> Estado vivo decide autoridade.
> Evidência vem antes de movimento.

```text
C:\CentralDark → fica C:\CentralDark
E:\CentralDark → fica E:\CentralDark

ONE_SYSTEM
TWO_ROOTS
CLEAR_OWNERSHIP
```