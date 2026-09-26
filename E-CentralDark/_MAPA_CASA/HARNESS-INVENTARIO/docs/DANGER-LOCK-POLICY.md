# 🚨 DANGER / ⚠️ CAUTION — Cadeado do Harness

## Estado padrão
- A pasta `HARNESS-INVENTARIO` fica **FECHADA** quando não há edição ativa.
- Leitura é permitida com o cadeado fechado.
- Escrita, move, rename e delete ficam proibidos por política operacional quando `state=CLOSED`.

## Regra de abertura
A abertura só pode ocorrer diante de autorização explícita contendo exatamente:

`PERMITO SEGREDO`

Sem essa frase, nenhum agente deve iniciar mutação nesta raiz.

## Regra durante edição
Enquanto uma edição autorizada estiver em curso, o estado lógico pode ser `OPEN` apenas pelo tempo necessário ao escopo atual.

## Regra de fechamento
Ao terminar a ação, interromper ou alcançar fixed point, o estado retorna imediatamente para `CLOSED`.

## Segurança
- `DANGER`: mutação destrutiva, move/delete, ACL, credencial ou estado vivo.
- `CAUTION`: edição de documentação, manifesto, config ou artefato não destrutivo.
- `UNKNOWN != PASS`.
- `ZERO_REGRESSION=true`.
- O cadeado lógico não altera ACL NTFS automaticamente; enforcement físico só entra com desenho e teste separado para evitar auto-bloqueio da Casa.
