# COMANDO - config-generator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\documentation-integrity\config-generator.test.js
**SHA:** 02a4dbe5b67f9c83
**Timestamp:** 2026-08-28T02:19:49.184043
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const result = generateConfig(tempDir, 'greenfield', context, { dryRun: true });
- const result = generateConfig(tempDir, 'greenfield', context, { dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Config Generator Unit Tests
 *
 * @module tests/unit/documentation-integrity/config-generator
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');

const {
  buildConfigContext,
  renderConfigTemplate,
  loadConfigTemplate,
  generateConfig,
  buildDeploymentConfig,
  getDefaultDeploymentConfig,
  ConfigTemplates,
  DeploymentWorkflow,
  DeploymentPlatform,
} = require('../../../.aios-core/infrastructure/scripts/documentation-integrity/config-generator');

describe('Config Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-configgen-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('buildConfigContext', () => {
    it('should build context for greenfield project', () => {
      const deploymentConfig = {
        workflow: DeploymentWorkflow.STAGING_FIRST,
        platform: DeploymentPlatform.RAILWAY,
      };

      const context = buildConfigContext('my-project', 'greenfield', deploymentConfig);

      expect(context.PROJECT_NAME).toBe('my-project');
      expect(context.DEPLOYMENT_WORKFLOW).toBe('staging-first');
      expect(context.DEPLOYMENT_PLATFORM).toBe('Railway');
      expect(context.STAGING_BRANCH).toBe('staging');
      expect(context.PRODUCTION_BRANCH).toBe('main');
    });

    it('should build context for direct-to-main workflow', () => {
      const deploymentConfig = {
        workflow: DeploymentWorkflow.DIRECT_TO_MAIN,
      };

      const context = buildConfigContext('solo-project', 'greenfield', deploymentConfig);

      expect(context.DEPLOYMENT_WORKFLOW).toBe('direct-to-main');
      expect(context.STAGING_BRANCH).toBe('null');
      // direct-to-main uses 'production' as symbolic target (resolved by deployment-config-loader)
      expect(context.DEFAULT_TARGET).toBe('production');
    });

    it('should include quality gates', () => {
      const deploymentConfig = {
        qualityGates: {
          lint: true,
          typecheck: false,
          tests: true,
          securityScan: true,
          minCoverage: 80,
        },
      };

      const context = buildConfigContext('test', 'greenfield', deploymentConfig);

      expect(context.QUALITY_LINT).toBe(true);
      expect(context.QUALITY_TYPECHECK).toBe(false);
      expect(context.QUALITY_TESTS).toBe(true);
      expect(context.QUALITY_SECURITY).toBe(true);
      expect(context.MIN_COVERAGE).toBe(80);
    });

    it('should include brownfield analysis results', () => {
      const analysisResults = {
        hasExistingStructure: true,
        hasExistingWorkflows: true,
        mergeStrategy: 'manual',
        techStack: ['Node.js', 'TypeScript'],
        eslintPath: '.eslintrc.js',
      };

      const context = buildConfigContext('existing-app', 'brownfield', {}, analysisResults);

      expect(context.HAS_EXISTING_STRUCTURE).toBe(true);
      expect(context.HAS_EXISTING_WORKFLOWS).toBe(true);
      expect(context.MERGE_STRATEGY).toBe('manual');
      expect(context.ESLINT_CONFIG_PATH).toBe('.eslintrc.js');
    });

    it('should include generation date', () => {
      const context = buildConfigContext('test', 'greenfield', {});
      const today = new Date().toISOString().split('T')[0];

      expect(context.GENERATED_DATE).toBe(today);
    });
  });

  describe('renderConfigTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'name: "{{PROJECT_NAME}}"';
      const context = { PROJECT_NAME: 'my-app' };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('name: "my-app"');
    });

    it('should handle boolean values', () => {
      const template = 'lint: {{QUALITY_LINT}}';
      const context = { QUALITY_LINT: true };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('lint: true');
    });

    it('should handle number values', () => {
      const template = 'coverage: {{MIN_COVERAGE}}';
      const context = { MIN_COVERAGE: 80 };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('coverage: 80');
    });

    it('should process each blocks', () => {
      const template = 'items:\n{{#each ITEMS}}  - "{{this}}"\n{{/each}}';
      const context = { ITEMS: ['a', 'b', 'c'] };

      const result = renderConfigTemplate(template, context);

      expect(result).toContain('- "a"');
      expect(result).toContain('- "b"');
      expect(result).toContain('- "c"');
    });

    it('should handle empty each blocks', () => {
      const template = 'items:\n{{#each ITEMS}}  - "{{this}}"\n{{/each}}';
      const context = { ITEMS: [] };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('items:\n');
    });
  });

  describe('loadConfigTemplate', () => {
    it('should load greenfie
```