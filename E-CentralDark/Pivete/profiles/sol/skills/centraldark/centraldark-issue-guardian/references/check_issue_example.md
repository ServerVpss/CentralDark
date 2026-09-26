# How to check an issue state from a script

```python
import requests, os

def get_issue(issue_number: int):
    token = os.getenv('GITHUB_TOKEN')
    url = f'https://api.github.com/repos/ServerVpss/CentralDark/issues/{issue_number}'
    resp = requests.get(url, headers={'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'})
    if resp.status_code != 200:
        raise ValueError(f'Issue not found: {issue_number}')
    return resp.json()
```
