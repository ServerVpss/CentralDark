# DOSSIE ATUALIZADO v2: Abacus/Motosserra + Técnicas Avançadas pro CentralDark (Free + Resiliente)

**Data:** 2026-07-08 (v2 - melhorado com técnicas concretas de implementação)  
**Melhorias nesta versão:** 
- Estrutura mais clara com seções de "Técnica X - Como implementar"
- Code snippets práticos pro Edge Function do HUB
- Circuit breaker simples + multi-model stub
- Free path mais detalhado com providers específicos
- Quando rodar stress test (frequência realista)
- Foco em deploy MVP imediato

---

## 1. Resumo Executivo (o que realmente importa)

O Motosserra é um proxy agressivo que usa key barata + explora falhas (CORS * + tier misconfig) pra entregar modelos frontier reais baratos. É instável (SPOF na key) mas ensina padrões de resiliência excelentes.

**Ouro pro CentralDark (implementar agora):**
1. Memory injection (barato, sem vector DB)
2. Multi-model parallel + sintetizador (Conselho Arsenal)
3. Mock fallback limpo + sanitização de erro
4. Proxy resiliente no Edge do HUB (múltiplas keys, circuit breaker)
5. Stress test só na validação de provider (não toda hora)

**Setup 0 free recomendado para começar hoje:** Edge Function só com mock + memory injection + multi-model stub. Zero custo, testa os padrões.

---

## 2. Fluxo e Vulnerabilidades (resumo rápido para referência)

( mantido do dossiê anterior - ver zip v1 se precisar do texto completo )

---

## 3. Técnicas Avançadas - Como Implementar no Edge Function do HUB

### Técnica 1: Memory Injection (barato e poderoso)
Adiciona fatos do usuário no prompt automaticamente.

**Exemplo no edge function (Deno/TS):**
```ts
function injectMemory(userFacts: string[], messages: any[]) {
  if (userFacts.length === 0) return messages;
  const memoryBlock = `[System: Remember these facts about the user: ${userFacts.join(", ")}]`;
  // Insere no início do system prompt ou como primeira mensagem
  const newMessages = [...messages];
  if (newMessages[0]?.role === "system") {
    newMessages[0].content = memoryBlock + "\n" + newMessages[0].content;
  } else {
    newMessages.unshift({ role: "system", content: memoryBlock });
  }
  return newMessages;
}

// Uso:
const enhancedMessages = injectMemory(["User likes concise answers", "User is in Brazil"], body.messages);
body.messages = enhancedMessages;
```

### Técnica 2: Multi-Model Parallel + Sintetizador (Conselho Arsenal)
Manda a mesma pergunta pra vários modelos e junta as respostas.

**Stub no edge function (pode evoluir para real parallel):**
```ts
async function multiModelCouncil(question: string, models: string[]) {
  // Por enquanto stub - depois implementar chamadas paralelas reais
  const responses = await Promise.all(models.map(model => 
    callProvider(model, question) // sua função de chamada
  ));
  // Sintetizador simples (pode usar LLM barato ou regra)
  return `Síntese do Conselho: ${responses.join(" | ")}`;
}
```

### Técnica 3: Circuit Breaker + Mock Fallback (resiliência)
Evita cascata de falhas e entrega resposta útil mesmo quando upstream cai.

**Lógica simples no edge:**
```ts
let failureCount = 0;
const FAILURE_THRESHOLD = 5;

async function callWithBreaker(providerCall: Function, fallback: Function) {
  try {
    if (failureCount >= FAILURE_THRESHOLD) {
      return await fallback(); // mock
    }
    const result = await providerCall();
    failureCount = 0;
    return result;
  } catch (e) {
    failureCount++;
    return await fallback(); // mock limpo
  }
}
```

### Técnica 4: Sanitização Total de Erros (anti-padrão do Motosserra)
Nunca retorna HTML ou detalhes do upstream pro cliente.

**Já implementado no template que entreguei** (catch retorna {error: "upstream_error", message: "Tente novamente em instantes"}).

---

## 4. Setup 0 Free / Modelos Free - Passo a Passo

**Opção Recomendada para Começar Hoje (100% free):**

1. Deploya o edge function **sem** ABACUS_API_KEY (deixa undefined)
2. O template cai no catch → mock
3. Implementa as técnicas acima (memory injection + multi-model stub + circuit breaker)
4. Testa com supabase.functions.invoke("proxy", { body: { model: "mock", messages: [...] } })
5. Adiciona memory injection nos prompts principais do Hermes/Conselho

**Opção com custo baixo depois:**
- Adiciona 1-2 keys baratas do Abacus (com metering)
- Circuit breaker desliga automaticamente se gasto alto ou falhas
- Mantém mock como fallback final

**Providers free/limited que valem testar no routing:**
- Gemini free tier (Google AI Studio)
- Grok (se xAI liberar free tier)
- Hugging Face Inference Endpoints (free tier limitado)
- Outros open models via endpoints públicos (verificar termos)

---

## 5. Quando Rodar Stress Test (frequência realista)

**Não precisa toda hora.**

Fazer o stress agressivo (203 reqs, 50k tokens, paralelo, burst, sem JWT) **somente**:
- Ao adicionar **novo provider** no catálogo MCP (validação)
- Após mudança grande no edge/gateway
- 1x por semana ou por mês nos providers principais (manutenção preventiva)
- Quando monitoring mostrar degradação

Em produção: confia no circuit breaker + logs + alarme no TelePainel.

---

## 6. Plano de Ação MVP Imediato (hoje)

1. Gera key no Abacus (ou pula pra free)
2. Coloca no Supabase Vault (ABACUS_API_KEY)
3. Deploya o edge function: `supabase functions deploy proxy`
4. Testa /v1/chat/completions
5. Adiciona memory injection no primeiro prompt que usa
6. Cria tabela ai_requests no Supabase (para logs)
7. Monta view simples no TelePainel com os logs

---

## 7. Arquivos no Zip v2

- Este dossiê atualizado v2 (com técnicas concretas)
- supabase-edge-proxy-api-centraldark.com.ts (template com placeholder pro router)
- caddy config (alternativa)
- centraldark-util-atual-analise.md
- Intel anteriores (para referência histórica)

---

**Minha opinião:** Essa versão v2 está **melhor** porque agora tem código prático que tu pode colar e testar hoje no edge function. O foco em "0 free primeiro" + técnicas concretas torna mais acionável do que o v1.

Se quiser mais alguma técnica específica (ex: logging avançado, RBAC no proxy, ou diagrama mermaid do fluxo), me fala que adiciono na v3.

Deploy first. O resto é debug depois.
