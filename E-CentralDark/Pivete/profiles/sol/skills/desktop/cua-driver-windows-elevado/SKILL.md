---
name: cua-driver-windows-elevado
description: "Run cua-driver ELEVATED on Windows to fix WinError 740."
version: 1.0.0
author: HERMES-CASA
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [computer-use, cua-driver, windows, elevation, UAC, list_windows, cross-window]
    related_skills: [computer-use, autonomous-operation, sol-orquestradora]
---

# cua-driver Windows — rodar ELEVADO (resolve WinError 740)

Quando `computer_use` ou `cua-driver list_windows` retorna:
`WinError 740: A operação solicitada requer elevação`

O driver NÃO enxerga as janelas do Windows sem admin. O `list_windows` volta
vazio. Isso quebra o elo "MAIS JANELAS" do ciclo (T1..TN, cross-window rendezvous).

## Sintoma
- `cua-driver list_windows` → saída vazia ou erro 740
- `computer_use(action='capture')` → `cua-driver session setup failed: [WinError 740]`

## Causa
O cua-driver precisa de privilégio de administrador para ler a árvore de janelas
do Windows (Win32 API de enumeração). Rodar no terminal normal não basta.

## Solução provada (Windows 11, cua-driver 0.22.2)

NÃO use `-Verb RunAs` junto com `-RedirectStandardOutput` no mesmo
`Start-Process` — dá "AmbiguousParameterSet". Em vez disso, eleve um
PowerShell que por sua vez roda o driver e salva a saída num arquivo.

### Passo 1 — script wrapper
Salve em `C:\Users\<user>\cua_list.ps1`:

```powershell
$out = "C:\Users\<user>\cua_list.txt"
$err = "C:\Users\<user>\cua_err.txt"
try {
    $p = Start-Process -FilePath "C:\Users\<user>\AppData\Local\hermes\bin\cua-driver.exe" `
        -ArgumentList "list_windows" -Wait -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
    Add-Content -Path $out -Value "`nEXITCODE=$($p.ExitCode)"
} catch {
    "FAILED: $_" | Out-File -FilePath $err -Append
}
```

Substitua `<user>` pelo usuário real (ex: `danda`).

### Passo 2 — disparar ELEVADO
```powershell
Start-Process -FilePath 'powershell.exe' `
  -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File C:\Users\<user>\cua_list.ps1' `
  -Verb RunAs -Wait
```
Isso abre o UAC. Clica SIM. O driver roda como admin e escreve o JSON em
`cua_list.txt`.

### Passo 3 — ler resultado
`read_file` em `C:\Users\<user>\cua_list.txt`. O JSON traz:
- `windows[]` com `app_name`, `title`, `pid`, `window_id`, `bounds{x,y,width,height}`, `z_index`
- `current_space_id`

Se `cua_err.txt` estiver vazio e o JSON vier populado → elevação OK.

## Autostart (não pedir admin toda vez)
O driver tem comando nativo Windows-only:
```text
cua-driver autostart enable   # Scheduled Task no logon
cua-driver autostart kick      # sobe agora sem relogar
cua-driver autostart status   # checa registro + daemon
```
Ou simplesmente roda o Hermes / processo pai como administrador.

## Verificação rápida (sem script)
```text
cua-driver --version          # confirma binário
cua-driver list_windows        # se vazio + 740 → precisa elevar
```

## Localização do binário (deste PC)
- `C:\Users\danda\AppData\Local\hermes\bin\cua-driver.exe`
- `C:\Users\danda\AppData\Local\Programs\Cua\cua-driver\bin\cua-driver.exe`
Ambos v0.22.2.

## O que NÃO fazer
- Não usar `-Verb RunAs` + redirect no mesmo `Start-Process` (erro de parâmetro)
- Não assumir que o driver "não funciona" só porque list_windows voltou vazio —
  quase sempre é falta de elevação
- Não contornar UAC desligando segurança — use RunAs ou autostart

## Por que importa (contexto Casa)
Fecha o elo "MAIS JANELAS" do MASTER CYCLE: Hermes → SOL → META_LUPA →
CAPABILITY ROUTER → ENXAME → T1..TN. Cada janela viva é um terminal/painel
navegável. Sem elevação, o driver é cego e o cross-window rendezvous morre.
