import { useWeb3React } from "@web3-react/core";
import { memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWalletModalToggle } from "./WalletModal/state";

const WalletModal = dynamic(() => import("./WalletModal"), { ssr: false });

const Nav = () => {
  const { account } = useWeb3React();

  const toggleWalletModal = useWalletModalToggle();

  return (
    <>
      <div className="wrapper flex  z-4">
        <header className="container w-full">
          <nav className="flex justify-between items-center h-full">
            <Link href="/">
              <a>
                <div className="flex flex-row items-center">
                  <img src="/conjure.png" alt="conjure" />
                  <h3 className="text-xs md:text-lg text-black font-bold">Conjure BNB</h3>
                </div>
              </a>
            </Link>
            <div className="flex flex-row items-center">
              <Link href="/manage">
                <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold">
                  Manage
                </a>
              </Link>
              <Link href="/loan">
                <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold">
                  Loans
                </a>
              </Link>

              <button
                  className="py-3 pr-2 pl-2 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 hover:bg-purple-300 cursor-pointer"
                  type="button" onClick={toggleWalletModal}>
                <p className="capitalize text-center text-xs md:text-lg font-bold text-white">{!!account ? "My Wallet" : "Unlock Wallet"}</p>
              </button>
            </div>
          </nav>
        </header>

        <WalletModal />

        <style jsx>{`
          .wrapper {
            min-height: 76px;
          }
          div > img {
            height: 50px;
            bottom: 2px;
          }
          button > p {
            color: black;
            opacity: 1;
          }
        `}</style>
      </div>
    </>
  );
};

export default memo(Nav);
