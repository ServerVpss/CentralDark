export const CENTRALDARK_API_DOMAIN = 'api.centralldark.com' as const;
export const CENTRALDARK_API_BASE_URL = 'https://api.centralldark.com' as const;
export const CENTRALDARK_API_VERSION = 'v1' as const;

export const CENTRALDARK_WHATSAPP_API_BASE_PATH = '/v1/whatsapp' as const;
export const CENTRALDARK_WHATSAPP_API_BASE_URL =
  `${CENTRALDARK_API_BASE_URL}${CENTRALDARK_WHATSAPP_API_BASE_PATH}` as const;

export type CentralDarkApiDomainConfig = {
  domain: typeof CENTRALDARK_API_DOMAIN;
  baseUrl: typeof CENTRALDARK_API_BASE_URL;
  version: typeof CENTRALDARK_API_VERSION;
  whatsappBasePath: typeof CENTRALDARK_WHATSAPP_API_BASE_PATH;
  whatsappBaseUrl: typeof CENTRALDARK_WHATSAPP_API_BASE_URL;
};

export const centralDarkApiDomainConfig: CentralDarkApiDomainConfig = {
  domain: CENTRALDARK_API_DOMAIN,
  baseUrl: CENTRALDARK_API_BASE_URL,
  version: CENTRALDARK_API_VERSION,
  whatsappBasePath: CENTRALDARK_WHATSAPP_API_BASE_PATH,
  whatsappBaseUrl: CENTRALDARK_WHATSAPP_API_BASE_URL,
};
