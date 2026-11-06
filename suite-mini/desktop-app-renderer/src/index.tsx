import { createMiniCompositionRoot } from './createMiniCompositionRoot';

__webpack_nonce__ = window.cspNonce;

const { app } = createMiniCompositionRoot();

window.onload = () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        app(appElement);
    }
};
