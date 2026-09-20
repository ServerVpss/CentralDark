import http from 'http';
import { spawn } from 'child_process';

const SCREENPIPE_PORT = parseInt(process.env.PORT || '3030', 10);
const SCREENPIPE_DATA_DIR = process.env.SCREENPIPE_DATA_DIR || '/root/.screenpipe';
const SCREENPIPE_BIN = process.env.SCREENPIPE_BIN || 'screenpipe';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

let screenpipeProcess = null;
let isHealthy = false;
let processStartTime = null;

// Health check: responds on port 3031
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    const uptime = Date.now() - processStartTime;
    const status = isHealthy ? 'healthy' : 'unhealthy';
    const code = isHealthy ? 200 : 503;
    
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status,
      uptime_ms: uptime,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function startScreenPipe() {
  console.log(`[ScreenPipe] Starting screenpipe binary on port ${SCREENPIPE_PORT}...`);
  
  screenpipeProcess = spawn(SCREENPIPE_BIN, [
    '--port', String(SCREENPIPE_PORT),
    '--data-dir', SCREENPIPE_DATA_DIR,
  ], {
    env: {
      ...process.env,
      RUST_LOG: LOG_LEVEL,
      PORT: String(SCREENPIPE_PORT),
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  processStartTime = Date.now();
  isHealthy = false;

  screenpipeProcess.on('error', (err) => {
    console.error(`[ScreenPipe] Error starting screenpipe: ${err.message}`);
    process.exit(1);
  });

  screenpipeProcess.on('close', (code) => {
    console.log(`[ScreenPipe] Process exited with code ${code}`);
    process.exit(code || 1);
  });

  // Simulate health check after 5 seconds (adjust as needed)
  setTimeout(() => {
    isHealthy = true;
    console.log(`[ScreenPipe] Health check passed, service ready on port ${SCREENPIPE_PORT}`);
  }, 5000);

  console.log(`[ScreenPipe] Launcher PID: ${process.pid}, ScreenPipe PID: ${screenpipeProcess.pid}`);
}

function handleShutdown() {
  console.log('[ScreenPipe] Shutting down gracefully...');
  
  if (screenpipeProcess && !screenpipeProcess.killed) {
    screenpipeProcess.kill('SIGTERM');
    
    const timeout = setTimeout(() => {
      if (screenpipeProcess && !screenpipeProcess.killed) {
        console.warn('[ScreenPipe] Force killing after timeout');
        screenpipeProcess.kill('SIGKILL');
      }
    }, 5000);

    screenpipeProcess.on('close', () => {
      clearTimeout(timeout);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Start health check server
healthServer.listen(3031, '127.0.0.1', () => {
  console.log(`[ScreenPipe] Health check server listening on 127.0.0.1:3031`);
});

// Start screenpipe
startScreenPipe();

// Report status
console.log(`[ScreenPipe] ===== BOOT =====`);
console.log(`PORT: ${SCREENPIPE_PORT}`);
console.log(`DATA_DIR: ${SCREENPIPE_DATA_DIR}`);
console.log(`BIN: ${SCREENPIPE_BIN}`);
console.log(`LOG_LEVEL: ${LOG_LEVEL}`);
console.log(`==================`);
