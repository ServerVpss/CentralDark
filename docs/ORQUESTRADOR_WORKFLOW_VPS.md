# Orquestrador MultiZap Workflow + VPS

Este documento explica como o orquestrador 069 funciona:

1. Recebe input `tarefa` pelo workflow_dispatch.
2. Executa run-once correspondente na VPS.
3. Aguarda relatório em /root/Multizap/revisoes/.
4. Lê resumo.md.
5. Detecta falha ou sucesso.
6. Dispara próxima tarefa automaticamente quando seguro.
