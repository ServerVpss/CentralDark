# REFERENCIA - config-validator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\wizard\validation\config-validator.test.js
**SHA:** d630f89d0277b798
**Timestamp:** 2026-08-28T02:19:51.829312
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // Missing: qa, prd, architecture

### Ouro Bruto (primeiros 5000 chars)
```
// Wizard test - uses describeIntegration due to file dependencies
/**
 * Unit Tests: Config Validator
 * Story 1.8 - Task 1.8.2 (QA Fix - Coverage Improvement)
 */

const fs = require('fs');
const yaml = require('js-yaml');
const { validateConfigs } = require('../../../../packages/installer/src/wizard/validation/validators/config-validator');

// Mock dependencies
jest.mock('fs');
jest.mock('js-yaml');

describeIntegration('Config Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describeIntegration('validateConfigs', () => {
    it('should validate .env file successfully', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path === '.env') {
          return 'NODE_ENV=development\nAPP_NAME=AIOS\nAPI_KEY=test123\n';
        }
        if (path === '.gitignore') {
          return '.env\nnode_modules\n.env.local\n*.key\n*.pem\n.aios/install-log.txt\n';
        }
        if (path === '.aios-core/core-config.yaml') {
          return 'markdownExploder:\n  enabled: true\nqa: {}\nprd: {}\narchitecture: {}\n';
        }
        return '';
      });

      yaml.load.mockReturnValue({
        markdownExploder: {},
        qa: {},
        prd: {},
        architecture: {},
      });

      // When
      const result = await validateConfigs({
        coreConfig: '.aios-core/core-config.yaml',
      });

      // Then
      expect(result.success).toBe(true);
      const envCheck = result.checks.find(c => c.component === 'Environment Config');
      expect(envCheck).toBeDefined();
      expect(envCheck.status).toBe('success');
    });

    it('should detect missing .env file', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => path !== '.env');

      // When
      const result = await validateConfigs({});

      // Then
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'ENV_FILE_MISSING',
          }),
        ]),
      );
    });

    it('should detect missing required env variables', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path === '.env') {
          return '# Empty env file\n';
        }
        if (path === '.gitignore') {
          return '.env\nnode_modules\n';
        }
        return '';
      });

      yaml.load.mockReturnValue({});

      // When
      const result = await validateConfigs({});

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'ENV_VAR_MISSING',
          }),
        ]),
      );
    });

    it('should detect potential hardcoded credentials', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path === '.env') {
          return 'PASSWORD=hardcoded123\nAPI_KEY=abc123def456\n';
        }
        if (path === '.gitignore') {
          return '.env\nnode_modules\n';
        }
        return '';
      });

      yaml.load.mockReturnValue({});

      // When
      const result = await validateConfigs({});

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'POTENTIAL_HARDCODED_CREDENTIAL',
          }),
        ]),
      );
    });

    it('should validate core-config.yaml YAML syntax', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path === '.env') {
          return 'NODE_ENV=development\n';
        }
        if (path === '.aios-core/core-config.yaml') {
          return 'markdownExploder:\n  enabled: true\n';
        }
        if (path === '.gitignore') {
          return '.env\nnode_modules\n';
        }
        return '';
      });

      yaml.load.mockReturnValue({
        markdownExploder: { enabled: true },
        qa: {},
        prd: {},
        architecture: {},
      });

      // When
      const result = await validateConfigs({
        coreConfig: '.aios-core/core-config.yaml',
      });

      // Then
      const coreCheck = result.checks.find(c => c.component === 'Core Config');
      expect(coreCheck).toBeDefined();
      expect(coreCheck.status).toBe('success');
      expect(coreCheck.message).toContain('Valid YAML');
    });

    it('should detect missing core-config.yaml', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => {
        return path !== '.aios-core/core-config.yaml';
      });

      fs.readFileSync.mockImplementation((path) => {
        if (path === '.env') {
          return 'NODE_ENV=development\n';
        }
        if (path === '.gitignore') {
          return '.env\nnode_modules\n';
        }
        return '';
      });

      // When
 
```