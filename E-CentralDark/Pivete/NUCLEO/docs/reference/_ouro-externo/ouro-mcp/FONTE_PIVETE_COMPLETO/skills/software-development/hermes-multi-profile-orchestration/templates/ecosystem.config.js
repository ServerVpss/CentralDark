// ecosystem.config.js — PM2 configuration for multi-profile Hermes
// Place at: /root/CentralDark/ecosystem.config.js
// Usage: pm2 start /root/CentralDark/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'hermes-default',
      script: 'hermes',
      args: '--profile default',
      interpreter: 'bash',
      interpreter_args: '-c',
      env: {
        HERMES_HOME: '/root/.hermes',
        // Add any profile-specific env vars here
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/CentralDark/logs/hermes-default-error.log',
      out_file: '/root/CentralDark/logs/hermes-default-out.log',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: 'hermes-pivete',
      script: 'hermes',
      args: '--profile pivete',
      interpreter: 'bash',
      interpreter_args: '-c',
      env: {
        HERMES_HOME: '/root/.hermes',
        // Profile-specific: e.g., different model, tools, etc.
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/CentralDark/logs/hermes-pivete-error.log',
      out_file: '/root/CentralDark/logs/hermes-pivete-out.log',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: 'hermes-sol',
      script: 'hermes',
      args: '--profile sol',
      interpreter: 'bash',
      interpreter_args: '-c',
      env: {
        HERMES_HOME: '/root/.hermes',
        // Profile-specific env vars
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/CentralDark/logs/hermes-sol-error.log',
      out_file: '/root/CentralDark/logs/hermes-sol-out.log',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

// Deploy notes:
// 1. Ensure log directory exists: mkdir -p /root/CentralDark/logs
// 2. Start all: pm2 start /root/CentralDark/ecosystem.config.js
// 3. Save for reboot persistence: pm2 save (CRITICAL per CLAUDE.md)
// 4. View logs: pm2 logs hermes-pivete
// 5. Switch profile: pm2 restart hermes-pivete && pm2 stop hermes-default hermes-sol