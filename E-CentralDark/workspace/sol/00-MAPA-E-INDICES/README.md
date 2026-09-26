# SOL - mapa da Casa

Esta pasta organiza a superficie local da SOL sem substituir a arquitetura
canonica da CentralDark.

## Arvore

```text
workspace/sol
|-- 00-MAPA-E-INDICES   mapas, inventarios e indices
|-- 01-FONTES           fontes historicas e material de referencia
|-- 02-APP-SOL           destino reservado para o pacote da superficie SOL
|-- 03-VOZ              STT/TTS locais e provas de audio
|-- 04-PACOTES           zips, patches e pacotes recebidos
|-- 05-DOCUMENTACAO      documentos, relatorios e referencias
|-- 06-SCRIPTS           scripts auxiliares e de operacao
|-- 07-SESSOES           capsulas, receipts e contexto de sessao
|-- 90-ESTADO-LOCAL      logs e estado local nao versionado
`-- 99-QUARENTENA-REVISAO itens pendentes de classificacao
```

## Regras

- A fonte-mae continua sendo a arquitetura CentralDark, nao esta pasta.
- `01-FONTES` e somente referencia; nao e runtime executavel da Casa.
- `03-VOZ` abriga o Kokoro local e suas provas reproduziveis.
- A superficie ativa esta em `02-APP-SOL\SOL-DESKTOP-POC-ACTIVE`.
- O ingresso web local da SOL usa `apps\sol-desktop`; o TTS local usa
  `03-VOZ\Kokoro-FastAPI`.
- Secrets, `.env`, banco, Docker, PM2, Caddy e producao ficam fora deste
  arranjo.
