# COMANDO - l3-workflow.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\l3-workflow.test.js
**SHA:** 6172a20a6550ebc8
**Timestamp:** 2026-08-28T02:19:43.253823
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * L3 Workflow Processor Tests
 *
 * Tests for workflow detection, trigger matching, phase metadata,
 * graceful degradation, and session state handling.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aios-core/core/synapse/layers/layer-processor');
const L3WorkflowProcessor = require('../../.aios-core/core/synapse/layers/l3-workflow');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l3-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L3WorkflowProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L3WorkflowProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to workflow', () => {
      expect(processor.name).toBe('workflow');
    });

    test('should set layer to 3', () => {
      expect(processor.layer).toBe(3);
    });

    test('should set timeout to 15ms', () => {
      expect(processor.timeout).toBe(15);
    });
  });

  describe('process()', () => {
    test('should load workflow-specific rules when workflow is active', () => {
      fs.writeFileSync(path.join(tempDir, 'workflow-sdc'), [
        'SDC_RULE_1=Follow story development cycle',
        'SDC_RULE_2=Update checkboxes as tasks complete',
        'SDC_RULE_3=Run tests before marking complete',
      ].join('\n'));

      const context = {
        prompt: '',
        session: {
          active_workflow: {
            id: 'sdc',
            instance_id: 'sdc-123',
            current_step: 3,
            current_phase: 'implementation',
            started_at: '2026-02-11',
          },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              SDC_WORKFLOW: {
                state: 'active',
                workflowTrigger: 'sdc',
                file: 'workflow-sdc',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.metadata.layer).toBe(3);
      expect(result.metadata.source).toBe('workflow-sdc');
      expect(result.metadata.workflow).toBe('sdc');
      expect(result.metadata.phase).toBe('implementation');
    });

    test('should return null when no workflow is active', () => {
      const context = {
        prompt: '',
        session: { active_workflow: null },
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when session has no active_workflow', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when no matching workflowTrigger in manifest', () => {
      const context = {
        prompt: '',
        session: {
          active_workflow: { id: 'unknown-workflow' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              SDC: { workflowTrigger: 'sdc', file: 'workflow-sdc' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when domain file is missing', () => {
      const context = {
        prompt: '',
        session: {
          active_workflow: { id: 'sdc' },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              SDC: { workflowTrigger: 'sdc', file: 'nonexistent' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should include phase metadata from session', () => {
      fs.writeFileSync(path.join(tempDir, 'workflow-qa'), 'QA_RULE=Run quality gate\n');

      const context = {
        prompt: '',
        session: {
          active_workflow: {
            id: 'qa',
            current_phase: 'review',
            current_step: 1,
          },
        },
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              QA_WF: { workflowTrigger: 'qa', file: 
```