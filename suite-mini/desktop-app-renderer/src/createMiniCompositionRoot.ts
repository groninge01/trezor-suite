import { createMemoryHistory } from 'history';

import { createElectronDesktopApi } from '@suite/desktop-app-api-electron';
import { createElectronPlatformEncryption } from '@suite/platform-encryption-electron';
import TrezorConnect from '@trezor/connect-electron';
import { toGetter } from '@trezor/dependency-injection';

import { createHydrateReduxStore } from 'src/reducers/createHydrateReduxStore';
import { createReduxStore } from 'src/reducers/createReduxStore';
import { rootReducer } from 'src/reducers/store';
import { createDb } from 'src/storage/createDb';
import { createSuiteServicesCompositionRoot } from 'src/support/createSuiteCompositionRoot';
import { extraDependencies } from 'src/support/extraDependencies';
import { createPreloadStore } from 'src/support/suite/createPreloadStore';

import { type MiniDesktopApp, createMiniDesktopApp } from './createMiniDesktopApp';
import { createMiniNetworksServicesCompositionRoot } from './createMiniNetworksServicesCompositionRoot';

type MiniCompositionRoot = { app: MiniDesktopApp };

export const createMiniCompositionRoot = (): MiniCompositionRoot => {
    const desktopApi = createElectronDesktopApi();
    const history = createMemoryHistory();
    const platformEncryption = createElectronPlatformEncryption({ desktopApi });
    const reloadApp = desktopApi.appRestart;

    // The renderer can't construct node-only transports (usb/dgram), so each factory
    // yields the identifier string; the main process maps it to a real Transport
    // instance below the IPC boundary.
    const getTransportsFactories = () => ({
        BridgeTransport: () => 'BridgeTransport' as const,
        NodeUsbTransport: () => 'NodeUsbTransport' as const,
        UdpTransport: () => 'UdpTransport' as const,
    });

    const { store, injectServicesIntoReduxExtra } = createReduxStore({
        reducer: rootReducer,
        extraDependencies,
    });
    const db = createDb({ dispatch: store.dispatch, reloadApp });
    const suiteServices = createSuiteServicesCompositionRoot({
        db,
        desktopApi,
        dispatch: store.dispatch,
        getState: store.getState,
        history,
        platformEncryption,
        createLogger: undefined,
        getBinFilesBaseUrl: toGetter(store.getState, state => state.desktop?.paths?.binDir),
        reloadApp,
        thpHostName: undefined,
        getTransportsFactories,
        getTrezorConnect: () => TrezorConnect,
    });
    const networks = createMiniNetworksServicesCompositionRoot({
        getTrezorConnect: () => TrezorConnect,
        dispatch: store.dispatch,
    });
    const preloadStore = createPreloadStore({ db });
    const hydrateReduxStore = createHydrateReduxStore({
        store,
        reducer: rootReducer,
        preloadStore,
        getStatePatch: async () => (await desktopApi.handshake()).statePatch,
    });
    const services = { ...suiteServices, networks, store, hydrateReduxStore };
    injectServicesIntoReduxExtra(services);

    return { app: createMiniDesktopApp({ desktopApi, services }) };
};
