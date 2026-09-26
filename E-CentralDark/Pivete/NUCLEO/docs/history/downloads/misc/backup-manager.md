# OUTRO - backup-manager.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\backup-manager.js
**SHA:** 4784782f5856bab5
**Timestamp:** 2026-08-28T02:02:03.672377
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { targetPath = this.rootPath, dryRun = false } = options;

### Gaps
- throw new Error(`Backup file missing: ${backupPath}`);

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const tar = require('tar');
const { promisify } = require('util');
const zlib = require('zlib');
const _gzip = promisify(zlib.gzip);
const _gunzip = promisify(zlib.gunzip);

/**
 * Manages backups for safe self-modification rollback
 */
class BackupManager {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.backupDir = path.join(this.rootPath, '.aios', 'backup');
    this.maxBackups = options.maxBackups || 10;
    this.compressionLevel = options.compressionLevel || 6;
    
    // Active backup tracking
    this.activeBackup = null;
    
    // Backup metadata
    this.metadataFile = path.join(this.backupDir, 'backup-metadata.json');
  }

  /**
   * Initialize backup system
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Initialize metadata if not exists
      try {
        await fs.access(this.metadataFile);
      } catch {
        await this.saveMetadata({
          version: '1.0.0',
          backups: [],
          statistics: {
            total_backups: 0,
            successful_restores: 0,
            failed_restores: 0,
            total_size: 0
          }
        });
      }
    } catch (error) {
      console.error(chalk.red(`Failed to initialize backup system: ${error.message}`));
    }
  }

  /**
   * Create full backup of specified files
   * @param {Object} params - Backup parameters
   * @returns {Promise<string>} Backup ID
   */
  async createFullBackup(params) {
    const { files, metadata = {} } = params;
    
    await this.initialize();
    
    console.log(chalk.blue('📦 Creating backup...'));
    
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    const backupInfo = {
      id: backupId,
      timestamp: new Date().toISOString(),
      files: files.map(f => path.relative(this.rootPath, f)),
      metadata,
      size: 0,
      checksums: {},
      compressed: true,
      status: 'creating'
    };

    try {
      // Create temporary directory for backup files
      const tempDir = path.join(this.backupDir, `temp-${backupId}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Copy files to temp directory maintaining structure
      for (const file of files) {
        const relPath = path.relative(this.rootPath, file);
        const tempPath = path.join(tempDir, relPath);
        
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        
        try {
          await fs.copyFile(file, tempPath);
          
          // Calculate checksum
          const content = await fs.readFile(file);
          const checksum = crypto.createHash('sha256').update(content).digest('hex');
          backupInfo.checksums[relPath] = checksum;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not backup ${file}: ${error.message}`));
        }
      }

      // Create backup manifest
      await fs.writeFile(
        path.join(tempDir, 'backup-manifest.json'),
        JSON.stringify(backupInfo, null, 2)
      );

      // Create tar archive
      await tar.create(
        {
          gzip: { level: this.compressionLevel },
          file: backupPath,
          cwd: tempDir
        },
        ['.']
      );

      // Get backup size
      const stats = await fs.stat(backupPath);
      backupInfo.size = stats.size;
      backupInfo.status = 'completed';

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      // Update metadata
      await this.addBackupToMetadata(backupInfo);
      
      // Set as active backup
      this.activeBackup = backupId;
      
      // Clean old backups
      await this.cleanOldBackups();

      console.log(chalk.green(`✅ Backup created: ${backupId}`));
      console.log(chalk.gray(`   Files: ${files.length}, Size: ${this.formatSize(backupInfo.size)}`));

      return backupId;

    } catch (error) {
      // Clean up on failure
      try {
        await fs.unlink(backupPath);
      } catch {}
      
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  /**
   * Restore backup
   * @param {string} backupId - Backup ID to restore
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreBackup(backupId, options = {}) {
    const { targetPath = this.rootPath, dryRun = false } = options;
    
    console.log(chalk.blue(`🔄 Restoring backup: ${backupId}`));
    
    const result = {
      success: true,
      backupId,
      restored_files: [],
      failed_files: [],
      warnings: []
    };

    try {
      // Load backup metadata
      const metadata = await this.loadMetadata();
      const backupInfo = metadata.backups.find(b => b.id === backupId);
      
      
```

---

# OUTRO - backup-manager.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\backup-manager.js
**SHA:** 88e01594b18c8c8d
**Timestamp:** 2026-08-28T02:02:12.476852
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { targetPath = this.rootPath, dryRun = false } = options;

### Gaps
- throw new Error(`Backup file missing: ${backupPath}`);

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const tar = require('tar');
const { promisify } = require('util');
const zlib = require('zlib');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Manages backups for safe self-modification rollback
 */
class BackupManager {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.backupDir = path.join(this.rootPath, '.aios', 'backup');
    this.maxBackups = options.maxBackups || 10;
    this.compressionLevel = options.compressionLevel || 6;
    
    // Active backup tracking
    this.activeBackup = null;
    
    // Backup metadata
    this.metadataFile = path.join(this.backupDir, 'backup-metadata.json');
  }

  /**
   * Initialize backup system
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Initialize metadata if not exists
      try {
        await fs.access(this.metadataFile);
      } catch {
        await this.saveMetadata({
          version: '1.0.0',
          backups: [],
          statistics: {
            total_backups: 0,
            successful_restores: 0,
            failed_restores: 0,
            total_size: 0,
          },
        });
      }
    } catch (error) {
      console.error(chalk.red(`Failed to initialize backup system: ${error.message}`));
    }
  }

  /**
   * Create full backup of specified files
   * @param {Object} params - Backup parameters
   * @returns {Promise<string>} Backup ID
   */
  async createFullBackup(params) {
    const { files, metadata = {} } = params;
    
    await this.initialize();
    
    console.log(chalk.blue('📦 Creating backup...'));
    
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    const backupInfo = {
      id: backupId,
      timestamp: new Date().toISOString(),
      files: files.map(f => path.relative(this.rootPath, f)),
      metadata,
      size: 0,
      checksums: {},
      compressed: true,
      status: 'creating',
    };

    try {
      // Create temporary directory for backup files
      const tempDir = path.join(this.backupDir, `temp-${backupId}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Copy files to temp directory maintaining structure
      for (const file of files) {
        const relPath = path.relative(this.rootPath, file);
        const tempPath = path.join(tempDir, relPath);
        
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        
        try {
          await fs.copyFile(file, tempPath);
          
          // Calculate checksum
          const content = await fs.readFile(file);
          const checksum = crypto.createHash('sha256').update(content).digest('hex');
          backupInfo.checksums[relPath] = checksum;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not backup ${file}: ${error.message}`));
        }
      }

      // Create backup manifest
      await fs.writeFile(
        path.join(tempDir, 'backup-manifest.json'),
        JSON.stringify(backupInfo, null, 2),
      );

      // Create tar archive
      await tar.create(
        {
          gzip: { level: this.compressionLevel },
          file: backupPath,
          cwd: tempDir,
        },
        ['.'],
      );

      // Get backup size
      const stats = await fs.stat(backupPath);
      backupInfo.size = stats.size;
      backupInfo.status = 'completed';

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      // Update metadata
      await this.addBackupToMetadata(backupInfo);
      
      // Set as active backup
      this.activeBackup = backupId;
      
      // Clean old backups
      await this.cleanOldBackups();

      console.log(chalk.green(`✅ Backup created: ${backupId}`));
      console.log(chalk.gray(`   Files: ${files.length}, Size: ${this.formatSize(backupInfo.size)}`));

      return backupId;

    } catch (error) {
      // Clean up on failure
      try {
        await fs.unlink(backupPath);
      } catch {}
      
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  /**
   * Restore backup
   * @param {string} backupId - Backup ID to restore
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreBackup(backupId, options = {}) {
    const { targetPath = this.rootPath, dryRun = false } = options;
    
    console.log(chalk.blue(`🔄 Restoring backup: ${backupId}`));
    
    const result = {
      success: true,
      backupId,
      restored_files: [],
      failed_files: [],
      warnings: [],
    };

    try {
      // Load backup metadata
      const metadata = await this.loadMetadata();
      const backupInfo = metadata.backups.find(b => b.id === backupId);
      
    
```