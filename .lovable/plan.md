

# Sincronização Completa: 58 Módulos da API

## Lista completa dos 58 módulos reais da API

**Pessoa (7):** cpf, cpffull, cpf-isk, nome, nomefull, mae, maefull
**Documento (6):** rg, rg-3, cnh, pis, pis-3, titulo
**Contato (10):** telefone, telefonefull, telefone-3, email, emailfull, email-3, cep, cepfull, cep-3, endereco
**Financeiro (8):** pix, score, score-3, renda, credilink, cpf-spc, poderaquisitivo, parentes, parentes-3
**Veículo (7):** placa, placa-serpro, placa-sesp, placa-simples, chassi, renavam, motor
**Empresa (1):** cnpj-cred
**Justiça (3):** processos, bnmp-lc, siel
**Governo (2):** cpfsus, tse-3
**Variantes v3 (8):** rg-3, pis-3, cep-3, email-3, nome-3, score-3, parentes-3, telefone-3
**Foto (12):** fotomg, fotosp, fotorj, fotopr, fotoce, fotoma, fotoes, fotodf, fototo, fotoms, fotoro, fotopi

## Problemas encontrados no banco atual (49 registros)

### Remover (3 que NÃO existem na API):
- `foto` (genérico)
- `nacional`
- `placa_completa`

### Corrigir module_key (5 erradas):
| Banco atual | API real |
|---|---|
| `cnpj` | `cnpj-cred` |
| `cpf_spc` | `cpf-spc` |
| `placa_sesp` | `placa-sesp` |
| `bnmp` | `bnmp-lc` |
| `tse` | `tse-3` |

### Adicionar (11 faltando):
| module_key | label | categoria |
|---|---|---|
| `cpf-isk` | CPF ISK | pessoa |
| `nome-3` | Nome v3 | pessoa |
| `rg-3` | RG v3 | documento |
| `pis-3` | PIS v3 | documento |
| `emailfull` | Email Completo | contato |
| `email-3` | Email v3 | contato |
| `cep-3` | CEP v3 | contato |
| `telefone-3` | Telefone v3 | contato |
| `score-3` | Score v3 | financeiro |
| `parentes-3` | Parentes v3 | pessoa |
| `placa-simples` | Placa Simples | veiculo |

## Plano de execução

### Passo 1 — Limpar banco de dados
- DELETE dos 3 módulos inexistentes (`foto`, `nacional`, `placa_completa`)
- UPDATE das 5 module_keys erradas para o formato correto com hífen
- INSERT dos 11 módulos faltantes

### Passo 2 — Atualizar telegram-webhook
- Atualizar `queryTypeAliases` para usar as keys corretas (`cnpj-cred`, `bnmp-lc`, `tse-3`, `cpf-spc`, `placa-sesp`)
- Adicionar os 11 novos módulos nos mapas `moduleToCommand`, `usageExamples` e `queryTypeLabels`
- Remover referências a `foto`, `nacional`, `placa_completa`
- Garantir que `/comandos` leia do banco e exiba todos os 58 corretamente

### Passo 3 — Atualizar whitelist no api-query
- Sincronizar a whitelist de módulos permitidos com as 58 keys exatas

### Resultado final
- **58 módulos** no banco, todos com keys idênticas à API
- Comando `/comandos` completo e correto
- Painel admin sincronizado

