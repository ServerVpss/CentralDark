# Atualização de Foto de Perfil via Bot API

## Erro Comum
Tentar enviar apenas o arquivo binário ou um `photo=@caminho.png` simples para `setMyProfilePhoto`. Retorna `400 photo isn't specified`.

## Método Correto (2026+)
A API exige o objeto `InputProfilePhotoStatic`.

1. **Formato:** Deve ser **.JPG**. PNG ou outros formatos falham.
2. **Payload:** JSON informando o tipo e o ponteiro do anexo.
3. **Multipart:** O arquivo vai num campo separado referenciado pelo JSON.

## Exemplo de chamada (curl)
```bash
TOKEN="seu_token_aqui"
JSON_PAYLOAD='{"type":"static","photo":"attach://perfil"}'

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/setMyProfilePhoto" \
     -F "photo=${JSON_PAYLOAD};type=application/json" \
     -F "perfil=@caminho_da_foto.jpg;type=image/jpeg"
```

## Veredito
Testado e aprovado em 04/08/2026 no bot `@Guardiaodopivete_bot`.
