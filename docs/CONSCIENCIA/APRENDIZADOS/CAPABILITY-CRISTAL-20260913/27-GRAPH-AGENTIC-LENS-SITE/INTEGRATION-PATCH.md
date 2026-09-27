# Encaixe no owner real

Destino pretendido após remedição do repo vivo:

`apps/modulos/graph-panel/`

1. manter `server.js` e `/api/graph` existentes;
2. incorporar os assets de `patch-candidate/public/`;
3. não criar novo PM2/service;
4. mapear o JSON vivo para o schema lógico já existente;
5. preservar clique para nota e views 2D/3D existentes;
6. habilitar `focus/depth/trace_id` quando as rotas correspondentes existirem;
7. Agentic Lens permanece read-only até passar por owner + writer + Judge.

## Done

- linha primária por nota;
- núcleo protegido;
- overflow automático para novo anel;
- relation style;
- filtros;
- inspector;
- anomaly candidates;
- live API fallback;
- testes geométricos.
