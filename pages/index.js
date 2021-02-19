import useConjureFactoryContract from "../hooks/useConjureFactoryContract";
import {useWeb3React} from "@web3-react/core";
import getReceipt from "../lib/getReceipt";
import {addToast} from "../hooks/useToast";
import {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {COLLATERAL_MINT_ADDRESS, CONJURE_FACTORY_ADDRESS} from "../constants";
import CONJURE_FACTORY_ABI from "../constants/abi/conjure_factory.json";
import {Contract} from "@ethersproject/contracts";
import {Interface} from "@ethersproject/abi";
import ABI from "../constants/abi/conjure.json";
import {isAddress} from "@ethersproject/address";
import {formatEther} from "@ethersproject/units";
import {DateTime} from "luxon";
import Link from "next/link";

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

    const [recent_assets, set_recent_assets] = useState([]);

    // effect hook for updating data
    useEffect(() => {

        // update the ui elements
        async function updateUIStates() {

            if (tokenName !== '' && tokenSymbol !== '') {
                set_button_enabled(false);
                set_unlocktext("Conjure Your Asset");
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

    // effect hook for updating data
    useEffect(() => {
        if (account)
        {
            getConjureAssets();
        }

    }, [account]);


    function handleChangeTokenName(event) {
        const values = event.target.value;
        setTokenName(values);
    }

    function handleChangeTokenSymbol(event) {
        const values = event.target.value;
        setTokenSymbol(values);
    }

    async function getConjureAssets()
    {
        const conjurefactory_contract = isAddress(CONJURE_FACTORY_ADDRESS) && !!CONJURE_FACTORY_ABI && !!library ? new Contract(CONJURE_FACTORY_ADDRESS, CONJURE_FACTORY_ABI, library) : undefined;

        // get all descriptions for the events
        let filter = conjurefactory_contract.filters.NewConjureContract();
        const past_events = await library.getLogs({
            fromBlock: 0,
            toBlock: "latest",
            address: conjurefactory_contract.address,
            topics: filter['topics']
        });

        const eventParser = new Interface(CONJURE_FACTORY_ABI)

        let contract_array = [];

        past_events?.map(event => {
            const eventParsed = eventParser.parseLog(event).args
            contract_array.push({deployed: eventParsed.deployed, blockNumber: event.blockNumber})
        })

        console.log(contract_array)

        // get all loan ids open
        let temp_conj_info = [];

        let k;
        for (k = 0; k < contract_array.length; k++) {
            let temp_contract_address = contract_array[k].deployed;

            const temp_conj_contract = isAddress(temp_contract_address) && !!ABI && !!library ? new Contract(temp_contract_address, ABI, library) : undefined;
            const symbol = await temp_conj_contract.symbol();
            const name = await temp_conj_contract.name();
            const address = temp_conj_contract.address;
            const price = await temp_conj_contract.getLatestPrice();

            const blockData = await library.getBlock(contract_array[k].blockNumber)

            let enddate = DateTime.fromSeconds(blockData.timestamp)
            temp_conj_info.push({symbol: symbol, name: name, address: address, price: price, createtime: enddate.toLocaleString(DateTime.DATETIME_SHORT)});

        }

        console.log(temp_conj_info);
        set_recent_assets(temp_conj_info);
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
                            Conjure any fully collateralized, permissionless synthetic asset you want! Any oracle, any asset type and in only 2 transactions.
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

            {(recent_assets.length > 0 ?

                    <div className="py-1 w-full">
                        <div className="py-4 w-full flex justify-center">
                            <div className="py-4  rounded-2xl  w-full bg-purple-500">
                                <p className="text-center text-lg font-bold text-white">
                                    Recently Created Assets
                                </p>
                            </div>
                        </div>
                        <table className="table-auto py-4 w-full">
                            <thead className="w-full justify-center rounded-2xl w-full min-w-0 bg-purple-500">
                            <tr className="py-4 pr-2 sm:pr-10 sm:pl-8 pl-2 sm:mr-2 ">
                                <th className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">Name</th>
                                <th className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">Symbol</th>
                                <th className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">Price</th>
                                <th className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">Created</th>
                            </tr>
                            </thead>
                            <tbody className="w-full justify-center rounded-2xl w-full min-w-0">

                            {recent_assets.map((field, idx) => {
                                return (
                                    <Link href={"/manage" + "?address=" + recent_assets[idx].address} key={`${field}-${idx}`}>
                                        <tr className="py-4 pr-2 sm:pr-10 sm:pl-8 pl-2 sm:mr-2 cursor-pointer bg-indigo-400 hover:bg-purple-400">
                                            <td className="text-center sm:text-lg text-xs font-bold text-white border-white border-2 ">{recent_assets[idx].name}</td>
                                            <td className="text-center sm:text-lg text-xs font-bold text-white border-white border-2 ">{recent_assets[idx].symbol}</td>
                                            <td className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">${formatEther(recent_assets[idx].price)}</td>
                                            <td className="text-center sm:text-lg text-xs font-bold text-white border-white border-2">{recent_assets[idx].createtime}</td>
                                        </tr>
                                    </Link>
                                );
                            })}
                            </tbody>
                        </table>


                    </div>

                    :
                    ""
            )}
        </div>
    );
}

export default Home
