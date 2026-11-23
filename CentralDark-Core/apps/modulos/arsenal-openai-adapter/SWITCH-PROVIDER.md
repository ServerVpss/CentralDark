# Trocar provider do ArsenalAdapter (sem quebrar nada)

Script pra alternar o `CentralDark-ArsenalAdapter` entre dois caminhos, **sem editar `ecosystem.config.cjs`**. Rollback = rodar o script com o outro modo.

## Os dois modos

| Modo | Vai por | Quando usar |
|------|---------|-------------|
| `proxy` | `arsenal-proxy` (Lovable AI Gateway) — padrão de fábrica | Volta pro estado consolidado. É o que tá no `ecosystem.config.cjs`. |
| `openrouter` | `openrouter.ai/api/v1` direto | Quando o conselho precisa de modelos que o Lovable Gateway não tem (GPT-5.5, Claude Opus 4, etc). |

## Setup único (só pro modo openrouter)

Na VPS, cria o arquivo **fora do repo**:

```bash
mkdir -p /root/CentralDark/secrets
cat > /root/CentralDark/secrets/openrouter.env <<'EOF'
OPENROUTER_KEY=sk-or-v1-COLE_AQUI_A_KEY_NOVA
EOF
chmod 600 /root/CentralDark/secrets/openrouter.env
```

Esse arquivo nunca vai pro Git (fica só na VPS).

## Uso

```bash
cd /root/CentralDark/apps/modulos/arsenal-openai-adapter
chmod +x switch-provider.sh   # só na primeira vez

./switch-provider.sh status        # ver em qual modo tá
./switch-provider.sh openrouter    # trocar pra OpenRouter direto
./switch-provider.sh proxy         # voltar pro Lovable (arsenal-proxy)
```

## Como o rollback funciona

Não tem "desfazer" separado — se algo der errado no `openrouter`, roda:

```bash
./switch-provider.sh proxy
```

E o adapter volta pro caminho antigo em 1s. O `ecosystem.config.cjs` continua intacto o tempo todo, então se você reiniciar a VPS ou fizer `pm2 resurrect`, ele sobe no modo `proxy` (o oficial).

## Observações

- Nenhum código do `server.mjs` foi tocado — o adapter já detecta sozinho se é URL de edge function (`/functions/v1/`) ou de OpenRouter (`/api/v1`) e ajusta a chamada.
- `pm2 save` roda no fim de cada troca, então o modo escolhido persiste em reboot.
- Se quiser "queimar" a chave OpenRouter no fim do projeto: `rm /root/CentralDark/secrets/openrouter.env` e roda `./switch-provider.sh proxy`. Sumiu.
