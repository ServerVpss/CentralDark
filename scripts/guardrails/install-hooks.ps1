$ErrorActionPreference = 'Stop'
$repo = (git -c safe.directory=E:/CentralDark rev-parse --show-toplevel).Trim()
git -C $repo -c safe.directory=E:/CentralDark config core.hooksPath .githooks
Write-Output "CENTRALDARK_HOOKS=INSTALLED path=.githooks"
