# CentralDark — Agente 007, varredura de espaço (somente leitura)

**Execute por duplo clique em `EXECUTAR-007.cmd`** no Windows Casa SEGREDO. Não aperte F5 no PowerShell ISE: o ISE respeita a política local e pode bloquear a execução direta do `.ps1`. O lançador usa `-ExecutionPolicy Bypass` somente no processo filho; não altera política persistente. Se uma política corporativa bloquear mesmo assim, respeite-a.

O arquivo ZIP foi preparado pelo ChatGPT e o relatório só será criado **no teu PC** depois que tu executar o `.cmd`. O ChatGPT não gravou arquivo diretamente em C:, D: ou K:.

O script verifica volumes locais (inclui `C:` e, quando presentes, `K:` e `E:`), registra **todos os arquivos >= 1 GiB** e ordena os maiores, agrupa ocupação aproximada por caminhos, e localiza possíveis dados antigos do Screenpipe, inclusive nos perfis `C:\Users\danda` e `C:\Users\Administrador`. Também relaciona candidatos Screenpipe >=10 MiB cuja última modificação é de pelo menos 30 dias.

A execução pode levar algum tempo dependendo do número de arquivos. Nenhum arquivo de sistema é modificado. Não apaga, não limpa, não inicia outra instância do Screenpipe, não lê conteúdos de gravações, não transmite informações e não modifica Git/VPS. Para evitar contagem infinita, links/junctions são ignorados. Erros de acesso são contabilizados e o resultado pode ser parcial.

O resultado é salvo automaticamente no teu PC em `D:\CentralDark-007-Disk-Audit-AAAAMMDD-HHMMSS\` **se D: estiver disponível**, senão em `Downloads\CentralDark-007-Disk-Audit-AAAAMMDD-HHMMSS\` do usuário que executou o script:

- `REPORT.md`: panorama legível, discos, maiores arquivos e pastas e Screenpipe.
- `summary.json`: dados estruturados para Reviewer/HUD.
- `files-over-1gib.csv`: **lista completa** dos arquivos >= 1 GiB.
- `largest-directories.csv`: diretórios agrupados para identificar locais pesados.
- `screenpipe-by-location.csv`: pastas do Screenpipe e volume lógico de arquivos.
- `screenpipe-30days-candidates.csv`: possíveis sobras antigas, **não autorizadas para exclusão**.
- `scan-errors.csv`: erros de acesso/enumeração que limitam a confiança do inventário.

Observação: soma de tamanho lógico de arquivos não é necessariamente espaço recuperável; hardlinks, arquivos esparsos, caches ativos e arquivos de sistema exigem análise própria. O relatório pode conter caminhos/nome de arquivos privados; não o publique no GitHub nem no site.
