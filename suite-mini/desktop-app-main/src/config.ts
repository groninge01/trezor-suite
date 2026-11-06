import { isDevEnv } from '@suite-common/suite-utils';
import { TOR_URLS } from '@trezor/urls';

export const trezorIoOnionDomain = TOR_URLS['trezor.io'];
export const sldevOnionDomain = TOR_URLS['sldev.cz'];

export const oauthUrls = [
    'https://accounts.google.com',
    'https://www.dropbox.com/oauth2/authorize',
];

export const allowedProtocols = ['http:', 'https:'];

const allowedDomainsDev = [
    // google store for chrome extensions (devtools) loaded in electron-react-devtools.ts, see https://github.com/MarshallOfSound/electron-devtools-installer/blob/f8ec609/src/downloadChromeExtension.ts#L30
    'google.com',
    'googleusercontent.com',
];

export const localhostDomains = ['localhost', '127.0.0.1'];

export const electronOrigin = 'https://electron.trezor.io';

export const allowedDomains = [
    ...localhostDomains,
    'trezor.io',
    'sldev.cz', // Test environment, available only with VPN
    'invity.io',
    'api.github.com',
    'api.dropboxapi.com',
    'content.dropboxapi.com',
    'notify.dropboxapi.com',
    'oauth2.googleapis.com',
    'googleapis.com',
    trezorIoOnionDomain,
    sldevOnionDomain,
    'verify.walletconnect.org', // WalletConnect
    ...(isDevEnv ? allowedDomainsDev : []),
];

export const silentlyBlockedDomains = [
    'pulse.walletconnect.org', // WalletConnect analytics
];
