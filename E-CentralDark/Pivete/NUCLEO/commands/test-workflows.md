# COMANDO - test-workflows.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\test-workflows.sh
**SHA:** 01f15a49b218c1b0
**Timestamp:** 2026-08-28T02:56:09.994478
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- print_error "Not authenticated with GitHub. Please run: gh auth login"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash

# GitHub Workflow Testing Script
# This script helps you test the new workflows safely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed. Please install it first."
        echo "Visit: https://cli.github.com/"
        exit 1
    fi
    print_success "GitHub CLI is installed"
}

# Check if user is authenticated
check_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub. Please run: gh auth login"
        exit 1
    fi
    print_success "Authenticated with GitHub"
}

# Create test branch
create_test_branch() {
    print_status "Creating test branch 'workflow-testing'..."

    if git show-branch workflow-testing &> /dev/null; then
        print_warning "Branch 'workflow-testing' already exists. Switching to it..."
        git checkout workflow-testing
    else
        git checkout -b workflow-testing
        git push -u origin workflow-testing
        print_success "Created and pushed test branch"
    fi
}

# Run specific test type
run_test() {
    local test_type=$1
    print_status "Running workflow test: $test_type"

    gh workflow run "Test Workflows" \
        --ref workflow-testing \
        -f test_type="$test_type"

    print_success "Triggered workflow test: $test_type"
    print_status "Monitor progress at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
}

# Monitor latest workflow run
monitor_run() {
    print_status "Finding latest workflow run..."

    local run_id=$(gh run list --workflow="Test Workflows" --limit=1 --json databaseId -q '.[0].databaseId')

    if [ -n "$run_id" ]; then
        print_status "Monitoring run ID: $run_id"
        gh run watch "$run_id"
    else
        print_warning "No workflow runs found. Did you trigger a test?"
    fi
}

# Create test PR
create_test_pr() {
    print_status "Creating test PR..."

    # Make a small change to trigger workflows
    echo "# Workflow Testing - $(date)" >> WORKFLOW_TESTING.md
    git add WORKFLOW_TESTING.md
    git commit -m "test: trigger workflow validation"
    git push origin workflow-testing

    # Create PR
    gh pr create \
        --title "Test: Workflow Validation - $(date +%Y-%m-%d)" \
        --body "🧪 **This is a test PR for workflow validation - DO NOT MERGE**

This PR tests:
- [x] PR validation workflows
- [x] Quality gates
- [x] Security scanning
- [x] Preview deployment
- [x] Semantic PR validation

**Testing checklist:**
- [ ] All workflows complete successfully
- [ ] Quality gates pass
- [ ] Security scans complete
- [ ] Preview deployment works
- [ ] No errors in workflow logs

**Next steps:**
1. Monitor workflow execution
2. Verify all checks pass
3. Test any failing workflows
4. Close this PR when testing is complete" \
        --draft

    print_success "Created test PR (draft)"
}

# Clean up test resources
cleanup() {
    print_status "Cleaning up test resources..."

    # Close any open test PRs
    local test_prs=$(gh pr list --state=open --search="Test: Workflow Validation" --json number -q '.[].number')

    for pr in $test_prs; do
        print_status "Closing test PR #$pr"
        gh pr close "$pr" --comment "Workflow testing completed - closing test PR"
    done

    # Switch back to main branch
    git checkout main

    print_warning "Test branch 'workflow-testing' preserved for future testing"
    print_success "Cleanup completed"
}

# Main menu
show_menu() {
    echo
    echo "🧪 GitHub Workflow Testing Script"
    echo "=================================="
    echo
    echo "Select an option:"
    echo "1) Test all workflows"
    echo "2) Test CI/CD only"
    echo "3) Test security scanning only"
    echo "4) Test quality checks only"
    echo "5) Create test PR"
    echo "6) Monitor latest workflow run"
    echo "7) Cleanup test resources"
    echo "8) View workflow testing guide"
    echo "9) Exit"
    echo
}

# View testing guide
view_guide() {
    if [ -f "WORKFLOW_TESTING.md" ]; then
        print_status "Opening workflow testing guide..."
        if command -v bat &> /dev/null; then
            bat WORKFLOW_TESTING.md
        elif command -v less &> /dev/null; then
            less WORKFLOW_TESTING.md
        else
            cat WORKFLOW_TESTING.md
        fi
    else
        print_error "WORKFLOW_TESTING.md not found in current directory"
    fi
}

# Main script
main() {
    print_status "Starting GitHub Workflow Testing Script"

    # Check prerequisites
    check_gh_cli
    check_auth

    # Create 
```

---

# COMANDO - test-workflows.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\test-workflows.yaml
**SHA:** 3c6bc8195902a282
**Timestamp:** 2026-08-28T02:56:10.520350
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: pnpm install --frozen-lockfile
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Test Workflows

# This workflow is for testing our new workflow changes safely
on:
  push:
    branches: [workflow-testing, test-*]
  pull_request:
    branches: [workflow-testing]
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Type of test to run'
        required: true
        default: 'all'
        type: choice
        options:
        - all
        - ci-only
        - security-only
        - quality-only

jobs:
  workflow-test-info:
    name: Workflow Test Information
    runs-on: ubuntu-latest
    steps:
      - name: Display test information
        run: |
          echo "🧪 Testing new workflow configurations"
          echo "Branch: ${{ github.ref_name }}"
          echo "Event: ${{ github.event_name }}"
          echo "Test type: ${{ github.event.inputs.test_type || 'all' }}"
          echo ""
          echo "This is a safe test environment - no changes will affect production workflows"

  test-basic-setup:
    name: Test Basic Setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Test setup-and-build action
        uses: ./.github/actions/setup-and-build

      - name: Verify Node.js version
        run: |
          echo "Node.js version: $(node --version)"
          if [[ "$(node --version)" == *"24."* ]]; then
            echo "✅ Correct Node.js version"
          else
            echo "❌ Wrong Node.js version"
            exit 1
          fi

      - name: Verify pnpm version
        run: |
          echo "pnpm version: $(pnpm --version)"
          if [[ "$(pnpm --version)" == *"9.14.4"* ]]; then
            echo "✅ Correct pnpm version"
          else
            echo "❌ Wrong pnpm version"
            exit 1
          fi

      - name: Test build process
        run: |
          echo "✅ Build completed successfully"

  test-linting:
    name: Test Linting
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup and Build
        uses: ./.github/actions/setup-and-build

      - name: Test ESLint
        run: |
          echo "Testing ESLint configuration..."
          pnpm run lint --max-warnings 0 || echo "ESLint found issues (expected for testing)"

      - name: Test TypeScript
        run: |
          echo "Testing TypeScript compilation..."
          pnpm run typecheck

  test-caching:
    name: Test Caching Strategy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup and Build
        uses: ./.github/actions/setup-and-build

      - name: Test TypeScript cache
        uses: actions/cache@v5
        with:
          path: |
            .tsbuildinfo
            node_modules/.cache
          key: test-${{ runner.os }}-typescript-${{ hashFiles('**/tsconfig.json', 'app/**/*.ts', 'app/**/*.tsx') }}
          restore-keys: |
            test-${{ runner.os }}-typescript-

      - name: Test ESLint cache
        uses: actions/cache@v5
        with:
          path: node_modules/.cache/eslint
          key: test-${{ runner.os }}-eslint-${{ hashFiles('.eslintrc*', 'app/**/*.ts', 'app/**/*.tsx') }}
          restore-keys: |
            test-${{ runner.os }}-eslint-

      - name: Verify caching works
        run: |
          echo "✅ Caching configuration tested"

  test-security-tools:
    name: Test Security Tools
    runs-on: ubuntu-latest
    if: github.event.inputs.test_type == 'all' || github.event.inputs.test_type == 'security-only'
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '24'

      - name: Install pnpm
        uses: pnpm/action-setup@v6
        with:
          version: '9.14.4'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test dependency audit (non-blocking)
        run: |
          echo "Testing pnpm audit..."
          pnpm audit --audit-level moderate || echo "Audit found issues (this is for testing)"

      - name: Test Trivy installation
        run: |
          echo "Testing Trivy secrets scanner..."
          docker run --rm -v ${{ github.workspace }}:/workspace aquasecurity/trivy:latest fs /workspace --exit-code 0 --no-progress --format table --scanners secret || echo "Trivy test completed"

  test-quality-checks:
    name: Test Quality Checks
    runs-on: ubuntu-latest
    if: github.event.inputs.test_type == 'all' || github.event.inputs.test_type == 'quality-only'
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup and Build
        uses: ./.github/actions/setup-and-build

      - name: Test bundle size analysis
        run: |
          echo "Testing bundle size analysis..."
          ls -la build/client/ || echo "Build directory structure checked"

      - name: Test dependency checks
        run: |
          echo "Testing depcheck..."
          npx depcheck
```