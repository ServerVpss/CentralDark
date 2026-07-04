# 🎛️ Painel da Cadeia no Web UI — arrastar, ligar/desligar, salvar

## Como vai funcionar pra você

Abre o Web UI → card **"Cadeia do Hermes"** aparece no menu lateral (mesmo lugar dos outros painéis que já ajustamos). Dentro dele:

- Lista dos 15 modelos + Elite, cada um numa linha.
- **Arrasta a linha pra cima** = fica mais forte (tenta antes).
- **Switch verde/cinza** liga ou desliga sem precisar apagar.
- Campo pequeno pra ajustar o **tempo limite** (segundos) de cada um.
- Botão **"Salvar"** grava — Hermes pega em até 60s, sem restart.
- Botão **"Reverter"** volta pra ordem anterior (guardo backup automático das últimas 5 versões).

Extra: cada linha mostra um **placar mini** — quantas vezes esse modelo respondeu ok / falhou nas últimas 100 missões. Assim você decide com base em dado real.

## Onde vive cada coisa

**Fonte da verdade** (mesmo arquivo do plano anterior — não muda):
`docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/cadeia.json`

**API** (mesma casa, `api.centraldark.com`, só rota nova):
- `GET  /hermes/cadeia` → devolve o JSON atual + estatísticas
- `PUT  /hermes/cadeia` → salva ordem/timeouts/ativos novos (com validação)
- `POST /hermes/cadeia/reverter` → volta pra versão anterior
- `GET  /hermes/cadeia/stats` → placar de sucesso por modelo (últimas 100)

Autenticação: mesmo token que os outros endpoints do `api.centraldark.com` já usam. Não crio nada paralelo.

**Web UI** (dentro do módulo que já existe em `apps/modulos/WebUI/`):
- Novo card/página `Cadeia Hermes` no menu lateral
- Componente de lista arrastável (drag & drop simples, tipo playlist)
- Toast de "salvo ✅" quando confirma
- Indicador "Hermes lê em ~60s" no topo pra deixar claro

## O que o código do Hermes muda

Igual ao plano anterior:
1. `decisor.mjs` deixa de ter a lista fixa. Lê `cadeia.json` com cache de 60s.
2. Se JSON quebrado → cadeia de segurança + aviso no Telegram.
3. `PUT /hermes/cadeia` faz backup do JSON antigo em `cadeia.backups/YYYY-MM-DD-HH-MM.json` (últimos 5) antes de sobrescrever.

## Ordem de execução

1. Criar `cadeia.json` (fonte da verdade).
2. Adicionar rotas `/hermes/cadeia*` no serviço que já responde por `api.centraldark.com`.
3. Refatorar `decisor.mjs` pra ler o JSON.
4. Adicionar o card **"Cadeia Hermes"** no Web UI usando o padrão dos outros cards de lá.
5. Teste ponta-a-ponta: abrir o card, reordenar, salvar, disparar missão, ver Hermes usando a nova ordem.

## Arquivos que vou tocar

| Arquivo/pasta | O que faço |
|---|---|
| `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/cadeia.json` | criar |
| `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/decisor.mjs` | ler JSON + cache + fallback seguro |
| Serviço do `api.centraldark.com` (Elite HTTP, PM2 id 60) | 4 rotas novas `/hermes/cadeia*` |
| `apps/modulos/WebUI/` | card **Cadeia Hermes** + página + chamadas às 4 rotas |
| `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/cadeia.backups/` | pasta pra últimas 5 versões |

## Uma dúvida antes de codar

Confirma se prefere:
- **(a)** Reordenação **arrastando** com o mouse/dedo (mais bonito, um pouquinho mais de código no card), ou
- **(b)** Setinhas ⬆️⬇️ do lado de cada modelo (mais simples, funciona no celular sem drama).

Se não responder, vou de **(a) arrastar** que combina melhor com o resto do Web UI. Aprova o plano?
