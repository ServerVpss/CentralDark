# Sync / Mirror entre repositórios

## Verdade atual

```txt
ServerVpss/CentralDark -> segredounlock/clone-deck
```

## Estado atual

O mirror automático está pausado porque `MIRROR_PAT` ainda não está configurado.

Enquanto isso:

- `segredounlock/clone-deck` é apenas espelho/backup.
- Actions do espelho devem permanecer desativadas.
- Nenhum workflow de mirror roda em push.
- Reativação do mirror será feita depois, com `MIRROR_PAT`.

## Regra

Não usar rsync antigo para espelho automático.
Não editar direto no espelho.
Não enviar `.env`, chaves, sessões ou tokens abertos.
