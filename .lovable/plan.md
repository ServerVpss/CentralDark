
# Plano: Adicionar Suporte GET ao Endpoint api-query

## Objetivo

Permitir consultas diretamente pela barra de URL do navegador usando parâmetros query string:

```
https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/api-query?tipo=telefone&valor=11999999999
```

---

## Implementação

### Arquivo: `supabase/functions/api-query/index.ts`

**Mudanças necessárias:**

1. **Detectar método da requisição (GET vs POST)**
   - Se GET: extrair parâmetros da URL (`tipo`, `valor`, `estado`)
   - Se POST: manter comportamento atual (ler JSON do body)

2. **Novos parâmetros da URL:**

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `tipo` | Tipo da consulta | `telefone`, `cpf`, `cnpj`, `placa`, `nome`, etc. |
| `valor` | Valor a consultar | `11999999999`, `12345678900` |
| `estado` | Estado para foto (opcional) | `SP`, `RJ` |

3. **Código da implementação:**

```typescript
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let queryRequest: QueryRequest;

    // Suporte GET via query params
    if (req.method === "GET") {
      const url = new URL(req.url);
      const tipo = url.searchParams.get("tipo");
      const valor = url.searchParams.get("valor");
      const estado = url.searchParams.get("estado");

      if (!tipo || !valor) {
        return new Response(
          JSON.stringify({ 
            error: "Parâmetros 'tipo' e 'valor' são obrigatórios",
            exemplo: "?tipo=telefone&valor=11999999999",
            tipos_disponiveis: Object.keys(nexfutureEndpoints).concat(["score", "foto", "nacional", "placa_completa"])
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      queryRequest = {
        queryType: tipo,
        queryInput: valor,
        estado: estado || undefined
      };
    } else {
      // POST - comportamento original
      queryRequest = await req.json();
    }

    // ... resto do código continua igual
  }
});
```

---

## Exemplos de Uso no Navegador

Após a implementação, você poderá usar URLs como:

### Consultas básicas:
```text
?tipo=telefone&valor=11999999999
?tipo=cpf&valor=12345678900
?tipo=cnpj&valor=12345678000199
?tipo=placa&valor=ABC1234
?tipo=nome&valor=JOAO+DA+SILVA
?tipo=cep&valor=01310100
?tipo=email&valor=teste@email.com
```

### Consultas especiais:
```text
?tipo=score&valor=12345678900
?tipo=foto&valor=12345678900&estado=SP
?tipo=nacional&valor=12345678900
?tipo=placa_completa&valor=ABC1234
```

---

## Resposta de Ajuda (quando faltam parâmetros)

Se acessar a URL sem parâmetros ou com parâmetros incompletos:

```json
{
  "error": "Parâmetros 'tipo' e 'valor' são obrigatórios",
  "exemplo": "?tipo=telefone&valor=11999999999",
  "tipos_disponiveis": [
    "cpf", "cnpj", "placa", "telefone", "rg", "cns", "cnh",
    "nome", "parentes", "empregos", "email", "cep", "pix",
    "chassi", "renavam", "motor", "frota", "bin",
    "score", "foto", "nacional", "placa_completa"
  ]
}
```

---

## Segurança

O endpoint continuará funcionando sem autenticação (como já está hoje), mas:

- Requisições autenticadas (com header `Authorization`) serão logadas no histórico
- Requisições anônimas funcionam mas não são rastreadas

---

## Arquivos que serão modificados:

1. `supabase/functions/api-query/index.ts`

## Deploy necessário:

- `api-query`
