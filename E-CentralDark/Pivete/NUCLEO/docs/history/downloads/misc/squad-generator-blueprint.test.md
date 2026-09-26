# OUTRO - squad-generator-blueprint.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-generator-blueprint.test.js
**SHA:** b16a6d3f95929252
**Timestamp:** 2026-08-28T02:19:50.256893
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadGenerator Blueprint Methods
 *
 * Test Coverage:
 * - loadBlueprint() reads and parses YAML
 * - validateBlueprint() validates against schema
 * - blueprintToConfig() converts blueprint to config
 * - generateFromBlueprint() creates squad from blueprint
 * - generateAgentFromBlueprint() creates agent markdown
 * - generateTaskFromBlueprint() creates task markdown
 * - updateSquadYamlComponents() updates manifest
 *
 * @see Story SQS-9: Squad Designer
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const yaml = require('js-yaml');
const {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
} = require('../../../.aios-core/development/scripts/squad');

describe('SquadGenerator Blueprint Methods', () => {
  let generator;
  let tempDir;

  const validBlueprint = {
    squad: {
      name: 'test-squad',
      description: 'Test squad from blueprint',
      domain: 'test-domain',
    },
    analysis: {
      entities: ['Order', 'Customer'],
      workflows: ['create-order', 'update-order'],
      integrations: ['Stripe API'],
      stakeholders: ['Admin', 'User'],
    },
    recommendations: {
      agents: [
        {
          id: 'order-manager',
          role: 'Manages order lifecycle',
          commands: ['create-order', 'update-order'],
          confidence: 0.92,
          user_added: false,
          user_modified: false,
        },
      ],
      tasks: [
        {
          name: 'create-order',
          agent: 'order-manager',
          entrada: ['customer_id', 'items'],
          saida: ['order_id', 'status'],
          confidence: 0.88,
        },
      ],
      template: 'basic',
      config_mode: 'extend',
    },
    metadata: {
      created_at: '2025-12-18T00:00:00.000Z',
      source_docs: ['./docs/prd.md'],
      user_adjustments: 0,
      overall_confidence: 0.87,
    },
  };

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-blueprint-test-'));
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    generator = new SquadGenerator({
      squadsPath: tempDir,
    });
  });

  afterEach(async () => {
    try {
      const entries = await fs.readdir(tempDir);
      for (const entry of entries) {
        await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('loadBlueprint()', () => {
    it('should load and parse valid YAML blueprint', async () => {
      const blueprintPath = path.join(tempDir, 'test-blueprint.yaml');
      await fs.writeFile(blueprintPath, yaml.dump(validBlueprint));

      const loaded = await generator.loadBlueprint(blueprintPath);

      expect(loaded.squad.name).toBe('test-squad');
      expect(loaded.recommendations.agents.length).toBe(1);
    });

    it('should throw error when file not found', async () => {
      await expect(generator.loadBlueprint('/nonexistent/blueprint.yaml')).rejects.toThrow(
        SquadGeneratorError,
      );

      try {
        await generator.loadBlueprint('/nonexistent/blueprint.yaml');
      } catch (error) {
        expect(error.code).toBe(GeneratorErrorCodes.BLUEPRINT_NOT_FOUND);
      }
    });

    it('should throw error on invalid YAML', async () => {
      const blueprintPath = path.join(tempDir, 'invalid.yaml');
      await fs.writeFile(blueprintPath, 'invalid: yaml: content: :::');

      await expect(generator.loadBlueprint(blueprintPath)).rejects.toThrow(SquadGeneratorError);

      try {
        await generator.loadBlueprint(blueprintPath);
      } catch (error) {
        expect(error.code).toBe(GeneratorErrorCodes.BLUEPRINT_PARSE_ERROR);
      }
    });
  });

  describe('validateBlueprint()', () => {
    it('should validate correct blueprint', async () => {
      const result = await generator.validateBlueprint(validBlueprint);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing squad field', async () => {
      const invalid = { ...validBlueprint };
      delete invalid.squad;

      const result = await generator.validateBlueprint(invalid);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: squad');
    });

    it('should reject missing squad.name', async () => {
      const invalid = {
        ...validBlueprint,
        squad: { domain: 'test-domain' },
      };

      const result = await generator.validateBlueprint(invalid);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: squad.name');
    });

    it('should reject invalid squad name format', async () => {
      const invalid = {
        ...validBlueprint,
        squad: { name: 'InvalidName', domain: 'test' },
      };

      const res
```