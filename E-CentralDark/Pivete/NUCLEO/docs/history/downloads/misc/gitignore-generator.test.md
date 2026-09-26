# OUTRO - gitignore-generator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\documentation-integrity\gitignore-generator.test.js
**SHA:** 9fbaa9e8cf10cda1
**Timestamp:** 2026-08-28T02:19:49.849135
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const result = generateGitignoreFile(tempDir, markers, { dryRun: true });
- const result = generateGitignoreFile(tempDir, markers, { dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Gitignore Generator Unit Tests
 *
 * @module tests/unit/documentation-integrity/gitignore-generator
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  loadGitignoreTemplate,
  detectTechStacks,
  getTemplatesForStacks,
  generateGitignore,
  mergeGitignore,
  generateGitignoreFile,
  hasAiosIntegration,
  parseGitignore,
  GitignoreTemplates,
  TechStack,
} = require('../../../.aios-core/infrastructure/scripts/documentation-integrity/gitignore-generator');

describe('Gitignore Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-gitignore-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('loadGitignoreTemplate', () => {
    it('should load AIOS base template', () => {
      const template = loadGitignoreTemplate(GitignoreTemplates.AIOS_BASE);

      expect(template).toContain('.aios-core/local/');
      expect(template).toContain('.env');
    });

    it('should load Node.js template', () => {
      const template = loadGitignoreTemplate(GitignoreTemplates.NODE);

      expect(template).toContain('node_modules/');
      expect(template).toContain('dist/');
    });

    it('should load Python template', () => {
      const template = loadGitignoreTemplate(GitignoreTemplates.PYTHON);

      expect(template).toContain('__pycache__/');
      expect(template).toContain('.venv');
    });

    it('should load brownfield merge template', () => {
      const template = loadGitignoreTemplate(GitignoreTemplates.BROWNFIELD_MERGE);

      expect(template).toContain('AIOS Integration Section');
    });

    it('should throw for non-existent template', () => {
      expect(() => loadGitignoreTemplate('non-existent.tmpl')).toThrow('template not found');
    });
  });

  describe('detectTechStacks', () => {
    it('should detect Node.js project', () => {
      const markers = { hasPackageJson: true };
      const stacks = detectTechStacks(markers);

      expect(stacks).toContain(TechStack.NODE);
    });

    it('should detect Python project', () => {
      const markers = { hasPythonProject: true };
      const stacks = detectTechStacks(markers);

      expect(stacks).toContain(TechStack.PYTHON);
    });

    it('should detect Go project', () => {
      const markers = { hasGoMod: true };
      const stacks = detectTechStacks(markers);

      expect(stacks).toContain(TechStack.GO);
    });

    it('should detect Rust project', () => {
      const markers = { hasCargoToml: true };
      const stacks = detectTechStacks(markers);

      expect(stacks).toContain(TechStack.RUST);
    });

    it('should detect multiple stacks', () => {
      const markers = {
        hasPackageJson: true,
        hasPythonProject: true,
      };
      const stacks = detectTechStacks(markers);

      expect(stacks).toContain(TechStack.NODE);
      expect(stacks).toContain(TechStack.PYTHON);
    });

    it('should return empty array for no markers', () => {
      const stacks = detectTechStacks({});

      expect(stacks).toHaveLength(0);
    });
  });

  describe('getTemplatesForStacks', () => {
    it('should always include AIOS base', () => {
      const templates = getTemplatesForStacks([]);

      expect(templates).toContain(GitignoreTemplates.AIOS_BASE);
    });

    it('should include Node.js template', () => {
      const templates = getTemplatesForStacks([TechStack.NODE]);

      expect(templates).toContain(GitignoreTemplates.AIOS_BASE);
      expect(templates).toContain(GitignoreTemplates.NODE);
    });

    it('should include Python template', () => {
      const templates = getTemplatesForStacks([TechStack.PYTHON]);

      expect(templates).toContain(GitignoreTemplates.AIOS_BASE);
      expect(templates).toContain(GitignoreTemplates.PYTHON);
    });

    it('should include multiple templates for multi-stack', () => {
      const templates = getTemplatesForStacks([TechStack.NODE, TechStack.PYTHON]);

      expect(templates).toContain(GitignoreTemplates.AIOS_BASE);
      expect(templates).toContain(GitignoreTemplates.NODE);
      expect(templates).toContain(GitignoreTemplates.PYTHON);
    });
  });

  describe('generateGitignore', () => {
    it('should generate gitignore for Node.js project', () => {
      const markers = { hasPackageJson: true };
      const content = generateGitignore(markers, { projectName: 'test-app' });

      expect(content).toContain('test-app');
      expect(content).toContain('node_modules/');
      expect(content).toContain('.aios-core/local/');
    });

    it('should generate gitignore for Python project', () => {
      const markers = { hasPythonProject: true };
      const content = generateGitignore(markers);

      expect(content).toContain('__pycache__/');
      expect(content).toContain('.aios-core/local/');
    });

    it('should include generation date', () => {
     
```