import useConjureFactoryContract from "../hooks/useConjureFactoryContract";
import {useWeb3React} from "@web3-react/core";
import getReceipt from "../lib/getReceipt";
import {addToast} from "../hooks/useToast";
import {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {COLLATERAL_MINT_ADDRESS} from "../constants";

function Home() {
    const router = useRouter();

    //getting the contract of minty
    const contract = useConjureFactoryContract();
    const {account, library} = useWeb3React();

    const [first_loop, set_first_loop] = useState(0);
    const [button_enabled, set_button_enabled] = useState(true);
    const [unlocktext, set_unlocktext] = useState("Please Unlock Wallet");

    //constructor arguments
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');

    // effect hook for updating data
    useEffect(() => {

        // update the ui elements
        async function updateUIStates() {

            if (tokenName !== '' && tokenSymbol !== '') {
                set_button_enabled(false);
                set_unlocktext("Create your Conjure Asset");
            } else {
                set_button_enabled(true);
                set_unlocktext("Please enter all values");
            }
        }

        // fix for updating after wallet login
        if (account && first_loop === 0) {
            set_first_loop(1);
            set_button_enabled(true);
            set_unlocktext("Please enter all values");
            updateUIStates();
        }

        // schedule every 15 sec refresh
        const timer = setInterval(() => {
            if (account) {
                updateUIStates()
            }

        }, 500);

        // clearing interval
        return () => clearInterval(timer);
    }, [account, library, tokenName, tokenSymbol]);


    function handleChangeTokenName(event) {
        const values = event.target.value;
        setTokenName(values);
    }

    function handleChangeTokenSymbol(event) {
        const values = event.target.value;
        setTokenSymbol(values);
    }

    // nft dao call contract
    const callConjureMint = async () => {

        console.log(tokenName);
        console.log(tokenSymbol);

        try {
            console.log(contract)

            contract.once("NewConjureContract", (address, event) => {
                console.log("Contract event");
                console.log(address);
                router.push({pathname: "/manage", query: {conjure_address: address}});
            });

            const {hash} = await contract.ConjureMint(tokenName, tokenSymbol, account, COLLATERAL_MINT_ADDRESS);
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }
    };

    return (

        <div className="container">
            <div className="py-16 min-w-full flex flex-col justify-start items-center min-w-0 min-h-0 ">

                <div className="py-4 w-full flex justify-center ">
                    <div
                        className="py-4 rounded-2xl w-full min-w-0 min-h-0 bg-purple-600">
                        <p className="text-center text-lg font-bold text-white">
                            Welcome to Conjure
                        </p>
                        <br/>
                        <p className="text-center text-md font-bold text-white">
                            Generalized, user created, synthetic assets using arbitrary oracles and BNB
                            collateralization to peg and conjure assets.
                        </p>
                    </div>
                </div>
                <div className="py-4 w-full flex justify-center">
                    <div
                        className="py-4 rounded-2xl w-full min-w-0 bg-purple-600">
                        <p className="text-center text-lg font-bold text-white">
                            Start creating your Conjure Asset
                        </p>

                    </div>
                </div>

                <div className="py-4 w-full">
                    <div className="md:flex flex-row w-full justify-center">
                        <div
                            className="py-4 pr-2 pl-2 sm:mr-2 mt-2 rounded-2xl w-full md:w-6/12 min-w-0 bg-purple-500">
                            <p className="text-center text-lg font-bold text-white">
                                Name
                            </p>
                            <input required className="text-center w-full justify-center" type="text"
                                   onChange={e => handleChangeTokenName(e)}/>
                        </div>
                        <div
                            className="py-4 pl-2 pr-2 mt-2 rounded-2xl w-full md:w-6/12 min-w-0 bg-purple-500">
                            <p className="text-center text-lg font-bold text-white">
                                Symbol
                            </p>
                            <input className="text-center w-full justify-center" type="text"
                                   onChange={e => handleChangeTokenSymbol(e)}/>
                        </div>
                    </div>
                </div>

                <div className="pt-8 w-full text-center">
                    <button
                        className="py-3 pr-2 pl-2 rounded-3xl w-6/12 bg-gradient-to-r from-pink-500 to-purple-500 hover:bg-purple-300 cursor-pointer"
                        type="button"
                        onClick={callConjureMint} disabled={button_enabled}>
                        <p className="capitalize text-center text-sm  font-bold text-white">{unlocktext}</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home
