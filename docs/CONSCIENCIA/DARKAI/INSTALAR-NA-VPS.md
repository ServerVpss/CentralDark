# Instalar darkai na VPS

## 1. Copiar o script
```bash
sudo cp /root/CentralDark/docs/CONSCIENCIA/DARKAI/darkai.sh /usr/local/bin/darkai
sudo chmod +x /usr/local/bin/darkai
```

## 2. Testar
```bash
darkai "diz oi em uma palavra"
```
Se voltar algo tipo `Oi!`, tá funcionando.

## 3. (Opcional) Configurar modelo/URL diferentes
O script lê variáveis de ambiente. Coloca em `/etc/environment` ou `~/.bashrc`:

```bash
export DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
export DARKAI_ANON_KEY="eyJhbGciOi..."   # anon key pública, ok expor
export DARKAI_MODEL="google/gemini-3-flash-preview"  # padrão
```

Os valores já vêm hardcoded no script como fallback, então funciona sem configurar nada.

## 4. Se quebrar
- `darkai: command not found` → não copiou pra `/usr/local/bin/` ou faltou `chmod +x`.
- `curl: command not found` → `apt install curl -y`.
- `error: sem_creditos` → workspace do Lovable sem crédito, adicionar em Settings → Plans & credits.
- `error: rate_limited` → esperar 30s.
- Resposta vazia → conferir se a edge `ai-proxy` foi deployada (deploy automático pelo Lovable).

## 5. Desinstalar
```bash
sudo rm /usr/local/bin/darkai
```
