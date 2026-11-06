import { type FC, type PropsWithChildren, memo, useEffect } from 'react';

import { selectShouldDisplayDeviceCompromisedOnRoute } from '@suite/authenticity-checks';
import { useDevice } from '@suite/device';
import { KillswitchMessageScreen } from '@suite/message-system';
import {
    type RouterAppWithParams,
    selectHasRoute,
    selectIsForegroundApp,
    selectRouterApp,
    selectRouterLoaded,
} from '@suite/router';
import { selectIsAnalyticsConfirmed } from '@suite-common/analytics-redux';
import {
    useReportDeviceCompromised,
    useRetryFwAuthenticityChecks,
} from '@suite-common/firmware-authenticity';
import { selectActiveKillswitchMessage } from '@suite-common/message-system';
import { Card } from '@trezor/components';
import { useServices } from '@trezor/dependency-injection';
import { injectDispatch } from '@trezor/redux-utils';

import * as analyticsActions from 'src/actions/suite/analyticsActions';
import { disableAnalyticsThunk } from 'src/actions/suite/analyticsActions';
import { initThunk } from 'src/actions/suite/initAction';
import { DatabaseCorruptedModal } from 'src/components/suite/Preloader/DatabaseCorruptedModal';
import { DatabaseUpgradeModal } from 'src/components/suite/Preloader/DatabaseUpgradeModal';
import { InitialLoading } from 'src/components/suite/Preloader/InitialLoading';
import { useWaitForTransport } from 'src/components/suite/Preloader/useWaitForTransport';
import { PrerequisitesGuide } from 'src/components/suite/PrerequisitesGuide/PrerequisitesGuide';
import { DeviceCompromisedScreen } from 'src/components/suite/SecurityCheck/DeviceCompromisedScreen';
import {
    InteractiveDeviceChecksFlow,
    useInteractiveDeviceChecksFlowState,
} from 'src/components/suite/SecurityCheck/InteractiveDeviceChecksFlow';
import { useDeviceCompromisedNotification } from 'src/components/suite/SecurityCheck/useDeviceCompromisedNotification';
import { WelcomeLayout } from 'src/components/suite/layouts/WelcomeLayout/WelcomeLayout';
import { WelcomeLayoutWithoutModalSwitcher } from 'src/components/suite/layouts/WelcomeLayout/WelcomeLayoutWithoutModalSwitcher';
import { useGuideDesktopMenu, useGuideKeyboard } from 'src/hooks/guide';
import { useAppShortcuts, useSelector } from 'src/hooks/suite';
import { useWindowVisibility } from 'src/hooks/suite/useWindowVisibility';
import { selectPrerequisite, selectSuiteLifecycle } from 'src/selectors/suite/suiteSelectors';
import { Onboarding } from 'src/views/onboarding';
import { ErrorPage } from 'src/views/suite/ErrorPage';

import { MiniLayout } from './MiniLayout';

const getFullscreenApp = (app: RouterAppWithParams['app']): FC | undefined => {
    switch (app) {
        case 'onboarding':
            return Onboarding;
        default:
            return undefined;
    }
};

// Fork of packages/suite/src/components/suite/Preloader/Preloader.tsx for suite-mini:
// the analytics consent screen is replaced by an automatic decline, and the
// SuiteLayout shell is replaced by MiniLayout.
export const MiniPreloader = memo(function MiniPreloaderComponent({ children }: PropsWithChildren) {
    const lifecycle = useSelector(selectSuiteLifecycle);
    const isRouterLoaded = useSelector(selectRouterLoaded);
    const routerApp = useSelector(selectRouterApp);
    const isForegroundApp = useSelector(selectIsForegroundApp);
    const hasRoute = useSelector(selectHasRoute);
    const prerequisite = useSelector(selectPrerequisite);
    const shouldDisplayDeviceCompromisedOnRoute = useSelector(
        selectShouldDisplayDeviceCompromisedOnRoute,
    );
    const killswitch = useSelector(selectActiveKillswitchMessage);

    const isAnalyticsConsentConfirmed = useSelector(selectIsAnalyticsConfirmed);

    const waitForTransport = useWaitForTransport();

    const { device } = useDevice();
    useReportDeviceCompromised({ device });
    useDeviceCompromisedNotification();

    const { dispatch } = useServices(injectDispatch);
    useRetryFwAuthenticityChecks();

    useEffect(() => {
        // Analytics needs to be resolved before we show anything to the user.
        dispatch(analyticsActions.initThunk());
    }, [dispatch]);

    useEffect(() => {
        if (isAnalyticsConsentConfirmed) {
            dispatch(initThunk());
        } else {
            // suite-mini never asks for analytics consent: decline once so the
            // consent flag is set and init proceeds without the screen.
            dispatch(disableAnalyticsThunk({ sendReport: false }));
        }
    }, [dispatch, isAnalyticsConsentConfirmed]);

    // Register keyboard handlers for opening/closing Guide using keyboard
    useGuideKeyboard();
    // Open the Guide from the desktop application menu (Help)
    useGuideDesktopMenu();
    // App-wide keyboard shortcuts; mounted here so they work regardless of the active layout.
    useAppShortcuts();
    useWindowVisibility();

    const {
        isInteractiveDeviceChecksFlowDisplayed,
        isAuthenticityCheckStepActive,
        setIsAuthenticityCheckStepActive,
    } = useInteractiveDeviceChecksFlowState();

    if (lifecycle.status === 'db-corrupted') {
        return <DatabaseCorruptedModal />;
    }
    if (lifecycle.status === 'db-error') {
        return <DatabaseUpgradeModal variant={lifecycle.error} />;
    }

    if (lifecycle.status === 'error') {
        throw new Error(lifecycle.error);
    }

    if (killswitch) {
        return <KillswitchMessageScreen />;
    }

    // @trezor/connect was initialized, but didn't emit "TRANSPORT" event or initially connected
    // devices yet (it could take a while), display Loader as full page view
    if (lifecycle.status !== 'ready' || !isRouterLoaded || waitForTransport) {
        return <InitialLoading timeout={90 * 5} />;
    }

    if (shouldDisplayDeviceCompromisedOnRoute) {
        return <DeviceCompromisedScreen />;
    }

    if (isInteractiveDeviceChecksFlowDisplayed) {
        return (
            <WelcomeLayoutWithoutModalSwitcher>
                <InteractiveDeviceChecksFlow
                    isAuthenticityCheckStepActive={isAuthenticityCheckStepActive}
                    setIsAuthenticityCheckStepActive={setIsAuthenticityCheckStepActive}
                />
            </WelcomeLayoutWithoutModalSwitcher>
        );
    }

    const FullscreenApp = getFullscreenApp(routerApp);
    if (FullscreenApp !== undefined) {
        return <FullscreenApp />;
    }

    if (isForegroundApp) {
        return <MiniLayout>{children}</MiniLayout>;
    }

    // display prerequisite for regular application as page view
    if (prerequisite !== null) {
        return (
            <WelcomeLayout showAccounts={false}>
                <Card paddingType="large">
                    <PrerequisitesGuide />
                </Card>
            </WelcomeLayout>
        );
    }

    // route does not exist, display error page in fullscreen mode
    if (!hasRoute) {
        return <ErrorPage />;
    }

    return <MiniLayout>{children}</MiniLayout>;
});
