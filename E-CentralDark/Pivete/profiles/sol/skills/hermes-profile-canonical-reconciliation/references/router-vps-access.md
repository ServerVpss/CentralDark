# Router CentralDark + Acesso VPS — Notas de Sessão 2026-08-27

## Router local (Casa, E:\) — MEDIDO, FUNCIONA

O router da CentralDark roda localmente e responde de ponta a ponta:

- Porta do daemon/health: `127.0.0.1:8199` → `GET /health` retorna 200 (FastAPI, `centraldark_omni_router.py`, PID vivo)
- Porta do chat real: `127.0.0.1:8099/v1/chat/completions` → `POST` com body JSON
- Engine resolve pelo campo `model` no payload (ex: `nous/tencent/hy3:free`, `claude-code/test`)
- Resposta traz `centraldark.engine`, `resolved_model`, `duration_ms`, `fallback_used`
- O router se autodeclara honesto: `action_is_proof: false` no payload de retorno

### Comando que funciona (não o inline que quebra)

```bash
# GERAR arquivo em vez de -d inline (Git Bash quoting quebra o inline)
cat > /tmp/req.json <<'EOF'
{"model":"nous/tencent/hy3:free","messages":[{"role":"user","content":"oi"}]}
EOF
curl -s --max-time 20 -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" -d @/tmp/req.json
```

Inline `curl ... -d '{"model":"x"}'` no Git Bash/MSYS dá 501 / corpo vazio.
Usar `-d @arquivo` sempre.

## MCP / VPS — INALCANÇÁVEL DA SESSÃO CASA

- `mcp.centralldark.com` (gateway da VPS) = **502** quando medido → VPS fora do alcance daqui
- Sem SSH da sessão Casa, VPS = `UNKNOWN`. Não fingir execução (`ACTION != PROOF`)
- Quem opera a VPS é o braço que está lá (outra sessão/Claude), não o Hermes da Casa
- Gateway local `127.0.0.1:9119` = 200 (vivo, mas é sessão, não chat)
- Site `127.0.0.1:8080` = 200

## "permito" não reescreve lei

- Lei canônica (ex: "Nunca pm2 restart all" no MCP CentralDark + skill centraldark-esteira-motor)
  vigora mesmo com "permito" do CHEFE
- "permito" autoriza ação pontual, não apaga regra registrada
- Se o comando for proibido por lei, bloquear e apontar a lei — não desobedecer
- Mudar a lei = PR no contrato, não grito pontual

## Skills no cofre vs main

- `E:/CentralDark/_RECONCILIATION/OURO/FONTE_PIVETE_COMPLETO/NUCLEO/skills/casa-github-sync`
  existe no COFRE mas NÃO na main do repo
- `tecnicadalupa` (Grok) duplicava `meta-lupa` (grep em `.agents/skills/meta-lupa` provou:
  Realidade/Aparência, regressão, rollback, legado já cobertos) → não criar
- Regra: COFRE_SKILL_NOT_IN_MAIN → medir dono na main antes de promover
