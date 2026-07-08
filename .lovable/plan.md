## O que muda

Trocar o `content.js` da extensão (versão 0.5 atual) pela base do **Grabber v1.0** que você colou, adaptado pra rodar dentro da extensão (com envio automático pro HUB, loop, config vinda do popup).

Nome novo: **v1.1** (v1.0 do script + envio HUB + loop).

## Melhorias incorporadas

- Validação forte de `wsId` (rejeita lixo, exige mistura maiúscula/minúscula)
- Cascata de detecção: URL → localStorage → sessionStorage → `window.__NEXT_DATA__` → spy de fetch **e** XMLHttpRequest
- Verificação do `wsId` contra `/credit-balance` antes de aceitar
- JWT com filtro de expiração (>3min) e ordenação pelo mais novo
- `Promise.all` nas 7 rotas (paralelo)
- Retry em 429 com backoff
- UI flutuante opcional (ligada por padrão só quando "Coletar agora", desligada no loop pra não incomodar)

## Arquivos afetados

- `extensao/content.js` — reescrito com a base v1.0 + camada de envio ao HUB (`fetch(HUB_URL, {X-Hub-Token})`) + listener do `chrome.runtime.onMessage` (pra "Coletar agora" e alarme)
- `extensao/manifest.json` — bump de versão pra `1.1.0`
- `LEIA-ME.md` — nota rápida do que mudou
- Novo zip `centraldark-lovable-grabber-v1.1.zip` em `/mnt/documents/`

Nada muda no HUB (SQL e edge function continuam iguais).

## Como você vai usar

Se já tinha instalado a v1.0: remove no `chrome://extensions`, carrega a v1.1. Config (URL + token + intervalo) fica salva? **Não** — `chrome.storage.sync` é por extensão-ID, e recarregar do zero gera ID novo. Vai precisar preencher URL/token de novo (1 minuto).

## Fora do escopo

- Extensão pra Firefox (Manifest V3 muda um pouco lá, deixamos pra depois)
- Ícone diferente (mantém o esmeralda atual)
- Card no TelePainel (fica pro próximo turno depois que o HUB estiver recebendo dados)

Aprova que eu já entrego o zip da v1.1?