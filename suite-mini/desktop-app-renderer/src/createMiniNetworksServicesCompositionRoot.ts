import {
    type NetworksCompositionRootDeps,
    type NetworksServices,
    createAddressValidator,
    createGetAccountSyncInterval,
    createGetIconPaths,
    createGetNamedAddressSupport,
    createGetNetworkByCoingeckoId,
    createGetNetworkConfig,
    createGetNetworkConfigs,
    createIsWrappedNativeToken,
    createLoadNetworkModules,
    createNetworkIcon,
    createNetworkModuleRepository,
} from '@suite-common/networks';
import { createEthereumSuiteCommonNetworkModule } from '@trezor/network-ethereum-suite-common';

// suite-mini is an EVM device box: only the ethereum network module is
// registered, so every supported-network surface collapses to the EVM set and
// non-EVM Connect/WalletConnect requests fail as unsupported.
export const createMiniNetworksServicesCompositionRoot = (
    deps: NetworksCompositionRootDeps,
): NetworksServices => {
    const networkModules = [createEthereumSuiteCommonNetworkModule(deps)];
    const networkModuleRepository = createNetworkModuleRepository({ networkModules });
    const getNetworkConfig = createGetNetworkConfig({ networkModuleRepository });
    const getNetworkConfigs = createGetNetworkConfigs({
        getNetworkConfig,
        networkModuleRepository,
    });

    return {
        getIconPaths: createGetIconPaths({ networkModuleRepository }),
        isSupportedNetwork: networkModuleRepository.isSupportedNetwork,
        networkIcon: createNetworkIcon({ networkModuleRepository }),
        isWrappedNativeToken: createIsWrappedNativeToken({ networkModuleRepository }),
        networkModuleRepository,
        getNetworkConfig,
        getAccountSyncInterval: createGetAccountSyncInterval({ networkModuleRepository }),
        getNetworkByCoingeckoId: createGetNetworkByCoingeckoId({
            getNetworkConfig,
            networkModuleRepository,
        }),
        addressValidator: createAddressValidator({ networkModuleRepository }),
        getNamedAddressSupport: createGetNamedAddressSupport({ networkModuleRepository }),
        loadNetworkModules: createLoadNetworkModules({
            dispatch: deps.dispatch,
            getNetworkConfigs,
        }),
    };
};
