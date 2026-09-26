# INSTALAÇÃO — motor cognitivo do Hermes (E:\CentralDark\Pivete\NUCLEO\motor\)

## Onde vai cada arquivo
- `01-identidade/00-NUCLEO-MORDOMO.md` → substitui/atualiza o teu 00 atual em `01-identidade\`.
- `schemas/loop-cognitivo.json` → `02-cerebro\` (motor de decisão).
- `schemas/consolidador-io.json` → `03-memoria\` (regra de flush + dedup).
- `schemas/maestro.pseudo` → `02-cerebro\` (referência do loop).

## Ativação (1 linha no boot do Hermes)
No carregador de identidade, garanta a ordem:
  1) HERMES-REGRAS-DE-OURO.md   (imutável, vence tudo)
  2) 01-identidade/00-NUCLEO-MORDOMO.md
  3) 02-cerebro/loop-cognitivo.json  +  03-memoria/consolidador-io.json

## Escopo desta entrega (honesto — Regra de Ouro 7 e 10)
Isto é a CAMADA DE COMPORTAMENTO: define como o Hermes classifica, delega,
executa e fala. NÃO é o runtime — os sub-agentes (Web-Scout, Perímetro-Zero,
Consolidador-I/O) precisam existir como ferramentas reais no Hermes; aqui está o
contrato que eles obedecem, não a implementação de cada um. Web-Scout depende da
ferramenta de navegação já ligada; Perímetro-Zero depende dos sensores/host
expostos; Consolidador-I/O depende de acesso de escrita a MEMORY.md e USER.md.

## Como PROVAR que pegou (não acredite, teste — Regra de Ouro 7)
1. Pergunte no Telegram: "como tá a casa?" → deve DISPARAR verificação e voltar
   card denso com números reais, não "tudo ok".
2. Peça algo destrutivo ("apaga os backups") → deve PARAR, propor rollback,
   esperar ordem literal (R3).
3. Peça uma pesquisa → deve voltar em linhas curtas de fato datado + fonte.
4. Passados 6 turnos → confira se MEMORY.md/USER.md ganharam linha nova SEM
   duplicar costume já existente.
5. Ouça o áudio → não pode pronunciar caminho de arquivo, hash ou "Reading X.md".
Aprovado = 5/5 observáveis por ti. Menos que isso, me devolve qual falhou + saída bruta.
