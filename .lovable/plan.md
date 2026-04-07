

# Melhorar Mensagem de Uso do Comando /PIX

## Problema
O módulo PIX do iSeek exige input no formato `NOME|meioCPF` (ex: `JOAO|345`), mas:
1. O placeholder diz apenas "Digite a chave PIX" — sem explicar o formato
2. Quando o usuário erra, a API retorna "INFORME OS DADOS NO FORMATO NOME|MEIOCPF CORRETAMENTE" — mensagem técnica e confusa
3. O usuário não sabe o que é "meioCPF"

## O que será feito

### 1. Melhorar o placeholder do comando /pix no Telegram
Trocar de `"Digite a chave PIX:"` para uma instrução clara com exemplo:
```
Digite no formato: NOME|MEIOCPF
Exemplo: JOAO|345
(meioCPF = 3 dígitos do meio do CPF que aparecem no comprovante PIX)
```

### 2. Interceptar erro do iSeek e retornar mensagem amigável
No `formatPixResult`, detectar quando a resposta contém "INFORME OS DADOS NO FORMATO" e substituir por uma mensagem educativa:

```
⚠️ FORMATO INCORRETO

Para consultar PIX, envie assim:
/pix NOME|MEIOCPF

📌 Exemplo: /pix JOAO|345

💡 O que é "meioCPF"?
São os 3 números do meio do CPF que aparecem
no comprovante de PIX (ex: ***.345.***)
```

### 3. Atualizar exemplo no menu de ajuda
Na seção de exemplos do bot, trocar o exemplo de PIX de `chave@pix.com` para `JOAO|345`.

## Arquivos alterados
- `supabase/functions/telegram-webhook/index.ts` — placeholder, formatação de erro, exemplo de ajuda

