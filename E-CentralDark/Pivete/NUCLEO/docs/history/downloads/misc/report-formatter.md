# OUTRO - report-formatter.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\synapse\diagnostics\report-formatter.js
**SHA:** 51104ac692618b9f
**Timestamp:** 2026-08-28T02:02:00.906036
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- * @returns {Array<{ severity: string, gap: string, recommendation: string }>}
- gap: `Hook: ${check.name} — ${check.detail}`,
- gap: `Session: ${field.field} — ${field.actual}`,
- gap: `Manifest: domain "${entry.domain}" file missing`,
- gap: `UAP Bridge: ${check.name} — ${check.detail}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Report Formatter — Generates structured markdown diagnostic report.
 *
 * Takes collector results and produces a human-readable report
 * with sections for each diagnostic area.
 *
 * @module core/synapse/diagnostics/report-formatter
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

/**
 * Format a complete diagnostic report from collector results.
 *
 * @param {object} data - Collected diagnostic data
 * @param {object} data.hook - Hook collector results
 * @param {object} data.session - Session collector results
 * @param {object} data.manifest - Manifest collector results
 * @param {object} data.pipeline - Pipeline collector results
 * @param {object} data.uap - UAP collector results
 * @returns {string} Formatted markdown report
 */
function formatReport(data) {
  if (!data || typeof data !== 'object') {
    return '# SYNAPSE Diagnostic Report\n**Error:** No diagnostic data provided.\n';
  }

  const lines = [];
  const timestamp = new Date().toISOString();

  // Header
  lines.push('# SYNAPSE Diagnostic Report');
  lines.push(`**Timestamp:** ${timestamp}`);

  if (data.pipeline) {
    const bracket = data.pipeline.bracket || 'UNKNOWN';
    const contextPercent = typeof data.pipeline.contextPercent === 'number'
      ? data.pipeline.contextPercent.toFixed(1)
      : '?';
    lines.push(`**Bracket:** ${bracket} (${contextPercent}% context remaining)`);
  }

  const agentId = _extractAgentId(data);
  if (agentId) {
    const quality = data.session?.raw?.bridgeData?.activation_quality || 'unknown';
    lines.push(`**Agent:** @${agentId} (activation_quality: ${quality})`);
  }

  lines.push('');

  // Section 1: Hook Status
  lines.push('## 1. Hook Status');
  if (data.hook && data.hook.checks) {
    lines.push('| Check | Status | Detail |');
    lines.push('|-------|--------|--------|');
    for (const check of data.hook.checks) {
      lines.push(`| ${check.name} | ${check.status} | ${check.detail} |`);
    }
  } else {
    lines.push('*No hook data collected*');
  }
  lines.push('');

  // Section 2: Session Status
  lines.push('## 2. Session Status');
  if (data.session && data.session.fields) {
    lines.push('| Field | Expected | Actual | Status |');
    lines.push('|-------|----------|--------|--------|');
    for (const field of data.session.fields) {
      lines.push(`| ${field.field} | ${field.expected} | ${field.actual} | ${field.status} |`);
    }
  } else {
    lines.push('*No session data collected*');
  }
  lines.push('');

  // Section 3: Manifest Integrity
  lines.push('## 3. Manifest Integrity');
  if (data.manifest && data.manifest.entries) {
    lines.push('| Domain | In Manifest | File Exists | Status |');
    lines.push('|--------|-------------|-------------|--------|');
    for (const entry of data.manifest.entries) {
      lines.push(`| ${entry.domain} | ${entry.inManifest} | ${entry.fileExists ? 'yes' : 'no'} | ${entry.status} |`);
    }

    if (data.manifest.orphanedFiles && data.manifest.orphanedFiles.length > 0) {
      lines.push('');
      lines.push(`**Orphaned files** (in .synapse/ but not in manifest): ${data.manifest.orphanedFiles.join(', ')}`);
    }
  } else {
    lines.push('*No manifest data collected*');
  }
  lines.push('');

  // Section 4: Pipeline Simulation
  lines.push(`## 4. Pipeline Simulation (${data.pipeline?.bracket || 'UNKNOWN'} bracket)`);
  if (data.pipeline && data.pipeline.layers) {
    lines.push('| Layer | Expected | Status |');
    lines.push('|-------|----------|--------|');
    for (const layer of data.pipeline.layers) {
      lines.push(`| ${layer.layer} | ${layer.expected} | ${layer.status} |`);
    }
  } else {
    lines.push('*No pipeline data collected*');
  }
  lines.push('');

  // Section 5: UAP Bridge
  lines.push('## 5. UAP Bridge');
  if (data.uap && data.uap.checks) {
    lines.push('| Check | Status | Detail |');
    lines.push('|-------|--------|--------|');
    for (const check of data.uap.checks) {
      lines.push(`| ${check.name} | ${check.status} | ${check.detail} |`);
    }
  } else {
    lines.push('*No UAP bridge data collected*');
  }
  lines.push('');

  // Section 6: Memory Bridge
  lines.push('## 6. Memory Bridge');
  lines.push('| Check | Status | Detail |');
  lines.push('|-------|--------|--------|');

  // Memory bridge is Pro-only, so always report current state
  lines.push('| Pro available | INFO | Check `pro/` submodule |');
  lines.push(`| Bracket requires hints | ${_bracketNeedsMemory(data.pipeline?.bracket) ? 'YES' : 'NO'} | ${data.pipeline?.bracket || 'UNKNOWN'} bracket |`);
  lines.push('');

  // Section 7: Gaps & Recommendations
  lines.push('## 7. Gaps & Recommendations');
  const gaps = _collectGaps(data);

  if (gaps.length === 0) {
    lines.push('| # | Severity | Gap | Recommendation |');
    lines.push('|---|----------|-----|----------------|');
    lines.push('| - | - | None found | Pipeline operating correctly |');
  } else {
    lines.push('| # | Severity | Gap | Recommendation 
```