# ANTIPADRÕES DEPRECADOS

## Da Sessão

| Antipadrão | Problema | Substituição |
|------------|----------|--------------|
| PowerShell inline complexo | Tokenização falha | Script .ps1 visível |
| Get-Item em NUL | Erro de namespace | Enumerar DirectoryInfo |
| Heredoc para PS1 | Instável | write_file direto |
| Saída vazia como sucesso | Falso verde | Hash obrigatório |
| Sem Dispose | Recurso aberto | finally com Dispose |
| Linha > 180 | Contrato violado | Compactar ou dividir |

---

## Não Repetir

- **Inline PowerShell**: Falha com `returnNOT_AVAILABLE`.
- **Get-Item NUL**: Erro `NotSupportedException`.
- **Sem limite**: Materializa tudo na memória.
- **Sem Dispose**: Enumerator fica aberto.
- **Sem finalização protegida**: Erro oculta saída.

---

## Aprendizado

Se um instrumento falha:

1. Preservar evidência.
2. Analisar causa raiz.
3. Criar versão corrigida.
4. Submeter à revisão.
5. Não "corrigir silenciosamente".
