import { InjectedConnector } from "@web3-react/injected-connector";
import { ACTIVE_NETWORK } from "../constants";

/**
 * @name Injected
 * @description https://github.com/NoahZinsmeister/web3-react/blob/v6/docs/connectors/injected.md
 */
export const injected = new InjectedConnector({
  supportedChainIds: [ACTIVE_NETWORK],
});

/**
 * @name Fortmatic
 * @description https://github.com/NoahZinsmeister/web3-react/blob/v6/docs/connectors/fortmatic.md
 */
/**
 * @name connectorsByName
 * @description Object of the available connection methods
 */
export const connectorsByName = {
  INJECTED: injected
};

/**
 * @name SUPPORTED_WALLETS
 */
export const SUPPORTED_WALLETS = {
  INJECTED: {
    name: "Injected",
    description: "Login using a browser extension",
    color: "#E8831D",
    primary: true,
    icon: "/metamask-icon.svg",
  },
  METAMASK: {
    name: "MetaMask",
    description: "Login using Metamask",
    color: "#E8831D",
    icon: "/metamask-icon.svg",
  }
};
