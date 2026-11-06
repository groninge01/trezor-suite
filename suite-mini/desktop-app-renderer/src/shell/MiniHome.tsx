import { useDevice } from '@suite/device';
import { gotoThunk } from '@suite/router';
import { Button, Card, Column, Row, Text } from '@trezor/components';
import { useServices } from '@trezor/dependency-injection';
import { injectDispatch } from '@trezor/redux-utils';

const DEVICE_ACTIONS = [
    { label: 'Firmware update', routeName: 'firmware-index' },
    { label: 'Backup', routeName: 'backup-index' },
    { label: 'Recovery', routeName: 'recovery-index' },
    { label: 'Device settings', routeName: 'settings-device' },
] as const;

export const MiniHome = () => {
    const { device } = useDevice();
    const { dispatch } = useServices(injectDispatch);

    return (
        <Column gap={24} alignItems="stretch" maxWidth={560}>
            <Card>
                <Column gap={8}>
                    <Text typographyStyle="headline-md">
                        {device?.label ?? 'No device connected'}
                    </Text>
                    <Text intent="neutral" priority="secondary">
                        {device?.features
                            ? `${device.features.internal_model} · firmware ${device.features.major_version}.${device.features.minor_version}.${device.features.patch_version}`
                            : 'Connect your Trezor to manage it.'}
                    </Text>
                </Column>
            </Card>
            <Row gap={8} flexWrap="wrap">
                {DEVICE_ACTIONS.map(action => (
                    <Button
                        key={action.routeName}
                        size="small"
                        onClick={() => dispatch(gotoThunk({ routeName: action.routeName }))}
                    >
                        {action.label}
                    </Button>
                ))}
            </Row>
        </Column>
    );
};
