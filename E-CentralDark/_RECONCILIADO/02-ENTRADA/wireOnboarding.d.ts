import type { ConfigStore } from '@overclock-app/core';
import type { CliDetector } from '@overclock-app/core';
import type { ProviderStore } from '@overclock-app/core';
import type { HostAdapter } from './WsHost.js';
export interface WireOnboardingDeps {
    host: HostAdapter;
    configStore: ConfigStore;
    cliDetector: CliDetector;
    providerStore: ProviderStore;
}
export declare function wireOnboarding(deps: WireOnboardingDeps): {
    dispose: () => void;
};
//# sourceMappingURL=wireOnboarding.d.ts.map