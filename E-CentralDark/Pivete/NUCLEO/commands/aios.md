# COMANDO - aios.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\bin\aios.js
**SHA:** 573f08835b60c873
**Timestamp:** 2026-08-28T02:02:30.300277
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- process.env.AIOS_INSTALL_DRY_RUN = options.dryRun ? '1' : '';
- const isDryRun = updateArgs.includes('--dry-run');
- dryRun: isDryRun,
- const isDryRun = doctorArgs.includes('--dry-run');
- console.log('  Run: npx aios-core@latest');
- console.log('  Run: aios pro validate');
- console.log('  Run: aios pro activate --key <KEY>');
- console.log('  Run: aios pro activate --key <KEY>');
- const { force = false, keepData = false, dryRun = false, quiet = false } = options;
- dryRun: installArgs.includes('--dry-run'),

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS-FullStack CLI
 * Main entry point - Standalone (no external dependencies for npx compatibility)
 * Version: 4.0.0
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper: Run initialization wizard
async function runWizard(options = {}) {
  // Use the new v2.1 wizard from packages/installer/src/wizard/index.js
  const wizardPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'wizard', 'index.js');

  if (!fs.existsSync(wizardPath)) {
    // Fallback to legacy wizard if new wizard not found
    const legacyScript = path.join(__dirname, 'aios-init.js');
    if (fs.existsSync(legacyScript)) {
      if (!options.quiet) {
        console.log('⚠️  Using legacy wizard (src/wizard not found)');
      }
      // Legacy wizard doesn't support options, pass via env vars
      process.env.AIOS_INSTALL_FORCE = options.force ? '1' : '';
      process.env.AIOS_INSTALL_QUIET = options.quiet ? '1' : '';
      process.env.AIOS_INSTALL_DRY_RUN = options.dryRun ? '1' : '';
      require(legacyScript);
      return;
    }
    console.error('❌ Initialization wizard not found');
    console.error('Please ensure AIOS-FullStack is installed correctly.');
    process.exit(1);
  }

  try {
    // Run the new v2.1 wizard with options
    const { runWizard: executeWizard } = require(wizardPath);
    await executeWizard(options);
  } catch (error) {
    console.error('❌ Wizard error:', error.message);
    process.exit(1);
  }
}

// Helper: Show help
function showHelp() {
  console.log(`
AIOS-FullStack v${packageJson.version}
AI-Orchestrated System for Full Stack Development

USAGE:
  npx aios-core@latest              # Run installation wizard
  npx aios-core@latest install      # Install in current project
  npx aios-core@latest init <name>  # Create new project
  npx aios-core@latest update       # Update to latest version
  npx aios-core@latest validate     # Validate installation integrity
  npx aios-core@latest info         # Show system info
  npx aios-core@latest doctor       # Run diagnostics
  npx aios-core@latest --version    # Show version
  npx aios-core@latest --version -d # Show detailed version info
  npx aios-core@latest --help       # Show this help

UPDATE:
  aios update                    # Update to latest version
  aios update --check            # Check for updates without applying
  aios update --dry-run          # Preview what would be updated
  aios update --force            # Force update even if up-to-date
  aios update --verbose          # Show detailed output

VALIDATION:
  aios validate                    # Validate installation integrity
  aios validate --repair           # Repair missing/corrupted files
  aios validate --repair --dry-run # Preview repairs
  aios validate --detailed         # Show detailed file list

CONFIGURATION:
  aios config show                       # Show resolved configuration
  aios config show --debug               # Show with source annotations
  aios config diff --levels L1,L2        # Compare config levels
  aios config migrate                    # Migrate monolithic to layered
  aios config validate                   # Validate config files
  aios config init-local                 # Create local-config.yaml

SERVICE DISCOVERY:
  aios workers search <query>            # Search for workers
  aios workers search "json" --category=data
  aios workers search "transform" --tags=etl,data
  aios workers search "api" --format=json

EXAMPLES:
  # Install in current directory
  npx aios-core@latest

  # Install with minimal mode (only expansion-creator)
  npx aios-core-minimal@latest

  # Create new project
  npx aios-core@latest init my-project

  # Search for workers
  aios workers search "json csv"

For more information, visit: https://github.com/SynkraAI/aios-core
`);
}

// Helper: Show version
async function showVersion() {
  const isDetailed = args.includes('--detailed') || args.includes('-d');

  if (!isDetailed) {
    // Simple version output (backwards compatible)
    console.log(packageJson.version);
    return;
  }

  // Detailed version output (Story 7.2: Version Tracking)
  console.log(`AIOS-FullStack v${packageJson.version}`);
  console.log('Package: aios-core');

  // Check for local installation
  const localVersionPath = path.join(process.cwd(), '.aios-core', 'version.json');

  if (fs.existsSync(localVersionPath)) {
    try {
      const versionInfo = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
      console.log('\n📦 Local Installation:');
      console.log(`  Version:    ${versionInfo.version}`);
      console.log(`  Mode:       ${versionInfo.mode || 'unknown'}`);

      if (versionInfo.installedAt) 
```