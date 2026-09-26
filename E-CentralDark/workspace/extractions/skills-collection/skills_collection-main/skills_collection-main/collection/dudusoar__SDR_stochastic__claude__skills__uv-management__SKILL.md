---
name: uv-management
description: Quick reference for uv (fast Python package manager) operations to save tokens. Use when creating virtual environments, installing packages, managing dependencies, or when user asks about uv commands. Provides concise patterns for Python project setup and package management.
---

# UV Management

Quick reference for uv - the fast Python package installer and environment manager.

## Installation

### Install UV
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv

# Verify installation
uv --version
```

## Project Initialization

### Create New Project
```bash
# Initialize new project
uv init project-name

# Initialize in current directory
uv init

# With specific Python version
uv init --python 3.11
```

### Project Structure Created
```
project-name/
├── pyproject.toml    # Project configuration
├── .python-version   # Python version specification
└── src/
    └── project_name/
        └── __init__.py
```

## Virtual Environment

### Create Virtual Environment
```bash
# Create venv (automatic with uv)
uv venv

# With specific Python version
uv venv --python 3.11

# With custom name
uv venv .venv-custom

# Activate (same as regular venv)
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows
```

### Python Version Management
```bash
# List available Python versions
uv python list

# Install specific Python version
uv python install 3.11

# Pin Python version for project
uv python pin 3.11
```

## Package Management

### Install Packages
```bash
# Install single package
uv pip install package-name

# Install specific version
uv pip install package-name==1.2.3

# Install from requirements.txt
uv pip install -r requirements.txt

# Install from pyproject.toml
uv pip install -e .

# Install development dependencies
uv pip install -e ".[dev]"
```

### Add Dependencies (Modern Way)
```bash
# Add package to project
uv add numpy

# Add with version constraint
uv add "numpy>=1.24,<2.0"

# Add multiple packages
uv add numpy pandas matplotlib

# Add as dev dependency
uv add --dev pytest black ruff

# Add from git
uv add git+https://github.com/user/repo.git
```

### Remove Packages
```bash
# Remove package
uv remove package-name

# Remove dev dependency
uv remove --dev pytest
```

### Update Packages
```bash
# Update single package
uv pip install --upgrade package-name

# Update all packages
uv pip install --upgrade -r requirements.txt

# Sync dependencies (recommended)
uv sync
```

## Dependency Management

### Lock Dependencies
```bash
# Generate lock file
uv lock

# Lock and sync
uv lock --sync
```

### Export Requirements
```bash
# Export to requirements.txt
uv pip freeze > requirements.txt

# Export from pyproject.toml
uv export --format requirements-txt > requirements.txt
```

## Running Commands

### Run Python
```bash
# Run Python script
uv run python script.py

# Run module
uv run -m module_name

# Run with arguments
uv run python script.py --arg value
```

### Run Tools
```bash
# Run pytest
uv run pytest

# Run black
uv run black .

# Run ruff
uv run ruff check .

# Run any tool
uv run tool-name [args]
```

## VRP Project Setup

### Initial Project Setup
```bash
# 1. Create project directory
mkdir vrp-toolkit
cd vrp-toolkit

# 2. Initialize with uv
uv init

# 3. Create virtual environment
uv venv

# 4. Activate environment
source .venv/bin/activate

# 5. Install core dependencies
uv add numpy pandas matplotlib networkx

# 6. Install dev dependencies
uv add --dev pytest black ruff ipython jupyter

# 7. Install OSMnx (for real map support)
uv add osmnx geopandas

# 8. Install package in editable mode
uv pip install -e .
```

### pyproject.toml for VRP Toolkit
```toml
[project]
name = "vrp-toolkit"
version = "0.1.0"
description = "Reusable VRP/PDPTW solving framework"
requires-python = ">=3.8"
dependencies = [
    "numpy>=1.24.0",
    "pandas>=2.0.0",
    "matplotlib>=3.7.0",
    "networkx>=3.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "ipython>=8.0.0",
    "jupyter>=1.0.0",
]
osmnx = [
    "osmnx>=1.6.0",
    "geopandas>=0.14.0",
    "folium>=0.15.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100
target-version = "py38"

[tool.black]
line-length = 100
target-version = ["py38"]
```

### Install All Dependencies
```bash
# Install main dependencies
uv add numpy pandas matplotlib networkx

# Install dev tools
uv add --dev pytest black ruff ipython jupyter

# Install OSMnx group
uv add osmnx geopandas folium

# Or install from pyproject.toml
uv sync
```

## Common Workflows

### Daily Development
```bash
# Activate environment
source .venv/bin/activate

# Run tests
uv run pytest

# Format code
uv run black .

# Lint code
uv run ruff check .

# Run Jupyter
uv run jupyter lab
```

### Add New Dependency
```bash
# Add package
uv add package-name

# Test it works
uv run python -c "import package_name; print('OK')"

# Commit updated pyproject.toml
git add pyproject.toml uv.lock
git commit -m "chore: add package-name dependency"
```

### Clean Install
```bash
# Remove existing environment
rm -rf .venv

# Recreate
uv venv

# Reinstall all dependencies
uv sync

# Verify
uv run python -c "import numpy; print(numpy.__version__)"
```

## Comparison with pip/venv

| Task | Traditional | UV |
|------|------------|-----|
| Create venv | `python -m venv .venv` | `uv venv` |
| Activate | `source .venv/bin/activate` | Same |
| Install package | `pip install package` | `uv add package` |
| Install requirements | `pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| Freeze deps | `pip freeze > requirements.txt` | `uv pip freeze > requirements.txt` |
| Run tool | `python -m pytest` | `uv run pytest` |

**Key Advantages of UV:**
- ⚡ 10-100x faster than pip
- 🔒 Built-in dependency locking
- 🐍 Python version management
- 📦 Cleaner dependency specification in pyproject.toml

## Troubleshooting

### UV Not Found After Install
```bash
# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$HOME/.cargo/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Wrong Python Version
```bash
# Check current Python
uv run python --version

# List available versions
uv python list

# Install correct version
uv python install 3.11

# Pin to project
uv python pin 3.11

# Recreate venv
rm -rf .venv
uv venv
```

### Dependency Conflicts
```bash
# See resolution
uv tree

# Try updating
uv sync --upgrade

# Force reinstall
rm -rf .venv uv.lock
uv venv
uv sync
```

### Package Not Found
```bash
# Make sure package name is correct
uv add numpy  # Correct
uv add NumPy  # Wrong (case sensitive)

# Check if package exists
pip search package-name

# Or search on PyPI: https://pypi.org/
```

## Advanced Usage

### Multiple Environments
```bash
# Create environment with different name
uv venv .venv-dev

# Activate specific environment
source .venv-dev/bin/activate

# Install different dependencies
uv add specific-package
```

### Dependency Groups
```bash
# Install specific group
uv sync --group dev

# Install multiple groups
uv sync --group dev --group osmnx

# Install all groups
uv sync --all-groups
```

### Build and Publish
```bash
# Build package
uv build

# Publish to PyPI (requires twine)
uv run twine upload dist/*
```

## Integration with Other Skills

**Works with:**
- **session-start**: Check Python environment status
- **migrate-module**: Ensure dependencies are installed
- **osmnx-integration**: Install OSMnx and geo packages

**Example project setup:**
```bash
# 1. Initialize project
uv init vrp-toolkit
cd vrp-toolkit

# 2. Setup environment
uv venv
source .venv/bin/activate

# 3. Install dependencies
uv add numpy pandas matplotlib networkx
uv add --dev pytest black ruff jupyter
uv add osmnx geopandas  # For OSMnx integration

# 4. Install in editable mode
uv pip install -e .

# 5. Verify installation
uv run python -c "from vrp_toolkit import *; print('OK')"

# 6. Start development
uv run jupyter lab
```

## Quick Reference

| Task | Command |
|------|---------|
| Init project | `uv init` |
| Create venv | `uv venv` |
| Add package | `uv add package` |
| Add dev dep | `uv add --dev tool` |
| Install all | `uv sync` |
| Run script | `uv run python script.py` |
| Run tool | `uv run pytest` |
| Update all | `uv sync --upgrade` |
| Lock deps | `uv lock` |
| Export reqs | `uv pip freeze > requirements.txt` |
| Python version | `uv python install 3.11` |
| Pin Python | `uv python pin 3.11` |

## Migration from pip

### Convert requirements.txt to pyproject.toml
```bash
# 1. Read existing requirements
cat requirements.txt

# 2. Add packages one by one
uv add package1 package2 package3

# Or install and then generate pyproject.toml
uv pip install -r requirements.txt
uv pip freeze  # Review installed packages
```

### Migrate Existing Project
```bash
# 1. In existing project directory
cd existing-project

# 2. Create uv environment
uv venv

# 3. Install from requirements.txt
uv pip install -r requirements.txt

# 4. Generate pyproject.toml (manual)
uv init --no-workspace

# 5. Add dependencies to pyproject.toml
uv add $(cat requirements.txt | grep -v '#' | cut -d'=' -f1)
```
