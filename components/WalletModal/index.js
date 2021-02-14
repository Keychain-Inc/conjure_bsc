import { useWeb3React } from "@web3-react/core";
import className from "classnames";
import { parseEther, formatEther } from "@ethersproject/units";
import { useEffect, useState } from "react";
import useEagerConnect from "../../hooks/useEagerConnect";
import { connectorsByName, SUPPORTED_WALLETS } from "../../lib/connectors";
import { isMetaMask, getEtherscanLink } from "../../lib/utils";
import { Modal, ModalHeader } from "../Modal";
import { useWalletModalOpen, useWalletModalToggle } from "./state";
import { useAsync } from "react-use";

const renderWalletName = (name) =>
  name === "INJECTED"
    ? isMetaMask
      ? SUPPORTED_WALLETS.METAMASK.name
      : SUPPORTED_WALLETS.INJECTED.name
    : SUPPORTED_WALLETS[name].name;

const renderWalletDescription = (name) =>
  name === "INJECTED"
    ? isMetaMask
      ? SUPPORTED_WALLETS.METAMASK.description
      : SUPPORTED_WALLETS.INJECTED.description
    : SUPPORTED_WALLETS[name].description;

const renderWalletIcon = (name) =>
  name === "INJECTED"
    ? isMetaMask
      ? SUPPORTED_WALLETS.METAMASK.icon
      : SUPPORTED_WALLETS.INJECTED.icon
    : SUPPORTED_WALLETS[name].icon;

const WalletModal = () => {
  const { connector, deactivate, error, activate, account } = useWeb3React();

  const isOpen = useWalletModalOpen();
  const onDismiss = useWalletModalToggle();

  const [activatingConnector, setActivatingConnector] = useState();

  /**
   * Handle reseting the active connector
   */
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector)
      setActivatingConnector(undefined);
  }, [activatingConnector, connector]);

  /**
   * Handle error alert and disconnecting from connector
   */
  useEffect(() => {
    if (!!error) {
      setActivatingConnector(undefined);

      deactivate();
    }
  }, [error]);

  const triedEager = useEagerConnect();

  if (account)
    return (
      <Modal
        isOpen={isOpen}
        onDismiss={onDismiss}
        className="bg-primary"
        ariaLabel="Wallet Modal"
        narrow
        dangerouslyBypassFocusLock={activatingConnector}
      >
        <ModalHeader title="My Account" onDismiss={onDismiss} />
        <div className="my-4 sm:my-8">
          <div className="flex flex-col items-center">

            <div className="mb-4">
              <a href={getEtherscanLink(56, account, "ADDRESS")}>
                <button className="btn">
                  <p>View on BscScan</p>
                </button>
              </a>
            </div>
            <div className="mb-4">
              <button className="btn" onClick={deactivate}>
                <p>Sign Out</p>
              </button>
            </div>
          </div>
        </div>
        <style jsx>
          {`
            img {
              height: 90px;
              width: 90px;
            }
            button {
              background-color: #A78BFA;
              width: 200px;
            }
            button:hover {
              background-color: rgba(0, 255, 173, 0.25);
            }
            button > p {
              color: white;
              opacity: 1;
            }
          `}
        </style>
      </Modal>
    );

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      className="bg-primary"
      ariaLabel="Wallet Modal"
      narrow
      dangerouslyBypassFocusLock={activatingConnector}
    >
      <ModalHeader title="Connect Wallet" onDismiss={onDismiss} />

      <div className="my-4 sm:my-8">
        <ul className="list">
          {Object.keys(connectorsByName).map((name, i) => {
            const currentConnector = connectorsByName[name];
            const activating = currentConnector === activatingConnector;
            const connected = currentConnector === connector;
            const disabled =
              !triedEager || !!activatingConnector || connected || !!error;

            const handleConnect = async () => {
              setActivatingConnector(currentConnector);

              await activate(connectorsByName[name]);

              onDismiss();
            };

            return (
              <li key={name} className="wallet-option bg-primary">
                <button
                  className={className(
                    "wallet-option-button focus:outline:none",
                    i === 0 ? "first" : null
                  )}
                  disabled={disabled}
                  onClick={handleConnect}
                >
                  <div className="flex flex-col items-center w-full">
                    <p className="name crop text-sm font-bold mb-2">
                      {renderWalletName(name)}
                    </p>
                    <p className="description  text-xs crop">
                      {connected ? "Connected" : renderWalletDescription(name)}
                    </p>
                    <div className="wallet-option-button-icon">
                      <img src={renderWalletIcon(name)} alt={"wallet icon"} />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <style jsx>{`
        .wallet-option:not(:last-child) {
          margin-bottom: var(--spacing-small);
        }

        @media screen and (min-width: 30em) {
          .wallet-option:not(:last-child) {
            margin-bottom: var(--spacing-medium);
          }
        }

        .wallet-option-button {
          overflow: hidden;
          outline: none;
          border-radius: var(--radius);
          border: 1px solid var(--offwhite);
          transition: all 0.2s ease 0s;
          display: inline-flex;
          color: var(--offwhite);
          width: 50%;
          text-decoration: none;
          padding: 16px;
          height: 200px;
          margin: 0px;
        }

        .wallet-option-button:hover {
          color: rgba(0, 255, 173, 1);
        }
        .wallet-option-button:hover {
          color: rgba(0, 255, 173, 1);
        }

        .wallet-option-button:hover,
        .wallet-option-button:focus {
          border-color: var(--offwhite);
        }

        .wallet-option-button:disabled,
        .wallet-option-button:disabled:hover {
          cursor: not-allowed;
          color: var(--dark-grey);
          border-color: var(--grey);
        }

        .wallet-option-button .description {
          color: var(--offwhite);
        }

        img {
          height: 65px;
          width: 65px;
        }

        .wallet-option-button-icon {
          position: relative;
          top: 40px;
        }
      `}</style>
    </Modal>
  );
};

export default WalletModal;
