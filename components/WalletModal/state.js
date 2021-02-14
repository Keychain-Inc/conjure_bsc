import { newRidgeState } from "react-ridge-state";

const walletModalState = newRidgeState(false);

export function useWalletModalOpen() {
  const state = walletModalState.useValue();

  return state;
}

export function useWalletModalToggle() {
  const [isOpen, setIsOpen] = walletModalState.use();

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return toggle;
}

