import { Client } from '@xhayper/discord-rpc';
function envStr(name) {
    const v = process.env[name];
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}
function envFlagDisabled(name) {
    const v = envStr(name)?.toLowerCase();
    return v === '0' || v === 'false' || v === 'off';
}
function envFlagEnabled(name) {
    const v = envStr(name)?.toLowerCase();
    return v === '1' || v === 'true' || v === 'on';
}
export function resolveDiscordRichPresenceOptions(cfg) {
    const envApplicationId = envStr('DISCORD_APPLICATION_ID')
        ?? envStr('OVERCLOCK_DISCORD_APPLICATION_ID')
        ?? envStr('OVERCLOCK_DISCORD_APP_ID');
    const envLargeImageKey = envStr('OVERCLOCK_DISCORD_LARGE_IMAGE_KEY')
        ?? envStr('DISCORD_LARGE_IMAGE_KEY');
    const hasExplicitEnvConfig = Boolean(envApplicationId);
    return {
        enabled: !envFlagDisabled('OVERCLOCK_DISCORD_RICH_PRESENCE')
            && (cfg.enabled || hasExplicitEnvConfig || envFlagEnabled('OVERCLOCK_DISCORD_RICH_PRESENCE')),
        applicationId: envApplicationId ?? cfg.applicationId,
        details: 'Using overclock.sh',
        largeImageKey: envLargeImageKey ?? cfg.largeImageKey,
        largeImageText: 'overclock.sh',
    };
}
function isDiscordApplicationId(value) {
    return typeof value === 'string' && /^\d{10,30}$/.test(value);
}
function wait(ms) {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        timer.unref?.();
    });
}
async function withTimeout(promise, ms) {
    return Promise.race([
        promise.then((value) => value).catch(() => undefined),
        wait(ms).then(() => undefined),
    ]);
}
export class DiscordRichPresence {
    client = null;
    generation = 0;
    async start(options) {
        await this.stop();
        if (!options.enabled || !isDiscordApplicationId(options.applicationId))
            return;
        const generation = ++this.generation;
        const client = new Client({ clientId: options.applicationId, transport: { type: 'ipc' } });
        this.client = client;
        client.on('disconnected', () => {
            if (this.client === client)
                this.client = null;
        });
        try {
            await client.login();
            if (this.generation !== generation || this.client !== client)
                return;
            const activity = {
                details: options.details,
                startTimestamp: new Date(),
                instance: false,
            };
            if (options.largeImageKey) {
                activity.largeImageKey = options.largeImageKey;
                if (options.largeImageText)
                    activity.largeImageText = options.largeImageText;
            }
            await client.user?.setActivity(activity, process.pid);
        }
        catch {
            if (this.client === client)
                this.client = null;
            await withTimeout(client.destroy(), 500);
        }
    }
    async stop() {
        const client = this.client;
        this.generation++;
        this.client = null;
        if (!client)
            return;
        await withTimeout(client.user?.clearActivity(process.pid) ?? Promise.resolve(), 700);
        await withTimeout(client.destroy(), 700);
    }
}
//# sourceMappingURL=discordRichPresence.js.map