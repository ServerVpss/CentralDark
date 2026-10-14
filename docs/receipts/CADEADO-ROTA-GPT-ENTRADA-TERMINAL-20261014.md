# 🔒 Selo de observação — entrada GPT no terminal (2026-10-14)

## Intenção e evidência
O CHEFE confirmou em conversa que a rota observada é o **comando/entrada `GPT` no terminal**, **não** a identidade nem a disponibilidade de um modelo.

Evidência de origem: fotografia enviada na conversa de 2026-10-14 (não copiada para o repositório). A imagem mostra:
- campo de entrada do terminal com o texto `GPT` e cursor;
- sugestões repetidas `gpt-5.6-luna-900k` com coluna `ctx --`;
- nenhum resultado de execução do comando `GPT` visível nesse recorte.

## Fronteira da prova
```text
TERMINAL_GPT_INPUT_VISIBLE=PASS
CHEFE_CONFIRMOU_ROTA=YES
COMANDO_GPT_EXECUTADO=NOT_PROVEN
COMANDO_GPT_RESOLVE_DESTINO=UNKNOWN
AUTENTICACAO_DA_ROTA=UNKNOWN
MODELO_GPT_ATIVO=NOT_PROVEN
INTEGRACAO_CENTRALDARK_RUNTIME=NOT_PROVEN
TECHNICAL_ACL_LOCK=NOT_APPLIED
```

**Selo restrito:** somente a entrada visível `GPT` e a confirmação do CHEFE. Não atribuir execução, autenticação, disponibilidade de modelo, CLI instalada ou persistência fora desse recibo.

## Reuso no Circuito / Instinto Superior
- Rota candidata: `Terminal → GPT`; registrar como **entrada observada**.
- Antes de promover a `PASS EXECUTÁVEL`, confirmar o comando exato acionado, o resultado de execução e a conexão ao owner existente, com timestamp e receipt sanitizado.
- Reutilizar o botão `👁️ Circuito — Vazamentos` do HUD existente; não criar núcleo paralelo nem exibir verde falso.
- Segredos não transitam por GitHub, HUD, logs ou recibos.

## Ledger
Repositório `ServerVpss/CentralDark` · `main` · PR-mãe #1562 somente como âncora, não mergear. 
Método: observar → registrar evidência → entregar rastro → selar somente o escopo comprovado.
