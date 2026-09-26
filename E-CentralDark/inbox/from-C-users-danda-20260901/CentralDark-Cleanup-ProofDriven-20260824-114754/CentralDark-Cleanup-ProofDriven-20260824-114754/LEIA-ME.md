# CentralDark — Cleanup Proof-Driven

Este pacote foi gerado especificamente a partir de:

`SEND-CENTRALDARK-AUDIT-20260824-114754.zip`

SHA-256 esperado:

`7bbc7d0a6f96ccad6696894c5420e7a8ba511de2f34b679ca8204711c2192b2d`

## O que a auditoria provou

- 6.093 arquivos em C: tinham SHA-256 idêntico a algum arquivo em `E:\CentralDark`.
- 393 ficam em `C:\Users\danda\Downloads` e formam a faixa automática de exclusão segura, mas o script recalcula os hashes antes de cada delete.
- 3.067 ficam em `.hermes-web-ui`: entram apenas em quarentena reversível se o caminho estiver dormente no runtime atual.
- `Documents`, `OneDrive`, `aiox-core`, `.hermes`, `.grok` e `AppData` são protegidos nesta rodada.

## Modos

### 1. Preview
Não altera nada. Reprova os arquivos e mostra o que seria feito.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\CentralDark-Cleanup-ProofDriven.ps1" -Mode Preview
```

### 2. DeleteSafe
Apaga apenas duplicatas provadas em `Downloads`, depois de:
- SHA do audit ZIP bater;
- arquivo fonte continuar com o SHA da auditoria;
- cópia idêntica continuar existindo em `E:\CentralDark`;
- destino de prova não ser backup/quarentena/temp/forense;
- arquivo não estar em uso;
- arquivo não estar em Git/reparse/sensível.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\CentralDark-Cleanup-ProofDriven.ps1" -Mode DeleteSafe
```

### 3. QuarantineDormant
Para `.hermes-web-ui`, NÃO deleta. Move somente arquivos duplicados comprovados para quarentena reversível e somente se nenhum consumidor for encontrado em processos, serviços, tarefas agendadas, variáveis de ambiente, atalhos ou Git.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\CentralDark-Cleanup-ProofDriven.ps1" -Mode QuarantineDormant
```

### 4. FinalizeQuarantine
Depois de testar estabilidade, apaga uma quarentena. Exige frase explícita.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\CentralDark-Cleanup-ProofDriven.ps1" `
  -Mode FinalizeQuarantine `
  -QuarantineBatch "C:\CentralDark-Audit\QUARANTINE\Q-..." `
  -FinalDeletePhrase "DELETE_PROVED_QUARANTINE"
```

## Não faça

Não use `Remove-Item C:\Users\danda\* -Recurse`.

Não delete `AppData\Local\hermes`, `.hermes`, `.claude`, `.codex`, OneDrive, repos Git ou arquivos `state.db*`/locks por nome.
