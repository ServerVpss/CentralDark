---
name: vision-fallback-autoresilient
description: "Fallback automático de visão resiliente para o profile Pivete. Trata erros 404, falhas de provider e timeouts em análises de imagem, usando só multimodais já ativos no perfil."
triggers:
  - "vision_analyze error"
  - "No LLM provider configured for task=vision"
  - "vision 404"
  - "imagem não lida"
  - "modelo de visão sem resposta"
---

# Vision Fallback Autoresilient

## Regra de Ouro (ensinamento do Pivete, REGRAS #18/#19)
Nunca declarar "não consigo ver" antes de esgotar toda a cadeia de fallback multimodal confirmada no perfil. Se um cai, usa outro que tenha visão. Nunca ficar cego.

## Cadeia de Modelos Multimodais (só os que o profile já tem)
1. **Primário (real, do config L51-56):** `gemini-2.5-flash-image` via provider `routellm`
2. **Fallback 1:** outro modelo multimodal ativo no perfil, se o primário der 429/timeout/5xx — NUNCA `hy3:free` (sem visão nativa, REGRAS #18)
3. **Fallback 2:** segundo multimodal ativo no perfil, se o fallback 1 falhar

Config gravada em `profiles/pivete/config.yaml` L51-56 → `auxiliary.vision` (`model: gemini-2.5-flash-image`, `provider: routellm`).

CORREÇÃO (02/08): versão anterior citava `hy3:free` como primário e `grok-4.5`/`gpt-5.5` como fallback — ambos incorretos. `hy3:free` não tem visão; `grok-4.5`/`gpt-5.5` não estão confirmados no perfil (SKILL_EXISTE ≠ ACESSO_FUNCIONA, REGRAS #6). Usar só modelos confirmados no config.

## Protocolo de Execução
1. Tentar análise primária via **anexo nativo** ou **URL pública** (path local / `@file` / base64 → 404, REGRAS #1).
2. Se `vision_analyze` falhar com **erro de modelo/provider** (`No LLM provider` / timeout / 5xx / indisponível):
   - Chamar Fallback 1 = outro modelo **multimodal confirmado no config do profile** (nunca `hy3:free`, que não tem visão — REGRAS #18).
   - Se continuar offline/erro, alternar para Fallback 2 = segundo multimodal confirmado no profile.
   - NUNCA citar nomes de modelo não confirmados no config (ex.: `grok-4.5`/`gpt-5.5`). SKILL_EXISTE ≠ ACESSO_FUNCIONA (REGRAS #6).
3. **Erro 404 = transporte, não modelo.** Trocar de modelo NÃO resolve 404. Corrija o canal de entrega (anexo nativo ou URL pública) antes de tentar fallback.
4. Só declarar "cego" se TODAS as rotas multimodais falharem OU o canal de entrega estiver quebrado sem correção possível.
5. Registrar o delta de estado e informar apenas o resultado verificado (sem falso verde).

## Pitfall — não inferir o backend a partir de erro DENTRO de imagem não-lida
- Se a imagem veio por **path local/upload** e deu `404 Couldn't find that`, o CONTEÚDO dela NÃO entrou no contexto. Qualquer texto visível nela (ex.: `400 no remaining credits`) é **desconhecido para mim** — não afirmar que é meu backend.
- Provar estado de visão exige **anexo nativo da plataforma** que EU efetivamente leia. Se li o conteúdo, meu crédito de visão está OK; o erro visto no print é de OUTRO app (ex.: SOL/OpenClaw chamando OpenRouter), não do meu pipeline.
- Correção do Pivete (02/08): `se fosse crédito zerado vc nao taa vendo foto` — anexo nativo lido prova crédito OK. Registrado em HOJE.md.

## Gatilho de Aplicação
- Carregar esta skill quando ocorrer qualquer erro de visão ou quando o Pivete mandar "ver imagem" e o primário não responder.
- Não precisa de ordem nova a cada queda: o fallback é automático após o primeiro erro elegível.

## Verificação
- Provar o fallback num caso real (simular primário offline) antes de cravar "VISION resiliente".
- Validar YAML do config após qualquer edição (script de assert).
