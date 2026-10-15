' Launcher invisivel do agendador de logs VS Code. Nao mostra janela nem le segredos.
Option Explicit
Dim fso, sh, scriptFile, pwshFile, command, result
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
pwshFile = sh.ExpandEnvironmentStrings("%ProgramFiles%") & "\PowerShell\7\pwsh.exe"
scriptFile = fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName), "vscode-log-bridge.ps1")
If Not fso.FileExists(pwshFile) Or Not fso.FileExists(scriptFile) Then
  WScript.Quit 3
End If
command = Chr(34) & pwshFile & Chr(34) & " -NoProfile -NonInteractive -File " & Chr(34) & scriptFile & Chr(34)
result = sh.Run(command, 0, True)  ' 0 = janela invisivel; True = devolver resultado real
WScript.Quit result
