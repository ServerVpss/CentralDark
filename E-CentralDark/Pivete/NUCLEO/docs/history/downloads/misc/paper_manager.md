# OUTRO - paper_manager.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\paper-publisher\scripts\paper_manager.py
**SHA:** 94a4a662c0e9e13d
**Timestamp:** 2026-08-26T18:32:15.778213
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n'
- fm_pattern = r'^(---\s*\n)(.*?\n)(---\s*\n)'

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "huggingface_hub",
#     "pyyaml",
#     "requests",
#     "python-dotenv",
# ]
# ///
"""
Paper Manager for Hugging Face Hub
Manages paper indexing, linking, authorship, and article creation.
"""

import argparse
import os
import sys
import re
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

try:
    from huggingface_hub import HfApi, hf_hub_download, get_token
    import yaml
    import requests
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Error: Missing required dependency: {e}")
    print("Tip: run this script with `uv run scripts/paper_manager.py ...`.")
    sys.exit(1)

# Load environment variables
load_dotenv()


class PaperManager:
    """Manages paper publishing operations on Hugging Face Hub."""

    def __init__(self, hf_token: Optional[str] = None):
        """Initialize Paper Manager with HF token."""
        self.token = hf_token or os.getenv("HF_TOKEN") or get_token()
        if not self.token:
            print("Warning: No HF_TOKEN found. Some operations will fail.")
        self.api = HfApi(token=self.token)

    def index_paper(self, arxiv_id: str) -> Dict[str, Any]:
        """
        Index a paper on Hugging Face from arXiv.

        Args:
            arxiv_id: arXiv identifier (e.g., "2301.12345")

        Returns:
            dict: Status information
        """
        # Clean and validate arXiv ID
        try:
            arxiv_id = self._clean_arxiv_id(arxiv_id)
        except ValueError as e:
            print(f"Error: {e}")
            return {"status": "error", "message": str(e)}

        print(f"Indexing paper {arxiv_id} on Hugging Face...")

        # Check if paper exists
        paper_url = f"https://huggingface.co/papers/{arxiv_id}"

        try:
            response = requests.get(paper_url, timeout=10)
            if response.status_code == 200:
                print(f"✓ Paper already indexed at {paper_url}")
                return {"status": "exists", "url": paper_url}
            else:
                print(f"Paper not indexed. Visit {paper_url} to trigger indexing.")
                print("The paper will be automatically indexed when you first visit the URL.")
                return {"status": "not_indexed", "url": paper_url, "action": "visit_url"}
        except requests.RequestException as e:
            print(f"Error checking paper status: {e}")
            return {"status": "error", "message": str(e)}

    def check_paper(self, arxiv_id: str) -> Dict[str, Any]:
        """
        Check if a paper exists on Hugging Face.

        Args:
            arxiv_id: arXiv identifier

        Returns:
            dict: Paper status and metadata
        """
        try:
            arxiv_id = self._clean_arxiv_id(arxiv_id)
        except ValueError as e:
            return {"exists": False, "error": str(e)}
        paper_url = f"https://huggingface.co/papers/{arxiv_id}"

        try:
            response = requests.get(paper_url, timeout=10)
            if response.status_code == 200:
                return {
                    "exists": True,
                    "url": paper_url,
                    "arxiv_id": arxiv_id,
                    "arxiv_url": f"https://arxiv.org/abs/{arxiv_id}"
                }
            else:
                return {
                    "exists": False,
                    "arxiv_id": arxiv_id,
                    "index_url": paper_url,
                    "message": f"Visit {paper_url} to index this paper"
                }
        except requests.RequestException as e:
            return {"exists": False, "error": str(e)}

    def link_paper_to_repo(
        self,
        repo_id: str,
        arxiv_id: str,
        repo_type: str = "model",
        citation: Optional[str] = None,
        create_pr: bool = False
    ) -> Dict[str, Any]:
        """
        Link a paper to a model/dataset/space repository.

        Args:
            repo_id: Repository identifier (e.g., "username/repo-name")
            arxiv_id: arXiv identifier
            repo_type: Type of repository ("model", "dataset", or "space")
            citation: Optional full citation text
            create_pr: Create a PR instead of direct commit

        Returns:
            dict: Operation status
        """
        try:
            arxiv_id = self._clean_arxiv_id(arxiv_id)
        except ValueError as e:
            print(f"Error: {e}")
            return {"status": "error", "message": str(e)}

        print(f"Linking paper {arxiv_id} to {repo_type} {repo_id}...")

        try:
            # Download current README
            readme_path = hf_hub_download(
                repo_id=repo_id,
                filename="README.md",
                repo_type=repo_type,
                token=self.token
            )

            with open(readme_path, 'r', encoding='utf-8') as f:
                cont
```