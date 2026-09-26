# DECISION LOG

## Decisões da Sessão

| Data | Decisão | Motivo | Evidência |
|------|---------|--------|-----------|
| 2026-07-29 | Usar BASH_MSYS_TO_SINGLE_POWERSHELL | PowerShell inline falha | Tokenização |
| 2026-07-29 | Não usar Get-Item em NUL | Erro de namespace | NotSupportedException |
| 2026-07-29 | Criar script .ps1 visível | Heredoc instável | write_file tool |
| 2026-07-29 | Limitar 180 linhas | Contrato SOL | Gate definido |
| 2026-07-29 | Adicionar Dispose | Cleanup determinístico | finally block |
| 2026-07-29 | Não executar 05d | Aguardar revisão | SOL gate |

---

## Decisões de Design

### Transporte
- **Decisão**: Um powershell.exe por chamada.
- **Alternativa**: Heredoc.
- **Resultado**: Implementado e validado.

### Coletor
- **Decisão**: Ler Profile.Show Native.
- **Alternativa**: rglob irrestrito.
- **Resultado**: Limitado e sanitizado.

### Script NUL
- **Decisão**: Enumerar DirectoryInfo.
- **Alternativa**: Get-Item.
- **Resultado**: 3 versões criadas.

---

## Não Decisões

- Não criar ZIP ainda.
- Não modificar perfil.
- Não executar 05d.
- Não conectar à rede.
- Não acessar credenciais.
