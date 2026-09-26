# Delivery & Runtime Environment — Session-Specific Notes

Session: 2026-08-26 (Hermes Agent on Windows/Git Bash, Telegram channel)

---

## 1. Áudio/voz no Telegram

**O que aconteceu:**
- `text_to_speech(text="...", provider="edge")` gerou com sucesso em `E:\CentralDark\Pivete\cache\audio\tts_20260826_215215_168693.ogg`
- O usuário não ouviu e pediu "cadê o áudio" novamente
- Segunda geração de áudio também não foi ouvida

**Tipo de falha:** breakpoint de entrega de canal, não falha de geração

**Conduta validada nesta sessão:**
- Após a primeira falha de entrega, oferecer alternativa textual imediatamente
- Não repetir a geração de áudio sem confirmação do usuário

**Status delivre:** `BLOCKED: delivery_channel_unavailable` para áudio neste runtime

---

## 2. `vision_analyze` retornou descrição genérica

**O que aconteceu:**
- Imagem `E:\CentralDark\Pivete\cache\images\img_7235d5f0f4d1.jpg` enviada pelo usuário
- `vision_analyze` retornou descrição de história de navegação web (Vite, Hermes Agent na porta 3787, CentralDark na 8080, etc.) — útil, mas **não** era o que a imagem mostrava
- O usuário seguiu com informação extraverbal: "e mais tinha algo nessa porta antes"

**Tipo de falha:** `vision_analyze` pode retornar descrição do encapsulamento/estrutura em vez do conteúdo semanticamente esperado

**Conduta:**
- Se a descrição não bater com o que o usuário está mostrando, confirmação do usuário antes de prosseguir
- Não usar como prova técnica sem confirmação

---

## 3. Git Bash / MSYS bash: comandos de ambiente Windows

**O que aconteceu (exemplos desta sessão):**

| Comando tentado | Resultado | Alternativa validada |
|-----------------|-----------|----------------------|
| `Get-Content "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"` | `Get-Content: command not found` | `cat "$HOME/AppData/Microsoft/Windows/PowerShell/PSReadLine/ConsoleHost_history.txt"` |
| `find /c/Users/danda -type f ...` | sintaxe aceita no buscador mas comportamento MSYS | usar `search_files` do Hermes ou `find /c/Users/danda` com cuidado |
| `reg query "HKCU\Software\..."` | timeout ou sintaxe | reduzir escopo ou usar PowerShell via terminal separado |
| `wmic process where ... /format:list` | funciona em partes, retorno multiline com `\r\r` | parse com `grep`/`cut` ou usar `tasklist` |

**Lição:** no runtime Windows/Git Bash, o termo é MSYS. Testar hipótese ambiente antes de concluir que o comando está errado.

---

## 4. Registry/event logs: timeout em consultas largas

**O que aconteceu:**
- `reg query "HKLM\SYSTEM\CurrentControlSet\Services" /s` timeoutou em 20s
- `wevtutil qe "Microsoft-Windows-Sysmon/Operational" ...` retornou vazio

**Conduta:**
- Se timeout, não repetir o mesmo comando — reduzir escopo ou abandonar se não é crítico
- Para diagnóstico de processo, prefira `tasklist`/`wmic process` com filtro de PID

---

## 5. Nota sobre porta 8787

**O que foi investigado (não um problema, apenas um fato de runtime):**
- Antes do site atual na porta 8787, estava rodando o dashboard nativo do Hermes Agent (`hermes.exe dashboard --port 8787`)
- Processo PID 25868, iniciado em 2026-08-26 15:47 (~6h antes da sessão)
- Cadeia: PID 32032 → bash.exe (PID 32168) → hermes.exe (PID 28780) → python.exe (PID 31276) → python.exe (PID 25868)
- O dashboard era do Hermes Agent, não do hermes-webui do Nesquena

**Nota:** isso é apenas contexto de runtime, não um erro ou técnica.

---

*Esta página é session-specific. Não é regra permanente — é diagnóstico para não repetir a dor.*
