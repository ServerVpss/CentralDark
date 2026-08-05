# Pacotão CentralDark — snapshot histórico de 10/07/2026

Status: **ARQUIVO HISTÓRICO / NÃO OPERACIONAL**

Este diretório registra o pacote original criado em 10/07/2026 sem transformar scripts, boots ou doutrinas antigas em componentes ativos do runtime atual.

## Por que foi arquivado como ZIP único

A busca no repositório não encontrou o pacote, os scripts do Enxame Ômega nem os relatórios Overclock como arquivos versionados. Parte dos princípios já reaparece na consciência atual do CentralDark. Importar os 51 arquivos individualmente criaria risco de duplicação, caminhos mortos e instruções operacionais superadas.

Assim, a correção mínima é:

1. preservar o pacote original byte a byte;
2. registrar manifesto e hash;
3. adicionar uma análise retrospectiva que separa evidência, hipótese e legado;
4. deixar claro que nenhum script do ZIP é promovido automaticamente.

## Integridade

```text
ARQUIVO=PACOTAO-CENTRALDARK-2026-07-10.zip
TAMANHO_BYTES=1379485
SHA256=d9192ee1e690344a72b3d17554e0151a61d7761da814d0afa5291232cf880dc4
ARQUIVOS_INTERNOS=51
DATA_DO_SNAPSHOT=2026-07-10
```

O arquivo `MANIFEST.sha256` contém o hash SHA-256 de cada item interno.

## Conteúdo

- desafios Staff para análise de performance e falsificação;
- scripts históricos do Enxame Ômega;
- relatórios e dados brutos da investigação pública do Overclock;
- doutrinas e boots daquele período;
- trace, perfis V8, dados A/B e script de reprodução.

## Segurança e alcance

- nenhuma credencial foi deliberadamente incluída;
- o pacote contém referências a variáveis e locais de secrets, mas não deve ler nem copiar valores;
- existem identificadores e caminhos históricos que podem estar obsoletos;
- o ZIP não deve ser descompactado automaticamente em VPS, produção ou diretórios canônicos;
- qualquer reaproveitamento exige comparação com a governança e o mapa atuais.

## Arquivos acompanhantes

- `ANALISE-RETROSPECTIVA-OVERCLOCK-E-METODO-PIVETE.md`
- `MENSAGEM-PARA-O-DONO-OVERCLOCK.md`
- `MANIFEST.sha256`

## Decisão de promoção

```text
REGISTRO_NO_GITHUB=SIM, via PR
DEPLOY/VPS=NAO_APLICAVEL
IMPORTACAO_DOS_SCRIPTS=NAO
PROMOCAO_DAS_DOUTRINAS_ANTIGAS=NAO
PACOTE_ORIGINAL_PRESERVADO=SIM
```
