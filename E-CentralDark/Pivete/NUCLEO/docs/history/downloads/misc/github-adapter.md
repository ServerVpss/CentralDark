# OUTRO - github-adapter.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\integrations\pm-adapters\github-adapter.js
**SHA:** c48a24315629cbb1
**Timestamp:** 2026-08-28T02:02:12.236239
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- error: 'GitHub CLI not authenticated. Run: gh auth login',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview GitHub Projects v2 Adapter
 *
 * Integrates with GitHub Projects for story management.
 * Uses GitHub CLI (gh) for authentication and GitHub GraphQL API v2.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.3)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const { PMAdapter } = require('../../scripts/pm-adapter');

/**
 * GitHub Projects adapter - integrates with GitHub Projects v2
 *
 * Authenticates via GitHub CLI (gh auth). Requires gh CLI to be installed
 * and authenticated before use.
 */
class GitHubProjectsAdapter extends PMAdapter {
  /**
   * Create GitHub Projects adapter instance
   * @param {object} config - GitHub Projects configuration
   * @param {string} config.org - GitHub organization or username
   * @param {number} config.project_number - Project number in the organization
   */
  constructor(config) {
    super(config);

    if (!config || !config.org || !config.project_number) {
      throw new Error('GitHub Projects config requires: org, project_number');
    }

    this.org = config.org;
    this.projectNumber = config.project_number;
    this.projectId = null;  // Will be fetched lazily
  }

  /**
   * Sync local story to GitHub Projects
   *
   * Creates or updates a GitHub issue linked to the project.
   *
   * @param {string} storyPath - Path to story YAML file
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async syncStory(storyPath) {
    try {
      // Read story file
      if (!fs.existsSync(storyPath)) {
        return {
          success: false,
          error: `Story file not found: ${storyPath}`,
        };
      }

      const storyContent = fs.readFileSync(storyPath, 'utf8');
      const story = yaml.load(storyContent);

      if (!story || !story.id) {
        return {
          success: false,
          error: 'Invalid story file: missing id field',
        };
      }

      console.log(`📤 Syncing story ${story.id} to GitHub Projects...`);

      // Find existing issue by story ID label
      const issueNumber = await this._findIssueByStoryId(story.id);

      if (issueNumber) {
        // Update existing issue
        await this._updateIssue(issueNumber, story, storyContent);
        const issueUrl = `https://github.com/${this.org}/issues/${issueNumber}`;

        console.log(`✅ Story ${story.id} updated in GitHub Projects`);

        return {
          success: true,
          url: issueUrl,
        };
      } else {
        // Create new issue
        const newIssueUrl = await this._createIssue(story, storyContent);

        console.log(`✅ Story ${story.id} created in GitHub Projects`);

        return {
          success: true,
          url: newIssueUrl,
        };
      }

    } catch (error) {
      console.error('❌ Error syncing story to GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull story updates from GitHub Projects
   *
   * NOTE: Currently limited - GitHub Projects doesn't store full story content.
   * Can only pull status changes.
   *
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   */
  async pullStory(storyId) {
    try {
      console.log(`📥 Pulling story ${storyId} from GitHub Projects...`);

      const issueNumber = await this._findIssueByStoryId(storyId);

      if (!issueNumber) {
        return {
          success: false,
          error: `GitHub issue not found for story ${storyId}`,
        };
      }

      // Get issue status
      const issueData = await this._getIssue(issueNumber);

      // Map GitHub issue state to AIOS status
      const statusMapping = {
        'open': 'InProgress',
        'closed': 'Done',
      };

      const mappedStatus = statusMapping[issueData.state] || 'Draft';

      console.log(`✅ Story ${storyId} status in GitHub: ${mappedStatus}`);

      return {
        success: true,
        updates: {
          status: mappedStatus,
        },
      };

    } catch (error) {
      console.error('❌ Error pulling story from GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create new story in GitHub Projects
   *
   * @param {object} storyData - Story metadata
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createStory(storyData) {
    try {
      console.log(`📝 Creating story ${storyData.id} in GitHub Projects...`);

      const issueUrl = await this._createIssue(storyData, '');

      console.log(`✅ Story ${storyData.id} created in GitHub Projects`);

      return {
        success: true,
        url: issueUrl,
      };

    } catch (error) {
      console.error('❌ Error creating story in GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }


```