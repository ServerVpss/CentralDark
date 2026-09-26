# Mapa de caches e destinos visuais observados

Este arquivo registra **locais realmente usados e provados**. Não registra conteúdo privado, cookies, tokens ou credenciais.

## Schema

```text
LOCATION_ID
PURPOSE
ROOT_PATH
STATUS=VERIFICADO|NAO_VERIFICADO|OBSOLETO
FIRST_OBSERVED_AT
LAST_OBSERVED_AT
LAST_PROOF
STABLE_DESTINATION
RETENTION_ASSUMPTION
```

## DESKTOP_COMPOSER_IMAGES

```text
LOCATION_ID=DESKTOP_COMPOSER_IMAGES
PURPOSE=origem de imagens anexadas nativamente no app Desktop
ROOT_PATH=C:\Users\danda\AppData\Roaming\Hermes\composer-images\
STATUS=VERIFICADO
FIRST_OBSERVED_AT=2026-07-29
LAST_OBSERVED_AT=2026-07-29T02:37:25-03:00
LAST_PROOF=arquivo composer_2026-07-29_05-34-16-921_d374d4.png existe; SHA256 334f058257bf3b1e3babafe4400d40f66956c26a55b0e4a5921e71e435e3e84a
STABLE_DESTINATION=C:\Users\danda\Pictures\
RETENTION_ASSUMPTION=cache temporário; copiar antes de depender dele
```

Uso comprovado anterior:

```text
ORIGIN=C:\Users\danda\AppData\Roaming\Hermes\composer-images\composer_2026-07-29_05-17-33-967_3890ba.png
STABLE_COPY=C:\Users\danda\Pictures\pivete-snapshot-sinapse-01.png
HASH_MATCH=SIM
```

## STABLE_PICTURE_DELIVERY

```text
LOCATION_ID=STABLE_PICTURE_DELIVERY
PURPOSE=destino estável para reenvio de imagem via MEDIA
ROOT_PATH=C:\Users\danda\Pictures\
STATUS=VERIFICADO
FIRST_OBSERVED_AT=2026-07-29
LAST_OBSERVED_AT=2026-07-29T02:37:25-03:00
LAST_PROOF=diretório existente; cópia anterior entregue com hash idêntico à origem
STABLE_DESTINATION=C:\Users\danda\Pictures\
RETENTION_ASSUMPTION=persistente até remoção explícita do usuário
```

## BROWSER_VISION_TRANSIENT

```text
LOCATION_ID=BROWSER_VISION_TRANSIENT
PURPOSE=snapshot visual produzido por browser_vision
ROOT_PATH=NAO_EXPOSTO
STATUS=NAO_VERIFICADO
FIRST_OBSERVED_AT=2026-07-29
LAST_OBSERVED_AT=2026-07-29
LAST_PROOF=imagem apareceu no contexto, mas a ferramenta omitiu screenshot_path e nenhum PNG foi localizado
STABLE_DESTINATION=NONE
RETENTION_ASSUMPTION=não considerar persistido sem screenshot_path real
```

## Regra de atualização

```text
cache usado novamente
→ provar existência
→ atualizar LAST_OBSERVED_AT e LAST_PROOF
→ copiar artefato necessário para destino estável
→ comparar SHA-256
→ entregar com MEDIA:
```

Nunca converter ausência de descoberta em prova de inexistência.
