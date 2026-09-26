import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname, sep } from 'node:path';
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp',
    '.map': 'application/json',
};
export function startPreviewServer(dir) {
    const base = join(dir); // normalize the base path
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            // Strip query string and decode; replace backslashes for cross-platform safety.
            const raw = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/\\/g, '/');
            // Remove leading slashes to get a relative path.
            const rel = raw.replace(/^\/+/, '');
            const abs = join(base, rel);
            // Path-traversal guard: resolved path must be at or below the served directory.
            if (abs !== base && !abs.startsWith(base + sep)) {
                res.writeHead(403);
                res.end();
                return;
            }
            // SPA fallback: missing file or directory → serve index.html.
            const target = (!existsSync(abs) || statSync(abs).isDirectory()) ? join(base, 'index.html') : abs;
            if (!existsSync(target)) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, {
                'Content-Type': MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
                'Access-Control-Allow-Origin': '*',
            });
            createReadStream(target).pipe(res);
        });
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ port: addr.port, close: () => server.close() });
        });
        server.on('error', reject);
    });
}
//# sourceMappingURL=previewServer.js.map