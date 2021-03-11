import ezDeFiInpageProvider from './ezDeFiInpageProvider';
import { ConsoleLike } from './utils';

/**
 * If no existing window.web3 is found, this function injects a web3 "shim" to
 * not break dapps that rely on window.web3.currentProvider.
 *
 * @param provider - The provider to set as window.web3.currentProvider.
 * @param log - The logging API to use.
 */
export default function shimWeb3(
  provider: ezDeFiInpageProvider,
  log: ConsoleLike = console,
): void {
  let loggedCurrentProvider = false;
  let loggedMissingProperty = false;

  if (!(window as Record<string, any>).web3) {
    const SHIM_IDENTIFIER = '__isezDeFiShim__';

    let web3Shim = { currentProvider: provider };
    Object.defineProperty(web3Shim, SHIM_IDENTIFIER, {
      value: true,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    web3Shim = new Proxy(
      web3Shim,
      {
        get: (target, property, ...args) => {
          if (property === 'currentProvider' && !loggedCurrentProvider) {
            loggedCurrentProvider = true;
            log.warn(
              'You are accessing the ezDeFi window.web3.currentProvider shim. This property is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3',
            );
          } else if (property !== 'currentProvider' && property !== SHIM_IDENTIFIER && !loggedMissingProperty) {
            loggedMissingProperty = true;
            log.error(
              `ezDeFi no longer injects web3. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3`,
            );
            provider.request({ method: 'ezDeFi_logWeb3ShimUsage' })
              .catch((error) => {
                log.debug('ezDeFi: Failed to log web3 shim usage.', error);
              });
          }
          return Reflect.get(target, property, ...args);
        },
        set: (...args) => {
          log.warn(
            'You are accessing the ezDeFi window.web3 shim. This object is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3',
          );
          return Reflect.set(...args);
        },
      },
    );

    Object.defineProperty(window, 'web3', {
      value: web3Shim,
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }
}
