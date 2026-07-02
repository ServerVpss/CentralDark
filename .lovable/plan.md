## O que vai ser feito

Manter tudo que já existe funcionando (nenhuma IA da VPS perde nada) e adicionar em cima uma "central de cérebro compartilhada" chamada **darkai**, com documentação completa numa pasta só, pra você levar no pendrive e ensinar qualquer outra IA depois.

---

## 1. Edge function nova: `ai-proxy`

Criar em `supabase/functions/ai-proxy/index.ts` — genérica, aceita qualquer prompt.

- Recebe: `{ prompt, system?, model? }`
- Usa `LOVABLE_API_KEY` (já está nas secrets, seguro no Lovable Cloud)
- Chama Lovable AI Gateway (`google/gemini-3-flash-preview` como padrão)
- Devolve: `{ text }`
- CORS liberado + validação Zod + tratamento de 429/402

A `graph-mapper` **continua existindo do lado**, intocada. `ai-proxy` é adicional, não substitui.

## 2. CLI `darkai` na VPS (script, não instala agora — só documentado)

Arquivo `docs/CONSCIENCIA/DARKAI/darkai.sh` pronto pra copiar pra `/usr/local/bin/darkai` na VPS depois. Uso:

```bash
darkai "resume esse log"
darkai --system "você é auditor" "analisa esse arquivo"
cat erro.log | darkai "classifica esse erro"
```

Por baixo faz `curl` na edge `ai-proxy`. Qualquer IA da VPS (Claude Code, Sonnet, scripts Python) chama `darkai` — vira o "telefone único".

## 3. Pasta de documentação completa

Criar `docs/CONSCIENCIA/DARKAI/` com:

- `README.md` — o que é, pra que serve, arquitetura (fluxo VPS → darkai → ai-proxy → Lovable AI)
- `COMO-USAR.md` — exemplos práticos pra humano e pra IA
- `COMO-ENSINAR-OUTRA-IA.md` — prompt pronto pra colar em Claude/GPT/Gemini novo explicando o sistema
- `INSTALAR-NA-VPS.md` — passo a passo do `darkai.sh` + onde colocar
- `darkai.sh` — script do CLI
- `exemplos/` — casos reais (resumir log, classificar erro, gerar código)

## 4. Arquivo temporário com as chaves (o que você pediu)

Criar `docs/CONSCIENCIA/DARKAI/CREDENCIAIS-TEMP.env` com:

- `LOVABLE_API_KEY` (valor real, pra você copiar)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- URL da edge `ai-proxy`
- Exemplo de `curl` já com tudo preenchido

**Importante que você já sabe:** esse arquivo fica commitado no repo enquanto você não avisar. Assim que confirmar "peguei, pode apagar", eu removo e adiciono no `.gitignore`. Enquanto tá lá, qualquer pessoa com acesso ao repo vê. Você confirmou que tá ok pelo tempo curto.

Sobre zip com senha: dá pra fazer, mas como você mesmo vai apagar em seguida e o repo é seu, o `.env` puro já resolve e é mais rápido de copiar. Se preferir zip mesmo, me fala a senha que você quer que eu use (ou eu gero uma e te falo no chat).

---

## Detalhes técnicos

- Edge `ai-proxy` segue padrão `Deno.serve` + `corsHeaders` do `npm:@supabase/supabase-js@2/cors`
- Modelo padrão: `google/gemini-3-flash-preview` (rápido/barato); override via param
- Rate limit 429 e créditos 402 retornam JSON claro pro CLI printar
- `graph-mapper` fica intacta — nada muda lá
- Nenhuma chave vaza pra VPS: `darkai` só conhece a URL pública da edge + a anon key (que é pública mesmo)
- `LOVABLE_API_KEY` só existe no Lovable Cloud, ninguém na VPS vê

## Áreas protegidas

Nada da Seção 9 do CLAUDE.md é tocado. Só adiciono arquivos novos em `supabase/functions/ai-proxy/` e `docs/CONSCIENCIA/DARKAI/`.

---

Confirma que posso seguir? Se quiser zip com senha em vez de `.env` puro, me diz a senha (ou peço pra eu gerar).
