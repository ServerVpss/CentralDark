

# Completar Todos os 75 Módulos iSeek no Sistema

## Situação Atual
- **No banco como iSeek**: 37 módulos
- **Lista completa iSeek**: 75 módulos
- **Faltando**: 38 módulos

## Módulos Faltantes

### Novos (não existem no banco de nenhum provedor) — 7 módulos
| module_key | label | módulo API iSeek | categoria |
|---|---|---|---|
| nomeabreviadofiltros | Nome Abreviado Filtros | iseek-dados---nomeabreviadofiltros | pessoa |
| processo | Processo | iseek-dados---processo | justica |
| advogadooabuf | Advogado OAB UF | iseek-dados---advogadooabuf | justica |
| catcpf | CAT CPF | iseek-dados---catcpf | documento |
| catnumero | CAT Número | iseek-dados---catnumero | documento |
| crlvto | CRLV TO | iseek-dados---crlvto | veiculo |
| crlvmt | CRLV MT | iseek-dados---crlvmt | veiculo |

### Sobrepostos (existem como VeiculosAPI, precisam de cópia com sufixo `-isk`) — 31 módulos
| module_key | label | módulo API iSeek | categoria |
|---|---|---|---|
| cpf-isk | CPF iSeek | iseek-cpf | pessoa |
| cnpj-isk | CNPJ iSeek | iseek-dados---cnpj | empresa |
| rg-isk | RG iSeek | iseek-dados---rg | documento |
| mae-isk | Mãe iSeek | iseek-dados---mae | pessoa |
| telefone-isk | Telefone iSeek | iseek-dados---telefone | contato |
| titulo-isk | Título iSeek | iseek-dados---titulo | documento |
| cnh-isk | CNH iSeek | iseek-dados---cnh | documento |
| processos-isk | Processos iSeek | iseek-dados---processos | justica |
| placa-isk | Placa iSeek | iseek-dados---placa | veiculo |
| renavam-isk | Renavam iSeek | iseek-dados---renavam | veiculo |
| chassi-isk | Chassi iSeek | iseek-dados---chassi | veiculo |
| motor-isk | Motor iSeek | iseek-dados---motor | veiculo |
| email-isk | E-mail iSeek | iseek-dados---email | contato |
| pix-isk | PIX iSeek | iseek-dados---pix | contato |
| cep-isk | CEP iSeek | iseek-dados---cep | contato |
| parentes-isk | Parentes iSeek | iseek-dados---parentes | pessoa |
| score-isk | Score iSeek | iseek-dados---score | financeiro |
| fotoma-isk | Foto MA iSeek | iseek-fotos---fotoma | foto |
| fotoes-isk | Foto ES iSeek | iseek-fotos---fotoes | foto |
| fototo-isk | Foto TO iSeek | iseek-fotos---fototo | foto |
| fotorj-isk | Foto RJ iSeek | iseek-fotos---fotorj | foto |
| fotosp-isk | Foto SP iSeek | iseek-fotos---fotosp | foto |
| fotoce-isk | Foto CE iSeek | iseek-fotos---fotoce | foto |
| fotoms-isk | Foto MS iSeek | iseek-fotos---fotoms | foto |
| fotoro-isk | Foto RO iSeek | iseek-fotos---fotoro | foto |
| fotopr-isk | Foto PR iSeek | iseek-fotos---fotopr | foto |
| fotopi-isk | Foto PI iSeek | iseek-fotos---fotopi | foto |
| fotodf-isk | Foto DF iSeek | iseek-fotos---fotodf | foto |
| fotogo-isk | Foto GO iSeek | iseek-fotos---fotogo | foto |
| crlvto-foto | CRLV TO Foto | iseek-fotos---crlvto | foto |
| crlvmt-foto | CRLV MT Foto | iseek-fotos---crlvmt | foto |

**Nota**: `cpf-isk` já existe no banco como VeiculosAPI — será mantido e um novo registro iSeek será criado se necessário, ou o existente será atualizado para provider=iSeek.

## Plano de Implementação

### Passo 1: Inserir 38 módulos faltantes no banco
- Migration SQL com INSERT dos 7 módulos novos + 31 módulos sobrepostos com sufixo `-isk`
- Todos com `provider = 'iSeek'` e `enabled = true`

### Passo 2: Atualizar `ISEEK_DIRECT_MODULES` na Edge Function
- Adicionar os 38 novos mapeamentos (ex: `"cnpj-isk": "iseek-dados---cnpj"`)

### Passo 3: Atualizar `MODULE_WHITELIST`
- Incluir todas as novas module_keys

### Passo 4: Atualizar validação de entrada
- Adicionar os novos módulos nos sets `NUMERIC_MODULES`/`TEXT_MODULES` conforme tipo

### Passo 5: Deploy da Edge Function `api-query`

## Resultado Final
- **VeiculosAPI**: 58 módulos (sem alteração)
- **iSeek**: 37 + 38 = **75 módulos**
- **Total**: **133 módulos**

Cada provedor terá seus próprios módulos independentes, gerenciáveis separadamente no painel.

