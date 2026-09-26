# CHECKLIST DE PESQUISA UNIVERSAL — Padrão da Casa

## Origem
Definido pelo SEGREDO/CHEFE na sessão 2026-08-29. Formato obrigatório quando travar e precisar que o usuário busque no Google.

---

## Template Obrigatório

```markdown
## 🔍 CHECKLIST DE PESQUISA — [NOME_TECNICO_DO_FIX]

### PROBLEMA
[Descrição curta + erro exato]

### ARQUIVOS ENVOLVIDOS
- `caminho/arquivo.ext:linha`

### TERMOS PRA BUSCAR NO GOOGLE/GITHUB
- `termo técnico 1`
- `termo técnico 2`
- `padrão arquitetural conhecido`

### O QUE PRECISA RETORNAR
- [ ] Solução mínima (não reescreve o mundo)
- [ ] Compatível com CentralDark (Node 24, MSYS/Windows, self-hosted)
- [ ] Não cria V2/segunda arquitetura
- [ ] Tem teste/prova de que funciona

### CRITÉRIOS DE ACEITE
- [ ] Passa no teste local
- [ ] Passa no CI (self-hosted Linux)
- [ ] Não quebra invariantes: UNKNOWN≠PASS, ACTION≠PROOF, REUSE_BEFORE_CREATE
```

---

## Exemplo Real — PATH_SEPARATOR_WINDOWS_FIX

```markdown
## 🔍 CHECKLIST DE PESQUISA — PATH_SEPARATOR_WINDOWS_FIX

### PROBLEMA
Teste falha: `expected 'src/adapter.ts' got 'src\\adapter.ts'` — Windows usa backslash, teste espera POSIX

### ARQUIVOS ENVOLVIDOS
- `scripts/lupa/validar-identidade-operacional.test.mjs:610`

### TERMOS PRA BUSCAR
- `normalize path separator cross-platform nodejs test`
- `path.posix vs path.win32 test assertion`
- `replace backslash forward slash node test windows`

### O QUE PRECISA RETORNAR
- [ ] Normalização no teste (não no código fonte)
- [ ] Uma linha: `actual.replace(/\\\\/g, '/')` ou `path.posix.normalize()`

### CRITÉRIOS DE ACEITE
- [ ] Teste passa Windows + Linux
- [ ] Não altera comportamento real do filesystem
```

---

## Fluxo de Busca (30s → 5min → 30min)

```
1. Copia erro exato → Google entre aspas → 30 seg
2. Adiciona stack: "node 24 windows msys" → 2 min
3. site:github.com + erro → 5 min
4. Se não acha: busca padrão arquitetural (não o erro) → 15 min
5. Se não acha: abre issue no repo da lib / pergunta no Discord/Slack
```

---

## Operadores de Ouro

| Operador | Uso |
|---|---|
| `""` | Busca exata: `"spawnSync python ENOENT"` |
| `site:` | Limita domínio: `site:github.com/microsoft/typescript` |
| `-` | Exclui: `python -snake -monty` |
| `intitle:` | No título: `intitle:"ENOENT" python` |
| `after:` | Recente: `after:2024-01-01 node test fix` |
| `filetype:` | Tipo: `filetype:md contributing guide` |

---

## O Que NÃO Aceitar (Filtro Mental)

- ❌ "como fazer do zero" / tutorials longos
- ❌ "V2 / rewrite / nova arquitetura"
- ❌ answers sem data / versões antigas (>2 anos)
- ❌ AI-generated content sem código real

## O Que ACEITAR (Critério de Aceite)

- ✅ Fix mínimo (1-5 linhas) com PR/commit real
- ✅ Issue fechada com reprodução + fix
- ✅ Doc oficial com versão compatível
- ✅ Workaround testado em ambiente igual ao meu