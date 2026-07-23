# Plano — Nemotron 3 Ultra como cérebro padrão + GPT-5.6 Sol como segunda voz

## Contexto (com os números certos agora)

Puxei o preço público real do OpenRouter agora. **Nemotron 3 Ultra 550B é 10× mais barato que o GPT-5.6 Sol**, e mesmo assim joga no mesmo tier de potência. Isso muda a decisão inteira: dá pra rodar o cérebro pesado como padrão sem estourar orçamento.

Valores confirmados (USD por 1M tokens):
- Nemotron Ultra: $0,50 in / $2,20 out
- Sol: $5,00 in / $30,00 out
- Terra: $2,50 in / $15,00 out
- Luna: $1,00 in / $6,00 out

## Papéis no CentralDark

| Papel | Modelo | Justificativa |
|---|---|---|
| Cérebro principal (cockpit, /refinar, missões) | `nvidia/nemotron-3-ultra-550b-a55b` | Topo de potência pelo menor custo |
| Segunda voz (revisão cruzada, "duelo") | `openai/gpt-5.6-sol` | Voz OpenAI para diversidade de perspectiva |
| Fallback balanceado | `openai/gpt-5.6-terra` | Se topo cair, mantém qualidade |
| Fallback rápido / UI-fluff | `openai/gpt-5.6-luna` | Tooltips, tarefas curtas |
| Chat model do gateway atual | `openai/gpt-5.5` (fica) | Rota já existente, não mexer sem necessidade |

## O que muda no repo (branch `pivete/dev`)

1. **`apps/modulos/HERMES-CORE/core/cadeia.json`** — reordenar: Nemotron Ultra em posição 1, Sol em posição 2, Terra 3, Luna 4. Deixar os Gemini/GPT-5 antigos como fallback tardio.
2. **`docs/CONSCIENCIA/ARSENAL/regras.json`** — trocar:
   - `analista_profundo` → `nvidia/nemotron-3-ultra-550b-a55b`
   - `mestre_sabio` → `openai/gpt-5.6-sol`
   - `executor_rapido` → `openai/gpt-5.6-luna`
3. **`docs/CONSCIENCIA/DARKAI/03-CATALOGO-DE-MODELOS.md`** — adicionar seção "Modelos de topo com preço real (jul/2026)" com a tabela acima. Sem apagar nada.
4. **`docs/ENTREGAS-LOVABLE.md`** — item no topo registrando a mudança.

## O que NÃO muda (áreas 🔒)

- Nada em `apps/modulos/hub/`, `apps/modulos/proxy/`, `apps/modulos/elite-gateway/` — são áreas travadas.
- Nada em VPS/PM2/Caddy.
- Nada de secrets novos (Nemotron via OpenRouter usa key que já existe no cofre; se não existir, aviso e paro).

## Duelo de modelos no cockpit (opcional, só se quiser)

Se você quiser ver a "potência entre os dois" na tela, adiciono um botão "Segunda opinião" na SalaControle que dispara Nemotron + Sol em paralelo e mostra as duas respostas lado a lado. Custo real: ~$0,50 por debate de 1000 tokens de saída de cada. Deixo essa parte como opcional pra você aprovar depois.

## Aplicação da Lupa Bayesiana no próprio plano

- **Falsificador:** se em 48h de uso real o Nemotron Ultra der taxa de erro > 5% ou p95 > 8s, cai automático pro Terra e me avisa.
- **XP-1 contract_digest:** os 4 arquivos acima são o escopo total. Nada fora disso.
- **Risco residual:** OpenRouter pode subir preço; monitoro semanalmente e reporto se mudar >20%.

## O que preciso de você

Só confirmar: **"pode aplicar"** → executo os 4 arquivos, abro PR de `pivete/dev` → `pivete/auditoria` com labels `frontend`, `assign:lovable`, `revisao-humana`, e te mando o link.
