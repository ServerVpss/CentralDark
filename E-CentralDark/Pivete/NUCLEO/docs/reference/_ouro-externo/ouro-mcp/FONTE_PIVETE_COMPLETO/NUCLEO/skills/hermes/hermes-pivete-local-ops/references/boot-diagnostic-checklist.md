# Checklist de Boot Diagnóstico — Profile `pivete`

> Procedimento sistemático executado no boot de sessão (SOUL §14) para estabelecer estado real antes de qualquer missão.
> Consolidado a partir do boot total de 03/08/2026.

---

## 1. Identidade e Profile

```bash
# Confirmar profile ativo
ls -la "C:\Users\danda\AppData\Local\hermes\profiles\pivete\"
# Verificar SOUL.md local
cat "C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md" | head -30
```

**Evidência esperada**: pasta do profile existe, SOUL.md presente, `PROFILE=pivete` no cartão de boot.

---

## 2. Memória 3 Temperaturas (NUCLEO)

```bash
# Ler as 3 fontes canônicas
cat "E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\REGRAS.md"
cat "E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\SEMANA.md"
cat "E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\HOJE.md"
```

**Critério**: todas três com conteúdo (>0 bytes). `HOJE.md` pode ser binário no `read_file` — usar `cat`/`terminal` para ler.

---

## 3. Configuração Resolvida (config.yaml)

```bash
cat "C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml"
```

**Extrair e registrar**:
- `model.default` + `model.provider` (default no disco)
- `auxiliary.vision.model` + `provider` + `timeout`
- `telegram.enabled` (raiz) vs `platforms.telegram.enabled` (conflito silencioso §10)
- `display.show_reasoning` + `pet.slug` (indicador "Pensando" travado §20)
- `moa.active_preset` + `reference_models`

---

## 4. Modelo Real da Sessão vs Config

**Não assumir** que o modelo da sessão = `config.yaml`. O modelo ativo vem do gateway que subiu a sessão; `config set` só vale no próximo boot/restart.

```bash
# No terminal da sessão (este contexto):
echo "MODELO_SESSAO=$MODEL_PROVIDER/$MODEL_NAME"  # se variáveis expostas
# Ou inferir pelo comportamento: provider OpenRouter + modelo free = nemotron-3-ultra/etc.
```

**Registrar**: `CONFIG_DISCO=X | SESSAO=Y` — divergência é normal até reload.

---

## 5. Gateway — Processo, PID, Estado

```bash
# 5.1 PID e comando
wmic process where "name='python.exe'" get ProcessId,CommandLine | grep -i "gateway run"
# 5.2 Estado oficial
cat "C:\Users\danda\AppData\Local\hermes\profiles\pivete\gateway_state.json"
# 5.3 Logs recentes (últimas 50 linhas)
tail -50 "C:\Users\danda\AppData\Local\hermes\profiles\pivete\gateway-stderr.log"
```

**Verificar**:
- Gateway rodando (PID único, sem loop `--replace` duplicado §20)
- `gateway_state` = `running`
- `platforms.telegram.state` = `connected`
- `platforms.api_server.state` = `disconnected` (esperado sem `API_SERVER_KEY`)
- Erros 404 recorrentes em `tencent/hy3:free` → modelo inexistente no endpoint Nous
- Spam `api_server` refusing to start → config não tem `API_SERVER_KEY`

---

## 6. Portas e Serviços HTTP

```bash
# 6.1 Portas escutando
netstat -an | findstr LISTENING | findstr "8648\|9119"
# 6.2 Health checks (se portas ativas)
curl -s http://127.0.0.1:8648/health
curl -s http://127.0.0.1:9119/health
curl -s http://127.0.0.1:9119/api/health
```

**Interpretação**:
- `8648` = Web UI (node.exe `hermes-web-ui/dist/server/index.js`) — **independente do gateway**
- `9119` = API Server do gateway (precisa `API_SERVER_KEY` no config)
- Se nenhuma escuta: Web UI parado, API Server parado — gateway pode estar saudável só no Telegram

---

## 7. Skills Carregadas no Profile

```bash
ls -la "C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\" | grep "^d" | wc -l
hermes --profile pivete skills list 2>&1 | head -30
```

**Registrar**: contagem + skills críticas presentes (`meta-lupa`, `vision-fallback-autoresilient`, `hermes-pivete-local-ops`, `pivete-resposta`, etc.)

---

## 8. MetaLupa — Gate de Falsificação (SOUL §16)

Antes de declarar "tudo OK", verificar:

| Check | Evidência necessária |
|-------|---------------------|
| Painel verde ≠ funcionando | `VISION=<modelo>` no painel não prova pixels; prova = `vision_analyze` com anexo nativo |
| Status 200 ≠ pixels entraram | Health check HTTP não prova visão |
| Gateway rodando ≠ API Server | São processos/portas separados |
| Config no disco ≠ sessão ativa | Modelo da sessão pode divergir até restart |

**Se qualquer um falhar**: declarar `NÃO_VERIFICADO` ou lacuna explícita no boot report.

---

## 9. Relatório de Boot (formato Pivete)

```text
🟢 BOOT TOTAL CONCLUÍDO — PROFILE `pivete` ATIVO

📋 Resumo do Estado Real
| Item | Status |
|------|--------|
| Profile | `pivete` confirmado |
| Identidade | Eu SOU o processo Hermes (profile pivete) — não sou o Pivete |
| Modelo ativo (sessão) | <modelo> via <provider> |
| Config default (disco) | <modelo> / provider <provider> |
| Gateway | PID <N> rodando / parado |
| Telegram | Conectado / Desconectado (chat <id>) |
| API Server | Parado / Rodando (precisa API_SERVER_KEY) |
| Web UI (8648) | No ar / Não está no ar |
| Portas 9119/8648 | Escutando / Não escutando |
| Memória 3T | REGRAS/SEMANA/HOJE — todas com conteúdo |
| Skills carregadas | <N> skills (listar críticas) |

⚠️ Lacunas Detectadas (MetaLupa)
1. <lacuna 1>
2. <lacuna 2>
...

🧭 Próximo Passo Real
Aguardando sua direção. Boot cumpriu ciclo obrigatório (SOUL §14).
```

---

## 10. Referências Cruzadas no Skill

- §10: Telegram Gateway — Conflito de config silencioso
- §12: Gateway API — Endpoints de diagnóstico
- §20: Loop de múltiplos `gateway run --replace` + indicador "Pensando" travado
- §21: Web UI — Navegação SOM nas páginas Models/Providers
- `references/gateway-duplicate-loop.md`
- `references/gateway-tool-batching.md`
- `references/config-safe-mutation.md`

---

## 11. Próximos Passos Típicos Pós-Boot

| Situação | Ação |
|----------|------|
| API Server parado, precisa dashboard | Setar `API_SERVER_KEY` no `.env` + `telegram.enabled: true` raiz + restart manual gateway |
| Web UI parado, precisa Kanban/Models | Subir `hermes-web-ui` (npm start ou desktop app) |
| Modelo `tencent/hy3:free` dando 404 | Trocar `model.default` para modelo válido (ex: `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter) + restart manual |
| Gateway loop duplicado | `hermes gateway stop` → `sleep 4` → `hermes gateway run --replace` (SOUL §20) |
| Vision não funciona | Verificar `auxiliary.vision.provider` ≠ `"main"`/`"auto"`; setar multimodal real (gemini-2.5-flash-image via routellm) |

---

**Autor**: sessão boot 03/08/2026 (profile pivete, modelo nemotron-3-ultra via OpenRouter)  
**Validação**: procedimento reproduzido e confirmado na sessão — evidência em `HOJE.md` e `gateway-stderr.log`