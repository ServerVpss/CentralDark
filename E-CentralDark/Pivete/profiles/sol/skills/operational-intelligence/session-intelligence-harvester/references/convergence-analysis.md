# Análise de Convergência para Reconciliação de Evidência (CentralDark)

Quando múltiplas superfícies reportam sobre o mesmo fato (execução do modelo, terminal do Windows, Notepad, sessão, logs, screenshots), usar **análise de convergência** em vez de confiar em qualquer fonte única.

## Quando usar

- Modelo reportou X, terminal mostrou Y, Notepad tem Z sobre o mesmo episódio
- Quem investigar não pode executar em primeira mão com confiança (ex: no Windows, sem a ferramenta real)
- A evidência está espalhada entre textos, conversas, outputs, e precisar ser cruzada antes de concluir
- Um agente (ou humano) vai tomar decisão baseada na convergência ou divergência entre fontes

## When not to use

- Uma única fonte confiável e observável resolve a questão — não fazer análise desnecessária para "parecer rigoroso"
- O esforço de análise supera o risco de tomar a decisão errada; nesse caso registrar UNKNOWN + próxima ação concreta, não inventar análise longa

## Protocolo de convergência (5 olhos)

Para cada fatômetro relevante, reunir até 5 fontes independentes e rotular cada observação:

```text
FONTE 1 — execução do modelo (tool result observável, resposta do modelo, output concatenado)
FONTE 2 — terminal Windows (unzip -p, diff, find, ls, grep, qualquer resultado de ferramenta)
FONTE 3 — Notepad/localstate (aba, janela, path, texto minerado)
FONTE 4 — sessão/transcript (do que consta na conversa ou no agendamento)
FONTE 5 — fontes externas/state of the world (se relevante, ex: screenshot, arquivo de receita, estado do repo, etc.)
```

Para cada fonte, registrar:

```text
- O que a fonte diz
- Se a fonte é direta (viu o fenômeno) ou indireta (relatou/deduze/inferiu)
- Se a fonte é observável agora ou histórica/artefato
- Se a fonte confirma, contradiz, ou está sem relação com as outras
```

## Classificação por convergência

```text
CONVERGENTE
  → ≥2 fontes dão mesma conclusão com correspondência de conteúdo
  → ex: modelo e terminal dizem que o ficheiro está corrompido e o diff mostra bytes estranhos

CONCORRENTE
  → fontes descrevem o mesmo episódio, mas com ângulos diferentes ou granularidade diferente
  → não necessariamente contraditório, mas não é prova cruzada completa

DIVERGENTE / CONTRADITÓRIO
  → uma fonte diz A e outra diz B sobre o mesmo ponto e o conflito não é explicável por diferença de tempo/âmbito
  → ex: modelo diz que o arquivo foi lido, terminal mostra que o unzip falhou

INCONCLUSIVO / PONTO CEGO
  → nenhuma fonte razoável cobre o ponto, ou todas as fontes disponíveis são indiretas/degraded
  → registrar como UNKNOWN + tentar desenhar próxima ação que cobre a lacuna se for material
```

## Como evitar alucinação por "concordância superficial"

- Concordância de conclusão não é prova de causa: duas fontes podem concordar no resultado e errar a explicação
- Quando uma fonte é escrita por um modelo e outra é terminal, tratar quem tem acesso ao fenômeno real como a fonte mais credível para o nível de detalhe que ambas cobriram
- Se a conversa tiver fabricado um "diagnóstico" baseada em conhecimento geral em vez de leitura real, então não confiar no diagnóstico como evidência — só pode ser Euclidiana/hipótese, não prova
- Se a ferramenta real estava indisponível (ex: unzip como ferramenta nativa não estava no ambiente, ou a janela tava em uso), registrar essa incapacidade como parte da análise — não esconder atrás da análise textual

## Maldição de análise: risco de exagero

Análise de convergência é útil quando o custo de erro é maior que o custo de fazer a análise. Não usar análise longa como fachada de rigor quando o que importa é uma ação simples.

#### Sinais de análise desnecessária:
- O foco já foi resolvido por uma ferramenta real antes da análise
- A análise está sendo feita para produzir "prova" de algo que já foi decidido
- A análise está substituindo investigação real porque as ferramentas estão indisponíveis

#### Quando recortar:
- Se o resultado é apenas "não sei", não expandir a análise além de registrar a lacuna e a próxima ação candidata
- Se o custo de decisão errada é baixo, registrar e avançar

## Handoff de análise de convergência

Quando entregar análise para outro agente/modelo, formatar como:

```text
OBJETIVO DA CONVERGÊNCIA
FONTES REUNIDAS (n)
PARA CADA FATÔMETRO:
  - posição atual
  - fonte dominante (quem tem acesso mais credível ao nível de detalhe)
  - fonte complementar
  - lacuna existente (se houver)
VEredito
  CONVERGENTE / CONCORRENTE / DIVERGENTE / INCONCLUSIVO
AÇÃO SEGUINTE (se houver)
```

## Regras de integridade

```text
- Registrar como fontes apenas o que foi realmente consultado ou executado, não o que "deveria" ter tido acesso
- Se uma fonte falhou num ponto (ex: ferramenta indisponível, terminal não respondeu, unzip não estava disponível), registrar que a fonte não cobriu aquele ponto, não fingir que cobriu
- Se a análise dependeu de conhecimento geral do modelo em vez de leitura, dizer que é análise heurística/indireta, não evidência de execução
- Nunca usar a análise de convergência para reconstruir um facto que nenhuma fonte observável confere
- Se o custo do erro é alto, preferir mais fontes ou uma contramedida do que uma análise longa sem acesso real
```

## Exemplos reais desta sessão

- Ficheiro corrompido (LocalState.zip): modelo relatou descrição do conteúdo/decodificação, terminal do Windows mostrou unzip -p com bytes, Notepad/localstate mostrou que os ficheiros existem e têm conteúdo UTF-16 legível. Convergência forte para "ficheiro corrompido/danificado em comparação com o esperado" em nível de descrição. Lacuna: sem execução do unzip nativo ou ferramenta de extração real no momento da decisão, o nível de detalhe de reconstrução exata permaneceu limitado; para reconstrução exata, ação seguinte deve ter acesso à extração real, não análise textual.
- Script corrompido vs. arquivo que existia: modelo e terminal discordaram sobre se o ficheiro estava corrompido ou se era um caminho/janela diferente — portanto divergência, não convergência. O ponto foi registrado como divergente e não forçado a uma conclusão limpa.

## Guardrails

```text
SE_ANÁLISE_SEM_ACESSO_REAL
  → registrar como análise indireta
  → não promover para evidência de execução
  → tentar remediação com acesso real se for material

SE_FONTE_MAIS_CREDÍVEL_NÃO_COBRIU
  → registrar cobertura parcial
  → não cobrir a lacuna com inferência que se passa por execução

SE_ANÁLISE_NÃO_RESOLVE_E_NÃO_HÁ_AÇÃO_IMINENTE
  → fechar com UNKNOWN + próxima ação específica
  → não deixar a análise como "fechada" com resumo vazio ou genérico
```
