import { type ComponentType } from 'react';

import { type PageName, suiteRoutes } from '@suite/router';

import { ConnectPopup } from 'src/views/connect-popup';
import { SettingsConnectedApps } from 'src/views/settings/SettingsConnectedApps/SettingsConnectedApps';
import { SettingsDebug } from 'src/views/settings/SettingsDebug/SettingsDebug';
import { SettingsDevice } from 'src/views/settings/SettingsDevice/SettingsDevice';
import { DesktopSettingsGeneral } from 'src/views/settings/SettingsGeneral/DesktopSettingsGeneral';

import { MiniHome } from '../shell/MiniHome';

const kept: Partial<Record<PageName, ComponentType>> = {
    'suite-connect-popup': ConnectPopup,
    'settings-index': DesktopSettingsGeneral,
    'settings-debug': SettingsDebug,
    'settings-device': SettingsDevice,
    'settings-connected-apps': SettingsConnectedApps,
};

// Every route not kept renders the device home; foreground apps (firmware,
// backup, recovery, switch-device, bridge, udev, ...) still take over through
// ModalSwitcher regardless of the background route.
export const miniComponents: Record<PageName, ComponentType> = {
    ...Object.fromEntries(suiteRoutes.map(route => [route.name, MiniHome])),
    ...kept,
} as Record<PageName, ComponentType>;
