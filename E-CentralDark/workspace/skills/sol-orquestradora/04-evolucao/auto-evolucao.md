# Autoevolução por terminais

O nível observado é a quantidade de sessões raiz após deduplicação. O nível acionável é a quantidade de terminais visíveis ou diretamente endereçáveis com contraprova.

```text
N_SESSOES_RAIZ = NIVEL_OBSERVADO
N_TERMINAIS_ENDERECAVEIS = NIVEL_ACIONAVEL
```

Cada terminal visível recebe `T1..TN`; cada sessão raiz recebe `S1..SN`. Os IDs servem para a rodada atual e são reconstruídos na próxima medição; PID, handle e posição não são identidade permanente.

Adicionar um terminal não promove automaticamente os padrões para `PASS`. O novo nível só fica comprovado quando cada tarefa atribuída tiver recibo e contraprova independentes.

Os padrões anteriores permanecem salvos e são reutilizados antes de criar novos.
