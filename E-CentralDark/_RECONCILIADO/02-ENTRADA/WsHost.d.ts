export interface EventSender {
    send(channel: string, ...args: unknown[]): void;
}
export interface IpcMainLike {
    handle(channel: string, listener: (event: {
        sender: unknown;
    }, ...args: any[]) => unknown): void;
}
export interface HostAdapter {
    ipcMain: IpcMainLike;
    broadcast: EventSender;
    senderToWindow(sender: unknown): EventSender | null;
}
export declare class WsHost implements HostAdapter {
    private handlers;
    private authedConns;
    private wss;
    ipcMain: IpcMainLike;
    broadcast: EventSender;
    senderToWindow(sender: unknown): EventSender | null;
    listen(token: string): Promise<{
        port: number;
    }>;
    close(): void;
    private setupMessageHandler;
}
//# sourceMappingURL=WsHost.d.ts.map