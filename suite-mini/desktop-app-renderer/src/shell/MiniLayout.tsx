import { type PropsWithChildren, useContext } from 'react';

import { gotoThunk } from '@suite/router';
import { Box, Button, Column, Divider, Row, Text } from '@trezor/components';
import { useServices } from '@trezor/dependency-injection';
import { injectDispatch } from '@trezor/redux-utils';

import { LayoutPayloadProvider } from 'src/components/suite/layouts/SuiteLayout/LayoutPayloadProvider';
import { ModalSwitcher } from 'src/components/suite/modals/ModalSwitcher/ModalSwitcher';
import { LayoutPayloadContext } from 'src/support/suite/LayoutContext';

const NAV = [
    { label: 'Home', routeName: 'suite-index' },
    { label: 'Device', routeName: 'settings-device' },
    { label: 'Settings', routeName: 'settings-index' },
] as const;

const MiniChrome = ({ children }: PropsWithChildren) => {
    const payload = useContext(LayoutPayloadContext);
    const { dispatch } = useServices(injectDispatch);

    return (
        <Column height="100vh" overflow="hidden">
            <Row as="header" gap={16} padding={16} justifyContent="space-between">
                <Text typographyStyle="headline-sm">suite-mini</Text>
                <Row gap={8}>
                    {NAV.map(item => (
                        <Button
                            key={item.routeName}
                            size="small"
                            intent="neutral"
                            priority="secondary"
                            onClick={() => dispatch(gotoThunk({ routeName: item.routeName }))}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Row>
            </Row>
            <Divider margin={0} />
            {payload.layoutHeader}
            {payload.title ? <Text typographyStyle="headline-md">{payload.title}</Text> : null}
            <Box flex="1" overflow="auto" padding={16}>
                {children}
            </Box>
        </Column>
    );
};

export const MiniLayout = ({ children }: PropsWithChildren) => (
    <LayoutPayloadProvider>
        <MiniChrome>{children}</MiniChrome>
        <ModalSwitcher />
    </LayoutPayloadProvider>
);
