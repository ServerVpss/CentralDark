# LIMITES E PRIVACIDADE

## Limites de Segurança

| Limite | Descrição |
|--------|-----------|
| Perfil | Ler, não modificar |
| Rede | Proibido |
| Repositório | Proibido |
| Credenciais | Nunca ler |
| .env | Nunca ler |
| Auth | Nunca ler |
| Cookies | Nunca ler |
| Tokens | Nunca ler |
| SOUL | Não modificar |
| Novas skills | Não criar |

---

## O que NÃO fazer

- Não acessar caminhos reservados (NUL, CON, PRN, AUX, etc.).
- Não usar `Get-Item` em caminhos dinâmicos.
- Não executar PowerShell inline complexo.
- Não criar heredoc para scripts longos.
- Não assumir que saída verde = contrato satisfeito.

---

## Privacidade

- Esta cápsula é **privada** (não vai para repositório).
- Não contém credenciais.
- Não contém tokens.
- Não contém sessões anteriores.
- Apenas mecanismos, estados e evidências.

---

## Perfil

```
profile_runtime=C:\Users\danda\AppData\Local\hermes\profiles\pivete
profile_runtime_proven=true
```

Este perfil foi validado mas nunca modificado.
