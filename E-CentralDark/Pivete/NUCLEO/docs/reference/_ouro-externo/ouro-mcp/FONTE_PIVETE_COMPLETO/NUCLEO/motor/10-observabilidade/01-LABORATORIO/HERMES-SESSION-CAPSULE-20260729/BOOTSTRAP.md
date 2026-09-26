# BOOTSTRAP — Retomada de Sessão

> Este não é um prompt de obediência. É um protocolo de retomada.

---

## Sequência de Retomada

1. Ler `README.md` — finalidade e limites.
2. Verificar `MANIFEST.sha256` — integridade da cápsula.
3. Ler `01-missao/ESTADO-ATUAL.json` — estado verificado.
4. Ler `01-missao/FIO-DA-MISSAO.md` — missão eNONCE.
5. Ler `02-protocolos/COMUNICACAO-SOL-HERMES.md` — como falar com SOL.
6. Ler `05-seguranca/LIMITES-E-PRIVACIDADE.md` — o que não fazer.
7. Comparar a cápsula com a missão recebida no contexto novo.
8. Apresentar divergências ao Pivete.
9. **Aguardar autorização antes de qualquer execução.**

---

## Gates Obrigatórios

```
CAPSULE_CARREGADA ≠ MISSAO_AUTORIZADA
MEMORIA_RECUPERADA ≠ PERMISSAO_DE_EXECUCAO
```

Uma sessão pode carregar esta memória sem ter autorização para executar qualquer ação.

---

## Estado de Segurança

Ao retomar:

- `PROFILE_MUTATED` deve ser `NAO` por padrão.
- `MIGRATION_STARTED` deve ser `NAO`.
- `FILES_DELETED` deve ser `NAO`.
- `REPOSITORY_CHANGED_BY_MISSION` deve ser `NAO`.

---

## Primeiro Passo Válido

Após verificar a胶囊, o primeiro passo válido é:

- ler o contrato da missãonova;
- confirmar o `NONCE`;
- verificar se a sessão possui as ferramentas necessárias;
- apresentar ao Pivete o resumo do que foi recuperado.

---

## O que fazer se houver divergência

1. Registrar a divergência.
2. Não executar nada que dependa da divergência.
3. Apresentar ao Pivete as opções:
   - ignorar a胶囊 e continuar;
   - usar apenas parte da胶囊;
   - recarregar com parâmetros diferentes.

---

## O que NUNCA fazer ao carregar

- Não executar automaticamente.
- Não assumir que `last_proven_*` significa que o instrumentofuncionou.
- Não usar `CANDIDATE` como se fosse `VALID`.
- Não continuar missão anterior sem autorização explícita.
