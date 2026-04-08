

# Mapear Módulos iSeek Faltantes no Telegram Webhook

## Diagnóstico

Dos **75 módulos iSeek** no banco, apenas **~32 estão mapeados** no `queryTypeAliases`. Há **43 módulos sem comando** no Telegram e **3 com mapeamento incorreto**.

### Mapeamento incorreto (bug)
Os aliases apontam para module_keys que **não existem** no banco:
- `irpf` → `irpf-isk` (DB tem `irpf`)
- `vacinas` → `vacinas-isk` (DB tem `vacinas`)
- `obito` → `obito-isk` (DB tem `obito`)

### Módulos sem comando no Telegram (43)

| Categoria | Módulos sem comando |
|-----------|-------------------|
| **Pessoa** | `nasc`, `pai`, `registro`, `nomeabreviadofiltros` |
| **Documento** | `nis`, `oab`, `cnham`, `cnhnc`, `cnhrr`, `cnhrs` |
| **Financeiro** | `assessoria`, `bens`, `cheque`, `dividas`, `iptu`, `irpf`¹, `score2`, `rais` |
| **Empresa** | `catcpf`, `catnumero` |
| **Justiça** | `advogadocpf`, `advogadooab`, `advogadooabuf`, `certidoes`, `mandado`, `processo` |
| **Governo** | `beneficios`, `faculdades`, `func`, `matricula`, `vacinas`¹ |
| **Saúde** | `obito`¹ |
| **Veículos** | `veiculos`, `crlvmt`, `crlvto`, `crlvmt-foto`, `crlvto-foto` |
| **Fotos** | `fotoal`, `fotocnh`, `fotodetran`, `fotogo`, `fotomapresos`, `fotonc`, `fotopb`, `fotope`, `fotorn` |

¹ Estes têm alias mas apontam para key errada (`-isk` suffix que não existe no DB)

## Plano de Implementação

### 1. Corrigir aliases com mismatch (3 itens)
No `queryTypeAliases`, corrigir:
```
irpf: "irpf"      // era "irpf-isk"
vacinas: "vacinas" // era "vacinas-isk"
obito: "obito"     // era "obito-isk"
```

### 2. Adicionar aliases para os 43 módulos faltantes
Adicionar ao `queryTypeAliases`:
```
// Pessoa
nasc: "nasc", pai: "pai", registro: "registro",
// Documento
nis: "nis", oab: "oab", cnham: "cnham", cnhnc: "cnhnc", cnhrr: "cnhrr", cnhrs: "cnhrs",
// Financeiro
assessoria: "assessoria", bens: "bens", cheque: "cheque",
dividas: "dividas", iptu: "iptu", score4: "score2",
rais: "rais",
// Empresa
catcpf: "catcpf", catnumero: "catnumero",
// Justiça
advogadocpf: "advogadocpf", advogadooab: "advogadooab",
advogadooabuf: "advogadooabuf", certidoes: "certidoes",
mandado: "mandado", processo: "processo",
// Governo
beneficios: "beneficios", faculdades: "faculdades",
func: "func", matricula: "matricula",
// Veículos
veiculos: "veiculos", crlvmt: "crlvmt", crlvto: "crlvto",
crlvmtfoto: "crlvmt-foto", crlvtofoto: "crlvto-foto",
// Fotos exclusivas
fotoal: "fotoal", fotocnh: "fotocnh", fotodetran: "fotodetran",
fotogo3: "fotogo", fotomapresos: "fotomapresos",
fotonc: "fotonc", fotopb: "fotopb", fotope2: "fotope",
fotorn: "fotorn",
```

### 3. Adicionar labels no `queryTypeLabels`
Adicionar labels descritivos para cada novo comando.

### 4. Deploy
Arquivo alterado: `supabase/functions/telegram-webhook/index.ts`

## Nomenclatura dos comandos
- Módulos exclusivos iSeek → nome direto (`/irpf`, `/vacinas`, `/bens`, `/mandado`)
- Módulos que colidem com VeiculosAPI → número sequencial (`/score4` para `score2`, `/fotope2` para `fotope`, `/fotogo3` para `fotogo`)

