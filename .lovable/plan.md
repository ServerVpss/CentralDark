

## Plano: Exibir Todas as Informações da Consulta CPF

### Problema Identificado

Analisando a consulta CPF completa fornecida, identificamos várias seções que não estão sendo exibidas corretamente:

| Seção | Formato | Problema |
|-------|---------|----------|
| **INTERESSES PESSOAIS** | `- Turismo: Não` | Parser trata como item de lista, perde chave/valor |
| **PARENTES** | `MAE ⎯ NOME ⎯` | Dois travessões confundem o parser |
| **EMPREGOS** | `• CNPJ CONTRATANTE: ...` | Itens longos com múltiplos campos |
| **ENDERECOS** | Lista com linhas vazias entre itens | Parser pode estar perdendo items |
| **CNS, PIS, TÍTULO ELEITOR** | Campos novos | Não categorizados |
| **CLASSE SOCIAL, PROFISSÃO** | Campos novos | Não categorizados |

### Solução

#### Parte 1: Adicionar Novas Categorias

Adicionar categorias para campos que estão indo para "OUTROS DADOS":

```typescript
const categories: Record<string, { icon: string; label: string; fields: string[] }> = {
  basic: {
    icon: '[✦]',
    label: 'DADOS BÁSICOS',
    fields: ['nome', 'cpf', 'nascimento', 'rg', 'sexo', 'mae', 'pai', 'nome_mae', 'nome_pai', 
             'naturalidade', 'nacionalidade', 'idade', 'obito', 'status', 'municipio_nascimento', 
             'raca', 'tipo_sanguineo', 'estado_civil', 'status_receita']
  },
  documents: {
    icon: '[✦]',
    label: 'DOCUMENTOS',
    fields: ['pis', 'nis', 'cns', 'titulo_eleitor', 'zona', 'secao', 'ctps']
  },
  financial: {
    icon: '[✦]',
    label: 'DADOS FINANCEIROS',
    fields: ['renda', 'score', 'classe', 'classe_social', 'recebe_inss', 'poder_aquisitivo', 'bancos']
  },
  work: {
    icon: '[✦]',
    label: 'DADOS PROFISSIONAIS',
    fields: ['emprego', 'empregos', 'empresa', 'profissao', 'escolaridade', 'ocupacao', 'admissao', 'demissao']
  },
  contact: {
    icon: '[✦]',
    label: 'DADOS DE CONTATO',
    fields: ['telefone', 'telefones', 'celular', 'email', 'emails', 'whatsapp']
  },
  address: {
    icon: '[✦]',
    label: 'ENDEREÇO',
    fields: ['endereco', 'enderecos', 'logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'municipio']
  },
  family: {
    icon: '[✦]',
    label: 'PARENTES',
    fields: ['parentes', 'mae', 'pai', 'conjuge', 'filhos']
  },
  vehicle: {
    icon: '[✦]',
    label: 'VEÍCULOS',
    fields: ['placa', 'veiculos', 'chassi', 'renavam', 'marca', 'modelo', 'ano', 'cor']
  },
  interests: {
    icon: '[✦]',
    label: 'INTERESSES PESSOAIS',
    fields: ['interesses', 'turismo', 'luxo', 'internet', 'celular', 'cartao', 'seguro', 'investidor']
  }
};
```

#### Parte 2: Melhorar Parser para Seção "INTERESSES PESSOAIS"

O formato `- Turismo: Não` precisa ser tratado diferentemente. Quando há `:` após o `-`, é um par chave/valor, não um item de lista:

```typescript
// Detectar linha de lista com marcador - (mas não linhas de separação)
if (trimmed.startsWith('-') && !trimmed.match(/^-+$/)) {
  const itemValue = trimmed.substring(1).trim();
  
  // NOVO: Verificar se é formato "Chave: Valor" (seção Interesses Pessoais)
  const keyValueMatch = itemValue.match(/^([^:]+):\s*(.+)$/);
  if (keyValueMatch) {
    const key = keyValueMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
    const value = keyValueMatch[2].trim();
    if (value && value !== '-') {
      result[key] = value;
    }
  } else if (itemValue && !itemValue.match(/^[\-=_]+$/)) {
    currentList.push(itemValue);
  }
  continue;
}
```

#### Parte 3: Tratar Formato PARENTES Especial

O formato `MAE ⎯ AURIA MARIA ⎯` tem dois travessões. Precisamos identificar o padrão:

```typescript
// Tratar formato especial de parentes: TIPO ⎯ NOME ⎯
const parentMatch = trimmed.match(/^(MAE|PAI|CONJUGE|FILHO|IRMAO|IRMA|AVÔ|AVÓ|TIO|TIA)\s*⎯\s*([^⎯]+)/i);
if (parentMatch) {
  const parentType = parentMatch[1].toLowerCase();
  const parentName = parentMatch[2].trim();
  if (result.parentes === undefined) {
    result.parentes = [];
  }
  (result.parentes as string[]).push(`${parentType.toUpperCase()}: ${parentName}`);
  continue;
}
```

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Atualizar categorias, melhorar parser |

---

### Mudanças Detalhadas

**Linhas 604-640** - Atualizar categorias:

- Adicionar campos: `municipio_nascimento`, `raca`, `tipo_sanguineo`, `estado_civil`, `status_receita`
- Nova categoria `documents`: PIS, NIS, CNS, TÍTULO ELEITOR
- Nova categoria `family`: parentes
- Nova categoria `interests`: interesses pessoais
- Expandir `financial`: classe_social, recebe_inss

**Linhas 529-536** - Melhorar parser de lista com `-`:

- Detectar formato `- Chave: Valor` e extrair como campo separado
- Manter comportamento de lista para itens simples

**Linhas 538-566** - Adicionar detecção de formato PARENTES:

- Detectar padrão `TIPO ⎯ NOME ⎯`
- Armazenar em array `parentes`

---

### Resultado Esperado

| Antes | Depois |
|-------|--------|
| Muitos campos em "OUTROS DADOS" | Campos organizados por categoria |
| Interesses perdidos | Seção [✦] INTERESSES PESSOAIS com todos os campos |
| Parentes não formatado | Seção [✦] PARENTES: MAE: NOME |
| PIS, CNS em outros | Seção [✦] DOCUMENTOS com PIS, CNS, TÍTULO |

---

### Resumo das Mudanças

| Item | Descrição |
|------|-----------|
| **Novas categorias** | documents, family, interests |
| **Campos expandidos** | +15 campos nas categorias existentes |
| **Parser `-`** | Detecta `Chave: Valor` após hífen |
| **Parser parentes** | Trata formato especial com dois travessões |
| **Linhas vazias** | Ignorar linhas vazias dentro de listas |

