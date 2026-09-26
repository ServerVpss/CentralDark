# Memória fixa e aprendizado

> **Fusão canônica (19/07/2026):** este arquivo agora tem 2 seções
> históricas (protótipo SQLite, abandonado) + o design atual do kit
> `hermes-mente` (3 temperaturas), fundidos de
> `E:\CentralDark\Pivete\NUCLEO\hermes-mente\01-MEMORIA-VIVA.md`. Os
> limites de caracteres do schema conceitual (`consolidador-io.json`:
> MEMORY.md 8000 / USER.md 4000) NÃO batem com os limites reais hoje em
> produção (`profiles/pivete/config.yaml`: `memory_char_limit: 4200` /
> `user_char_limit: 1375`) — discrepância real, não aplicada ainda. A
> memória REAL do Hermes hoje são arquivos texto simples
> (`profiles/pivete/memories/MEMORY.md` e `USER.md`), não SQLite nem o
> schema novo. Ver `motor/10-observabilidade/MAPA-HERMES-19-07-2026.md`.

## Princípio

Guardar tudo não é aprender. O sistema separa:

- **interação:** histórico de conversa;
- **memória confirmada:** fato que o Pivete pediu para lembrar;
- **pontuação de especialista:** confiança operacional limitada;
- **ouro:** aprendizado reutilizável comprovado.

---

## DESIGN ATUAL — memória em 3 temperaturas (kit `hermes-mente`, 19/07/2026)

> Memória que não é lida não existe. Define O QUE lembrar e QUANDO ler.

### Três temperaturas (três arquivos em `memoria/`, agora em `03-memoria/memoria/`)

- **QUENTE — `memoria/HOJE.md`** (máx 50 linhas): estado de agora. Tarefas
  em andamento, promessas feitas ao dono, anomalias abertas, contexto do
  dia. CARREGAR SEMPRE, em toda interação.
- **MORNA — `memoria/SEMANA.md`** (máx 80 linhas): resumo dos últimos 7
  dias. Um bloco por dia, 3–6 linhas. Carregar quando a conversa referir
  passado recente.
- **FRIA — `memoria/REGRAS.md`** (sem limite, numerada): regras
  destiladas de erros e preferências confirmadas do dono. Buscar por
  palavra-chave quando o tema aparecer. É o APRENDIZADOS.md pessoal do
  mordomo.

### Formato de nota (padrão único, sem exceção)

`[AAAA-MM-DD HH:MM] [setor] FATO objetivo — IMPLICAÇÃO prática`

Exemplo: `[2026-07-19 21:40] [infra] disco / chegou a 82% — limpar caches antes de sexta`

### Rito de destilação (fim de dia, automático)

1. Ler `HOJE.md` inteiro.
2. Comprimir para 3–6 linhas → anexar em `SEMANA.md` (remover dia mais
   antigo se >7).
3. Perguntar-se: "algum erro, correção ou preferência nova do dono
   apareceu hoje?" Se sim → nova regra numerada em `REGRAS.md`, uma
   frase, forma imperativa.
4. Zerar `HOJE.md` deixando só o que continua em aberto.

### Promessa é dívida

Toda vez que disser "vou fazer X" ao dono, escreva X em `HOJE.md` com
`[PROMETIDO]`. Interação seguinte: primeiro cheque promessas abertas,
depois responda o novo. Mordomo que esquece o que prometeu é atendente.

> **Status real (19/07/2026):** os 3 arquivos existem em
> `03-memoria/memoria/` mas continuam vazios/template — `SOUL.md` agora
> INSTRUI o modelo a ler/gravar neles por gatilho, mas nenhuma gravação
> real foi confirmada ainda acontecendo (ver §46 do
> `REVISAO-TECNICA-DA-LUPA.md`, LACUNA declarada).

---

## HISTÓRICO — protótipo SQLite (abandonado)

O SQLite possui tabelas para:

- `interactions`;
- `memories`;
- `agent_scores`;
- `audit_events`.

A busca atual usa palavras em comum. Isso é simples, auditável e suficiente para o MVP. Vetores e embeddings ficam para quando a quantidade de memória justificar.

## Como gravar

Frase explícita:

```text
lembre que meu café preferido é sem açúcar
```

A memória recebe:

- origem;
- data;
- categoria;
- valor;
- status confirmado;
- indicador de atividade.

## Como recuperar

```text
o que você lembra de mim?
```

O sistema retorna memórias ativas por relevância lexical e recência.

## Aprendizado seguro

```text
/feedback bom
/feedback ruim
```

O feedback ajusta levemente a confiança dos especialistas que participaram da última resposta.

Limites:

- pontuação entre 0,10 e 1,00;
- alteração pequena por feedback;
- nenhuma edição automática de código;
- nenhuma criação autônoma de agente;
- toda mudança é registrada.

## Evolução futura

Somente depois de dados reais:

1. categorias de memória;
2. confirmação e correção pelo usuário;
3. resumos periódicos;
4. embeddings locais ou externos;
5. consolidação de memórias duplicadas;
6. esquecimento controlado e reversível.

## Privacidade

Não guardar secret, token, senha, chave ou conteúdo sensível desnecessário. O log de auditoria aplica sanitização básica, mas a regra principal é não enviar esse conteúdo ao sistema.
