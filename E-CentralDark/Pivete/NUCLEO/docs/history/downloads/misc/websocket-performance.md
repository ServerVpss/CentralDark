# OUTRO - websocket-performance.js
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\tests\websocket-performance.js
**SHA:** 88468ba20820ad14
**Timestamp:** 2026-08-23T14:15:54.213743
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const connectionStart = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * WebSocket Timeline Performance Test
 *
 * This test directly measures the WebSocket frame streaming performance
 * without needing the full UI. It connects to the screenpipe server
 * and measures how long it takes to receive frames.
 *
 * Prerequisites:
 * - screenpipe server running on localhost:3030
 * - Database populated with frames
 *
 * Run standalone:
 *   node e2e/tests/websocket-performance.js
 *
 * Or via test runner:
 *   bun test:e2e
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3030/stream/frames';
const TIMEOUT_MS = 60000; // 60 seconds - matches customer-reported hang time

class TimelinePerformanceTester {
    constructor() {
        this.metrics = {
            connectionTime: 0,
            firstFrameTime: 0,
            totalFrames: 0,
            totalBytes: 0,
            batchCount: 0,
            errors: [],
            timeToFrameCounts: {} // time -> frame count
        };
        this.startTime = null;
        this.firstFrameReceived = false;
    }

    async runTest() {
        console.log('\n=== WebSocket Timeline Performance Test ===\n');

        return new Promise((resolve, reject) => {
            const connectionStart = Date.now();

            const ws = new WebSocket(WS_URL);

            // Connection timeout
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error(`WebSocket connection timed out after ${TIMEOUT_MS}ms`));
            }, TIMEOUT_MS);

            ws.on('open', () => {
                this.metrics.connectionTime = Date.now() - connectionStart;
                console.log(`Connected in ${this.metrics.connectionTime}ms`);

                // Request frames for today
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);

                const request = {
                    start_time: startOfDay.toISOString(),
                    end_time: now.toISOString(),
                    order: 'descending'
                };

                console.log(`Requesting frames from ${request.start_time} to ${request.end_time}`);
                this.startTime = Date.now();

                ws.send(JSON.stringify(request));
            });

            ws.on('message', (data) => {
                const elapsed = Date.now() - this.startTime;
                const dataStr = data.toString();

                // Skip keep-alive messages
                if (dataStr === '"keep-alive-text"') {
                    console.log(`  [${elapsed}ms] Keep-alive received`);
                    return;
                }

                try {
                    const parsed = JSON.parse(dataStr);

                    // Handle error messages
                    if (parsed.error) {
                        this.metrics.errors.push(parsed.error);
                        console.log(`  [${elapsed}ms] ERROR: ${parsed.error}`);
                        return;
                    }

                    // Handle batched frames
                    if (Array.isArray(parsed)) {
                        const frameCount = parsed.length;
                        this.metrics.batchCount++;
                        this.metrics.totalFrames += frameCount;
                        this.metrics.totalBytes += dataStr.length;

                        if (!this.firstFrameReceived) {
                            this.firstFrameReceived = true;
                            this.metrics.firstFrameTime = elapsed;
                            console.log(`  [${elapsed}ms] FIRST FRAME RECEIVED! (batch of ${frameCount})`);
                        } else {
                            console.log(`  [${elapsed}ms] Batch ${this.metrics.batchCount}: +${frameCount} frames (total: ${this.metrics.totalFrames})`);
                        }

                        // Track frame count over time
                        const timeKey = Math.floor(elapsed / 1000) + 's';
                        this.metrics.timeToFrameCounts[timeKey] = this.metrics.totalFrames;
                    }
                } catch (e) {
                    console.log(`  [${elapsed}ms] Parse error: ${e.message}`);
                }
            });

            ws.on('close', () => {
                clearTimeout(timeout);
                this.printResults();
                resolve(this.metrics);
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                this.metrics.errors.push(error.message);
                reject(error);
            });

            // Auto-close after receiving frames for 30 seconds
            setTimeout(() => {
                if (this.metrics.totalFrames > 0) {
                    console.log('\n--- Test complete (30s elapsed) ---');
                    ws.close();
                }
            }, 30000);
        });
    }

    printResults() {
        const totalTime = Date.now() - this.startTime;

  
```

---

# OUTRO - websocket-performance.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\tests\websocket-performance.js
**SHA:** 88468ba20820ad14f39bf1821da9d2146f0230ac5df6840493406406aabe98c1
**Timestamp:** 2026-08-23T23:43:27.271980
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const connectionStart = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * WebSocket Timeline Performance Test
 *
 * This test directly measures the WebSocket frame streaming performance
 * without needing the full UI. It connects to the screenpipe server
 * and measures how long it takes to receive frames.
 *
 * Prerequisites:
 * - screenpipe server running on localhost:3030
 * - Database populated with frames
 *
 * Run standalone:
 *   node e2e/tests/websocket-performance.js
 *
 * Or via test runner:
 *   bun test:e2e
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3030/stream/frames';
const TIMEOUT_MS = 60000; // 60 seconds - matches customer-reported hang time

class TimelinePerformanceTester {
    constructor() {
        this.metrics = {
            connectionTime: 0,
            firstFrameTime: 0,
            totalFrames: 0,
            totalBytes: 0,
            batchCount: 0,
            errors: [],
            timeToFrameCounts: {} // time -> frame count
        };
        this.startTime = null;
        this.firstFrameReceived = false;
    }

    async runTest() {
        console.log('\n=== WebSocket Timeline Performance Test ===\n');

        return new Promise((resolve, reject) => {
            const connectionStart = Date.now();

            const ws = new WebSocket(WS_URL);

            // Connection timeout
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error(`WebSocket connection timed out after ${TIMEOUT_MS}ms`));
            }, TIMEOUT_MS);

            ws.on('open', () => {
                this.metrics.connectionTime = Date.now() - connectionStart;
                console.log(`Connected in ${this.metrics.connectionTime}ms`);

                // Request frames for today
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);

                const request = {
                    start_time: startOfDay.toISOString(),
                    end_time: now.toISOString(),
                    order: 'descending'
                };

                console.log(`Requesting frames from ${request.start_time} to ${request.end_time}`);
                this.startTime = Date.now();

                ws.send(JSON.stringify(request));
            });

            ws.on('message', (data) => {
                const elapsed = Date.now() - this.startTime;
                const dataStr = data.toString();

                // Skip keep-alive messages
                if (dataStr === '"keep-alive-text"') {
                    console.log(`  [${elapsed}ms] Keep-alive received`);
                    return;
                }

                try {
                    const parsed = JSON.parse(dataStr);

                    // Handle error messages
                    if (parsed.error) {
                        this.metrics.errors.push(parsed.error);
                        console.log(`  [${elapsed}ms] ERROR: ${parsed.error}`);
                        return;
                    }

                    // Handle batched frames
                    if (Array.isArray(parsed)) {
                        const frameCount = parsed.length;
                        this.metrics.batchCount++;
                        this.metrics.totalFrames += frameCount;
                        this.metrics.totalBytes += dataStr.length;

                        if (!this.firstFrameReceived) {
                            this.firstFrameReceived = true;
                            this.metrics.firstFrameTime = elapsed;
                            console.log(`  [${elapsed}ms] FIRST FRAME RECEIVED! (batch of ${frameCount})`);
                        } else {
                            console.log(`  [${elapsed}ms] Batch ${this.metrics.batchCount}: +${frameCount} frames (total: ${this.metrics.totalFrames})`);
                        }

                        // Track frame count over time
                        const timeKey = Math.floor(elapsed / 1000) + 's';
                        this.metrics.timeToFrameCounts[timeKey] = this.metrics.totalFrames;
                    }
                } catch (e) {
                    console.log(`  [${elapsed}ms] Parse error: ${e.message}`);
                }
            });

            ws.on('close', () => {
                clearTimeout(timeout);
                this.printResults();
                resolve(this.metrics);
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                this.metrics.errors.push(error.message);
                reject(error);
            });

            // Auto-close after receiving frames for 30 seconds
            setTimeout(() => {
                if (this.metrics.totalFrames > 0) {
                    console.log('\n--- Test complete (30s elapsed) ---');
                    ws.close();
                }
            }, 30000);
        });
    }

    printResults() {
        const totalTime = Date.now() - this.startTime;

  
```