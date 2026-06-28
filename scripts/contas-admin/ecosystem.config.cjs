module.exports = { apps: [{
  name: 'contas-admin',
  cwd: '/root/CentralDark/scripts/contas-admin',
  script: 'venv/bin/uvicorn',
  args: 'main:app --host 127.0.0.1 --port 9400',
  interpreter: 'none',
  env_file: '/root/CentralDark/scripts/contas-admin/.env',
  autorestart: true, max_memory_restart: '400M',
  out_file: '/var/log/contas-admin.out.log',
  error_file: '/var/log/contas-admin.err.log'
}]};
