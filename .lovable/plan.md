

# Plano de Melhorias do Sistema de Consultas

## Diagnóstico Atual

Analisando o histórico de consultas, identifiquei os seguintes pontos:

```text
+------------------+-------+---------+-------+-----------+
| Tipo             | Total | Sucesso | Erro  | Taxa      |
+------------------+-------+---------+-------+-----------+
| CPF              | 290   | 232     | 58    | 80%       |
| Telefone         | 153   | 97      | 56    | 63%       |
| Nome             | 145   | 115     | 30    | 79%       |
| Foto             | 108   | 96      | 12    | 89%       |
| Placa            | 55    | 52      | 3     | 95%       |
| PIX              | 13    | 0       | 13    | 0%        |
| Score            | 15    | 10      | 5     | 67%       |
+------------------+-------+---------+-------+-----------+
```

---

## Melhorias Propostas

### 1. Sistema de Consultas Favoritas
Salvar consultas frequentes para acesso rápido com um clique.

**Benefícios:**
- Agilidade para refazer consultas
- Histórico organizado por tipo
- Menos digitação repetitiva

---

### 2. Validação Inteligente de Entrada
Validar e formatar automaticamente antes de enviar a consulta.

**Exemplos:**
- CPF: Aceita `123.456.789-00` ou `12345678900`
- Telefone: Remove espaços e caracteres especiais
- Placa: Converte para formato correto automaticamente

---

### 3. Cache de Resultados
Armazenar consultas recentes localmente para acesso instantâneo.

**Benefícios:**
- Evita reconsultar dados idênticos
- Economia de créditos/requisições
- Resposta instantânea para repetições

---

### 4. Histórico Persistente no Banco
O histórico atual é perdido ao recarregar a página. Implementar carregamento do banco de dados.

**Recursos:**
- Últimas 50 consultas do usuário
- Filtro por tipo de consulta
- Busca no histórico

---

### 5. Busca em Lote (Batch)
Consultar múltiplos CPFs/telefones de uma vez.

**Exemplo:**
```text
Digite até 10 CPFs separados por vírgula:
12345678900, 98765432100, 11122233344
```

---

### 6. Exportação de Resultados
Baixar resultados em diferentes formatos.

**Formatos:**
- PDF formatado
- TXT simples (estilo Telegram)
- JSON para integração

---

### 7. Status em Tempo Real dos Provedores
Atualmente os provedores mostram sempre "Online". Implementar verificação real.

**Recursos:**
- Ping automático aos provedores
- Latência média
- Alertas de indisponibilidade

---

### 8. Atalhos de Teclado
Navegação rápida para usuários frequentes.

| Atalho | Ação |
|--------|------|
| `Ctrl+1` | Seleciona CPF |
| `Ctrl+2` | Seleciona Telefone |
| `Ctrl+Enter` | Executa consulta |
| `Ctrl+C` | Copia resultado |

---

### 9. Correção do Endpoint PIX
O tipo PIX tem 0% de sucesso - precisa debug.

---

### 10. Indicadores de Performance
Mostrar métricas ao usuário:
- Tempo médio de resposta
- Taxa de sucesso por tipo
- Consultas restantes (se houver limite)

---

## Implementação Sugerida

### Fase 1 - Essencial
1. Validação inteligente de entrada
2. Histórico persistente do banco
3. Correção do endpoint PIX
4. Status real dos provedores

### Fase 2 - Produtividade
5. Consultas favoritas
6. Cache de resultados
7. Atalhos de teclado

### Fase 3 - Avançado
8. Busca em lote
9. Exportação de resultados
10. Indicadores de performance

---

## Estrutura de Dados (Novas Tabelas)

```text
+------------------------+
|   query_favorites      |
+------------------------+
| id          | uuid     |
| user_id     | uuid     |
| query_type  | text     |
| query_input | text     |
| label       | text     |
| created_at  | timestamp|
+------------------------+

+------------------------+
|   query_cache          |
+------------------------+
| id          | uuid     |
| user_id     | uuid     |
| query_type  | text     |
| query_input | text     |
| result      | jsonb    |
| expires_at  | timestamp|
+------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Consultas.tsx` | Interface principal com novas features |
| `src/hooks/useQueryFavorites.ts` | Hook para favoritos (novo) |
| `src/hooks/useQueryCache.ts` | Hook para cache (novo) |
| `src/hooks/useQueryHistory.ts` | Hook para histórico persistente (novo) |
| `src/components/consultation/QueryValidator.tsx` | Validador de entrada (novo) |
| `src/components/consultation/QueryFavorites.tsx` | Lista de favoritos (novo) |
| `supabase/functions/api-query/index.ts` | Correção do PIX |

---

Qual melhoria você gostaria de implementar primeiro?

