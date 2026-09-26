---
name: agent-media-recovery
description: "Image fails in chat? Read from disk by path not chat API"
version: 1.0.0
author: Hermes (Pivete)
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [multimodal, image-recovery, vision, disk-read, anti-theater]
    related_skills: [operational-method, centraldark-operational-method]
---

# Agent Media Recovery (recuperação de imagem/anexo)

## Gatilho
O chat devolveu: "API Error: an image in the conversation could not be processed and was removed" / erro de visão / print não aparece. OU o usuário mandou `image.png` / `clip_*.png` e a API de chat não processou.

## Regra de ouro (correção do CHEFE, sessão 2026-08-27)
> "erro de sua parte, procure a lacuna, não venha me dizer nada que não interessa, resolve o erro"

Parar e dizer "não consegui ver a imagem" é **teatro e lacuna do agente**, não limite da ferramenta. A imagem quase sempre caiu no disco em algum lugar acessível. O agente deve ir buscar e ler por path.

## Passos (READ_ONLY, sem expor nada)
1. Não inventar o conteúdo da imagem. Nunca.
2. Procurar o arquivo no disco por path conhecido ANTES de pedir pro usuário:
   - Windows/Hermes Casa: `E:/CentralDark/Pivete/images/clip_*.png` (screenshots caem aqui)
   - Temp do Hermes: `C:/Users/<user>/AppData/Local/Temp/`
   - Downloads: `C:/Users/<user>/Downloads/`
   - Se o usuário deu nome (ex: `pm2_status.png`), grepar por ele
3. Evitar `find` amplo em árvore gigante (timeout). Usar `ls` nas pastas de imagem conhecidas primeiro.
4. Ler com `vision_analyze(image_url="<path_absoluto>")` apontando pro arquivo — NÃO com a API de chat.
5. Se `read_file` servir (texto/print simples), usar `read_file`.
6. Se não achar em lugar nenhum: perguntar ao usuário o nome/exato path ou pedir re-envio COM nome claro. Só então desistir.

## Pitfalls
- Esperar a API de chat processar a imagem e parar quando falha = erro do agente, não da ferramenta.
- `find` recursivo em `E:/` ou `C:/Users` com `-newermt` amplo = timeout (180s+). Sempre restringir pasta ou usar `ls` direto.
- Nunca ler arquivo que contenha secret só pra "ver se abriu" — sanitizar, não repetir.
- Não transformar "imagem não processou" em desculpa de não agir.

## Evidência da sessão (condensado)
Sessão 2026-08-27: usuário colou `image.png` (641×1705) → API de chat removeu. Agente disse "não processei" e parou. CHEFE corrigiu: lacuna é não ter ido ao disco. Agente achou `E:/CentralDark/Pivete/images/clip_20260827_*.png` e leu com `vision_analyze` — funcionou. Lição: chat vision falha, disk read não.

## Quando NÃO usar
- Se o usuário já descreveu o conteúdo e só quer seguir — não precisa ler.
- Se for só confirmação de algo já medido por terminal — não gastar leitura.
