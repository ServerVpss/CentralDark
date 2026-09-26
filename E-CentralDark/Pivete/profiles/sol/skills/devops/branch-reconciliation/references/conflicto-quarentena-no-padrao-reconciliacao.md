# Conflicto-Quarentena no Padrão de Reconciliação

## O padrão

Quando um processo de reconciliação encontra um conflito que não sabe resolver
 automaticamente e não pode/deseja travar, a ação correta não é abortar cego nem
 forçar uma resolução destrutiva. É mover o item problemático para uma pasta de
 quarentena `_CONFLICTS/` e registrar o que foi feito, para que um humano ou um
 processo posterior decida.

Isso vale para qualquer tipo de reconciliação: Git, Drive, sincronização de
estado, merge de dados, etc. O princípio é o mesmo: "se não confio na decisão
automática, não apago; preservo para decisão humana e registro".

## Ações permitidas / proibidas no conflito

### Permitidas
- Mover o item conflitante para `_CONFLICTS/<timestamp>_<nome>` (ou equivalente).
- Registrar no log/receipt: o que foi movido, de onde veio, hash antes se
  disponível, motivo "conflito sem resolução automática".
- Em modo `--dry-run`, mostrar o que seria movido sem mover nada.
- Permitir um modo `--force` que executa a movimentação sem pedir confirmação
  adicional, mas SEM pressuposto de resolução — apenas quarentena, não deleção.

### Proibidas
- Deletar o item conflitante sem confirmação humana explícita.
- Sobrescrever o item remoto/local sem decisão humana clara.
- Silenciar o conflito (ignorar, contornar, assumir "versão mais recente"
  como verdadeira sem cross-check).
- Mesclar de forma arbitrária conflitos sem registro do que foi feito e por quê.

## Estrutura de `_CONFLICTS/`

- A pasta de quarentena deve ser ignorada pelo VCS (`_CONFLICTS/` no `.gitignore`).
- Cada item movido leva um nome único (timestamp + nome original) para evitar
  colisão entre execuções.
- Quarentena não é lixo: é preservado para decisão humana. Só apagar quando o
  humano decidir, ou sob critério explícito que deve estar documentado.

## Aplicação a etapas do processo

- **Após medir local e remoto**: identificar quais items são "diferentes" (conflito).
- **Antes de qualquer ação destrutiva**: se o item for diferente e o processo não
  tiver decisão automática confiável, mover para quarentena.
- **No receipt final**: registrar quais itens foram movidos, qual foi a decisão,
  e que itens ainda estão em quarentena aguardando.

## Sinais de que o padrão se aplica

- "força se travar em conflito" — o processo deve ter uma saída que não é
  falha total nem força apagar/sobrescrever, mas preserva e registra.
- "move pra _CONFLICTS/" — nome explícito da pasta de quarentena.
- Reconciliação que pode "travar" em algum item: o travamento deve ser em
  quarentena, não em falha total do processo ou em resolução destrutiva.

## Relação com outras regras da Casa

- **ZERO REGRESSÃO**: não apaga no remoto sem confirmação → quarentena.
- **HISTORICAL ≠ CURRENT**: item velho não é motivo para deletar; se há conflito
  sobre atualidade, quarentena.
- **Hard stop antes de push/destroy/delete remoto**: quarentena é a saída para
  conflitos que ativam esse hard stop, não bypass.

## Referência rápida de comando (exemplo)

Durante a sessão foi criado um exemplo concreto em
`scripts/drive_reconcile.py` com:

- `move_conflicts_to_folder(...)` — recebe relatório de diff e move os distintos
  para `_CONFLICTS/`.
- `--resolve-conflicts <report.json> [--dry-run]` — usa um relatório salvo e
  executa a quarentena.
- `--force` — executa a quarentena sem pedir confirmação adicional, mas ainda
  preserva (não apaga).

Isso é um exemplo, não o padrão universal. Cada ferramenta implementa sua própria
versão; o que importa é a semântica de quarentena+preservação+registro.
