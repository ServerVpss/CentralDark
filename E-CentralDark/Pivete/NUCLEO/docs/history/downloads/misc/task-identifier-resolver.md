# OUTRO - task-identifier-resolver.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\task-identifier-resolver.js
**SHA:** ef63e5302a7393d4
**Timestamp:** 2026-08-28T02:02:04.010661
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const TODO_PATTERN = /task: \{TODO: task identifier\}/g;

### Gaps
- * Purpose: Resolve {TODO: task identifier} placeholders in all 114 task files
- const TODO_PATTERN = /task: \{TODO: task identifier\}/g;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Task Identifier Resolver
 * Story: 6.1.7.1 - Task Content Completion
 * Purpose: Resolve {TODO: task identifier} placeholders in all 114 task files
 * 
 * Converts filenames to camelCase format (e.g., dev-develop-story.md → devDevelopStory())
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(__dirname, '../tasks');
const TODO_PATTERN = /task: \{TODO: task identifier\}/g;
const BACKUP_SUFFIX = '.pre-task-id-fix';

// Utility: Convert kebab-case filename to camelCase function name
function filenameToCamelCase(filename) {
  // Remove .md extension
  const nameWithoutExt = filename.replace('.md', '');
  
  // Split by hyphen and convert to camelCase
  const parts = nameWithoutExt.split('-');
  const camelCase = parts
    .map((part, index) => {
      if (index === 0) return part; // First part stays lowercase
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
  
  return `${camelCase}()`;
}

// Utility: Create backup of file
function createBackup(filePath) {
  const backupPath = filePath + BACKUP_SUFFIX;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Main: Process single task file
function processTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  
  // Skip backup files
  if (filename.includes('backup') || filename.includes('.legacy')) {
    return { skipped: true, reason: 'backup/legacy file' };
  }
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if TODO exists
  if (!TODO_PATTERN.test(content)) {
    return { skipped: true, reason: 'no TODO placeholder found' };
  }
  
  // Generate camelCase identifier
  const taskIdentifier = filenameToCamelCase(filename);
  
  // Create backup
  createBackup(filePath);
  
  // Replace TODO with actual identifier
  const updatedContent = content.replace(
    TODO_PATTERN,
    `task: ${taskIdentifier}`,
  );
  
  // Write updated content
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  return {
    processed: true,
    filename,
    identifier: taskIdentifier,
  };
}

// Main: Process all task files
function main() {
  console.log('🚀 Task Identifier Resolver\n');
  console.log(`📂 Processing tasks in: ${TASKS_DIR}\n`);
  
  // Get all .md files
  const files = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();
  
  console.log(`📝 Found ${files.length} task files\n`);
  
  const results = {
    processed: [],
    skipped: [],
    errors: [],
  };
  
  // Process each file
  files.forEach(filename => {
    try {
      const result = processTaskFile(filename);
      
      if (result.processed) {
        results.processed.push(result);
        console.log(`✅ ${result.filename} → ${result.identifier}`);
      } else if (result.skipped) {
        results.skipped.push({ filename, reason: result.reason });
      }
    } catch (error) {
      results.errors.push({ filename, error: error.message });
      console.error(`❌ ${filename}: ${error.message}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Processed: ${results.processed.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  console.log('='.repeat(60) + '\n');
  
  // Save report
  const reportPath = path.join(__dirname, '../../.ai/task-1.1-identifier-resolution-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  try {
    const results = main();
    process.exit(results.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

module.exports = { filenameToCamelCase, processTaskFile };


```