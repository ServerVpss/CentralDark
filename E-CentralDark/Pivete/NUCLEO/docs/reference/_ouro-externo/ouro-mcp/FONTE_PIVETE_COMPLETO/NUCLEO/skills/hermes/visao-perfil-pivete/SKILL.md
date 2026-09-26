---
name: visao-perfil-pivete
description: "Como o Hermes (profile pivete, CASA, app desktop) enxerga imagem de verdade — transporte correto, falso verde do painel, e os dois bugs conhecidos (issues #6560 e #24015). Usar antes de qualquer missão de visão/imagem no perfil pivete."
version: 1.0.0
platforms: [windows]
metadata:
  hermes:
    tags: [visao, casa, profile-pivete, multimodal, falso-verde]
    related_skills: [meta-lupa]
---

# Visão — Perfil pivete (CASA, app desktop Hermes)

Método comprovado em 26/07/2026 por teste isolado (Pivete dirigiu, Hermes leu pixels de fato).

## Quando usar
Toda vez que for receber, processar ou depurar imagem no perfil pivete via app desktop Hermes.

## Fato comprovado (não inferência)
`vision_analyze` injeta pixels **SÓ** quando a imagem chega por um destes dois caminhos:
1. **Anexo nativo de imagem** (botão de imagem no chat, NÃO "anexar arquivo" / `@file`)
2. **URL pública direta** da imagem (ex: `https://img.lightshot.app/ID.png`)

Não funciona (retorna `404 Couldn't find that, sorry.`):
- `C:\Users\danda\AppData\Roaming\Hermes\composer-images\*.png` (path local)
- `C:\Users\danda\.hermes\desktop-attachments\*.png` (`@file`)
- qualquer `data:` base64

Causa: o pipeline só injeta o multimodal que vem como anexo da plataforma. Path local/base64 não vira pixels.

## Falso verde (caça isso)
O painel mostrar `VISION=<modelo>` **NÃO prova** que a visão funciona.
Prova real = imagem nativa entra + `vision_analyze` devolve descrição do conteúdo.
Sem esse teste, `VISION=tencent/hy3:free` é só atribuição (e hy3 não tem visão nativa).

## Teste isolado (Passo A — recomendado pelo Pivete)
1. Painel → Models → Vision → Change
2. escolher modelo comprovadamente multimodal (ex: `google/gemini-2.5-flash` ou `2.5-pro`)
3. **desligar MoA** neste primeiro teste
4. abrir SESSÃO NOVA (config de auxiliar vale em sessão nova)
5. enviar UMA imagem pelo botão de imagem
6. pedir para ler uma frase específica da imagem
7. esperar: `IMAGE_ATTACHMENT_NATIVE=SIM` / `VISION_CALL_EXECUTED=SIM` / `TEXT_READ_FROM_IMAGE=<preenchido>`

Só depois de funcionar isolado, religar MoA e repetir — assim separa TRANSPORTE → MODELO DE VISÃO → MoA.

## Bugs conhecidos (não eram o erro dos 8 prints, mas vigiar)
- **Issue #6560** (fechado/corrigido no main, PR #6577, jul/2026): `vision_analyze` falha em providers OpenAI-compatíveis cuja saída útil só aparece em `/responses` stream deltas (`response.output_text.delta`). Sintoma: não 404, mas análise vazia/erro estranho com imagem nativa.
- **Issue #24015** (fechado/corrigido no main, PR #30126, release v2026.5.28): `computer_use` (cua-driver) ignorava `auxiliary.vision` e mandava imagem pro modelo principal. Se o principal não tem visão (ex: `tencent/hy3`), dá `HTTP 404: No endpoints found that support image input`. Corrigido: `computer_use` agora respeita `auxiliary.vision`.

## Regra de ouro
Nunca fingir ter lido imagem. Se o pipeline não injetar pixels, declarar LACUNA na hora — não inventar conteúdo. Isso é exatamente o falso verde que a MetaLupa manda caçar.

## Integração com MetaLupa
Aplicar Gate de Falsificação: painel verde ≠ funcionamento; status 200 ≠ pixels entraram; pergunta "o que mudou de estado?" antes de dar veredito fechado.
