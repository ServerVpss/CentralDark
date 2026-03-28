

## Varredura Completa das APIs - Plano

### Situacao Atual

Todas as consultas estao falhando com **"Servidor temporariamente indisponível"** (erro de conexao). Os provedores externos estao fora do ar:

| Provedor | Host | Portas | Endpoints | Status |
|----------|------|--------|-----------|--------|
| NexFuture | `nxf-2.nexfuture.com.br` | 25589, 25594 | cpf, cnpj, placa, telefone, rg, cns, cnh, nome, parentes, empregos, email, cep, pix, chassi, renavam, motor, frota, bin | **OFFLINE** |
| TConect Score | `node.tconect.xyz` | 3029/3036 | score | **OFFLINE** |
| TConect Foto | `node.tconect.xyz` | 3030 | foto, nacional | **OFFLINE** |
| TConect Placa | `node.tconect.xyz` | 3041 | placa_completa | **OFFLINE** |

Todas as 10 ultimas consultas no historico retornaram erro de servidor indisponível.

### O que vou fazer

1. **Adicionar sistema de status por endpoint** no `telegram-webhook` - um mapa de quais consultas estao ativas/desativadas
2. **Desativar todas as consultas que dependem dos servidores offline** - o bot vai responder com mensagem amigavel dizendo que aquele tipo de consulta esta temporariamente desativado, em vez de tentar conectar e falhar
3. **Atualizar o menu de consultas** no bot para mostrar apenas as consultas ativas (ou marcar as desativadas com um icone)
4. **Facilitar reativacao** - basta mudar `true/false` no mapa de status quando os servidores voltarem

### Mudancas Tecnicas

**Arquivo: `supabase/functions/telegram-webhook/index.ts`**
- Adicionar `enabledQueryTypes` map no topo com todas as consultas como `false` (servidores offline)
- No `processQuery()`, verificar se o tipo esta ativo antes de chamar a API
- No `showQueryMenu()`, ocultar ou marcar consultas desativadas
- Retornar mensagem amigavel: "Esta consulta esta temporariamente desativada por manutencao do servidor"

**Arquivo: `supabase/functions/api-query/index.ts`**
- Adicionar mesmo mapa de status para consultas via painel web
- Retornar erro claro quando consulta desativada

### Mapa de Status (Inicial - Tudo Desativado)

```text
cpf: false        cnpj: false       placa: false
telefone: false   email: false      cep: false
nome: false       score: false      foto: false
nacional: false   placa_completa: false
rg: false         cnh: false        pix: false
parentes: false   empregos: false   chassi: false
renavam: false    motor: false      frota: false
bin: false        cns: false
```

Quando os servidores voltarem, basta trocar para `true` os que funcionarem.

