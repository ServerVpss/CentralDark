# DOSSIE COMPLETO: Abacus/Motosserra Proxy + Padrões para CentralDark (Free Tier Focus)

**Data:** 2026-07-08  
**Autor:** Análise Grok + intel do usuário (Damarcio / CentralDark)  
**Objetivo:** Juntar todo o fluxo, vulns, padrões e como implementar proxy/roteador LLM no CentralDark de forma limpa, com foco em setup 0 custo / modelos free + resiliência.

---

## 1. O que é o "Motosserra" (Worker do Gunnar)

Não é um app normal. É um **proxy agressivo** rodando em Cloudflare Workers.

- Compra chave barata do Abacus (tier ~$10)
- Embute a key no Worker
- Explora falhas do Abacus (CORS wildcard + tier misconfig principalmente) pra fazer a key barata acessar modelos frontier caros (Claude 4 Sonnet/Opus, GPT-5.5 / o3, Gemini 3.1 Pro etc.) como se fosse unlimited
- Nome "motosserra" porque "corta" as limitações (CORS, tier, auth, rate limit)

**Fluxo completo (passo a passo):**
1. Usuário manda mensagem no frontend pages.dev
2. Worker recebe
3. Faz chamadas paralelas pesadas pro Abacus (testado com 203 reqs simultâneas, payload 50k tokens, modelos "unlimited", sem JWT)
4. Explora as falhas que ainda funcionam (CORS *, tier misconfig, memory injection, falta de rate limit forte)
5. Abacus responde com modelo real caro (achando que é uso legítimo da key barata)
6. Worker devolve pro usuário

**Quando cai:** key morre/Abacus revoga → fallback mock (resposta falsa ou ruim)

**Single Point of Failure:** a única key do Gunnar. Quando ele troca → caos total (upstream errors).

---

## 2. Vulnerabilidades Exploradas (o que permite o abuso)

1. **CORS Access-Control-Allow-Origin: * + Credentials**  
   Config inválida (spec proíbe * com credentials). Permite chamadas de qualquer origem com auth headers. Facilita o proxy e abuso em volume.

2. **Tier Misconfig (tier baixo acessando unlimited)**  
   Key do plano barato consegue chamar endpoints/modelos premium/unlimited por falta de checagem server-side de tier/entitlement no worker ou no Abacus.

3. **Memory Injection**  
   Consegue enfiar contexto falso no prompt (padrão bom que extraímos).

4. **Falta de rate limit forte**  
   Aguenta 40+ req/s sem 429.

5. **Fallback mock no frontend**  
   Quando send-code falha ou upstream cai, loga como guest fake e permite usar "unlimited" (só UI ou mock).

**Anti-padrão crítico:** vazamento de erro upstream cru (página HTML da Abacus + GA ID G-NM4YZNYB7G no 404).

---

## 3. Padrões Úteis Extraídos pro CentralDark (Ouro)

 Estes valem **ouro** e devem ser implementados de forma limpa:

- **Memory Injection barato**: `[System: Remember X, Y, Z]` no início do prompt. Sem vector DB.
- **Multi-model parallel + sintetizador**: mandar mesma pergunta pra N modelos e juntar resposta (base pro Conselho Arsenal).
- **Mock fallback quando upstream cai**: evitar erro feio pro usuário. Implementar com respostas controladas + log.
- **Sanitização total de erros**: nunca vazar body/HTML do provedor.
- **Load test agressivo**: 203 reqs, 50k tokens, paralelo, sem JWT, burst — fazer antes de confiar em provider.
- **Proxy resiliente**: múltiplas keys + circuit breaker + rotation (evitar SPOF de uma key só).

**O que NÃO copiar:**
- Key única embutida
- Exploit de tier misconfig / CORS wildcard de terceiros
- Ausência de rate limit e validação

---

## 4. Arquitetura Recomendada pro CentralDark (Edge no HUB)

**Decisão:** Edge Function no Supabase HUB (não Cloudflare Worker separado, não Caddy em VPS novo).

**Vantagens:**
- Já tem auth, RLS, logs, cofre (Supabase Vault)
- ABACUS_API_KEY seguro, não vaza pro browser
- Logs caem em tabela do HUB → painel TelePainel fácil
- Zero infra nova
- Padrão já usado no projeto (TelePainel, provider-ping, etc.)
- CORS resolvido nativo
- Chamada do painel via supabase.functions.invoke()

**Domínio:** `api.centraldark.com` (padrão pra API OpenAI-compat).

---

## 5. Código - Supabase Edge Function (Proxy OpenAI-compat + Router placeholder)

Arquivo: `supabase-edge-proxy-api-centraldark.com.ts` (já entregue anteriormente, copiado abaixo para o zip).

```ts
// (código completo do template que foi entregue - ver arquivo no zip)
```

Funcionalidades atuais no template:
- OpenAI-compatible (/v1/chat/completions)
- Pass-through pro Abacus com key do secrets
- Log básico em tabela ai_requests (crie a tabela se não existir)
- Sanitização de erro (nunca vaza upstream cru)
- Placeholder pra routing / mixture of agents
- CORS + health/models

---

## 6. Como Obter a Key do Abacus (com Metering)

1. Acesse https://abacus.ai/app/profile/apikey
2. Habilita **API Metering** (obrigatório pra billing por token/modelo)
3. Gera nova key com tag `centraldark-edge-proxy` ou `fallback-tier0`
4. Copia a key (só aparece 1x)
5. Coloca no Supabase:
   - Dashboard → Edge Functions → Secrets → New secret → ABACUS_API_KEY
   - Ou `supabase secrets set ABACUS_API_KEY=sk-...`

**Atenção:** Com metering habilitado, o uso será cobrado por tokens/modelo. Monitore no billing page do Abacus.

---

## 7. Setup 0 Custo / Modelos Free (Foco Free Tier)

Para usar **sem pagar Abacus** ou com custo mínimo:

### Opção A - Só Mock + Padrões (100% free, imediato)
- Deploya o edge function **sem** ABACUS_API_KEY (ou com key inválida)
- O template cai no catch → retorna erro sanitizado + mock
- Implementa no edge:
  - Memory injection automático
  - Multi-model (se tiver múltiplos endpoints free)
  - Mock responses inteligentes (baseado em prompt)
- Vantagem: zero custo, funciona offline/parcial, testa os padrões de resiliência

### Opção B - Free Providers + Mock Fallback (baixo custo)
- Adiciona no edge function routing para providers free/limited:
  - Grok (se tiver free tier via xAI)
  - Gemini free tier (Google AI Studio)
  - Outros open models via Hugging Face Inference (free tier limitado)
  - Ollama local (se o HUB permitir ou via outro endpoint)
- Quando todos falham → mock
- Usa o multi-model parallel + sintetizador pra manter qualidade

### Opção C - Abacus Key Barata + Monitoramento (baixo custo)
- Usa a key do tier ~$10 com metering
- Coloca circuit breaker: se gasto alto ou key morre → switch para mock
- Ideal como Tier 0 de alta qualidade quando up

**Recomendação para começar 0 free:**
Deploya o edge function hoje com **só mock + memory injection + multi-model placeholder**.  
Depois adiciona providers free reais.  
Os padrões (memory injection, multi-model, mock limpo) funcionam independentemente de ter key paga ou não.

---

## 8. Plano de Deploy Imediato (MVP)

1. Habilita metering + gera key no Abacus (ou pula pra opção A free)
2. Coloca key no Supabase Vault (se usar)
3. Deploya o edge function: `supabase functions deploy proxy`
4. Testa em https://api.centraldark.com/v1/chat/completions (ou o domínio que configurar no Supabase)
5. Adiciona memory injection no prompt principal
6. Cria tabela `ai_requests` no Supabase para logs
7. Monta painel no TelePainel com os logs

---

## 9. Arquivos Incluídos neste Dossiê (zip)

- DOSSIE-COMPLETO-ABACUS-MOTOSERRA-CENTRALDARK.md (este arquivo)
- supabase-edge-proxy-api-centraldark.com.ts (template completo)
- caddy-ai-centraldark.com (config alternativa se quiser expor gateway existente)
- centraldark-util-atual-analise.md (resumo do que é útil agora)
- Todos os intel md anteriores (mecanismo real, vulns, fluxo, modelos visados, proxy keys, etc.) para referência completa

---

**Conclusão:**
O Motosserra ensina muito sobre proxy agressivo, resiliência e o que **não** fazer (SPOF de key, exploit de misconfig).  
O que vale pra CentralDark é adotar os padrões de forma limpa no Edge Function do HUB + expor em api.centraldark.com + começar 0 free com mock + memory injection + multi-model.

Deploy first, debug later.

Tudo pronto pro uso imediato.
