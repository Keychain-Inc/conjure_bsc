import {formatEther, parseEther, formatUnits} from "@ethersproject/units";
import {useWeb3React} from "@web3-react/core";
import getReceipt from "../lib/getReceipt";
import {addToast} from "../hooks/useToast";
import {useEffect, useState} from 'react';
import {BigNumber} from '@ethersproject/bignumber';
import {isAddress} from "@ethersproject/address";
import {Contract} from "@ethersproject/contracts";
import ABI from "../constants/abi/conjure.json";
import COLLATERAL_ABI from "../constants/abi/Collateral.json"
import COLLATERAL_FACTORY_ABI from "../constants/abi/CollateralFactory.json"
import Select, {components} from 'react-select'
import {Fragment, FunctionFragment, Interface} from "@ethersproject/abi"


import { useRouter } from 'next/router'
import {
    COLLATERAL_MINT_ADDRESS
} from "../constants";
import { InfuraProvider} from "@ethersproject/providers";
import {defaultAbiCoder} from "@ethersproject/abi";
import {DateTime} from "luxon";
import {format_friendly, getEtherscanLink} from "../lib/utils";
const encoder = defaultAbiCoder

function Loan() {
    const router = useRouter();

    //getting the contract of minty
    const {account, library} = useWeb3React();

    //new for details
    const [conjureAddress, setConjureAddress] = useState('');

    const [first_router, set_first_router] = useState(0);
    const [first_autocheck, set_first_autocheck] = useState(0);
    const [check_query, set_check_query] = useState(0);

    const [ischecked, setischecked] = useState(false);

    const [owner,setowner] = useState("0x0000000000000000000000000000000000000000");

    // conjure states
    const [tokentotalsupply, settokentotalsupply] = useState(0);
    const [tokendecimals, settokendecimals] = useState(0);
    const [tokensymbol, settokensymbol] = useState('NULL');
    const [tokenname, settokenname] = useState('NULL');
    const [contractbalance, setcontractbalance] = useState(0);
    const [userbalance, setuserbalance] = useState(0);
    const [assetType, setAssetType] = useState(0);
    const [oracleData, setOracleData] = useState([]);
    const [numoracles, setnumoracles] = useState(0);
    const [lastPrice, setLastPrice] = useState(BigNumber.from(0));
    const [lastTime, setLastTime] = useState(0);

    // collateral
    const [collateralAddress, setCollateralAddress] = useState('');

    // to set for init the contract

    //loan fields of state
    const[collratio, setcollratio] = useState(BigNumber.from(0));
    const[ethbalance, setethbalance] = useState(BigNumber.from(0));
    const[issueratio, setissueratio] = useState(BigNumber.from(0));
    const[issuefee, setissuefee] = useState(BigNumber.from(0));
    const[mincoll, setmincoll] = useState(BigNumber.from(0));
    const[totalissue, settotalissue] = useState(BigNumber.from(0));
    const[totalloans, settotalloans] = useState(BigNumber.from(0));
    const[openloans, setopenloans] = useState(BigNumber.from(0));
    const [lastetherprice, setlastetherprice] = useState(BigNumber.from(0));

    const [loanarray, setloanarray] = useState([]);
    const [loanratios, setloanrations] = useState([]);
    const [collarray, setcollarrayy] = useState([]);
    const [conjurearray, setconjurearray] = useState([]);

    const [withdrawamount, setwithdrawamount] = useState(0);
    const [depositamount, setdepositamount] = useState(0);

    const[cratio, setcratio] = useState(BigNumber.from(0));
    const[collamount, setcollamount] = useState('0');
    const [loanamount, setloanamount] = useState('0');

    // effect hook for updating data
    useEffect(() => {

        if (first_router === 0)
        {
            set_first_router(1);
            if (router.query && router.query.conjure_address)
            {
                setConjureAddress(router.query.conjure_address);
                set_check_query(1);
            }
            else
            {
                const splitter = router.asPath.split('address=');
                console.log(splitter);

                try
                {
                    let my_address = splitter[1];
                    console.log(my_address);

                    if (my_address !== undefined)
                    {
                        setConjureAddress(my_address);
                        set_check_query(1);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }, []);

    // effect hook for updating data
    useEffect(() => {

        // update the ui elements
        async function updateUIStates() {
            console.log('updating')
            await checkConjureDetails();
            console.log('updating finished')
        }

        // schedule
        const timer = setInterval(() => {
            if (first_autocheck === 0 && conjureAddress !== '' && check_query === 1)
            {
                console.log('first auto check')
                console.log(first_autocheck)
                set_first_autocheck(1);
                updateUIStates();
            }
        }, 300);

        // clearing interval
        return () => clearInterval(timer);
    }, [account, library, conjureAddress, first_autocheck, check_query]);


    // effect hook for updating data
    useEffect(() => {

        if (account)
        {
            getUserLoans();
        }

    }, [account]);


    //format addresses in ui
    function format_address(address)
    {
        const new_address = address.substring(0,5) + '...' + address.slice(-3)
        return new_address;
    }

    async function getUserLoans()
    {
        if (!account)
        {
            addToast({body:"Please Connect your Wallet before accessing the loan interface", type: "error"});
            return;
        }

        const collfactory_contract = isAddress(COLLATERAL_MINT_ADDRESS) && !!COLLATERAL_FACTORY_ABI && !!library ? new Contract(COLLATERAL_MINT_ADDRESS, COLLATERAL_FACTORY_ABI, library) : undefined;

        // get all descriptions for the events
        let filter = collfactory_contract.filters.NewBnbCollateralContract();
        const past_events = await library.getLogs({
            fromBlock: 0,
            toBlock: "latest",
            address: collfactory_contract.address,
            topics: filter['topics']
        });

        const eventParser = new Interface(COLLATERAL_FACTORY_ABI)

        let contract_array = [];

        past_events?.map(event => {
            const eventParsed = eventParser.parseLog(event).args
            contract_array.push(eventParsed.deployed)
        })

        console.log(contract_array)

        // get all loan ids open
        let temp_loans = [];
        let temp_ratio = [];
        let temp_coll = [];
        let temp_conjure = [];

        let k;
        for (k = 0; k < contract_array.length; k++) {
            let temp_contract_address = contract_array[k];

            const temp_coll_contract = isAddress(temp_contract_address) && !!COLLATERAL_ABI && !!library ? new Contract(temp_contract_address, COLLATERAL_ABI, library) : undefined;
            const openloans = await temp_coll_contract.openLoanIDsByAccount(account);
            const temp_conj_addres = await temp_coll_contract.arbasset();
            console.log(openloans)

            const temp_conj_contract = isAddress(temp_conj_addres) && !!ABI && !!library ? new Contract(temp_conj_addres, ABI, library) : undefined;
            const symbol = await temp_conj_contract.symbol();

            if (openloans.length > 0)
            {

                let i;
                for (i = 0; i < openloans.length; i++)
                {
                    const loaninfo = await temp_coll_contract.getLoan(account, openloans[i])
                    console.log(loaninfo)
                    let cratio = await temp_coll_contract.getLoanCollateralRatio(account, openloans[i])

                    temp_loans.push(loaninfo);
                    temp_ratio.push(cratio);
                    temp_coll.push(temp_contract_address);
                    temp_conjure.push(symbol);
                }


            }
        }

        console.log(temp_loans)
        console.log(temp_ratio)
        console.log(temp_coll)
        console.log(temp_conjure)
        setloanrations(temp_ratio)
        setloanarray(temp_loans)
        setcollarrayy(temp_coll)
        setconjurearray(temp_conjure)
    }

    async function checkConjureDetails() {

        if (!account)
        {
            addToast({body:"Please Connect your Wallet before accessing the loan interface", type: "error"});
            return;
        }

        let callingaddress = conjureAddress;
        let resolvedaddress = await library.resolveName(conjureAddress);

        // if we have an resolved address we take it
        if (resolvedaddress)
        {
            console.log(resolvedaddress);
            callingaddress = resolvedaddress;
            setConjureAddress(callingaddress);
        }

        const conjure_contract = isAddress(callingaddress) && !!ABI && !!library ? new Contract(callingaddress, ABI, library) : undefined;

        try {
            const owner = await conjure_contract._owner();
            console.log(owner);
            setowner(owner);

            const collateral = await  conjure_contract._collateralContract();
            setCollateralAddress(collateral)
            console.log(collateral)

            const totalsupply = await conjure_contract.totalSupply();
            const symbol = await conjure_contract.symbol();
            const decimals = await conjure_contract.decimals();
            const name = await conjure_contract.name();
            const assettype = await conjure_contract._assetType();
            const lastprice = await conjure_contract._latestobservedprice();
            const lastpricetime = await conjure_contract._latestobservedtime();
            const ethprice = await conjure_contract.getLatestBNBUSDPrice();


            // get oracles
            const oraclenumber = await conjure_contract._numoracles();
            setnumoracles(oraclenumber.toNumber());

            let ora_array = [];

            let i;
            for (i = 0; i < oraclenumber.toNumber(); i++) {
                let temp_prop = await conjure_contract._oracleData(i);
                ora_array.push(temp_prop);
            }

            setOracleData(ora_array);
            settokentotalsupply(totalsupply);
            settokendecimals(decimals);
            settokensymbol(symbol);
            settokenname(name);
            setAssetType(assettype);
            setLastPrice(lastprice);
            setLastTime(lastpricetime);
            setlastetherprice(ethprice)

            console.log(totalsupply)
            console.log(decimals)
            console.log(symbol)
            console.log(name)
            console.log(assettype)
            console.log(lastprice)
            console.log(lastpricetime)
            console.log(oraclenumber)
            console.log(ora_array)
            console.log(ethprice)

            const balance = await library.getBalance(collateral);
            setcontractbalance(balance);

            // get collateral contract infos
            const collateral_contract = isAddress(collateral) && !!COLLATERAL_ABI && !!library ? new Contract(collateral, COLLATERAL_ABI, library) : undefined;
            console.log(collateral_contract);

            const info = await collateral_contract.getContractInfo();
            console.log(info._collateralizationRatio)
            console.log(info._ethBalance)
            console.log(info._issuanceRatio)
            console.log(info._issueFeeRate)
            console.log(info._minLoanCollateralSize)
            console.log(info._totalIssuedSynths)
            console.log(info._totalLoansCreated)
            console.log(info._totalOpenLoanCount)

            setcollratio(info._collateralizationRatio);
            setethbalance(info._ethBalance);
            setissueratio(info._issuanceRatio)
            setissuefee(info._issueFeeRate)
            setmincoll(info._minLoanCollateralSize)
            settotalissue(info._totalIssuedSynths)
            settotalloans(info._totalLoansCreated)
            setopenloans(info._totalOpenLoanCount)


            const userb = await library.getBalance(account);
            setuserbalance(userb);

            setischecked(true);


        } catch (e) {
            console.log(e)
            setischecked(false);
            addToast({body:"The address provided does not resolve to a valid Conjure Address", type: "error"});
        }
    }

    async function updatePrice()
    {
        const conjure_contract = isAddress(conjureAddress) && !!ABI && !!library ? new Contract(conjureAddress, ABI, library.getSigner(account)) : undefined;

        try {
            const {hash} = await conjure_contract.getPrice();
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }

        checkConjureDetails();
    }

    // get the timestamp
    function fetchTimeStamp()
    {
        let enddate = DateTime.fromSeconds(lastTime.toNumber());
        return enddate.toLocaleString(DateTime.DATETIME_FULL);
    }

    function getUserDetails()
    {
        if (account)
        {
            return (
                <div className="py-4 w-full md:w-6/12 md:flex justify-center text-center">
                    <div className="py-4 rounded-2xl w-full bg-purple-500">
                        <p className="text-center text-lg font-bold text-white">
                            Your Asset Balance
                        </p>
                        <p className="text-center text-lg font-bold text-white">
                            {formatEther(userbalance)} {tokensymbol}
                        </p>
                        <br/>
                        <p className="text-center text-lg font-bold text-white">
                            Latest Price
                        </p>
                        <p className="text-center text-lg font-bold text-white">
                            {formatEther(lastPrice)}
                        </p>
                        <br/>
                        <p className="text-center text-lg font-bold text-white">
                            recorded on
                        </p>
                        <p className="text-center text-lg font-bold text-white">
                            {fetchTimeStamp()}
                        </p>
                        <br/>
                        <p className="text-center text-lg font-bold text-white">
                            Assets in Circulation:
                        </p>
                        <p className="text-center text-lg font-bold text-white">
                            {formatEther(tokentotalsupply)}
                        </p>

                    </div>
                </div>

            )
        }
        else
        {
            return "";
        }
    }

    function divideDecimalRound(
        x,
        y)
    {
        let precisionUnit = BigNumber.from("1000000000000000000");
        let resultTimesTen = x.mul(precisionUnit.mul(10)).div(y);


        return resultTimesTen.div(10);
    }

    function multiplyDecimal(x, y)
    {
        let precisionUnit = BigNumber.from("1000000000000000000");
        /* Divide by UNIT to remove the extra factor introduced by the product. */
        return x.mul(y).div(precisionUnit);
    }

    function divideDecimal(x, y){
        /* Reintroduce the UNIT factor that will be divided out by y. */
        let precisionUnit = BigNumber.from("1000000000000000000");
        return x.mul(precisionUnit).div(y);
    }

    function handleChangeConjureAddress(event) {
        const values = event.target.value;
        setConjureAddress(values);
    }

    function handleChangeCollAmount(event) {
        const values = event.target.value;
        setcollamount(values);

        if (isNaN(values) || values === "")
        {
            setcollamount("0")
        }
        else
        {
            if (values > 0 && loanamount >0)
            {
                let loaninput = parseEther(loanamount);
                let collinput = parseEther(values);

                console.log(loaninput)
                console.log(collinput)
                console.log(lastetherprice)
                console.log(lastPrice)

                let mul1 = multiplyDecimal(loaninput, lastPrice)
                let mul2 = multiplyDecimal(collinput, lastetherprice)
                let div1 = divideDecimal(mul2,mul1)


                console.log(mul1)
                console.log(mul2)
                console.log(div1)

                setcratio(div1)
            }

        }
    }

    function handleChangeLoanAmount(event) {
        const values = event.target.value;
        setloanamount(values);

        if (isNaN(values) || values === "")
        {
            setloanamount("0")
        }
        else
        {
            if (values > 0 && collamount >0) {
                let loaninput = parseEther(values);
                let collinput = parseEther(collamount);

                console.log(loaninput)
                console.log(collinput)
                console.log(lastetherprice)
                console.log(lastPrice)

                let mul1 = multiplyDecimal(loaninput, lastPrice)
                let mul2 = multiplyDecimal(collinput, lastetherprice)
                let div1 = divideDecimal(mul2,mul1)


                console.log(mul1)
                console.log(mul2)
                console.log(div1)

                setcratio(div1)
            }

        }
    }

    function handleChangeWithdraw(event) {
        const values = event.target.value;
        setwithdrawamount(values);
    }

    function handleChangeDeposit(event) {
        const values = event.target.value;
        setdepositamount(values);
    }

    async function openloan()
    {

        if (loanamount <= 0)
        {
            addToast({body:"Please enter a loan amount greater than 0", type: "error"});
            return;
        }

        const collateral_contract = isAddress(collateralAddress) && !!COLLATERAL_ABI && !!library ? new Contract(collateralAddress, COLLATERAL_ABI, library.getSigner(account)) : undefined;

        console.log('here')
        const loan_eth = parseEther(loanamount);

        const ethcoll = parseEther(collamount);
        const mintingfee = ethcoll.div(10000).mul(issuefee);

        console.log(ethcoll)
        console.log(mintingfee)
        console.log(ethcoll.add(mintingfee) )

        console.log('here2')
        const trans_obj = {
            value: ethcoll.add(mintingfee)         // the amount (in wei) this transaction is sending
        }

        try {
            const {hash} = await collateral_contract.openLoan(loan_eth, trans_obj);
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }

        checkConjureDetails();
        getUserLoans();
        setloanamount("0")
        setcollamount("0")
        setcratio(BigNumber.from(0))

    }

    async function closeloan(loanid, contractaddress)
    {

        if (loanid < 1)
        {
            addToast({body:"Please enter a valid loan id to close", type: "error"});
            return;
        }

        const collateral_contract = isAddress(contractaddress) && !!COLLATERAL_ABI && !!library ? new Contract(contractaddress, COLLATERAL_ABI, library.getSigner(account)) : undefined;

        try {
            const {hash} = await collateral_contract.closeLoan(loanid);
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }

        checkConjureDetails();
        getUserLoans();
    }

    async function withdraw(loanid, contractaddress)
    {

        if (withdrawamount <= 0)
        {
            addToast({body:"Please enter a valid amount to withdraw (greater 0)", type: "error"});
            return;
        }

        const collateral_contract = isAddress(contractaddress) && !!COLLATERAL_ABI && !!library ? new Contract(contractaddress, COLLATERAL_ABI, library.getSigner(account)) : undefined;
        const withdraw_eth = parseEther(withdrawamount);

        try {
            const {hash} = await collateral_contract.withdrawCollateral(loanid, withdraw_eth);
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }

        checkConjureDetails();
        getUserLoans();
        setwithdrawamount(0);
    }

    async function deposit(loanid, contractaddress)
    {

        if (depositamount <= 0)
        {
            addToast({body:"Please enter a valid amount to deposit (greater 0)", type: "error"});
            return;
        }

        const collateral_contract = isAddress(contractaddress) && !!COLLATERAL_ABI && !!library ? new Contract(contractaddress, COLLATERAL_ABI, library.getSigner(account)) : undefined;
        const depositeth = parseEther(depositamount);

        const trans_obj = {
            // Required unless deploying a contract (in which case omit)
            //gasLimit: 300000,        // the maximum gas this transaction may spend
            value: depositeth           // the amount (in wei) this transaction is sending
        }

        try {
            const {hash} = await collateral_contract.depositCollateral(account, loanid, trans_obj);
            await getReceipt(hash, library);
        } catch (e) {
            addToast({body: e.message, type: "error"});
        }

        checkConjureDetails();
        getUserLoans();
        setdepositamount(0);
    }

    // get the timestamp
    function fetchTimeStamp(timeinput)
    {
        let enddate = DateTime.fromSeconds(timeinput.toNumber());
        return enddate.toLocaleString(DateTime.DATETIME_FULL);
    }

    return (

        <div className="container">
            <div className="py-16 min-w-full flex flex-col justify-start items-center">

                <div className="py-4 w-full flex justify-center">
                    <div className="py-4  rounded-2xl  w-full bg-purple-500">
                        <p className="text-center text-lg font-bold text-white">
                            Manage your Conjure Loans

                        </p>
                    </div>
                </div>

                {(account && loanarray && loanarray.length > 0 ?

                        <div className="py-1 w-full">
                            <div className="py-4 w-full flex justify-center">
                                <div className="py-4  rounded-2xl  w-full bg-purple-500">
                                    <p className="text-center text-lg font-bold text-white">
                                        Your Open Loans
                                    </p>
                                </div>
                            </div>

                            {loanarray.map((field, idx) => {
                                return (
                                    <div className="py-4 w-full" key={`${field}-${idx}`}>
                                        <div className="md:flex flex-row w-full justify-center rounded-2xl w-full min-w-0 bg-indigo-400">
                                            <div
                                                className="py-4 pr-2 sm:pr-10 sm:pl-8 pl-2 sm:mr-2 ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Asset
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {conjurearray[idx]}
                                                </p>
                                            </div>
                                            <div
                                                className="py-4 pr-2 sm:pr-10 sm:pl-8 pl-2 sm:mr-2 ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Unique ID
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {field.loanID.toNumber()}
                                                </p>
                                            </div>
                                            <div
                                                className="py-4 pl-2 sm:pr-10 pr-2  ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Loan Amount
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {formatEther(field.loanAmount)}
                                                </p>
                                            </div>
                                            <div
                                                className="py-4 pl-2 sm:pr-10 pr-2  ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Collateral
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {formatEther(field.collateralAmount)} BNB
                                                </p>
                                            </div>
                                            <div
                                                className="py-4 pl-2 sm:pr-10 pr-2  ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    C-Ratio
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {loanratios[idx] && format_friendly(loanratios[idx].mul(100),4)} %
                                                </p>
                                            </div>
                                            <div
                                                className="py-4 pl-2 pr-2 sm:pr-10  ">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Opened
                                                </p>
                                                <p className="text-center text-lg font-bold text-white">
                                                    {fetchTimeStamp(field.timeCreated)}
                                                </p>
                                            </div>
                                            <div className="py-4 pl-2 pr-2 sm:pr-10 text-center">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Deposit BNB
                                                </p>
                                                <input className="text-center w-full justify-center" type="number" value={depositamount} onChange={e => handleChangeDeposit(e)}
                                                />
                                                <button className="py-3 pr-2 pl-2 rounded-3xl bg-indigo-500 hover:bg-purple-300 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
                                                        type="button" onClick={() => deposit(field.loanID, collarray[idx])}>
                                                    <p className="capitalize text-center text-sm  font-bold text-white">Deposit</p>
                                                </button>
                                            </div>
                                            <div className="py-4 pl-2 pr-2 sm:pr-10 text-center">
                                                <p className="text-center text-lg font-bold text-white">
                                                    Withdraw BNB
                                                </p>
                                                <input className="text-center w-full justify-center" type="number" value={withdrawamount} onChange={e => handleChangeWithdraw(e)}
                                                />
                                                <button className="py-3 pr-2 pl-2 rounded-3xl bg-indigo-500 hover:bg-purple-300 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
                                                        type="button" onClick={() => withdraw(field.loanID, collarray[idx])}>
                                                    <p className="capitalize text-center text-sm  font-bold text-white">Withdraw</p>
                                                </button>
                                            </div>
                                            <div className="py-4 pl-2 pr-2 sm:pr-10 text-center">
                                                <button className="py-3 pr-2 pl-2 rounded-3xl bg-indigo-500 hover:bg-purple-300 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
                                                        type="button" onClick={() => closeloan(field.loanID, collarray[idx])}>
                                                    <p className="capitalize text-center text-sm  font-bold text-white">Close Loan</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}


                        </div>

                        :
                        ""
                )}

                <div className="py-4 w-full flex justify-center">
                    <div className="py-4  rounded-2xl  w-full bg-purple-500">
                        <p className="text-center text-lg font-bold text-white">
                            Open A New Loan
                        </p>
                    </div>
                </div>


                <div className="py-4 w-full">

                    <div className="md:flex flex-row w-full justify-center">
                        <div className="py-4 pr-2 pl-2  rounded-2xl w-full md:w-6/12 bg-purple-500">
                            <p className="text-center text-lg font-bold text-white">
                                Enter Conjure Address or ENS Name
                            </p>
                            <input required className="text-center w-full justify-center" type="text"
                                   onChange={e => handleChangeConjureAddress( e)} value={conjureAddress}/>
                        </div>

                    </div>
                </div>
                <div className="py-1 w-full">

                    <div className="py-1 w-full flex justify-center text-center">
                        <div className="py-1 w-full">
                            <button className="py-3 pr-2 pl-2 rounded-3xl md:w-3/12 w-6/12 hover:bg-purple-300 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
                                    type="button" onClick={() => checkConjureDetails() }>
                                <p className="capitalize text-center text-sm font-bold text-white">Submit Address</p>
                            </button>
                        </div>
                    </div>
                </div>

                {(ischecked ?

                        <div className="py-1 w-full">
                            <div className="py-4 w-full flex justify-center">
                                <div className="py-4  rounded-2xl  w-full bg-purple-500">
                                    <p className="text-center text-lg font-bold text-white">
                                        Loan Overview for {tokenname} ({tokensymbol})
                                    </p>
                                </div>
                            </div>
                            <div className="py-4 w-full">
                                <div className="md:flex flex-row w-full justify-center rounded-2xl w-full min-w-0 bg-purple-500">
                                    <div
                                        className="py-4 pr-2 sm:pr-10 pl-2 sm:mr-2 ">
                                        <p className="text-center text-lg font-bold text-white">
                                            Minting Fee
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {issuefee.toNumber() / 100}%
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 sm:pr-10 pr-2  ">
                                        <p className="text-center text-lg font-bold text-white">
                                            # Open Loans
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {openloans.toNumber()}
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 sm:pr-10 pr-2  ">
                                        <p className="text-center text-lg font-bold text-white">
                                            {tokensymbol} Supply
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(totalissue)}
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 pr-2 sm:pr-10  ">
                                        <p className="text-center text-lg font-bold text-white">
                                            Min Collateral Size
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(mincoll)} BNB
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 pr-2 sm:pr-10 ">
                                        <p className="text-center text-lg font-bold text-white">
                                            C Ratio
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(collratio)}%
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 pr-2 sm:pr-10  ">
                                        <p className="text-center text-lg font-bold text-white">
                                            Locked BNB
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(ethbalance)}
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 pr-2 sm:pr-10 ">
                                        <p className="text-center text-lg font-bold text-white">
                                            Asset Price
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(lastPrice)}$
                                        </p>
                                    </div>
                                    <div
                                        className="py-4 pl-2 pr-2 sm:pr-10 ">
                                        <p className="text-center text-lg font-bold text-white">
                                            BNB Price
                                        </p>
                                        <p className="text-center text-lg font-bold text-white">
                                            {formatEther(lastetherprice)}$
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        ""
                )}

                {(ischecked ?

                        <div className="py-1 w-full">
                            <div className="py-4 w-full flex justify-center">
                                <div className="py-4  rounded-2xl  w-full bg-purple-500">
                                    <p className="text-center text-lg font-bold text-white">
                                        Open New Loan
                                    </p>
                                </div>
                            </div>
                            <div className="py-4 w-full">
                                <div className="md:flex flex-row w-full justify-center">
                                    <div
                                        className="py-4 pr-2 pl-2 sm:mr-2 mt-2 rounded-2xl w-full md:w-6/12 min-w-0 bg-purple-500">
                                        <p className="text-center text-lg font-bold text-white">
                                            Amount to Mint:
                                        </p>
                                        <input className="text-center w-full justify-center" type="number"
                                               onChange={e => handleChangeLoanAmount(e)} />
                                        <p className="text-center text-lg font-bold text-white">
                                            Collateral Amount (in BNB):
                                        </p>
                                        <input className="text-center w-full justify-center" type="number"
                                               onChange={e => handleChangeCollAmount(e)} />
                                        <p className="text-center text-lg font-bold text-white">
                                            C Ratio:<br/>
                                            {format_friendly(cratio.mul(100),4)}%
                                        </p>
                                        <div className="py-1 w-full text-center">
                                            <button className="py-3 pr-2 pl-2 rounded-3xl md:w-3/12 w-6/12 bg-indigo-500 hover:bg-purple-300 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
                                                    type="button" onClick={() => openloan()}>
                                                <p className="capitalize text-center text-sm  font-bold text-white">Open Loan</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        :
                        ""
                )}


            </div>
        </div>
    );
}

export default Loan
