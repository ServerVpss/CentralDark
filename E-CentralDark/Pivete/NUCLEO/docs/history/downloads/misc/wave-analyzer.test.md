# OUTRO - wave-analyzer.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\__tests__\wave-analyzer.test.js
**SHA:** 617a099d4be72f87
**Timestamp:** 2026-08-28T02:02:24.114791
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Unit tests for WaveAnalyzer
 * @story WIS-4 - Wave Analysis Engine
 */

'use strict';

const {
  WaveAnalyzer,
  CircularDependencyError,
  createWaveAnalyzer,
  analyzeWaves,
  DEFAULT_TASK_DURATIONS,
} = require('../engine/wave-analyzer');

describe('WaveAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new WaveAnalyzer();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const instance = new WaveAnalyzer();
      expect(instance.taskDurations).toEqual(DEFAULT_TASK_DURATIONS);
    });

    it('should accept custom task durations', () => {
      const customDurations = { 'custom-task': 25 };
      const instance = new WaveAnalyzer({ taskDurations: customDurations });
      expect(instance.taskDurations['custom-task']).toBe(25);
      expect(instance.taskDurations['default']).toBe(DEFAULT_TASK_DURATIONS.default);
    });

    it('should accept custom registry', () => {
      const mockRegistry = { getWorkflow: jest.fn() };
      const instance = new WaveAnalyzer({ registry: mockRegistry });
      expect(instance.registry).toBe(mockRegistry);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build graph from tasks with dependencies', () => {
      const tasks = [
        { id: 'task-a', dependsOn: [] },
        { id: 'task-b', dependsOn: [] },
        { id: 'task-c', dependsOn: ['task-a', 'task-b'] },
        { id: 'task-d', dependsOn: ['task-c'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(4);
      expect(graph.nodes.has('task-a')).toBe(true);
      expect(graph.nodes.has('task-b')).toBe(true);
      expect(graph.nodes.has('task-c')).toBe(true);
      expect(graph.nodes.has('task-d')).toBe(true);

      // Check edges (a -> c, b -> c, c -> d)
      expect(graph.edges.get('task-a').has('task-c')).toBe(true);
      expect(graph.edges.get('task-b').has('task-c')).toBe(true);
      expect(graph.edges.get('task-c').has('task-d')).toBe(true);

      // Check in-edges
      expect(graph.inEdges.get('task-a').size).toBe(0);
      expect(graph.inEdges.get('task-b').size).toBe(0);
      expect(graph.inEdges.get('task-c').size).toBe(2);
      expect(graph.inEdges.get('task-d').size).toBe(1);
    });

    it('should handle tasks without dependencies', () => {
      const tasks = [{ id: 'task-a' }, { id: 'task-b' }, { id: 'task-c' }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges.get('task-a').size).toBe(0);
      expect(graph.edges.get('task-b').size).toBe(0);
      expect(graph.edges.get('task-c').size).toBe(0);
    });

    it('should use task name if id is missing', () => {
      const tasks = [{ name: 'task-a' }, { name: 'task-b', dependsOn: ['task-a'] }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.has('task-a')).toBe(true);
      expect(graph.nodes.has('task-b')).toBe(true);
      expect(graph.edges.get('task-a').has('task-b')).toBe(true);
    });

    it('should ignore dependencies to non-existent nodes', () => {
      const tasks = [{ id: 'task-a', dependsOn: ['non-existent'] }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(1);
      expect(graph.inEdges.get('task-a').size).toBe(0);
    });
  });

  describe('findCycle', () => {
    it('should return null for acyclic graph', () => {
      const tasks = [
        { id: 'a', dependsOn: [] },
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['b'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).toBeNull();
    });

    it('should detect simple cycle', () => {
      const tasks = [
        { id: 'a', dependsOn: ['c'] },
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['b'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle.length).toBeGreaterThan(1);
    });

    it('should detect self-loop', () => {
      const tasks = [{ id: 'a', dependsOn: ['a'] }];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle).toContain('a');
    });

    it('should detect cycle in diamond pattern with back-edge', () => {
      const tasks = [
        { id: 'a', dependsOn: ['d'] }, // Creates cycle: a -> b -> d -> a
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['a'] },
        { id: 'd', dependsOn: ['b', 'c'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
    });
  });

  describe('analyzeWaves with customTasks', () => {
    it('should group indepe
```