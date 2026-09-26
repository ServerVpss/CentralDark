# SINGLE-WRITER E ROLLBACK

## Single-Writer

Apenas um escritor por vez:

- Hermes escreve na胶囊 apenas durante criação.
- Não há outro processo escribiendo.
- Arquivos são criados um a um.

---

## Rollback

Se algo falhar durante criação:

1. Preservar o que foi criado.
2. Marcar como `PARTIAL`.
3. Reportar o erro.
4. Não tentar corrigir automaticamente.

---

## Estado de Rollback

```
ROLLBACK_NEEDED=NAO
FILES_CREATED_COUNT=15
FILES_MODIFIED_COUNT=0
DIRECTORIES_CREATED_COUNT=7
```

---

## Como Recuperar

Se a胶囊 estiver incompleta:

1. Ler `ESTADO-ATUAL.json`.
2. Verificar `capsule_timestamp`.
3. Comparar com Intent original.
4. Decidir: recomeçar ou continuar.
