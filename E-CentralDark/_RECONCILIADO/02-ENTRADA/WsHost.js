import { WebSocketServer } from 'ws';
import { WS_TOKEN_QUERY_PARAM, isWsInvoke, isWsAuth, } from '@overclock-app/ipc-types';
function pushMsg(ws, msg) {
    if (ws.readyState === ws.OPEN)
        ws.send(JSON.stringify(msg));
}
export class WsHost {
    handlers = new Map();
    authedConns = new Set();
    wss = null;
    ipcMain = {
        handle: (channel, listener) => {
            this.handlers.set(channel, listener);
        },
    };
    broadcast = {
        send: (channel, ...args) => {
            const msg = { t: 'event', channel, args };
            for (const conn of this.authedConns)
                pushMsg(conn, msg);
        },
    };
    senderToWindow(sender) {
        const conn = sender;
        if (!this.authedConns.has(conn))
            return null;
        return {
            send: (channel, ...args) => {
                pushMsg(conn, { t: 'event', channel, args });
            },
        };
    }
    listen(token) {
        if (this.wss)
            return Promise.reject(new Error('WsHost already listening')); // review #8
        return new Promise((resolve, reject) => {
            const wss = new WebSocketServer({ host: '127.0.0.1', port: 0 });
            this.wss = wss;
            // Pre-listening failures rejeitam a promise; após o boot, erros do servidor
            // são logados em vez de baterem numa promise já settled (review #2).
            wss.on('error', reject);
            wss.on('listening', () => {
                wss.off('error', reject);
                wss.on('error', (err) => {
                    process.stderr.write(`[WsHost] server error after startup: ${String(err)}\n`);
                });
                const addr = wss.address(); // review #7
                if (!addr || typeof addr === 'string') {
                    reject(new Error('WsHost: invalid server address'));
                    return;
                }
                resolve({ port: addr.port });
            });
            // Só admite conn ainda OPEN — evita estado inconsistente quando o auth
            // timeout e uma mensagem válida correm juntos (review #5).
            const admit = (ws) => {
                if (ws.readyState !== ws.OPEN)
                    return;
                this.authedConns.add(ws);
                this.setupMessageHandler(ws);
            };
            wss.on('connection', (ws, req) => {
                const url = new URL(req.url ?? '/', 'ws://localhost');
                const queryToken = url.searchParams.get(WS_TOKEN_QUERY_PARAM);
                if (queryToken !== null) {
                    if (queryToken !== token) {
                        ws.close(4001, 'Unauthorized');
                        return;
                    }
                    admit(ws);
                }
                else {
                    // Token not in query — wait for WsAuth as first message
                    const authTimeout = setTimeout(() => ws.close(4001, 'Auth timeout'), 5000);
                    ws.once('message', (data) => {
                        clearTimeout(authTimeout);
                        try {
                            const msg = JSON.parse(data.toString());
                            if (isWsAuth(msg) && msg.token === token)
                                admit(ws);
                            else
                                ws.close(4001, 'Unauthorized');
                        }
                        catch {
                            ws.close(4002, 'Bad message');
                        }
                    });
                }
            });
        });
    }
    close() {
        // wss.close() para de aceitar novas conns mas não fecha as existentes;
        // encerra as ativas explicitamente (review #4).
        for (const conn of this.authedConns) {
            try {
                conn.close(1001, 'Server shutting down');
            }
            catch {
                /* já fechada */
            }
        }
        this.authedConns.clear();
        this.wss?.close();
        this.wss = null; // permite re-listen após close (review #8)
    }
    setupMessageHandler(ws) {
        ws.on('close', () => this.authedConns.delete(ws));
        ws.on('message', async (data) => {
            let msg;
            try {
                msg = JSON.parse(data.toString());
            }
            catch {
                return;
            }
            if (!isWsInvoke(msg))
                return;
            const { id, channel, args } = msg;
            // Debug opcional (OVERCLOCK_WS_DEBUG=1): loga cada invoke — usado pra validar
            // que o renderer montou + chamou handlers sob Tauri (prova de render). Off por padrão.
            if (process.env['OVERCLOCK_WS_DEBUG'])
                process.stderr.write(`[ws] invoke ${channel}\n`);
            const handler = this.handlers.get(channel);
            let reply;
            if (!handler) {
                reply = { t: 'reply', id, ok: false, error: `No handler for channel: ${channel}` };
            }
            else {
                try {
                    const result = await handler({ sender: ws }, ...args);
                    reply = { t: 'reply', id, ok: true, result };
                }
                catch (e) {
                    reply = { t: 'reply', id, ok: false, error: String(e) };
                }
            }
            pushMsg(ws, reply);
        });
    }
}
//# sourceMappingURL=WsHost.js.map