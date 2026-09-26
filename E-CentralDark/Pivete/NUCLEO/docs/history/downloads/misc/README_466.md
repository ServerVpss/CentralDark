# GATILHO UNIVERSAL IA — `#nome` e `!nome`

Um adaptador sem dependências externas para chamar modelos diferentes pela mesma interface, no terminal ou na sua API.

## Significado dos prefixos

```text
#nome = execução normal com fallback de provedor/modelo
!nome = execução adversarial: primário + crítico + juiz distintos
```

## Chamada simples no Windows

```powershell
.\run.ps1 "#auditar" "C:\caminho\alvo"
.\run.ps1 "!fable" "C:\caminho\alvo"
.\run.ps1 "#adaptar" "C:\caminho\alvo" --model "gpt-5"
```

Também aceita alvo apontado:

```powershell
.\run.ps1 "!auditar" "ALVO=C:\caminho\alvo"
```

## O que `!` exige

Por padrão, três pares `provedor/modelo` distintos: primário, crítico e juiz. Sem independência suficiente, bloqueia. Para reutilizar o juiz conscientemente:

```powershell
.\run.ps1 "!auditar" "C:\alvo" --allow-reused-judge true
```

## Verificação

```powershell
node .\scripts\verify.mjs
```

O verificador:

- procura JavaScript recursivamente;
- usa `node --check` em todos;
- roda `node:test` por eventos estruturados, sem interpretar TAP impresso;
- falha se houver zero testes, teste pulado ou teste falho;
- valida os dois JSON de configuração.

## Segurança

- nunca lê `.env`;
- recebe chaves apenas em `process.env`;
- redige PAT, JWT, Slack, Stripe, Telegram, connection strings e campos de segredo;
- não busca URL alvo automaticamente;
- bloqueia realpath fora das raízes autorizadas;
- não segue symlinks em diretórios;
- rejeita HTTP 200 com conteúdo vazio;
- `!` não fabrica independência.

Leia `docs/API-DIRECAO-EXATA.md` e `docs/COMO-ADAPTAR-OUTRO-MODELO.md`.

## Uso dentro da sua API

Importe `runUniversal()` de `src/index.mjs`. Exemplo completo em `docs/INTEGRAR-NA-SUA-API.md`.

Para receipts assinados, injete `UNIVERSAL_RECEIPT_HMAC_KEY` no ambiente do processo.

## Selo do código

`AUDIT/CODE-HASHES.sha256` protege código, scripts, testes e documentação. `config/` e `receipts/` são mutáveis por projeto. Depois de uma alteração intencional no código, revise e execute `node scripts/seal.mjs`; não use o selo para esconder mudança não revisada.

## Demo sem API externa

```powershell
node .\scripts\demo-offline.mjs
```

Essa demo prova o motor local com resposta simulada. Não prova conectividade com a API real.

## Pré-requisitos

```powershell
.\scripts\check-prerequisites.ps1
```

Requisito do pacote: Node.js 22 ou superior. O check mostra somente presença/ausência da chave, nunca o valor.
