import subprocess
import json

result = subprocess.run(
    ['gh', 'pr', 'list', '--state', 'open', '--limit', '5', '--json', 'number,title,headRefName,updatedAt,additions,deletions'],
    capture_output=True, text=True, timeout=30
)
if result.returncode == 0:
    prs = json.loads(result.stdout)
    for pr in prs:
        print(f"[PR #{pr['number']}] {pr['title']} | branch: {pr['headRefName']} | updated: {pr['updatedAt']} | +{pr['additions']}/-{pr['deletions']}")
else:
    print(f"Erro ao listar PRs: {result.stderr}")
