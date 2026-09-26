# OUTRO - migrate-config.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\tests\core\config\migrate-config.test.js
**SHA:** 983dcfdca1730348
**Timestamp:** 2026-08-28T13:25:25.827361
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const result = migrateConfig(FAKE_PROJECT, { dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for migrate-config.js — Legacy → L2 + L5 Migration
 *
 * Covers:
 * - Legacy detection and backup creation (AC5, AC6)
 * - Field extraction: user → L5, project → L2 (AC5)
 * - Backup creation before migration (AC6)
 * - Idempotent re-execution (Task 3.8)
 * - Dry run mode
 * - Edge cases: missing legacy, malformed YAML
 *
 * @story 12.2
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

jest.mock('fs');
jest.mock('os');

const {
  migrateConfig,
  isLegacyMode,
  createBackup,
  extractUserFields,
  extractProjectFields,
  ensureUserConfigDir,
  writeUserConfig,
  writeProjectConfig,
  USER_FIELDS,
  PROJECT_FIELDS,
} = require('../../../.aios-core/core/config/migrate-config');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FAKE_PROJECT = '/fake/project';
const FAKE_HOME = '/fake/home';

const LEGACY_CONFIG_YAML = `
project:
  type: EXISTING_AIOS
  installedAt: "2025-01-14"
  version: "2.1.0"
user_profile: advanced
default_model: claude-sonnet
default_language: pt-BR
coderabbit_integration: true
educational_mode: false
project_name: my-project
project_type: fullstack
environments:
  development:
    database_url: postgres://localhost/dev
deploy_target: vercel
qa:
  qaLocation: docs/qa
`;

function setupFileSystem(files = {}) {
  fs.existsSync.mockImplementation((filePath) => {
    return Object.keys(files).some((key) => filePath.endsWith(key) || filePath === key);
  });

  fs.readFileSync.mockImplementation((filePath) => {
    for (const [key, content] of Object.entries(files)) {
      if (filePath.endsWith(key) || filePath === key) {
        return content;
      }
    }
    throw new Error(`ENOENT: no such file or directory: ${filePath}`);
  });

  fs.copyFileSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  os.homedir.mockReturnValue(FAKE_HOME);
  fs.existsSync.mockReturnValue(false);
  fs.readFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
  fs.copyFileSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Field Extraction Tests
// ---------------------------------------------------------------------------

describe('extractUserFields', () => {
  it('should extract user-level fields from legacy config', () => {
    // Given
    const legacyConfig = {
      user_profile: 'advanced',
      default_model: 'claude-sonnet',
      default_language: 'pt-BR',
      coderabbit_integration: true,
      educational_mode: false,
      project_name: 'should-not-be-here',
    };

    // When
    const userFields = extractUserFields(legacyConfig);

    // Then
    expect(userFields.user_profile).toBe('advanced');
    expect(userFields.default_model).toBe('claude-sonnet');
    expect(userFields.default_language).toBe('pt-BR');
    expect(userFields.coderabbit_integration).toBe(true);
    expect(userFields.educational_mode).toBe(false);
    expect(userFields.project_name).toBeUndefined();
  });

  it('should default user_profile to advanced when not present', () => {
    // Given
    const legacyConfig = { default_model: 'claude-sonnet' };

    // When
    const userFields = extractUserFields(legacyConfig);

    // Then
    expect(userFields.user_profile).toBe('advanced');
  });
});

describe('extractProjectFields', () => {
  it('should extract project-level fields from legacy config', () => {
    // Given
    const legacyConfig = {
      project_name: 'my-project',
      project_type: 'fullstack',
      environments: { development: { database_url: 'postgres://localhost/dev' } },
      deploy_target: 'vercel',
      user_profile: 'should-not-be-here',
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Then
    expect(projectFields.project_name).toBe('my-project');
    expect(projectFields.project_type).toBe('fullstack');
    expect(projectFields.environments).toBeDefined();
    expect(projectFields.deploy_target).toBe('vercel');
    expect(projectFields.user_profile).toBeUndefined();
  });

  it('should extract project.type from nested project object', () => {
    // Given
    const legacyConfig = {
      project: { type: 'EXISTING_AIOS', version: '2.1.0' },
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Then
    expect(projectFields.project_type).toBe('EXISTING_AIOS');
  });

  it('should not override explicit project_type with nested project.type', () => {
    // Given
    const legacyConfig = {
      project_type: 'fullstack',
      project: { type: 'EXISTING_AIOS' },
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Th
```