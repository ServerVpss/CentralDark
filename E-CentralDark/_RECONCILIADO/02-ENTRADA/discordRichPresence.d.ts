import type { AppConfig } from '@overclock-app/core';
export interface DiscordRichPresenceOptions {
    enabled: boolean;
    applicationId: string | null;
    details: string;
    largeImageKey: string | null;
    largeImageText: string | null;
}
export declare function resolveDiscordRichPresenceOptions(cfg: AppConfig['discordRichPresence']): DiscordRichPresenceOptions;
export declare class DiscordRichPresence {
    private client;
    private generation;
    start(options: DiscordRichPresenceOptions): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=discordRichPresence.d.ts.map