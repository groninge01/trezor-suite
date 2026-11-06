/*
 Static import for polyfills. In createBaseConfig.ts, we use the useBuiltIns: 'entry' Babel setting, which determines
 which polyfills are picked as per the browserslist target.
*/
import 'core-js/actual';

import { useDebugLanguageShortcut } from '@suite/debug';

import { Metadata, ToasterProvider, TrafficLightDraggableWindowHeader } from 'src/components/suite';
import { Main } from 'src/support/suite/Main';
import { useConnectPopupDesktop } from 'src/support/suite/useConnectPopupDesktop';
import { useTor } from 'src/support/suite/useTor';

import { GlobalStyle } from './GlobalStyle';
import { MiniAppRouter } from './shell/MiniAppRouter';
import { MiniPreloader } from './shell/MiniPreloader';
import { miniComponents } from './support/miniComponents';

export const MainMini = () => {
    useTor();
    useDebugLanguageShortcut();
    useConnectPopupDesktop();

    return (
        <Main trafficLightOffset={<TrafficLightDraggableWindowHeader />}>
            <GlobalStyle />
            <Metadata />
            <ToasterProvider />
            <MiniPreloader>
                <MiniAppRouter components={miniComponents} />
            </MiniPreloader>
        </Main>
    );
};
