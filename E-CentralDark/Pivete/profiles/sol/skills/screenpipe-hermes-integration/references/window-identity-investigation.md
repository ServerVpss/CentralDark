# Window Identity Investigation via Screenpipe

## Quando usar
Quando a interface do Screenpipe exibe um identificador `window:XXXXX` como o escritor de um arquivo (ex: `health_check.sh`) e você precisa descobrir o que esse identificador representa de fato — PID do Windows, HWND, ou ID interno do Screenpipe.

## O que esta sessão descobriu

**O identificador `window:15016` mostrado pelo Screenpipe NÃO é um PID do Windows.**

A investigação testou `OpenProcess(15016)` via Win32 API (`ctypes.windll.kernel32.OpenProcess`) e o handle não abriu — o processo com esse PID não existe no sistema. Isso prova que o identificador exibido pelo Screenpipe é interno à ferramenta, não um PID do sistema operacional.

Isso invalida o instinto comum de tratar `window:XXXXX` como PID e tentar resolvê-lo via `tasklist`, `Get-Process`, ou WMI. Nenhum desses caminhos funciona porque o identificador não existe no espaço de processos do Windows.

## O que fazer em vez disso

A investigação correta segue esta ordem:

**Passo 1 — Aceitar que window:XXXXX é um handle interno do Screenpipe.**
Não tentar resolvê-lo como PID do Windows. O fato do handle não abrir via `OpenProcess` já é a prova definitiva.

**Passo 2 — Investigar via Screenpipe API.**
Verificar se há endpoints que retornam metadados sobre janelas/contextos. Candidatos a testar:
- `/health` — disponibilidade e versão do serviço
- `/windows`, `/windows.json`, `/sessions`, `/info`, `/status` — endpoints candidatos que podem mapear handles para metadados
- `/windows/XXXXX`, `/window/XXXXX`, `/window?handle=XXXXX` — resolução direta do handle

**Passo 3 — Correlacionar com a árvore de processos real.**
Quando se tem os PIDs reais (PID + PPID + executable path + command line) dos processos Hermes/VSCode/terminal, pode-se correlacionar quais sessões estavam ativas no momento da escrita. Isso dá a ponte entre o handle interno do Screenpipe e o processo real que executou a escrita.

**Passo 4 — Não confundir identidade de processo com identidade de janela.**
O PID do executor Python (`os.getpid()`) é do processo que roda o script de investigação, não do agente Hermes nem da janela do VSCode que originou a escrita.

## Anti-padrões comprovados

- **Não usar `os.getpid()` como Hermes PID.** Devolve o PID do processo Python executor, não do agente Hermes.
- **Não usar `ProcessIdToSessionId()` como identidade única da janela.** Retorna o Windows Session ID da sessão de login do usuário, que é compartilhado por todas as janelas do mesmo usuário. Várias sessões Hermes distintas terão o mesmo valor — não distingue janela A de janela B.
- **Não tratar modelo/provider/platform hardcoded como evidência.** `print(f"Modelo: upstage/solar-pro4:free")` é texto afixado, não medição real. Se a sessão mudou de modelo, o print continua dizendo a coisa antiga.

## Cadeia de rastreamento alvo (fixed point)

```
evento de escrita (arquivo X mudou em t)
  → window:15016 (handle interno do Screenpipe)
  → PID real do processo (via árvore de processos: PID + PPID + executable)
  → pai do processo / hierarquia
  → executable path
  → Hermes session / terminal / VSCode
  → writer_scope (ex: scripts/health_check.sh)
```

O fixed point material é quando o evento, o handle interno, o processo real, a sessão/janela e o writer_scope conseguem ser ligados com evidência — não quando se tem cada pedaço isoladamente.

## Limitações de ferramenta conhecidas

- **GetExtendedTcpTable com MIB_TCPROW_OWNER_PID correta** retorna conexões IPv4 escutando com PID, mas pode não capturar serviços que usam IPv6 ou que ouviram em endereços não-ipv4. Se o Screenpipe responde em :3030 mas GetExtendedTcpTable não mostra a porta, investigar se é IPv6, parsing incorreto do buffer, ou o serviço não está em LISTEN-IPv4 no momento da medição.
- **Múltiplos `Hermes.exe` e `hermes.exe` rodando simultaneamente é normal** quando há várias sessões/janelas abertas. A contagem de processos não é métrica de sessões ativas nem de escopos de escrita.

## Técnica: Win32 API correta para MIB_TCPROW_OWNER_PID

A estrutura `MIB_TCPROW_OWNER_PID` tem 6 campos DWORD (24 bytes), não 56 como inicialmente assumido:

```
dwState        (4 bytes)
dwLocalAddr    (4 bytes)
dwLocalPort    (4 bytes)
dwRemoteAddr   (4 bytes)
dwRemotePort   (4 bytes)
dwOwningPid    (4 bytes)
```

O tamanho total da estrutura de cabeçalho é 4 bytes (`dwNumEntries`) mais N × 24 bytes. O parsing deve usar `struct.unpack_from("<IIIIII", row_data)` para ler os 6 campos. O `dwLocalPort` vem em network byte order e precisa de `ntohs` (ou `struct.unpack(">H", ...)`).

Biblioteca: `ctypes.windll.iphlpapi.GetExtendedTcpTable` com `TCP_TABLE_OWNER_PID_ALL = 5`.
