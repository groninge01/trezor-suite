import { Provider as ReduxProvider } from 'react-redux';

import { createRoot } from 'react-dom/client';

import { type DesktopApiDep } from '@suite/desktop-app-api';
import { ReactQueryProvider } from '@suite-common/react-query/react';
import TrezorConnect from '@trezor/connect-electron';
import { ServicesProvider } from '@trezor/dependency-injection';

import * as STORAGE from 'src/actions/suite/constants/storageConstants';
import { desktopHandshake } from 'src/actions/suite/suiteActions';
import { type HydrateReduxStoreDep } from 'src/reducers/createHydrateReduxStore';
import { type SuiteReduxStoreDep } from 'src/reducers/createReduxStore';
import { type SuiteServices } from 'src/support/createSuiteCompositionRoot';
import { ConnectedIntlProvider } from 'src/support/suite/ConnectedIntlProvider';
import { ErrorScreen } from 'src/support/suite/screens/ErrorScreen';
import { LoadingScreen } from 'src/support/suite/screens/LoadingScreen';

import { MainMini } from './MainMini';
import { TorLoadingScreen } from './support/screens/TorLoadingScreen';

type MiniDesktopAppDeps = DesktopApiDep & {
    services: SuiteServices & SuiteReduxStoreDep & HydrateReduxStoreDep;
};

export type MiniDesktopApp = (container: HTMLElement) => Promise<void>;

export const createMiniDesktopApp =
    (deps: MiniDesktopAppDeps): MiniDesktopApp =>
    async container => {
        // render simple loader with theme provider without redux, wait for indexedDB
        const root = createRoot(container);
        root.render(<LoadingScreen />);

        const preloadAction = await deps.services.hydrateReduxStore();

        deps.services.networks.loadNetworkModules();

        // start logging to file if Debug menu is active
        if (preloadAction?.type === STORAGE.LOAD && preloadAction.payload.debug?.showDebugMenu) {
            deps.desktopApi.setDebugMode(true);
            deps.desktopApi.configLogger({
                level: 'debug',
                writeToDisk: true,
            });
        }

        // Loading Tor as separate module, before the rest of the modules.
        const { shouldRunTor } = await deps.desktopApi.loadTorModule();

        // When we run this first time 'shouldRunTor' will tell if Tor should run according to
        // previous settings, when it runs because of renderer (e.g. Ctrl+R) it will always be false.
        if (shouldRunTor) {
            await new Promise(resolve => {
                root.render(
                    <ServicesProvider services={deps.services}>
                        <ReduxProvider store={deps.services.store}>
                            <ReactQueryProvider client={deps.services.queryClient}>
                                <ConnectedIntlProvider>
                                    <TorLoadingScreen callback={resolve} />
                                </ConnectedIntlProvider>
                            </ReactQueryProvider>
                        </ReduxProvider>
                    </ServicesProvider>,
                );
                deps.desktopApi.toggleTor(true);
            });
        }

        const loadModules = await deps.desktopApi.loadModules({
            legacyBioAuthEnabled: false,
        });
        if (!loadModules.success) {
            root.render(
                <ServicesProvider services={deps.services}>
                    <ErrorScreen error={loadModules.error} />
                </ServicesProvider>,
            );

            return;
        }

        deps.services.store.dispatch(desktopHandshake(loadModules.payload));

        // establish ipc connection with TrezorConnect living in main process
        await TrezorConnect.initIpcProxy();

        // init bluetooth module
        await deps.services.bluetooth.init();

        root.render(
            <ServicesProvider services={deps.services}>
                <ReduxProvider store={deps.services.store}>
                    <MainMini />
                </ReduxProvider>
            </ServicesProvider>,
        );
    };
