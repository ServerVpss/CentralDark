---
name: free-tier-healthcheck
description: Use when Pivete asks free models or balance. Auto-diagnose.
---

# Free-Tier Healthcheck (perfil pivete)

## Quando usar
Pivete pergunta "quais modelos free", "saldo free tier", "disponibilidade", ou variação sobre crédito/limite de modelo gratuito. NÃO perguntar "quer que eu teste" — já rodar o healthcheck e trazer o laudo preciso. Modo Casa: direção clara = executar.

## Passos
1. Ler `config.yaml` do profile: `C:/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml` — achar `providers.custom[].base_url` e `key_env`.
2. **EXCLUIR DarkAI/Lovable da cadeia** — vai virar rota própria CentralDark em breve; não sondar, não incluir em fallback, não atrapalhar diagnóstico.
3. Para cada provider VALEDO (Nous/hy3:free, MiniMax free, etc), `GET {base_url}/models` com `Authorization: Bearer $KEY`. Lista os modelos disponíveis.
4. Para 1-2 modelos baratos, `POST {base_url}/chat/completions` com max_tokens pequeno.
5. Interpretar:
   - HTTP 200 → tem crédito / livre
   - HTTP 402 + `{"error":"sem_creditos"}` → saldo zerado (não DarkAI — ele já tá fora)
   - HTTP 404 no path → endpoint errado (faltou `/v1`)
   - HTTP 502 → provider oscila (hy3:free sob carga)
6. Nous Portal (`tencent/hy3:free`): não tem API de saldo (portal devolve HTML). Free é rate-limited por req, não por $. Testar rate batendo N vezes se Pivete quiser.
7. MiniMax free: limite de 5h/dia (rate por horário), saldo credor zero. Usável se não estourou a janela.
8. Trazer laudo: lista de modelos + status de crédito por provider válido + qual free é utilizável AGORA. DarkAI listado como "FORA DA CADEIA".

## Pitfalls
- MSYS (git-bash no Windows): `/tmp` pode não gravar — usar stdout direto do curl ou `$HOME/_probe.json`.
- Não confundir "modelo na lista" com "tem crédito". Lista 200 ≠ pode usar.
- Nous não expõe saldo via API — não inventar número.
- DarkAI/Lovable: NÃO sondar. Aguardar rota própria CentralDark.
- SiliconFlow (`sk-api...`): keys expiram em ~24-48h, checar validade antes de usar.

## Regra de não-retrabalho (CHEFE 08/08)
- 1 probe por provider. Falha isolada (402/502/404) NÃO derruba a sessão nem repete a pergunta.
- Se um provider não responde / sem crédito: marca NÃO_VERIFICADO naquele e PULA SOZINHO pro próximo válido.
- Não destruir a cadeia toda por 1 chamada que não deu. Trazer laudo com o que funcionou.
- Modo Casa: direção clara = executar e entregar recibo, sem "quer que eu teste?".

## Verificação
Laudo deve conter: (a) modelos disponíveis por provider, (b) status HTTP do probe de completions, (c) mensagem de erro crua se houver, (d) veredito "free utilizável agora: X / nenhum".
