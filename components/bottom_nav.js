import { memo } from "react";
import Link from "next/link";
import {CONJURE_FACTORY_ADDRESS} from "../constants";

const hyperlink = "https://testnet.bscscan.com/address/" + CONJURE_FACTORY_ADDRESS + "#code"

const BottomNav = () => {
    return (
        <>
            <div className="wrapper flex z-4">
                <footer className="container w-full text-center">

                    <div className=" flex-row items-center text-center">
                        <Link href="mailto:pr0@keychain.me">
                            <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold" target="_blank">
                                Contact
                            </a>
                        </Link>
                        <Link href="https://twitter.com/conjurefi">
                            <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold" target="_blank">
                                Twitter
                            </a>
                        </Link>
                        <Link href="https://discord.gg/xWCn7sYF">
                            <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold" target="_blank">
                                Discord
                            </a>
                        </Link>
                        <Link href={hyperlink}>
                            <a className="text-xs md:text-lg text-black p-2 md:p-6 hover:text-green cursor-pointer font-bold" target="_blank">
                                View Contract
                            </a>
                        </Link>
                    </div>
                </footer>

                <style jsx>{`
          .wrapper {
            min-height: 76px;
          }
        `}</style>
            </div>
        </>
    );
};

export default memo(BottomNav);